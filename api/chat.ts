import { z } from 'zod'
import type { ChatStreamEvent } from '../shared/types.js'
import { getTrip } from '../server/tripRepository.js'
import { currentProvider, friendlyError, runChat } from '../server/ai/index.js'

// 公開端點會花 API 費用，限制輸入大小
const MAX_HISTORY = 20
const ChatBody = z.object({
  tripId: z.string().max(100),
  messages: z
    .array(z.object({ role: z.enum(['user', 'assistant']), content: z.string().trim().min(1).max(2000) }))
    .min(1)
    .max(100),
  focusStopId: z.number().int().optional(),
})

// POST /api/chat — 回傳 NDJSON 串流（事件格式見 shared/types.ts 的 ChatStreamEvent）
export async function POST(request: Request): Promise<Response> {
  let raw: unknown
  try {
    raw = await request.json()
  } catch {
    return Response.json({ error: 'Invalid JSON' }, { status: 400 })
  }
  const parsed = ChatBody.safeParse(raw)
  if (!parsed.success) return Response.json({ error: 'Invalid request' }, { status: 400 })
  const body = parsed.data

  const trip = await getTrip(body.tripId)
  if (!trip) return Response.json({ error: 'Trip not found' }, { status: 404 })

  // 只保留最近幾則；對話必須以使用者開頭、以使用者的問題結尾
  const history = body.messages.slice(-MAX_HISTORY)
  while (history.length && history[0].role !== 'user') history.shift()
  if (!history.length || history.at(-1)!.role !== 'user') {
    return Response.json({ error: 'Last message must be from user' }, { status: 400 })
  }

  const encoder = new TextEncoder()
  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const emit = (event: ChatStreamEvent) => {
        try {
          controller.enqueue(encoder.encode(`${JSON.stringify(event)}\n`))
        } catch {
          // 使用者已離開，忽略
        }
      }
      const provider = currentProvider()
      try {
        await runChat({ provider, trip, history, focusStopId: body.focusStopId, signal: request.signal, emit })
        emit({ type: 'done', mock: provider === 'mock' })
      } catch (err) {
        if (!request.signal.aborted) emit({ type: 'error', message: await friendlyError(provider, err) })
      } finally {
        try {
          controller.close()
        } catch {
          // 已關閉
        }
      }
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'application/x-ndjson; charset=utf-8',
      'Cache-Control': 'no-cache, no-transform',
    },
  })
}

import type { ChatRequest, ChatResponse, Trip } from '../shared/types.js'
import { getTrip } from '../server/tripRepository.js'

// POST /api/chat — AI 助理入口（目前為示範回覆）
// API Key 只存在伺服器端環境變數，前端永遠拿不到。
export async function POST(request: Request): Promise<Response> {
  let body: ChatRequest
  try {
    body = (await request.json()) as ChatRequest
  } catch {
    return Response.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const trip = await getTrip(body.tripId)
  if (!trip) return Response.json({ error: 'Trip not found' }, { status: 404 })
  const last = body.messages.at(-1)
  if (!last || last.role !== 'user') {
    return Response.json({ error: 'Last message must be from user' }, { status: 400 })
  }

  // TODO: 有 ANTHROPIC_API_KEY 時改為呼叫 LLM：
  //   system = buildSystemPrompt(trip, body.focusStopId)
  //   messages = body.messages
  //   之後可再加 tool use（查站點、調整行程、標示地圖）
  const res: ChatResponse = {
    reply: mockReply(trip, last.content, body.focusStopId),
    mock: true,
  }
  return Response.json(res)
}

/** 把行程資料整理成 AI 的背景知識 */
export function buildSystemPrompt(trip: Trip, focusStopId?: number): string {
  const stops = trip.stops
    .map(s => `- [${s.id}] Day${s.day} ${s.name}（${s.type === 'food' ? '餐廳' : '景點'}，${s.area}${s.price ? `，NT$${s.price}` : ''}）${s.desc}`)
    .join('\n')
  const focus = trip.stops.find(s => s.id === focusStopId)
  return [
    `你是「${trip.title}」的旅遊助理，用繁體中文回答，根據下列行程資料回覆。`,
    `住宿：${trip.hotel.name}（${trip.hotel.nights} 晚）`,
    `固定地點：\n${trip.places.map(p => `- ${p.name}（${p.area}）${p.desc}`).join('\n')}`,
    `站點：\n${stops}`,
    focus ? `使用者目前正在看：${focus.name}` : '',
  ].filter(Boolean).join('\n\n')
}

function mockReply(trip: Trip, question: string, focusStopId?: number): string {
  const focus = trip.stops.find(s => s.id === focusStopId)
  const hit = trip.stops.find(s => question.includes(s.name)) ?? focus
  if (hit) return `（示範回覆）${hit.name}：${hit.desc} 位於 ${hit.area}，安排在 Day ${hit.day}。`
  return `（示範回覆）AI 助理尚未串接。這趟「${trip.title}」共 ${trip.stops.length} 站，你可以問我某個站點的資訊。`
}

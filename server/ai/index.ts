import type { ChatRunOptions } from './types.js'
import { runAnthropicChat, anthropicErrorMessage } from './anthropic.js'

// AI 助理入口：依 AGENT_PROVIDER 選擇供應商，沒有金鑰時改用示範回覆
export type Provider = 'cursor' | 'anthropic' | 'mock'

/** cursor（預設，用量算在 Cursor 方案）或 anthropic（Claude API，需另外儲值） */
export function currentProvider(): Provider {
  const selected = process.env.AGENT_PROVIDER === 'anthropic' ? 'anthropic' : 'cursor'
  const hasKey = selected === 'cursor'
    ? Boolean(process.env.CURSOR_API_KEY)
    : Boolean(process.env.ANTHROPIC_API_KEY || process.env.ANTHROPIC_AUTH_TOKEN)
  return hasKey ? selected : 'mock'
}

export async function runChat(opts: ChatRunOptions & { provider: Provider }): Promise<void> {
  if (opts.provider === 'anthropic') return runAnthropicChat(opts)
  if (opts.provider === 'cursor') {
    const { runCursorChat } = await import('./cursor.js')
    return runCursorChat(opts)
  }
  return runMockChat(opts)
}

/** 示範回覆：一樣用串流與地圖標示，方便前端開發 */
async function runMockChat({ trip, history, focusStopId, emit }: ChatRunOptions): Promise<void> {
  const question = history.at(-1)?.content ?? ''
  const mentioned = trip.stops.filter(s => question.includes(s.name))
  const focus = trip.stops.find(s => s.id === focusStopId)
  const hits = mentioned.length ? mentioned : focus ? [focus] : []

  const reply = hits.length
    ? `（示範回覆）${hits.map(s => `${s.name}：${s.desc} 位於 ${s.area}，安排在 Day ${s.day}。`).join('\n')}`
    : `（示範回覆）AI 助理尚未設定金鑰。這趟「${trip.title}」共 ${trip.stops.length} 站，你可以問我某個站點的資訊。`

  if (hits.length) emit({ type: 'highlight', stopIds: hits.map(s => s.id) })
  for (const chunk of reply.match(/.{1,6}/gsu) ?? []) {
    emit({ type: 'text', delta: chunk })
    await new Promise(r => setTimeout(r, 30))
  }
}

/** 轉成可以直接顯示給使用者的錯誤訊息（細節只記在伺服器 log） */
export async function friendlyError(provider: Provider, err: unknown): Promise<string> {
  console.error(`[chat:${provider}] error`, err)
  const message = provider === 'cursor'
    ? await (await import('./cursor.js')).cursorErrorMessage(err)
    : anthropicErrorMessage(err)
  return message ?? '發生錯誤，請稍後再試。'
}

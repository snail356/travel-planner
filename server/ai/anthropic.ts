import Anthropic from '@anthropic-ai/sdk'
import type { ChatRunOptions } from './types.js'
import { HIGHLIGHT_TOOL, buildRules, buildTripContext, focusNote, resolveHighlight, webSearchEnabled } from './prompt.js'

// Claude API 版：自己控制工具迴圈，回覆逐字串流
const MODEL = process.env.ANTHROPIC_MODEL || 'claude-opus-5-5'
// 一般問答用 low effort：回覆快、成本低
const EFFORT = 'low'
const MAX_TOKENS = 8192
// 防止工具迴圈失控
const MAX_ROUNDS = 4

let client: Anthropic | undefined
const getClient = () => (client ??= new Anthropic())

const HIGHLIGHT: Anthropic.Beta.BetaTool = {
  name: HIGHLIGHT_TOOL.name,
  description: HIGHLIGHT_TOOL.description,
  eager_input_streaming: true,
  input_schema: {
    type: 'object',
    properties: {
      stop_ids: { type: 'array', items: { type: 'integer' }, description: '站點編號，例如 [1, 6]' },
    },
    required: ['stop_ids'],
  },
}
// 伺服器端網路搜尋（由 Anthropic 執行），每個問題最多搜尋 3 次控制費用
const WEB_SEARCH: Anthropic.Beta.BetaWebSearchTool20260209 = { type: 'web_search_20260209', name: 'web_search', max_uses: 3 }
const tools = (): Anthropic.Beta.BetaToolUnion[] => (webSearchEnabled() ? [HIGHLIGHT, WEB_SEARCH] : [HIGHLIGHT])

export async function runAnthropicChat({ trip, history, focusStopId, signal, emit }: ChatRunOptions): Promise<void> {
  const messages: Anthropic.Beta.BetaMessageParam[] = history.map(m => ({ role: m.role, content: m.content }))
  // 會變動的「正在看的站點」用對話中的 system 訊息帶入，不動到已快取的 system prompt
  const focus = focusNote(trip, focusStopId)
  if (focus) messages.push({ role: 'system', content: focus })

  const system: Anthropic.Beta.BetaTextBlockParam[] = [
    { type: 'text', text: buildRules() },
    { type: 'text', text: buildTripContext(trip), cache_control: { type: 'ephemeral' } },
  ]

  let jsonRetries = 0
  for (let round = 0; round < MAX_ROUNDS; round++) {
    const stream = getClient().beta.messages.stream(
      {
        model: MODEL,
        max_tokens: MAX_TOKENS,
        output_config: { effort: EFFORT },
        // 若安全分類器拒答，由 API 自動改用建議的備援模型重跑
        betas: ['server-side-fallback-2026-07-01'],
        fallbacks: 'default',
        system,
        tools: tools(),
        messages,
      },
      { signal },
    )
    stream.on('text', delta => emit({ type: 'text', delta }))

    let message: Anthropic.Beta.BetaMessage
    try {
      message = await stream.finalMessage()
      jsonRetries = 0
    } catch (err) {
      // 只重試工具參數無法解析的情況；API 錯誤交給上層處理
      if (err instanceof Anthropic.APIError || signal.aborted || jsonRetries++ >= 1) throw err
      continue
    }

    const u = message.usage
    console.log(
      `[chat:anthropic] round=${round} stop=${message.stop_reason} in=${u.input_tokens} cache_read=${u.cache_read_input_tokens ?? 0} out=${u.output_tokens}`,
    )

    if (message.stop_reason === 'refusal') {
      emit({ type: 'text', delta: '\n抱歉，這個問題我沒辦法回答，可以換個方式問問看。' })
      return
    }

    const toolUses = message.content.filter(
      (b): b is Anthropic.Beta.BetaToolUseBlock => b.type === 'tool_use',
    )
    // 伺服器端工具（網路搜尋）跑到一半暫停：原樣接上回覆再送出，讓它繼續
    if (message.stop_reason === 'pause_turn') {
      messages.push({ role: 'assistant', content: message.content })
      continue
    }
    // 沒有要呼叫工具（或輸出被截斷）就結束
    if (message.stop_reason !== 'tool_use' || toolUses.length === 0) return

    messages.push({ role: 'assistant', content: message.content })
    const results: Anthropic.Beta.BetaToolResultBlockParam[] = toolUses.map(tool => {
      const { ids, result } = tool.name === HIGHLIGHT_TOOL.name
        ? resolveHighlight(trip, tool.input)
        : { ids: null, result: `未知的工具：${tool.name}` }
      if (ids?.length) emit({ type: 'highlight', stopIds: ids })
      return { type: 'tool_result', tool_use_id: tool.id, content: result, ...(ids === null && { is_error: true }) }
    })
    messages.push({ role: 'user', content: results })
  }
}

export function anthropicErrorMessage(err: unknown): string | null {
  if (err instanceof Anthropic.AuthenticationError) return 'AI 服務的金鑰設定有誤，請聯絡網站管理者。'
  if (err instanceof Anthropic.RateLimitError) return '目前使用的人比較多，請稍後再試。'
  if (err instanceof Anthropic.APIError) return 'AI 服務暫時無法回應，請稍後再試。'
  return null
}

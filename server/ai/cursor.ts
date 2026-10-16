import { mkdirSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import type { SDKCustomTool } from '@cursor/sdk'
import type { ChatRunOptions } from './types.js'
import { HIGHLIGHT_TOOL, RULES, buildTripContext, focusNote, resolveHighlight, transcript } from './prompt.js'

// Cursor SDK 版：agent 迴圈由 Cursor 執行，用量算在 Cursor 方案
// 參考 demo 專案的 ai-service/agent/cursor-agent.ts
const MODEL = process.env.CURSOR_MODEL || 'composer-2.5'
// 一個問題最多等這麼久，避免請求永遠不結束
const TIMEOUT_MS = 90_000

/**
 * Cursor SDK 會在家目錄（~/.cursor）寫入 agent 紀錄，並需要一個工作目錄。
 * 全部改放暫存資料夾：不弄亂本機設定，也符合 Vercel 只能寫入 /tmp 的限制。
 */
function prepareRuntime(): string {
  const root = join(tmpdir(), 'travel-planner-cursor')
  process.env.CURSOR_DATA_DIR ||= join(root, 'data')
  if (process.env.VERCEL) process.env.HOME = root
  // 空的工作目錄：agent 讀不到也改不到任何專案檔案
  const workspace = join(root, 'workspace')
  mkdirSync(workspace, { recursive: true })
  return workspace
}

/** 這次請求要送出的完整內容：規則、行程資料、先前對話與新問題 */
function composePrompt({ trip, history, focusStopId }: ChatRunOptions): string {
  const earlier = history.slice(0, -1)
  const question = history.at(-1)!.content
  const focus = focusNote(trip, focusStopId)
  return [
    `<instructions>
${RULES}
- 你在網站後端回答訪客問題：不要讀寫檔案、不要執行指令，也不要提到程式或工具本身，直接回答。
- 需要標示站點時，先呼叫 highlight_stops，再開始寫回答；呼叫工具前不要輸出任何文字。
</instructions>`,
    buildTripContext(trip),
    earlier.length ? `<conversation>\n${transcript(earlier)}\n</conversation>` : '',
    focus ?? '',
    `使用者的問題：${question}`,
  ]
    .filter(Boolean)
    .join('\n\n')
}

export async function runCursorChat(opts: ChatRunOptions): Promise<void> {
  const { trip, signal, emit } = opts
  const workspace = prepareRuntime()
  // 套件很大，只在實際使用時才載入
  const { Agent } = await import('@cursor/sdk')

  const customTools: Record<string, SDKCustomTool> = {
    [HIGHLIGHT_TOOL.name]: {
      description: HIGHLIGHT_TOOL.description,
      inputSchema: HIGHLIGHT_TOOL.inputSchema as unknown as SDKCustomTool['inputSchema'],
      annotations: { readOnlyHint: true },
      execute: async args => {
        const { ids, result } = resolveHighlight(trip, args)
        if (ids?.length) emit({ type: 'highlight', stopIds: ids })
        return { content: [{ type: 'text', text: result }], isError: ids === null }
      },
    },
  }

  const startedAt = Date.now()
  const agent = await Agent.create({
    apiKey: process.env.CURSOR_API_KEY,
    model: { id: MODEL },
    name: 'travel-planner chat',
    // 只開放自訂工具（屬於 mcp 家族）；改檔、shell、讀檔等內建工具一律關閉
    tools: ['mcp'],
    local: {
      cwd: workspace,
      // 不載入本機的 Cursor 規則、設定與 MCP 伺服器
      settingSources: [],
      customTools,
    },
  })

  // 實測（@cursor/sdk 1.0.35）：回答完會送出 turn-ended，但 run 不會結束，
  // 約 35～60 秒後 agent 又自行重答一次（地圖也再標示一次），run.wait() 永遠不回來。
  // 所以收到第一個 turn-ended 就視為答完，立刻取消 run，並忽略之後的事件。
  let turnEnded = false
  let markTurnEnded!: () => void
  const firstTurnEnded = new Promise<void>(resolve => (markTurnEnded = resolve))

  let run: Awaited<ReturnType<typeof agent.send>> | undefined
  const cancelRun = () => void run?.cancel().catch(() => {})
  signal.addEventListener('abort', cancelRun, { once: true })
  let timer: ReturnType<typeof setTimeout> | undefined

  try {
    // 呼叫工具前的短句多半是「查詢工具用法…」這類過場說明，呼叫工具時清掉；
    // 已經寫出完整回答（超過這個長度）才呼叫工具時則保留
    const PREAMBLE_MAX = 100
    let shownText = ''
    run = await agent.send(composePrompt(opts), {
      onDelta: ({ update }) => {
        if (turnEnded) return
        if (update.type === 'text-delta') {
          shownText += update.text
          emit({ type: 'text', delta: update.text })
        } else if (update.type === 'tool-call-started') {
          if (shownText && shownText.length <= PREAMBLE_MAX) emit({ type: 'reset' })
          if (shownText.length <= PREAMBLE_MAX) shownText = ''
        } else if (update.type === 'turn-ended') {
          turnEnded = true
          const u = update.usage
          console.log(
            `[chat:cursor] turn-ended ms=${Date.now() - startedAt} in=${u?.inputTokens ?? 0} cache_read=${u?.cacheReadTokens ?? 0} out=${u?.outputTokens ?? 0}`,
          )
          markTurnEnded()
        }
      },
    })

    const finishedEarly = run.wait().then(result => {
      if (result.status === 'error') throw new Error(`Cursor agent 執行失敗：${result.error?.message ?? '未知錯誤'}`)
    })
    const timeout = new Promise<never>((_, reject) => {
      timer = setTimeout(() => reject(new Error(`Cursor agent 超過 ${TIMEOUT_MS / 1000} 秒未完成`)), TIMEOUT_MS)
    })
    await Promise.race([firstTurnEnded, finishedEarly, timeout])
  } finally {
    clearTimeout(timer)
    signal.removeEventListener('abort', cancelRun)
    if (run?.status === 'running') await run.cancel().catch(() => {})
    await agent[Symbol.asyncDispose]()
  }
}

export async function cursorErrorMessage(err: unknown): Promise<string | null> {
  const sdk = await import('@cursor/sdk')
  if (err instanceof sdk.AuthenticationError) return 'AI 服務的金鑰設定有誤，請聯絡網站管理者。'
  if (err instanceof sdk.RateLimitError) return '目前使用的人比較多，請稍後再試。'
  if (err instanceof sdk.NetworkError) return '暫時連不上 AI 服務，請稍後再試。'
  if (err instanceof Error && err.message.includes('秒未完成')) return 'AI 回覆逾時，請再問一次。'
  if (err instanceof sdk.CursorSdkError || err instanceof sdk.CursorAgentError) return 'AI 服務暫時無法回應，請稍後再試。'
  return null
}

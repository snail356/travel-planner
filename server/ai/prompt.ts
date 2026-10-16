import { z } from 'zod'
import type { ChatMessage, Trip } from '../../shared/types.js'

// 各供應商共用的規則、行程資料與地圖標示工具

/** 是否開放網路搜尋（AGENT_WEB_SEARCH=off 可關閉；預設開啟） */
export const webSearchEnabled = () => process.env.AGENT_WEB_SEARCH !== 'off'

const BASE_RULES = `你是「旅行規劃」網站的行程助理，協助使用者了解下方這份行程。

回答方式：
- 一律使用繁體中文，口吻親切、簡潔。一般問題 2～5 句即可，需要列點時用「・」開頭，不要用 Markdown 標題或粗體。
- 以行程資料為主回答。資料標示「待確認」「待補」或沒有提到的內容（例如營業時間、確切地址、排隊時間），不要自行編造。
- 一般旅遊常識（交通方式、點餐建議等）可以補充，但要和行程資料區分清楚。
- 回答中提到行程裡具體的景點或餐廳時，呼叫 highlight_stops 工具把它們標示在使用者的地圖上，一次傳入所有相關站點。
- 價格單位都是新台幣。`

const OFFLINE_RULES = `
- 行程資料沒有的內容，直接說目前資料沒有，建議出發前用 Google 地圖確認。`

const WEB_SEARCH_RULES = `

網路搜尋：
- 只有在使用者問到行程中店家或景點的推薦菜色、招牌、營業時間、最新消息等「行程資料沒有的公開資訊」時，才使用網路搜尋；其他問題只用行程資料回答，不要搜尋。
- 搜尋到的內容另起一段，開頭寫「外部資訊：」，句末用（來源：網站名稱）標明出處，和行程資料清楚分開。
- 行程中店家的地區若標示「待確認」，搜尋到多家同名分店時要說明，不要把不同分店的資訊混在一起。
- 網路資訊可能過時，提醒使用者出發前再確認。`

/** 回答規則；開放網路搜尋時加上搜尋的使用規則 */
export function buildRules(webSearch = webSearchEnabled()): string {
  return BASE_RULES + (webSearch ? WEB_SEARCH_RULES : OFFLINE_RULES)
}

/** 行程資料整理成文字（同一份行程內容固定，可快取） */
export function buildTripContext(trip: Trip): string {
  const stopLine = (id: number) => {
    const s = trip.stops.find(x => x.id === id)
    if (!s) return ''
    const kind = s.type === 'food' ? '餐廳' : '景點'
    const price = s.price ? `，花費 NT$${s.price}` : ''
    const pass = s.pass ? '，FunPASS 可用' : ''
    const note = s.note ? `（備註：${s.note}）` : ''
    return `    - [${s.id}] ${s.name}（${kind}，${s.area}${price}${pass}）${s.desc}${note}`
  }
  // 依動線列出：天 → 時段 → 依序造訪的站點
  const stops = trip.dayPlans
    .map(plan => [
      `Day ${plan.day}｜${plan.title}`,
      ...plan.slots.flatMap(slot => [`  ${slot.label}`, ...slot.stopIds.map(stopLine)]),
      ...(plan.endNote ? [`  ${plan.endNote}`] : []),
    ].join('\n'))
    .join('\n')
  const places = trip.places.map(p => `- ${p.name}（${p.area}）${p.desc}`).join('\n')
  const transports = trip.transports
    .map(t => `- ${t.title}：${t.summary}${t.items.length ? `；${t.items.join('；')}` : ''}`)
    .join('\n')
  const costs = trip.costs
    .map(c => `- ${c.label}：NT$${c.amount.toLocaleString()}${c.unit ? ` / ${c.unit}` : ''}`)
    .join('\n')

  const guides = trip.guides
    .map(g => [
      `【${g.title}】`,
      ...g.items.map(i => `- ${i.label}：${i.text}${i.points?.length ? ` ${i.points.join(' ')}` : ''}`),
    ].join('\n'))
    .join('\n')

  return `<trip>
行程：${trip.title}（${trip.days} 天 ${trip.nights} 夜）
說明：${trip.subtitle}
平均每人花費：NT$${trip.avgCostPerPerson.toLocaleString()}

行程動線（依天數與時段，[編號] 即造訪順序）：
${stops}

住宿與機場：
${places}

交通：
${transports}

主要花費：
${costs}

行前須知：
${guides}
</trip>`
}

/** 使用者正在看的站點，讓 AI 理解「這間」「這裡」 */
export function focusNote(trip: Trip, focusStopId?: number): string | null {
  const focus = trip.stops.find(s => s.id === focusStopId)
  return focus
    ? `使用者目前正在看第 ${focus.id} 站「${focus.name}」。問題中的「這間」「這裡」指的就是這一站。`
    : null
}

// ---- 地圖標示工具 ----

export const HIGHLIGHT_TOOL = {
  name: 'highlight_stops',
  description:
    '在使用者畫面上的行程地圖標示站點。回答提到行程中具體的景點或餐廳時呼叫，傳入相關站點編號（可以多個）。',
  inputSchema: {
    type: 'object',
    properties: {
      stop_ids: {
        type: 'array',
        items: { type: 'integer' },
        description: '站點編號，例如 [1, 6]',
      },
    },
    required: ['stop_ids'],
  },
} as const

const HighlightInput = z.object({ stop_ids: z.array(z.number().int()).min(1) })

/**
 * 驗證工具參數並過濾不存在的站點。
 * 回傳要標示的站點與要回給模型的結果；參數格式錯誤時 ids 為 null。
 */
export function resolveHighlight(trip: Trip, input: unknown): { ids: number[] | null; result: string } {
  const parsed = HighlightInput.safeParse(input)
  if (!parsed.success) return { ids: null, result: JSON.stringify({ INVALID_JSON: JSON.stringify(input) }) }
  const valid = new Set(trip.stops.map(s => s.id))
  const ids = [...new Set(parsed.data.stop_ids)].filter(id => valid.has(id))
  const names = ids.map(id => trip.stops.find(s => s.id === id)?.name).join('、')
  return { ids, result: ids.length ? `已在地圖上標示：${names}` : '沒有符合的站點編號' }
}

/** 把先前的對話整理成逐字稿（給沒有多輪對話狀態的供應商用） */
export function transcript(history: ChatMessage[]): string {
  return history.map(m => `${m.role === 'user' ? '使用者' : '助理'}：${m.content}`).join('\n\n')
}

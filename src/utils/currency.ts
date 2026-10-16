// 從聊天訊息辨識「港幣／台幣換算」，在前端直接計算，不必呼叫 AI

export type Currency = 'HKD' | 'TWD'

export interface ConversionRequest {
  amount: number
  from: Currency
}

const HKD_WORDS = 'HK\\$|HKD|港幣|港元|港紙|HK'
const TWD_WORDS = 'NT\\$|NTD|TWD|新台幣|新臺幣|台幣|臺幣|NT'
const NUM = '(\\d+(?:\\.\\d+)?)'

/** 全形數字、逗號、空白統一，方便比對 */
function normalize(text: string): string {
  return text
    .replace(/[０-９．]/g, c => String.fromCharCode(c.charCodeAt(0) - 0xfee0))
    .replace(/[,，\s]/g, '')
    .trim()
}

/**
 * 辨識換算請求，例如「100港幣」「HK$50」「500 台幣是多少港幣？」。
 * 只在訊息「主要就是換算」時成立，避免把「100 港幣以內的餐廳推薦」這類問題攔下來。
 * expectHkd：剛按過「匯率換算」時，純數字（例如「200」）視為港幣。
 */
export function parseConversion(text: string, expectHkd = false): ConversionRequest | null {
  const t = normalize(text)
  const patterns: [RegExp, Currency][] = [
    [new RegExp(`(?:${HKD_WORDS})${NUM}`, 'i'), 'HKD'],
    [new RegExp(`${NUM}(?:${HKD_WORDS}|蚊)`, 'i'), 'HKD'],
    [new RegExp(`(?:${TWD_WORDS})${NUM}`, 'i'), 'TWD'],
    [new RegExp(`${NUM}(?:${TWD_WORDS}|元)`, 'i'), 'TWD'],
  ]
  for (const [re, from] of patterns) {
    const m = t.match(re)
    if (!m) continue
    // 去掉金額與幣別、常見的換算用語後，剩下的字很少才算是單純的換算問題
    const rest = t
      .replace(m[0], '')
      .replace(new RegExp(`${HKD_WORDS}|${TWD_WORDS}|等於|大概|約|多少|是|換|換成|換算|可以|要|錢|呢|嗎|[?？!！。~～=]`, 'gi'), '')
    if (rest.length <= 2) return { amount: Number(m[1]), from }
  }
  if (expectHkd && /^\d+(?:\.\d+)?$/.test(t)) return { amount: Number(t), from: 'HKD' }
  return null
}

const money = (n: number, digits: number) =>
  n.toLocaleString('zh-TW', { minimumFractionDigits: 0, maximumFractionDigits: digits })

/** 換算結果，例如「HK$100 ≈ NT$413」 */
export function formatConversion(req: ConversionRequest, rate: number): string {
  return req.from === 'HKD'
    ? `HK$${money(req.amount, 2)} ≈ NT$${money(Math.round(req.amount * rate), 0)}`
    : `NT$${money(req.amount, 0)} ≈ HK$${money(Math.round((req.amount / rate) * 10) / 10, 1)}`
}

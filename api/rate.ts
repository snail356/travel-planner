import type { ExchangeRate } from '../shared/types.js'

// GET /api/rate — 港幣對新台幣參考匯率
// 資料來自 ExchangeRate-API 的免費公開端點（每日更新一次、免金鑰，使用時需標示來源）
const SOURCE_URL = 'https://open.er-api.com/v6/latest/HKD'
// 線上取得失敗時的備用值（2026-10 約 4.13）
const FALLBACK_RATE = 4.1
// 匯率每天才更新一次，伺服器端記一小時即可
const CACHE_MS = 60 * 60 * 1000

let cached: { value: ExchangeRate; at: number } | undefined

async function loadRate(): Promise<ExchangeRate> {
  if (cached && Date.now() - cached.at < CACHE_MS) return cached.value
  try {
    const res = await fetch(SOURCE_URL, { signal: AbortSignal.timeout(5000) })
    const data = (await res.json()) as { result?: string; rates?: Record<string, number>; time_last_update_utc?: string }
    const rate = data.rates?.TWD
    if (data.result !== 'success' || typeof rate !== 'number') throw new Error('unexpected response')
    const value: ExchangeRate = {
      rate,
      updatedAt: new Date(data.time_last_update_utc ?? Date.now()).toISOString(),
      fallback: false,
      source: 'ExchangeRate-API',
      sourceUrl: 'https://www.exchangerate-api.com',
    }
    cached = { value, at: Date.now() }
    return value
  } catch (err) {
    console.error('[rate] 取得匯率失敗，改用備用值', err)
    return {
      rate: FALLBACK_RATE,
      updatedAt: new Date().toISOString(),
      fallback: true,
      source: '內建參考值',
      sourceUrl: 'https://www.exchangerate-api.com',
    }
  }
}

export async function GET(): Promise<Response> {
  const value = await loadRate()
  return Response.json(value, {
    headers: {
      // 備用值不快取，下次再試線上匯率
      'Cache-Control': value.fallback ? 'no-cache' : 'public, max-age=3600',
      'Vercel-CDN-Cache-Control': value.fallback ? 'no-cache' : 'max-age=3600',
    },
  })
}

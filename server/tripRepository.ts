import type { Trip } from '../shared/types.js'
import { hongkongTrip } from './seed/hongkong.js'

// 資料存取層。目前讀種子資料；之後換成資料庫（例如 Neon Postgres / Supabase）
// 只需改這個檔案，api/ 與前端都不用動。
const trips: Record<string, Trip> = {
  [hongkongTrip.id]: hongkongTrip,
}

export const DEFAULT_TRIP_ID = hongkongTrip.id

export async function getTrip(id: string = DEFAULT_TRIP_ID): Promise<Trip | null> {
  return trips[id] ?? null
}

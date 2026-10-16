import { computed, ref } from 'vue'
import type { DayNo, Place, PlaceKind, Stop, Trip } from '../../shared/types'
import { fetchTrip } from '../services/api'

/** 行程地圖的篩選：0 = 全部、1~3 = 某天、或某一類固定地點 */
export type MapFilter = 0 | DayNo | PlaceKind

// 全站共用狀態（規模小，先不引入 Pinia）
const trip = ref<Trip | null>(null)
const loading = ref(false)
const error = ref<string | null>(null)
const selectedStop = ref<Stop | null>(null)
const selectedPlace = ref<Place | null>(null)
const activeFilter = ref<MapFilter>(0)
/** AI 助理要求在地圖上標示的站點 */
const highlightedStopIds = ref<number[]>([])

// 每天的主色與上面文字色（黃色底需用深色字）
export const dayColors: Record<DayNo, { bg: string; fg: string }> = {
  1: { bg: '#2449c2', fg: '#ffffff' },
  2: { bg: '#e5372b', fg: '#ffffff' },
  3: { bg: '#ffd23f', fg: '#1b2350' },
}
export const dayStyle = (day: DayNo) => ({ background: dayColors[day].bg, color: dayColors[day].fg })

export const placeLabels: Record<PlaceKind, string> = { hotel: '住宿', airport: '機場' }

const isPlaceFilter = (f: MapFilter): f is PlaceKind => typeof f === 'string'

export function useTrip() {
  const visibleStops = computed(() => {
    const f = activeFilter.value
    if (isPlaceFilter(f)) return []
    return (trip.value?.stops ?? []).filter(s => !f || s.day === f)
  })
  /** 列表要顯示的固定地點：全部 → 全部地點；地點分頁 → 該類地點；某天 → 無 */
  const visiblePlaces = computed(() => {
    const f = activeFilter.value
    const places = trip.value?.places ?? []
    if (f === 0) return places
    return isPlaceFilter(f) ? places.filter(p => p.kind === f) : []
  })
  const foodTotal = computed(() =>
    (trip.value?.stops ?? []).reduce((sum, s) => sum + (s.price ?? 0), 0),
  )

  async function load(id?: string) {
    loading.value = true
    error.value = null
    try {
      trip.value = await fetchTrip(id)
    } catch (e) {
      error.value = e instanceof Error ? e.message : String(e)
    } finally {
      loading.value = false
    }
  }

  return {
    trip, loading, error, selectedStop, selectedPlace, activeFilter, highlightedStopIds,
    visibleStops, visiblePlaces, foodTotal, load,
    highlightStops(ids: number[]) {
      // 目前分頁看不到其中某站時切回「全部」，確保標示的站點都在地圖上
      const visible = new Set(visibleStops.value.map(s => s.id))
      if (ids.some(id => !visible.has(id))) activeFilter.value = 0
      highlightedStopIds.value = ids
    },
    clearHighlights() {
      highlightedStopIds.value = []
    },
    selectStop(s: Stop) {
      selectedPlace.value = null
      selectedStop.value = s
    },
    selectPlace(p: Place) {
      selectedStop.value = null
      selectedPlace.value = p
    },
    closeDetail() {
      selectedStop.value = null
      selectedPlace.value = null
    },
  }
}

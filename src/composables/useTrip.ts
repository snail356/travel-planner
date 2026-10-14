import { computed, ref } from 'vue'
import type { DayNo, Stop, Trip } from '../../shared/types'
import { fetchTrip } from '../services/api'

// 全站共用狀態（規模小，先不引入 Pinia）
const trip = ref<Trip | null>(null)
const loading = ref(false)
const error = ref<string | null>(null)
const selectedStop = ref<Stop | null>(null)
const activeDay = ref<DayNo | 0>(0)

// 每天的主色與上面文字色（黃色底需用深色字）
export const dayColors: Record<DayNo, { bg: string; fg: string }> = {
  1: { bg: '#2449c2', fg: '#ffffff' },
  2: { bg: '#e5372b', fg: '#ffffff' },
  3: { bg: '#ffd23f', fg: '#1b2350' },
}
export const dayStyle = (day: DayNo) => ({ background: dayColors[day].bg, color: dayColors[day].fg })

export function useTrip() {
  const visibleStops = computed(() =>
    (trip.value?.stops ?? []).filter(s => !activeDay.value || s.day === activeDay.value),
  )
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
    trip, loading, error, selectedStop, activeDay, visibleStops, foodTotal, load,
    selectStop: (s: Stop) => (selectedStop.value = s),
    closeDetail: () => (selectedStop.value = null),
  }
}

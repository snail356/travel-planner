import { computed, ref, watch, type Ref } from 'vue'
import { useTrip } from './useTrip'

// 打卡紀錄：目前存在瀏覽器 localStorage（離線也能用，適合 PWA）
// 之後有登入／後端時，可改成同步到 /api/checkins
const stores = new Map<string, Ref<number[]>>()

function storeFor(tripId: string): Ref<number[]> {
  let store = stores.get(tripId)
  if (store) return store

  // v2：站點依新動線重新編號，舊紀錄的站號對不上，改用新的 key 重新開始
  const key = `checkins:v2:${tripId}`
  let initial: number[] = []
  try {
    const parsed: unknown = JSON.parse(localStorage.getItem(key) ?? '[]')
    if (Array.isArray(parsed)) initial = parsed.filter((x): x is number => typeof x === 'number')
  } catch {
    // 無痕模式或資料損毀時從空白開始
  }
  store = ref(initial)
  watch(store, v => {
    try {
      localStorage.setItem(key, JSON.stringify(v))
    } catch {
      // 儲存失敗不影響畫面
    }
  })
  stores.set(tripId, store)
  return store
}

export function useCheckins(tripId: string) {
  const checked = storeFor(tripId)
  const isChecked = (id: number) => checked.value.includes(id)

  return {
    checked,
    count: computed(() => checked.value.length),
    isChecked,
    toggle(id: number) {
      checked.value = isChecked(id) ? checked.value.filter(x => x !== id) : [...checked.value, id]
    },
    reset() {
      checked.value = []
    },
  }
}

/** 目前行程的打卡紀錄（元件只在行程載入後才會渲染） */
export function useCurrentCheckins() {
  const { trip } = useTrip()
  return useCheckins(trip.value?.id ?? 'default')
}

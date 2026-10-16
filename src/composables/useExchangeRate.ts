import { computed, ref } from 'vue'
import type { ExchangeRate } from '../../shared/types'
import { fetchRate } from '../services/api'

// 港幣對新台幣參考匯率：計算機與 AI 助理共用，整個頁面只抓一次
const info = ref<ExchangeRate | null>(null)
const loadError = ref(false)
let pending: Promise<ExchangeRate | null> | null = null

function load(): Promise<ExchangeRate | null> {
  pending ??= fetchRate()
    .then(value => (info.value = value))
    .catch(() => {
      loadError.value = true
      pending = null // 下次再試
      return null
    })
  return pending
}

export function useExchangeRate() {
  const updatedLabel = computed(() => {
    if (!info.value) return ''
    const d = new Date(info.value.updatedAt)
    return `${d.getMonth() + 1}/${d.getDate()} 更新`
  })
  return { info, loadError, updatedLabel, load }
}

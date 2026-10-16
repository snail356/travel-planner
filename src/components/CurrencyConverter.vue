<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { faChevronRight, faRightLeft } from '@fortawesome/free-solid-svg-icons'
import type { ExchangeRate, Guide } from '../../shared/types'
import { fetchRate } from '../services/api'
import { useTrip } from '../composables/useTrip'
import { guideIcons } from '../icons'

// 港幣 ⇄ 新台幣計算機：兩個欄位都能輸入，另一邊即時換算
const props = defineProps<{ guide: Guide }>()
const { selectedGuide, selectGuide } = useTrip()

const QUICK_AMOUNTS = [
  { label: '叮叮車', hkd: 3.3 },
  { label: 'HK$50', hkd: 50 },
  { label: 'HK$100', hkd: 100 },
  { label: 'HK$500', hkd: 500 },
]

const info = ref<ExchangeRate | null>(null)
const loadError = ref(false)
/** 使用者自訂匯率（例如自己銀行的牌告匯率），空白時用參考匯率 */
const customRate = ref('')
const hkd = ref('100')
const twd = ref('')
const lastEdited = ref<'hkd' | 'twd'>('hkd')

const rate = computed(() => {
  const custom = Number.parseFloat(customRate.value)
  return custom > 0 ? custom : info.value?.rate ?? null
})
const updatedLabel = computed(() => {
  if (!info.value) return ''
  const d = new Date(info.value.updatedAt)
  return `${d.getMonth() + 1}/${d.getDate()} 更新`
})

const toNumber = (v: string) => {
  const n = Number.parseFloat(v)
  return Number.isFinite(n) && n >= 0 ? n : null
}
const fmt = (n: number, digits: number) => String(Number(n.toFixed(digits)))

function recalc() {
  const r = rate.value
  if (!r) return
  if (lastEdited.value === 'hkd') {
    const n = toNumber(hkd.value)
    twd.value = n === null ? '' : fmt(n * r, 0)
  } else {
    const n = toNumber(twd.value)
    hkd.value = n === null ? '' : fmt(n / r, 1)
  }
}
function onHkd() {
  lastEdited.value = 'hkd'
  recalc()
}
function onTwd() {
  lastEdited.value = 'twd'
  recalc()
}
function pick(amount: number) {
  hkd.value = String(amount)
  onHkd()
}

watch(rate, recalc)
onMounted(async () => {
  try {
    info.value = await fetchRate()
  } catch {
    loadError.value = true
  }
})
</script>

<template>
  <div class="guide-card converter" :class="{ active: selectedGuide?.id === props.guide.id }">
    <span class="guide-head">
      <span class="guide-ico"><FontAwesomeIcon :icon="guideIcons[props.guide.icon]" /></span>
      <span class="guide-title">{{ props.guide.title }}</span>
    </span>

    <div class="conv-fields">
      <label class="conv-field">
        <span>港幣 HKD</span>
        <input v-model="hkd" type="number" inputmode="decimal" min="0" step="any" @input="onHkd" />
      </label>
      <span class="conv-swap" aria-hidden="true"><FontAwesomeIcon :icon="faRightLeft" /></span>
      <label class="conv-field">
        <span>新台幣 TWD</span>
        <input v-model="twd" type="number" inputmode="decimal" min="0" step="any" @input="onTwd" />
      </label>
    </div>

    <div class="conv-quick">
      <button v-for="q in QUICK_AMOUNTS" :key="q.label" type="button" @click="pick(q.hkd)">{{ q.label }}</button>
    </div>

    <p class="conv-rate">
      <template v-if="info">
        參考匯率 1 HKD = {{ info.rate.toFixed(4) }} TWD・{{ updatedLabel }}
        <template v-if="info.fallback">（暫時無法取得線上匯率，使用備用值）</template>
      </template>
      <template v-else-if="loadError">無法取得匯率，請在下方輸入自訂匯率。</template>
      <template v-else>讀取匯率中…</template>
    </p>
    <label class="conv-custom">
      <span>自訂匯率</span>
      <input v-model="customRate" type="number" inputmode="decimal" min="0" step="any" :placeholder="info ? info.rate.toFixed(3) : '例如 4.1'" />
      <button v-if="customRate" type="button" class="link-btn" @click="customRate = ''">改回參考匯率</button>
    </label>

    <div class="conv-foot">
      <a class="conv-credit" href="https://www.exchangerate-api.com" target="_blank" rel="noopener">Rates By Exchange Rate API</a>
      <button type="button" class="guide-more" @click="selectGuide(props.guide)">
        換匯說明 <FontAwesomeIcon :icon="faChevronRight" />
      </button>
    </div>
  </div>
</template>

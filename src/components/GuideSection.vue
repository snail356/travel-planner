<script setup lang="ts">
import { computed } from 'vue'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { faChevronRight } from '@fortawesome/free-solid-svg-icons'
import type { Guide } from '../../shared/types'
import { useTrip } from '../composables/useTrip'
import { guideIcons } from '../icons'
import CurrencyConverter from './CurrencyConverter.vue'

// 行前須知：卡片只列重點，完整說明在抽屜中開啟
const props = defineProps<{ guides: Guide[] }>()
// 匯率換算以計算機卡片呈現，其餘為一般重點卡片
const cards = computed(() => props.guides.filter(g => g.id !== 'exchange'))
const exchange = computed(() => props.guides.find(g => g.id === 'exchange'))
const { selectedGuide, selectGuide } = useTrip()
</script>

<template>
  <section id="guide">
    <div class="wrap">
      <p class="eyebrow">BEFORE YOU GO</p>
      <h2>行前須知</h2>
      <p class="sub">簽證、票券預約、當地交通與匯率換算。規定與票價可能變動，出發前請以官方公告為準。</p>
      <div class="guide-grid">
        <button
          v-for="g in cards"
          :key="g.id"
          type="button"
          class="guide-card"
          :class="{ active: selectedGuide?.id === g.id }"
          @click="selectGuide(g)"
        >
          <span class="guide-head">
            <span class="guide-ico"><FontAwesomeIcon :icon="guideIcons[g.icon]" /></span>
            <span class="guide-title">{{ g.title }}</span>
          </span>
          <ul class="guide-points">
            <li v-for="h in g.highlights" :key="h">{{ h }}</li>
          </ul>
          <span class="guide-more">查看詳情 <FontAwesomeIcon :icon="faChevronRight" /></span>
        </button>
        <CurrencyConverter v-if="exchange" :guide="exchange" />
      </div>
    </div>
  </section>
</template>

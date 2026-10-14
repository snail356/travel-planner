<script setup lang="ts">
import type { DayNo } from '../../shared/types'
import { useTrip } from '../composables/useTrip'
import StopList from './StopList.vue'
import TripMap from './TripMap.vue'

const { activeDay } = useTrip()
const tabs: { day: DayNo | 0; label: string }[] = [
  { day: 0, label: '全部' },
  { day: 1, label: 'Day 1' },
  { day: 2, label: 'Day 2' },
  { day: 3, label: 'Day 3' },
]
</script>

<template>
  <section id="itinerary">
    <div class="wrap">
      <p class="eyebrow">ITINERARY</p>
      <h2>行程地圖</h2>
      <p class="sub">點選列表或地圖釘選查看詳細說明（每日分配與座標為暫定，待確認）</p>
      <div class="seg">
        <button
          v-for="t in tabs"
          :key="t.day"
          :class="{ on: activeDay === t.day }"
          @click="activeDay = t.day"
        >{{ t.label }}</button>
      </div>
      <div class="plan">
        <StopList />
        <TripMap />
      </div>
    </div>
  </section>
</template>

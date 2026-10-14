<script setup lang="ts">
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import type { IconDefinition } from '@fortawesome/fontawesome-svg-core'
import { type MapFilter, useTrip } from '../composables/useTrip'
import { placeIcons } from '../icons'
import StopList from './StopList.vue'
import TripMap from './TripMap.vue'

const { activeFilter } = useTrip()
const tabs: { value: MapFilter; label: string; icon?: IconDefinition }[] = [
  { value: 0, label: '全部' },
  { value: 1, label: 'Day 1' },
  { value: 2, label: 'Day 2' },
  { value: 3, label: 'Day 3' },
  { value: 'hotel', label: '住宿', icon: placeIcons.hotel },
  { value: 'airport', label: '機場', icon: placeIcons.airport },
]

// 窄螢幕分頁可橫向捲動，選到的分頁要完整露出
function pick(value: MapFilter, e: MouseEvent) {
  activeFilter.value = value
  ;(e.currentTarget as HTMLElement).scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'nearest' })
}
</script>

<template>
  <section id="itinerary">
    <div class="wrap">
      <p class="eyebrow">ITINERARY</p>
      <h2>行程地圖</h2>
      <p class="sub">點選列表或地圖釘選查看詳細說明（每日分配與座標為暫定，待確認）</p>
      <div class="seg seg-scroll">
        <button
          v-for="t in tabs"
          :key="t.value"
          :class="{ on: activeFilter === t.value }"
          @click="pick(t.value, $event)"
        ><FontAwesomeIcon v-if="t.icon" :icon="t.icon" /> {{ t.label }}</button>
      </div>
      <div class="plan">
        <StopList />
        <TripMap />
      </div>
    </div>
  </section>
</template>

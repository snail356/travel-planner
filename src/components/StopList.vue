<script setup lang="ts">
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { faCheck } from '@fortawesome/free-solid-svg-icons'
import type { Stop } from '../../shared/types'
import { dayStyle, useTrip } from '../composables/useTrip'
import { useCurrentCheckins } from '../composables/useCheckins'

const { visibleStops, selectedStop, selectStop } = useTrip()
const { isChecked } = useCurrentCheckins()

function pick(s: Stop) {
  selectStop(s)
  // 手機版地圖在列表上方，點選後捲回地圖才看得到定位
  if (window.matchMedia('(max-width: 800px)').matches) {
    document.querySelector('.trip-map')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }
}
</script>

<template>
  <ul class="stops">
    <li
      v-for="s in visibleStops"
      :key="s.id"
      :class="{ active: selectedStop?.id === s.id }"
      @click="pick(s)"
    >
      <div class="num" :style="dayStyle(s.day)">{{ s.id }}</div>
      <div class="grow">
        <div class="t">{{ s.name }}</div>
        <div class="m">
          Day {{ s.day }}・{{ s.type === 'food' ? '餐廳' : '景點' }}<template v-if="s.price">・NT${{ s.price }}</template>
        </div>
      </div>
      <span v-if="isChecked(s.id)" class="done-mark" title="已打卡"><FontAwesomeIcon :icon="faCheck" /></span>
    </li>
  </ul>
</template>

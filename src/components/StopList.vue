<script setup lang="ts">
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { faCheck } from '@fortawesome/free-solid-svg-icons'
import type { Place, Stop } from '../../shared/types'
import { dayStyle, placeLabels, useTrip } from '../composables/useTrip'
import { useCurrentCheckins } from '../composables/useCheckins'
import { placeIcons } from '../icons'

const { visibleStops, visiblePlaces, selectedStop, selectedPlace, selectStop, selectPlace } = useTrip()
const { isChecked } = useCurrentCheckins()

// 手機版地圖在列表上方，點選後捲回地圖才看得到定位
function scrollToMapOnMobile() {
  if (window.matchMedia('(max-width: 800px)').matches) {
    document.querySelector('.trip-map')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }
}
function pickStop(s: Stop) {
  selectStop(s)
  scrollToMapOnMobile()
}
function pickPlace(p: Place) {
  selectPlace(p)
  scrollToMapOnMobile()
}
</script>

<template>
  <ul class="stops">
    <li
      v-for="p in visiblePlaces"
      :key="p.id"
      class="place-item"
      :class="{ active: selectedPlace?.id === p.id }"
      @click="pickPlace(p)"
    >
      <div class="num place-num"><FontAwesomeIcon :icon="placeIcons[p.kind]" /></div>
      <div class="grow">
        <div class="t">{{ p.name }}</div>
        <div class="m">{{ placeLabels[p.kind] }}・{{ p.area }}</div>
      </div>
    </li>
    <li
      v-for="s in visibleStops"
      :key="s.id"
      :class="{ active: selectedStop?.id === s.id }"
      @click="pickStop(s)"
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

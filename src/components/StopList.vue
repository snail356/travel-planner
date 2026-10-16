<script setup lang="ts">
import { computed } from 'vue'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { faCheck, faPlaneDeparture } from '@fortawesome/free-solid-svg-icons'
import type { DayNo, Place, Stop } from '../../shared/types'
import { dayStyle, placeLabels, useTrip } from '../composables/useTrip'
import { useCurrentCheckins } from '../composables/useCheckins'
import { placeIcons } from '../icons'
import { navItems } from '../navItems'

const {
  trip, visibleStops, visiblePlaces, selectedStop, selectedPlace, selectStop, selectPlace, slotOf, dayPlanOf,
} = useTrip()
const { isChecked } = useCurrentCheckins()

type Row =
  | { kind: 'day'; key: string; day: DayNo; title: string }
  | { kind: 'slot'; key: string; label: string }
  | { kind: 'stop'; key: string; stop: Stop }
  | { kind: 'end'; key: string; text: string }

/** 依動線把站點分成「天 → 時段 → 站點」，每天最後補上收尾說明（例如前往機場） */
const rows = computed<Row[]>(() => {
  const result: Row[] = []
  const stops = visibleStops.value
  stops.forEach((s, i) => {
    const prev = stops[i - 1]
    if (prev?.day !== s.day) {
      result.push({ kind: 'day', key: `day-${s.day}`, day: s.day, title: dayPlanOf(s.day)?.title ?? '' })
    }
    const slot = slotOf(s.id)
    if (slot && (prev?.day !== s.day || slotOf(prev.id) !== slot)) {
      result.push({ kind: 'slot', key: `slot-${s.day}-${slot}`, label: slot })
    }
    result.push({ kind: 'stop', key: `stop-${s.id}`, stop: s })
    const endNote = dayPlanOf(s.day)?.endNote
    if (endNote && stops[i + 1]?.day !== s.day) result.push({ kind: 'end', key: `end-${s.day}`, text: endNote })
  })
  return result
})

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
/** 收尾說明（前往機場）點了打開機場 */
function pickEnd() {
  const airport = trip.value?.places.find(p => p.kind === 'airport')
  if (airport) pickPlace(airport)
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
    <template v-for="row in rows" :key="row.key">
      <li v-if="row.kind === 'day'" class="day-header">
        <span class="day-badge" :style="dayStyle(row.day)">Day {{ row.day }}</span>
        <span class="day-title">{{ row.title }}</span>
      </li>
      <li v-else-if="row.kind === 'slot'" class="slot-header">{{ row.label }}</li>
      <li
        v-else-if="row.kind === 'stop'"
        :class="{ active: selectedStop?.id === row.stop.id }"
        @click="pickStop(row.stop)"
      >
        <div class="num" :class="{ 'spot-num': row.stop.type === 'spot' }" :style="dayStyle(row.stop.day)">
          <FontAwesomeIcon v-if="row.stop.type === 'spot'" :icon="navItems.spots.icon" />{{ row.stop.id }}
        </div>
        <div class="grow">
          <div class="t">{{ row.stop.name }}</div>
          <div class="m">
            {{ row.stop.type === 'food' ? '餐廳' : '景點' }}<template v-if="row.stop.price">・NT${{ row.stop.price }}</template><template v-if="row.stop.note">・{{ row.stop.note }}</template>
          </div>
        </div>
        <span v-if="isChecked(row.stop.id)" class="done-mark" title="已打卡"><FontAwesomeIcon :icon="faCheck" /></span>
      </li>
      <li v-else class="end-row" @click="pickEnd">
        <div class="num place-num"><FontAwesomeIcon :icon="faPlaneDeparture" /></div>
        <div class="grow"><div class="t">{{ row.text }}</div></div>
      </li>
    </template>
  </ul>
</template>

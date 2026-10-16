<script setup lang="ts">
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { faCheck, faTrophy } from '@fortawesome/free-solid-svg-icons'
import type { DayNo, Trip } from '../../shared/types'
import { dayColors, useTrip } from '../composables/useTrip'
import { useCurrentCheckins } from '../composables/useCheckins'
import { navItems } from '../navItems'

defineProps<{ trip: Trip }>()
const { count, isChecked, toggle, reset } = useCurrentCheckins()
// 打卡圓圈依動線順序排列，同一天的顏色排在一起
const { orderedStops } = useTrip()

// 未打卡：空心；已打卡：當天顏色實心（景點為相機膠囊，餐廳為圓圈）
const stampStyle = (day: DayNo, done: boolean) =>
  done
    ? { background: dayColors[day].bg, color: dayColors[day].fg, borderColor: dayColors[day].bg }
    : { borderColor: dayColors[day].bg }
</script>

<template>
  <section id="top" class="hero">
    <div class="wrap">
      <div class="hero-head">
        <p class="eyebrow">HONG KONG · {{ trip.days }}D{{ trip.nights }}N TRIP</p>
        <h1 class="hero-title">{{ trip.title }}</h1>
        <p class="hero-sub">{{ trip.subtitle }}</p>
        <p class="price-tag">
          <b>NT${{ trip.avgCostPerPerson.toLocaleString() }}</b> / 人<small>平均花費</small>
        </p>
      </div>

      <div class="stamp-card">
        <div class="head">
          <span class="chip">打卡集點</span>
          <span class="count">{{ count }} / {{ trip.stops.length }}</span>
        </div>
        <div class="progress" role="progressbar" :aria-valuenow="count" aria-valuemin="0" :aria-valuemax="trip.stops.length">
          <span :style="{ width: `${(count / trip.stops.length) * 100}%` }"></span>
        </div>
        <div class="stamps">
          <button
            v-for="s in orderedStops"
            :key="s.id"
            class="stamp"
            :class="{ done: isChecked(s.id), spot: s.type === 'spot' }"
            :style="stampStyle(s.day, isChecked(s.id))"
            :aria-pressed="isChecked(s.id)"
            :title="`${s.name}${isChecked(s.id) ? '（已打卡）' : ''}`"
            @click="toggle(s.id)"
          >
            <FontAwesomeIcon v-if="isChecked(s.id)" :icon="faCheck" />
            <template v-else>
              <FontAwesomeIcon v-if="s.type === 'spot'" :icon="navItems.spots.icon" />{{ s.id }}
            </template>
          </button>
        </div>
        <p class="stamp-hint">
          <template v-if="count === trip.stops.length"><FontAwesomeIcon :icon="faTrophy" class="trophy" /> 全部完成！</template>
          <template v-else>到了就點一下圓圈打卡，也可以在站點詳情裡打卡。</template>
          <button v-if="count" class="link-btn" @click="reset">重設</button>
        </p>
      </div>
    </div>
  </section>
</template>

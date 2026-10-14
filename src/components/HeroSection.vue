<script setup lang="ts">
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { faCheck, faTrophy } from '@fortawesome/free-solid-svg-icons'
import type { DayNo, Trip } from '../../shared/types'
import { navItems } from '../navItems'
import { dayColors } from '../composables/useTrip'
import { useCurrentCheckins } from '../composables/useCheckins'

defineProps<{ trip: Trip }>()
const { count, isChecked, toggle, reset } = useCurrentCheckins()

// 未打卡：空心圈；已打卡：當天顏色實心
const stampStyle = (day: DayNo, done: boolean) =>
  done
    ? { background: dayColors[day].bg, color: dayColors[day].fg, borderColor: dayColors[day].bg }
    : { borderColor: dayColors[day].bg }

const { route, food, spots, stay, transport } = navItems
const quick = [route, food, spots, stay, transport]
</script>

<template>
  <section id="top" class="hero">
    <div class="wrap">
      <div class="hero-grid">
        <div>
          <h1 class="hero-title">
            Hong Kong
            <span class="red">{{ trip.days }}D{{ trip.nights }}N TRIP</span>
          </h1>
          <p class="hero-zh">{{ trip.title }}</p>
          <p class="hero-sub">{{ trip.subtitle }}</p>
          <span class="sticker">( {{ trip.stops.length }} STOPS )</span>
        </div>

        <!-- 旋轉圓形文字徽章 -->
        <div class="badge" aria-hidden="true">
          <svg class="ring" viewBox="0 0 300 300">
            <defs>
              <path id="circle" d="M150,150 m-125,0 a125,125 0 1,1 250,0 a125,125 0 1,1 -250,0" />
            </defs>
            <text><textPath href="#circle" textLength="780" lengthAdjust="spacing">HONG KONG ✦ 3 DAYS ✦ 2 NIGHTS ✦ EAT ✦ WALK ✦ REPEAT ✦</textPath></text>
          </svg>
          <div class="core">
            <div>
              <b>NT${{ (trip.avgCostPerPerson / 1000).toFixed(1) }}k</b>
              <span>PER PERSON</span>
            </div>
          </div>
        </div>
      </div>

      <div class="banner-pill">
        <span>◀</span><span class="mid">HK · 3D2N</span><span>▶</span>
      </div>

      <div class="quick">
        <a v-for="q in quick" :key="q.href" :href="q.href">
          <span class="ico"><FontAwesomeIcon :icon="q.icon" /></span>{{ q.label }}<small>{{ q.en }}</small>
        </a>
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
            v-for="s in trip.stops"
            :key="s.id"
            class="stamp"
            :class="{ done: isChecked(s.id) }"
            :style="stampStyle(s.day, isChecked(s.id))"
            :aria-pressed="isChecked(s.id)"
            :title="`${s.name}${isChecked(s.id) ? '（已打卡）' : ''}`"
            @click="toggle(s.id)"
          ><FontAwesomeIcon v-if="isChecked(s.id)" :icon="faCheck" /><template v-else>{{ s.id }}</template></button>
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

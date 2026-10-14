<script setup lang="ts">
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { faCircleCheck, faLocationDot, faStamp, faXmark } from '@fortawesome/free-solid-svg-icons'
import { dayStyle, placeLabels, useTrip } from '../composables/useTrip'
import { useCurrentCheckins } from '../composables/useCheckins'
import { placeIcons } from '../icons'
import StopPhoto from './StopPhoto.vue'

const { selectedStop: s, selectedPlace: p, closeDetail } = useTrip()
const { isChecked, toggle } = useCurrentCheckins()

// 用名稱搜尋 Google 地圖，比座標更準確找到店家頁面
const mapsUrl = (name: string) =>
  `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${name} 香港`)}`
</script>

<template>
  <aside class="detail" :class="{ open: s || p }" aria-label="站點詳情">
    <span class="sheet-handle" aria-hidden="true"></span>
    <button class="close" aria-label="關閉" @click="closeDetail"><FontAwesomeIcon :icon="faXmark" /></button>
    <template v-if="s">
      <StopPhoto :stop="s" />
      <div class="body">
        <p>
          <span class="tag" :style="dayStyle(s.day)">Day {{ s.day }}</span>
          <span class="tag">第 {{ s.id }} 站</span>
          <span class="tag">{{ s.type === 'food' ? '餐廳' : '景點' }}</span>
          <span v-if="s.pass" class="tag">FunPASS</span>
        </p>
        <h2>{{ s.name }}</h2>
        <p>{{ s.desc }}</p>
        <div class="info">
          <p><b>區域</b>{{ s.area }}</p>
          <p v-if="s.price"><b>花費</b>NT${{ s.price }}</p>
          <p><b>營業時間</b>{{ s.hours ?? '待補' }}</p>
          <p><b>推薦 / 心得</b>{{ s.tips ?? '待補' }}</p>
        </div>
        <div class="actions">
          <button
            class="btn-pill checkin"
            :class="{ done: isChecked(s.id) }"
            :aria-pressed="isChecked(s.id)"
            @click="toggle(s.id)"
          >
            <FontAwesomeIcon :icon="isChecked(s.id) ? faCircleCheck : faStamp" />
            {{ isChecked(s.id) ? '已打卡' : '打卡' }}
          </button>
          <a class="btn-pill ghost" :href="mapsUrl(s.name)" target="_blank" rel="noopener">
            <FontAwesomeIcon :icon="faLocationDot" /> Google 地圖
          </a>
        </div>
      </div>
    </template>
    <template v-else-if="p">
      <div class="img placeholder place-hero"><FontAwesomeIcon :icon="placeIcons[p.kind]" /></div>
      <div class="body">
        <p><span class="tag tag-ink">{{ placeLabels[p.kind] }}</span></p>
        <h2>{{ p.name }}</h2>
        <p>{{ p.desc }}</p>
        <div class="info">
          <p><b>區域</b>{{ p.area }}</p>
          <p><b>地址</b>{{ p.address ?? '待補' }}</p>
        </div>
        <a class="btn-pill" :href="mapsUrl(p.name)" target="_blank" rel="noopener">
          <FontAwesomeIcon :icon="faLocationDot" /> Google 地圖
        </a>
      </div>
    </template>
  </aside>
</template>

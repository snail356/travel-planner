<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { faCircleCheck, faLocationDot, faStamp, faXmark } from '@fortawesome/free-solid-svg-icons'
import { dayStyle, placeLabels, useTrip } from '../composables/useTrip'
import { useCurrentCheckins } from '../composables/useCheckins'
import { placeIcons } from '../icons'
import StopPhoto from './StopPhoto.vue'

const { selectedStop: s, selectedPlace: p, closeDetail } = useTrip()
const { isChecked, toggle } = useCurrentCheckins()

// 點面板以外的地方自動收回
const panel = ref<HTMLElement>()
const current = () => s.value ?? p.value
let downX = 0
let downY = 0
let selectionAtDown: unknown = null

// 用 capture 在其他元件處理點擊前，先記下按下時的位置與選取的站點
function onPointerDown(e: PointerEvent) {
  downX = e.clientX
  downY = e.clientY
  selectionAtDown = current()
}

function onDocumentClick(e: MouseEvent) {
  if (!current()) return
  if (panel.value?.contains(e.target as Node)) return
  // 這次點擊選了另一站（卡片、列表、釘選）：保持開啟並切換內容
  if (current() !== selectionAtDown) return
  // 拖曳地圖不算點擊
  if (Math.hypot(e.clientX - downX, e.clientY - downY) > 6) return
  closeDetail()
}

function onKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape' && current()) closeDetail()
}

onMounted(() => {
  document.addEventListener('pointerdown', onPointerDown, true)
  document.addEventListener('click', onDocumentClick)
  document.addEventListener('keydown', onKeydown)
})
onBeforeUnmount(() => {
  document.removeEventListener('pointerdown', onPointerDown, true)
  document.removeEventListener('click', onDocumentClick)
  document.removeEventListener('keydown', onKeydown)
})

// 用名稱搜尋 Google 地圖，比座標更準確找到店家頁面
const mapsUrl = (name: string) =>
  `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${name} 香港`)}`
</script>

<template>
  <aside ref="panel" class="detail" :class="{ open: s || p }" aria-label="站點詳情">
    <span class="sheet-handle" aria-hidden="true"></span>
    <!-- 高度 0 的置頂層：關閉鈕疊在照片上，捲動抽屜時也固定在右上角 -->
    <div class="detail-top">
      <button class="close" aria-label="關閉" @click="closeDetail"><FontAwesomeIcon :icon="faXmark" /></button>
    </div>
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

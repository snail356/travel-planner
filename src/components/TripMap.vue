<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'
import L from 'leaflet'
import { icon as faIcon } from '@fortawesome/fontawesome-svg-core'
import { faCheck, faExpand } from '@fortawesome/free-solid-svg-icons'
import type { DayNo } from '../../shared/types'
import { dayColors, placeLabels, useTrip } from '../composables/useTrip'
import { placeIcons } from '../icons'
import { useCurrentCheckins } from '../composables/useCheckins'

type MapStyle = 'simple' | 'detailed'

// 簡易：Esri 淺灰底圖 + 地名標註（資訊少、釘選更醒目）；詳細：OSM 標準（街道、店家、地標）
// 兩者皆免 API Key
const ESRI = 'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas'
const TILES: Record<MapStyle, { url: string; attribution?: string }[]> = {
  simple: [
    { url: `${ESRI}/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}`, attribution: '&copy; Esri' },
    { url: `${ESRI}/World_Light_Gray_Reference/MapServer/tile/{z}/{y}/{x}` },
  ],
  detailed: [
    { url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', attribution: '&copy; OpenStreetMap' },
  ],
}

// Leaflet 釘選是純 HTML 字串，直接用 Font Awesome 產生的 SVG
const CHECK_SVG = faIcon(faCheck).html.join('')

const { trip, visibleStops, selectedStop, selectedPlace, activeFilter, selectStop, selectPlace } = useTrip()
const { checked, isChecked } = useCurrentCheckins()
const el = ref<HTMLDivElement>()
const mapStyle = ref<MapStyle>('simple')
const showRoutes = ref(true)

let map: L.Map | undefined
const tileGroup = L.layerGroup()
const markerLayer = L.layerGroup()
const routeLayer = L.layerGroup()
const placeLayer = L.layerGroup()

function applyTiles() {
  tileGroup.clearLayers()
  for (const t of TILES[mapStyle.value]) {
    // Esri 底圖在 z16 以上沒有資料，用 maxNativeZoom 放大最後一層
    L.tileLayer(t.url, { maxZoom: 19, maxNativeZoom: mapStyle.value === 'simple' ? 16 : 19, attribution: t.attribution })
      .addTo(tileGroup)
  }
}

function renderMarkers() {
  if (!map) return
  markerLayer.clearLayers()
  for (const s of visibleStops.value) {
    const icon = L.divIcon({
      className: '',
      iconSize: [30, 30],
      iconAnchor: [15, 30],
      html: `<div class="pin" style="background:${dayColors[s.day].bg};color:${dayColors[s.day].fg}"><span>${s.id}</span>${isChecked(s.id) ? `<i class="pin-done">${CHECK_SVG}</i>` : ''}</div>`,
    })
    L.marker([s.lat, s.lng], { icon })
      .bindTooltip(`${s.id}. ${s.name}`)
      .on('click', () => selectStop(s))
      .addTo(markerLayer)
  }
}

// 依站序把同一天的站點連起來（直線示意，非實際路徑）
function renderRoutes() {
  routeLayer.clearLayers()
  if (!showRoutes.value) return
  for (const day of [1, 2, 3] as DayNo[]) {
    const points = visibleStops.value
      .filter(s => s.day === day)
      .sort((a, b) => a.id - b.id)
      .map(s => L.latLng(s.lat, s.lng))
    if (points.length < 2) continue
    // 白色外框讓黃色線在淺色底圖上也看得清楚
    L.polyline(points, { color: '#fff', weight: 8, opacity: 0.9, interactive: false }).addTo(routeLayer)
    L.polyline(points, {
      color: dayColors[day].bg,
      weight: 4,
      dashArray: '2 9',
      lineCap: 'round',
      interactive: false,
    }).addTo(routeLayer)
  }
}

// 住宿、機場等固定地點：每個分頁都顯示，用深色方形圖示和景點區分
function renderPlaces() {
  if (!map) return
  placeLayer.clearLayers()
  for (const p of trip.value?.places ?? []) {
    const icon = L.divIcon({
      className: '',
      iconSize: [34, 34],
      iconAnchor: [17, 17],
      html: `<div class="place-pin">${faIcon(placeIcons[p.kind]).html.join('')}</div>`,
    })
    L.marker([p.lat, p.lng], { icon, zIndexOffset: 500 })
      .bindTooltip(`${placeLabels[p.kind]}・${p.name}`)
      .on('click', () => selectPlace(p))
      .addTo(placeLayer)
  }
}

// 要縮放涵蓋的點：地點分頁 → 該類地點；其他 → 景點 + 住宿
// （機場在大嶼山，納入會讓市區景點縮得太小，所以總覽不含機場）
function fitPoints(): L.LatLng[] {
  const f = activeFilter.value
  const places = trip.value?.places ?? []
  const picked = typeof f === 'string'
    ? places.filter(p => p.kind === f)
    : [...visibleStops.value, ...places.filter(p => p.kind === 'hotel')]
  return picked.map(p => L.latLng(p.lat, p.lng))
}

function fitToView() {
  const points = fitPoints()
  if (!map || !points.length) return
  map.invalidateSize()
  // 尚未顯示（0 尺寸）時算出的縮放會錯，交給 ResizeObserver 在出現時再對焦
  if (map.getSize().x === 0) {
    lastWidth = 0
    return
  }
  // 釘選往上突出約 30px，上方還有切換按鈕，所以頂部留多一點
  // 不用動畫：Leaflet 在縮放動畫進行中會忽略新的縮放要求，快速切換分頁時會停在錯的位置
  map.fitBounds(L.latLngBounds(points), {
    animate: false,
    paddingTopLeft: [30, 70],
    paddingBottomRight: [30, 20],
    maxZoom: activeFilter.value === 'airport' ? 13 : typeof activeFilter.value === 'string' ? 15 : 16,
  })
}

// 「全區」按鈕：放在 +/− 下方，一鍵縮放到涵蓋目前顯示的所有景點
const FitAllControl = L.Control.extend({
  onAdd() {
    const bar = L.DomUtil.create('div', 'leaflet-bar')
    const btn = L.DomUtil.create('a', 'fit-all-btn', bar)
    btn.href = '#'
    btn.title = '顯示全區'
    btn.setAttribute('role', 'button')
    btn.setAttribute('aria-label', '顯示全區')
    btn.innerHTML = faIcon(faExpand).html.join('')
    L.DomEvent.disableClickPropagation(bar)
    L.DomEvent.on(btn, 'click', e => {
      L.DomEvent.preventDefault(e)
      fitToView()
    })
    return bar
  },
})

// 容器一開始可能是 0 尺寸（例如分頁在背景載入），尺寸出現時再重新對焦
let lastWidth = 0
const resizeObserver = new ResizeObserver(([entry]) => {
  const width = entry.contentRect.width
  if (lastWidth === 0 && width > 0) fitToView()
  else map?.invalidateSize()
  lastWidth = width
})

onMounted(() => {
  map = L.map(el.value!).setView([22.3, 114.175], 13)
  new FitAllControl({ position: 'topleft' }).addTo(map)
  tileGroup.addTo(map)
  applyTiles()
  routeLayer.addTo(map)
  markerLayer.addTo(map)
  placeLayer.addTo(map)
  renderRoutes()
  renderMarkers()
  renderPlaces()
  fitToView()
  resizeObserver.observe(el.value!)
})
onBeforeUnmount(() => {
  resizeObserver.disconnect()
  map?.remove()
})

watch(visibleStops, () => {
  renderRoutes()
  renderMarkers()
})
watch(activeFilter, fitToView)
watch(selectedPlace, p => {
  if (p && map) map.setView([p.lat, p.lng], p.kind === 'airport' ? 13 : 16)
})
// 打卡只更新釘選樣式，不移動地圖
watch(checked, renderMarkers)
watch(mapStyle, applyTiles)
watch(showRoutes, renderRoutes)
watch(selectedStop, s => {
  if (s && map) map.setView([s.lat, s.lng], 16)
})
</script>

<template>
  <div class="map-wrap">
    <div ref="el" class="trip-map"></div>
    <div class="map-controls">
      <div class="seg seg-sm" role="group" aria-label="地圖樣式">
        <button :class="{ on: mapStyle === 'simple' }" @click="mapStyle = 'simple'">簡易</button>
        <button :class="{ on: mapStyle === 'detailed' }" @click="mapStyle = 'detailed'">詳細</button>
      </div>
      <label class="switch">
        <input v-model="showRoutes" type="checkbox" />
        <span class="track" aria-hidden="true"></span>
        路線
      </label>
    </div>
  </div>
</template>

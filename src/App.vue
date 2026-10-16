<script setup lang="ts">
import { onMounted } from 'vue'
import { useTrip } from './composables/useTrip'
import NavBar from './components/NavBar.vue'
import HeroSection from './components/HeroSection.vue'
import ItinerarySection from './components/ItinerarySection.vue'
import StopCardGrid from './components/StopCardGrid.vue'
import HotelSection from './components/HotelSection.vue'
import TransportSection from './components/TransportSection.vue'
import CostSection from './components/CostSection.vue'
import DetailPanel from './components/DetailPanel.vue'
import ChatWidget from './components/ChatWidget.vue'

const { trip, orderedStops, loading, error, load } = useTrip()
onMounted(() => load())
</script>

<template>
  <NavBar />
  <div v-if="loading" class="status">載入行程中…</div>
  <div v-else-if="error" class="status">{{ error }}</div>
  <template v-else-if="trip">
    <HeroSection :trip="trip" />
    <ItinerarySection />
    <StopCardGrid
      id="food"
      eyebrow="EAT & DRINK"
      title="餐廳美食"
      sub="點心、茶餐廳、甜點、伴手禮"
      :stops="orderedStops.filter(s => s.type === 'food')"
    />
    <StopCardGrid
      id="spots"
      eyebrow="SIGHTSEEING"
      title="景點"
      sub="付費景點皆使用香港 FunPASS（豪華 3 合 1）"
      :stops="orderedStops.filter(s => s.type === 'spot')"
    />
    <HotelSection :hotel="trip.hotel" />
    <TransportSection :transports="trip.transports" />
    <CostSection :trip="trip" />
    <footer><span class="logo">Hong<em>Kong</em></span>{{ trip.title }}・行程規劃草稿</footer>
    <DetailPanel />
    <ChatWidget :trip-id="trip.id" />
  </template>
</template>

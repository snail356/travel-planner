<script setup lang="ts">
import type { Hotel } from '../../shared/types'
defineProps<{ hotel: Hotel }>()
</script>

<template>
  <section id="hotel">
    <div class="wrap">
      <p class="eyebrow">STAY</p>
      <h2>住宿</h2>
      <p class="sub">{{ hotel.nights }} 晚</p>
      <div class="two">
        <img v-if="hotel.imageUrl" class="photo" :src="hotel.imageUrl" :alt="hotel.name" />
        <div v-else class="photo placeholder">飯店照片</div>
        <div class="box">
          <h3>{{ hotel.name }}</h3>
          <p>
            <span class="tag">{{ hotel.nights }} 晚</span>
            <span class="tag">NT${{ hotel.price.toLocaleString() }}</span>
          </p>
          <ul>
            <li>地址：{{ hotel.address ?? '待補' }}</li>
            <li>交通：{{ hotel.station ?? '最近地鐵站待補' }}</li>
            <li>房型 / 心得：{{ hotel.note ?? '待補' }}</li>
          </ul>
        </div>
      </div>
    </div>
  </section>
</template>

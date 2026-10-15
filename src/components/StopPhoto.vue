<script setup lang="ts">
import type { Stop } from '../../shared/types'

// 站點照片：有圖顯示圖片與授權標示，沒有則顯示佔位
defineProps<{ stop: Stop }>()
</script>

<template>
  <div v-if="stop.imageUrl" class="img photo-wrap">
    <img :src="stop.imageUrl" :alt="stop.name" loading="lazy" />
    <a
      v-if="stop.imageCredit"
      class="credit"
      :href="stop.imageCredit.sourceUrl"
      target="_blank"
      rel="noopener"
      @click.stop
    ><template v-if="stop.imageCredit.note">{{ stop.imageCredit.note }} · </template>Photo: {{ stop.imageCredit.author }} / {{ stop.imageCredit.license }}</a>
  </div>
  <div v-else class="img placeholder">照片</div>
</template>

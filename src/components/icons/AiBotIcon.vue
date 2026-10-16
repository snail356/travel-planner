<script setup lang="ts">
import { computed } from 'vue'

// AI 助理圖示：方形圓角臉＋圓頭天線的機器人（線條風格，參考 Lucide 的 bot 自行繪製）
// 預設用系統藍漸層；傳入 color 則改用單一顏色（例如藍色按鈕上的白色圖示）。
// 漸層用 userSpaceOnUse，才不會因為直線的寬度為 0 而無法上色。
const props = defineProps<{ size?: number; color?: string }>()
const paint = computed(() => props.color ?? 'url(#ai-bot-grad)')
</script>

<template>
  <svg
    class="ai-bot-icon"
    :width="size ?? 24"
    :height="size ?? 24"
    viewBox="0 0 24 24"
    fill="none"
    :stroke="paint"
    stroke-width="2"
    stroke-linecap="round"
    stroke-linejoin="round"
    aria-hidden="true"
  >
    <defs v-if="!color">
      <linearGradient id="ai-bot-grad" x1="3" y1="2" x2="21" y2="21" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stop-color="#7aa2ff" />
        <stop offset="55%" stop-color="#2449c2" />
        <stop offset="100%" stop-color="#1a3596" />
      </linearGradient>
    </defs>
    <!-- 天線 -->
    <path d="M12 7.5V4.6" />
    <circle cx="12" cy="3.2" r="1.4" :fill="paint" stroke="none" />
    <!-- 臉 -->
    <rect x="4" y="7.5" width="16" height="12.5" rx="4.5" />
    <!-- 耳朵 -->
    <path d="M1.8 12.5v3M22.2 12.5v3" />
    <!-- 眼睛 -->
    <path d="M9 13v1.6M15 13v1.6" stroke-width="2.4" />
  </svg>
</template>

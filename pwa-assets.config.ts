import { defineConfig, minimal2023Preset } from '@vite-pwa/assets-generator/config'

// 由 public/icon.svg 產生 PWA 圖示：npm run icons
export default defineConfig({
  preset: {
    ...minimal2023Preset,
    // 主畫面圖示用品牌藍底，不要預設的白底
    maskable: { ...minimal2023Preset.maskable, resizeOptions: { background: '#2449c2' } },
    apple: { ...minimal2023Preset.apple, resizeOptions: { background: '#2449c2' } },
  },
  images: ['public/icon.svg'],
})

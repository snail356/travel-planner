import { createApp } from 'vue'
import 'leaflet/dist/leaflet.css'
import '@fortawesome/fontawesome-svg-core/styles.css'
import { config } from '@fortawesome/fontawesome-svg-core'
import './styles/main.css'
import App from './App.vue'

// 樣式已由上方 import 載入，不需要執行期再注入
config.autoAddCss = false

createApp(App).mount('#app')

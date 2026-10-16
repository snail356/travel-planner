import { defineConfig, loadEnv, type Plugin } from 'vite'
import vue from '@vitejs/plugin-vue'
import { VitePWA } from 'vite-plugin-pwa'

// 本機開發時模擬 Vercel Functions：/api/<name> → api/<name>.ts 匯出的 GET / POST
// 部署到 Vercel 後由平台直接執行 api/ 目錄，這個 plugin 不會被用到。
function vercelApiDev(): Plugin {
  return {
    name: 'vercel-api-dev',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (!req.url?.startsWith('/api/')) return next()
        const url = new URL(req.url, 'http://localhost')
        const name = url.pathname.slice('/api/'.length).replace(/\/$/, '')
        if (!/^[\w-]+$/.test(name)) return next()

        try {
          const mod = await server.ssrLoadModule(`/api/${name}.ts`)
          const method = req.method ?? 'GET'
          const handler = mod[method] as ((r: Request) => Promise<Response> | Response) | undefined
          if (!handler) {
            res.statusCode = 405
            return res.end()
          }

          const headers = new Headers()
          for (const [k, v] of Object.entries(req.headers)) {
            if (typeof v === 'string') headers.set(k, v)
          }
          const chunks: Buffer[] = []
          for await (const chunk of req) chunks.push(chunk as Buffer)
          const hasBody = method !== 'GET' && method !== 'HEAD'

          // 使用者中斷（關頁、重新整理對話）時通知 API，例如停止 AI 回覆，比照部署環境
          const abort = new AbortController()
          res.on('close', () => {
            if (!res.writableFinished) abort.abort()
          })

          const response = await handler(
            new Request(url, {
              method,
              headers,
              body: hasBody ? Buffer.concat(chunks) : undefined,
              signal: abort.signal,
            }),
          )
          res.statusCode = response.status
          response.headers.forEach((v, k) => res.setHeader(k, v))
          // 逐段轉送，串流回應（例如 /api/chat）才會即時出現在畫面上
          if (response.body) {
            const reader = response.body.getReader()
            for (;;) {
              const { done, value } = await reader.read()
              if (done || abort.signal.aborted) break
              res.write(value)
            }
          }
          res.end()
        } catch (err) {
          next(err)
        }
      })
    },
  }
}

// PWA：可加到主畫面，離線時仍能看行程、地圖與照片（看過的才有快取）
// AI 對話是 POST，不會被快取，離線時無法使用
function pwa() {
  const days = (n: number) => n * 24 * 60 * 60
  return VitePWA({
    registerType: 'autoUpdate',
    includeAssets: ['favicon.ico', 'apple-touch-icon-180x180.png', 'icon.svg'],
    manifest: {
      name: '香港三天兩夜',
      short_name: '香港行程',
      description: '香港三天兩夜行程、地圖、打卡與行前須知',
      lang: 'zh-Hant',
      theme_color: '#2449c2',
      background_color: '#ffffff',
      display: 'standalone',
      start_url: '/',
      icons: [
        { src: 'pwa-64x64.png', sizes: '64x64', type: 'image/png' },
        { src: 'pwa-192x192.png', sizes: '192x192', type: 'image/png' },
        { src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png' },
        { src: 'maskable-icon-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
      ],
    },
    workbox: {
      navigateFallbackDenylist: [/^\/api\//],
      runtimeCaching: [
        // 行程與匯率：優先抓最新，離線時用上次的資料
        {
          urlPattern: ({ url }) => url.pathname === '/api/trip' || url.pathname === '/api/rate',
          handler: 'NetworkFirst',
          options: { cacheName: 'api', networkTimeoutSeconds: 5, expiration: { maxAgeSeconds: days(30) } },
        },
        {
          urlPattern: ({ url }) => url.origin === 'https://fonts.googleapis.com' || url.origin === 'https://fonts.gstatic.com',
          handler: 'CacheFirst',
          options: {
            cacheName: 'fonts',
            expiration: { maxEntries: 30, maxAgeSeconds: days(365) },
            cacheableResponse: { statuses: [0, 200] },
          },
        },
        // 地圖圖磚與景點照片：看過的留著，離線也能顯示
        {
          urlPattern: ({ url }) =>
            url.hostname === 'server.arcgisonline.com' || url.hostname.endsWith('tile.openstreetmap.org'),
          handler: 'CacheFirst',
          options: {
            cacheName: 'map-tiles',
            expiration: { maxEntries: 800, maxAgeSeconds: days(30) },
            cacheableResponse: { statuses: [0, 200] },
          },
        },
        {
          urlPattern: ({ url }) => url.hostname.endsWith('wikimedia.org'),
          handler: 'CacheFirst',
          options: {
            cacheName: 'photos',
            expiration: { maxEntries: 100, maxAgeSeconds: days(30) },
            cacheableResponse: { statuses: [0, 200] },
          },
        },
      ],
    },
  })
}

export default defineConfig(({ mode }) => {
  // 讓 api/ 在本機也讀得到 .env（例如 ANTHROPIC_API_KEY）
  Object.assign(process.env, loadEnv(mode, process.cwd(), ''))
  return {
    plugins: [vue(), vercelApiDev(), pwa()],
    server: { port: 5180 },
  }
})

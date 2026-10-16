import { defineConfig, loadEnv, type Plugin } from 'vite'
import vue from '@vitejs/plugin-vue'

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

export default defineConfig(({ mode }) => {
  // 讓 api/ 在本機也讀得到 .env（例如 ANTHROPIC_API_KEY）
  Object.assign(process.env, loadEnv(mode, process.cwd(), ''))
  return {
    plugins: [vue(), vercelApiDev()],
    server: { port: 5180 },
  }
})

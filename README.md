# Travel Planner（旅行規劃）

目前收錄行程：香港三天兩夜（含地圖、美食、住宿、交通、打卡、AI 助理雛形）。

Vue 3 + Vite + TypeScript，部署目標 Vercel。

```bash
npm install
npm run dev      # http://localhost:5180（含 /api 模擬）
npm run build    # 型別檢查 + 打包
```

## 目錄

```
api/                 Vercel Functions（部署後自動成為 /api/*）
  trip.ts            GET  /api/trip?id=      行程資料
  chat.ts            POST /api/chat          AI 助理（目前為示範回覆）
server/              只在伺服器端執行的邏輯
  tripRepository.ts  資料存取層（之後換資料庫只改這裡）
  seed/hongkong.ts   目前的行程資料
shared/types.ts      前後端共用型別（Trip / Stop / Chat…）
src/
  services/api.ts    前端呼叫 API
  composables/useTrip.ts  全站狀態（選取站點、Day 篩選）
  components/        各區塊元件（地圖、列表、詳細面板、AI 對話框…）
Hongkong.html        原始 HTML 雛形（參考用）
```

本機開發時，`vite.config.ts` 的 `vercelApiDev` plugin 會把 `/api/<name>` 轉給 `api/<name>.ts`，
不需要安裝 Vercel CLI；部署後由 Vercel 直接執行 `api/`。

## 是否需要後端？

| 需求 | 純前端（靜態） | 需要後端 |
|---|---|---|
| 展示行程、地圖 | ✅ 夠用 | |
| 線上編輯／新增行程、多個行程 | | ✅ 需要資料庫 + API |
| AI 助理 | | ✅ **必須**：API Key 不能放前端 |

**結論**：需要「輕量後端」，但**不用另外架伺服器**。
用 Vercel Functions（`api/` 目錄）即可，與前端同一個專案、同一次部署。

資料儲存規劃：

1. **現在**：資料寫在 `server/seed/`，透過 `/api/trip` 提供。
2. **要能編輯時**：接 Vercel Marketplace 上的 Postgres（Neon）或 Supabase，
   只改 `server/tripRepository.ts`，新增 `POST/PUT /api/trip`。
3. 圖片：Vercel Blob 或 Supabase Storage，存網址到 `Stop.imageUrl`。

## AI 助理規劃

已預留：

- 前端 `ChatWidget.vue`：浮動對話框，會一併送出「目前正在看的站點」(`focusStopId`)。
- 後端 `api/chat.ts`：
  - `buildSystemPrompt()` 已把行程資料整理成 AI 的背景知識。
  - 型別 `ChatResponse.highlightStopIds` 預留給「AI 回答後在地圖上標示站點」。

串接步驟：

1. 複製 `.env.example` 為 `.env`，填入 `ANTHROPIC_API_KEY`；Vercel 上在 Project Settings → Environment Variables 設定。
2. 安裝 SDK，在 `api/chat.ts` 的 TODO 處呼叫模型（system = `buildSystemPrompt(...)`）。
3. 進階：用 tool use 讓 AI 查站點、調整行程、回傳要標示的站點；改為串流回覆。

## 打卡集點

- `src/composables/useCheckins.ts`：打卡紀錄存在瀏覽器 localStorage（key：`checkins:<tripId>`），離線可用。
- 之後有登入時，可加 `/api/checkins` 同步到資料庫。

## RWD / PWA 準備

- 斷點：≤1024 平板、≤800 手機（底部 tab bar、地圖在列表上方、詳情改為底部抽屜）、≤420 小手機。
- 已加 `viewport-fit=cover`、`theme-color`，底部元件有預留 iPhone 安全區域（`env(safe-area-inset-bottom)`）。
- 轉 PWA 時：加 `vite-plugin-pwa`（manifest、icon、service worker 快取地圖圖磚與 `/api/trip`）。

## 部署到 Vercel

1. 推到 GitHub → Vercel「Import Project」，會自動偵測為 Vite 專案（Build: `npm run build`，Output: `dist`）。
2. `api/` 會自動部署為 Functions，不需額外設定。
3. 設定環境變數（串接 AI 時）。

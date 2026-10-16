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
  chat.ts            POST /api/chat          AI 助理（NDJSON 串流）
server/              只在伺服器端執行的邏輯
  tripRepository.ts  資料存取層（之後換資料庫只改這裡）
  ai/                AI 助理：共用 prompt 與工具、Cursor 版、Claude 版
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

## AI 助理

回答行程問題，回覆以串流逐字顯示，提到的站點會標示在地圖上。支援兩種供應商，用 `.env` 的 `AGENT_PROVIDER` 切換：

| | `cursor`（預設） | `anthropic` |
|---|---|---|
| 金鑰 | `CURSOR_API_KEY`（Cursor Dashboard → API Keys） | `ANTHROPIC_API_KEY`（Claude Console → API Keys） |
| 計費 | Cursor 方案的用量 | 另外儲值，依 token 計費 |
| 預設模型 | `composer-2.5`（`CURSOR_MODEL`） | `claude-opus-5-5`，effort `low`（`ANTHROPIC_MODEL`） |
| 工具迴圈 | 由 Cursor 執行 | 自己控制 |

**啟用**

1. 複製 `.env.example` 為 `.env`，填入金鑰。
2. `npm run check-key` 確認金鑰與模型可用（只查詢資訊，不產生用量）。
3. 重新啟動 `npm run dev`（`.env` 的值在啟動時載入；移除某個值也要重啟才會生效）。

選定的供應商沒有金鑰時自動改用示範回覆，畫面與流程相同。部署到 Vercel 時，在 Project Settings → Environment Variables 設定同樣的變數。

**架構**

| 檔案 | 內容 |
|---|---|
| `api/chat.ts` | 驗證請求（對話最多 20 則、每則 2000 字），回傳 NDJSON 串流 |
| `server/ai/index.ts` | 依 `AGENT_PROVIDER` 選擇供應商、示範回覆、錯誤訊息 |
| `server/ai/prompt.ts` | 共用的規則、行程資料、`highlight_stops` 工具 |
| `server/ai/cursor.ts` | Cursor SDK 版（參考 demo 專案的 `cursor-agent.ts`） |
| `server/ai/anthropic.ts` | Claude API 版 |
| `shared/types.ts` | 串流事件 `ChatStreamEvent`：`text` / `highlight` / `done` / `error` |
| `src/components/ChatWidget.vue` | 對話框、建議問題、站點標籤（點了打開詳情） |

**Cursor 版的設計**

- 伺服器不保存對話狀態：每次提問建立一個暫時的 agent，把規則、行程資料、先前對話一起送出，回答完即關閉，所以也能跑在 Vercel 的無狀態函式。
- 只開放自訂的 `highlight_stops` 工具；改檔、shell、讀檔等內建工具全部關閉，工作目錄是空的暫存資料夾，並且不載入本機的 Cursor 規則與設定。
- SDK 的資料寫在暫存資料夾（`CURSOR_DATA_DIR`），不會弄亂本機的 `~/.cursor`；在 Vercel 上也只會寫入 `/tmp`。
- 規則放在每次訊息的開頭（不使用需另外開通的自訂 system prompt），Cursor 原本的系統提示仍然存在。
- 每次提問都要建立 agent，回覆開始前會多等幾秒。
- 實測 `@cursor/sdk` 1.0.35：回答完會送出 `turn-ended`，但 run 不會結束，約 35～60 秒後 agent 會自行重答。因此收到第一個 `turn-ended` 就視為答完並取消 run；另設 90 秒逾時，前端也有 100 秒逾時，避免傳送鍵卡住。
- 呼叫工具前的短過場句（例如「查詢工具用法…」）會以 `reset` 事件從畫面清掉。

**Claude 版的設計**

- 行程資料放在 system prompt 並啟用快取，同一份行程重複提問時輸入成本較低（log 會印出 `cache_read`）。
- 使用者正在看的站點以對話中的 system 訊息帶入，不影響快取。
- 已開啟 `fallbacks: "default"`：若模型的安全機制拒答，API 會自動改用建議的備援模型重跑。

**上線前建議**

- 金鑰只在伺服器端，前端拿不到。
- 網站公開後每位訪客的提問都會用到你的額度：Cursor 請確認方案條款允許這種用法；Claude 請在 Console 設定每月花費上限。
- 這是公開端點，正式上線可加 IP 速率限制（例如 Vercel Firewall 或 Upstash Ratelimit）。
- Cursor SDK 在 Vercel 上的執行情況尚未實際部署驗證。

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

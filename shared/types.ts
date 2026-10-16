// 前後端共用的資料型別。之後換成資料庫時，以這裡為 schema 依據。

export type DayNo = 1 | 2 | 3
export type StopType = 'food' | 'spot'

export interface Stop {
  id: number
  name: string
  type: StopType
  day: DayNo
  /** 新台幣；無則不顯示 */
  price?: number
  /** 是否使用 FunPASS */
  pass?: boolean
  area: string
  lat: number
  lng: number
  desc: string
  hours?: string
  tips?: string
  imageUrl?: string
  /** 使用他人授權照片時的標示（例如 CC BY-SA 需註明作者與授權） */
  imageCredit?: ImageCredit
  /** 行程備註，例如「搭船跨海至尖沙咀」 */
  note?: string
}

/** 一天中的一個時段（例如「上午／午餐」），stopIds 為造訪順序 */
export interface DaySlot {
  label: string
  stopIds: number[]
}

/** 每天的動線安排：主題、依序的時段，以及收尾說明（例如前往機場） */
export interface DayPlan {
  day: DayNo
  title: string
  slots: DaySlot[]
  endNote?: string
}

export interface ImageCredit {
  author: string
  license: string
  /** 照片來源頁面 */
  sourceUrl: string
  /** 補充說明，例如「示意圖」（非該店實拍）或「中環分店」 */
  note?: string
}

/** 行程中的固定地點（非景點／餐廳），例如住宿、機場 */
export type PlaceKind = 'hotel' | 'airport'

export interface Place {
  id: string
  kind: PlaceKind
  name: string
  area: string
  lat: number
  lng: number
  desc: string
  address?: string
}

export interface Hotel {
  name: string
  nights: number
  price: number
  address?: string
  station?: string
  note?: string
  imageUrl?: string
}

/** 交通圖示代碼，前端對應到 Font Awesome 圖示（見 src/icons.ts） */
export type TransportIcon = 'plane' | 'ticket' | 'tram' | 'subway' | 'bus' | 'ferry' | 'taxi' | 'walk'

export interface TransportInfo {
  icon: TransportIcon
  title: string
  summary: string
  items: string[]
}

export interface CostItem {
  label: string
  amount: number
  unit?: string
}

export interface Trip {
  id: string
  title: string
  subtitle: string
  days: number
  nights: number
  avgCostPerPerson: number
  hotel: Hotel
  transports: TransportInfo[]
  costs: CostItem[]
  stops: Stop[]
  places: Place[]
  /** 動線：站點的天數與順序以這裡為準 */
  dayPlans: DayPlan[]
  /** 行前須知（簽證、票券、交通等） */
  guides: Guide[]
}

// ---- 行前須知 ----

/** 行前須知的圖示代碼，前端對應到 Font Awesome 圖示（見 src/icons.ts） */
export type GuideIcon = 'passport' | 'ticket' | 'transit' | 'currency'

/** GET /api/rate：港幣對新台幣參考匯率 */
export interface ExchangeRate {
  /** 1 HKD 可換多少 TWD */
  rate: number
  /** 匯率資料的更新時間（ISO 字串） */
  updatedAt: string
  /** 取得線上匯率失敗、改用內建備用值時為 true */
  fallback: boolean
  source: string
  sourceUrl: string
}

export interface GuideItem {
  /** 小標，例如「台胞證」 */
  label: string
  text: string
  /** 條列細項（例如預約規定的各點） */
  points?: string[]
}

export interface Guide {
  id: string
  icon: GuideIcon
  title: string
  /** 卡片上顯示的重點（2～3 點） */
  highlights: string[]
  /** 抽屜中的完整說明 */
  items: GuideItem[]
  /** 官方資訊來源 */
  sourceUrl?: string
}

// ---- AI 助理 ----

export interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}

export interface ChatRequest {
  tripId: string
  messages: ChatMessage[]
  /** 使用者目前在看的站點，可讓 AI 回答「這間店…」之類的問題 */
  focusStopId?: number
}

/**
 * /api/chat 以串流回傳，每行一個 JSON（NDJSON）：
 * - text：回覆文字片段，依序接起來就是完整回覆
 * - reset：清除目前已顯示的回覆文字（例如呼叫工具前的過場說明）
 * - highlight：AI 要在地圖上標示的站點
 * - done：回覆結束（mock 表示 AI 尚未串接，為示範回覆）
 * - error：發生錯誤，message 可直接顯示給使用者
 */
export type ChatStreamEvent =
  | { type: 'text'; delta: string }
  | { type: 'reset' }
  | { type: 'highlight'; stopIds: number[] }
  | { type: 'done'; mock?: boolean }
  | { type: 'error'; message: string }

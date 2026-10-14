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
}

export interface ImageCredit {
  author: string
  license: string
  /** 照片來源頁面 */
  sourceUrl: string
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

export interface ChatResponse {
  reply: string
  /** AI 建議在地圖上標示的站點 id（之後可用來聯動地圖） */
  highlightStopIds?: number[]
  mock?: boolean
}

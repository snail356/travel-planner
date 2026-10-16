import type { ChatMessage, ChatStreamEvent, Trip } from '../../shared/types.js'

export type Emit = (event: ChatStreamEvent) => void

export interface ChatRunOptions {
  trip: Trip
  /** 以使用者問題結尾的對話 */
  history: ChatMessage[]
  focusStopId?: number
  signal: AbortSignal
  emit: Emit
}

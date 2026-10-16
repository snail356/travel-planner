import type { ChatRequest, ChatStreamEvent, ExchangeRate, Trip } from '../../shared/types'

async function request<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, init)
  if (!res.ok) throw new Error(`${init?.method ?? 'GET'} ${url} 失敗（${res.status}）`)
  return res.json() as Promise<T>
}

export function fetchRate(): Promise<ExchangeRate> {
  return request<ExchangeRate>('/api/rate')
}

export function fetchTrip(id?: string): Promise<Trip> {
  return request<Trip>(id ? `/api/trip?id=${encodeURIComponent(id)}` : '/api/trip')
}

/** 傳送問題並逐一處理串流事件（每行一個 JSON） */
export async function streamChat(
  body: ChatRequest,
  onEvent: (event: ChatStreamEvent) => void,
  signal?: AbortSignal,
): Promise<void> {
  const res = await fetch('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
    signal,
  })
  if (!res.ok || !res.body) throw new Error(`AI 助理暫時無法使用（${res.status}）`)

  const reader = res.body.pipeThrough(new TextDecoderStream()).getReader()
  let buffer = ''
  for (;;) {
    const { done, value } = await reader.read()
    if (done) break
    buffer += value
    const lines = buffer.split('\n')
    buffer = lines.pop() ?? ''
    for (const line of lines) {
      if (line.trim()) onEvent(JSON.parse(line) as ChatStreamEvent)
    }
  }
  if (buffer.trim()) onEvent(JSON.parse(buffer) as ChatStreamEvent)
}

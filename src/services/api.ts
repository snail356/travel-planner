import type { ChatRequest, ChatResponse, Trip } from '../../shared/types'

async function request<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, init)
  if (!res.ok) throw new Error(`${init?.method ?? 'GET'} ${url} 失敗（${res.status}）`)
  return res.json() as Promise<T>
}

export function fetchTrip(id?: string): Promise<Trip> {
  return request<Trip>(id ? `/api/trip?id=${encodeURIComponent(id)}` : '/api/trip')
}

export function sendChat(body: ChatRequest): Promise<ChatResponse> {
  return request<ChatResponse>('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
}

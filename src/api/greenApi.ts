import type { Credentials, Notification, SendMessageResponse } from './types'

export const DEFAULT_API_URL = 'https://api.green-api.com'

export class ApiError extends Error {
  readonly status: number

  constructor(status: number, message: string) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

function buildUrl(c: Credentials, method: string, ...tail: (string | number)[]) {
  const base = (c.apiUrl || DEFAULT_API_URL).replace(/\/+$/, '')
  const path = [method, c.apiTokenInstance, ...tail].map(encodeURIComponent).join('/')
  return `${base}/waInstance${encodeURIComponent(c.idInstance)}/${path}`
}

async function request<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, init)
  if (!res.ok) throw new ApiError(res.status, `GREEN-API: HTTP ${res.status}`)
  // Пустая очередь уведомлений приходит как `null` — JSON.parse справится, а .json() на пустом теле упадёт.
  const text = await res.text()
  return (text ? JSON.parse(text) : null) as T
}

export function sendMessage(c: Credentials, chatId: string, message: string, signal?: AbortSignal) {
  return request<SendMessageResponse>(buildUrl(c, 'sendMessage'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chatId, message }),
    signal,
  })
}

/** Long polling: сервер держит соединение до `receiveTimeout` секунд. Пустая очередь → null. */
export function receiveNotification(c: Credentials, signal?: AbortSignal, receiveTimeout = 5) {
  return request<Notification | null>(`${buildUrl(c, 'receiveNotification')}?receiveTimeout=${receiveTimeout}`, {
    signal,
  })
}

export function deleteNotification(c: Credentials, receiptId: number) {
  return request<{ result: boolean }>(buildUrl(c, 'deleteNotification', receiptId), { method: 'DELETE' })
}

/** Проверка ключей: getSettings вернёт 200 только для валидной пары id/token. */
export function checkCredentials(c: Credentials, signal?: AbortSignal) {
  return request<unknown>(buildUrl(c, 'getSettings'), { signal })
}

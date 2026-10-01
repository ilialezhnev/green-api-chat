import type { Credentials, InstanceSettings, Notification, SendMessageResponse } from './types'

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

const REQUEST_TIMEOUT = 15_000

/** Every request has a timeout, otherwise a hung server would block the send button forever. */
async function request<T>(
  url: string,
  init: RequestInit = {},
  timeout = REQUEST_TIMEOUT,
): Promise<T> {
  const timeoutSignal = AbortSignal.timeout(timeout)
  const signal = init.signal ? AbortSignal.any([init.signal, timeoutSignal]) : timeoutSignal
  const res = await fetch(url, { ...init, signal })
  if (!res.ok) throw new ApiError(res.status, `GREEN-API: HTTP ${res.status}`)
  // An empty notification queue arrives as `null` — JSON.parse handles it, while .json() throws on an empty body.
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

/** Long polling: the server holds the connection for up to `receiveTimeout` seconds. Empty queue → null. */
export function receiveNotification(c: Credentials, signal?: AbortSignal, receiveTimeout = 5) {
  return request<Notification | null>(
    `${buildUrl(c, 'receiveNotification')}?receiveTimeout=${receiveTimeout}`,
    { signal },
    // The server may hold the connection for receiveTimeout seconds — the client timeout must be longer.
    REQUEST_TIMEOUT + receiveTimeout * 1000,
  )
}

export function deleteNotification(c: Credentials, receiptId: number) {
  return request<{ result: boolean }>(buildUrl(c, 'deleteNotification', receiptId), {
    method: 'DELETE',
  })
}

export function getSettings(c: Credentials, signal?: AbortSignal) {
  return request<InstanceSettings>(buildUrl(c, 'getSettings'), { signal })
}

/** Credentials check: getSettings returns 200 only for a valid id/token pair. */
export const checkCredentials = getSettings

/** Partial update: only the passed keys change. The instance applies them with a delay of a few minutes. */
export function setSettings(c: Credentials, settings: InstanceSettings, signal?: AbortSignal) {
  return request<{ saveSettings: boolean }>(buildUrl(c, 'setSettings'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(settings),
    signal,
  })
}

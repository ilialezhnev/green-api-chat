import { useEffect, useRef, useState, type Dispatch } from 'react'
import type { Action } from '@/entities/chat'
import {
  deleteNotification,
  isAuthError,
  receiveNotification,
  type Credentials,
} from '@/shared/api'
import { notificationToAction } from '@/features/receive-messages/lib/notifications'

/** Minimum pause between requests when the queue is empty: the server may respond immediately instead of waiting for receiveTimeout. */
const POLL_INTERVAL = 1_000
const MIN_DELAY = 1_000
const MAX_DELAY = 30_000

/** Waits `ms`, but wakes up immediately if polling is stopped. */
function sleep(ms: number, signal: AbortSignal) {
  return new Promise<void>((resolve) => {
    const timer = setTimeout(resolve, ms)
    signal.addEventListener('abort', () => (clearTimeout(timer), resolve()), { once: true })
  })
}

/**
 * Polls the GREEN-API queue in a loop: receive → dispatch → delete.
 * An empty queue is polled once per second; if notifications are waiting, they are drained back to back without pauses.
 * Does nothing while `credentials` is null. Changing credentials or unmounting aborts the loop via AbortController.
 * Returns `connectionLost`, true while requests are failing. On a network error it backs off exponentially; on 401/403 it stops and reports via `onAuthError`.
 */
export function useNotificationPolling(
  credentials: Credentials | null,
  dispatch: Dispatch<Action>,
  onAuthError?: () => void,
) {
  // Callbacks are kept in a ref so changing them doesn't restart polling.
  const latest = useRef({ dispatch, onAuthError })
  useEffect(() => {
    latest.current = { dispatch, onAuthError }
  })

  const [connectionLost, setConnectionLost] = useState(false)
  const { idInstance, apiTokenInstance, apiUrl } = credentials ?? {}

  useEffect(() => {
    if (!idInstance || !apiTokenInstance) return
    const creds: Credentials = { idInstance, apiTokenInstance, apiUrl: apiUrl ?? '' }
    const controller = new AbortController()
    const { signal } = controller

    async function loop() {
      let delay = MIN_DELAY
      while (!signal.aborted) {
        try {
          const notification = await receiveNotification(creds, signal)
          if (signal.aborted) return
          delay = MIN_DELAY
          setConnectionLost(false)
          if (!notification) {
            await sleep(POLL_INTERVAL, signal)
            continue
          }

          const action = notificationToAction(notification)
          if (action) latest.current.dispatch(action)
          // Always delete, even if the message isn't for us — otherwise the queue gets stuck on it.
          await deleteNotification(creds, notification.receiptId)
        } catch (error) {
          if (signal.aborted) return
          if (isAuthError(error)) {
            latest.current.onAuthError?.()
            return
          }
          setConnectionLost(true)
          await sleep(delay, signal)
          delay = Math.min(delay * 2, MAX_DELAY)
        }
      }
    }

    void loop()
    return () => controller.abort()
  }, [idInstance, apiTokenInstance, apiUrl])

  return { connectionLost }
}

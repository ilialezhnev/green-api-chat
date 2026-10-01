import type { Action, Message } from '@/entities/chat'
import type { Notification } from '@/shared/api'

const DIRECTIONS: Record<string, Message['direction'] | undefined> = {
  incomingMessageReceived: 'in',
  outgoingMessageReceived: 'out',
  outgoingAPIMessageReceived: 'out',
}

const phoneOf = (s: { senderPhoneNumber?: number }) => (s.senderPhoneNumber ? String(s.senderPhoneNumber) : undefined)

/**
 * Turns a GREEN-API notification into a reducer action.
 * Returns null for anything that isn't a text message (statuses, media) —
 * such notifications must still be deleted from the queue, but they don't reach the chat.
 */
export function notificationToAction({ receiptId, body }: Notification): Action | null {
  // outgoing*: messages sent by the instance owner (from the phone or via API), including "Saved Messages".
  const direction = DIRECTIONS[body.typeWebhook]
  if (!direction) return null
  const { senderData, messageData } = body
  if (!senderData || !messageData) return null

  const text = messageData.textMessageData?.textMessage ?? messageData.extendedTextMessageData?.text
  if (!text) return null

  return {
    type: 'receiveMessage',
    chatId: senderData.chatId,
    // For outgoing messages senderName is ourselves, so the contact's name comes from chatName.
    senderName: (direction === 'in' ? senderData.senderName : undefined) || senderData.chatName,
    phone: direction === 'in' ? phoneOf(senderData) : /^\d+@c\.us$/.test(senderData.chatId) ? senderData.chatId.split('@')[0] : undefined,
    message: {
      // idMessage is stable across re-deliveries — the reducer's idempotency relies on it.
      id: body.idMessage ?? String(receiptId),
      text,
      direction,
      timestamp: (body.timestamp ?? Date.now() / 1000) * 1000,
    },
  }
}

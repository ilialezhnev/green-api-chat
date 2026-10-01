import type { ChatState, Message } from './types'

export const initialState: ChatState = { chats: {}, order: [], activeId: null }

export type Action =
  | { type: 'createChat'; chatId: string; phone: string }
  | { type: 'selectChat'; chatId: string }
  | { type: 'addOutgoing'; chatId: string; message: Message }
  | {
      type: 'receiveMessage'
      chatId: string
      senderName?: string
      phone?: string
      message: Message
    }

function findChatKey(state: ChatState, chatId: string, phone?: string) {
  if (state.chats[chatId]) return chatId
  const byPhone = phone && `${phone}@c.us`
  if (byPhone && state.chats[byPhone]) return byPhone
  return state.order.find((k) => state.chats[k].aliasId === chatId)
}

/**
 * The reducer is a pure function, so all the "which chat does this message belong to" logic is testable without React.
 * A queued message (incoming or sent from the phone) is matched to a chat by chatId → phone number → aliasId; otherwise a new chat is created.
 */
export function chatReducer(state: ChatState, action: Action): ChatState {
  switch (action.type) {
    case 'createChat': {
      if (state.chats[action.chatId]) return { ...state, activeId: action.chatId }
      return {
        chats: {
          ...state.chats,
          [action.chatId]: { id: action.chatId, title: `+${action.phone}`, phone: action.phone, messages: [], unread: 0 },
        },
        order: [action.chatId, ...state.order],
        activeId: action.chatId,
      }
    }
    case 'selectChat': {
      const chat = state.chats[action.chatId]
      if (!chat) return state
      return { ...state, activeId: action.chatId, chats: { ...state.chats, [chat.id]: { ...chat, unread: 0 } } }
    }
    case 'addOutgoing': {
      const chat = state.chats[action.chatId]
      if (!chat) return state
      // The notification for our own message can arrive before sendMessage resolves.
      if (chat.messages.some((m) => m.id === action.message.id)) return state
      return {
        ...state,
        chats: { ...state.chats, [chat.id]: { ...chat, messages: [...chat.messages, action.message] } },
        order: [chat.id, ...state.order.filter((k) => k !== chat.id)],
      }
    }
    case 'receiveMessage': {
      const key = findChatKey(state, action.chatId, action.phone) ?? action.chatId
      const existing = state.chats[key]
      // Idempotency: re-delivery of the same notification must not duplicate the message.
      if (existing?.messages.some((m) => m.id === action.message.id)) return state
      const base = existing ?? {
        id: key,
        title: action.senderName ?? action.chatId,
        phone: action.phone,
        messages: [],
        unread: 0,
      }
      const chat = {
        ...base,
        aliasId: existing && key !== action.chatId ? action.chatId : base.aliasId,
        title: existing?.phone ? base.title : (action.senderName ?? base.title),
        messages: [...base.messages, action.message],
        unread: state.activeId === key || action.message.direction === 'out' ? 0 : base.unread + 1,
      }
      return {
        ...state,
        chats: { ...state.chats, [key]: chat },
        order: [key, ...state.order.filter((k) => k !== key)],
      }
    }
  }
}

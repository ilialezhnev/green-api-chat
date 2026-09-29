export interface Message {
  id: string
  text: string
  direction: 'in' | 'out'
  timestamp: number
}

export interface Chat {
  /** Ключ чата: chatId, под которым мы отправляем (79876543210@c.us). */
  id: string
  title: string
  /** Числовой id Telegram из входящих уведомлений — по нему сопоставляем ответы с чатом. */
  aliasId?: string
  phone?: string
  messages: Message[]
  unread: number
}

export interface ChatState {
  chats: Record<string, Chat>
  order: string[]
  activeId: string | null
}

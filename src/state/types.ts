export interface Message {
  id: string
  text: string
  direction: 'in' | 'out'
  timestamp: number
}

export interface Chat {
  /** Chat key: the chatId we send to (79876543210@c.us). */
  id: string
  title: string
  /** Numeric Telegram id from incoming notifications — used to match replies to the chat. */
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

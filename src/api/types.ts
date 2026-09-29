export interface Credentials {
  idInstance: string
  apiTokenInstance: string
  /** Хост инстанса из консоли GREEN-API, например https://7103.api.green-api.com */
  apiUrl: string
}

export interface SendMessageResponse {
  idMessage: string
}

/** Уведомление из очереди ReceiveNotification (нас интересует только входящий текст). */
export interface Notification {
  receiptId: number
  body: {
    typeWebhook: string
    idMessage?: string
    timestamp?: number
    senderData?: {
      chatId: string
      chatName?: string
      senderName?: string
      senderPhoneNumber?: number
    }
    messageData?: {
      typeMessage: string
      textMessageData?: { textMessage: string }
      extendedTextMessageData?: { text: string }
    }
  }
}

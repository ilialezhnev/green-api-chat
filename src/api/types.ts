export interface Credentials {
  idInstance: string
  apiTokenInstance: string
  /** Instance host from the GREEN-API console, e.g. https://7103.api.green-api.com */
  apiUrl: string
}

export interface SendMessageResponse {
  idMessage: string
}

/** Notification from the ReceiveNotification queue (only text messages matter to us). */
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

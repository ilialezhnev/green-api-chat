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

export type Toggle = 'yes' | 'no'

/** Instance settings the app reads and writes (getSettings returns more fields; we never touch them). */
export interface InstanceSettings {
  /** When set, notifications go to this URL instead of the ReceiveNotification queue. */
  webhookUrl?: string
  incomingWebhook?: Toggle
  outgoingMessageWebhook?: Toggle
  outgoingAPIMessageWebhook?: Toggle
}

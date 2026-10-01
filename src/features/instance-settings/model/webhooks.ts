import type { InstanceSettings, Toggle } from '@/shared/api';

export type WebhookKey = 'incomingWebhook' | 'outgoingMessageWebhook' | 'outgoingAPIMessageWebhook';

/** The webhooks the chat needs to see messages; every other instance webhook is irrelevant to it. */
export const WEBHOOKS: { key: WebhookKey; label: string; hint: string }[] = [
  { key: 'incomingWebhook', label: 'Входящие сообщения', hint: 'Ответы собеседников' },
  {
    key: 'outgoingMessageWebhook',
    label: 'Отправленные с телефона',
    hint: 'Сообщения, написанные в Telegram на телефоне, в том числе в «Избранное»',
  },
  {
    key: 'outgoingAPIMessageWebhook',
    label: 'Отправленные через API',
    hint: 'Сообщения из этого приложения (дубли отсекаются автоматически)',
  },
];

export type WebhookState = Record<WebhookKey, boolean>;

export const toWebhookState = (settings: InstanceSettings): WebhookState => ({
  incomingWebhook: settings.incomingWebhook === 'yes',
  outgoingMessageWebhook: settings.outgoingMessageWebhook === 'yes',
  outgoingAPIMessageWebhook: settings.outgoingAPIMessageWebhook === 'yes',
});

/** The payload for setSettings: only the toggles that differ from what the instance currently has. */
export function changedWebhooks(original: WebhookState, draft: WebhookState): InstanceSettings {
  const changes: InstanceSettings = {};

  for (const { key } of WEBHOOKS) {
    if (original[key] !== draft[key]) {
      changes[key] = (draft[key] ? 'yes' : 'no') satisfies Toggle;
    }
  }

  return changes;
}

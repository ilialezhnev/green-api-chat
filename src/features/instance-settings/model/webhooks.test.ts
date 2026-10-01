import { changedWebhooks, toWebhookState } from './webhooks';

describe('webhooks', () => {
  it('reads yes/no from instance settings, treating missing keys as off', () => {
    expect(toWebhookState({ incomingWebhook: 'yes', outgoingMessageWebhook: 'no' })).toEqual({
      incomingWebhook: true,
      outgoingMessageWebhook: false,
      outgoingAPIMessageWebhook: false,
    });
  });

  it('sends only the toggles that changed', () => {
    const original = toWebhookState({
      incomingWebhook: 'yes',
      outgoingMessageWebhook: 'no',
      outgoingAPIMessageWebhook: 'no',
    });

    expect(changedWebhooks(original, original)).toEqual({});

    expect(
      changedWebhooks(original, {
        ...original,
        incomingWebhook: false,
        outgoingMessageWebhook: true,
      }),
    ).toEqual({
      incomingWebhook: 'no',
      outgoingMessageWebhook: 'yes',
    });
  });
});

import { act, renderHook } from '@testing-library/react';
import {
  ApiError,
  deleteNotification,
  receiveNotification,
  type Credentials,
  type Notification,
} from '@/shared/api';
import { useNotificationPolling } from './useNotificationPolling';

vi.mock('@/shared/api', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@/shared/api')>()),
  receiveNotification: vi.fn(),
  deleteNotification: vi.fn(),
}));

const credentials: Credentials = { idInstance: '1', apiTokenInstance: 't', apiUrl: '' };

const incomingText = (receiptId: number, text: string): Notification => ({
  receiptId,
  body: {
    typeWebhook: 'incomingMessageReceived',
    idMessage: `m${receiptId}`,
    senderData: { chatId: '79876543210@c.us', senderName: 'Bob' },
    messageData: { typeMessage: 'textMessage', textMessageData: { textMessage: text } },
  },
});

const statusNotification = (receiptId: number): Notification => ({
  receiptId,
  body: { typeWebhook: 'outgoingMessageStatus' },
});

/** Moves the fake clock forward and lets the polling loop and React state updates settle. */
const tick = (ms: number) => act(() => vi.advanceTimersByTimeAsync(ms));

beforeEach(() => {
  vi.useFakeTimers();
  vi.mocked(receiveNotification).mockReset().mockResolvedValue(null);
  vi.mocked(deleteNotification).mockReset().mockResolvedValue({ result: true });
});

afterEach(() => {
  vi.useRealTimers();
});

describe('useNotificationPolling', () => {
  it('dispatches incoming text and deletes every notification, including non-text ones', async () => {
    vi.mocked(receiveNotification)
      .mockResolvedValueOnce(incomingText(1, 'привет'))
      .mockResolvedValueOnce(statusNotification(2));

    const dispatch = vi.fn();

    renderHook(() => useNotificationPolling(credentials, dispatch));
    await tick(10);

    expect(dispatch).toHaveBeenCalledOnce();

    expect(dispatch).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'receiveMessage',
        message: expect.objectContaining({ text: 'привет' }),
      }),
    );

    expect(deleteNotification).toHaveBeenNthCalledWith(1, credentials, 1);
    expect(deleteNotification).toHaveBeenNthCalledWith(2, credentials, 2);
  });

  it('drains a non-empty queue without pauses and waits a second when it is empty', async () => {
    vi.mocked(receiveNotification)
      .mockResolvedValueOnce(incomingText(1, 'a'))
      .mockResolvedValueOnce(incomingText(2, 'b'));

    renderHook(() => useNotificationPolling(credentials, vi.fn()));
    await tick(10);

    // Two notifications and the first empty response, all without waiting.
    expect(receiveNotification).toHaveBeenCalledTimes(3);

    await tick(900);
    expect(receiveNotification).toHaveBeenCalledTimes(3);

    await tick(200);
    expect(receiveNotification).toHaveBeenCalledTimes(4);
  });

  it('backs off exponentially on errors, flags the lost connection and recovers', async () => {
    vi.mocked(receiveNotification)
      .mockRejectedValueOnce(new TypeError('Failed to fetch'))
      .mockRejectedValueOnce(new TypeError('Failed to fetch'));

    const { result } = renderHook(() => useNotificationPolling(credentials, vi.fn()));

    expect(result.current.connectionLost).toBe(false);

    await tick(10);
    expect(receiveNotification).toHaveBeenCalledTimes(1);
    expect(result.current.connectionLost).toBe(true);

    await tick(1000); // 1s pause, then the second failure
    expect(receiveNotification).toHaveBeenCalledTimes(2);
    expect(result.current.connectionLost).toBe(true);

    await tick(1900); // the pause is now 2s, so no request yet
    expect(receiveNotification).toHaveBeenCalledTimes(2);

    await tick(200);
    expect(receiveNotification).toHaveBeenCalledTimes(3);
    expect(result.current.connectionLost).toBe(false);
  });

  it('stops and reports an auth error on 401', async () => {
    vi.mocked(receiveNotification).mockRejectedValue(new ApiError(401, ''));
    const onAuthError = vi.fn();

    renderHook(() => useNotificationPolling(credentials, vi.fn(), onAuthError));
    await tick(60_000);

    expect(onAuthError).toHaveBeenCalledOnce();
    expect(receiveNotification).toHaveBeenCalledOnce();
  });

  it('does nothing without credentials', async () => {
    renderHook(() => useNotificationPolling(null, vi.fn()));
    await tick(5000);

    expect(receiveNotification).not.toHaveBeenCalled();
  });

  it('aborts the loop on unmount', async () => {
    const { unmount } = renderHook(() => useNotificationPolling(credentials, vi.fn()));

    await tick(10);

    const signal = vi.mocked(receiveNotification).mock.calls[0][1];

    unmount();
    await tick(5000);

    expect(signal?.aborted).toBe(true);
    expect(receiveNotification).toHaveBeenCalledOnce();
  });

  it('restarts with the new credentials', async () => {
    const { rerender } = renderHook(({ creds }) => useNotificationPolling(creds, vi.fn()), {
      initialProps: { creds: credentials },
    });

    await tick(10);
    rerender({ creds: { ...credentials, idInstance: '2' } });
    await tick(10);

    expect(vi.mocked(receiveNotification).mock.calls[0][1]?.aborted).toBe(true);

    expect(receiveNotification).toHaveBeenLastCalledWith(
      expect.objectContaining({ idInstance: '2' }),
      expect.anything(),
    );
  });
});

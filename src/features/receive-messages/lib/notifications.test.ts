import { notificationToAction } from './notifications';
import type { Notification } from '@/shared/api';

const incoming = (over: Partial<Notification['body']> = {}): Notification => ({
  receiptId: 7,
  body: {
    typeWebhook: 'incomingMessageReceived',
    idMessage: 'ABC',
    timestamp: 100,
    senderData: { chatId: '555', senderName: 'Bob', senderPhoneNumber: 79876543210 },
    messageData: { typeMessage: 'textMessage', textMessageData: { textMessage: 'привет' } },
    ...over,
  },
});

describe('notificationToAction', () => {
  it('преобразует входящий текст', () => {
    expect(notificationToAction(incoming())).toEqual({
      type: 'receiveMessage',
      chatId: '555',
      senderName: 'Bob',
      phone: '79876543210',
      message: { id: 'ABC', text: 'привет', direction: 'in', timestamp: 100_000 },
    });
  });

  it('понимает extendedTextMessage', () => {
    const n = incoming({
      messageData: {
        typeMessage: 'extendedTextMessage',
        extendedTextMessageData: { text: 'ссылка' },
      },
    });

    expect(notificationToAction(n)).toMatchObject({ message: { text: 'ссылка' } });
  });

  it('превращает сообщение, отправленное с телефона, в исходящее', () => {
    const n = incoming({
      typeWebhook: 'outgoingMessageReceived',
      senderData: { chatId: '79876543210@c.us', chatName: 'Bob', senderName: 'Я' },
    });

    expect(notificationToAction(n)).toMatchObject({
      chatId: '79876543210@c.us',
      senderName: 'Bob',
      phone: '79876543210',
      message: { direction: 'out' },
    });
  });

  it('игнорирует не входящие сообщения и не текст', () => {
    expect(notificationToAction(incoming({ typeWebhook: 'outgoingMessageStatus' }))).toBeNull();

    expect(
      notificationToAction(incoming({ messageData: { typeMessage: 'imageMessage' } })),
    ).toBeNull();
  });
});

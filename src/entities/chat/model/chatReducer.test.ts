import { chatReducer, initialState } from './chatReducer'
import type { Message } from './types'

const msg = (id: string, direction: Message['direction'] = 'in'): Message => ({ id, text: id, direction, timestamp: 1 })

describe('chatReducer', () => {
  const created = chatReducer(initialState, { type: 'createChat', chatId: '79876543210@c.us', phone: '79876543210' })

  it('создаёт чат и делает его активным', () => {
    expect(created.activeId).toBe('79876543210@c.us')
    expect(created.order).toEqual(['79876543210@c.us'])
  })

  it('сопоставляет ответ с числовым id с чатом по номеру телефона', () => {
    const s = chatReducer(created, { type: 'receiveMessage', chatId: '10000000', phone: '79876543210', message: msg('a') })
    expect(s.order).toHaveLength(1)
    expect(s.chats['79876543210@c.us'].aliasId).toBe('10000000')
    expect(s.chats['79876543210@c.us'].messages).toHaveLength(1)
  })

  it('не дублирует сообщение при повторной доставке', () => {
    const a = { type: 'receiveMessage', chatId: '79876543210@c.us', message: msg('a') } as const
    expect(chatReducer(chatReducer(created, a), a).chats['79876543210@c.us'].messages).toHaveLength(1)
  })

  it('считает непрочитанные для неактивного чата', () => {
    const other = chatReducer(created, { type: 'receiveMessage', chatId: '555', senderName: 'Bob', message: msg('b') })
    expect(other.chats['555'].unread).toBe(1)
    expect(chatReducer(other, { type: 'selectChat', chatId: '555' }).chats['555'].unread).toBe(0)
  })

  it('не считает исходящее непрочитанным и не дублирует своё же сообщение', () => {
    const out = msg('o', 'out')
    const s = chatReducer(created, { type: 'receiveMessage', chatId: '555', message: out })
    expect(s.chats['555'].unread).toBe(0)
    const sent = chatReducer(created, { type: 'addOutgoing', chatId: '79876543210@c.us', message: out })
    const again = chatReducer(sent, { type: 'addOutgoing', chatId: '79876543210@c.us', message: out })
    expect(again.chats['79876543210@c.us'].messages).toHaveLength(1)
  })
})

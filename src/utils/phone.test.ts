import { phoneToChatId } from './phone'

describe('phoneToChatId', () => {
  it('убирает форматирование и добавляет суффикс', () => {
    expect(phoneToChatId('+7 (987) 654-32-10')).toBe('79876543210@c.us')
  })
  it('отклоняет буквы и слишком короткие номера', () => {
    expect(phoneToChatId('abc')).toBeNull()
    expect(phoneToChatId('12345')).toBeNull()
  })
})

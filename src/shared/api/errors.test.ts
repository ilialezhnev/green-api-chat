import { describeError, isAuthError } from './errors'
import { ApiError } from './greenApi'

describe('describeError', () => {
  it('различает типы ответа API', () => {
    expect(describeError(new ApiError(401, ''))).toMatch(/Неверные/)
    expect(describeError(new ApiError(400, ''))).toMatch(/номер/)
    expect(describeError(new ApiError(429, ''))).toMatch(/Слишком много/)
    expect(describeError(new ApiError(466, ''))).toMatch(/лимит/)
    expect(describeError(new ApiError(503, ''))).toMatch(/недоступен/)
    expect(describeError(new ApiError(418, ''))).toMatch(/HTTP 418/)
  })
  it('обрабатывает сеть, таймаут и битый JSON', () => {
    expect(describeError(new TypeError('Failed to fetch'))).toMatch(/Нет связи/)
    expect(describeError(new DOMException('', 'TimeoutError'))).toMatch(/долго/)
    expect(describeError(new SyntaxError())).toMatch(/некорректный/)
    expect(describeError('что угодно')).toMatch(/Что-то пошло не так/)
  })
  it('isAuthError узнаёт только 401/403', () => {
    expect(isAuthError(new ApiError(403, ''))).toBe(true)
    expect(isAuthError(new ApiError(500, ''))).toBe(false)
    expect(isAuthError(new TypeError())).toBe(false)
  })
})

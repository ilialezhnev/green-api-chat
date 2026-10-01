import { ApiError, checkCredentials, receiveNotification, sendMessage } from './greenApi'

const creds = { idInstance: '123', apiTokenInstance: 'tok/en', apiUrl: 'https://example.test/' }

function mockFetch(response: Partial<Response> & { text?: () => Promise<string> }) {
  const fn = vi.fn().mockResolvedValue({ ok: true, text: async () => '', ...response })
  vi.stubGlobal('fetch', fn)
  return fn
}

afterEach(() => vi.unstubAllGlobals())

describe('greenApi', () => {
  it('строит URL с экранированием и без двойного слэша', async () => {
    const fetchMock = mockFetch({ text: async () => '{"idMessage":"1"}' })
    await sendMessage(creds, '79876543210@c.us', 'hi')
    const [url, init] = fetchMock.mock.calls[0]
    expect(url).toBe('https://example.test/waInstance123/sendMessage/tok%2Fen')
    expect(JSON.parse(init.body)).toEqual({ chatId: '79876543210@c.us', message: 'hi' })
  })

  it('пустое тело (пустая очередь) превращает в null', async () => {
    mockFetch({ text: async () => '' })
    await expect(receiveNotification(creds)).resolves.toBeNull()
  })

  it('кидает ApiError с кодом на не-2xx', async () => {
    mockFetch({ ok: false, status: 401 })
    await expect(checkCredentials(creds)).rejects.toMatchObject({ name: 'ApiError', status: 401 })
    await expect(checkCredentials(creds)).rejects.toBeInstanceOf(ApiError)
  })
})

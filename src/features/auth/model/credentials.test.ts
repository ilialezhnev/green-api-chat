import { validateCredentials } from './credentials'

const ok = { idInstance: '7103', apiTokenInstance: 'abc123', apiUrl: '' }

describe('validateCredentials', () => {
  it('принимает корректные данные, API URL необязателен', () => {
    expect(validateCredentials(ok)).toEqual({})
    expect(validateCredentials({ ...ok, apiUrl: 'https://7103.api.green-api.com' })).toEqual({})
  })
  it('находит ошибки по полям', () => {
    expect(
      validateCredentials({ idInstance: '71a', apiTokenInstance: '', apiUrl: 'ftp://x' }),
    ).toEqual({
      idInstance: expect.any(String),
      apiTokenInstance: expect.any(String),
      apiUrl: expect.any(String),
    })
    expect(validateCredentials({ ...ok, apiTokenInstance: 'a b' }).apiTokenInstance).toMatch(
      /пробел/,
    )
    expect(validateCredentials({ ...ok, apiUrl: 'green-api.com' }).apiUrl).toBeDefined()
  })
})

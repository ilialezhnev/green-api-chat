import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ApiError, checkCredentials } from '@/shared/api'
import { LoginForm } from './LoginForm'

vi.mock('@/shared/api', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@/shared/api')>()),
  checkCredentials: vi.fn(),
}))

async function fill(id: string, token: string) {
  await userEvent.type(screen.getByLabelText('idInstance'), id)
  await userEvent.type(screen.getByLabelText('apiTokenInstance'), token)
  await userEvent.click(screen.getByText('Войти'))
}

describe('LoginForm', () => {
  it('не обращается к сети при невалидных полях', async () => {
    render(<LoginForm onLogin={vi.fn()} />)
    await fill('12ab', 'tok')
    expect(screen.getByText('idInstance состоит только из цифр')).toBeInTheDocument()
    expect(checkCredentials).not.toHaveBeenCalled()
  })

  it('передаёт ключи наверх после успешной проверки', async () => {
    vi.mocked(checkCredentials).mockResolvedValue({})
    const onLogin = vi.fn()
    render(<LoginForm onLogin={onLogin} />)
    await fill('7103', ' tok ')
    expect(onLogin).toHaveBeenCalledWith({
      idInstance: '7103',
      apiTokenInstance: 'tok',
      apiUrl: '',
    })
  })

  it('показывает понятную ошибку для неверных ключей и для сети', async () => {
    const onLogin = vi.fn()
    render(<LoginForm onLogin={onLogin} />)
    vi.mocked(checkCredentials).mockRejectedValueOnce(new ApiError(401, ''))
    await fill('7103', 'tok')
    expect(await screen.findByRole('alert')).toHaveTextContent('Неверные idInstance')

    vi.mocked(checkCredentials).mockRejectedValueOnce(new TypeError('Failed to fetch'))
    await userEvent.click(screen.getByText('Войти'))
    expect(await screen.findByText(/Нет связи с сервером/)).toBeInTheDocument()
    expect(onLogin).not.toHaveBeenCalled()
  })
})

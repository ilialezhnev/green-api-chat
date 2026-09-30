import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useReducer } from 'react'
import { ChatContext } from '../state/chatContext'
import { chatReducer, initialState } from '../state/chatReducer'
import { ChatWindow } from './ChatWindow'

vi.mock('../api/greenApi', async (importOriginal) => ({ ...(await importOriginal<typeof import('../api/greenApi')>()), sendMessage: vi.fn() }))
import { ApiError, sendMessage } from '../api/greenApi'

const credentials = { idInstance: '1', apiTokenInstance: 't', apiUrl: '' }

function Harness() {
  const [state, dispatch] = useReducer(chatReducer, initialState, (s) =>
    chatReducer(s, { type: 'createChat', chatId: '79876543210@c.us', phone: '79876543210' }),
  )
  return (
    <ChatContext value={{ state, dispatch }}>
      <ChatWindow credentials={credentials} />
    </ChatContext>
  )
}

describe('ChatWindow', () => {
  it('отправляет сообщение и показывает его в чате', async () => {
    vi.mocked(sendMessage).mockResolvedValue({ idMessage: 'm1' })
    render(<Harness />)
    await userEvent.type(screen.getByLabelText('Сообщение'), 'привет')
    await userEvent.click(screen.getByLabelText('Отправить'))
    expect(sendMessage).toHaveBeenCalledWith(credentials, '79876543210@c.us', 'привет')
    expect(await screen.findByText('привет')).toBeInTheDocument()
  })

  it('показывает ошибку и сохраняет текст, если отправка не удалась', async () => {
    vi.mocked(sendMessage).mockRejectedValue(new Error('fail'))
    render(<Harness />)
    await userEvent.type(screen.getByLabelText('Сообщение'), 'привет')
    await userEvent.click(screen.getByLabelText('Отправить'))
    expect(await screen.findByRole('alert')).toBeInTheDocument()
    expect(screen.getByLabelText('Сообщение')).toHaveValue('привет')
  })

  it('показывает счётчик и блокирует отправку при превышении лимита', async () => {
    render(<Harness />)
    const input = screen.getByLabelText('Сообщение')
    expect(screen.getByText('0/256')).toBeInTheDocument()
    expect(screen.getByLabelText('Отправить')).toBeDisabled()

    await userEvent.click(input)
    await userEvent.paste('а'.repeat(257))
    expect(screen.getByText('257/256')).toBeInTheDocument()
    expect(screen.getByRole('status')).toHaveTextContent('Максимум 256 символов')
    expect(screen.getByLabelText('Отправить')).toBeDisabled()
  })

  it('не даёт отправить HTML и скрипты', async () => {
    render(<Harness />)
    await userEvent.type(screen.getByLabelText('Сообщение'), 'a{Shift>}<{/Shift}script>')
    expect(screen.getByRole('status')).toHaveTextContent('HTML-теги')
    expect(screen.getByLabelText('Отправить')).toBeDisabled()
  })

  it('показывает причину ошибки API', async () => {
    vi.mocked(sendMessage).mockRejectedValue(new ApiError(466, ''))
    render(<Harness />)
    await userEvent.type(screen.getByLabelText('Сообщение'), 'привет')
    await userEvent.click(screen.getByLabelText('Отправить'))
    expect(await screen.findByRole('alert')).toHaveTextContent(/лимит тарифа/)
  })
})

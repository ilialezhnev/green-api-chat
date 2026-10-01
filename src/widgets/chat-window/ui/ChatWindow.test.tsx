import { render, screen } from '@testing-library/react'
import { useReducer } from 'react'
import { ChatContext, chatReducer, initialState } from '@/entities/chat'
import { ChatWindow } from './ChatWindow'

const credentials = { idInstance: '1', apiTokenInstance: 't', apiUrl: '' }

function Harness({ withMessage }: { withMessage?: boolean }) {
  const [state, dispatch] = useReducer(chatReducer, initialState, (s) => {
    if (!withMessage) return s
    const chat = chatReducer(s, {
      type: 'createChat',
      chatId: '79876543210@c.us',
      phone: '79876543210',
    })
    return chatReducer(chat, {
      type: 'receiveMessage',
      chatId: '79876543210@c.us',
      message: { id: 'a', text: 'здравствуйте', direction: 'in', timestamp: 0 },
    })
  })
  return (
    <ChatContext value={{ state, dispatch }}>
      <ChatWindow credentials={credentials} />
    </ChatContext>
  )
}

describe('ChatWindow', () => {
  it('просит выбрать чат, если ни один не открыт', () => {
    render(<Harness />)
    expect(screen.getByText('Выберите чат или начните новый')).toBeInTheDocument()
    expect(screen.queryByLabelText('Сообщение')).not.toBeInTheDocument()
  })

  it('показывает заголовок, сообщения и поле ввода открытого чата', () => {
    render(<Harness withMessage />)
    expect(screen.getByText('+79876543210')).toBeInTheDocument()
    expect(screen.getByText('здравствуйте')).toBeInTheDocument()
    expect(screen.getByLabelText('Сообщение')).toBeInTheDocument()
  })
})

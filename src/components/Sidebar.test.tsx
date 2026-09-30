import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useReducer } from 'react'
import { ChatContext } from '../state/chatContext'
import { chatReducer, initialState } from '../state/chatReducer'
import { Sidebar } from './Sidebar'

function Harness() {
  const [state, dispatch] = useReducer(chatReducer, initialState)
  return (
    <ChatContext value={{ state, dispatch }}>
      <Sidebar onLogout={() => {}} />
      <output>{state.order.join(',')}</output>
    </ChatContext>
  )
}

async function openForm() {
  await userEvent.click(screen.getByLabelText('Новый чат'))
  return screen.getByLabelText('Номер телефона')
}

describe('Sidebar: новый чат', () => {
  it('форматирует номер по маске и пропускает только цифры', async () => {
    render(<Harness />)
    const input = await openForm()
    await userEvent.type(input, '7abc987654-32 10')
    expect(input).toHaveValue('7 987 654-32-10')
  })

  it('обрезает лишние цифры и понимает вставку с 8', async () => {
    render(<Harness />)
    const input = await openForm()
    await userEvent.click(input)
    await userEvent.paste('8 (987) 654-32-10 555')
    expect(input).toHaveValue('7 987 654-32-10')
  })

  it('не создаёт чат с неполным номером и объясняет почему', async () => {
    render(<Harness />)
    await userEvent.type(await openForm(), '7987')
    await userEvent.click(screen.getByText('Начать чат'))
    expect(screen.getByRole('alert')).toHaveTextContent('Проверьте корректность ввода номера')
    expect(screen.getByRole('status')).toBeEmptyDOMElement()
  })

  it('создаёт чат по полному номеру и очищает форму', async () => {
    render(<Harness />)
    await userEvent.type(await openForm(), '79876543210')
    await userEvent.click(screen.getByText('Начать чат'))
    expect(screen.getByRole('status')).toHaveTextContent('79876543210@c.us')
    expect(screen.queryByLabelText('Номер телефона')).not.toBeInTheDocument()
  })
})

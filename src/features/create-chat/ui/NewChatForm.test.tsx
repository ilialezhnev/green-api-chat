import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useReducer } from 'react';
import { ChatContext, chatReducer, initialState } from '@/entities/chat';
import { NewChatForm } from './NewChatForm';

const onCreated = vi.fn();
const onCancel = vi.fn();

function Harness() {
  const [state, dispatch] = useReducer(chatReducer, initialState);

  return (
    <ChatContext value={{ state, dispatch }}>
      <NewChatForm onCreated={onCreated} onCancel={onCancel} />
      <output>{state.order.join(',')}</output>
    </ChatContext>
  );
}

const phoneInput = () => screen.getByLabelText('Номер телефона');

beforeEach(() => {
  onCreated.mockClear();
  onCancel.mockClear();
});

describe('NewChatForm', () => {
  it('форматирует номер по маске и пропускает только цифры', async () => {
    render(<Harness />);
    await userEvent.type(phoneInput(), '7abc987654-32 10');
    expect(phoneInput()).toHaveValue('7 987 654-32-10');
  });

  it('обрезает лишние цифры и понимает вставку с 8', async () => {
    render(<Harness />);
    await userEvent.click(phoneInput());
    await userEvent.paste('8 (987) 654-32-10 555');
    expect(phoneInput()).toHaveValue('7 987 654-32-10');
  });

  it('не создаёт чат с неполным номером и объясняет почему', async () => {
    render(<Harness />);
    await userEvent.type(phoneInput(), '7987');
    await userEvent.click(screen.getByText('Начать чат'));
    expect(screen.getByRole('alert')).toHaveTextContent('Проверьте корректность ввода номера');
    expect(screen.getByRole('status')).toBeEmptyDOMElement();
    expect(onCreated).not.toHaveBeenCalled();
  });

  it('создаёт чат по полному номеру и сообщает об этом наверх', async () => {
    render(<Harness />);
    await userEvent.type(phoneInput(), '79876543210');
    await userEvent.click(screen.getByText('Начать чат'));
    expect(screen.getByRole('status')).toHaveTextContent('79876543210@c.us');
    expect(onCreated).toHaveBeenCalledOnce();
  });

  it('отменяет создание кнопкой с крестиком, не создавая чат', async () => {
    render(<Harness />);

    await userEvent.type(phoneInput(), '79876543210');
    await userEvent.click(screen.getByLabelText('Отменить создание чата'));

    expect(onCancel).toHaveBeenCalledOnce();
    expect(onCreated).not.toHaveBeenCalled();
    expect(screen.getByRole('status')).toBeEmptyDOMElement();
  });
});

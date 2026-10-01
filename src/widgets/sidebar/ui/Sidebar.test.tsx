import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useReducer } from 'react';
import { ChatContext, chatReducer, initialState } from '@/entities/chat';
import { Sidebar } from './Sidebar';

const credentials = { idInstance: '1', apiTokenInstance: 't', apiUrl: '' };

function Harness() {
  const [state, dispatch] = useReducer(chatReducer, initialState, (s) => {
    const first = chatReducer(s, {
      type: 'createChat',
      chatId: '79876543210@c.us',
      phone: '79876543210',
    });
    const second = chatReducer(first, {
      type: 'createChat',
      chatId: '79001112233@c.us',
      phone: '79001112233',
    });

    return chatReducer(second, { type: 'closeChat' });
  });

  return (
    <ChatContext value={{ state, dispatch }}>
      <Sidebar credentials={credentials} onLogout={() => {}} />
    </ChatContext>
  );
}

const sidebar = () => screen.getByRole('complementary');

describe('Sidebar', () => {
  it('показывает все чаты и полный список, пока чат не открыт', () => {
    render(<Harness />);

    expect(screen.getByText('+79876543210')).toBeInTheDocument();
    expect(screen.getByText('+79001112233')).toBeInTheDocument();
    expect(sidebar()).toHaveAttribute('data-compact', 'false');
  });

  it('переходит в компактный режим, когда открыт чат', async () => {
    render(<Harness />);

    await userEvent.click(screen.getByText('+79876543210'));

    expect(sidebar()).toHaveAttribute('data-compact', 'true');
  });

  it('фильтрует чаты поиском', async () => {
    render(<Harness />);

    await userEvent.type(screen.getByPlaceholderText('Поиск'), '9001');

    expect(screen.queryByText('+79876543210')).not.toBeInTheDocument();
    expect(screen.getByText('+79001112233')).toBeInTheDocument();
  });

  it('закрывает форму нового чата при выборе чата', async () => {
    render(<Harness />);

    await userEvent.click(screen.getByLabelText('Новый чат'));
    expect(screen.getByLabelText('Номер телефона')).toBeInTheDocument();

    await userEvent.click(screen.getByText('+79876543210'));
    expect(screen.queryByLabelText('Номер телефона')).not.toBeInTheDocument();
  });

  it('закрывает форму нового чата кнопкой отмены', async () => {
    render(<Harness />);

    await userEvent.click(screen.getByLabelText('Новый чат'));
    await userEvent.click(screen.getByLabelText('Отменить создание чата'));

    expect(screen.queryByLabelText('Номер телефона')).not.toBeInTheDocument();
  });
});

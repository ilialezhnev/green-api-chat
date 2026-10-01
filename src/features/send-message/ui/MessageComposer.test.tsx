import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useReducer } from 'react';
import { ChatContext, chatReducer, initialState } from '@/entities/chat';
import { ApiError, sendMessage } from '@/shared/api';
import { MessageComposer } from './MessageComposer';

vi.mock('@/shared/api', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@/shared/api')>()),
  sendMessage: vi.fn(),
}));

const credentials = { idInstance: '1', apiTokenInstance: 't', apiUrl: '' };
const CHAT_ID = '79876543210@c.us';

function Harness() {
  const [state, dispatch] = useReducer(chatReducer, initialState, (s) =>
    chatReducer(s, { type: 'createChat', chatId: CHAT_ID, phone: '79876543210' }),
  );

  return (
    <ChatContext value={{ state, dispatch }}>
      <MessageComposer chatId={CHAT_ID} credentials={credentials} />
      <output>{state.chats[CHAT_ID].messages.map((m) => m.text).join('|')}</output>
    </ChatContext>
  );
}

const input = () => screen.getByLabelText('Сообщение');
const sendButton = () => screen.getByLabelText('Отправить');

describe('MessageComposer', () => {
  it('отправляет сообщение, добавляет его в чат и очищает поле', async () => {
    vi.mocked(sendMessage).mockResolvedValue({ idMessage: 'm1' });
    render(<Harness />);
    await userEvent.type(input(), 'привет');
    await userEvent.click(sendButton());
    expect(sendMessage).toHaveBeenCalledWith(credentials, CHAT_ID, 'привет');
    expect(await screen.findByText('привет', { selector: 'output' })).toBeInTheDocument();
    expect(input()).toHaveValue('');
  });

  it('показывает ошибку и сохраняет текст, если отправка не удалась', async () => {
    vi.mocked(sendMessage).mockRejectedValue(new Error('fail'));
    render(<Harness />);
    await userEvent.type(input(), 'привет');
    await userEvent.click(sendButton());
    expect(await screen.findByRole('alert')).toBeInTheDocument();
    expect(input()).toHaveValue('привет');
  });

  it('показывает счётчик и блокирует отправку при превышении лимита', async () => {
    render(<Harness />);
    expect(screen.getByText('0/256')).toBeInTheDocument();
    expect(sendButton()).toBeDisabled();

    await userEvent.click(input());
    await userEvent.paste('а'.repeat(257));
    expect(screen.getByText('257/256')).toBeInTheDocument();
    expect(screen.getByText('Максимум 256 символов')).toBeInTheDocument();
    expect(sendButton()).toBeDisabled();
  });

  it('не даёт отправить HTML и скрипты', async () => {
    render(<Harness />);
    await userEvent.type(input(), 'a{Shift>}<{/Shift}script>');
    expect(screen.getByText(/HTML-теги/)).toBeInTheDocument();
    expect(sendButton()).toBeDisabled();
  });

  it('показывает причину ошибки API', async () => {
    vi.mocked(sendMessage).mockRejectedValue(new ApiError(466, ''));
    render(<Harness />);
    await userEvent.type(input(), 'привет');
    await userEvent.click(sendButton());
    expect(await screen.findByRole('alert')).toHaveTextContent(/лимит тарифа/);
  });
});

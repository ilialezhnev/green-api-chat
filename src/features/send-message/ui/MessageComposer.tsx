import { useState, type FormEvent } from 'react';
import { useChat } from '@/entities/chat';
import { describeError, sendMessage, type Credentials } from '@/shared/api';
import {
  MAX_MESSAGE_LENGTH,
  messageLength,
  sanitizeMessage,
  validateMessage,
} from '@/features/send-message/lib/message';
import styles from './MessageComposer.module.css';

export function MessageComposer({
  chatId,
  credentials,
}: {
  chatId: string;
  credentials: Credentials;
}) {
  const { dispatch } = useChat();
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const length = messageLength(text);
  // An empty field isn't an error, just a disabled button; every other reason is shown as the user types.
  const validationError = text.trim() ? validateMessage(text) : null;
  const canSend = !sending && text.trim() !== '' && validationError === null;

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();

    if (!canSend) {
      return;
    }

    const message = sanitizeMessage(text);

    setSending(true);
    setError('');

    try {
      const { idMessage } = await sendMessage(credentials, chatId, message);

      dispatch({
        type: 'addOutgoing',
        chatId,
        message: { id: idMessage, text: message, direction: 'out', timestamp: Date.now() },
      });

      setText('');
    } catch (err) {
      setError(`Не удалось отправить: ${describeError(err)}`);
    } finally {
      setSending(false);
    }
  }

  return (
    <>
      {error && (
        <p className={styles.error} role="alert">
          {error}
        </p>
      )}
      <form className={styles.composer} onSubmit={handleSubmit}>
        <div className={styles.field}>
          <input
            value={text}
            onChange={(e) => {
              setText(e.target.value);
              setError('');
            }}
            placeholder="Сообщение"
            aria-label="Сообщение"
            aria-invalid={validationError !== null}
            autoFocus
          />
          <div className={styles.hint}>
            <span className={styles.validation} role="status">
              {validationError}
            </span>
            <span data-over={length > MAX_MESSAGE_LENGTH}>
              {length}/{MAX_MESSAGE_LENGTH}
            </span>
          </div>
        </div>
        <button disabled={!canSend} aria-label="Отправить">
          ➤
        </button>
      </form>
    </>
  );
}

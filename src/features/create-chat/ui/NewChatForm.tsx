import { useState, type FormEvent } from 'react';
import { useChat } from '@/entities/chat';
import {
  formatPhone,
  normalizePhone,
  phoneToChatId,
  validatePhone,
} from '@/features/create-chat/lib/phone';
import styles from './NewChatForm.module.css';

interface NewChatFormProps {
  onCreated: () => void;
  onCancel: () => void;
}

export function NewChatForm({ onCreated, onCancel }: NewChatFormProps) {
  const { dispatch } = useChat();
  const [phone, setPhone] = useState('');
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const chatId = phoneToChatId(phone);

    if (!chatId) {
      return setError(validatePhone(phone));
    }

    dispatch({ type: 'createChat', chatId, phone: normalizePhone(phone) });
    onCreated();
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <input
        value={phone}
        onChange={(e) => {
          setPhone(formatPhone(e.target.value));
          setError(null);
        }}
        placeholder="7 987 654-32-10"
        aria-label="Номер телефона"
        inputMode="tel"
        autoFocus
        aria-invalid={error !== null}
      />
      {error && (
        <span className={styles.error} role="alert">
          {error}
        </span>
      )}
      <div className={styles.actions}>
        <button className={styles.submit}>Начать чат</button>
        <button
          type="button"
          className={styles.cancel}
          onClick={onCancel}
          aria-label="Отменить создание чата"
          title="Отменить"
        >
          ✕
        </button>
      </div>
    </form>
  );
}

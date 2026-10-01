import { useEffect, useRef } from 'react';
import { Avatar, useChat } from '@/entities/chat';
import { MessageComposer } from '@/features/send-message';
import type { Credentials } from '@/shared/api';
import { formatTime } from '@/shared/lib';
import styles from './ChatWindow.module.css';

export function ChatWindow({ credentials }: { credentials: Credentials }) {
  const { state, dispatch } = useChat();
  const chat = state.activeId ? state.chats[state.activeId] : null;
  const endRef = useRef<HTMLDivElement>(null);
  const messageCount = chat?.messages.length;

  useEffect(() => {
    endRef.current?.scrollIntoView?.({ block: 'end' });
  }, [chat?.id, messageCount]);

  if (!chat) {
    return <main className={styles.placeholder}>Выберите чат или начните новый</main>;
  }

  return (
    <main className={styles.window}>
      <header className={styles.header}>
        <button
          className={styles.back}
          onClick={() => dispatch({ type: 'closeChat' })}
          aria-label="Назад к списку чатов"
        >
          ←
        </button>
        <Avatar name={chat.title} />
        <b>{chat.title}</b>
      </header>

      <div className={styles.messages}>
        {chat.messages.map((m) => (
          <div key={m.id} className={styles.bubble} data-direction={m.direction}>
            <span>{m.text}</span>
            <time>{formatTime(m.timestamp)}</time>
          </div>
        ))}
        <div ref={endRef} />
      </div>

      <MessageComposer chatId={chat.id} credentials={credentials} />
    </main>
  );
}

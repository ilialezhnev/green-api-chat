import { useChat } from '@/entities/chat';
import { useNotificationPolling } from '@/features/receive-messages';
import type { Credentials } from '@/shared/api';
import { ChatWindow } from '@/widgets/chat-window';
import { Sidebar } from '@/widgets/sidebar';
import styles from './Messenger.module.css';

interface MessengerProps {
  credentials: Credentials;
  onLogout: () => void;
  onAuthError: () => void;
}

export function Messenger({ credentials, onLogout, onAuthError }: MessengerProps) {
  const { dispatch } = useChat();
  const { connectionLost } = useNotificationPolling(credentials, dispatch, onAuthError);

  return (
    <div className={styles.layout}>
      <Sidebar credentials={credentials} onLogout={onLogout} />
      <ChatWindow credentials={credentials} />
      {connectionLost && (
        <div className={styles.banner} role="status">
          Нет связи с GREEN-API. Повторяем попытку — новые сообщения могут прийти с задержкой.
        </div>
      )}
    </div>
  );
}

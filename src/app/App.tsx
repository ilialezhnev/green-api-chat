import { useState } from 'react';
import { ChatProvider, useChat } from '@/entities/chat';
import { LoginForm, clearCredentials, loadCredentials, saveCredentials } from '@/features/auth';
import { useNotificationPolling } from '@/features/receive-messages';
import type { Credentials } from '@/shared/api';
import { ChatWindow } from '@/widgets/chat-window';
import { Sidebar } from '@/widgets/sidebar';
import styles from './App.module.css';

function Messenger({
  credentials,
  onLogout,
  onAuthError,
}: {
  credentials: Credentials;
  onLogout: () => void;
  onAuthError: () => void;
}) {
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

export default function App() {
  const [credentials, setCredentials] = useState(loadCredentials);
  const [notice, setNotice] = useState('');

  function login(next: Credentials) {
    saveCredentials(next);
    setNotice('');
    setCredentials(next);
  }

  function logout(message = '') {
    clearCredentials();
    setNotice(message);
    setCredentials(null);
  }

  if (!credentials) {
    return <LoginForm onLogin={login} notice={notice} />;
  }

  return (
    <ChatProvider>
      <Messenger
        credentials={credentials}
        onLogout={() => logout()}
        onAuthError={() => logout('GREEN-API отклонил ключи. Войдите заново.')}
      />
    </ChatProvider>
  );
}

import { useState } from 'react';
import { ChatProvider } from '@/entities/chat';
import { LoginForm, clearCredentials, loadCredentials, saveCredentials } from '@/features/auth';
import type { Credentials } from '@/shared/api';
import { Messenger } from './Messenger';

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

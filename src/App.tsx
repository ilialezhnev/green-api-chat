import { useState } from 'react'
import type { Credentials } from './api/types'
import { ChatWindow } from './components/ChatWindow'
import { LoginForm } from './components/LoginForm'
import { Sidebar } from './components/Sidebar'
import { useNotificationPolling } from './hooks/useNotificationPolling'
import { ChatProvider } from './state/ChatProvider'
import { useChat } from './state/chatContext'
import { clearCredentials, loadCredentials, saveCredentials } from './state/storage'
import styles from './App.module.css'

function Messenger({ credentials, onLogout, onAuthError }: { credentials: Credentials; onLogout: () => void; onAuthError: () => void }) {
  const { dispatch } = useChat()
  const { connectionLost } = useNotificationPolling(credentials, dispatch, onAuthError)

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
  )
}

export default function App() {
  const [credentials, setCredentials] = useState(loadCredentials)
  const [notice, setNotice] = useState('')

  function login(next: Credentials) {
    saveCredentials(next)
    setNotice('')
    setCredentials(next)
  }

  function logout(message = '') {
    clearCredentials()
    setNotice(message)
    setCredentials(null)
  }

  if (!credentials) return <LoginForm onLogin={login} notice={notice} />

  return (
    <ChatProvider>
      <Messenger
        credentials={credentials}
        onLogout={() => logout()}
        onAuthError={() => logout('GREEN-API отклонил ключи. Войдите заново.')}
      />
    </ChatProvider>
  )
}

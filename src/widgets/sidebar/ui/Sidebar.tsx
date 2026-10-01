import { useState } from 'react'
import { Avatar, useChat } from '@/entities/chat'
import { NewChatForm } from '@/features/create-chat'
import { SettingsDialog } from '@/features/instance-settings'
import type { Credentials } from '@/shared/api'
import { formatTime } from '@/shared/lib'
import styles from './Sidebar.module.css'

export function Sidebar({
  credentials,
  onLogout,
}: {
  credentials: Credentials
  onLogout: () => void
}) {
  const { state, dispatch } = useChat()
  const [query, setQuery] = useState('')
  const [adding, setAdding] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)

  const needle = query.trim().toLowerCase()
  const chats = state.order
    .map((id) => state.chats[id])
    .filter((c) => c.title.toLowerCase().includes(needle))

  return (
    <aside className={styles.sidebar}>
      <header className={styles.header}>
        <input
          className={styles.search}
          placeholder="Поиск"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <button
          className={styles.add}
          onClick={() => setAdding((v) => !v)}
          aria-label="Новый чат"
          title="Новый чат"
        >
          +
        </button>
      </header>

      {adding && <NewChatForm onCreated={() => setAdding(false)} />}

      <ul className={styles.list}>
        {chats.map((chat) => {
          const last = chat.messages.at(-1)
          return (
            <li key={chat.id}>
              <button
                className={styles.item}
                data-active={chat.id === state.activeId}
                onClick={() => dispatch({ type: 'selectChat', chatId: chat.id })}
              >
                <Avatar name={chat.title} />
                <span className={styles.body}>
                  <span className={styles.row}>
                    <b>{chat.title}</b>
                    {last && <time>{formatTime(last.timestamp)}</time>}
                  </span>
                  <span className={styles.row}>
                    <span className={styles.preview}>{last?.text ?? 'Нет сообщений'}</span>
                    {chat.unread > 0 && <span className={styles.badge}>{chat.unread}</span>}
                  </span>
                </span>
              </button>
            </li>
          )
        })}
        {chats.length === 0 && (
          <li className={styles.empty}>
            {needle ? 'Ничего не найдено' : 'Нажмите «+», чтобы начать чат'}
          </li>
        )}
      </ul>

      <footer className={styles.footer}>
        <button
          className={styles.settings}
          onClick={() => setSettingsOpen(true)}
          aria-label="Настройки"
          title="Настройки инстанса"
        >
          ⚙
        </button>
        <button className={styles.logout} onClick={onLogout}>
          Выйти
        </button>
      </footer>
      {settingsOpen && (
        <SettingsDialog credentials={credentials} onClose={() => setSettingsOpen(false)} />
      )}
    </aside>
  )
}

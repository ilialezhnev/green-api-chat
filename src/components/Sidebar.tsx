import { useState, type FormEvent } from 'react'
import type { Credentials } from '../api/types'
import { useChat } from '../state/chatContext'
import { formatPhone, normalizePhone, phoneToChatId, validatePhone } from '../utils/phone'
import { formatTime } from '../utils/time'
import { Avatar } from './Avatar'
import { SettingsDialog } from './SettingsDialog'
import styles from './Sidebar.module.css'

export function Sidebar({ credentials, onLogout }: { credentials: Credentials; onLogout: () => void }) {
  const { state, dispatch } = useChat()
  const [query, setQuery] = useState('')
  const [adding, setAdding] = useState(false)
  const [phone, setPhone] = useState('')
  const [phoneError, setPhoneError] = useState<string | null>(null)
  const [settingsOpen, setSettingsOpen] = useState(false)

  const needle = query.trim().toLowerCase()
  const chats = state.order.map((id) => state.chats[id]).filter((c) => c.title.toLowerCase().includes(needle))

  function handleCreate(e: FormEvent) {
    e.preventDefault()
    const chatId = phoneToChatId(phone)
    if (!chatId) return setPhoneError(validatePhone(phone))
    dispatch({ type: 'createChat', chatId, phone: normalizePhone(phone) })
    setPhone('')
    setPhoneError(null)
    setAdding(false)
  }

  return (
    <aside className={styles.sidebar}>
      <header className={styles.header}>
        <input className={styles.search} placeholder="Поиск" value={query} onChange={(e) => setQuery(e.target.value)} />
        <button className={styles.add} onClick={() => setAdding((v) => !v)} aria-label="Новый чат" title="Новый чат">+</button>
      </header>

      {adding && (
        <form className={styles.newChat} onSubmit={handleCreate}>
          <input
            value={phone}
            onChange={(e) => {
              setPhone(formatPhone(e.target.value))
              setPhoneError(null)
            }}
            placeholder="7 987 654-32-10"
            aria-label="Номер телефона"
            inputMode="tel"
            autoFocus
            aria-invalid={phoneError !== null}
          />
          {phoneError && <span className={styles.error} role="alert">{phoneError}</span>}
          <button>Начать чат</button>
        </form>
      )}

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
        {chats.length === 0 && <li className={styles.empty}>{needle ? 'Ничего не найдено' : 'Нажмите «+», чтобы начать чат'}</li>}
      </ul>

      <footer className={styles.footer}>
        <button className={styles.settings} onClick={() => setSettingsOpen(true)} aria-label="Настройки" title="Настройки инстанса">⚙</button>
        <button className={styles.logout} onClick={onLogout}>Выйти</button>
      </footer>
      {settingsOpen && <SettingsDialog credentials={credentials} onClose={() => setSettingsOpen(false)} />}
    </aside>
  )
}

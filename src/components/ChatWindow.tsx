import { useEffect, useRef, useState, type FormEvent } from 'react'
import { describeError } from '../api/errors'
import { sendMessage } from '../api/greenApi'
import type { Credentials } from '../api/types'
import { useChat } from '../state/chatContext'
import { MAX_MESSAGE_LENGTH, messageLength, sanitizeMessage, validateMessage } from '../utils/message'
import { formatTime } from '../utils/time'
import { Avatar } from './Avatar'
import styles from './ChatWindow.module.css'

export function ChatWindow({ credentials }: { credentials: Credentials }) {
  const { state, dispatch } = useChat()
  const chat = state.activeId ? state.chats[state.activeId] : null
  const [text, setText] = useState('')
  const [sending, setSending] = useState(false)
  const [error, setError] = useState('')
  const endRef = useRef<HTMLDivElement>(null)
  const messageCount = chat?.messages.length
  const length = messageLength(text)
  // An empty field isn't an error, just a disabled button; every other reason is shown as the user types.
  const validationError = text.trim() ? validateMessage(text) : null
  const canSend = !sending && text.trim() !== '' && validationError === null

  useEffect(() => {
    endRef.current?.scrollIntoView?.({ block: 'end' })
  }, [chat?.id, messageCount])

  if (!chat) return <main className={styles.placeholder}>Выберите чат или начните новый</main>

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!chat || !canSend) return
    const message = sanitizeMessage(text)
    setSending(true)
    setError('')
    try {
      const { idMessage } = await sendMessage(credentials, chat.id, message)
      dispatch({
        type: 'addOutgoing',
        chatId: chat.id,
        message: { id: idMessage, text: message, direction: 'out', timestamp: Date.now() },
      })
      setText('')
    } catch (err) {
      setError(`Не удалось отправить: ${describeError(err)}`)
    } finally {
      setSending(false)
    }
  }

  return (
    <main className={styles.window}>
      <header className={styles.header}>
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

      {error && <p className={styles.error} role="alert">{error}</p>}
      <form className={styles.composer} onSubmit={handleSubmit}>
        <div className={styles.field}>
          <input
            value={text}
            onChange={(e) => {
              setText(e.target.value)
              setError('')
            }}
            placeholder="Сообщение"
            aria-label="Сообщение"
            aria-invalid={validationError !== null}
            autoFocus
          />
          <div className={styles.hint}>
            <span className={styles.validation} role="status">{validationError}</span>
            <span data-over={length > MAX_MESSAGE_LENGTH}>{length}/{MAX_MESSAGE_LENGTH}</span>
          </div>
        </div>
        <button disabled={!canSend} aria-label="Отправить">➤</button>
      </form>
    </main>
  )
}

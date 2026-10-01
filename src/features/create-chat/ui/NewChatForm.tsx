import { useState, type FormEvent } from 'react'
import { useChat } from '@/entities/chat'
import { formatPhone, normalizePhone, phoneToChatId, validatePhone } from '@/features/create-chat/lib/phone'
import styles from './NewChatForm.module.css'

export function NewChatForm({ onCreated }: { onCreated: () => void }) {
  const { dispatch } = useChat()
  const [phone, setPhone] = useState('')
  const [error, setError] = useState<string | null>(null)

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    const chatId = phoneToChatId(phone)
    if (!chatId) return setError(validatePhone(phone))
    dispatch({ type: 'createChat', chatId, phone: normalizePhone(phone) })
    onCreated()
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <input
        value={phone}
        onChange={(e) => {
          setPhone(formatPhone(e.target.value))
          setError(null)
        }}
        placeholder="7 987 654-32-10"
        aria-label="Номер телефона"
        inputMode="tel"
        autoFocus
        aria-invalid={error !== null}
      />
      {error && <span className={styles.error} role="alert">{error}</span>}
      <button>Начать чат</button>
    </form>
  )
}

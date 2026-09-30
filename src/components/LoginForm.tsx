import { useState, type FormEvent } from 'react'
import { describeError } from '../api/errors'
import { DEFAULT_API_URL, checkCredentials } from '../api/greenApi'
import type { Credentials } from '../api/types'
import { validateCredentials, type CredentialsErrors } from '../utils/credentials'
import styles from './LoginForm.module.css'

interface Props {
  onLogin: (credentials: Credentials) => void
  notice?: string
}

export function LoginForm({ onLogin, notice }: Props) {
  const [values, setValues] = useState<Credentials>({ idInstance: '', apiTokenInstance: '', apiUrl: '' })
  const [fieldErrors, setFieldErrors] = useState<CredentialsErrors>({})
  const [error, setError] = useState(notice ?? '')
  const [loading, setLoading] = useState(false)

  const bind = (name: keyof Credentials) => ({
    value: values[name],
    'aria-invalid': Boolean(fieldErrors[name]),
    onChange: (e: { target: { value: string } }) => {
      setValues((v) => ({ ...v, [name]: e.target.value }))
      setFieldErrors((errs) => ({ ...errs, [name]: undefined }))
    },
  })

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    const credentials = {
      idInstance: values.idInstance.trim(),
      apiTokenInstance: values.apiTokenInstance.trim(),
      apiUrl: values.apiUrl.trim(),
    }
    const errors = validateCredentials(credentials)
    setFieldErrors(errors)
    setError('')
    if (Object.keys(errors).length > 0) return

    setLoading(true)
    try {
      await checkCredentials(credentials)
      onLogin(credentials)
    } catch (err) {
      setError(describeError(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit} noValidate>
      <h1>Вход в GREEN-API</h1>
      <p className={styles.hint}>Данные инстанса — в консоли console.green-api.com. Они хранятся только в вашем браузере.</p>
      <label>
        idInstance
        <input {...bind('idInstance')} inputMode="numeric" autoFocus />
        {fieldErrors.idInstance && <span className={styles.fieldError}>{fieldErrors.idInstance}</span>}
      </label>
      <label>
        apiTokenInstance
        <input {...bind('apiTokenInstance')} type="password" />
        {fieldErrors.apiTokenInstance && <span className={styles.fieldError}>{fieldErrors.apiTokenInstance}</span>}
      </label>
      <label>
        API URL (необязательно)
        <input {...bind('apiUrl')} placeholder={DEFAULT_API_URL} />
        {fieldErrors.apiUrl && <span className={styles.fieldError}>{fieldErrors.apiUrl}</span>}
      </label>
      {error && <p className={styles.error} role="alert">{error}</p>}
      <button disabled={loading}>{loading ? 'Проверяем…' : 'Войти'}</button>
    </form>
  )
}

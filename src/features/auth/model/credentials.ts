import type { Credentials } from '@/shared/api'

export type CredentialsErrors = Partial<Record<keyof Credentials, string>>

/** Validates the login form before any network call: catches typos that the API would only report as 401 or "Failed to fetch". */
export function validateCredentials({ idInstance, apiTokenInstance, apiUrl }: Credentials): CredentialsErrors {
  const errors: CredentialsErrors = {}
  if (!/^\d+$/.test(idInstance)) errors.idInstance = 'idInstance состоит только из цифр'
  if (!apiTokenInstance) errors.apiTokenInstance = 'Введите apiTokenInstance'
  else if (/\s/.test(apiTokenInstance)) errors.apiTokenInstance = 'В токене не должно быть пробелов'
  if (apiUrl) {
    try {
      if (!/^https?:$/.test(new URL(apiUrl).protocol)) throw new Error()
    } catch {
      errors.apiUrl = 'Введите адрес вида https://7103.api.green-api.com'
    }
  }
  return errors
}

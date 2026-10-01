export const PHONE_LENGTH = 11

/**
 * Keeps digits only, converts a Russian leading "8" to "7" and truncates to 11 digits.
 * So pasting "+7 (987) 654-32-10" or "8 987 654 32 10" gives the same result.
 */
export function normalizePhone(input: string): string {
  const digits = input.replace(/\D/g, '')
  return (digits.startsWith('8') ? `7${digits.slice(1)}` : digits).slice(0, PHONE_LENGTH)
}

/**
 * Mask `X XXX XXX-XX-XX`, applied as the user types: a separator is emitted only before a digit,
 * so erasing the last digit never gets stuck on a trailing dash.
 */
export function formatPhone(input: string): string {
  const d = normalizePhone(input)
  const groups = [d.slice(0, 1), d.slice(1, 4), d.slice(4, 7), d.slice(7, 9), d.slice(9, 11)]
  const separators = ['', ' ', ' ', '-', '-']
  return groups.map((g, i) => (g ? separators[i] + g : '')).join('')
}

export function validatePhone(input: string): string | null {
  const length = normalizePhone(input).length
  if (length === 0) return 'Введите номер телефона'
  if (length < PHONE_LENGTH) return `Проверьте корректность ввода номера`
  return null
}

/** GREEN-API chatId format: `79876543210@c.us`. Returns null for an invalid number. */
export function phoneToChatId(input: string): string | null {
  return validatePhone(input) ? null : `${normalizePhone(input)}@c.us`
}

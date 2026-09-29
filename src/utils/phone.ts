/** Нормализует ввод пользователя к формату chatId GREEN-API: `79876543210@c.us`. */
export function phoneToChatId(input: string): string | null {
  const digits = input.replace(/[\s()+-]/g, '')
  if (!/^\d{10,15}$/.test(digits)) return null
  return `${digits}@c.us`
}

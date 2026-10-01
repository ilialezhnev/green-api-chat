/** localStorage may be unavailable or contain garbage — in both cases we return null. */
export function readJson<T>(key: string, isValid: (value: unknown) => value is T): T | null {
  try {
    const raw = localStorage.getItem(key)
    const value: unknown = raw ? JSON.parse(raw) : null
    return isValid(value) ? value : null
  } catch {
    return null
  }
}

export function writeJson(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    // Quota exceeded or private mode: the app keeps working, just without persistence.
  }
}

export function removeKey(key: string) {
  try {
    localStorage.removeItem(key)
  } catch {
    // see writeJson()
  }
}

export const isRecord = (v: unknown): v is Record<string, unknown> =>
  typeof v === 'object' && v !== null

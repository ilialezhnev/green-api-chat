import type { Credentials } from '../api/types'
import { initialState } from './chatReducer'
import type { ChatState } from './types'

const CREDENTIALS_KEY = 'green-api-chat:credentials'
const CHATS_KEY = 'green-api-chat:chats'

/** localStorage may be unavailable or contain garbage — in both cases we return the fallback. */
function read<T>(key: string, isValid: (value: unknown) => value is T): T | null {
  try {
    const raw = localStorage.getItem(key)
    const value: unknown = raw ? JSON.parse(raw) : null
    return isValid(value) ? value : null
  } catch {
    return null
  }
}

function write(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    // Quota exceeded or private mode: the chat keeps working, just without persistence.
  }
}

const isRecord = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null

const isCredentials = (v: unknown): v is Credentials =>
  isRecord(v) && typeof v.idInstance === 'string' && typeof v.apiTokenInstance === 'string' && typeof v.apiUrl === 'string'

const isChatState = (v: unknown): v is ChatState => isRecord(v) && isRecord(v.chats) && Array.isArray(v.order)

export const loadCredentials = () => read(CREDENTIALS_KEY, isCredentials)
export const saveCredentials = (c: Credentials) => write(CREDENTIALS_KEY, c)
export const clearCredentials = () => {
  try {
    localStorage.removeItem(CREDENTIALS_KEY)
  } catch {
    // see write()
  }
}

export const loadChats = (): ChatState => read(CHATS_KEY, isChatState) ?? initialState
export const saveChats = (state: ChatState) => write(CHATS_KEY, state)

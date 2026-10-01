import { isRecord, readJson, writeJson } from '@/shared/lib'
import { initialState } from './chatReducer'
import type { ChatState } from './types'

const CHATS_KEY = 'green-api-chat:chats'

const isChatState = (v: unknown): v is ChatState => isRecord(v) && isRecord(v.chats) && Array.isArray(v.order)

export const loadChats = (): ChatState => readJson(CHATS_KEY, isChatState) ?? initialState
export const saveChats = (state: ChatState) => writeJson(CHATS_KEY, state)

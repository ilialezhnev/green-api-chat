import { createContext, useContext, type Dispatch } from 'react';
import type { Action } from './chatReducer';
import type { ChatState } from './types';

interface ChatContextValue {
  state: ChatState;
  dispatch: Dispatch<Action>;
}

export const ChatContext = createContext<ChatContextValue | null>(null);

export function useChat() {
  const value = useContext(ChatContext);

  if (!value) {
    throw new Error('useChat должен вызываться внутри <ChatProvider>');
  }

  return value;
}

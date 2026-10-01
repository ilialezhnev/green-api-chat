import { useEffect, useMemo, useReducer, type ReactNode } from 'react';
import { ChatContext } from './chatContext';
import { chatReducer } from './chatReducer';
import { loadChats, saveChats } from './storage';

/** Chat state lives in the reducer and is mirrored to localStorage: a GREEN-API queue entry can't be recovered after delete. */
export function ChatProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(chatReducer, undefined, loadChats);

  useEffect(() => saveChats(state), [state]);

  const value = useMemo(() => ({ state, dispatch }), [state]);

  return <ChatContext value={value}>{children}</ChatContext>;
}

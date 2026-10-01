import type { Credentials } from '@/shared/api';
import { isRecord, readJson, removeKey, writeJson } from '@/shared/lib';

const CREDENTIALS_KEY = 'green-api-chat:credentials';

const isCredentials = (v: unknown): v is Credentials =>
  isRecord(v) &&
  typeof v.idInstance === 'string' &&
  typeof v.apiTokenInstance === 'string' &&
  typeof v.apiUrl === 'string';

export const loadCredentials = () => readJson(CREDENTIALS_KEY, isCredentials);
export const saveCredentials = (c: Credentials) => writeJson(CREDENTIALS_KEY, c);
export const clearCredentials = () => removeKey(CREDENTIALS_KEY);

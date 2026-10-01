import { ApiError } from './greenApi';

export const isAuthError = (error: unknown) =>
  error instanceof ApiError && (error.status === 401 || error.status === 403);

/** Turns any request error into a user-friendly message. */
export function describeError(error: unknown): string {
  if (error instanceof ApiError) {
    if (isAuthError(error)) {
      return 'Неверные idInstance или apiTokenInstance';
    }

    if (error.status === 400) {
      return 'GREEN-API отклонил запрос. Проверьте номер получателя и текст';
    }

    if (error.status === 429) {
      return 'Слишком много запросов. Подождите немного и повторите';
    }

    if (error.status === 466) {
      return 'Превышен лимит тарифа GREEN-API (на бесплатном тарифе ограничено число чатов)';
    }

    if (error.status >= 500) {
      return 'Сервис GREEN-API временно недоступен. Попробуйте позже';
    }

    return `Ошибка GREEN-API (HTTP ${error.status})`;
  }

  if (error instanceof DOMException && error.name === 'TimeoutError') {
    return 'Сервер слишком долго не отвечает';
  }

  if (error instanceof TypeError) {
    return 'Нет связи с сервером. Проверьте интернет и адрес API URL';
  }

  if (error instanceof SyntaxError) {
    return 'Сервер вернул некорректный ответ';
  }

  return 'Что-то пошло не так. Попробуйте ещё раз';
}

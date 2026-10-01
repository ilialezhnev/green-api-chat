export const MAX_MESSAGE_LENGTH = 256;

// Control characters (except \n and \t) and invisible text-direction characters (used to disguise spoofed text).
const INVISIBLE = /(?![\n\t\r])\p{Cc}|[\u200B-\u200F\u202A-\u202E\u2060-\u2069\uFEFF]/gu;
const HTML_TAG = /<\/?[a-z!][^>]*>/i;
const SCRIPT_URL = /\b(?:javascript|vbscript|data)\s*:/i;

/** Length in characters, not UTF-16 code units: an emoji counts as one character. */
export const messageLength = (text: string) => [...text].length;

/** Strips what the user can't see and what shouldn't be sent: special characters, surrounding whitespace. */
export function sanitizeMessage(text: string): string {
  return text.replace(INVISIBLE, '').replace(/\r\n?/g, '\n').trim();
}

/**
 * Returns an error message or null. Validates the sanitized text — exactly what will be sent to the API.
 * React escapes text on render, so XSS is impossible even without this; the check exists to
 * avoid forwarding markup and script-like links to other people, and to show the user why a message was rejected.
 */
export function validateMessage(text: string): string | null {
  const clean = sanitizeMessage(text);

  if (!clean) {
    return 'Сообщение пустое';
  }

  if (messageLength(clean) > MAX_MESSAGE_LENGTH) {
    return `Максимум ${MAX_MESSAGE_LENGTH} символов`;
  }

  if (HTML_TAG.test(clean) || SCRIPT_URL.test(clean)) {
    return 'HTML-теги и скрипты не поддерживаются';
  }

  return null;
}

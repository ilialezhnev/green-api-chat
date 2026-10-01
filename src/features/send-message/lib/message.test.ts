import { MAX_MESSAGE_LENGTH, messageLength, sanitizeMessage, validateMessage } from './message';

describe('sanitizeMessage', () => {
  it('убирает управляющие и невидимые символы, сохраняя переносы строк', () => {
    expect(sanitizeMessage('  при\u0000вет\u202E\nмир\u200B  ')).toBe('привет\nмир');
  });

  it('нормализует переводы строк', () => {
    expect(sanitizeMessage('a\r\nb\rc')).toBe('a\nb\nc');
  });
});

describe('validateMessage', () => {
  it('принимает обычный текст, в том числе со знаком «меньше»', () => {
    expect(validateMessage('привет')).toBeNull();
    expect(validateMessage('если a < b, то всё хорошо')).toBeNull();
  });

  it('отклоняет пустое и состоящее из невидимых символов', () => {
    expect(validateMessage('   ')).toBe('Сообщение пустое');
    expect(validateMessage('\u200B\u0000')).toBe('Сообщение пустое');
  });

  it('ограничивает длину, считая эмодзи за один символ', () => {
    expect(validateMessage('а'.repeat(MAX_MESSAGE_LENGTH))).toBeNull();
    expect(validateMessage('а'.repeat(MAX_MESSAGE_LENGTH + 1))).toMatch(/Максимум/);
    expect(validateMessage('😀'.repeat(MAX_MESSAGE_LENGTH))).toBeNull();
    expect(messageLength('😀')).toBe(1);
  });

  it.each([
    '<script>alert(1)</script>',
    'смотри <img src=x onerror=alert(1)>',
    '<b>hi</b>',
    'JavaScript:alert(1)',
  ])('отклоняет разметку и скрипты: %s', (text) => expect(validateMessage(text)).toMatch(/HTML/));
});

import { formatPhone, normalizePhone, phoneToChatId, validatePhone } from './phone';

describe('normalizePhone', () => {
  it('оставляет только цифры и обрезает до 11', () => {
    expect(normalizePhone('+7 (987) 654-32-10')).toBe('79876543210');
    expect(normalizePhone('abc79876543210999')).toBe('79876543210');
  });

  it('приводит 8 в начале к 7', () => {
    expect(normalizePhone('8 987 654 32 10')).toBe('79876543210');
  });
});

describe('formatPhone', () => {
  it.each([
    ['', ''],
    ['7', '7'],
    ['79', '7 9'],
    ['79876', '7 987 6'],
    ['7987654', '7 987 654'],
    ['79876543', '7 987 654-3'],
    ['79876543210', '7 987 654-32-10'],
    ['7987654321099', '7 987 654-32-10'],
  ])('%s → %s', (input, expected) => {
    expect(formatPhone(input)).toBe(expected);
  });

  it('идемпотентна: повторное форматирование ничего не меняет', () => {
    expect(formatPhone(formatPhone('79876543210'))).toBe('7 987 654-32-10');
  });
});

describe('validatePhone', () => {
  it('требует полный номер из 11 цифр', () => {
    expect(validatePhone('')).toMatch(/Введите/);
    expect(validatePhone('7 987')).toMatch(/Проверьте корректность/);
    expect(validatePhone('7 987 654-32-10')).toBeNull();
  });
});

describe('phoneToChatId', () => {
  it('добавляет суффикс к валидному номеру', () => {
    expect(phoneToChatId('+7 (987) 654-32-10')).toBe('79876543210@c.us');
  });

  it('отклоняет буквы и неполные номера', () => {
    expect(phoneToChatId('abc')).toBeNull();
    expect(phoneToChatId('12345')).toBeNull();
  });
});

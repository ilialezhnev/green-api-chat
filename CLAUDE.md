# GREEN-API chat — тестовое задание (Фронтенд разработчик React)


## Задача
Простой React-UI для отправки и получения **только текстовых** сообщений через сервис GREEN-API. По ТЗ мессенджер MAX, допустима замена на WhatsApp/Telegram — **выбран Telegram** (у пользователя нет MAX). Внешний вид — как web.max.ru.

## Требования ТЗ
1. React.
2. Внешний вид чата — прототип https://web.max.ru/
3. Интерфейс максимально простой, минимум функций.
4. Отправка — метод SendMessage.
5. Получение — HTTP API (ReceiveNotification + DeleteNotification, polling).
6. Только текст.

## Сценарий
1. Пользователь вводит `idInstance` и `apiTokenInstance` (плюс необязательный «API URL», по умолчанию https://api.green-api.com).
2. Вводит номер телефона получателя → создаётся новый чат.
3. Пишет текст и отправляет.
4. Получатель отвечает в мессенджере → ответ появляется в чате.

## Решения
- Стек: Vite + React 19 + TypeScript, CSS Modules, `useReducer` + Context (без Redux), Vitest + React Testing Library. Линтер: oxlint.
- Деплой: GitHub Pages через GitHub Actions (`base` в [vite.config.ts](vite.config.ts) включается при `GITHUB_ACTIONS`).
- Хранение: ключи и история чатов в `localStorage` (уведомления удаляются из очереди GREEN-API, без хранилища история теряется).
- Дизайн (со скриншота web.max.ru): узкая колонка иконок слева, список чатов с поиском и синей кнопкой «+», справа шапка чата, сообщения на узорном голубом фоне, поле «Сообщение» с круглой синей кнопкой отправки.

## GREEN-API (Telegram) — шпаргалка
Документация: https://green-api.com/telegram/docs/ . Консоль: console.green-api.com (тариф Developer бесплатный, до 3 чатов).
- `POST {apiUrl}/waInstance{id}/sendMessage/{token}`, body `{chatId, message}` → `{idMessage}`
- `GET .../receiveNotification/{token}?receiveTimeout=5..60` → `null` или `{receiptId, body:{typeWebhook:"incomingMessageReceived", senderData:{chatId,senderName,senderPhoneNumber}, messageData:{typeMessage:"textMessage", textMessageData:{textMessage}}}}`
- `DELETE .../deleteNotification/{token}/{receiptId}` — обязательно после обработки, иначе придёт то же уведомление.
- `chatId`: `79876543210@c.us` (по номеру) или числовой id; ответы приходят с числовым `chatId` → сопоставление с чатом по номеру телефона/`aliasId` (см. [chatReducer.ts](src/state/chatReducer.ts)).
- Для polling в SetSettings нужно `webhookUrl: ""`, `incomingWebhook: "yes"`, `outgoingWebhook: "yes"`.
- CORS из браузера пока **не проверен** (нужны реальные ключи) — проверить первым делом.

## Структура
- `src/api/` — клиент GREEN-API (`greenApi.ts`) и типы.
- `src/state/` — типы и чистый `chatReducer` (с тестами).
- `src/utils/` — `phone.ts` (номер → chatId).
- `src/hooks/`, `src/components/` — пока пусто.

## Статус
Готово: каркас, API-клиент, reducer + тесты (`npm test`), сборка (`npm run build`).

Дальше:
1. Проверить CORS с реальными ключами.
2. Хук `useNotificationPolling` (цикл receive → dispatch → delete, `AbortController`, backoff при ошибках).
3. Персист в `localStorage`.
4. UI: форма входа, список чатов, модалка «новый чат», окно чата, стили в духе MAX.
5. README (запуск), GitHub Actions для Pages, скриншоты.
6. `gh auth login` (делает пользователь) → создать публичный репо и запушить.

## Правила работы
- Коммиты небольшие, сообщения в стиле conventional commits; в конец сообщения добавляй строку `Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>`.
- Ключи GREEN-API не коммитить и не логировать.
- Пуш и создание репозитория — только после подтверждения пользователя.

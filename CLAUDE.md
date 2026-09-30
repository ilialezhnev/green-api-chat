# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Команды
- `npm run dev` — dev-сервер Vite; `npm run build` — `tsc -b && vite build`; `npm run preview` — просмотр сборки
- `npm run lint` — oxlint (конфиг [.oxlintrc.json](.oxlintrc.json))
- `npm test` — Vitest однократно (jsdom, `globals: true`, setup в [src/test/setup.ts](src/test/setup.ts)); `npm run test:watch` — watch
- Один файл: `npx vitest run src/state/chatReducer.test.ts`; один тест: `npx vitest run -t "часть названия"`

## Архитектура (кратко)
- Поток данных: [useNotificationPolling](src/hooks/useNotificationPolling.ts) → `receiveNotification` → `notificationToAction` ([notifications.ts](src/api/notifications.ts)) → `dispatch` → `deleteNotification` (удаляем всегда). Отправка: `sendMessage` → `addOutgoing`.
- Вся логика сопоставления сообщений с чатами живёт в чистом [chatReducer.ts](src/state/chatReducer.ts): `chatId` → `phone@c.us` → `aliasId`; входящие идемпотентны по `message.id`. Менять её — только с тестами.
- [greenApi.ts](src/api/greenApi.ts): все вызовы идут через `request<T>()` (кидает `ApiError` на не-2xx, пустое тело → `null`); URL строится в `buildUrl` (`{apiUrl}/waInstance{id}/{method}/{token}/...`, всё через `encodeURIComponent`).
- Валидация и ошибки: [message.ts](src/utils/message.ts) (лимит 256, очистка невидимых символов, запрет HTML/скриптов), [phone.ts](src/utils/phone.ts) (маска `X XXX XXX-XX-XX`, ровно 11 цифр, 8→7), [credentials.ts](src/utils/credentials.ts); [errors.ts](src/api/errors.ts) `describeError` переводит любую ошибку запроса в текст для пользователя. Все запросы имеют таймаут (`request` в greenApi.ts); хук polling отдаёт `connectionLost` для баннера.
- `vite.config.ts`: `base: '/green-api-chat/'` только при `GITHUB_ACTIONS`, локально `/`.

## Проект
GREEN-API chat — тестовое задание (Фронтенд разработчик React).

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
- Для polling в SetSettings нужно `webhookUrl: ""` и включённые `incomingWebhook`, `outgoingMessageWebhook` (сообщения с телефона), `outgoingAPIMessageWebhook` — всё `"yes"`; `outgoingWebhook` отвечает за статусы отправленных, приложению не нужен. Диалог настроек ([SettingsDialog.tsx](src/components/SettingsDialog.tsx), шестерёнка в сайдбаре) читает `getSettings` и через `setSettings` шлёт только изменённые переключатели; инстанс применяет их с задержкой в несколько минут.
- CORS проверен (2026-09-29, curl с `Origin`, без ключей): `Access-Control-Allow-Origin: *`, preflight для POST и DELETE проходит → вызовы из браузера работают.

## Структура
- `src/api/` — клиент GREEN-API (`greenApi.ts`) и типы.
- `src/state/` — типы и чистый `chatReducer` (с тестами).
- `src/utils/` — `phone.ts` (номер → chatId).
- `src/hooks/` — `useNotificationPolling`; `src/components/` — LoginForm, Sidebar (список + новый чат), ChatWindow, Avatar (CSS Modules).
- `src/state/` также: `storage.ts` (localStorage с валидацией), `ChatProvider` (useReducer + персист), `chatContext.ts` (контекст и `useChat`). Ключи в localStorage хранятся отдельно от чатов; выход очищает только ключи.

## Статус
Готово: каркас, API-клиент, reducer + тесты (`npm test`), сборка (`npm run build`).

Дальше:
1. ~~CORS~~ — готово.
2. ~~Хук `useNotificationPolling`~~ — написан (без теста хука; проверить вживую с реальными ключами).
3. ~~Персист~~, 4. ~~UI~~ — готово в первом приближении; нужна проверка вживую с реальными ключами и полировка под web.max.ru (иконочная колонка слева, мобильная вёрстка).
5. README (запуск), GitHub Actions для Pages, скриншоты.
6. `gh auth login` (делает пользователь) → создать публичный репо и запушить.

## Правила работы
- Коммиты небольшие, сообщения в стиле conventional commits; в конец сообщения добавляй строку `Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>`.
- Ключи GREEN-API не коммитить и не логировать.
- Пуш и создание репозитория — только после подтверждения пользователя.

import { useCallback, useEffect, useState } from 'react';
import { describeError, getSettings, setSettings, type Credentials } from '@/shared/api';
import {
  WEBHOOKS,
  changedWebhooks,
  toWebhookState,
  type WebhookState,
} from '@/features/instance-settings/model/webhooks';
import styles from './SettingsDialog.module.css';

type Load =
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'ready'; original: WebhookState; webhookUrl: string };

export function SettingsDialog({
  credentials,
  onClose,
}: {
  credentials: Credentials;
  onClose: () => void;
}) {
  const [load, setLoad] = useState<Load>({ status: 'loading' });
  const [draft, setDraft] = useState<WebhookState | null>(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ kind: 'ok' | 'error'; text: string } | null>(null);

  const fetchSettings = useCallback(
    (signal?: AbortSignal) => {
      getSettings(credentials, signal)
        .then((settings) => {
          const original = toWebhookState(settings);

          setDraft(original);
          setLoad({ status: 'ready', original, webhookUrl: settings.webhookUrl ?? '' });
        })
        .catch((err) => {
          if (!signal?.aborted) {
            setLoad({ status: 'error', message: describeError(err) });
          }
        });
    },
    [credentials],
  );

  useEffect(() => {
    const controller = new AbortController();

    fetchSettings(controller.signal);

    return () => controller.abort();
  }, [fetchSettings]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();

    document.addEventListener('keydown', onKey);

    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  const changes = load.status === 'ready' && draft ? changedWebhooks(load.original, draft) : {};
  const hasChanges = Object.keys(changes).length > 0;

  async function handleSave() {
    if (load.status !== 'ready' || !draft || !hasChanges) {
      return;
    }

    setSaving(true);
    setMessage(null);

    try {
      const { saveSettings } = await setSettings(credentials, changes);

      if (!saveSettings) {
        throw new Error('not saved');
      }

      setLoad({ ...load, original: draft });

      setMessage({
        kind: 'ok',
        text: 'Сохранено. Инстанс применяет настройки в течение нескольких минут.',
      });
    } catch (err) {
      setMessage({ kind: 'error', text: `Не удалось сохранить: ${describeError(err)}` });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className={styles.backdrop} onClick={onClose}>
      <div
        className={styles.dialog}
        role="dialog"
        aria-modal="true"
        aria-labelledby="settings-title"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 id="settings-title">Настройки инстанса</h2>
        <p className={styles.hint}>
          Вебхуки, через которые приложение получает сообщения. Без них очередь уведомлений остаётся
          пустой.
        </p>

        {load.status === 'loading' && <p role="status">Загружаем настройки…</p>}

        {load.status === 'error' && (
          <div role="alert" className={styles.error}>
            {load.message}
            <button
              onClick={() => {
                setLoad({ status: 'loading' });
                fetchSettings();
              }}
            >
              Повторить
            </button>
          </div>
        )}

        {load.status === 'ready' && draft && (
          <>
            {load.webhookUrl && (
              <p className={styles.warning}>
                Задан Webhook URL ({load.webhookUrl}): уведомления уходят на него, а не в очередь, и
                приложение ничего не получит. Очистите его в консоли GREEN-API.
              </p>
            )}
            <ul className={styles.list}>
              {WEBHOOKS.map(({ key, label, hint }) => (
                <li key={key}>
                  <label>
                    <input
                      type="checkbox"
                      role="switch"
                      checked={draft[key]}
                      onChange={(e) => {
                        setDraft({ ...draft, [key]: e.target.checked });
                        setMessage(null);
                      }}
                    />
                    <span>
                      <b>{label}</b>
                      <small>{hint}</small>
                    </span>
                  </label>
                </li>
              ))}
            </ul>
          </>
        )}

        {message && (
          <p
            role={message.kind === 'error' ? 'alert' : 'status'}
            className={message.kind === 'error' ? styles.errorText : styles.ok}
          >
            {message.text}
          </p>
        )}

        <div className={styles.actions}>
          <button className={styles.secondary} onClick={onClose}>
            Закрыть
          </button>
          <button onClick={handleSave} disabled={!hasChanges || saving}>
            {saving ? 'Сохраняем…' : 'Сохранить'}
          </button>
        </div>
      </div>
    </div>
  );
}

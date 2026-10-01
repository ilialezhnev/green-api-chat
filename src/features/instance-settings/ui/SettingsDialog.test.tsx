import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ApiError, getSettings, setSettings } from '@/shared/api'
import { SettingsDialog } from './SettingsDialog'

vi.mock('@/shared/api', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@/shared/api')>()),
  getSettings: vi.fn(),
  setSettings: vi.fn(),
}))

const credentials = { idInstance: '1', apiTokenInstance: 't', apiUrl: '' }

describe('SettingsDialog', () => {
  it('shows current webhook state and saves only the changed toggle', async () => {
    vi.mocked(getSettings).mockResolvedValue({ incomingWebhook: 'no', outgoingMessageWebhook: 'yes', outgoingAPIMessageWebhook: 'no' })
    vi.mocked(setSettings).mockResolvedValue({ saveSettings: true })
    render(<SettingsDialog credentials={credentials} onClose={() => {}} />)

    const incoming = await screen.findByRole('switch', { name: /Входящие сообщения/ })
    expect(incoming).not.toBeChecked()
    expect(screen.getByRole('switch', { name: /Отправленные с телефона/ })).toBeChecked()
    expect(screen.getByText('Сохранить')).toBeDisabled()

    await userEvent.click(incoming)
    await userEvent.click(screen.getByText('Сохранить'))

    expect(setSettings).toHaveBeenCalledWith(credentials, { incomingWebhook: 'yes' })
    expect(await screen.findByRole('status')).toHaveTextContent('Сохранено')
    expect(screen.getByText('Сохранить')).toBeDisabled()
  })

  it('warns when a webhook URL is set', async () => {
    vi.mocked(getSettings).mockResolvedValue({ webhookUrl: 'https://example.test/hook' })
    render(<SettingsDialog credentials={credentials} onClose={() => {}} />)
    expect(await screen.findByText(/Задан Webhook URL/)).toBeInTheDocument()
  })

  it('shows a load error and retries', async () => {
    vi.mocked(getSettings).mockRejectedValueOnce(new ApiError(503, '')).mockResolvedValueOnce({})
    render(<SettingsDialog credentials={credentials} onClose={() => {}} />)
    expect(await screen.findByRole('alert')).toHaveTextContent('недоступен')
    await userEvent.click(screen.getByText('Повторить'))
    expect(await screen.findByRole('switch', { name: /Входящие сообщения/ })).toBeInTheDocument()
  })

  it('shows a save error and keeps the changes', async () => {
    vi.mocked(getSettings).mockResolvedValue({})
    vi.mocked(setSettings).mockRejectedValue(new ApiError(429, ''))
    render(<SettingsDialog credentials={credentials} onClose={() => {}} />)
    await userEvent.click(await screen.findByRole('switch', { name: /Входящие сообщения/ }))
    await userEvent.click(screen.getByText('Сохранить'))
    expect(await screen.findByRole('alert')).toHaveTextContent('Слишком много запросов')
    expect(screen.getByText('Сохранить')).toBeEnabled()
  })

  it('closes on Escape', async () => {
    vi.mocked(getSettings).mockResolvedValue({})
    const onClose = vi.fn()
    render(<SettingsDialog credentials={credentials} onClose={onClose} />)
    await userEvent.keyboard('{Escape}')
    expect(onClose).toHaveBeenCalled()
  })
})

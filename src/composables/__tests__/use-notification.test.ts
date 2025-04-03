import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { useNotification } from '../use-notification'

describe('useNotification', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('should show notification with correct message', () => {
    const { notificationMessage, notificationVisible, showNotification } = useNotification()

    showNotification('Test message')

    expect(notificationMessage.value).toBe('Test message')
    expect(notificationVisible.value).toBe(true)
  })

  it('should hide notification after duration', () => {
    const { notificationVisible, showNotification } = useNotification()

    showNotification('Test message', 1000)
    expect(notificationVisible.value).toBe(true)

    vi.advanceTimersByTime(1000)
    expect(notificationVisible.value).toBe(false)
  })

  it('should clear previous timeout when showing new notification', () => {
    const { notificationVisible, showNotification } = useNotification()

    showNotification('First message', 2000)
    vi.advanceTimersByTime(1000)

    showNotification('Second message', 2000)
    vi.advanceTimersByTime(1000)
    expect(notificationVisible.value).toBe(true)

    vi.advanceTimersByTime(1000)
    expect(notificationVisible.value).toBe(false)
  })

  it('should hide notification immediately when hideNotification is called', () => {
    const { notificationVisible, showNotification, hideNotification } = useNotification()

    showNotification('Test message', 2000)
    expect(notificationVisible.value).toBe(true)

    hideNotification()
    expect(notificationVisible.value).toBe(false)
  })
})

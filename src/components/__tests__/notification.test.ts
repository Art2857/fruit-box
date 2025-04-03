import { beforeEach, describe, expect, it } from 'vitest'
import { createApp, nextTick } from 'vue'
import { useNotification } from '../../composables/use-notification'
import Notification from '../notification.vue'

// Create a real Vue app to test the notification component
describe('notification.vue', () => {
  beforeEach(() => {
    // Reset the notification state before each test
    const { hideNotification } = useNotification()
    hideNotification()
  })

  it('should render notification when showNotification is called', async () => {
    // Get the notification composable
    const { showNotification, notificationVisible, notificationMessage } = useNotification()

    // Create a container for the component
    const container = document.createElement('div')
    document.body.appendChild(container)

    // Create a Vue app with the Notification component
    const app = createApp(Notification)
    app.mount(container)

    // Initially, notification should not be visible
    expect(notificationVisible.value).toBe(false)
    expect(container.querySelector('.notification')).toBeNull()

    // Show the notification
    showNotification('Test notification message')
    await nextTick()

    // Now notification should be visible with the correct message
    expect(notificationVisible.value).toBe(true)
    expect(notificationMessage.value).toBe('Test notification message')

    // Check that the notification element is rendered
    const notificationElement = container.querySelector('.notification')
    expect(notificationElement).not.toBeNull()
    expect(notificationElement?.textContent).toBe('Test notification message')

    // Clean up
    app.unmount()
    document.body.removeChild(container)
  })

  it('should hide notification when hideNotification is called', async () => {
    // Get the notification composable
    const { showNotification, hideNotification, notificationVisible } = useNotification()

    // Create a container for the component
    const container = document.createElement('div')
    document.body.appendChild(container)

    // Create a Vue app with the Notification component
    const app = createApp(Notification)
    app.mount(container)

    // Show the notification
    showNotification('Test notification message')
    await nextTick()

    // Notification should be visible
    expect(notificationVisible.value).toBe(true)
    expect(container.querySelector('.notification')).not.toBeNull()

    // Hide the notification
    hideNotification()
    await nextTick()

    // Now notification should not be visible
    expect(notificationVisible.value).toBe(false)
    expect(container.querySelector('.notification')).toBeNull()

    // Clean up
    app.unmount()
    document.body.removeChild(container)
  })

  it('should hide notification when notification is clicked', async () => {
    // Get the notification composable
    const { showNotification, notificationVisible } = useNotification()

    // Create a container for the component
    const container = document.createElement('div')
    document.body.appendChild(container)

    // Create a Vue app with the Notification component
    const app = createApp(Notification)
    app.mount(container)

    // Show the notification
    showNotification('Test notification message')
    await nextTick()

    // Notification should be visible
    expect(notificationVisible.value).toBe(true)

    // Find and click the notification
    const notificationElement = container.querySelector('.notification')
    expect(notificationElement).not.toBeNull()

    // Click the notification
    if (notificationElement) {
      // eslint-disable-next-line ts/ban-ts-comment
      // @ts-expect-error
      notificationElement.click()
      await nextTick()

      // Now notification should not be visible
      expect(notificationVisible.value).toBe(false)
      expect(container.querySelector('.notification')).toBeNull()
    }

    // Clean up
    app.unmount()
    document.body.removeChild(container)
  })
})

import { ref } from 'vue'

const notificationMessage = ref('')
const notificationVisible = ref(false)
let notificationTimeout: number | null = null

export function useNotification() {
  function showNotification(message: string, duration = 3000) {
    notificationMessage.value = message
    notificationVisible.value = true

    if (notificationTimeout) {
      clearTimeout(notificationTimeout)
    }

    notificationTimeout = window.setTimeout(() => {
      notificationVisible.value = false
      notificationTimeout = null
    }, duration)
  }

  function hideNotification() {
    notificationVisible.value = false
    if (notificationTimeout) {
      clearTimeout(notificationTimeout)
      notificationTimeout = null
    }
  }

  return {
    notificationMessage,
    notificationVisible,
    showNotification,
    hideNotification,
  }
}

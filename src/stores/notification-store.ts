import { defineStore } from 'pinia'

export const useNotificationStore = defineStore('notification', {
  state: () => ({
    message: '',
    visible: false,
    timeout: null as number | null,
  }),

  actions: {
    show(message: string, duration = 3000) {
      this.message = message
      this.visible = true

      if (this.timeout) {
        clearTimeout(this.timeout)
      }

      this.timeout = window.setTimeout(() => {
        this.visible = false
        this.timeout = null
      }, duration)
    },

    hide() {
      this.visible = false
      if (this.timeout) {
        clearTimeout(this.timeout)
        this.timeout = null
      }
    },
  },
})

<script lang="ts" setup>
import { useNotification } from '../composables/use-notification'

const { notificationVisible, notificationMessage, hideNotification } = useNotification()
</script>

<template>
  <div v-if="notificationVisible" class="notification" @click="hideNotification">
    {{ notificationMessage }}
  </div>
</template>

<style scoped>
.notification {
  position: fixed;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  background-color: #f44336;
  color: white;
  padding: clamp(16px, 4vw, 20px) clamp(24px, 6vw, 30px);
  border-radius: 4px;
  cursor: pointer;
  z-index: 1000;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
  font-size: clamp(18px, 2vw, 22px);
}
</style>

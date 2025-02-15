<script lang="ts" setup>
import { useNotification } from '../composables/use-notification'

const { notificationMessage, notificationVisible, hideNotification } = useNotification()
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
  padding: 15px 25px;
  border-radius: 4px;
  cursor: pointer;
  z-index: 1000;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
  font-size: 20px;
}
</style>

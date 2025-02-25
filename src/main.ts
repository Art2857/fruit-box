import { createPinia } from 'pinia'
import { createApp } from 'vue'
import App from './app.vue'
import './style.css'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.mount('#app')

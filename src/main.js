import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import Tres from '@tresjs/core'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(Tres)
app.mount('#app')

// src/main.ts
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import Tres from '@tresjs/core'
import App from './App.vue'
import './style.css' // Si tu as un fichier de style global

const app = createApp(App)
const pinia = createPinia()

app.use(pinia) // On active la mémoire globale
app.use(Tres) // On active le moteur 3D
app.mount('#app')

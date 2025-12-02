import { createApp } from 'vue'
import { createPinia } from 'pinia'
import router from './router'
import App from './App.vue'
import './assets/main.css'

// Initialize dark mode (default to dark if no preference saved)
const savedDarkMode = localStorage.getItem('darkMode')
if (savedDarkMode === null || savedDarkMode === 'true') {
  document.documentElement.classList.add('dark')
} else {
  document.documentElement.classList.remove('dark')
}

const app = createApp(App)

app.use(createPinia())
app.use(router)

app.mount('#app')

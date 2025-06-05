import { createApp } from 'vue'
import { createPinia } from 'pinia'
// Styles
import '@/styles/index.css'

import myLibs from './libs'
import 'virtual:svg-icons-register'
import App from './App.vue'
import router from './router'

import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'

const app = createApp(App)

app.use(createPinia().use(piniaPluginPersistedstate))

app.use(router)
app.use(myLibs)
app.mount('#app')

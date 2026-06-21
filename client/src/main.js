// client/src/main.js
import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import './assets/main.css' // 引入我們剛建的全域 CSS

const app = createApp(App)
app.use(router)
app.mount('#app')
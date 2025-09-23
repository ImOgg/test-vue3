import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { VueQueryPlugin, QueryClient } from '@tanstack/vue-query'
import router from './router/index.js'
import App from './App.vue'
import './style.css'

// 創建 Vue Query Client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5分鐘
      cacheTime: 10 * 60 * 1000, // 10分鐘
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
})

// 創建應用
const app = createApp(App)

// 創建 Pinia 實例
const pinia = createPinia()

// 使用插件
app.use(pinia)
app.use(VueQueryPlugin, { queryClient })
app.use(router)

// 全域錯誤處理
app.config.errorHandler = (err, vm, info) => {
  console.error('全域錯誤:', err)
  console.error('錯誤信息:', info)
  // 這裡可以發送錯誤到錯誤追蹤服務
}

// 全域屬性（可選）
app.config.globalProperties.$filters = {
  // 全域過濾器
  formatDate: (date) => {
    if (!date) return ''
    return new Date(date).toLocaleDateString('zh-TW')
  },
  
  formatDateTime: (date) => {
    if (!date) return ''
    return new Date(date).toLocaleString('zh-TW')
  },
  
  truncate: (text, length = 50) => {
    if (!text) return ''
    return text.length > length ? text.substring(0, length) + '...' : text
  }
}

// 掛載應用
app.mount('#app')

import axios from 'axios'

// 創建 axios 實例
export const request = axios.create({
  baseURL: 'http://localhost:3001',
  timeout: 5000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// 請求攔截器：統一加上 token 或其他認證資訊
request.interceptors.request.use(
  (config) => {
    // 從 localStorage 取得 token
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    
    // 記錄請求資訊（開發環境）
    if (import.meta.env.DEV) {
      console.log('🚀 API Request:', {
        method: config.method?.toUpperCase(),
        url: config.url,
        data: config.data
      })
    }
    
    return config
  },
  (error) => {
    console.error('❌ Request Error:', error)
    return Promise.reject(error)
  }
)

// 回應攔截器：統一處理錯誤
request.interceptors.response.use(
  (response) => {
    // 記錄回應資訊（開發環境）
    if (import.meta.env.DEV) {
      console.log('✅ API Response:', {
        status: response.status,
        url: response.config.url,
        data: response.data
      })
    }
    
    return response
  },
  (error) => {
    // 統一錯誤處理
    console.error('❌ Response Error:', error)
    
    if (error.response) {
      const { status, data } = error.response
      
      switch (status) {
        case 401:
          // 未授權：清除 token 並導向登入頁
          localStorage.removeItem('token')
          window.location.href = '/login'
          break
          
        case 403:
          console.error('🚫 權限不足')
          break
          
        case 404:
          console.error('🔍 資源不存在')
          break
          
        case 500:
          console.error('💥 伺服器錯誤')
          break
          
        default:
          console.error(`🔥 錯誤 ${status}:`, data?.message || '未知錯誤')
      }
    } else if (error.request) {
      console.error('🌐 網路錯誤：無法連接到伺服器')
    } else {
      console.error('⚠️ 請求錯誤:', error.message)
    }
    
    return Promise.reject(error)
  }
)

// 導出常用的請求方法（可選，提供更簡潔的 API）
export const api = {
  get: (url, config) => request.get(url, config),
  post: (url, data, config) => request.post(url, data, config),
  put: (url, data, config) => request.put(url, data, config),
  patch: (url, data, config) => request.patch(url, data, config),
  delete: (url, config) => request.delete(url, config)
}
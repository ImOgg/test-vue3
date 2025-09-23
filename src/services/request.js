import axios from 'axios'

/**
 * axios.create() 是什麼？
 * 
 * axios.create() 是 axios 提供的工廠函數，用來創建一個新的 axios 實例
 * 這個實例擁有獨立的配置，不會影響全域的 axios 設定
 * 
 * 為什麼要用 axios.create()？
 * 1. 獨立配置：可以為不同的 API 服務設定不同的 baseURL、timeout 等
 * 2. 統一管理：所有 API 請求都使用同一個實例，方便統一處理
 * 3. 攔截器隔離：這個實例的攔截器不會影響其他 axios 使用
 * 4. 易於測試：可以輕易 mock 這個實例進行單元測試
 * 
 * Token 處理方式：
 * - 在請求攔截器中自動從 localStorage 讀取 token
 * - 如果存在 token，自動加到 Authorization header
 * - 在回應攔截器中處理 401 錯誤（token 過期），自動清除並導向登入頁
 * - 這樣所有 API 請求都會自動帶上認證資訊，不用每次手動加
 */

// 創建 axios 實例
export const request = axios.create({
  baseURL: 'http://localhost:3001',
  timeout: 5000,
  headers: {
    'Content-Type': 'application/json'
  }
})

/**
 * .use() 是什麼？
 * 
 * .use() 是 axios 攔截器的註冊方法，用來「掛載」攔截器函數
 * 
 * 攔截器的概念：
 * - 就像是在請求/回應的路徑上設置「檢查點」
 * - 每次 HTTP 請求都會經過這些檢查點
 * - 可以在檢查點做任何處理：修改請求、記錄日誌、錯誤處理等
 * 
 * request.interceptors.request.use(成功函數, 失敗函數)
 * - 成功函數：請求發送前執行，可以修改請求配置
 * - 失敗函數：請求發送失敗時執行
 * 
 * request.interceptors.response.use(成功函數, 失敗函數)
 * - 成功函數：收到回應後執行，可以處理回應數據
 * - 失敗函數：回應錯誤時執行，可以統一處理各種 HTTP 錯誤
 */

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
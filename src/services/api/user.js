import { request } from '../request.js'
import { 
  parseUsers, 
  parseUser, 
  parseLoginResponse,
  createUserSchema,
  updateUserSchema,
  loginSchema
} from '../schema/index.js'

// 統一錯誤處理
const handleApiError = (error, context) => {
  console.error(`API Error in ${context}:`, error)
  
  if (error.name === 'ZodError') {
    const validationErrors = error.errors?.map(e => `${e.path.join('.')}: ${e.message}`).join(', ') || '驗證錯誤'
    console.error(`Validation error in ${context}:`, validationErrors)
    throw new Error(`資料驗證失敗: ${validationErrors}`)
  }
  
  if (error.response) {
    const { status, data } = error.response
    console.error(`HTTP error in ${context}:`, { status, data })
    throw new Error(data?.message || `HTTP ${status} 錯誤`)
  }
  
  if (error.request) {
    console.error(`Network error in ${context}:`, error.request)
    throw new Error('網路連線錯誤，請檢查網路狀態')
  }
  
  console.error(`Unknown error in ${context}:`, error.message)
  throw new Error(error.message || '未知錯誤')
}

// 用戶 API
export const userAPI = {
  // 獲取所有用戶
  async getAll() {
    try {
      const response = await request.get('/users')
      return parseUsers(response.data)
    } catch (error) {
      handleApiError(error, 'getUsers')
    }
  },

  // 獲取單一用戶
  async getOne(id) {
    try {
      const response = await request.get(`/users/${id}`)
      return parseUser(response.data)
    } catch (error) {
      handleApiError(error, 'getUser')
    }
  },

  // 創建用戶
  async create(userData) {
    try {
      // 前端驗證
      const validatedData = createUserSchema.parse(userData)
      const response = await request.post('/users', validatedData)
      return parseUser(response.data)
    } catch (error) {
      handleApiError(error, 'createUser')
    }
  },

  // 更新用戶
  async update(id, userData) {
    try {
      const validatedData = updateUserSchema.parse(userData)
      const response = await request.put(`/users/${id}`, validatedData)
      return parseUser(response.data)
    } catch (error) {
      handleApiError(error, 'updateUser')
    }
  },

  // 部分更新用戶
  async patch(id, userData) {
    try {
      const validatedData = updateUserSchema.parse(userData)
      const response = await request.patch(`/users/${id}`, validatedData)
      return parseUser(response.data)
    } catch (error) {
      handleApiError(error, 'patchUser')
    }
  },

  // 刪除用戶
  async delete(id) {
    try {
      await request.delete(`/users/${id}`)
      return true
    } catch (error) {
      handleApiError(error, 'deleteUser')
    }
  },

  // 搜尋用戶
  async search(keyword) {
    try {
      const response = await request.get('/users', {
        params: { q: keyword }
      })
      return parseUsers(response.data)
    } catch (error) {
      handleApiError(error, 'searchUsers')
    }
  },

  // 獲取活躍用戶
  async getActive() {
    try {
      const response = await request.get('/users', {
        params: { isActive: true }
      })
      return parseUsers(response.data)
    } catch (error) {
      handleApiError(error, 'getActiveUsers')
    }
  }
}

// 認證 API
export const authAPI = {
  // 登入
  async login(loginData) {
    try {
      // 前端驗證
      const validatedData = loginSchema.parse(loginData)
      
      // 模擬登入 (因為 json-server 沒有真正的認證)
      // 實際專案中這裡會調用真正的認證端點
      const users = await userAPI.getAll()
      const user = users.find(u => u.email === validatedData.email)
      
      if (!user) {
        throw new Error('用戶不存在')
      }
      
      // 模擬成功登入回應
      const mockResponse = {
        token: `mock_token_${user.id}_${Date.now()}`,
        user: user,
        expiresIn: 86400 // 24小時
      }
      
      return parseLoginResponse(mockResponse)
    } catch (error) {
      handleApiError(error, 'login')
    }
  },

  // 登出
  async logout() {
    try {
      // 在真實應用中，這裡會調用後端的登出端點
      // 目前只是清除本地 token
      localStorage.removeItem('token')
      return true
    } catch (error) {
      handleApiError(error, 'logout')
    }
  },

  // 檢查 token 有效性
  async validateToken(token) {
    try {
      // 在真實應用中，這裡會驗證 token
      // 目前只是檢查 token 格式
      if (!token || !token.startsWith('mock_token_')) {
        throw new Error('無效的 token')
      }
      
      return true
    } catch (error) {
      handleApiError(error, 'validateToken')
    }
  },

  // 刷新 token
  async refreshToken() {
    try {
      // 模擬刷新 token
      const newToken = `mock_token_refresh_${Date.now()}`
      return { token: newToken, expiresIn: 86400 }
    } catch (error) {
      handleApiError(error, 'refreshToken')
    }
  }
}

// 統計 API
export const statsAPI = {
  // 獲取統計資料
  async getStats() {
    try {
      const [users, posts, comments] = await Promise.all([
        request.get('/users'),
        request.get('/posts'),
        request.get('/comments')
      ])
      
      const activeUsers = users.data.filter(u => u.isActive).length
      
      const stats = {
        userCount: users.data.length,
        postCount: posts.data.length,
        commentCount: comments.data.length,
        activeUsers
      }
      
      return stats
    } catch (error) {
      handleApiError(error, 'getStats')
    }
  }
}

// 通用 API 輔助函數
export const apiUtils = {
  // 批量操作
  async batchDelete(endpoint, ids) {
    try {
      const deletePromises = ids.map(id => request.delete(`${endpoint}/${id}`))
      await Promise.all(deletePromises)
      return true
    } catch (error) {
      handleApiError(error, 'batchDelete')
    }
  },

  // 文件上傳
  async uploadFile(file, onProgress) {
    try {
      const formData = new FormData()
      formData.append('file', file)
      
      const response = await request.post('/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        onUploadProgress: (progressEvent) => {
          if (onProgress) {
            const percentCompleted = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            )
            onProgress(percentCompleted)
          }
        }
      })
      
      return response.data
    } catch (error) {
      handleApiError(error, 'uploadFile')
    }
  },

  // 導出資料
  async exportData(endpoint, format = 'json') {
    try {
      const response = await request.get(`${endpoint}/export`, {
        params: { format },
        responseType: 'blob'
      })
      
      return response.data
    } catch (error) {
      handleApiError(error, 'exportData')
    }
  }
}
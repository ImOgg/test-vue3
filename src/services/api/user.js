import { request } from '../request.js'
import { 
  parseUsers, 
  parseUser, 
  createUserSchema,
  updateUserSchema
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

import { request } from '../request.js'
import { 
  parseComments, 
  parseComment, 
  createCommentSchema,
  updateCommentSchema 
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

// 留言 API
export const commentAPI = {
  // 獲取所有留言
  async getAll(params = {}) {
    try {
      const response = await request.get('/comments', { params })
      return parseComments(response.data)
    } catch (error) {
      handleApiError(error, 'getComments')
    }
  },

  // 獲取單一留言
  async getOne(id) {
    try {
      const response = await request.get(`/comments/${id}`)
      return parseComment(response.data)
    } catch (error) {
      handleApiError(error, 'getComment')
    }
  },

  // 根據文章ID獲取留言
  async getByPostId(postId) {
    try {
      const response = await request.get('/comments', {
        params: { postId }
      })
      return parseComments(response.data)
    } catch (error) {
      handleApiError(error, 'getCommentsByPostId')
    }
  },

  // 根據用戶ID獲取留言
  async getByUserId(userId) {
    try {
      const response = await request.get('/comments', {
        params: { userId }
      })
      return parseComments(response.data)
    } catch (error) {
      handleApiError(error, 'getCommentsByUserId')
    }
  },

  // 創建留言
  async create(commentData) {
    try {
      const validatedData = createCommentSchema.parse(commentData)
      const response = await request.post('/comments', validatedData)
      return parseComment(response.data)
    } catch (error) {
      handleApiError(error, 'createComment')
    }
  },

  // 更新留言
  async update(id, commentData) {
    try {
      const validatedData = updateCommentSchema.parse(commentData)
      const response = await request.put(`/comments/${id}`, validatedData)
      return parseComment(response.data)
    } catch (error) {
      handleApiError(error, 'updateComment')
    }
  },

  // 刪除留言
  async delete(id) {
    try {
      await request.delete(`/comments/${id}`)
      return true
    } catch (error) {
      handleApiError(error, 'deleteComment')
    }
  },

  // 批量刪除留言
  async batchDelete(ids) {
    try {
      const deletePromises = ids.map(id => request.delete(`/comments/${id}`))
      await Promise.all(deletePromises)
      return true
    } catch (error) {
      handleApiError(error, 'batchDeleteComments')
    }
  }
}

// 設定 API
export const settingsAPI = {
  // 獲取設定
  async get() {
    try {
      const response = await request.get('/settings')
      return response.data
    } catch (error) {
      handleApiError(error, 'getSettings')
    }
  },

  // 更新設定
  async update(settingsData) {
    try {
      const response = await request.put('/settings', settingsData)
      return response.data
    } catch (error) {
      handleApiError(error, 'updateSettings')
    }
  }
}
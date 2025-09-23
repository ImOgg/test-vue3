import { request } from '../request.js'
import { 
  parsePosts, 
  parsePost, 
  createPostSchema,
  updatePostSchema
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

// 文章 API
export const postAPI = {
  // 獲取所有文章
  async getAll(params = {}) {
    try {
      const response = await request.get('/posts', { params })
      return parsePosts(response.data)
    } catch (error) {
      handleApiError(error, 'getPosts')
    }
  },

  // 獲取單一文章
  async getOne(id) {
    try {
      const response = await request.get(`/posts/${id}`)
      return parsePost(response.data)
    } catch (error) {
      handleApiError(error, 'getPost')
    }
  },

  // 根據用戶ID獲取文章
  async getByUserId(userId) {
    try {
      const response = await request.get('/posts', {
        params: { userId }
      })
      return parsePosts(response.data)
    } catch (error) {
      handleApiError(error, 'getPostsByUserId')
    }
  },

  // 創建文章
  async create(postData) {
    try {
      const validatedData = createPostSchema.parse(postData)
      const response = await request.post('/posts', validatedData)
      return parsePost(response.data)
    } catch (error) {
      handleApiError(error, 'createPost')
    }
  },

  // 更新文章
  async update(id, postData) {
    try {
      const validatedData = updatePostSchema.parse(postData)
      const response = await request.put(`/posts/${id}`, validatedData)
      return parsePost(response.data)
    } catch (error) {
      handleApiError(error, 'updatePost')
    }
  },

  // 刪除文章
  async delete(id) {
    try {
      await request.delete(`/posts/${id}`)
      return true
    } catch (error) {
      handleApiError(error, 'deletePost')
    }
  },

  // 發布文章
  async publish(id) {
    try {
      const response = await request.patch(`/posts/${id}`, { status: 'published' })
      return parsePost(response.data)
    } catch (error) {
      handleApiError(error, 'publishPost')
    }
  },

  // 取消發布文章
  async unpublish(id) {
    try {
      const response = await request.patch(`/posts/${id}`, { status: 'draft' })
      return parsePost(response.data)
    } catch (error) {
      handleApiError(error, 'unpublishPost')
    }
  },

  // 歸檔文章
  async archive(id) {
    try {
      const response = await request.patch(`/posts/${id}`, { status: 'archived' })
      return parsePost(response.data)
    } catch (error) {
      handleApiError(error, 'archivePost')
    }
  },

  // 搜尋文章
  async search(keyword) {
    try {
      const response = await request.get('/posts', {
        params: { q: keyword }
      })
      return parsePosts(response.data)
    } catch (error) {
      handleApiError(error, 'searchPosts')
    }
  },

  // 獲取已發布的文章
  async getPublished() {
    try {
      const response = await request.get('/posts', {
        params: { status: 'published' }
      })
      return parsePosts(response.data)
    } catch (error) {
      handleApiError(error, 'getPublishedPosts')
    }
  },

  // 獲取草稿文章
  async getDrafts() {
    try {
      const response = await request.get('/posts', {
        params: { status: 'draft' }
      })
      return parsePosts(response.data)
    } catch (error) {
      handleApiError(error, 'getDraftPosts')
    }
  }
}
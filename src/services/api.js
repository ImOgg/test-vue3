import axios from 'axios'
import { 
  parseUsers, 
  parseUser, 
  parsePosts, 
  parsePost, 
  parseComments, 
  parseComment,
  parseSettings,
  CreateUserSchema,
  UpdateUserSchema,
  CreatePostSchema,
  UpdatePostSchema,
  CreateCommentSchema,
  UpdateCommentSchema
} from '../schemas/index.js'

// API base configuration
const api = axios.create({
  baseURL: 'http://localhost:3001',
  timeout: 5000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// Error handler for validation
const handleApiError = (error, context) => {
  if (error.name === 'ZodError') {
    console.error(`Validation error in ${context}:`, error.errors)
    throw new Error(`資料驗證失敗: ${error.errors.map(e => e.message).join(', ')}`)
  }
  throw error
}

// Users API
export const usersApi = {
  // 取得所有用戶
  async getAll() {
    try {
      const response = await api.get('/users')
      return parseUsers(response.data)
    } catch (error) {
      handleApiError(error, 'getUsers')
    }
  },

  // 取得單一用戶
  async getById(id) {
    try {
      const response = await api.get(`/users/${id}`)
      return parseUser(response.data)
    } catch (error) {
      handleApiError(error, 'getUser')
    }
  },

  // 建立新用戶
  async create(userData) {
    try {
      // 先驗證輸入資料
      const validatedData = CreateUserSchema.parse(userData)
      const response = await api.post('/users', validatedData)
      return parseUser(response.data)
    } catch (error) {
      handleApiError(error, 'createUser')
    }
  },

  // 更新用戶
  async update(id, userData) {
    try {
      const validatedData = UpdateUserSchema.parse(userData)
      const response = await api.put(`/users/${id}`, validatedData)
      return parseUser(response.data)
    } catch (error) {
      handleApiError(error, 'updateUser')
    }
  },

  // 刪除用戶
  async delete(id) {
    try {
      await api.delete(`/users/${id}`)
      return true
    } catch (error) {
      console.error('Delete user error:', error)
      throw error
    }
  }
}

// Posts API
export const postsApi = {
  async getAll() {
    try {
      const response = await api.get('/posts')
      return parsePosts(response.data)
    } catch (error) {
      handleApiError(error, 'getPosts')
    }
  },

  async getById(id) {
    try {
      const response = await api.get(`/posts/${id}`)
      return parsePost(response.data)
    } catch (error) {
      handleApiError(error, 'getPost')
    }
  },

  async create(postData) {
    try {
      const validatedData = CreatePostSchema.parse(postData)
      const response = await api.post('/posts', validatedData)
      return parsePost(response.data)
    } catch (error) {
      handleApiError(error, 'createPost')
    }
  },

  async update(id, postData) {
    try {
      const validatedData = UpdatePostSchema.parse(postData)
      const response = await api.put(`/posts/${id}`, validatedData)
      return parsePost(response.data)
    } catch (error) {
      handleApiError(error, 'updatePost')
    }
  },

  async delete(id) {
    try {
      await api.delete(`/posts/${id}`)
      return true
    } catch (error) {
      console.error('Delete post error:', error)
      throw error
    }
  }
}

// Comments API
export const commentsApi = {
  async getAll() {
    try {
      const response = await api.get('/comments')
      return parseComments(response.data)
    } catch (error) {
      handleApiError(error, 'getComments')
    }
  },

  async getByPostId(postId) {
    try {
      const response = await api.get(`/comments?postId=${postId}`)
      return parseComments(response.data)
    } catch (error) {
      handleApiError(error, 'getCommentsByPost')
    }
  },

  async create(commentData) {
    try {
      const validatedData = CreateCommentSchema.parse(commentData)
      const response = await api.post('/comments', validatedData)
      return parseComment(response.data)
    } catch (error) {
      handleApiError(error, 'createComment')
    }
  },

  async delete(id) {
    try {
      await api.delete(`/comments/${id}`)
      return true
    } catch (error) {
      console.error('Delete comment error:', error)
      throw error
    }
  }
}

// Settings API
export const settingsApi = {
  async get() {
    try {
      const response = await api.get('/settings')
      return parseSettings(response.data)
    } catch (error) {
      handleApiError(error, 'getSettings')
    }
  }
}
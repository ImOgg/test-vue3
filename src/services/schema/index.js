import { z } from 'zod'

// 用戶相關 schemas
export const userSchema = z.object({
  id: z.number(),
  name: z.string().min(1, '姓名不能為空'),
  email: z.string().email('信箱格式錯誤'),
  phone: z.string().optional(),
  age: z.number().min(1, '年齡必須大於0').max(150, '年齡不能超過150'),
  city: z.string().min(1, '城市不能為空'),
  isActive: z.boolean().default(true)
})

export const userListSchema = z.array(userSchema)

export const createUserSchema = userSchema.omit({ id: true })
export const updateUserSchema = userSchema.partial().omit({ id: true })

// 登入相關 schemas
export const loginSchema = z.object({
  email: z.string().email('請輸入正確的信箱格式'),
  password: z.string().min(6, '密碼至少需要6個字元')
})

export const loginResponseSchema = z.object({
  token: z.string(),
  user: userSchema,
  expiresIn: z.number().optional()
})

// 文章相關 schemas
export const postSchema = z.object({
  id: z.number(),
  title: z.string().min(1, '標題不能為空'),
  content: z.string().min(1, '內容不能為空'),
  userId: z.number(),
  status: z.enum(['draft', 'published', 'archived']).default('draft'),
  tags: z.array(z.string()).optional().default([])
})

export const postListSchema = z.array(postSchema)
export const createPostSchema = postSchema.omit({ id: true })
export const updatePostSchema = postSchema.partial().omit({ id: true })

// 留言相關 schemas
export const commentSchema = z.object({
  id: z.number(),
  content: z.string().min(1, '留言內容不能為空'),
  postId: z.number(),
  userId: z.number()
})

export const commentListSchema = z.array(commentSchema)
export const createCommentSchema = commentSchema.omit({ id: true })
export const updateCommentSchema = commentSchema.partial().omit({ id: true })

// API 回應通用格式
export const apiResponseSchema = z.object({
  success: z.boolean(),
  message: z.string().optional(),
  data: z.any().optional()
})

export const paginationSchema = z.object({
  page: z.number().min(1),
  limit: z.number().min(1).max(100),
  total: z.number(),
  totalPages: z.number()
})

export const paginatedResponseSchema = z.object({
  data: z.array(z.any()),
  pagination: paginationSchema
})

// 錯誤回應格式
export const errorResponseSchema = z.object({
  error: z.string(),
  message: z.string(),
  statusCode: z.number()
})

// 設定相關 schemas
export const settingsSchema = z.object({
  theme: z.enum(['light', 'dark']).default('light'),
  language: z.enum(['zh-TW', 'zh-CN', 'en']).default('zh-TW'),
  notifications: z.object({
    email: z.boolean().default(true),
    push: z.boolean().default(true),
    sms: z.boolean().default(false)
  }).default({}),
  simpleList: z.array(z.number()).optional()
})

// 統計資料 schemas
export const statsSchema = z.object({
  userCount: z.number(),
  postCount: z.number(),
  commentCount: z.number(),
  activeUsers: z.number()
})

// 導出解析函數
export const parseUser = (data) => {
  // 確保 ID 是數字
  if (data && typeof data.id === 'string') {
    data.id = parseInt(data.id, 10)
  }
  return userSchema.parse(data)
}

export const parseUsers = (data) => {
  // 確保所有用戶的 ID 都是數字
  if (Array.isArray(data)) {
    data = data.map(user => {
      if (user && typeof user.id === 'string') {
        const parsedId = parseInt(user.id, 10)
        if (isNaN(parsedId)) {
          throw new Error(`Invalid user ID: ${user.id} cannot be converted to number`)
        }
        user.id = parsedId
      }
      return user
    })
  }
  return userListSchema.parse(data)
}
export const parsePost = (data) => {
  // 確保 ID 和 userId 是數字
  if (data) {
    if (typeof data.id === 'string') {
      const parsedId = parseInt(data.id, 10)
      if (isNaN(parsedId)) {
        throw new Error(`Invalid post ID: ${data.id} cannot be converted to number`)
      }
      data.id = parsedId
    }
    if (typeof data.userId === 'string') {
      const parsedUserId = parseInt(data.userId, 10)
      if (isNaN(parsedUserId)) {
        throw new Error(`Invalid user ID: ${data.userId} cannot be converted to number`)
      }
      data.userId = parsedUserId
    }
  }
  return postSchema.parse(data)
}

export const parsePosts = (data) => {
  // 確保所有文章的 ID 和 userId 都是數字
  if (Array.isArray(data)) {
    data = data.map(post => {
      if (post) {
        if (typeof post.id === 'string') {
          const parsedId = parseInt(post.id, 10)
          if (isNaN(parsedId)) {
            throw new Error(`Invalid post ID: ${post.id} cannot be converted to number`)
          }
          post.id = parsedId
        }
        if (typeof post.userId === 'string') {
          const parsedUserId = parseInt(post.userId, 10)
          if (isNaN(parsedUserId)) {
            throw new Error(`Invalid user ID: ${post.userId} cannot be converted to number`)
          }
          post.userId = parsedUserId
        }
      }
      return post
    })
  }
  return postListSchema.parse(data)
}

export const parseComment = (data) => {
  // 確保 ID、postId 和 userId 是數字
  if (data) {
    if (typeof data.id === 'string') {
      const parsedId = parseInt(data.id, 10)
      if (isNaN(parsedId)) {
        throw new Error(`Invalid comment ID: ${data.id} cannot be converted to number`)
      }
      data.id = parsedId
    }
    if (typeof data.postId === 'string') {
      const parsedPostId = parseInt(data.postId, 10)
      if (isNaN(parsedPostId)) {
        throw new Error(`Invalid post ID: ${data.postId} cannot be converted to number`)
      }
      data.postId = parsedPostId
    }
    if (typeof data.userId === 'string') {
      const parsedUserId = parseInt(data.userId, 10)
      if (isNaN(parsedUserId)) {
        throw new Error(`Invalid user ID: ${data.userId} cannot be converted to number`)
      }
      data.userId = parsedUserId
    }
  }
  return commentSchema.parse(data)
}

export const parseComments = (data) => {
  // 確保所有留言的 ID、postId 和 userId 都是數字
  if (Array.isArray(data)) {
    data = data.map(comment => {
      if (comment) {
        if (typeof comment.id === 'string') {
          const parsedId = parseInt(comment.id, 10)
          if (isNaN(parsedId)) {
            throw new Error(`Invalid comment ID: ${comment.id} cannot be converted to number`)
          }
          comment.id = parsedId
        }
        if (typeof comment.postId === 'string') {
          const parsedPostId = parseInt(comment.postId, 10)
          if (isNaN(parsedPostId)) {
            throw new Error(`Invalid post ID: ${comment.postId} cannot be converted to number`)
          }
          comment.postId = parsedPostId
        }
        if (typeof comment.userId === 'string') {
          const parsedUserId = parseInt(comment.userId, 10)
          if (isNaN(parsedUserId)) {
            throw new Error(`Invalid user ID: ${comment.userId} cannot be converted to number`)
          }
          comment.userId = parsedUserId
        }
      }
      return comment
    })
  }
  return commentListSchema.parse(data)
}
export const parseLoginResponse = (data) => loginResponseSchema.parse(data)
export const parseSettings = (data) => settingsSchema.parse(data)
export const parseStats = (data) => statsSchema.parse(data)

// 導出型別定義（用於 JSDoc 或 TypeScript 轉換）
export const UserType = userSchema
export const PostType = postSchema
export const CommentType = commentSchema
export const LoginDataType = loginSchema
export const SettingsType = settingsSchema

// 表單驗證輔助函數
export const validateUserForm = (data) => {
  try {
    createUserSchema.parse(data)
    return { isValid: true, errors: {} }
  } catch (error) {
    const errors = {}
    if (error.errors) {
      error.errors.forEach(err => {
        errors[err.path[0]] = err.message
      })
    }
    return { isValid: false, errors }
  }
}

export const validateLoginForm = (data) => {
  try {
    loginSchema.parse(data)
    return { isValid: true, errors: {} }
  } catch (error) {
    const errors = {}
    if (error.errors) {
      error.errors.forEach(err => {
        errors[err.path[0]] = err.message
      })
    }
    return { isValid: false, errors }
  }
}

export const validatePostForm = (data) => {
  try {
    createPostSchema.parse(data)
    return { isValid: true, errors: {} }
  } catch (error) {
    const errors = {}
    if (error.errors) {
      error.errors.forEach(err => {
        errors[err.path[0]] = err.message
      })
    }
    return { isValid: false, errors }
  }
}
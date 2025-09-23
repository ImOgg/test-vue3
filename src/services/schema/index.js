/*
📁 Schema 模組化說明

本專案採用單一檔案集中管理所有 schema，但也可以拆分成多個模組：

🔧 建議的模組化結構：
src/services/schema/
├── index.js          # 統一導出
├── user.js           # 用戶相關 schema
├── post.js           # 文章相關 schema
├── comment.js        # 留言相關 schema
└── common.js         # 共用 schema (API 回應格式等)

📝 使用方式：
// 方式1: 從統一入口導入
import { userSchema, postSchema } from '@/services/schema'

// 方式2: 從特定模組導入
import { userSchema } from '@/services/schema/user.js'
import { postSchema } from '@/services/schema/post.js'

💡 何時考慮拆分：
- Schema 數量超過 10 個
- 單檔案超過 500 行
- 需要團隊協作開發
- 想要更細緻的依賴管理

⚡ 目前專案規模適合單檔案管理，簡單直接！
*/

import { z } from 'zod'

// 用戶相關 schemas

// 基本用戶模型 - 定義用戶的完整資料結構
export const userSchema = z.object({
  id: z.number(),
  name: z.string().min(1, '姓名不能為空'),
  email: z.string().email('信箱格式錯誤'),
  phone: z.string().optional(),
  age: z.number().min(1, '年齡必須大於0').max(150, '年齡不能超過150'),
  city: z.string().min(1, '城市不能為空'),
  isActive: z.boolean().default(true)
})

// 用戶清單 - 用於獲取多個用戶時的驗證
export const userListSchema = z.array(userSchema)

// 新增用戶 - 排除 id 欄位（因為新增時不需要提供 id）
export const createUserSchema = userSchema.omit({ id: true })

// 更新用戶 - 所有欄位都變成可選，並排除 id
export const updateUserSchema = userSchema.partial().omit({ id: true })

// 文章相關 schemas
// 文章相關 schemas

// 基本文章模型 - 定義文章的完整資料結構
export const postSchema = z.object({
  id: z.number(),
  title: z.string().min(1, '標題不能為空'),
  content: z.string().min(1, '內容不能為空'),
  userId: z.number(),
  status: z.enum(['draft', 'published', 'archived']).default('draft'),
  tags: z.array(z.string()).optional().default([])
})

// 文章清單 - 用於獲取多個文章時的驗證
export const postListSchema = z.array(postSchema)

// 新增文章 - 排除 id 欄位（新增時由後端自動產生）
export const createPostSchema = postSchema.omit({ id: true })

// 更新文章 - 所有欄位都變成可選，並排除 id
export const updatePostSchema = postSchema.partial().omit({ id: true })

// 留言相關 schemas

// 基本留言模型 - 定義留言的完整資料結構
export const commentSchema = z.object({
  id: z.number(),
  content: z.string().min(1, '留言內容不能為空'),
  postId: z.number(),  // 所屬文章的 ID
  userId: z.number()   // 留言作者的 ID
})

// 留言清單 - 用於獲取多個留言時的驗證
export const commentListSchema = z.array(commentSchema)

// 新增留言 - 排除 id 欄位（由後端自動產生）
export const createCommentSchema = commentSchema.omit({ id: true })

// 更新留言 - 通常只能修改內容，所以變成可選
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
// 導出型別定義（用於 JSDoc 或 TypeScript 轉換）
export const UserType = userSchema
export const PostType = postSchema
export const CommentType = commentSchema

// 表單驗證輔助函數 - 幫助前端做即時驗證

// 驗證用戶表單 - 返回驗證結果和錯誤訊息
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

// 驗證文章表單 - 返回驗證結果和錯誤訊息
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
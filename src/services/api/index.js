// 導入所有 API
import { userAPI } from './user.js'
import { postAPI } from './post.js'
import { commentAPI } from './comment.js'

// 統一導出所有 API
export { userAPI }
export { postAPI }
export { commentAPI }

// 創建統一的 API 對象
export const API = {
  user: userAPI,
  post: postAPI,
  comment: commentAPI
}

export default API
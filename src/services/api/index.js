// 導入所有 API
import { userAPI, authAPI, statsAPI, apiUtils } from './user.js'
import { postAPI } from './post.js'
import { commentAPI, settingsAPI } from './comment.js'

// 統一導出所有 API
export { userAPI, authAPI, statsAPI, apiUtils }
export { postAPI }
export { commentAPI, settingsAPI }

// 創建統一的 API 對象
export const API = {
  user: userAPI,
  auth: authAPI,
  post: postAPI,
  comment: commentAPI,
  settings: settingsAPI,
  stats: statsAPI,
  utils: apiUtils
}

export default API
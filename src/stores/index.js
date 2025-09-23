// 統一導出所有 stores
export { useUserStore } from './user.js'
export { usePostStore } from './post.js'
export { useAppStore } from './app.js'

// 創建統一的 stores 對象
import { useUserStore } from './user.js'
import { usePostStore } from './post.js'
import { useAppStore } from './app.js'

export const stores = {
  user: useUserStore,
  post: usePostStore,
  app: useAppStore
}

export default stores
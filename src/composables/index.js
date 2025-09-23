// 統一導出所有 composables
export { useUserForm } from './useUserForm.js'
export { usePostForm } from './usePostForm.js'
export { useAuth } from './useAuth.js'
export { useDataTable } from './useDataTable.js'

// 創建統一的 composables 對象
import { useUserForm } from './useUserForm.js'
import { usePostForm } from './usePostForm.js'
import { useAuth } from './useAuth.js'
import { useDataTable } from './useDataTable.js'

export const composables = {
  useUserForm,
  usePostForm,
  useAuth,
  useDataTable
}

export default composables
import { useFetch, useAsyncState } from '@vueuse/core'
import { computed, ref } from 'vue'
import { useUserStore } from '@/stores/user.js'
import * as userApi from '@/services/api/user.js'
import { parseUsers, parseUser } from '@/services/schema/index.js'

// 基礎 API URL
const API_BASE = 'http://localhost:3001'

// 使用 VueUse + Pinia 獲取所有用戶 (避免重複請求)
export function useUsers() {
  const userStore = useUserStore()
  
  // 如果 store 中已有數據且不是過期的，直接返回
  if (userStore.users.length > 0 && !userStore.isStale) {
    return {
      users: computed(() => userStore.users),
      isLoading: ref(false),
      error: ref(null),
      refetch: () => userStore.fetchUsers(),
    }
  }

  const url = `${API_BASE}/users`
  
  const { data, isFetching, error, execute } = useFetch(url, {
    afterFetch(ctx) {
      // 使用 Zod 驗證數據
      try {
        ctx.data = parseUsers(ctx.data)
        // 驗證成功後存入 Pinia
        userStore.setUsers(ctx.data)
      } catch (validationError) {
        console.error('Users validation error:', validationError)
        throw validationError
      }
      return ctx
    },
  }).json()

  return {
    users: computed(() => userStore.users.length > 0 ? userStore.users : data.value || []),
    isLoading: isFetching,
    error,
    refetch: execute,
  }
}

// 使用 VueUse 獲取單個用戶
export function useUser(userId) {
  const url = computed(() => userId.value ? `${API_BASE}/users/${userId.value}` : null)
  
  const { data, isFetching, error, execute } = useFetch(url, {
    afterFetch(ctx) {
      try {
        ctx.data = parseUser(ctx.data)
      } catch (validationError) {
        console.error('User validation error:', validationError)
        throw validationError
      }
      return ctx
    },
  }).json()

  return {
    user: computed(() => data.value),
    isLoading: isFetching,
    error,
    refetch: execute,
  }
}

// 使用 useAsyncState 進行更複雜的用戶操作
export function useUserOperations() {
  // 創建用戶
  const createUser = useAsyncState(
    async (userData) => {
      const response = await userApi.create(userData)
      return parseUser(response)
    },
    null,
    {
      immediate: false,
      onError: (error) => {
        console.error('Create user error:', error)
      }
    }
  )

  // 更新用戶
  const updateUser = useAsyncState(
    async ({ id, data }) => {
      const response = await userApi.update(id, data)
      return parseUser(response)
    },
    null,
    {
      immediate: false,
      onError: (error) => {
        console.error('Update user error:', error)
      }
    }
  )

  // 刪除用戶
  const deleteUser = useAsyncState(
    async (userId) => {
      await userApi.delete(userId)
      return userId
    },
    null,
    {
      immediate: false,
      onError: (error) => {
        console.error('Delete user error:', error)
      }
    }
  )

  return {
    // 創建用戶
    createUser: createUser.execute,
    isCreating: createUser.isLoading,
    createError: createUser.error,
    createdUser: createUser.state,

    // 更新用戶
    updateUser: updateUser.execute,
    isUpdating: updateUser.isLoading,
    updateError: updateUser.error,
    updatedUser: updateUser.state,

    // 刪除用戶
    deleteUser: deleteUser.execute,
    isDeleting: deleteUser.isLoading,
    deleteError: deleteUser.error,
    deletedUserId: deleteUser.state,
  }
}

// 組合 hook：用戶管理
export function useUserManagement() {
  const { users, isLoading, error, refetch } = useUsers()
  const operations = useUserOperations()

  // 活躍用戶過濾
  const activeUsers = computed(() => 
    users.value.filter(user => user.isActive)
  )

  // 用戶統計
  const userStats = computed(() => ({
    total: users.value.length,
    active: activeUsers.value.length,
    inactive: users.value.length - activeUsers.value.length,
  }))

  // 搜尋用戶
  const searchTerm = ref('')
  const filteredUsers = computed(() => {
    if (!searchTerm.value) return users.value
    
    return users.value.filter(user => 
      user.name.toLowerCase().includes(searchTerm.value.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.value.toLowerCase()) ||
      user.city.toLowerCase().includes(searchTerm.value.toLowerCase())
    )
  })

  return {
    // 基本數據
    users,
    activeUsers,
    filteredUsers,
    userStats,
    isLoading,
    error,
    refetch,

    // 搜尋
    searchTerm,

    // 操作
    ...operations,
  }
}
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { userAPI } from '../services/api/index.js'

export const useUserStore = defineStore('user', () => {
  // 🎯 State
  const users = ref([])
  const loading = ref(false)
  const error = ref(null)
  const lastFetchTime = ref(null) // 🆕 緩存時間戳

  // 🎯 Getters (computed)
  const activeUsers = computed(() => users.value.filter(u => u.isActive))
  const userCount = computed(() => users.value.length)
  const activeUserCount = computed(() => activeUsers.value.length)
  
  // 🆕 檢查數據是否過期 (5分鐘緩存)
  const isStale = computed(() => {
    if (!lastFetchTime.value) return true
    const fiveMinutes = 5 * 60 * 1000
    return Date.now() - lastFetchTime.value > fiveMinutes
  })

  // 🎯 Actions

  // 清除錯誤
  const clearError = () => {
    error.value = null
  }

  // 設置載入狀態
  const setLoading = (state) => {
    loading.value = state
  }

  // 🆕 設置用戶數據 (供 VueUse hook 使用)
  const setUsers = (userData) => {
    users.value = userData
    lastFetchTime.value = Date.now()
  }

  // === 用戶管理 ===
  
  // 獲取所有用戶
  const fetchUsers = async () => {
    setLoading(true)
    clearError()
    
    try {
      users.value = await userAPI.getAll()
      return users.value
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      setLoading(false)
    }
  }

  // 獲取單一用戶
  const fetchUser = async (id) => {
    setLoading(true)
    clearError()
    
    try {
      const user = await userAPI.getOne(id)
      
      // 更新列表中的用戶
      const index = users.value.findIndex(u => u.id === id)
      if (index !== -1) {
        users.value[index] = user
      } else {
        users.value.push(user)
      }
      
      return user
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      setLoading(false)
    }
  }

  // 創建用戶
  const createUser = async (userData) => {
    setLoading(true)
    clearError()
    
    try {
      const newUser = await userAPI.create(userData)
      users.value.push(newUser)
      return newUser
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      setLoading(false)
    }
  }

  // 更新用戶
  const updateUser = async (id, userData) => {
    setLoading(true)
    clearError()
    
    try {
      const updatedUser = await userAPI.update(id, userData)
      
      // 更新列表中的用戶
      const index = users.value.findIndex(u => u.id === id)
      if (index !== -1) {
        users.value[index] = updatedUser
      }
      
      return updatedUser
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      setLoading(false)
    }
  }

  // 刪除用戶
  const deleteUser = async (id) => {
    setLoading(true)
    clearError()
    
    try {
      await userAPI.delete(id)
      
      // 從列表中移除
      users.value = users.value.filter(u => u.id !== id)
      
      return true
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      setLoading(false)
    }
  }

  // 批量刪除用戶
  const batchDeleteUsers = async (ids) => {
    setLoading(true)
    clearError()
    
    try {
      // 批量刪除
      const deletePromises = ids.map(id => userAPI.delete(id))
      await Promise.all(deletePromises)
      
      // 從列表中移除
      users.value = users.value.filter(u => !ids.includes(u.id))
      
      return true
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      setLoading(false)
    }
  }

  // 搜尋用戶
  const searchUsers = async (keyword) => {
    setLoading(true)
    clearError()
    
    try {
      const searchResults = await userAPI.search(keyword)
      return searchResults
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      setLoading(false)
    }
  }

  // 切換用戶啟用狀態
  const toggleUserStatus = async (id) => {
    const user = users.value.find(u => u.id === id)
    if (!user) throw new Error('用戶不存在')
    
    try {
      const updatedUser = await updateUser(id, { isActive: !user.isActive })
      return updatedUser
    } catch (err) {
      throw err
    }
  }

  // === 重置狀態 ===
  const resetState = () => {
    users.value = []
    loading.value = false
    error.value = null
    lastFetchTime.value = null
  }

  return {
    // State
    users,
    loading,
    error,
    lastFetchTime, // 🆕
    
    // Getters
    activeUsers,
    userCount,
    activeUserCount,
    isStale, // 🆕
    
    // Actions
    clearError,
    setLoading,
    setUsers, // 🆕
    
    // User Management Actions
    fetchUsers,
    fetchUser,
    createUser,
    updateUser,
    deleteUser,
    batchDeleteUsers,
    searchUsers,
    toggleUserStatus,
    
    // Utility Actions
    resetState
  }
})
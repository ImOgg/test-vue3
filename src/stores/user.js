import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { userAPI, authAPI } from '../services/api/index.js'

export const useUserStore = defineStore('user', () => {
  // 🎯 State
  const users = ref([])
  const currentUser = ref(null)
  const token = ref(localStorage.getItem('token'))
  const loading = ref(false)
  const error = ref(null)

  // 🎯 Getters (computed)
  const isLoggedIn = computed(() => !!token.value)
  const activeUsers = computed(() => users.value.filter(u => u.isActive))
  const userCount = computed(() => users.value.length)
  const activeUserCount = computed(() => activeUsers.value.length)

  // 🎯 Actions

  // 清除錯誤
  const clearError = () => {
    error.value = null
  }

  // 設置載入狀態
  const setLoading = (state) => {
    loading.value = state
  }

  // === 認證相關 ===
  
  // 登入
  const login = async (loginData) => {
    setLoading(true)
    clearError()
    
    try {
      const response = await authAPI.login(loginData)
      
      // 儲存 token 和用戶資訊
      token.value = response.token
      currentUser.value = response.user
      localStorage.setItem('token', response.token)
      
      return { success: true, user: response.user }
    } catch (err) {
      error.value = err.message
      return { success: false, error: err.message }
    } finally {
      setLoading(false)
    }
  }

  // 登出
  const logout = async () => {
    try {
      await authAPI.logout()
    } catch (err) {
      console.error('登出錯誤:', err)
    } finally {
      // 無論如何都清除本地狀態
      token.value = null
      currentUser.value = null
      localStorage.removeItem('token')
    }
  }

  // 檢查登入狀態
  const checkAuth = async () => {
    const storedToken = localStorage.getItem('token')
    if (!storedToken) return false

    try {
      const isValid = await authAPI.validateToken(storedToken)
      if (isValid) {
        token.value = storedToken
        // 可以在這裡獲取當前用戶資訊
        return true
      }
    } catch (err) {
      console.error('Token 驗證失敗:', err)
      logout()
    }
    
    return false
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
      
      // 如果更新的是當前用戶，也要更新 currentUser
      if (currentUser.value && currentUser.value.id === id) {
        currentUser.value = updatedUser
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
    currentUser.value = null
    token.value = null
    loading.value = false
    error.value = null
    localStorage.removeItem('token')
  }

  return {
    // State
    users,
    currentUser,
    token,
    loading,
    error,
    
    // Getters
    isLoggedIn,
    activeUsers,
    userCount,
    activeUserCount,
    
    // Actions
    clearError,
    setLoading,
    
    // Auth Actions
    login,
    logout,
    checkAuth,
    
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
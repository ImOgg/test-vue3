import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { commentAPI, settingsAPI, statsAPI } from '../services/api/index.js'

export const useAppStore = defineStore('app', () => {
  // 🎯 State
  const comments = ref([])
  const settings = ref(null)
  const stats = ref(null)
  const loading = ref(false)
  const error = ref(null)
  
  // 應用狀態
  const theme = ref('light')
  const language = ref('zh-TW')
  const notifications = ref({
    email: true,
    push: true,
    sms: false
  })

  // 🎯 Getters
  const commentCount = computed(() => comments.value.length)
  
  // 根據文章ID分組的留言
  const commentsByPost = computed(() => {
    const grouped = {}
    comments.value.forEach(comment => {
      if (!grouped[comment.postId]) {
        grouped[comment.postId] = []
      }
      grouped[comment.postId].push(comment)
    })
    return grouped
  })

  // 根據用戶ID分組的留言
  const commentsByUser = computed(() => {
    const grouped = {}
    comments.value.forEach(comment => {
      if (!grouped[comment.userId]) {
        grouped[comment.userId] = []
      }
      grouped[comment.userId].push(comment)
    })
    return grouped
  })

  const isDarkTheme = computed(() => theme.value === 'dark')

  // 🎯 Actions
  
  // 清除錯誤
  const clearError = () => {
    error.value = null
  }

  // 設置載入狀態
  const setLoading = (state) => {
    loading.value = state
  }

  // === 留言管理 ===
  
  // 獲取所有留言
  const fetchComments = async (params = {}) => {
    setLoading(true)
    clearError()
    
    try {
      comments.value = await commentAPI.getAll(params)
      return comments.value
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      setLoading(false)
    }
  }

  // 根據文章ID獲取留言
  const fetchCommentsByPostId = async (postId) => {
    setLoading(true)
    clearError()
    
    try {
      const postComments = await commentAPI.getByPostId(postId)
      
      // 合併到主列表中（避免重複）
      postComments.forEach(comment => {
        const existingIndex = comments.value.findIndex(c => c.id === comment.id)
        if (existingIndex !== -1) {
          comments.value[existingIndex] = comment
        } else {
          comments.value.push(comment)
        }
      })
      
      return postComments
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      setLoading(false)
    }
  }

  // 根據用戶ID獲取留言
  const fetchCommentsByUserId = async (userId) => {
    setLoading(true)
    clearError()
    
    try {
      const userComments = await commentAPI.getByUserId(userId)
      
      // 合併到主列表中
      userComments.forEach(comment => {
        const existingIndex = comments.value.findIndex(c => c.id === comment.id)
        if (existingIndex !== -1) {
          comments.value[existingIndex] = comment
        } else {
          comments.value.push(comment)
        }
      })
      
      return userComments
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      setLoading(false)
    }
  }

  // 創建留言
  const createComment = async (commentData) => {
    setLoading(true)
    clearError()
    
    try {
      const newComment = await commentAPI.create(commentData)
      comments.value.unshift(newComment) // 新留言放在最前面
      return newComment
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      setLoading(false)
    }
  }

  // 更新留言
  const updateComment = async (id, commentData) => {
    setLoading(true)
    clearError()
    
    try {
      const updatedComment = await commentAPI.update(id, commentData)
      
      // 更新列表中的留言
      const index = comments.value.findIndex(c => c.id === id)
      if (index !== -1) {
        comments.value[index] = updatedComment
      }
      
      return updatedComment
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      setLoading(false)
    }
  }

  // 刪除留言
  const deleteComment = async (id) => {
    setLoading(true)
    clearError()
    
    try {
      await commentAPI.delete(id)
      
      // 從列表中移除
      comments.value = comments.value.filter(c => c.id !== id)
      
      return true
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      setLoading(false)
    }
  }

  // 批量刪除留言
  const batchDeleteComments = async (ids) => {
    setLoading(true)
    clearError()
    
    try {
      await commentAPI.batchDelete(ids)
      
      // 從列表中移除
      comments.value = comments.value.filter(c => !ids.includes(c.id))
      
      return true
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      setLoading(false)
    }
  }

  // === 設定管理 ===
  
  // 載入設定
  const loadSettings = async () => {
    setLoading(true)
    clearError()
    
    try {
      settings.value = await settingsAPI.get()
      
      // 應用設定到本地狀態
      if (settings.value.theme) {
        theme.value = settings.value.theme
      }
      if (settings.value.language) {
        language.value = settings.value.language
      }
      if (settings.value.notifications) {
        notifications.value = { ...notifications.value, ...settings.value.notifications }
      }
      
      return settings.value
    } catch (err) {
      error.value = err.message
      // 如果設定載入失敗，使用預設值
      settings.value = {
        theme: 'light',
        language: 'zh-TW',
        notifications: {
          email: true,
          push: true,
          sms: false
        }
      }
    } finally {
      setLoading(false)
    }
  }

  // 更新設定
  const updateSettings = async (newSettings) => {
    setLoading(true)
    clearError()
    
    try {
      const updatedSettings = await settingsAPI.update(newSettings)
      settings.value = updatedSettings
      
      // 應用新設定
      if (updatedSettings.theme) {
        theme.value = updatedSettings.theme
      }
      if (updatedSettings.language) {
        language.value = updatedSettings.language
      }
      if (updatedSettings.notifications) {
        notifications.value = { ...notifications.value, ...updatedSettings.notifications }
      }
      
      return updatedSettings
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      setLoading(false)
    }
  }

  // === 統計資料 ===
  
  // 載入統計資料
  const loadStats = async () => {
    setLoading(true)
    clearError()
    
    try {
      stats.value = await statsAPI.getStats()
      return stats.value
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      setLoading(false)
    }
  }

  // === 應用狀態管理 ===
  
  // 切換主題
  const toggleTheme = async () => {
    const newTheme = theme.value === 'light' ? 'dark' : 'light'
    
    try {
      if (settings.value) {
        await updateSettings({ ...settings.value, theme: newTheme })
      } else {
        theme.value = newTheme
      }
    } catch (err) {
      // 如果更新失敗，至少在本地切換
      theme.value = newTheme
    }
  }

  // 設置語言
  const setLanguage = async (lang) => {
    try {
      if (settings.value) {
        await updateSettings({ ...settings.value, language: lang })
      } else {
        language.value = lang
      }
    } catch (err) {
      // 如果更新失敗，至少在本地設置
      language.value = lang
    }
  }

  // 更新通知設定
  const updateNotifications = async (notificationSettings) => {
    try {
      const newNotifications = { ...notifications.value, ...notificationSettings }
      
      if (settings.value) {
        await updateSettings({ ...settings.value, notifications: newNotifications })
      } else {
        notifications.value = newNotifications
      }
    } catch (err) {
      // 如果更新失敗，至少在本地設置
      notifications.value = { ...notifications.value, ...notificationSettings }
    }
  }

  // 重置狀態
  const resetState = () => {
    comments.value = []
    settings.value = null
    stats.value = null
    loading.value = false
    error.value = null
    theme.value = 'light'
    language.value = 'zh-TW'
    notifications.value = {
      email: true,
      push: true,
      sms: false
    }
  }

  return {
    // State
    comments,
    settings,
    stats,
    loading,
    error,
    theme,
    language,
    notifications,
    
    // Getters
    commentCount,
    commentsByPost,
    commentsByUser,
    isDarkTheme,
    
    // Actions
    clearError,
    setLoading,
    
    // Comment Actions
    fetchComments,
    fetchCommentsByPostId,
    fetchCommentsByUserId,
    createComment,
    updateComment,
    deleteComment,
    batchDeleteComments,
    
    // Settings Actions
    loadSettings,
    updateSettings,
    
    // Stats Actions
    loadStats,
    
    // App State Actions
    toggleTheme,
    setLanguage,
    updateNotifications,
    resetState
  }
})
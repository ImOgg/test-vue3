import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { commentAPI } from '../services/api/index.js'

export const useAppStore = defineStore('app', () => {
  // 🎯 State
  const comments = ref([])
  const loading = ref(false)
  const error = ref(null)

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

  // 重置狀態
  const resetState = () => {
    comments.value = []
    loading.value = false
    error.value = null
  }

  return {
    // State
    comments,
    loading,
    error,
    
    // Getters
    commentCount,
    commentsByPost,
    commentsByUser,
    
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
    
    // Utility Actions
    resetState
  }
})
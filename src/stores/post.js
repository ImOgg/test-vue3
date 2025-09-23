import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { postAPI } from '../services/api/index.js'
import { commentAPI } from '../services/api/index.js'

export const usePostStore = defineStore('post', () => {
  // 🎯 State
  const posts = ref([])
  const comments = ref([])
  const currentPost = ref(null)
  const loading = ref(false)
  const error = ref(null)

  // 🎯 Getters
  const postCount = computed(() => posts.value.length)
  const commentCount = computed(() => comments.value.length)
  const publishedPosts = computed(() => posts.value.filter(p => p.status === 'published'))
  const draftPosts = computed(() => posts.value.filter(p => p.status === 'draft'))
  const archivedPosts = computed(() => posts.value.filter(p => p.status === 'archived'))

  // 根據用戶ID分組的文章
  const postsByUser = computed(() => {
    const grouped = {}
    posts.value.forEach(post => {
      if (!grouped[post.userId]) {
        grouped[post.userId] = []
      }
      grouped[post.userId].push(post)
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

  // 獲取所有文章
  const fetchPosts = async (params = {}) => {
    setLoading(true)
    clearError()
    
    try {
      posts.value = await postAPI.getAll(params)
      return posts.value
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      setLoading(false)
    }
  }

  // 獲取單一文章
  const fetchPost = async (id) => {
    setLoading(true)
    clearError()
    
    try {
      const post = await postAPI.getOne(id)
      currentPost.value = post
      
      // 更新列表中的文章
      const index = posts.value.findIndex(p => p.id === id)
      if (index !== -1) {
        posts.value[index] = post
      } else {
        posts.value.push(post)
      }
      
      return post
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      setLoading(false)
    }
  }

  // 根據用戶ID獲取文章
  const fetchPostsByUserId = async (userId) => {
    setLoading(true)
    clearError()
    
    try {
      const userPosts = await postAPI.getByUserId(userId)
      
      // 將用戶的文章合併到主列表中（避免重複）
      userPosts.forEach(post => {
        const existingIndex = posts.value.findIndex(p => p.id === post.id)
        if (existingIndex !== -1) {
          posts.value[existingIndex] = post
        } else {
          posts.value.push(post)
        }
      })
      
      return userPosts
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      setLoading(false)
    }
  }

  // 創建文章
  const createPost = async (postData) => {
    setLoading(true)
    clearError()
    
    try {
      const newPost = await postAPI.create(postData)
      posts.value.unshift(newPost) // 新文章放在最前面
      return newPost
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      setLoading(false)
    }
  }

  // 更新文章
  const updatePost = async (id, postData) => {
    setLoading(true)
    clearError()
    
    try {
      const updatedPost = await postAPI.update(id, postData)
      
      // 更新列表中的文章
      const index = posts.value.findIndex(p => p.id === id)
      if (index !== -1) {
        posts.value[index] = updatedPost
      }
      
      // 如果是當前文章，也要更新
      if (currentPost.value && currentPost.value.id === id) {
        currentPost.value = updatedPost
      }
      
      return updatedPost
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      setLoading(false)
    }
  }

  // 刪除文章
  const deletePost = async (id) => {
    setLoading(true)
    clearError()
    
    try {
      await postAPI.delete(id)
      
      // 從列表中移除
      posts.value = posts.value.filter(p => p.id !== id)
      
      // 如果刪除的是當前文章，清空 currentPost
      if (currentPost.value && currentPost.value.id === id) {
        currentPost.value = null
      }
      
      return true
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      setLoading(false)
    }
  }

  // 發布文章
  const publishPost = async (id) => {
    try {
      const publishedPost = await postAPI.publish(id)
      
      // 更新列表中的文章狀態
      const index = posts.value.findIndex(p => p.id === id)
      if (index !== -1) {
        posts.value[index] = publishedPost
      }
      
      return publishedPost
    } catch (err) {
      error.value = err.message
      throw err
    }
  }

  // 取消發布文章
  const unpublishPost = async (id) => {
    try {
      const draftPost = await postAPI.unpublish(id)
      
      // 更新列表中的文章狀態
      const index = posts.value.findIndex(p => p.id === id)
      if (index !== -1) {
        posts.value[index] = draftPost
      }
      
      return draftPost
    } catch (err) {
      error.value = err.message
      throw err
    }
  }

  // 歸檔文章
  const archivePost = async (id) => {
    try {
      const archivedPost = await postAPI.archive(id)
      
      // 更新列表中的文章狀態
      const index = posts.value.findIndex(p => p.id === id)
      if (index !== -1) {
        posts.value[index] = archivedPost
      }
      
      return archivedPost
    } catch (err) {
      error.value = err.message
      throw err
    }
  }

  // 搜尋文章
  const searchPosts = async (keyword) => {
    setLoading(true)
    clearError()
    
    try {
      const searchResults = await postAPI.search(keyword)
      return searchResults
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      setLoading(false)
    }
  }

  // 獲取已發布的文章
  const fetchPublishedPosts = async () => {
    setLoading(true)
    clearError()
    
    try {
      const published = await postAPI.getPublished()
      
      // 合併到主列表
      published.forEach(post => {
        const existingIndex = posts.value.findIndex(p => p.id === post.id)
        if (existingIndex !== -1) {
          posts.value[existingIndex] = post
        } else {
          posts.value.push(post)
        }
      })
      
      return published
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      setLoading(false)
    }
  }

  // 獲取草稿文章
  const fetchDraftPosts = async () => {
    setLoading(true)
    clearError()
    
    try {
      const drafts = await postAPI.getDrafts()
      
      // 合併到主列表
      drafts.forEach(post => {
        const existingIndex = posts.value.findIndex(p => p.id === post.id)
        if (existingIndex !== -1) {
          posts.value[existingIndex] = post
        } else {
          posts.value.push(post)
        }
      })
      
      return drafts
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      setLoading(false)
    }
  }

  // 設置當前文章
  const setCurrentPost = (post) => {
    currentPost.value = post
  }

  // 清空當前文章
  const clearCurrentPost = () => {
    currentPost.value = null
  }

  // === 留言相關 ===
  
  // 獲取所有留言
  const fetchComments = async () => {
    setLoading(true)
    clearError()
    
    try {
      comments.value = await commentAPI.getAll()
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
      return postComments
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
      comments.value.push(newComment)
      return newComment
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      setLoading(false)
    }
  }

  // 刪除留言
  const deleteComment = async (commentId) => {
    setLoading(true)
    clearError()
    
    try {
      await commentAPI.delete(commentId)
      comments.value = comments.value.filter(c => c.id !== commentId)
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
    posts.value = []
    comments.value = []
    currentPost.value = null
    loading.value = false
    error.value = null
  }

  return {
    // State
    posts,
    comments,
    currentPost,
    loading,
    error,
    
    // Getters
    postCount,
    commentCount,
    publishedPosts,
    draftPosts,
    archivedPosts,
    postsByUser,
    
    // Actions - General
    clearError,
    setLoading,
    resetState,
    
    // Actions - Posts
    fetchPosts,
    fetchPost,
    fetchPostsByUserId,
    createPost,
    updatePost,
    deletePost,
    publishPost,
    unpublishPost,
    archivePost,
    searchPosts,
    fetchPublishedPosts,
    fetchDraftPosts,
    setCurrentPost,
    clearCurrentPost,
    
    // Actions - Comments
    fetchComments,
    fetchCommentsByPostId,
    createComment,
    deleteComment
  }
})
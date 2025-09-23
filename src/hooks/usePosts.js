import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query'
import { computed } from 'vue'
import { postAPI } from '@/services/api/post.js'
import { parsePosts, parsePost, parseComments } from '@/services/schema/index.js'

// 獲取所有文章
export function usePosts() {
  return useQuery({
    queryKey: ['posts'],
    queryFn: async () => {
      const response = await postAPI.getAll()
      return response
    },
    staleTime: 5 * 60 * 1000, // 5分鐘不重新獲取
  })
}

// 獲取單個文章 - 從所有文章中過濾 (修復 JSON Server 問題)
export function usePost(id) {
  const postsQuery = usePosts()
  
  return {
    data: computed(() => {
      if (!postsQuery.data.value || !id.value) return null
      return postsQuery.data.value.find(post => post.id === parseInt(id.value))
    }),
    isLoading: postsQuery.isLoading,
    isError: postsQuery.isError,
    error: postsQuery.error,
    refetch: postsQuery.refetch,
  }
}

// 獲取文章評論
export function usePostComments(postId) {
  return useQuery({
    queryKey: ['comments', 'post', postId],
    queryFn: async () => {
      const response = await fetch(`http://localhost:3001/comments?postId=${postId.value}`)
      const data = await response.json()
      return parseComments(data)
    },
    enabled: computed(() => !!postId.value),
  })
}

// 創建文章 Mutation
export function useCreatePost() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (postData) => postAPI.create(postData),
    onSuccess: () => {
      // 更新文章列表緩存
      queryClient.invalidateQueries({ queryKey: ['posts'] })
    },
  })
}

// 創建評論 Mutation
export function useCreateComment() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (commentData) => {
      const response = await fetch('http://localhost:3001/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(commentData)
      })
      return response.json()
    },
    onSuccess: (data, variables) => {
      // 更新特定文章的評論緩存
      queryClient.invalidateQueries({ 
        queryKey: ['comments', 'post', variables.postId] 
      })
    },
  })
}

// 組合 hook：獲取文章及其評論
export function usePostWithComments(postId) {
  const postQuery = usePost(postId)
  const commentsQuery = usePostComments(postId)
  
  return {
    post: computed(() => postQuery.data.value),
    comments: computed(() => commentsQuery.data.value || []),
    isLoading: computed(() => postQuery.isLoading.value || commentsQuery.isLoading.value),
    error: computed(() => postQuery.error.value || commentsQuery.error.value),
    refetch: () => {
      postQuery.refetch()
      commentsQuery.refetch()
    }
  }
}
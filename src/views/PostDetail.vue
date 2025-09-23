<template>
  <div class="post-detail-container">
    <!-- 載入狀態 -->
    <div v-if="loading" class="loading">
      <div class="loading-spinner"></div>
      <p>載入文章資料中...</p>
    </div>

    <!-- 文章不存在 -->
    <div v-else-if="!post" class="not-found">
      <div class="not-found-icon">😔</div>
      <h2>文章不存在</h2>
      <p>找不到 ID 為 {{ postId }} 的文章</p>
      <router-link to="/posts" class="btn btn-primary">
        返回文章列表
      </router-link>
    </div>

    <!-- 文章詳情 -->
    <div v-else class="post-detail">
      <!-- 頁面標題 -->
      <div class="header">
        <div class="breadcrumb">
          <router-link to="/">首頁</router-link>
          <span>/</span>
          <router-link to="/posts">文章管理</router-link>
          <span>/</span>
          <span>{{ post.title }}</span>
        </div>
      </div>

      <!-- 文章內容 -->
      <article class="article">
        <header class="article-header">
          <h1 class="article-title">{{ post.title }}</h1>
          
          <div class="article-meta">
            <div class="author-info">
              <div class="author-avatar">
                {{ getAuthorInitials() }}
              </div>
              <div class="author-details">
                <h3 class="author-name">{{ getAuthorName() }}</h3>
              </div>
            </div>
            
            <div class="article-stats">
              <span class="stat-item"> {{ postComments.length }} 留言</span>
            </div>
          </div>

          <div v-if="post.tags && post.tags.length" class="article-tags">
            <span v-for="tag in post.tags" :key="tag" class="tag">
              #{{ tag }}
            </span>
          </div>
        </header>

        <div class="article-content">
          <div class="content-text">
            {{ post.content }}
          </div>
        </div>

        <footer class="article-footer">
          <div class="interaction-buttons">
            <button @click="scrollToComments" class="btn-interaction">
              💬 {{ postComments.length }} 留言
            </button>
          </div>

          <div class="post-navigation">
            <router-link 
              v-if="previousPost" 
              :to="`/posts/${previousPost.id}`" 
              class="nav-link prev"
            >
              ← 上一篇: {{ previousPost.title }}
            </router-link>
            <router-link 
              v-if="nextPost" 
              :to="`/posts/${nextPost.id}`" 
              class="nav-link next"
            >
              下一篇: {{ nextPost.title }} →
            </router-link>
          </div>
        </footer>
      </article>

      <!-- 留言區 -->
      <section id="comments" class="comments-section">
        <div class="comments-header">
          <h2>💬 留言 ({{ postComments.length }})</h2>
          <div class="comments-sort">
            <select v-model="commentsSortBy" class="sort-select">
              <option value="newest">最新回覆</option>
              <option value="oldest">最早回覆</option>
            </select>
          </div>
        </div>

        <!-- 新增留言表單 -->
        <div class="comment-form">
          <h3>發表留言</h3>
          <form @submit.prevent="submitComment">
            <div class="form-group">
              <label for="comment-author">留言者</label>
              <select id="comment-author" v-model="commentForm.userId" required>
                <option value="">請選擇留言者</option>
                <option v-for="user in users" :key="user.id" :value="user.id">
                  {{ user.name }}
                </option>
              </select>
            </div>
            
            <div class="form-group">
              <label for="comment-content">留言內容</label>
              <textarea
                id="comment-content"
                v-model="commentForm.content"
                placeholder="請輸入您的留言..."
                rows="4"
                required
              ></textarea>
            </div>

            <button type="submit" class="btn btn-primary" :disabled="commentSubmitting">
              {{ commentSubmitting ? '發表中...' : '發表留言' }}
            </button>
          </form>
        </div>

        <!-- 留言列表 -->
        <div v-if="sortedComments.length === 0" class="empty-comments">
          <p>目前還沒有留言，成為第一個留言的人吧！</p>
        </div>

        <div v-else class="comments-list">
          <div
            v-for="comment in sortedComments"
            :key="comment.id"
            class="comment-item"
          >
            <div class="comment-avatar">
              {{ getCommentAuthorInitials(comment.userId) }}
            </div>
            
            <div class="comment-content">
              <div class="comment-header">
                <h4 class="comment-author">{{ getCommentAuthorName(comment.userId) }}</h4>
              </div>
              
              <p class="comment-text">{{ comment.content }}</p>
              
              <div class="comment-actions">
                <button @click="replyToComment(comment)" class="comment-action-btn">
                  回覆
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- 相關文章 -->
      <section class="related-posts">
        <h2>📚 相關文章</h2>
        <div v-if="relatedPosts.length === 0" class="empty-related">
          <p>暫無相關文章</p>
        </div>
        
        <div v-else class="related-grid">
          <article
            v-for="relatedPost in relatedPosts"
            :key="relatedPost.id"
            class="related-item"
            @click="viewPost(relatedPost.id)"
          >
            <h3 class="related-title">{{ relatedPost.title }}</h3>
            <p class="related-excerpt">{{ getExcerpt(relatedPost.content) }}</p>
            <div class="related-meta">
              <span>{{ getAuthorName(relatedPost.userId) }}</span>
            </div>
          </article>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { usePostWithComments, usePosts, useCreateComment } from '@/hooks/usePosts.js'
import { useUsers } from '@/hooks/useUsers.js'

const route = useRoute()
const router = useRouter()

// 響應式資料
const commentSubmitting = ref(false)
const commentsSortBy = ref('newest')

const postId = computed(() => parseInt(route.params.id))

// 使用新的 hooks
const { post, comments: postComments, isLoading, error } = usePostWithComments(postId)
const { data: allPosts } = usePosts()
const { users } = useUsers()

// 調試信息
console.log('PostDetail - postId:', postId.value)
console.log('PostDetail - post:', post.value)
console.log('PostDetail - isLoading:', isLoading.value)

// Mutations
const createCommentMutation = useCreateComment()

const commentForm = ref({
  userId: '',
  content: ''
})

// 計算屬性
const loading = computed(() => isLoading.value)

const sortedComments = computed(() => {
  if (!postComments.value) return []
  const comments = [...postComments.value]
  // 不再按時間排序，按 ID 排序
  return comments.sort((a, b) => {
    return commentsSortBy.value === 'newest' ? b.id - a.id : a.id - b.id
  })
})

const currentPostIndex = computed(() => {
  if (!allPosts.value) return -1
  return allPosts.value.findIndex(p => p.id === postId.value)
})

const previousPost = computed(() => {
  if (!allPosts.value) return null
  const index = currentPostIndex.value
  return index > 0 ? allPosts.value[index - 1] : null
})

const nextPost = computed(() => {
  if (!allPosts.value) return null
  const index = currentPostIndex.value
  return index < allPosts.value.length - 1 ? allPosts.value[index + 1] : null
})

const relatedPosts = computed(() => {
  if (!post.value || !allPosts.value) return []
  
  // 簡單的相關文章邏輯：同作者的其他文章
  return allPosts.value
    .filter(p => p.id !== postId.value && p.userId === post.value.userId)
    .slice(0, 3)
})

// 方法
const getAuthorName = (userId = post.value?.userId) => {
  if (!users.value) return '未知作者'
  const user = users.value.find(u => u.id === userId)
  return user ? user.name : '未知作者'
}

const getAuthorInitials = (userId = post.value?.userId) => {
  const name = getAuthorName(userId)
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
}

const getCommentAuthorName = (userId) => {
  return getAuthorName(userId)
}

const getCommentAuthorInitials = (userId) => {
  return getAuthorInitials(userId)
}

const formatDate = (dateString) => {
  if (!dateString) return '未知時間'
  return new Date(dateString).toLocaleDateString('zh-TW', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const getExcerpt = (content, maxLength = 100) => {
  if (!content) return ''
  return content.length > maxLength ? content.slice(0, maxLength) + '...' : content
}

const scrollToComments = () => {
  const commentsEl = document.getElementById('comments')
  if (commentsEl) {
    commentsEl.scrollIntoView({ behavior: 'smooth' })
  }
}

const submitComment = async () => {
  if (!commentForm.value.userId || !commentForm.value.content) return
  
  commentSubmitting.value = true
  try {
    await createCommentMutation.mutateAsync({
      postId: postId.value,
      userId: commentForm.value.userId,
      content: commentForm.value.content
    })
    
    // 重置表單
    commentForm.value = { userId: '', content: '' }
  } catch (error) {
    console.error('發表留言失敗:', error)
    alert('發表留言失敗，請確認 API 服務是否正常運行')
  } finally {
    commentSubmitting.value = false
  }
}

const replyToComment = (comment) => {
  commentForm.value.content = `@${getCommentAuthorName(comment.userId)} `
  const textarea = document.getElementById('comment-content')
  if (textarea) {
    textarea.focus()
  }
}

const viewPost = (id) => {
  router.push(`/posts/${id}`)
}
</script>

<style scoped>
.post-detail-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 2rem;
}

.loading {
  text-align: center;
  padding: 3rem;
}

.loading-spinner {
  width: 3rem;
  height: 3rem;
  border: 3px solid #e5e7eb;
  border-top: 3px solid #667eea;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 1rem;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.not-found {
  text-align: center;
  padding: 3rem;
  background: white;
  border-radius: 0.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.not-found-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.breadcrumb {
  color: #6b7280;
}

.breadcrumb a {
  color: #667eea;
  text-decoration: none;
}

.breadcrumb a:hover {
  text-decoration: underline;
}

.breadcrumb span {
  margin: 0 0.5rem;
}

.article {
  background: white;
  border-radius: 0.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  margin-bottom: 2rem;
}

.article-header {
  padding: 2rem;
  border-bottom: 1px solid #e5e7eb;
}

.article-title {
  font-size: 2.5rem;
  line-height: 1.2;
  color: #1f2937;
  margin: 0 0 1.5rem;
}

.article-meta {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
  gap: 1rem;
}

.author-info {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.author-avatar {
  width: 3rem;
  height: 3rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 1.2rem;
}

.author-name {
  margin: 0;
  color: #1f2937;
  font-size: 1.1rem;
}

.publish-date {
  margin: 0;
  color: #6b7280;
  font-size: 0.875rem;
}

.article-stats {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.stat-item {
  color: #6b7280;
  font-size: 0.875rem;
}

.article-tags {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.tag {
  background: #f3f4f6;
  color: #6b7280;
  padding: 0.25rem 0.75rem;
  border-radius: 1rem;
  font-size: 0.875rem;
}

.article-content {
  padding: 2rem;
}

.content-text {
  font-size: 1.1rem;
  line-height: 1.8;
  color: #374151;
  white-space: pre-wrap;
}

.article-footer {
  padding: 2rem;
  border-top: 1px solid #e5e7eb;
}

.interaction-buttons {
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
  flex-wrap: wrap;
}

.btn-interaction {
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  color: #374151;
  padding: 0.75rem 1.5rem;
  border-radius: 0.5rem;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 0.875rem;
}

.btn-interaction:hover {
  background: #f3f4f6;
  border-color: #d1d5db;
}

.post-navigation {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
}

.nav-link {
  flex: 1;
  background: #f9fafb;
  padding: 1rem;
  border-radius: 0.5rem;
  text-decoration: none;
  color: #374151;
  border: 1px solid #e5e7eb;
  transition: all 0.2s;
}

.nav-link:hover {
  background: #f3f4f6;
  border-color: #667eea;
  color: #667eea;
}

.nav-link.prev {
  text-align: left;
}

.nav-link.next {
  text-align: right;
}

.comments-section {
  background: white;
  border-radius: 0.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  padding: 2rem;
  margin-bottom: 2rem;
}

.comments-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.comments-header h2 {
  margin: 0;
  color: #1f2937;
}

.sort-select {
  padding: 0.5rem;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  background: white;
}

.comment-form {
  background: #f9fafb;
  padding: 1.5rem;
  border-radius: 0.5rem;
  margin-bottom: 2rem;
}

.comment-form h3 {
  margin: 0 0 1rem;
  color: #1f2937;
}

.form-group {
  margin-bottom: 1rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: #374151;
}

.form-group select,
.form-group textarea {
  width: 100%;
  padding: 0.75rem;
  border: 2px solid #e5e7eb;
  border-radius: 0.5rem;
  font-size: 1rem;
}

.form-group textarea {
  resize: vertical;
}

.form-group select:focus,
.form-group textarea:focus {
  outline: none;
  border-color: #667eea;
}

.empty-comments {
  text-align: center;
  padding: 2rem;
  color: #6b7280;
}

.comments-list {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.comment-item {
  display: flex;
  gap: 1rem;
  padding: 1.5rem;
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
}

.comment-avatar {
  width: 2.5rem;
  height: 2.5rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 0.875rem;
  flex-shrink: 0;
}

.comment-content {
  flex: 1;
}

.comment-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.comment-author {
  margin: 0;
  color: #1f2937;
  font-size: 0.875rem;
}

.comment-date {
  color: #6b7280;
  font-size: 0.75rem;
}

.comment-text {
  margin: 0 0 1rem;
  color: #374151;
  line-height: 1.6;
}

.comment-actions {
  display: flex;
  gap: 1rem;
}

.comment-action-btn {
  background: none;
  border: none;
  color: #6b7280;
  cursor: pointer;
  font-size: 0.75rem;
  transition: color 0.2s;
}

.comment-action-btn:hover {
  color: #374151;
}

.related-posts {
  background: white;
  border-radius: 0.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  padding: 2rem;
}

.related-posts h2 {
  margin: 0 0 1.5rem;
  color: #1f2937;
}

.empty-related {
  text-align: center;
  padding: 2rem;
  color: #6b7280;
}

.related-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
}

.related-item {
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  padding: 1rem;
  cursor: pointer;
  transition: all 0.2s;
}

.related-item:hover {
  border-color: #667eea;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.related-title {
  margin: 0 0 0.5rem;
  color: #1f2937;
  font-size: 1rem;
}

.related-excerpt {
  margin: 0 0 0.5rem;
  color: #6b7280;
  font-size: 0.875rem;
  line-height: 1.5;
}

.related-meta {
  display: flex;
  justify-content: space-between;
  font-size: 0.75rem;
  color: #9ca3af;
}

.btn {
  padding: 0.75rem 1.5rem;
  border-radius: 0.5rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
}

.btn-primary {
  background: #667eea;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: #5a6fd8;
}

.btn-danger {
  background: #dc2626;
  color: white;
}

.btn-danger:hover:not(:disabled) {
  background: #b91c1c;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>
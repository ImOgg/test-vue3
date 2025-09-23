<template>
  <div class="post-list-container">
    <!-- 標題與操作按鈕 -->
    <div class="header">
      <h1>📝 文章管理</h1>
      <div class="header-actions">
        <button @click="openCreateModal" class="btn btn-primary">
          ➕ 發表文章
        </button>
        <button @click="refreshPosts" class="btn btn-outline" :disabled="loading">
          {{ loading ? '載入中...' : '🔄 重新載入' }}
        </button>
      </div>
    </div>

    <!-- 搜尋與篩選 -->
    <div class="filters">
      <div class="search-box">
        <input
          v-model="searchQuery"
          type="text"
          placeholder="🔍 搜尋文章標題或內容..."
          class="search-input"
        />
      </div>
      <div class="filter-options">
        <select v-model="authorFilter" class="filter-select">
          <option value="">所有作者</option>
          <option v-for="author in authors" :key="author.id" :value="author.id">
            {{ author.name }}
          </option>
        </select>
        <select v-model="sortBy" class="filter-select">
          <option value="title">按標題排序</option>
          <option value="author">按作者排序</option>
          <option value="createdAt">按發表時間排序</option>
          <option value="comments">按留言數排序</option>
        </select>
        <select v-model="sortOrder" class="filter-select">
          <option value="asc">升序</option>
          <option value="desc">降序</option>
        </select>
      </div>
    </div>

    <!-- 文章統計 -->
    <div class="stats">
      <div class="stat-item">
        <span class="stat-label">文章總數</span>
        <span class="stat-value">{{ postStore.posts?.length || 0 }}</span>
      </div>
      <div class="stat-item">
        <span class="stat-label">作者人數</span>
        <span class="stat-value">{{ authors?.length || 0 }}</span>
      </div>
      <div class="stat-item">
        <span class="stat-label">留言總數</span>
        <span class="stat-value">{{ postStore.comments?.length || 0 }}</span>
      </div>
      <div class="stat-item">
        <span class="stat-label">搜尋結果</span>
        <span class="stat-value">{{ filteredPosts?.length || 0 }}</span>
      </div>
    </div>

    <!-- 文章列表 -->
    <div v-if="loading" class="loading">
      <div class="loading-spinner"></div>
      <p>載入文章資料中...</p>
    </div>

    <div v-else-if="filteredPosts.length === 0" class="empty-state">
      <div class="empty-icon">📝</div>
      <h3>沒有找到文章</h3>
      <p>{{ searchQuery ? '請嘗試不同的搜尋條件' : '開始發表第一篇文章吧！' }}</p>
      <button @click="openCreateModal" class="btn btn-primary">
        發表文章
      </button>
    </div>

    <div v-else class="posts-grid">
      <article
        v-for="post in paginatedPosts"
        :key="post.id"
        class="post-card"
        @click="viewPost(post.id)"
      >
        <div class="post-header">
          <div class="post-author">
            <div class="author-avatar">
              {{ getAuthorInitials(post.userId) }}
            </div>
            <div class="author-info">
              <h4 class="author-name">{{ getAuthorName(post.userId) }}</h4>
              <p class="post-date">{{ formatDate(post.createdAt) }}</p>
            </div>
          </div>
          <div class="post-actions" @click.stop>
            <button @click="editPost(post)" class="action-btn edit" title="編輯">
              ✏️
            </button>
            <button @click="deletePost(post)" class="action-btn delete" title="刪除">
              🗑️
            </button>
          </div>
        </div>

        <div class="post-content">
          <h2 class="post-title">{{ post.title }}</h2>
          <p class="post-excerpt">{{ getExcerpt(post.content) }}</p>
        </div>

        <div class="post-footer">
          <!-- <div class="post-stats">
            <span class="stat-item">
              💬 {{ getPostComments(post.id).length }} 留言
            </span>
            <span class="stat-item">
              👁️ {{ post.views || 0 }} 瀏覽
            </span>
          </div> -->
          <div class="post-tags" v-if="post.tags && post.tags.length">
            <span v-for="tag in post.tags.slice(0, 3)" :key="tag" class="tag">
              #{{ tag }}
            </span>
          </div>
        </div>
      </article>
    </div>

    <!-- 分頁 -->
    <div v-if="totalPages > 1" class="pagination">
      <button
        @click="currentPage = Math.max(1, currentPage - 1)"
        :disabled="currentPage === 1"
        class="page-btn"
      >
        ◀️ 上一頁
      </button>
      
      <div class="page-numbers">
        <button
          v-for="page in visiblePages"
          :key="page"
          @click="currentPage = page"
          :class="['page-btn', { active: page === currentPage }]"
        >
          {{ page }}
        </button>
      </div>
      
      <button
        @click="currentPage = Math.min(totalPages, currentPage + 1)"
        :disabled="currentPage === totalPages"
        class="page-btn"
      >
        下一頁 ▶️
      </button>
    </div>

    <!-- 文章表單 Modal -->
    <div v-if="showModal" class="modal-overlay" @click="closeModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h2>{{ isEditing ? '編輯文章' : '發表文章' }}</h2>
          <button @click="closeModal" class="close-btn">✕</button>
        </div>
        
        <form @submit.prevent="submitForm" class="post-form">
          <div class="form-group">
            <label for="title">文章標題 *</label>
            <input
              id="title"
              v-model="formData.title"
              type="text"
              :class="{ error: errors.title }"
              placeholder="請輸入文章標題"
              required
            />
            <span v-if="errors.title" class="error-message">{{ errors.title }}</span>
          </div>

          <div class="form-group">
            <label for="content">文章內容 *</label>
            <textarea
              id="content"
              v-model="formData.content"
              :class="{ error: errors.content }"
              placeholder="請輸入文章內容"
              rows="10"
              required
            ></textarea>
            <span v-if="errors.content" class="error-message">{{ errors.content }}</span>
          </div>

          <div class="form-group">
            <label for="author">作者</label>
            <select id="author" v-model="formData.userId" required>
              <option value="">請選擇作者</option>
              <option v-for="author in userStore.users" :key="author.id" :value="author.id">
                {{ author.name }}
              </option>
            </select>
            <span v-if="errors.userId" class="error-message">{{ errors.userId }}</span>
          </div>

          <div class="form-group">
            <label for="tags">標籤 (可選)</label>
            <input
              id="tags"
              v-model="tagsInput"
              type="text"
              placeholder="請輸入標籤，用逗號分隔"
            />
            <small class="form-hint">例如：技術,教學,心得</small>
          </div>

          <div class="form-actions">
            <button type="button" @click="closeModal" class="btn btn-outline">
              取消
            </button>
            <button type="submit" class="btn btn-primary" :disabled="submitting">
              {{ submitting ? '處理中...' : (isEditing ? '更新' : '發表') }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { usePostStore } from '@/stores/post'
import { useUserStore } from '@/stores/user'
import { usePostForm } from '@/composables/usePostForm'

const router = useRouter()
const postStore = usePostStore()
const userStore = useUserStore()
const { formData, errors, validate, submitCreate, submitUpdate, reset } = usePostForm()

// 響應式資料
const loading = ref(false)
const submitting = ref(false)
const showModal = ref(false)
const isEditing = ref(false)
const currentEditingPost = ref(null)

// 搜尋與篩選
const searchQuery = ref('')
const authorFilter = ref('')
const sortBy = ref('createdAt')
const sortOrder = ref('desc')

// 分頁
const currentPage = ref(1)
const itemsPerPage = ref(9)

// 表單額外欄位
const tagsInput = ref('')

// 計算屬性
const authors = computed(() => {
  const authorIds = [...new Set(postStore.posts.map(post => post.userId))]
  return authorIds.map(id => userStore.users.find(user => user.id === id)).filter(Boolean)
})

const filteredPosts = computed(() => {
  let posts = [...postStore.posts]
  
  // 搜尋篩選
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    posts = posts.filter(post => 
      post.title.toLowerCase().includes(query) ||
      post.content.toLowerCase().includes(query)
    )
  }
  
  // 作者篩選
  if (authorFilter.value) {
    posts = posts.filter(post => post.userId === parseInt(authorFilter.value))
  }
  
  // 排序
  posts.sort((a, b) => {
    let aValue, bValue
    
    switch (sortBy.value) {
      case 'title':
        aValue = a.title.toLowerCase()
        bValue = b.title.toLowerCase()
        break
      case 'author':
        aValue = getAuthorName(a.userId).toLowerCase()
        bValue = getAuthorName(b.userId).toLowerCase()
        break
      case 'createdAt':
        aValue = new Date(a.createdAt || 0)
        bValue = new Date(b.createdAt || 0)
        break
      case 'comments':
        aValue = getPostComments(a.id).length
        bValue = getPostComments(b.id).length
        break
      default:
        return 0
    }
    
    if (sortOrder.value === 'desc') {
      return aValue < bValue ? 1 : aValue > bValue ? -1 : 0
    } else {
      return aValue > bValue ? 1 : aValue < bValue ? -1 : 0
    }
  })
  
  return posts
})

const totalPages = computed(() => Math.ceil(filteredPosts.value.length / itemsPerPage.value))

const paginatedPosts = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value
  const end = start + itemsPerPage.value
  return filteredPosts.value.slice(start, end)
})

const visiblePages = computed(() => {
  const pages = []
  const total = totalPages.value
  const current = currentPage.value
  
  if (total <= 7) {
    for (let i = 1; i <= total; i++) {
      pages.push(i)
    }
  } else {
    if (current <= 4) {
      for (let i = 1; i <= 5; i++) pages.push(i)
      pages.push('...', total)
    } else if (current >= total - 3) {
      pages.push(1, '...')
      for (let i = total - 4; i <= total; i++) pages.push(i)
    } else {
      pages.push(1, '...')
      for (let i = current - 1; i <= current + 1; i++) pages.push(i)
      pages.push('...', total)
    }
  }
  
  return pages.filter(page => page !== '...' || pages.indexOf(page) === pages.lastIndexOf(page))
})

// 方法
const refreshPosts = async () => {
  loading.value = true
  try {
    await Promise.all([
      postStore.fetchPosts(),
      postStore.fetchComments(),
      userStore.fetchUsers()
    ])
  } catch (error) {
    console.error('載入文章失敗:', error)
  } finally {
    loading.value = false
  }
}

const getAuthorName = (userId) => {
  const user = userStore.users.find(u => u.id === userId)
  return user ? user.name : '未知作者'
}

const getAuthorInitials = (userId) => {
  const name = getAuthorName(userId)
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
}

const formatDate = (dateString) => {
  if (!dateString) return '未知時間'
  return new Date(dateString).toLocaleDateString('zh-TW', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

const getExcerpt = (content, maxLength = 150) => {
  if (!content) return ''
  return content.length > maxLength ? content.slice(0, maxLength) + '...' : content
}

const getPostComments = (postId) => {
  return postStore.comments.filter(comment => comment.postId === postId)
}

const viewPost = (postId) => {
  router.push(`/posts/${postId}`)
}

const openCreateModal = () => {
  isEditing.value = false
  currentEditingPost.value = null
  reset()
  tagsInput.value = ''
  showModal.value = true
}

const editPost = (post) => {
  isEditing.value = true
  currentEditingPost.value = post
  Object.assign(formData, {
    title: post.title,
    content: post.content,
    userId: post.userId
  })
  tagsInput.value = post.tags ? post.tags.join(', ') : ''
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
  reset()
  tagsInput.value = ''
}

const submitForm = async () => {
  // 處理標籤
  if (tagsInput.value) {
    formData.tags = tagsInput.value.split(',').map(tag => tag.trim()).filter(Boolean)
  } else {
    formData.tags = []
  }
  
  if (!validate()) return
  
  submitting.value = true
  try {
    if (isEditing.value) {
      await submitUpdate(currentEditingPost.value.id)
    } else {
      await submitCreate()
    }
    closeModal()
    await refreshPosts()
  } catch (error) {
    console.error('提交失敗:', error)
  } finally {
    submitting.value = false
  }
}

const deletePost = async (post) => {
  if (!confirm(`確定要刪除文章「${post.title}」嗎？`)) return
  
  try {
    await postStore.deletePost(post.id)
    await refreshPosts()
  } catch (error) {
    console.error('刪除文章失敗:', error)
  }
}

// 生命週期
onMounted(() => {
  refreshPosts()
})
</script>

<style scoped>
.post-list-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 2rem;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.header h1 {
  color: #1f2937;
  margin: 0;
}

.header-actions {
  display: flex;
  gap: 1rem;
}

.filters {
  background: white;
  padding: 1.5rem;
  border-radius: 0.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  margin-bottom: 2rem;
}

.search-box {
  margin-bottom: 1rem;
}

.search-input {
  width: 100%;
  padding: 0.75rem;
  border: 2px solid #e5e7eb;
  border-radius: 0.5rem;
  font-size: 1rem;
}

.search-input:focus {
  outline: none;
  border-color: #667eea;
}

.filter-options {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.filter-select {
  padding: 0.5rem;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  /* background: white; */
}

.stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
}

.stat-item {
  background: white;
  padding: 1.5rem;
  border-radius: 0.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  text-align: center;
}

.stat-label {
  display: block;
  color: #6b7280;
  font-size: 0.875rem;
  margin-bottom: 0.5rem;
}

.stat-value {
  display: block;
  color: #1f2937;
  font-size: 2rem;
  font-weight: bold;
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

.empty-state {
  text-align: center;
  padding: 3rem;
  background: white;
  border-radius: 0.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.empty-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
}

.posts-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 1.5rem;
}

.post-card {
  background: white;
  border-radius: 0.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  cursor: pointer;
  transition: all 0.2s;
  border: 1px solid #e5e7eb;
}

.post-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  border-color: #667eea;
}

.post-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem 1.5rem 0;
}

.post-author {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.author-avatar {
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
}

.author-name {
  margin: 0;
  color: #1f2937;
  font-size: 0.875rem;
}

.post-date {
  margin: 0;
  color: #6b7280;
  font-size: 0.75rem;
}

.post-actions {
  display: flex;
  gap: 0.25rem;
  opacity: 0;
  transition: opacity 0.2s;
}

.post-card:hover .post-actions {
  opacity: 1;
}

.action-btn {
  background: rgba(255, 255, 255, 0.9);
  border: 1px solid #e5e7eb;
  border-radius: 0.25rem;
  padding: 0.25rem;
  cursor: pointer;
  font-size: 0.875rem;
  transition: all 0.2s;
}

.action-btn:hover {
  background: white;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.post-content {
  padding: 1rem 1.5rem;
}

.post-title {
  margin: 0 0 1rem;
  color: #1f2937;
  font-size: 1.25rem;
  line-height: 1.4;
}

.post-excerpt {
  margin: 0;
  color: #6b7280;
  line-height: 1.6;
  font-size: 0.875rem;
}

.post-footer {
  padding: 0 1.5rem 1.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.post-stats {
  display: flex;
  gap: 1rem;
}

.post-stats .stat-item {
  background: none;
  padding: 0;
  box-shadow: none;
  text-align: left;
  color: #6b7280;
  font-size: 0.75rem;
}

.post-tags {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.tag {
  background: #f3f4f6;
  color: #6b7280;
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
  font-size: 0.75rem;
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 0.5rem;
  margin-top: 2rem;
}

.page-btn {
  padding: 0.5rem 0.75rem;
  border: 1px solid #d1d5db;
  background: white;
  border-radius: 0.375rem;
  cursor: pointer;
  transition: all 0.2s;
}

.page-btn:hover:not(:disabled) {
  background: #f3f4f6;
}

.page-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.page-btn.active {
  background: #667eea;
  color: white;
  border-color: #667eea;
}

.page-numbers {
  display: flex;
  gap: 0.25rem;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  border-radius: 0.5rem;
  width: 90%;
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid #e5e7eb;
}

.modal-header h2 {
  margin: 0;
  color: #1f2937;
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #6b7280;
}

.close-btn:hover {
  color: #374151;
}

.post-form {
  padding: 1.5rem;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: #374151;
}

.form-group input,
.form-group textarea,
.form-group select {
  width: 100%;
  padding: 0.75rem;
  border: 2px solid #e5e7eb;
  border-radius: 0.5rem;
  font-size: 1rem;
}

.form-group textarea {
  resize: vertical;
  min-height: 120px;
}

.form-group input:focus,
.form-group textarea:focus,
.form-group select:focus {
  outline: none;
  border-color: #667eea;
}

.form-group input.error,
.form-group textarea.error {
  border-color: #ef4444;
}

.error-message {
  color: #ef4444;
  font-size: 0.875rem;
  margin-top: 0.25rem;
  display: block;
}

.form-hint {
  color: #6b7280;
  font-size: 0.875rem;
  margin-top: 0.25rem;
  display: block;
}

.form-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  margin-top: 2rem;
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

.btn-outline {
  background: transparent;
  color: #667eea;
  border: 2px solid #667eea;
}

.btn-outline:hover:not(:disabled) {
  background: #667eea;
  color: white;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>
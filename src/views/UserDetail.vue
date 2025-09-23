<template>
  <div class="user-detail-container">
    <!-- 載入狀態 -->
    <div v-if="loading" class="loading">
      <div class="loading-spinner"></div>
      <p>載入用戶資料中...</p>
    </div>

    <!-- 用戶不存在 -->
    <div v-else-if="!user" class="not-found">
      <div class="not-found-icon">😔</div>
      <h2>用戶不存在</h2>
      <p>找不到 ID 為 {{ userId }} 的用戶</p>
      <router-link to="/users" class="btn btn-primary">
        返回用戶列表
      </router-link>
    </div>

    <!-- 用戶詳情 -->
    <div v-else class="user-detail">
      <!-- 頁面標題 -->
      <div class="header">
        <div class="breadcrumb">
          <router-link to="/">首頁</router-link>
          <span>/</span>
          <router-link to="/users">用戶管理</router-link>
          <span>/</span>
          <span>{{ user.name }}</span>
        </div>
        <div class="header-actions">
          <button @click="editUser" class="btn btn-primary">
            ✏️ 編輯用戶
          </button>
          <button @click="deleteUser" class="btn btn-danger">
            🗑️ 刪除用戶
          </button>
        </div>
      </div>

      <!-- 用戶基本資訊 -->
      <div class="user-profile">
        <div class="profile-header">
          <div class="user-avatar">
            {{ getInitials(user.name) }}
          </div>
          <div class="user-basic-info">
            <h1 class="user-name">{{ user.name }}</h1>
            <p class="user-email">📧 {{ user.email }}</p>
            <div class="user-meta">
              <span class="user-age">🎂 {{ user.age }} 歲</span>
              <span :class="['user-status', user.isActive ? 'active' : 'inactive']">
                {{ user.isActive ? '🟢 活躍' : '🔴 非活躍' }}
              </span>
            </div>
          </div>
        </div>

        <div class="profile-stats">
          <div class="stat-card">
            <h3>{{ userPosts.length }}</h3>
            <p>發表文章</p>
          </div>
          <div class="stat-card">
            <h3>{{ userComments.length }}</h3>
            <p>留言數量</p>
          </div>
          <div class="stat-card">
            <h3>{{ joinedDays }}</h3>
            <p>加入天數</p>
          </div>
        </div>
      </div>

      <!-- 詳細資訊卡片 -->
      <div class="detail-cards">
        <!-- 基本資訊卡 -->
        <div class="detail-card">
          <h3>📋 基本資訊</h3>
          <div class="info-grid">
            <div class="info-item">
              <label>用戶 ID</label>
              <span>{{ user.id }}</span>
            </div>
            <div class="info-item">
              <label>姓名</label>
              <span>{{ user.name }}</span>
            </div>
            <div class="info-item">
              <label>電子信箱</label>
              <span>{{ user.email }}</span>
            </div>
            <div class="info-item">
              <label>年齡</label>
              <span>{{ user.age }} 歲</span>
            </div>
            <div class="info-item">
              <label>狀態</label>
              <span :class="['status-badge', user.isActive ? 'active' : 'inactive']">
                {{ user.isActive ? '活躍' : '非活躍' }}
              </span>
            </div>
            <div class="info-item">
              <label>註冊時間</label>
              <span>{{ formatDate(user.createdAt) }}</span>
            </div>
          </div>
        </div>

        <!-- 活動統計卡 -->
        <div class="detail-card">
          <h3>📊 活動統計</h3>
          <div class="activity-stats">
            <div class="activity-item">
              <div class="activity-icon">📝</div>
              <div class="activity-info">
                <h4>文章發表</h4>
                <p>共發表 {{ userPosts.length }} 篇文章</p>
                <small>最近發表: {{ latestPostDate }}</small>
              </div>
            </div>
            <div class="activity-item">
              <div class="activity-icon">💬</div>
              <div class="activity-info">
                <h4>留言互動</h4>
                <p>共發表 {{ userComments.length }} 則留言</p>
                <small>最近留言: {{ latestCommentDate }}</small>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 用戶文章列表 -->
      <div class="user-content">
        <div class="content-section">
          <div class="section-header">
            <h3>📝 發表的文章 ({{ userPosts.length }})</h3>
            <button @click="showAllPosts = !showAllPosts" class="btn btn-outline">
              {{ showAllPosts ? '收起' : '查看全部' }}
            </button>
          </div>
          
          <div v-if="userPosts.length === 0" class="empty-state">
            <p>這位用戶還沒有發表任何文章</p>
          </div>
          
          <div v-else class="posts-list">
            <div
              v-for="post in displayedPosts"
              :key="post.id"
              class="post-item"
              @click="viewPost(post.id)"
            >
              <div class="post-content">
                <h4 class="post-title">{{ post.title }}</h4>
                <p class="post-excerpt">{{ getExcerpt(post.content) }}</p>
                <div class="post-meta">
                  <span class="post-date">{{ formatDate(post.createdAt) }}</span>
                  <span class="post-comments">💬 {{ getPostComments(post.id).length }}</span>
                </div>
              </div>
              <div class="post-actions">
                <button @click.stop="editPost(post)" class="action-btn">✏️</button>
                <button @click.stop="deletePost(post)" class="action-btn">🗑️</button>
              </div>
            </div>
          </div>
        </div>

        <!-- 用戶留言列表 -->
        <div class="content-section">
          <div class="section-header">
            <h3>💬 最近留言 ({{ userComments.length }})</h3>
            <button @click="showAllComments = !showAllComments" class="btn btn-outline">
              {{ showAllComments ? '收起' : '查看全部' }}
            </button>
          </div>
          
          <div v-if="userComments.length === 0" class="empty-state">
            <p>這位用戶還沒有發表任何留言</p>
          </div>
          
          <div v-else class="comments-list">
            <div
              v-for="comment in displayedComments"
              :key="comment.id"
              class="comment-item"
            >
              <div class="comment-content">
                <p class="comment-text">{{ comment.content }}</p>
                <div class="comment-meta">
                  <span class="comment-date">{{ formatDate(comment.createdAt) }}</span>
                  <span class="comment-post">回覆文章: {{ getPostTitle(comment.postId) }}</span>
                </div>
              </div>
              <div class="comment-actions">
                <button @click="deleteComment(comment)" class="action-btn">🗑️</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 編輯用戶 Modal -->
    <div v-if="showEditModal" class="modal-overlay" @click="closeEditModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h2>編輯用戶資訊</h2>
          <button @click="closeEditModal" class="close-btn">✕</button>
        </div>
        
        <form @submit.prevent="updateUser" class="user-form">
          <div class="form-group">
            <label for="name">姓名 *</label>
            <input
              id="name"
              v-model="editForm.name"
              type="text"
              required
            />
          </div>

          <div class="form-group">
            <label for="email">電子信箱 *</label>
            <input
              id="email"
              v-model="editForm.email"
              type="email"
              required
            />
          </div>

          <div class="form-group">
            <label for="age">年齡 *</label>
            <input
              id="age"
              v-model.number="editForm.age"
              type="number"
              min="1"
              max="150"
              required
            />
          </div>

          <div class="form-group">
            <label class="checkbox-label">
              <input v-model="editForm.isActive" type="checkbox" />
              活躍狀態
            </label>
          </div>

          <div class="form-actions">
            <button type="button" @click="closeEditModal" class="btn btn-outline">
              取消
            </button>
            <button type="submit" class="btn btn-primary" :disabled="updating">
              {{ updating ? '更新中...' : '更新' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { usePostStore } from '@/stores/post'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()
const postStore = usePostStore()

// 響應式資料
const loading = ref(false)
const updating = ref(false)
const showEditModal = ref(false)
const showAllPosts = ref(false)
const showAllComments = ref(false)

const userId = computed(() => parseInt(route.params.id))
const user = computed(() => userStore.users.find(u => u.id === userId.value))

const editForm = ref({
  name: '',
  email: '',
  age: 0,
  isActive: true
})

// 計算屬性
const userPosts = computed(() => 
  postStore.posts.filter(post => post.userId === userId.value)
)

const userComments = computed(() => 
  postStore.comments.filter(comment => comment.userId === userId.value)
)

const joinedDays = computed(() => {
  if (!user.value?.createdAt) return 0
  const joinDate = new Date(user.value.createdAt)
  const today = new Date()
  const diffTime = Math.abs(today - joinDate)
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
})

const latestPostDate = computed(() => {
  if (userPosts.value.length === 0) return '無'
  const latest = userPosts.value.reduce((latest, post) => 
    new Date(post.createdAt) > new Date(latest.createdAt) ? post : latest
  )
  return formatDate(latest.createdAt)
})

const latestCommentDate = computed(() => {
  if (userComments.value.length === 0) return '無'
  const latest = userComments.value.reduce((latest, comment) => 
    new Date(comment.createdAt) > new Date(latest.createdAt) ? comment : latest
  )
  return formatDate(latest.createdAt)
})

const displayedPosts = computed(() => 
  showAllPosts.value ? userPosts.value : userPosts.value.slice(0, 3)
)

const displayedComments = computed(() => 
  showAllComments.value ? userComments.value : userComments.value.slice(0, 5)
)

// 方法
const getInitials = (name) => {
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
}

const formatDate = (dateString) => {
  if (!dateString) return '未知'
  return new Date(dateString).toLocaleDateString('zh-TW', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

const getExcerpt = (content, maxLength = 100) => {
  if (!content) return ''
  return content.length > maxLength ? content.slice(0, maxLength) + '...' : content
}

const getPostComments = (postId) => {
  return postStore.comments.filter(comment => comment.postId === postId)
}

const getPostTitle = (postId) => {
  const post = postStore.posts.find(p => p.id === postId)
  return post ? post.title : '未知文章'
}

const loadData = async () => {
  loading.value = true
  try {
    await Promise.all([
      userStore.fetchUsers(),
      postStore.fetchPosts(),
      postStore.fetchComments()
    ])
  } catch (error) {
    console.error('載入資料失敗:', error)
  } finally {
    loading.value = false
  }
}

const editUser = () => {
  if (!user.value) return
  Object.assign(editForm.value, {
    name: user.value.name,
    email: user.value.email,
    age: user.value.age,
    isActive: user.value.isActive
  })
  showEditModal.value = true
}

const closeEditModal = () => {
  showEditModal.value = false
}

const updateUser = async () => {
  updating.value = true
  try {
    await userStore.updateUser(userId.value, editForm.value)
    await loadData()
    closeEditModal()
  } catch (error) {
    console.error('更新用戶失敗:', error)
  } finally {
    updating.value = false
  }
}

const deleteUser = async () => {
  if (!confirm(`確定要刪除用戶「${user.value.name}」嗎？`)) return
  
  try {
    await userStore.deleteUser(userId.value)
    router.push('/users')
  } catch (error) {
    console.error('刪除用戶失敗:', error)
  }
}

const viewPost = (postId) => {
  router.push(`/posts/${postId}`)
}

const editPost = (post) => {
  // 跳轉到文章編輯頁面
  router.push(`/posts/${post.id}/edit`)
}

const deletePost = async (post) => {
  if (!confirm(`確定要刪除文章「${post.title}」嗎？`)) return
  
  try {
    await postStore.deletePost(post.id)
    await loadData()
  } catch (error) {
    console.error('刪除文章失敗:', error)
  }
}

const deleteComment = async (comment) => {
  if (!confirm('確定要刪除這則留言嗎？')) return
  
  try {
    await postStore.deleteComment(comment.id)
    await loadData()
  } catch (error) {
    console.error('刪除留言失敗:', error)
  }
}

// 生命週期
onMounted(() => {
  loadData()
})
</script>

<style scoped>
.user-detail-container {
  max-width: 1200px;
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

.header-actions {
  display: flex;
  gap: 1rem;
}

.user-profile {
  background: white;
  border-radius: 0.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  padding: 2rem;
  margin-bottom: 2rem;
}

.profile-header {
  display: flex;
  align-items: center;
  gap: 2rem;
  margin-bottom: 2rem;
}

.user-avatar {
  width: 6rem;
  height: 6rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 2rem;
}

.user-basic-info {
  flex: 1;
}

.user-name {
  margin: 0 0 0.5rem;
  color: #1f2937;
  font-size: 2rem;
}

.user-email {
  color: #6b7280;
  margin: 0 0 1rem;
  font-size: 1.1rem;
}

.user-meta {
  display: flex;
  gap: 1rem;
  align-items: center;
}

.user-age {
  color: #6b7280;
}

.user-status {
  padding: 0.25rem 0.75rem;
  border-radius: 1rem;
  font-size: 0.875rem;
  font-weight: 500;
}

.user-status.active {
  background: #d1fae5;
  color: #065f46;
}

.user-status.inactive {
  background: #fee2e2;
  color: #991b1b;
}

.profile-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 1rem;
}

.stat-card {
  background: #f9fafb;
  padding: 1.5rem;
  border-radius: 0.5rem;
  text-align: center;
  border: 1px solid #e5e7eb;
}

.stat-card h3 {
  margin: 0 0 0.5rem;
  color: #1f2937;
  font-size: 2rem;
}

.stat-card p {
  margin: 0;
  color: #6b7280;
  font-size: 0.875rem;
}

.detail-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 2rem;
  margin-bottom: 2rem;
}

.detail-card {
  background: white;
  border-radius: 0.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  padding: 2rem;
}

.detail-card h3 {
  margin: 0 0 1.5rem;
  color: #1f2937;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}

.info-item {
  display: flex;
  flex-direction: column;
}

.info-item label {
  color: #6b7280;
  font-size: 0.875rem;
  margin-bottom: 0.25rem;
}

.info-item span {
  color: #1f2937;
  font-weight: 500;
}

.status-badge {
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
  font-size: 0.75rem;
  display: inline-block;
  width: fit-content;
}

.status-badge.active {
  background: #d1fae5;
  color: #065f46;
}

.status-badge.inactive {
  background: #fee2e2;
  color: #991b1b;
}

.activity-stats {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.activity-item {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.activity-icon {
  font-size: 2rem;
  width: 3rem;
  text-align: center;
}

.activity-info h4 {
  margin: 0 0 0.25rem;
  color: #1f2937;
}

.activity-info p {
  margin: 0 0 0.25rem;
  color: #6b7280;
}

.activity-info small {
  color: #9ca3af;
}

.user-content {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(500px, 1fr));
  gap: 2rem;
}

.content-section {
  background: white;
  border-radius: 0.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  padding: 2rem;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.section-header h3 {
  margin: 0;
  color: #1f2937;
}

.empty-state {
  text-align: center;
  padding: 2rem;
  color: #6b7280;
}

.posts-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.post-item {
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  padding: 1.5rem;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.post-item:hover {
  border-color: #667eea;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.post-content {
  flex: 1;
}

.post-title {
  margin: 0 0 0.5rem;
  color: #1f2937;
}

.post-excerpt {
  margin: 0 0 1rem;
  color: #6b7280;
  line-height: 1.5;
}

.post-meta {
  display: flex;
  gap: 1rem;
  font-size: 0.875rem;
  color: #9ca3af;
}

.post-actions {
  display: flex;
  gap: 0.5rem;
  opacity: 0;
  transition: opacity 0.2s;
}

.post-item:hover .post-actions {
  opacity: 1;
}

.comments-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.comment-item {
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  padding: 1rem;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.comment-content {
  flex: 1;
}

.comment-text {
  margin: 0 0 0.5rem;
  color: #1f2937;
  line-height: 1.5;
}

.comment-meta {
  display: flex;
  gap: 1rem;
  font-size: 0.875rem;
  color: #9ca3af;
}

.comment-actions {
  opacity: 0;
  transition: opacity 0.2s;
}

.comment-item:hover .comment-actions {
  opacity: 1;
}

.action-btn {
  background: rgba(255, 255, 255, 0.9);
  border: 1px solid #e5e7eb;
  border-radius: 0.25rem;
  padding: 0.25rem 0.5rem;
  cursor: pointer;
  font-size: 0.875rem;
  transition: all 0.2s;
}

.action-btn:hover {
  background: white;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
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
  max-width: 500px;
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

.user-form {
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

.form-group input {
  width: 100%;
  padding: 0.75rem;
  border: 2px solid #e5e7eb;
  border-radius: 0.5rem;
  font-size: 1rem;
}

.form-group input:focus {
  outline: none;
  border-color: #667eea;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
}

.checkbox-label input {
  width: auto;
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
<template>
  <div class="dashboard-container">
    <!-- 歡迎區塊 -->
    <div class="welcome-section">
      <div class="welcome-content">
        <h1>👋 歡迎回來，{{ currentUser?.name || '用戶' }}！</h1>
        <p>這是您的專屬儀表板，查看最新動態與重要資訊</p>
      </div>
      <div class="quick-actions">
        <router-link to="/users/create" class="quick-btn">
          ➕ 新增用戶
        </router-link>
        <router-link to="/posts" class="quick-btn">
          📝 發表文章
        </router-link>
      </div>
    </div>

    <!-- 統計卡片 -->
    <div class="stats-grid">
      <div class="stat-card users">
        <div class="stat-icon">👥</div>
        <div class="stat-content">
          <h3>總用戶數</h3>
          <div class="stat-number">{{ stats.totalUsers }}</div>
          <div class="stat-change positive">
            ↗️ +{{ stats.newUsersToday }} 今日新增
          </div>
        </div>
      </div>

      <div class="stat-card posts">
        <div class="stat-icon">📄</div>
        <div class="stat-content">
          <h3>文章總數</h3>
          <div class="stat-number">{{ stats.totalPosts }}</div>
          <div class="stat-change positive">
            ↗️ +{{ stats.newPostsToday }} 今日發表
          </div>
        </div>
      </div>

      <div class="stat-card comments">
        <div class="stat-icon">💬</div>
        <div class="stat-content">
          <h3>評論總數</h3>
          <div class="stat-number">{{ stats.totalComments }}</div>
          <div class="stat-change neutral">
            → {{ stats.avgCommentsPerPost }} 平均每篇
          </div>
        </div>
      </div>

      <div class="stat-card active">
        <div class="stat-icon">🟢</div>
        <div class="stat-content">
          <h3>活躍用戶</h3>
          <div class="stat-number">{{ stats.activeUsers }}</div>
          <div class="stat-change positive">
            ↗️ {{ Math.round(stats.activeUsers/stats.totalUsers*100) }}% 活躍率
          </div>
        </div>
      </div>
    </div>

    <div class="dashboard-content">
      <!-- 左側內容 -->
      <div class="main-content">
        <!-- 最新文章 -->
        <div class="content-section">
          <div class="section-header">
            <h2>📰 最新文章</h2>
            <router-link to="/posts" class="see-all">查看全部</router-link>
          </div>
          
          <div class="recent-posts">
            <div 
              v-for="post in recentPosts" 
              :key="post.id" 
              class="post-item"
              @click="goToPost(post.id)"
            >
              <div class="post-meta">
                <span class="post-date">{{ formatDate(post.createdAt) }}</span>
                <span class="post-author">{{ getAuthorName(post.userId) }}</span>
              </div>
              <h4 class="post-title">{{ post.title }}</h4>
              <p class="post-excerpt">{{ getExcerpt(post.content) }}</p>
              <div class="post-stats">
                <span class="comment-count">💬 {{ getCommentCount(post.id) }}</span>
                <span class="read-time">⏱️ {{ getReadTime(post.content) }} 分鐘</span>
              </div>
            </div>
          </div>
        </div>

        <!-- 用戶活動 -->
        <div class="content-section">
          <div class="section-header">
            <h2>👤 用戶活動</h2>
            <router-link to="/users" class="see-all">查看全部</router-link>
          </div>
          
          <div class="user-activities">
            <div 
              v-for="activity in userActivities" 
              :key="activity.id"
              class="activity-item"
            >
              <div class="activity-avatar">
                {{ getInitials(activity.userName) }}
              </div>
              <div class="activity-content">
                <div class="activity-description">
                  <strong>{{ activity.userName }}</strong> 
                  {{ activity.action }}
                  <span class="activity-target">{{ activity.target }}</span>
                </div>
                <div class="activity-time">{{ formatRelativeTime(activity.timestamp) }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 右側邊欄 -->
      <div class="sidebar">
        <!-- 系統狀態 -->
        <div class="sidebar-widget">
          <h3>🔧 系統狀態</h3>
          <div class="system-status">
            <div class="status-item">
              <span class="status-label">資料庫</span>
              <span class="status-indicator online">🟢 正常</span>
            </div>
            <div class="status-item">
              <span class="status-label">API 服務</span>
              <span class="status-indicator online">🟢 正常</span>
            </div>
            <div class="status-item">
              <span class="status-label">快取系統</span>
              <span class="status-indicator warning">🟡 較慢</span>
            </div>
          </div>
        </div>

        <!-- 熱門標籤 -->
        <div class="sidebar-widget">
          <h3>🏷️ 熱門標籤</h3>
          <div class="popular-tags">
            <span 
              v-for="tag in popularTags" 
              :key="tag.name"
              class="tag-item"
              :style="{ fontSize: getTagSize(tag.count) }"
            >
              #{{ tag.name }}
            </span>
          </div>
        </div>

        <!-- 最新評論 -->
        <div class="sidebar-widget">
          <h3>💭 最新評論</h3>
          <div class="recent-comments">
            <div 
              v-for="comment in recentComments" 
              :key="comment.id"
              class="comment-item"
            >
              <div class="comment-author">{{ comment.name }}</div>
              <div class="comment-content">"{{ getCommentExcerpt(comment.body) }}"</div>
              <div class="comment-time">{{ formatRelativeTime(comment.createdAt) }}</div>
            </div>
          </div>
        </div>

        <!-- 天氣小工具 -->
        <div class="sidebar-widget">
          <h3>🌤️ 今日天氣</h3>
          <div class="weather-widget">
            <div class="weather-main">
              <div class="weather-temp">{{ weather.temperature }}°C</div>
              <div class="weather-desc">{{ weather.description }}</div>
            </div>
            <div class="weather-details">
              <div class="weather-item">
                <span>💧</span>
                <span>{{ weather.humidity }}%</span>
              </div>
              <div class="weather-item">
                <span>💨</span>
                <span>{{ weather.windSpeed }} km/h</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { usePostStore } from '@/stores/post'

const router = useRouter()
const userStore = useUserStore()
const postStore = usePostStore()

// 響應式資料
const stats = reactive({
  totalUsers: 0,
  totalPosts: 0,
  totalComments: 0,
  activeUsers: 0,
  newUsersToday: 3,
  newPostsToday: 5,
  avgCommentsPerPost: 2.4
})

const recentPosts = ref([])
const recentComments = ref([])
const userActivities = ref([])
const popularTags = ref([])

const weather = reactive({
  temperature: 24,
  description: '晴朗',
  humidity: 65,
  windSpeed: 12
})

const currentUser = computed(() => {
  // 模擬當前登入用戶
  return userStore.users[0] || null
})

// 方法
const formatDate = (dateStr) => {
  return new Date(dateStr).toLocaleDateString('zh-TW', {
    month: 'short',
    day: 'numeric'
  })
}

const formatRelativeTime = (timestamp) => {
  const now = Date.now()
  const diff = now - new Date(timestamp).getTime()
  const minutes = Math.floor(diff / 60000)
  
  if (minutes < 1) return '剛剛'
  if (minutes < 60) return `${minutes} 分鐘前`
  
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours} 小時前`
  
  const days = Math.floor(hours / 24)
  return `${days} 天前`
}

const getAuthorName = (userId) => {
  const user = userStore.users.find(u => u.id === userId)
  return user ? user.name : '未知用戶'
}

const getInitials = (name) => {
  if (!name) return '?'
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
}

const getExcerpt = (content) => {
  if (!content) return ''
  return content.length > 120 ? content.slice(0, 120) + '...' : content
}

const getCommentExcerpt = (content) => {
  if (!content) return ''
  return content.length > 80 ? content.slice(0, 80) + '...' : content
}

const getCommentCount = (postId) => {
  // 模擬評論數計算
  return Math.floor(Math.random() * 10) + 1
}

const getReadTime = (content) => {
  // 估算閱讀時間 (假設每分鐘 200 字)
  const words = content?.length || 0
  return Math.max(1, Math.ceil(words / 200))
}

const getTagSize = (count) => {
  // 根據標籤使用次數調整字體大小
  const baseSize = 0.75
  const scaleFactor = Math.min(count / 10, 1.5)
  return `${baseSize + scaleFactor * 0.5}rem`
}

const goToPost = (postId) => {
  router.push(`/posts/${postId}`)
}

const loadDashboardData = async () => {
  try {
    // 載入用戶和文章資料
    await Promise.all([
      userStore.fetchUsers(),
      postStore.fetchPosts()
    ])

    // 更新統計資料
    stats.totalUsers = userStore.users.length
    stats.totalPosts = postStore.posts.length
    stats.activeUsers = userStore.users.filter(u => u.isActive).length

    // 設定最新文章 (取前 5 篇)
    recentPosts.value = postStore.posts
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 5)
      .map(post => ({
        ...post,
        createdAt: post.createdAt || new Date().toISOString()
      }))

    // 模擬用戶活動
    userActivities.value = [
      {
        id: 1,
        userName: '王小明',
        action: '發表了文章',
        target: '「Vue 3 最佳實踐」',
        timestamp: Date.now() - 300000
      },
      {
        id: 2,
        userName: '李小美',
        action: '註冊了帳號',
        target: '',
        timestamp: Date.now() - 600000
      },
      {
        id: 3,
        userName: '張大華',
        action: '評論了',
        target: '「前端開發技巧」',
        timestamp: Date.now() - 900000
      }
    ]

    // 模擬熱門標籤
    popularTags.value = [
      { name: 'Vue.js', count: 15 },
      { name: 'JavaScript', count: 12 },
      { name: '前端', count: 10 },
      { name: '教學', count: 8 },
      { name: 'React', count: 6 },
      { name: 'CSS', count: 5 }
    ]

    // 模擬最新評論
    recentComments.value = [
      {
        id: 1,
        name: '陳小華',
        body: '這篇文章寫得很好，學到了很多東西！',
        createdAt: Date.now() - 180000
      },
      {
        id: 2,
        name: '林小雨',
        body: '感謝分享，期待更多相關內容',
        createdAt: Date.now() - 360000
      },
      {
        id: 3,
        name: '吳大明',
        body: '有個小問題想請教一下...',
        createdAt: Date.now() - 540000
      }
    ]

  } catch (error) {
    console.error('載入儀表板資料失敗:', error)
  }
}

// 生命週期
onMounted(() => {
  loadDashboardData()
})
</script>

<style scoped>
.dashboard-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 2rem;
}

.welcome-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 2rem;
  border-radius: 1rem;
  margin-bottom: 2rem;
}

.welcome-content h1 {
  margin: 0 0 0.5rem;
  font-size: 2rem;
}

.welcome-content p {
  margin: 0;
  opacity: 0.9;
}

.quick-actions {
  display: flex;
  gap: 1rem;
}

.quick-btn {
  background: rgba(255, 255, 255, 0.2);
  color: white;
  padding: 0.75rem 1.5rem;
  border-radius: 0.5rem;
  text-decoration: none;
  transition: all 0.2s;
  backdrop-filter: blur(10px);
}

.quick-btn:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: translateY(-2px);
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.stat-card {
  background: white;
  border-radius: 0.75rem;
  padding: 1.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  gap: 1rem;
  transition: transform 0.2s, box-shadow 0.2s;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.stat-icon {
  font-size: 2.5rem;
  opacity: 0.8;
}

.stat-content h3 {
  margin: 0 0 0.25rem;
  color: #6b7280;
  font-size: 0.875rem;
  font-weight: 500;
}

.stat-number {
  font-size: 1.875rem;
  font-weight: bold;
  color: #1f2937;
  margin-bottom: 0.25rem;
}

.stat-change {
  font-size: 0.75rem;
  font-weight: 500;
}

.stat-change.positive {
  color: #10b981;
}

.stat-change.neutral {
  color: #6b7280;
}

.dashboard-content {
  display: grid;
  grid-template-columns: 1fr 300px;
  gap: 2rem;
}

.content-section {
  background: white;
  border-radius: 0.75rem;
  padding: 1.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  margin-bottom: 2rem;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  padding-bottom: 0.75rem;
  border-bottom: 1px solid #e5e7eb;
}

.section-header h2 {
  margin: 0;
  color: #1f2937;
  font-size: 1.25rem;
}

.see-all {
  color: #667eea;
  text-decoration: none;
  font-size: 0.875rem;
  font-weight: 500;
}

.see-all:hover {
  text-decoration: underline;
}

.recent-posts {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.post-item {
  padding: 1rem;
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  cursor: pointer;
  transition: all 0.2s;
}

.post-item:hover {
  border-color: #667eea;
  background: #f8fafc;
}

.post-meta {
  display: flex;
  gap: 1rem;
  margin-bottom: 0.5rem;
  font-size: 0.75rem;
  color: #6b7280;
}

.post-title {
  margin: 0 0 0.5rem;
  color: #1f2937;
  font-size: 1rem;
  font-weight: 600;
}

.post-excerpt {
  margin: 0 0 0.75rem;
  color: #4b5563;
  font-size: 0.875rem;
  line-height: 1.5;
}

.post-stats {
  display: flex;
  gap: 1rem;
  font-size: 0.75rem;
  color: #6b7280;
}

.user-activities {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.activity-item {
  display: flex;
  gap: 0.75rem;
  align-items: flex-start;
}

.activity-avatar {
  width: 2rem;
  height: 2rem;
  background: #667eea;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  font-weight: bold;
  flex-shrink: 0;
}

.activity-content {
  flex: 1;
}

.activity-description {
  font-size: 0.875rem;
  color: #1f2937;
  margin-bottom: 0.25rem;
}

.activity-target {
  color: #667eea;
}

.activity-time {
  font-size: 0.75rem;
  color: #6b7280;
}

.sidebar {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.sidebar-widget {
  background: white;
  border-radius: 0.75rem;
  padding: 1.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.sidebar-widget h3 {
  margin: 0 0 1rem;
  color: #1f2937;
  font-size: 1rem;
  font-weight: 600;
}

.system-status {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.status-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.875rem;
}

.status-label {
  color: #4b5563;
}

.status-indicator {
  font-size: 0.75rem;
  font-weight: 500;
}

.popular-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.tag-item {
  background: #e5e7eb;
  color: #374151;
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
  font-size: 0.75rem;
  cursor: pointer;
  transition: all 0.2s;
}

.tag-item:hover {
  background: #667eea;
  color: white;
}

.recent-comments {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.comment-item {
  padding: 0.75rem;
  background: #f9fafb;
  border-radius: 0.5rem;
}

.comment-author {
  font-weight: 500;
  color: #1f2937;
  font-size: 0.875rem;
  margin-bottom: 0.25rem;
}

.comment-content {
  font-size: 0.75rem;
  color: #4b5563;
  line-height: 1.4;
  margin-bottom: 0.25rem;
}

.comment-time {
  font-size: 0.625rem;
  color: #6b7280;
}

.weather-widget {
  text-align: center;
}

.weather-main {
  margin-bottom: 1rem;
}

.weather-temp {
  font-size: 2rem;
  font-weight: bold;
  color: #1f2937;
  margin-bottom: 0.25rem;
}

.weather-desc {
  color: #6b7280;
  font-size: 0.875rem;
}

.weather-details {
  display: flex;
  justify-content: space-around;
}

.weather-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.75rem;
  color: #4b5563;
}

@media (max-width: 1024px) {
  .dashboard-content {
    grid-template-columns: 1fr;
  }
  
  .welcome-section {
    flex-direction: column;
    text-align: center;
    gap: 1rem;
  }
  
  .stats-grid {
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  }
}

@media (max-width: 640px) {
  .dashboard-container {
    padding: 1rem;
  }
  
  .stats-grid {
    grid-template-columns: 1fr;
  }
  
  .quick-actions {
    flex-direction: column;
    width: 100%;
  }
}
</style>
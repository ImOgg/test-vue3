<template>
  <div class="max-w-7xl mx-auto p-4 md:p-8">
    <!-- 歡迎區塊 -->
    <div class="flex flex-col lg:flex-row justify-between items-center bg-gray-900 text-white p-6 md:p-8 rounded-2xl mb-6 md:mb-8 gap-4 lg:gap-0">
      <div class="text-center lg:text-left">
        <h1 class="text-2xl md:text-3xl lg:text-4xl font-bold mb-2">👋 歡迎回來,{{ currentUser?.name || '用戶' }}!</h1>
        <p class="opacity-90">這是您的專屬儀表板,查看最新動態與重要資訊</p>
      </div>
      <div class="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
        <router-link to="/users/create" class="bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white px-6 py-3 rounded-lg transition-all duration-200 hover:-translate-y-0.5 text-center">
          ➕ 新增用戶
        </router-link>
        <router-link to="/posts" class="bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white px-6 py-3 rounded-lg transition-all duration-200 hover:-translate-y-0.5 text-center">
          📝 發表文章
        </router-link>
      </div>
    </div>

    <!-- 統計卡片 -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-6 md:mb-8">
      <div class="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-all duration-200 hover:-translate-y-0.5 flex items-center gap-4 border border-gray-200">
        <div class="text-4xl opacity-80">👥</div>
        <div class="flex-1">
          <h3 class="text-sm font-medium text-gray-500 mb-1">總用戶數</h3>
          <div class="text-3xl font-bold text-gray-900 mb-1">{{ stats.totalUsers }}</div>
          <div class="text-xs font-medium text-green-600">
            ↗️ +{{ stats.newUsersToday }} 今日新增
          </div>
        </div>
      </div>

      <div class="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-all duration-200 hover:-translate-y-0.5 flex items-center gap-4 border border-gray-200">
        <div class="text-4xl opacity-80">📄</div>
        <div class="flex-1">
          <h3 class="text-sm font-medium text-gray-500 mb-1">文章總數</h3>
          <div class="text-3xl font-bold text-gray-900 mb-1">{{ stats.totalPosts }}</div>
          <div class="text-xs font-medium text-green-600">
            ↗️ +{{ stats.newPostsToday }} 今日發表
          </div>
        </div>
      </div>

      <div class="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-all duration-200 hover:-translate-y-0.5 flex items-center gap-4 border border-gray-200">
        <div class="text-4xl opacity-80">💬</div>
        <div class="flex-1">
          <h3 class="text-sm font-medium text-gray-500 mb-1">評論總數</h3>
          <div class="text-3xl font-bold text-gray-900 mb-1">{{ stats.totalComments }}</div>
          <div class="text-xs font-medium text-gray-500">
            → {{ stats.avgCommentsPerPost }} 平均每篇
          </div>
        </div>
      </div>

      <div class="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-all duration-200 hover:-translate-y-0.5 flex items-center gap-4 border border-gray-200">
        <div class="text-4xl opacity-80">🟢</div>
        <div class="flex-1">
          <h3 class="text-sm font-medium text-gray-500 mb-1">活躍用戶</h3>
          <div class="text-3xl font-bold text-gray-900 mb-1">{{ stats.activeUsers }}</div>
          <div class="text-xs font-medium text-green-600">
            ↗️ {{ Math.round(stats.activeUsers/stats.totalUsers*100) }}% 活躍率
          </div>
        </div>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-6 md:gap-8">
      <!-- 左側內容 -->
      <div class="flex flex-col gap-6 md:gap-8">
        <!-- 最新文章 -->
        <div class="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div class="flex justify-between items-center mb-6 pb-3 border-b border-gray-200">
            <h2 class="text-xl font-semibold text-gray-900">📰 最新文章</h2>
            <router-link to="/posts" class="text-sm font-medium text-gray-700 hover:text-gray-900 hover:underline">查看全部</router-link>
          </div>

          <div class="flex flex-col gap-4">
            <div
              v-for="post in recentPosts"
              :key="post.id"
              class="p-4 border border-gray-200 rounded-lg cursor-pointer transition-all duration-200 hover:border-gray-900 hover:bg-slate-50"
              @click="goToPost(post.id)"
            >
              <div class="flex gap-4 mb-2 text-xs text-gray-500">
                <span>{{ formatDate(post.createdAt) }}</span>
                <span>{{ getAuthorName(post.userId) }}</span>
              </div>
              <h4 class="text-base font-semibold text-gray-900 mb-2">{{ post.title }}</h4>
              <p class="text-sm text-gray-600 leading-relaxed mb-3">{{ getExcerpt(post.content) }}</p>
              <div class="flex gap-4 text-xs text-gray-500">
                <span>💬 {{ getCommentCount(post.id) }}</span>
                <span>⏱️ {{ getReadTime(post.content) }} 分鐘</span>
              </div>
            </div>
          </div>
        </div>

        <!-- 用戶活動 -->
        <div class="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div class="flex justify-between items-center mb-6 pb-3 border-b border-gray-200">
            <h2 class="text-xl font-semibold text-gray-900">👤 用戶活動</h2>
            <router-link to="/users" class="text-sm font-medium text-gray-700 hover:text-gray-900 hover:underline">查看全部</router-link>
          </div>

          <div class="flex flex-col gap-4">
            <div
              v-for="activity in userActivities"
              :key="activity.id"
              class="flex gap-3 items-start"
            >
              <div class="w-8 h-8 bg-gray-900 text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">
                {{ getInitials(activity.userName) }}
              </div>
              <div class="flex-1">
                <div class="text-sm text-gray-900 mb-1">
                  <strong>{{ activity.userName }}</strong>
                  {{ activity.action }}
                  <span class="text-gray-700">{{ activity.target }}</span>
                </div>
                <div class="text-xs text-gray-500">{{ formatRelativeTime(activity.timestamp) }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 右側邊欄 -->
      <div class="flex flex-col gap-6">
        <!-- 系統狀態 -->
        <div class="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <h3 class="text-base font-semibold text-gray-900 mb-4">🔧 系統狀態</h3>
          <div class="flex flex-col gap-3">
            <div class="flex justify-between items-center text-sm">
              <span class="text-gray-600">資料庫</span>
              <span class="text-xs font-medium">🟢 正常</span>
            </div>
            <div class="flex justify-between items-center text-sm">
              <span class="text-gray-600">API 服務</span>
              <span class="text-xs font-medium">🟢 正常</span>
            </div>
            <div class="flex justify-between items-center text-sm">
              <span class="text-gray-600">快取系統</span>
              <span class="text-xs font-medium">🟡 較慢</span>
            </div>
          </div>
        </div>

        <!-- 熱門標籤 -->
        <div class="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <h3 class="text-base font-semibold text-gray-900 mb-4">🏷️ 熱門標籤</h3>
          <div class="flex flex-wrap gap-2">
            <span
              v-for="tag in popularTags"
              :key="tag.name"
              class="bg-gray-200 hover:bg-gray-900 hover:text-white text-gray-700 px-2 py-1 rounded text-xs cursor-pointer transition-all duration-200"
              :style="{ fontSize: getTagSize(tag.count) }"
            >
              #{{ tag.name }}
            </span>
          </div>
        </div>

        <!-- 最新評論 -->
        <div class="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <h3 class="text-base font-semibold text-gray-900 mb-4">💭 最新評論</h3>
          <div class="flex flex-col gap-4">
            <div
              v-for="comment in recentComments"
              :key="comment.id"
              class="p-3 bg-gray-50 rounded-lg"
            >
              <div class="font-medium text-gray-900 text-sm mb-1">{{ comment.name }}</div>
              <div class="text-xs text-gray-600 leading-snug mb-1">"{{ getCommentExcerpt(comment.body) }}"</div>
              <div class="text-[0.625rem] text-gray-500">{{ formatRelativeTime(comment.createdAt) }}</div>
            </div>
          </div>
        </div>

        <!-- 天氣小工具 -->
        <div class="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <h3 class="text-base font-semibold text-gray-900 mb-4">🌤️ 今日天氣</h3>
          <div class="text-center">
            <div class="mb-4">
              <div class="text-3xl font-bold text-gray-900 mb-1">{{ weather.temperature }}°C</div>
              <div class="text-sm text-gray-500">{{ weather.description }}</div>
            </div>
            <div class="flex justify-around">
              <div class="flex flex-col items-center gap-1 text-xs text-gray-600">
                <span>💧</span>
                <span>{{ weather.humidity }}%</span>
              </div>
              <div class="flex flex-col items-center gap-1 text-xs text-gray-600">
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
        body: '這篇文章寫得很好,學到了很多東西!',
        createdAt: Date.now() - 180000
      },
      {
        id: 2,
        name: '林小雨',
        body: '感謝分享,期待更多相關內容',
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

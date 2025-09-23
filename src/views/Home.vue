<template>
  <div class="home">
    <div class="hero">
      <h1>🏗️ Vue 3 企業級架構</h1>
      <p>基於 Vue 3 + Pinia + Zod + JSON Server 的完整前端架構</p>
      <div class="stats">
        <div class="stat-card">
          <h3>{{ userStore.users.length }}</h3>
          <p>用戶總數</p>
        </div>
        <div class="stat-card">
          <h3>{{ postStore.posts.length }}</h3>
          <p>文章總數</p>
        </div>
        <div class="stat-card">
          <h3>{{ userStore.activeUsers.length }}</h3>
          <p>活躍用戶</p>
        </div>
      </div>
    </div>

    <div class="features">
      <h2>🎯 核心功能</h2>
      <div class="feature-grid">
        <div class="feature-card">
          <h3>🛡️ 資料驗證</h3>
          <p>使用 Zod 進行雙重驗證保護</p>
        </div>
        <div class="feature-card">
          <h3>📦 狀態管理</h3>
          <p>Pinia 響應式狀態管理</p>
        </div>
        <div class="feature-card">
          <h3>🔧 分層架構</h3>
          <p>6 層清晰的企業級架構</p>
        </div>
        <div class="feature-card">
          <h3>🚀 高效開發</h3>
          <p>可複用的 Composable 邏輯</p>
        </div>
      </div>
    </div>

    <div class="quick-actions">
      <h2>🚀 快速操作</h2>
      <div class="action-buttons">
        <router-link to="/users" class="btn btn-primary">
          👥 用戶管理
        </router-link>
        <router-link to="/posts" class="btn btn-secondary">
          📝 文章管理
        </router-link>
        <button @click="refreshData" class="btn btn-outline" :disabled="loading">
          {{ loading ? '載入中...' : '🔄 重新載入' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useUserStore } from '@/stores/user'
import { usePostStore } from '@/stores/post'

const userStore = useUserStore()
const postStore = usePostStore()
const loading = ref(false)

const refreshData = async () => {
  loading.value = true
  try {
    await Promise.all([
      userStore.fetchUsers(),
      postStore.fetchPosts()
    ])
  } catch (error) {
    console.error('載入資料失敗:', error)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  refreshData()
})
</script>

<style scoped>
.home {
  max-width: 1400px;
  margin: 0 auto;
  padding: 2rem;
}

.hero {
  text-align: center;
  padding: 3rem 0;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: 1rem;
  margin-bottom: 3rem;
}

.hero h1 {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.hero p {
  font-size: 1.2rem;
  margin-bottom: 2rem;
  opacity: 0.9;
}

.stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 1rem;
  max-width: 600px;
  margin: 0 auto;
}

.stat-card {
  background: rgba(255, 255, 255, 0.1);
  padding: 1.5rem;
  border-radius: 0.5rem;
  backdrop-filter: blur(10px);
}

.stat-card h3 {
  font-size: 2rem;
  margin-bottom: 0.5rem;
}

.features {
  margin-bottom: 3rem;
}

.features h2 {
  text-align: center;
  margin-bottom: 2rem;
  color: #333;
}

.feature-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
}

.feature-card {
  background: white;
  padding: 2rem;
  border-radius: 0.5rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  border: 1px solid #e2e8f0;
}

.feature-card h3 {
  color: #4a5568;
  margin-bottom: 1rem;
}

.quick-actions {
  text-align: center;
}

.quick-actions h2 {
  margin-bottom: 2rem;
  color: #333;
}

.action-buttons {
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
}

.btn {
  padding: 0.75rem 1.5rem;
  border-radius: 0.5rem;
  text-decoration: none;
  font-weight: 500;
  transition: all 0.2s;
  border: none;
  cursor: pointer;
  font-size: 1rem;
}

.btn-primary {
  background: #667eea;
  color: white;
}

.btn-primary:hover {
  background: #5a6fd8;
  transform: translateY(-2px);
}

.btn-secondary {
  background: #48bb78;
  color: white;
}

.btn-secondary:hover {
  background: #38a169;
  transform: translateY(-2px);
}

.btn-outline {
  background: transparent;
  color: #667eea;
  border: 2px solid #667eea;
}

.btn-outline:hover {
  background: #667eea;
  color: white;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}
</style>
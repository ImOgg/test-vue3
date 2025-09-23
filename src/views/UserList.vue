<template>
  <div class="user-list-container">
    <!-- 標題與操作按鈕 -->
    <div class="header">
      <h1>👥 用戶管理</h1>
      <div class="header-actions">
        <router-link to="/users/create" class="btn btn-primary">
          ➕ 新增用戶
        </router-link>
        <button @click="refreshUsers" class="btn btn-outline" :disabled="loading">
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
          placeholder="🔍 搜尋用戶名稱或信箱..."
          class="search-input"
        />
      </div>
      <div class="filter-options">
        <select v-model="statusFilter" class="filter-select">
          <option value="">所有狀態</option>
          <option value="active">活躍用戶</option>
          <option value="inactive">非活躍用戶</option>
        </select>
        <select v-model="sortBy" class="filter-select">
          <option value="name">按名稱排序</option>
          <option value="email">按信箱排序</option>
          <option value="age">按年齡排序</option>
          <option value="createdAt">按建立時間排序</option>
        </select>
      </div>
    </div>

    <!-- 用戶統計 -->
    <div class="stats">
      <div class="stat-item">
        <span class="stat-label">總用戶數</span>
        <span class="stat-value">{{ userStats.total }}</span>
      </div>
      <div class="stat-item">
        <span class="stat-label">活躍用戶</span>
        <span class="stat-value">{{ userStats.active }}</span>
      </div>
      <div class="stat-item">
        <span class="stat-label">非活躍用戶</span>
        <span class="stat-value">{{ userStats.inactive }}</span>
      </div>
      <div class="stat-item">
        <span class="stat-label">搜尋結果</span>
        <span class="stat-value">{{ filteredUsers.length }}</span>
      </div>
    </div>

    <!-- 用戶列表 -->
    <div v-if="loading" class="loading">
      <div class="loading-spinner"></div>
      <p>載入用戶資料中...</p>
    </div>

    <div v-else-if="filteredUsers.length === 0" class="empty-state">
      <div class="empty-icon">👤</div>
      <h3>沒有找到用戶</h3>
      <p>{{ searchQuery ? '請嘗試不同的搜尋條件' : '開始新增第一個用戶吧！' }}</p>
      <router-link to="/users/create" class="btn btn-primary">
        新增用戶
      </router-link>
    </div>

    <div v-else class="user-grid">
      <div
        v-for="user in paginatedUsers"
        :key="user.id"
        class="user-card"
        @click="viewUserDetail(user.id)"
      >
        <div class="user-avatar">
          {{ getInitials(user.name) }}
        </div>
        <div class="user-info">
          <h3 class="user-name">{{ user.name }}</h3>
          <p class="user-email">{{ user.email }}</p>
          <p class="user-age">年齡: {{ user.age }}</p>
          <span :class="['user-status', user.isActive ? 'active' : 'inactive']">
            {{ user.isActive ? '活躍' : '非活躍' }}
          </span>
        </div>
        <div class="user-actions" @click.stop>
          <button @click="editUser(user)" class="action-btn edit" title="編輯">
            ✏️
          </button>
          <button @click="toggleUserStatus(user)" class="action-btn toggle" :title="user.isActive ? '停用' : '啟用'">
            {{ user.isActive ? '⏸️' : '▶️' }}
          </button>
          <button @click="deleteUserLocal(user)" class="action-btn delete" title="刪除">
            🗑️
          </button>
        </div>
      </div>
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
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useUserManagement } from '@/hooks/useUsers.js'

const router = useRouter()

// 使用新的 hooks
const {
  users,
  activeUsers,
  filteredUsers: managedFilteredUsers,
  userStats,
  isLoading,
  error,
  refetch,
  searchTerm,
  createUser,
  updateUser,
  deleteUser,
  isCreating,
  isUpdating,
  isDeleting,
} = useUserManagement()

// 本地響應式資料（保持向後兼容）
const loading = computed(() => isLoading.value)

// 搜尋與篩選（使用 hooks 中的 searchTerm）
const searchQuery = searchTerm
const statusFilter = ref('')
const sortBy = ref('name')

// 分頁
const currentPage = ref(1)
const itemsPerPage = ref(12)

// 計算屬性
const filteredUsers = computed(() => {
  let userList = [...managedFilteredUsers.value]
  
  // 狀態篩選
  if (statusFilter.value === 'active') {
    userList = userList.filter(user => user.isActive)
  } else if (statusFilter.value === 'inactive') {
    userList = userList.filter(user => !user.isActive)
  }
  
  // 排序
  userList.sort((a, b) => {
    switch (sortBy.value) {
      case 'name':
        return a.name.localeCompare(b.name)
      case 'email':
        return a.email.localeCompare(b.email)
      case 'age':
        return a.age - b.age
      default:
        return 0
    }
  })
  
  return userList
})

const totalPages = computed(() => Math.ceil(filteredUsers.value.length / itemsPerPage.value))

const paginatedUsers = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value
  const end = start + itemsPerPage.value
  return filteredUsers.value.slice(start, end)
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
const refreshUsers = () => {
  refetch()
}

const getInitials = (name) => {
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
}

const viewUserDetail = (userId) => {
  router.push(`/users/${userId}`)
}

const editUser = (user) => {
  router.push(`/users/${user.id}/edit`)
}

const toggleUserStatus = async (user) => {
  try {
    await updateUser({ id: user.id, data: { ...user, isActive: !user.isActive } })
  } catch (error) {
    console.error('更新用戶狀態失敗:', error)
    alert('更新用戶狀態失敗')
  }
}

const deleteUserLocal = async (user) => {
  if (!confirm(`確定要刪除用戶「${user.name}」嗎？`)) return
  
  try {
    await deleteUser(user.id)
  } catch (error) {
    console.error('刪除用戶失敗:', error)
    alert('刪除用戶失敗')
  }
}
</script>

<style scoped>
.user-list-container {
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

.user-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
}

.user-card {
  background: white;
  border-radius: 0.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  padding: 1.5rem;
  cursor: pointer;
  transition: all 0.2s;
  position: relative;
}

.user-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.user-avatar {
  width: 4rem;
  height: 4rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 1.2rem;
  margin: 0 auto 1rem;
}

.user-info {
  text-align: center;
}

.user-name {
  margin: 0 0 0.5rem;
  color: #1f2937;
}

.user-email {
  color: #6b7280;
  margin: 0 0 0.5rem;
  font-size: 0.875rem;
}

.user-age {
  color: #6b7280;
  margin: 0 0 1rem;
  font-size: 0.875rem;
}

.user-status {
  display: inline-block;
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
  font-size: 0.75rem;
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

.user-actions {
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  display: flex;
  gap: 0.25rem;
  opacity: 0;
  transition: opacity 0.2s;
}

.user-card:hover .user-actions {
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
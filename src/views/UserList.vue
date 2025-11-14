<template>
  <div class="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
    <!-- 標題與操作按鈕 -->
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
      <h1 class="text-2xl sm:text-3xl font-bold text-gray-800 m-0">👥 用戶管理</h1>
      <div class="flex gap-4 w-full sm:w-auto">
        <Button as-child size="lg" class="flex-1 sm:flex-none">
          <router-link to="/users/create">
            ➕ 新增用戶
          </router-link>
        </Button>
        <Button
          variant="outline"
          size="lg"
          @click="refreshUsers"
          :disabled="loading"
          class="flex-1 sm:flex-none"
        >
          {{ loading ? '載入中...' : '🔄 重新載入' }}
        </Button>
      </div>
    </div>

    <!-- 搜尋與篩選 -->
    <div class="bg-white p-6 rounded-lg shadow-md mb-8">
      <div class="mb-4">
        <input
          v-model="searchQuery"
          type="text"
          placeholder="🔍 搜尋用戶名稱或信箱..."
          class="w-full px-4 py-3 border-2 border-gray-200 rounded-lg text-base focus:outline-none focus:border-gray-500 transition-colors duration-200"
        />
      </div>
      <div class="flex gap-4 flex-wrap">
        <select
          v-model="statusFilter"
          class="px-4 py-2 border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent"
        >
          <option value="">所有狀態</option>
          <option value="active">活躍用戶</option>
          <option value="inactive">非活躍用戶</option>
        </select>
        <select
          v-model="sortBy"
          class="px-4 py-2 border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent"
        >
          <option value="name">按名稱排序</option>
          <option value="email">按信箱排序</option>
          <option value="age">按年齡排序</option>
          <option value="createdAt">按建立時間排序</option>
        </select>
      </div>
    </div>

    <!-- 用戶統計 -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      <div class="bg-white p-6 rounded-lg shadow-md text-center">
        <span class="block text-gray-500 text-sm mb-2">總用戶數</span>
        <span class="block text-gray-800 text-3xl font-bold">{{ userStats.total }}</span>
      </div>
      <div class="bg-white p-6 rounded-lg shadow-md text-center">
        <span class="block text-gray-500 text-sm mb-2">活躍用戶</span>
        <span class="block text-gray-800 text-3xl font-bold">{{ userStats.active }}</span>
      </div>
      <div class="bg-white p-6 rounded-lg shadow-md text-center">
        <span class="block text-gray-500 text-sm mb-2">非活躍用戶</span>
        <span class="block text-gray-800 text-3xl font-bold">{{ userStats.inactive }}</span>
      </div>
      <div class="bg-white p-6 rounded-lg shadow-md text-center">
        <span class="block text-gray-500 text-sm mb-2">搜尋結果</span>
        <span class="block text-gray-800 text-3xl font-bold">{{ filteredUsers.length }}</span>
      </div>
    </div>

    <!-- 用戶列表 -->
    <div v-if="loading" class="text-center py-12">
      <div class="w-12 h-12 border-4 border-gray-200 border-t-gray-900 rounded-full animate-spin mx-auto mb-4"></div>
      <p class="text-gray-600">載入用戶資料中...</p>
    </div>

    <div v-else-if="filteredUsers.length === 0" class="text-center py-12 bg-white rounded-lg shadow-md">
      <div class="text-6xl mb-4">👤</div>
      <h3 class="text-xl font-semibold text-gray-800 mb-2">沒有找到用戶</h3>
      <p class="text-gray-600 mb-6">{{ searchQuery ? '請嘗試不同的搜尋條件' : '開始新增第一個用戶吧！' }}</p>
      <Button as-child size="lg">
        <router-link to="/users/create">
          新增用戶
        </router-link>
      </Button>
    </div>

    <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      <div
        v-for="user in paginatedUsers"
        :key="user.id"
        class="bg-white rounded-lg shadow-md p-6 cursor-pointer transition-all duration-200 hover:-translate-y-1 hover:shadow-lg relative group"
        @click="viewUserDetail(user.id)"
      >
        <div class="w-16 h-16 bg-gray-800 text-white rounded-full flex items-center justify-center font-bold text-xl mx-auto mb-4">
          {{ getInitials(user.name) }}
        </div>
        <div class="text-center">
          <h3 class="my-0 mb-2 text-gray-800 text-lg font-semibold">{{ user.name }}</h3>
          <p class="text-gray-500 my-0 mb-2 text-sm">{{ user.email }}</p>
          <p class="text-gray-500 my-0 mb-4 text-sm">年齡: {{ user.age }}</p>
          <span :class="['inline-block px-2 py-1 rounded text-xs font-medium', user.isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800']">
            {{ user.isActive ? '活躍' : '非活躍' }}
          </span>
        </div>
        <div class="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200" @click.stop>
          <Button
            variant="outline"
            size="xs"
            @click="editUser(user)"
            title="編輯"
          >
            ✏️
          </Button>
          <Button
            variant="outline"
            size="xs"
            @click="toggleUserStatus(user)"
            :title="user.isActive ? '停用' : '啟用'"
          >
            {{ user.isActive ? '⏸️' : '▶️' }}
          </Button>
          <Button
            variant="outline"
            size="xs"
            @click="deleteUserLocal(user)"
            title="刪除"
          >
            🗑️
          </Button>
        </div>
      </div>
    </div>

    <!-- 分頁 -->
    <div v-if="totalPages > 1" class="flex justify-center items-center gap-2 mt-8 flex-wrap">
      <Button
        variant="outline"
        @click="currentPage = Math.max(1, currentPage - 1)"
        :disabled="currentPage === 1"
      >
        ◀️ 上一頁
      </Button>

      <div class="flex gap-1">
        <Button
          v-for="page in visiblePages"
          :key="page"
          :variant="page === currentPage ? 'default' : 'outline'"
          @click="currentPage = page"
        >
          {{ page }}
        </Button>
      </div>

      <Button
        variant="outline"
        @click="currentPage = Math.min(totalPages, currentPage + 1)"
        :disabled="currentPage === totalPages"
      >
        下一頁 ▶️
      </Button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useUserManagement } from '@/hooks/useUsers.js'
import { Button } from '@/components/ui/button'

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
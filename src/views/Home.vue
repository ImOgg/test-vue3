<template>
  <div class="max-w-6xl mx-auto px-6 py-16">
    <div
      class="flex flex-col items-center gap-8 py-16 px-6 bg-gray-100 rounded-2xl shadow-lg border border-gray-200">
      <h1 class="text-5xl font-extrabold text-gray-900 flex items-center gap-2">
        🏗️ <span>Vue 3</span>
      </h1>

      <p class="text-gray-600 text-lg text-center max-w-xl">
        基於 Vue 3 + Pinia + Zod + JSON Server 的完整前端架構
      </p>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8 w-full max-w-4xl">
        <div class="bg-white rounded-xl p-6 shadow-md flex flex-col items-center border border-gray-200">
          <h3 class="text-4xl font-bold text-gray-900">{{ userStore.users.length }}</h3>
          <p class="text-gray-500 mt-2">用戶總數</p>
        </div>

        <div class="bg-white rounded-xl p-6 shadow-md flex flex-col items-center border border-gray-200">
          <h3 class="text-4xl font-bold text-gray-900">{{ postStore.posts.length }}</h3>
          <p class="text-gray-500 mt-2">文章總數</p>
        </div>

        <div class="bg-white rounded-xl p-6 shadow-md flex flex-col items-center border border-gray-200">
          <h3 class="text-4xl font-bold text-gray-900">{{ userStore.activeUsers.length }}</h3>
          <p class="text-gray-500 mt-2">活躍用戶</p>
        </div>
      </div>
    </div>


    <!-- 核心功能 -->
    <div class="mt-12">
      <h2 class="text-3xl font-bold text-gray-900 text-center mb-8">🎯 核心功能</h2>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div class="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow border border-gray-200">
          <h3 class="text-2xl font-bold text-gray-900 mb-2">🛡️ 資料驗證</h3>
          <p class="text-gray-600">使用 Zod 進行雙重驗證保護</p>
        </div>
        <div class="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow border border-gray-200">
          <h3 class="text-2xl font-bold text-gray-900 mb-2">📦 狀態管理</h3>
          <p class="text-gray-600">Pinia 響應式狀態管理</p>
        </div>
        <div class="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow border border-gray-200">
          <h3 class="text-2xl font-bold text-gray-900 mb-2">🔧 分層架構</h3>
          <p class="text-gray-600">6 層清晰的架構</p>
        </div>
        <div class="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow border border-gray-200">
          <h3 class="text-2xl font-bold text-gray-900 mb-2">🚀 高效開發</h3>
          <p class="text-gray-600">可複用的 Composable 邏輯</p>
        </div>
      </div>
    </div>

    <!-- 快速操作 -->
    <div class="mt-12 bg-white rounded-2xl p-8 shadow-lg border border-gray-200">
      <h2 class="text-3xl font-bold text-gray-900 text-center mb-6">🚀 快速操作</h2>
      <div class="flex flex-wrap justify-center gap-4">
        <router-link to="/users" class="px-6 py-3 bg-gray-900 text-white rounded-lg font-medium hover:bg-gray-800 transition-colors shadow-md">
          👥 用戶管理
        </router-link>
        <router-link to="/posts" class="px-6 py-3 bg-gray-700 text-white rounded-lg font-medium hover:bg-gray-600 transition-colors shadow-md">
          📝 文章管理
        </router-link>
        <button @click="refreshData" :disabled="loading" class="px-6 py-3 bg-white border-2 border-gray-900 text-gray-900 rounded-lg font-medium hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-md">
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


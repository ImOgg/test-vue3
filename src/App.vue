<template>
  <div id="app" class="min-h-screen flex flex-col">
    <!-- 導覽列 -->
    <nav class="bg-gray-900 shadow-lg sticky top-0 z-50">
      <div class="max-w-7xl mx-auto px-4">
        <div class="flex items-center justify-between h-16">
          <!-- Logo -->
          <router-link to="/" class="text-2xl font-bold text-white hover:text-gray-300 transition-colors">
            🚀 Vue 3
          </router-link>

          <!-- 桌面選單 -->
          <div class="hidden md:flex items-center gap-6">
            <router-link to="/" class="text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-all font-medium router-link-exact-active:bg-gray-800">
              🏠 首頁
            </router-link>
            <router-link to="/dashboard" class="text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-all font-medium router-link-exact-active:bg-gray-800">
              📊 儀表板
            </router-link>
            <router-link to="/users" class="text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-all font-medium router-link-exact-active:bg-gray-800">
              用戶管理
            </router-link>
            <router-link to="/posts" class="text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-all font-medium router-link-exact-active:bg-gray-800">
              文章管理
            </router-link>
          </div>

          <!-- 手機選單按鈕 -->
          <button @click="toggleMenu" class="md:hidden flex flex-col p-2 space-y-1">
            <span class="w-6 h-0.5 bg-white rounded transition-transform" :class="{ 'rotate-45 translate-y-1.5': isMenuOpen }"></span>
            <span class="w-6 h-0.5 bg-white rounded transition-opacity" :class="{ 'opacity-0': isMenuOpen }"></span>
            <span class="w-6 h-0.5 bg-white rounded transition-transform" :class="{ '-rotate-45 -translate-y-1.5': isMenuOpen }"></span>
          </button>
        </div>

        <!-- 手機選單 -->
        <div v-show="isMenuOpen" class="md:hidden pb-4 space-y-2">
          <router-link to="/" @click="closeMenu" class="block text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-all font-medium">
            🏠 首頁
          </router-link>
          <router-link to="/dashboard" @click="closeMenu" class="block text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-all font-medium">
            📊 儀表板
          </router-link>
          <router-link to="/users" @click="closeMenu" class="block text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-all font-medium">
            用戶管理
          </router-link>
          <router-link to="/posts" @click="closeMenu" class="block text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-all font-medium">
            文章管理
          </router-link>
        </div>
      </div>
    </nav>

    <!-- 主要內容區域 -->
    <main class="flex-1 bg-slate-50">
      <router-view v-slot="{ Component, route }">
        <transition
          name="fade"
          mode="out-in"
        >
          <component :is="Component" :key="route.path" />
        </transition>
      </router-view>
    </main>

    <!-- 頁腳 -->
    <footer class="bg-gray-900 text-gray-400 py-8 mt-auto">
      <div class="max-w-7xl mx-auto px-4">
        <div class="flex flex-col md:flex-row justify-between items-center gap-4">
          <p class="text-center md:text-left">&copy; 2024 Vue 3 企業架構範例. 展示完整的 6 層架構設計</p>
          <div class="flex gap-6">
            <a href="https://vuejs.org" target="_blank" class="hover:text-white transition-colors">Vue.js</a>
            <a href="https://pinia.vuejs.org" target="_blank" class="hover:text-white transition-colors">Pinia</a>
            <a href="https://zod.dev" target="_blank" class="hover:text-white transition-colors">Zod</a>
            <a href="https://axios-http.com" target="_blank" class="hover:text-white transition-colors">Axios</a>
          </div>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

// 響應式資料
const isMenuOpen = ref<boolean>(false)

// 方法
const toggleMenu = () => {
  isMenuOpen.value = !isMenuOpen.value
}

const closeMenu = () => {
  isMenuOpen.value = false
}

</script>

<style>
/* Fade 轉場動畫 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* 全域滾動條樣式 */
::-webkit-scrollbar {
  width: 8px;
}

::-webkit-scrollbar-track {
  background: #f1f1f1;
}

::-webkit-scrollbar-thumb {
  background: #4b5563;
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: #374151;
}
</style>

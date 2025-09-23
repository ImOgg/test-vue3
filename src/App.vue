<template>
  <div id="app">
    <!-- 導覽列 -->
    <nav class="navbar">
    <div class="nav-container">
      <!-- Logo -->
      <router-link to="/" class="nav-logo">
        🚀 Vue 3 企業架構
      </router-link>

      <!-- 導覽選單 -->
      <div class="nav-menu" :class="{ active: isMenuOpen }">
        <router-link to="/" class="nav-link" @click="closeMenu">
          🏠 首頁
        </router-link>
        <router-link to="/dashboard" class="nav-link" @click="closeMenu">
          📊 儀表板
        </router-link>
        <router-link to="/users" class="nav-link" @click="closeMenu">
           用戶管理
        </router-link>
        <router-link to="/posts" class="nav-link" @click="closeMenu">
           文章管理
        </router-link>
      </div>

      <!-- 手機選單按鈕 -->
      <button class="nav-toggle" @click="toggleMenu">
        <span></span>
        <span></span>
        <span></span>
      </button>
    </div>
  </nav>

  <!-- 主要內容區域 -->
   <main class="main-content">
    <router-view v-slot="{ Component, route }">
      <transition 
        name="fade" 
        mode="out-in"
        @before-enter="onBeforeEnter"
        @enter="onEnter"
        @leave="onLeave"
      >
        <component :is="Component" :key="route.path" />
      </transition>
    </router-view>
  </main>

  <!-- 頁腳 -->
  <footer class="footer">
    <div class="footer-content">
      <p>&copy; 2024 Vue 3 企業架構範例. 展示完整的 6 層架構設計</p>
      <div class="footer-links">
        <a href="https://vuejs.org" target="_blank">Vue.js</a>
        <a href="https://pinia.vuejs.org" target="_blank">Pinia</a>
        <a href="https://zod.dev" target="_blank">Zod</a>
        <a href="https://axios-http.com" target="_blank">Axios</a>
      </div>
    </div>
  </footer>
  </div>
</template>

<script setup>
import { ref } from 'vue'

// 響應式資料
const isMenuOpen = ref(false)

// 方法
const toggleMenu = () => {
  isMenuOpen.value = !isMenuOpen.value
}

const closeMenu = () => {
  isMenuOpen.value = false
}
</script>

<style scoped>
#app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

/* 導覽列樣式 */
.navbar {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  position: sticky;
  top: 0;
  z-index: 1000;
}

.nav-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 70px;
}

.nav-logo {
  font-size: 1.5rem;
  font-weight: bold;
  color: white;
  text-decoration: none;
  transition: color 0.2s;
}

.nav-logo:hover {
  color: #f0f4ff;
}

.nav-menu {
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

.nav-link {
  color: white;
  text-decoration: none;
  padding: 0.5rem 1rem;
  border-radius: 0.5rem;
  transition: all 0.2s;
  font-weight: 500;
}

.nav-link:hover,
.nav-link.router-link-active {
  background: rgba(255, 255, 255, 0.2);
  transform: translateY(-1px);
}

.nav-actions {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.btn {
  padding: 0.5rem 1rem;
  border-radius: 0.5rem;
  text-decoration: none;
  font-weight: 500;
  transition: all 0.2s;
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.875rem;
}

.btn-primary {
  background: rgba(255, 255, 255, 0.2);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.3);
}

.btn-primary:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: translateY(-1px);
}

.btn-secondary {
  background: transparent;
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.5);
}

.btn-secondary:hover {
  background: rgba(255, 255, 255, 0.1);
  transform: translateY(-1px);
}

.nav-toggle {
  display: none;
  flex-direction: column;
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.5rem;
}

.nav-toggle span {
  width: 25px;
  height: 3px;
  background: white;
  margin: 3px 0;
  transition: 0.3s;
  border-radius: 2px;
}

/* 主要內容 */
.main-content {
  flex: 1;
  background: #f8fafc;
  min-height: calc(100vh - 70px - 80px);
  /* 減去導覽列和頁腳高度 */
}

/* 頁腳 */
.footer {
  background: #1f2937;
  color: #9ca3af;
  padding: 2rem 0;
  margin-top: auto;
}

.footer-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;
}

.footer-links {
  display: flex;
  gap: 1.5rem;
}

.footer-links a {
  color: #9ca3af;
  text-decoration: none;
  transition: color 0.2s;
}

.footer-links a:hover {
  color: #667eea;
}

/* 響應式設計 */
@media (max-width: 768px) {
  .nav-container {
    padding: 0 1rem;
  }

  .nav-menu {
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    flex-direction: column;
    padding: 1rem;
    transform: translateY(-100%);
    opacity: 0;
    visibility: hidden;
    transition: all 0.3s;
  }

  .nav-menu.active {
    transform: translateY(0);
    opacity: 1;
    visibility: visible;
  }

  .nav-actions {
    display: none;
  }

  .nav-toggle {
    display: flex;
  }

  .footer-content {
    flex-direction: column;
    text-align: center;
  }
}

@media (max-width: 480px) {
  .nav-logo {
    font-size: 1.2rem;
  }

  .nav-link {
    font-size: 0.9rem;
  }
}

/* 全域樣式 */
:global(body) {
  margin: 0;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  line-height: 1.6;
  color: #374151;
}

:global(*) {
  box-sizing: border-box;
}

:global(a) {
  color: inherit;
  text-decoration: none;
}

/* 平滑滾動 */
:global(html) {
  scroll-behavior: smooth;
}

/* 自訂滾動條 */
:global(::-webkit-scrollbar) {
  width: 8px;
}

:global(::-webkit-scrollbar-track) {
  background: #f1f1f1;
}

:global(::-webkit-scrollbar-thumb) {
  background: #667eea;
  border-radius: 4px;
}

:global(::-webkit-scrollbar-thumb:hover) {
  background: #5a6fd8;
}
</style>

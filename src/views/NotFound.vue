<template>
  <div class="not-found-container">
    <div class="not-found-content">
      <!-- 404 動畫區域 -->
      <div class="error-animation">
        <div class="error-number">
          <span class="four">4</span>
          <span class="zero">0</span>
          <span class="four">4</span>
        </div>
        <div class="error-illustration">
          <div class="floating-elements">
            <div class="element element-1">💫</div>
            <div class="element element-2">⭐</div>
            <div class="element element-3">🌟</div>
            <div class="element element-4">✨</div>
          </div>
          <div class="lost-character">
            <div class="character-face">😵‍💫</div>
            <div class="character-body"></div>
          </div>
        </div>
      </div>

      <!-- 錯誤訊息 -->
      <div class="error-message">
        <h1>找不到頁面</h1>
        <h2>看起來你走錯路了！</h2>
        <p>
          很抱歉，您要尋找的頁面不存在。<br>
          可能是網址輸入錯誤，或是頁面已經被移動或刪除了。
        </p>
      </div>

      <!-- 建議操作 -->
      <div class="suggestions">
        <h3>🤔 您可以嘗試：</h3>
        <ul class="suggestion-list">
          <li>
            <span class="suggestion-icon">🔍</span>
            檢查網址是否正確
          </li>
          <li>
            <span class="suggestion-icon">🏠</span>
            回到首頁重新開始
          </li>
          <li>
            <span class="suggestion-icon">⬅️</span>
            使用瀏覽器的上一頁功能
          </li>
          <li>
            <span class="suggestion-icon">📧</span>
            聯繫我們的技術支援
          </li>
        </ul>
      </div>

      <!-- 快速導航 -->
      <div class="quick-navigation">
        <h3>🚀 快速導航</h3>
        <div class="nav-grid">
          <router-link to="/" class="nav-card">
            <div class="nav-icon">🏠</div>
            <div class="nav-text">
              <strong>首頁</strong>
              <small>回到主頁面</small>
            </div>
          </router-link>

          <router-link to="/users" class="nav-card">
            <div class="nav-icon">👥</div>
            <div class="nav-text">
              <strong>用戶管理</strong>
              <small>查看所有用戶</small>
            </div>
          </router-link>

          <router-link to="/posts" class="nav-card">
            <div class="nav-icon">📝</div>
            <div class="nav-text">
              <strong>文章列表</strong>
              <small>瀏覽所有文章</small>
            </div>
          </router-link>

          <router-link to="/dashboard" class="nav-card">
            <div class="nav-icon">📊</div>
            <div class="nav-text">
              <strong>儀表板</strong>
              <small>查看統計資料</small>
            </div>
          </router-link>
        </div>
      </div>

      <!-- 操作按鈕 -->
      <div class="action-buttons">
        <button @click="goBack" class="btn btn-secondary">
          ⬅️ 返回上頁
        </button>
        <router-link to="/" class="btn btn-primary">
          🏠 回到首頁
        </router-link>
        <button @click="refreshPage" class="btn btn-outline">
          🔄 重新整理
        </button>
      </div>

      <!-- 搜尋功能 -->
      <div class="search-section">
        <h3>🔍 或者搜尋您要的內容</h3>
        <div class="search-box">
          <input 
            v-model="searchQuery"
            type="text" 
            placeholder="輸入關鍵字搜尋..."
            @keyup.enter="performSearch"
          />
          <button @click="performSearch" class="search-btn">
            搜尋
          </button>
        </div>
      </div>

      <!-- 頁腳資訊 -->
      <div class="error-footer">
        <p>錯誤代碼: 404 | 時間: {{ currentTime }}</p>
        <p>
          如果問題持續存在，請聯繫 
          <a href="mailto:support@example.com">技術支援</a>
        </p>
      </div>
    </div>

    <!-- 背景裝飾 -->
    <div class="background-decoration">
      <div class="bg-circle circle-1"></div>
      <div class="bg-circle circle-2"></div>
      <div class="bg-circle circle-3"></div>
      <div class="bg-shape shape-1"></div>
      <div class="bg-shape shape-2"></div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const searchQuery = ref('')
const currentTime = ref('')

// 方法
const goBack = () => {
  if (window.history.length > 1) {
    router.go(-1)
  } else {
    router.push('/')
  }
}

const refreshPage = () => {
  window.location.reload()
}

const performSearch = () => {
  if (searchQuery.value.trim()) {
    // 這裡可以導向搜尋頁面或執行搜尋邏輯
    console.log('搜尋:', searchQuery.value)
    // 暫時導向首頁，實際應用中可以導向搜尋結果頁
    router.push(`/?search=${encodeURIComponent(searchQuery.value)}`)
  }
}

const updateTime = () => {
  currentTime.value = new Date().toLocaleString('zh-TW')
}

// 生命週期
onMounted(() => {
  updateTime()
  // 每秒更新時間
  setInterval(updateTime, 1000)
})
</script>

<style scoped>
.not-found-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  position: relative;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  overflow: hidden;
}

.not-found-content {
  max-width: 800px;
  width: 100%;
  background: white;
  border-radius: 2rem;
  padding: 3rem;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  text-align: center;
  position: relative;
  z-index: 1;
}

.error-animation {
  margin-bottom: 2rem;
}

.error-number {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1rem;
  margin-bottom: 2rem;
}

.error-number span {
  font-size: 6rem;
  font-weight: bold;
  animation: bounce 2s infinite;
}

.four {
  color: #667eea;
  animation-delay: 0s;
}

.zero {
  color: #764ba2;
  animation-delay: 0.2s;
  transform: scale(1.2);
}

.error-illustration {
  position: relative;
  height: 150px;
  margin: 2rem 0;
}

.floating-elements {
  position: absolute;
  width: 100%;
  height: 100%;
}

.element {
  position: absolute;
  font-size: 1.5rem;
  animation: float 3s ease-in-out infinite;
}

.element-1 {
  top: 20%;
  left: 20%;
  animation-delay: 0s;
}

.element-2 {
  top: 10%;
  right: 25%;
  animation-delay: 0.5s;
}

.element-3 {
  bottom: 30%;
  left: 15%;
  animation-delay: 1s;
}

.element-4 {
  bottom: 20%;
  right: 20%;
  animation-delay: 1.5s;
}

.lost-character {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  animation: wobble 2s ease-in-out infinite;
}

.character-face {
  font-size: 4rem;
  margin-bottom: 0.5rem;
}

.character-body {
  width: 3rem;
  height: 4rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 1.5rem;
  margin: 0 auto;
}

.error-message h1 {
  font-size: 2.5rem;
  color: #1f2937;
  margin: 0 0 0.5rem;
}

.error-message h2 {
  font-size: 1.5rem;
  color: #667eea;
  margin: 0 0 1rem;
  font-weight: 500;
}

.error-message p {
  color: #6b7280;
  line-height: 1.6;
  margin-bottom: 2rem;
}

.suggestions {
  text-align: left;
  margin: 2rem 0;
  padding: 1.5rem;
  background: #f9fafb;
  border-radius: 1rem;
}

.suggestions h3 {
  color: #1f2937;
  margin: 0 0 1rem;
  text-align: center;
}

.suggestion-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.suggestion-list li {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.5rem 0;
  color: #4b5563;
}

.suggestion-icon {
  font-size: 1.2rem;
}

.quick-navigation {
  margin: 2rem 0;
}

.quick-navigation h3 {
  color: #1f2937;
  margin-bottom: 1.5rem;
}

.nav-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
  gap: 1rem;
}

.nav-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  padding: 1.5rem;
  background: white;
  border: 2px solid #e5e7eb;
  border-radius: 1rem;
  text-decoration: none;
  transition: all 0.2s;
}

.nav-card:hover {
  border-color: #667eea;
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.nav-icon {
  font-size: 2rem;
}

.nav-text {
  text-align: center;
}

.nav-text strong {
  display: block;
  color: #1f2937;
  font-size: 0.875rem;
  margin-bottom: 0.25rem;
}

.nav-text small {
  color: #6b7280;
  font-size: 0.75rem;
}

.action-buttons {
  display: flex;
  justify-content: center;
  gap: 1rem;
  margin: 2rem 0;
  flex-wrap: wrap;
}

.btn {
  padding: 0.75rem 1.5rem;
  border-radius: 0.5rem;
  font-weight: 500;
  text-decoration: none;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
}

.btn-primary {
  background: #667eea;
  color: white;
}

.btn-primary:hover {
  background: #5a6fd8;
  transform: translateY(-1px);
}

.btn-secondary {
  background: #6b7280;
  color: white;
}

.btn-secondary:hover {
  background: #4b5563;
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

.search-section {
  margin: 2rem 0;
}

.search-section h3 {
  color: #1f2937;
  margin-bottom: 1rem;
}

.search-box {
  display: flex;
  max-width: 400px;
  margin: 0 auto;
  border: 2px solid #e5e7eb;
  border-radius: 0.5rem;
  overflow: hidden;
}

.search-box input {
  flex: 1;
  padding: 0.75rem;
  border: none;
  outline: none;
  font-size: 1rem;
}

.search-btn {
  background: #667eea;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  cursor: pointer;
  transition: background-color 0.2s;
}

.search-btn:hover {
  background: #5a6fd8;
}

.error-footer {
  margin-top: 2rem;
  padding-top: 2rem;
  border-top: 1px solid #e5e7eb;
  color: #6b7280;
  font-size: 0.875rem;
}

.error-footer a {
  color: #667eea;
  text-decoration: none;
}

.error-footer a:hover {
  text-decoration: underline;
}

.background-decoration {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 0;
}

.bg-circle {
  position: absolute;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
  animation: drift 10s linear infinite;
}

.circle-1 {
  width: 100px;
  height: 100px;
  top: 20%;
  left: 10%;
  animation-delay: 0s;
}

.circle-2 {
  width: 150px;
  height: 150px;
  top: 60%;
  right: 10%;
  animation-delay: 2s;
}

.circle-3 {
  width: 80px;
  height: 80px;
  bottom: 20%;
  left: 60%;
  animation-delay: 4s;
}

.bg-shape {
  position: absolute;
  background: rgba(255, 255, 255, 0.05);
  animation: rotate 15s linear infinite;
}

.shape-1 {
  width: 200px;
  height: 200px;
  top: 10%;
  right: 20%;
  clip-path: polygon(50% 0%, 0% 100%, 100% 100%);
}

.shape-2 {
  width: 150px;
  height: 150px;
  bottom: 30%;
  left: 10%;
  clip-path: polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%);
}

@keyframes bounce {
  0%, 20%, 50%, 80%, 100% {
    transform: translateY(0);
  }
  40% {
    transform: translateY(-20px);
  }
  60% {
    transform: translateY(-10px);
  }
}

@keyframes float {
  0%, 100% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-20px);
  }
}

@keyframes wobble {
  0%, 100% {
    transform: translate(-50%, -50%) rotate(0deg);
  }
  25% {
    transform: translate(-50%, -50%) rotate(-5deg);
  }
  75% {
    transform: translate(-50%, -50%) rotate(5deg);
  }
}

@keyframes drift {
  0% {
    transform: translateX(-10px);
  }
  50% {
    transform: translateX(10px);
  }
  100% {
    transform: translateX(-10px);
  }
}

@keyframes rotate {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

@media (max-width: 768px) {
  .not-found-content {
    padding: 2rem;
  }
  
  .error-number span {
    font-size: 4rem;
  }
  
  .error-message h1 {
    font-size: 2rem;
  }
  
  .nav-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .action-buttons {
    flex-direction: column;
    align-items: center;
  }
  
  .btn {
    width: 100%;
    max-width: 300px;
    justify-content: center;
  }
}

@media (max-width: 480px) {
  .not-found-content {
    padding: 1.5rem;
  }
  
  .nav-grid {
    grid-template-columns: 1fr;
  }
}
</style>
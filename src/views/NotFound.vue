<template>
  <div class="min-h-screen flex items-center justify-center p-8 relative bg-gray-100 overflow-hidden">
    <div class="max-w-3xl w-full bg-white rounded-3xl p-12 shadow-2xl text-center relative z-10">
      <!-- 404 動畫區域 -->
      <div class="mb-8">
        <div class="flex justify-center items-center gap-4 mb-8">
          <span class="text-8xl font-bold animate-bounce text-gray-900">4</span>
          <span class="text-8xl font-bold animate-bounce animation-delay-200 scale-110 text-gray-700">0</span>
          <span class="text-8xl font-bold animate-bounce text-gray-900">4</span>
        </div>
        <div class="relative h-40 my-8">
          <div class="absolute w-full h-full">
            <div class="element absolute top-[20%] left-[20%] text-2xl animate-float">💫</div>
            <div class="element absolute top-[10%] right-[25%] text-2xl animate-float animation-delay-500">⭐</div>
            <div class="element absolute bottom-[30%] left-[15%] text-2xl animate-float animation-delay-1000">🌟</div>
            <div class="element absolute bottom-[20%] right-[20%] text-2xl animate-float animation-delay-1500">✨</div>
          </div>
          <div class="lost-character absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-wobble">
            <div class="text-6xl mb-2">😵‍💫</div>
            <div class="w-12 h-16 bg-gradient-to-br from-gray-700 to-gray-900 rounded-3xl mx-auto"></div>
          </div>
        </div>
      </div>

      <!-- 錯誤訊息 -->
      <div class="mb-8">
        <h1 class="text-4xl font-bold text-gray-900 mb-2">找不到頁面</h1>
        <h2 class="text-2xl text-gray-700 mb-4 font-medium">看起來你走錯路了！</h2>
        <p class="text-gray-600 leading-relaxed mb-8">
          很抱歉，您要尋找的頁面不存在。<br>
          可能是網址輸入錯誤，或是頁面已經被移動或刪除了。
        </p>
      </div>

      <!-- 建議操作 -->
      <div class="text-left my-8 p-6 bg-gray-50 rounded-2xl">
        <h3 class="text-gray-900 mb-4 text-center">🤔 您可以嘗試：</h3>
        <ul class="list-none p-0 m-0">
          <li class="flex items-center gap-3 py-2 text-gray-700">
            <span class="text-xl">🔍</span>
            檢查網址是否正確
          </li>
          <li class="flex items-center gap-3 py-2 text-gray-700">
            <span class="text-xl">🏠</span>
            回到首頁重新開始
          </li>
          <li class="flex items-center gap-3 py-2 text-gray-700">
            <span class="text-xl">⬅️</span>
            使用瀏覽器的上一頁功能
          </li>
          <li class="flex items-center gap-3 py-2 text-gray-700">
            <span class="text-xl">📧</span>
            聯繫我們的技術支援
          </li>
        </ul>
      </div>

      <!-- 快速導航 -->
      <div class="my-8">
        <h3 class="text-gray-900 mb-6">🚀 快速導航</h3>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <router-link to="/" class="flex flex-col items-center gap-2 p-6 bg-white border-2 border-gray-200 rounded-2xl no-underline transition-all duration-200 hover:border-gray-900 hover:-translate-y-0.5 hover:shadow-lg">
            <div class="text-3xl">🏠</div>
            <div class="text-center">
              <strong class="block text-gray-900 text-sm mb-1">首頁</strong>
              <small class="text-gray-600 text-xs">回到主頁面</small>
            </div>
          </router-link>

          <router-link to="/users" class="flex flex-col items-center gap-2 p-6 bg-white border-2 border-gray-200 rounded-2xl no-underline transition-all duration-200 hover:border-gray-900 hover:-translate-y-0.5 hover:shadow-lg">
            <div class="text-3xl">👥</div>
            <div class="text-center">
              <strong class="block text-gray-900 text-sm mb-1">用戶管理</strong>
              <small class="text-gray-600 text-xs">查看所有用戶</small>
            </div>
          </router-link>

          <router-link to="/posts" class="flex flex-col items-center gap-2 p-6 bg-white border-2 border-gray-200 rounded-2xl no-underline transition-all duration-200 hover:border-gray-900 hover:-translate-y-0.5 hover:shadow-lg">
            <div class="text-3xl">📝</div>
            <div class="text-center">
              <strong class="block text-gray-900 text-sm mb-1">文章列表</strong>
              <small class="text-gray-600 text-xs">瀏覽所有文章</small>
            </div>
          </router-link>

          <router-link to="/dashboard" class="flex flex-col items-center gap-2 p-6 bg-white border-2 border-gray-200 rounded-2xl no-underline transition-all duration-200 hover:border-gray-900 hover:-translate-y-0.5 hover:shadow-lg">
            <div class="text-3xl">📊</div>
            <div class="text-center">
              <strong class="block text-gray-900 text-sm mb-1">儀表板</strong>
              <small class="text-gray-600 text-xs">查看統計資料</small>
            </div>
          </router-link>
        </div>
      </div>

      <!-- 操作按鈕 -->
      <div class="flex justify-center gap-4 my-8 flex-wrap">
        <button @click="goBack" class="px-6 py-3 rounded-lg font-medium no-underline cursor-pointer transition-all duration-200 border-0 inline-flex items-center gap-2 bg-gray-600 text-white hover:bg-gray-700">
          ⬅️ 返回上頁
        </button>
        <router-link to="/" class="px-6 py-3 rounded-lg font-medium no-underline cursor-pointer transition-all duration-200 border-0 inline-flex items-center gap-2 bg-gray-900 text-white hover:bg-gray-800 hover:-translate-y-0.5">
          🏠 回到首頁
        </router-link>
        <button @click="refreshPage" class="px-6 py-3 rounded-lg font-medium no-underline cursor-pointer transition-all duration-200 inline-flex items-center gap-2 bg-transparent text-gray-900 border-2 border-gray-900 hover:bg-gray-900 hover:text-white">
          🔄 重新整理
        </button>
      </div>

      <!-- 搜尋功能 -->
      <div class="my-8">
        <h3 class="text-gray-900 mb-4">🔍 或者搜尋您要的內容</h3>
        <div class="flex max-w-md mx-auto border-2 border-gray-200 rounded-lg overflow-hidden">
          <input
            v-model="searchQuery"
            type="text"
            placeholder="輸入關鍵字搜尋..."
            @keyup.enter="performSearch"
            class="flex-1 px-3 py-3 border-0 outline-none text-base"
          />
          <button @click="performSearch" class="bg-gray-900 text-white border-0 px-6 py-3 cursor-pointer transition-colors duration-200 hover:bg-gray-800">
            搜尋
          </button>
        </div>
      </div>

      <!-- 頁腳資訊 -->
      <div class="mt-8 pt-8 border-t border-gray-200 text-gray-600 text-sm">
        <p>錯誤代碼: 404 | 時間: {{ currentTime }}</p>
        <p>
          如果問題持續存在，請聯繫
          <a href="mailto:support@example.com" class="text-gray-900 no-underline hover:underline">技術支援</a>
        </p>
      </div>
    </div>

    <!-- 背景裝飾 -->
    <div class="absolute top-0 left-0 w-full h-full pointer-events-none z-0">
      <div class="bg-circle absolute rounded-full bg-white/10 animate-drift w-[100px] h-[100px] top-[20%] left-[10%]"></div>
      <div class="bg-circle absolute rounded-full bg-white/10 animate-drift animation-delay-2000 w-[150px] h-[150px] top-[60%] right-[10%]"></div>
      <div class="bg-circle absolute rounded-full bg-white/10 animate-drift animation-delay-4000 w-[80px] h-[80px] bottom-[20%] left-[60%]"></div>
      <div class="bg-shape absolute bg-white/5 animate-rotate w-[200px] h-[200px] top-[10%] right-[20%]" style="clip-path: polygon(50% 0%, 0% 100%, 100% 100%);"></div>
      <div class="bg-shape absolute bg-white/5 animate-rotate w-[150px] h-[150px] bottom-[30%] left-[10%]" style="clip-path: polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%);"></div>
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

<style>
/* 保留動畫 keyframes */
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

/* 動畫 class */
.animate-float {
  animation: float 3s ease-in-out infinite;
}

.animate-wobble {
  animation: wobble 2s ease-in-out infinite;
}

.animate-drift {
  animation: drift 10s linear infinite;
}

.animate-rotate {
  animation: rotate 15s linear infinite;
}

/* 動畫延遲 */
.animation-delay-200 {
  animation-delay: 0.2s;
}

.animation-delay-500 {
  animation-delay: 0.5s;
}

.animation-delay-1000 {
  animation-delay: 1s;
}

.animation-delay-1500 {
  animation-delay: 1.5s;
}

.animation-delay-2000 {
  animation-delay: 2s;
}

.animation-delay-4000 {
  animation-delay: 4s;
}
</style>
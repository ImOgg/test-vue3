<template>
  <div class="settings-container">
    <!-- 標題 -->
    <div class="header">
      <h1>⚙️ 系統設定</h1>
      <p>管理應用程式的各項設定</p>
    </div>

    <!-- 設定卡片 -->
    <div class="settings-grid">
      <!-- 主題設定 -->
      <div class="setting-card">
        <div class="setting-header">
          <h3>🎨 外觀主題</h3>
          <p>自訂應用程式的視覺外觀</p>
        </div>
        
        <div class="setting-content">
          <div class="theme-options">
            <label v-for="theme in themes" :key="theme.id" class="theme-option">
              <input 
                type="radio" 
                :value="theme.id" 
                v-model="settings.theme"
                @change="updateSetting('theme', theme.id)"
              />
              <div class="theme-preview" :class="theme.class">
                <div class="theme-name">{{ theme.name }}</div>
                <div class="theme-colors">
                  <span 
                    v-for="color in theme.colors" 
                    :key="color" 
                    class="color-dot" 
                    :style="{ backgroundColor: color }"
                  ></span>
                </div>
              </div>
            </label>
          </div>
        </div>
      </div>

      <!-- 語言設定 -->
      <div class="setting-card">
        <div class="setting-header">
          <h3>🌐 語言設定</h3>
          <p>選擇您偏好的介面語言</p>
        </div>
        
        <div class="setting-content">
          <select 
            v-model="settings.language" 
            @change="updateSetting('language', settings.language)"
            class="language-select"
          >
            <option value="zh-TW">繁體中文</option>
            <option value="zh-CN">简体中文</option>
            <option value="en-US">English</option>
            <option value="ja-JP">日本語</option>
          </select>
        </div>
      </div>

      <!-- 通知設定 -->
      <div class="setting-card">
        <div class="setting-header">
          <h3>🔔 通知設定</h3>
          <p>管理系統通知與提醒</p>
        </div>
        
        <div class="setting-content">
          <div class="notification-settings">
            <label class="switch-label">
              <input 
                type="checkbox" 
                v-model="settings.notifications.email"
                @change="updateNotification('email', settings.notifications.email)"
              />
              <span class="switch"></span>
              <span class="label-text">電子郵件通知</span>
            </label>
            
            <label class="switch-label">
              <input 
                type="checkbox" 
                v-model="settings.notifications.desktop"
                @change="updateNotification('desktop', settings.notifications.desktop)"
              />
              <span class="switch"></span>
              <span class="label-text">桌面通知</span>
            </label>
            
            <label class="switch-label">
              <input 
                type="checkbox" 
                v-model="settings.notifications.sound"
                @change="updateNotification('sound', settings.notifications.sound)"
              />
              <span class="switch"></span>
              <span class="label-text">聲音提醒</span>
            </label>
          </div>
        </div>
      </div>

      <!-- 資料設定 -->
      <div class="setting-card">
        <div class="setting-header">
          <h3>💾 資料管理</h3>
          <p>控制資料儲存與同步</p>
        </div>
        
        <div class="setting-content">
          <div class="data-settings">
            <div class="setting-item">
              <label>每頁顯示筆數</label>
              <select 
                v-model="settings.pagination.pageSize"
                @change="updateSetting('pagination', settings.pagination)"
              >
                <option :value="10">10 筆</option>
                <option :value="20">20 筆</option>
                <option :value="50">50 筆</option>
                <option :value="100">100 筆</option>
              </select>
            </div>
            
            <div class="setting-item">
              <label>自動儲存間隔</label>
              <select 
                v-model="settings.autoSave.interval"
                @change="updateSetting('autoSave', settings.autoSave)"
              >
                <option :value="30">30 秒</option>
                <option :value="60">1 分鐘</option>
                <option :value="300">5 分鐘</option>
                <option :value="0">關閉</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <!-- 安全設定 -->
      <div class="setting-card">
        <div class="setting-header">
          <h3>🔒 安全設定</h3>
          <p>管理帳戶安全與隱私</p>
        </div>
        
        <div class="setting-content">
          <div class="security-settings">
            <label class="switch-label">
              <input 
                type="checkbox" 
                v-model="settings.security.twoFactor"
                @change="updateSecurity('twoFactor', settings.security.twoFactor)"
              />
              <span class="switch"></span>
              <span class="label-text">雙重驗證</span>
            </label>
            
            <label class="switch-label">
              <input 
                type="checkbox" 
                v-model="settings.security.sessionTimeout"
                @change="updateSecurity('sessionTimeout', settings.security.sessionTimeout)"
              />
              <span class="switch"></span>
              <span class="label-text">自動登出</span>
            </label>
            
            <div class="setting-item">
              <label>密碼有效期限</label>
              <select 
                v-model="settings.security.passwordExpiry"
                @change="updateSecurity('passwordExpiry', settings.security.passwordExpiry)"
              >
                <option :value="30">30 天</option>
                <option :value="90">90 天</option>
                <option :value="180">180 天</option>
                <option :value="0">永不過期</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <!-- 系統資訊 -->
      <div class="setting-card">
        <div class="setting-header">
          <h3>📊 系統資訊</h3>
          <p>檢視應用程式資訊與狀態</p>
        </div>
        
        <div class="setting-content">
          <div class="system-info">
            <div class="info-item">
              <span class="info-label">版本</span>
              <span class="info-value">{{ systemInfo.version }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">最後更新</span>
              <span class="info-value">{{ systemInfo.lastUpdate }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">資料庫大小</span>
              <span class="info-value">{{ systemInfo.dbSize }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">線上用戶</span>
              <span class="info-value">{{ systemInfo.onlineUsers }}</span>
            </div>
          </div>
          
          <div class="system-actions">
            <button @click="exportData" class="btn btn-outline">
              📥 匯出資料
            </button>
            <button @click="clearCache" class="btn btn-secondary">
              🧹 清除快取
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 儲存提示 -->
    <div v-if="message" :class="['message', messageType]">
      {{ message }}
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'

// 響應式資料
const settings = reactive({
  theme: 'light',
  language: 'zh-TW',
  notifications: {
    email: true,
    desktop: false,
    sound: true
  },
  pagination: {
    pageSize: 20
  },
  autoSave: {
    interval: 60
  },
  security: {
    twoFactor: false,
    sessionTimeout: true,
    passwordExpiry: 90
  }
})

const message = ref('')
const messageType = ref('success')

const themes = [
  {
    id: 'light',
    name: '淺色主題',
    class: 'theme-light',
    colors: ['#ffffff', '#f8fafc', '#667eea']
  },
  {
    id: 'dark',
    name: '深色主題',
    class: 'theme-dark',
    colors: ['#1f2937', '#374151', '#667eea']
  },
  {
    id: 'blue',
    name: '藍色主題',
    class: 'theme-blue',
    colors: ['#dbeafe', '#3b82f6', '#1e40af']
  }
]

const systemInfo = reactive({
  version: '1.0.0',
  lastUpdate: '2024-01-15',
  dbSize: '2.3 MB',
  onlineUsers: 5
})

// 方法
const updateSetting = (key, value) => {
  // 模擬保存到後端
  console.log(`更新設定: ${key} = `, value)
  showMessage('設定已儲存', 'success')
  
  // 實際應用中會呼叫 API
  saveToLocalStorage()
}

const updateNotification = (type, enabled) => {
  console.log(`通知設定: ${type} = ${enabled}`)
  showMessage(`${enabled ? '啟用' : '停用'}通知`, 'success')
  saveToLocalStorage()
}

const updateSecurity = (type, enabled) => {
  console.log(`安全設定: ${type} = ${enabled}`)
  showMessage('安全設定已更新', 'success')
  saveToLocalStorage()
}

const exportData = () => {
  // 模擬資料匯出
  const data = {
    settings: settings,
    timestamp: new Date().toISOString()
  }
  
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = 'app-settings.json'
  link.click()
  URL.revokeObjectURL(url)
  
  showMessage('資料匯出完成', 'success')
}

const clearCache = () => {
  // 清除瀏覽器快取
  if (confirm('確定要清除所有快取資料嗎？')) {
    localStorage.removeItem('app-cache')
    sessionStorage.clear()
    showMessage('快取已清除', 'success')
  }
}

const saveToLocalStorage = () => {
  localStorage.setItem('app-settings', JSON.stringify(settings))
}

const loadFromLocalStorage = () => {
  const saved = localStorage.getItem('app-settings')
  if (saved) {
    try {
      const parsed = JSON.parse(saved)
      Object.assign(settings, parsed)
    } catch (error) {
      console.error('載入設定失敗:', error)
    }
  }
}

const showMessage = (text, type = 'success') => {
  message.value = text
  messageType.value = type
  setTimeout(() => {
    message.value = ''
  }, 3000)
}

// 生命週期
onMounted(() => {
  loadFromLocalStorage()
})
</script>

<style scoped>
.settings-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

.header {
  text-align: center;
  margin-bottom: 3rem;
}

.header h1 {
  margin: 0 0 0.5rem;
  color: #1f2937;
  font-size: 2rem;
}

.header p {
  margin: 0;
  color: #6b7280;
  font-size: 1.1rem;
}

.settings-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 2rem;
}

.setting-card {
  background: white;
  border-radius: 0.75rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  transition: transform 0.2s, box-shadow 0.2s;
}

.setting-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.setting-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 1.5rem;
}

.setting-header h3 {
  margin: 0 0 0.5rem;
  font-size: 1.2rem;
}

.setting-header p {
  margin: 0;
  opacity: 0.9;
  font-size: 0.9rem;
}

.setting-content {
  padding: 1.5rem;
}

.theme-options {
  display: grid;
  gap: 1rem;
}

.theme-option {
  display: block;
  cursor: pointer;
}

.theme-option input {
  display: none;
}

.theme-preview {
  border: 2px solid #e5e7eb;
  border-radius: 0.5rem;
  padding: 1rem;
  transition: all 0.2s;
}

.theme-option input:checked + .theme-preview {
  border-color: #667eea;
  background: #f0f4ff;
}

.theme-name {
  font-weight: 500;
  margin-bottom: 0.5rem;
}

.theme-colors {
  display: flex;
  gap: 0.25rem;
}

.color-dot {
  width: 1rem;
  height: 1rem;
  border-radius: 50%;
  border: 1px solid #d1d5db;
}

.language-select {
  width: 100%;
  padding: 0.75rem;
  border: 2px solid #e5e7eb;
  border-radius: 0.5rem;
  font-size: 1rem;
}

.language-select:focus {
  outline: none;
  border-color: #667eea;
}

.notification-settings,
.security-settings {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.switch-label {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 0.375rem;
  transition: background-color 0.2s;
}

.switch-label:hover {
  background: #f9fafb;
}

.switch-label input {
  display: none;
}

.switch {
  position: relative;
  width: 3rem;
  height: 1.5rem;
  background: #d1d5db;
  border-radius: 0.75rem;
  transition: background-color 0.2s;
}

.switch::after {
  content: '';
  position: absolute;
  top: 0.125rem;
  left: 0.125rem;
  width: 1.25rem;
  height: 1.25rem;
  background: white;
  border-radius: 50%;
  transition: transform 0.2s;
}

.switch-label input:checked + .switch {
  background: #667eea;
}

.switch-label input:checked + .switch::after {
  transform: translateX(1.5rem);
}

.label-text {
  font-weight: 500;
  color: #374151;
}

.data-settings {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.setting-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.setting-item label {
  font-weight: 500;
  color: #374151;
}

.setting-item select {
  padding: 0.5rem;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  min-width: 120px;
}

.system-info {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-bottom: 1.5rem;
}

.info-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 0;
  border-bottom: 1px solid #f3f4f6;
}

.info-item:last-child {
  border-bottom: none;
}

.info-label {
  color: #6b7280;
  font-weight: 500;
}

.info-value {
  color: #1f2937;
  font-weight: 600;
}

.system-actions {
  display: flex;
  gap: 1rem;
}

.btn {
  padding: 0.5rem 1rem;
  border-radius: 0.375rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
}

.btn-outline {
  background: transparent;
  color: #667eea;
  border: 1px solid #667eea;
}

.btn-outline:hover {
  background: #667eea;
  color: white;
}

.btn-secondary {
  background: #6b7280;
  color: white;
}

.btn-secondary:hover {
  background: #4b5563;
}

.message {
  position: fixed;
  bottom: 2rem;
  right: 2rem;
  padding: 1rem 1.5rem;
  border-radius: 0.5rem;
  color: white;
  font-weight: 500;
  z-index: 1000;
  animation: slideIn 0.3s ease-out;
}

.message.success {
  background: #10b981;
}

.message.error {
  background: #ef4444;
}

.message.info {
  background: #3b82f6;
}

@keyframes slideIn {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

@media (max-width: 768px) {
  .settings-grid {
    grid-template-columns: 1fr;
  }
  
  .system-actions {
    flex-direction: column;
  }
  
  .setting-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }
}
</style>
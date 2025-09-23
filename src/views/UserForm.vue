<template>
  <div class="user-form-container">
    <!-- 標題 -->
    <div class="header">
      <div class="breadcrumb">
        <router-link to="/">首頁</router-link>
        <span>/</span>
        <router-link to="/users">用戶管理</router-link>
        <span>/</span>
        <span>{{ isEditing ? '編輯用戶' : '新增用戶' }}</span>
      </div>
    </div>

    <!-- 表單卡片 -->
    <div class="form-card">
      <div class="form-header">
        <h1>{{ isEditing ? '✏️ 編輯用戶' : '➕ 新增用戶' }}</h1>
        <p>{{ isEditing ? '修改用戶資訊' : '填寫用戶基本資料' }}</p>
      </div>

      <form @submit.prevent="handleSubmit" class="user-form">
        <!-- 基本資訊 -->
        <div class="form-section">
          <h3>📋 基本資訊</h3>
          
          <div class="form-group">
            <label for="name">姓名 *</label>
            <input
              id="name"
              v-model="formData.name"
              type="text"
              :class="{ error: errors.name }"
              placeholder="請輸入姓名"
              required
            />
            <span v-if="errors.name" class="error-message">{{ errors.name }}</span>
          </div>

          <div class="form-group">
            <label for="email">電子信箱 *</label>
            <input
              id="email"
              v-model="formData.email"
              type="email"
              :class="{ error: errors.email }"
              placeholder="請輸入電子信箱"
              required
            />
            <span v-if="errors.email" class="error-message">{{ errors.email }}</span>
          </div>

          <div class="form-group">
            <label for="phone">電話號碼</label>
            <input
              id="phone"
              v-model="formData.phone"
              type="tel"
              :class="{ error: errors.phone }"
              placeholder="請輸入電話號碼"
            />
            <span v-if="errors.phone" class="error-message">{{ errors.phone }}</span>
          </div>

          <div class="form-group">
            <label for="age">年齡 *</label>
            <input
              id="age"
              v-model.number="formData.age"
              type="number"
              min="1"
              max="150"
              :class="{ error: errors.age }"
              placeholder="請輸入年齡"
              required
            />
            <span v-if="errors.age" class="error-message">{{ errors.age }}</span>
          </div>

          <div class="form-group">
            <label for="city">所在城市 *</label>
            <input
              id="city"
              v-model="formData.city"
              type="text"
              :class="{ error: errors.city }"
              placeholder="請輸入所在城市"
              required
            />
            <span v-if="errors.city" class="error-message">{{ errors.city }}</span>
          </div>
        </div>

        <!-- 狀態設定 -->
        <div class="form-section">
          <h3>⚙️ 狀態設定</h3>
          
          <div class="form-group">
            <label class="checkbox-label">
              <input v-model="formData.isActive" type="checkbox" />
              <span class="checkmark"></span>
              啟用此用戶
            </label>
            <p class="form-hint">停用的用戶將無法登入系統</p>
          </div>
        </div>

        <!-- 預覽區域 -->
        <div class="form-section">
          <h3>👁️ 資料預覽</h3>
          <div class="preview-card">
            <div class="user-avatar-preview">
              {{ getInitials(formData.name) }}
            </div>
            <div class="user-info-preview">
              <h4>{{ formData.name || '用戶姓名' }}</h4>
              <p>{{ formData.email || 'email@example.com' }}</p>
              <span class="age-badge">{{ formData.age || 0 }} 歲</span>
              <span :class="['status-badge', formData.isActive ? 'active' : 'inactive']">
                {{ formData.isActive ? '啟用' : '停用' }}
              </span>
            </div>
          </div>
        </div>

        <!-- 操作按鈕 -->
        <div class="form-actions">
          <button 
            type="button" 
            @click="goBack" 
            class="btn btn-outline"
          >
            取消
          </button>
          <button 
            type="button" 
            @click="resetForm" 
            class="btn btn-secondary"
            :disabled="submitting"
          >
            重置
          </button>
          <button 
            type="submit" 
            class="btn btn-primary"
            :disabled="submitting || !isFormValid"
          >
            {{ submitting ? '處理中...' : (isEditing ? '更新用戶' : '建立用戶') }}
          </button>
        </div>
      </form>
    </div>

    <!-- 操作結果提示 -->
    <div v-if="message" :class="['message', messageType]">
      {{ message }}
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { useUserForm } from '@/composables/useUserForm'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()
const { formData, errors, validate, submitCreate, submitUpdate, reset } = useUserForm()

// 響應式資料
const submitting = ref(false)
const message = ref('')
const messageType = ref('success')

const userId = computed(() => route.params.id ? parseInt(route.params.id) : null)
const isEditing = computed(() => !!userId.value)
const currentUser = computed(() => 
  isEditing.value ? userStore.users.find(u => u.id === userId.value) : null
)

const isFormValid = computed(() => {
  return formData.value.name && 
         formData.value.email && 
         formData.value.age > 0 && 
         formData.value.age <= 150
})

// 方法
const getInitials = (name) => {
  if (!name) return '?'
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
}

const loadUserData = async () => {
  if (!isEditing.value) return
  
  try {
    await userStore.fetchUsers()
    if (currentUser.value) {
      Object.assign(formData.value, {
        name: currentUser.value.name,
        email: currentUser.value.email,
        phone: currentUser.value.phone,
        age: currentUser.value.age,
        city: currentUser.value.city,
        isActive: currentUser.value.isActive
      })
    } else {
      showMessage('用戶不存在', 'error')
      setTimeout(() => router.push('/users'), 1500)
    }
  } catch (error) {
    showMessage('載入用戶資料失敗', 'error')
    console.error('載入用戶失敗:', error)
  }
}

const handleSubmit = async () => {
  if (!validate()) {
    showMessage('請檢查表單資料', 'error')
    return
  }

  submitting.value = true
  try {
    if (isEditing.value) {
      await submitUpdate(userId.value)
      showMessage('用戶更新成功！', 'success')
    } else {
      await submitCreate()
      showMessage('用戶建立成功！', 'success')
    }
    
    setTimeout(() => {
      router.push('/users')
    }, 1500)
  } catch (error) {
    showMessage(isEditing.value ? '更新失敗' : '建立失敗', 'error')
    console.error('提交失敗:', error)
  } finally {
    submitting.value = false
  }
}

const resetForm = () => {
  if (isEditing.value) {
    loadUserData()
  } else {
    reset()
  }
  showMessage('表單已重置', 'info')
}

const goBack = () => {
  router.push('/users')
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
  if (isEditing.value) {
    loadUserData()
  }
})
</script>

<style scoped>
.user-form-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
}

.header {
  margin-bottom: 2rem;
}

.breadcrumb {
  color: #6b7280;
}

.breadcrumb a {
  color: #667eea;
  text-decoration: none;
}

.breadcrumb a:hover {
  text-decoration: underline;
}

.breadcrumb span {
  margin: 0 0.5rem;
}

.form-card {
  background: white;
  border-radius: 0.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.form-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 2rem;
  text-align: center;
}

.form-header h1 {
  margin: 0 0 0.5rem;
  font-size: 1.8rem;
}

.form-header p {
  margin: 0;
  opacity: 0.9;
}

.user-form {
  padding: 2rem;
}

.form-section {
  margin-bottom: 2rem;
  padding-bottom: 2rem;
  border-bottom: 1px solid #e5e7eb;
}

.form-section:last-of-type {
  border-bottom: none;
}

.form-section h3 {
  margin: 0 0 1.5rem;
  color: #1f2937;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: #374151;
}

.form-group input {
  width: 100%;
  padding: 0.75rem;
  border: 2px solid #e5e7eb;
  border-radius: 0.5rem;
  font-size: 1rem;
  transition: border-color 0.2s;
}

.form-group input:focus {
  outline: none;
  border-color: #667eea;
}

.form-group input.error {
  border-color: #ef4444;
}

.error-message {
  color: #ef4444;
  font-size: 0.875rem;
  margin-top: 0.25rem;
  display: block;
}

.form-hint {
  color: #6b7280;
  font-size: 0.875rem;
  margin-top: 0.25rem;
  display: block;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 0.375rem;
  transition: background-color 0.2s;
}

.checkbox-label:hover {
  background: #f9fafb;
}

.checkbox-label input {
  width: auto;
  margin: 0;
}

.checkmark {
  position: relative;
}

.preview-card {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  padding: 1.5rem;
  background: #f9fafb;
  border-radius: 0.5rem;
  border: 1px solid #e5e7eb;
}

.user-avatar-preview {
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
}

.user-info-preview h4 {
  margin: 0 0 0.25rem;
  color: #1f2937;
}

.user-info-preview p {
  margin: 0 0 0.5rem;
  color: #6b7280;
  font-size: 0.875rem;
}

.age-badge {
  background: #ddd6fe;
  color: #5b21b6;
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
  font-size: 0.75rem;
  margin-right: 0.5rem;
}

.status-badge {
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
  font-size: 0.75rem;
  font-weight: 500;
}

.status-badge.active {
  background: #d1fae5;
  color: #065f46;
}

.status-badge.inactive {
  background: #fee2e2;
  color: #991b1b;
}

.form-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  margin-top: 2rem;
  padding-top: 2rem;
  border-top: 1px solid #e5e7eb;
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
  transform: translateY(-1px);
}

.btn-secondary {
  background: #6b7280;
  color: white;
}

.btn-secondary:hover:not(:disabled) {
  background: #4b5563;
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
  transform: none;
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
</style>
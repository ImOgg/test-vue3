<template>
  <div class="user-manager">
    <h2>用戶管理 (Zod 驗證示範)</h2>
    
    <!-- 錯誤訊息 -->
    <div v-if="error" class="error-message">
      ❌ {{ error }}
    </div>
    
    <!-- 成功訊息 -->
    <div v-if="success" class="success-message">
      ✅ {{ success }}
    </div>

    <!-- 新增用戶表單 -->
    <div class="form-section">
      <h3>新增用戶</h3>
      <form @submit.prevent="createUser" class="user-form">
        <div class="form-group">
          <label>姓名：</label>
          <input 
            v-model="newUser.name" 
            type="text" 
            placeholder="請輸入姓名"
            :class="{ 'error': validationErrors.name }"
          />
          <span v-if="validationErrors.name" class="field-error">{{ validationErrors.name }}</span>
        </div>
        
        <div class="form-group">
          <label>年齡：</label>
          <input 
            v-model.number="newUser.age" 
            type="number" 
            placeholder="請輸入年齡"
            :class="{ 'error': validationErrors.age }"
          />
          <span v-if="validationErrors.age" class="field-error">{{ validationErrors.age }}</span>
        </div>
        
        <div class="form-group">
          <label>城市：</label>
          <input 
            v-model="newUser.city" 
            type="text" 
            placeholder="請輸入城市"
            :class="{ 'error': validationErrors.city }"
          />
          <span v-if="validationErrors.city" class="field-error">{{ validationErrors.city }}</span>
        </div>
        
        <button type="submit" :disabled="loading">
          {{ loading ? '處理中...' : '新增用戶' }}
        </button>
      </form>
    </div>

    <!-- 用戶列表 -->
    <div class="users-section">
      <h3>用戶列表</h3>
      <button @click="fetchUsers" :disabled="loading" class="refresh-btn">
        {{ loading ? '載入中...' : '重新載入' }}
      </button>
      
      <div v-if="users.length === 0" class="no-data">
        沒有用戶資料
      </div>
      
      <div v-else class="users-grid">
        <div v-for="user in users" :key="user.id" class="user-card">
          <div class="user-info">
            <h4>{{ user.name }}</h4>
            <p>年齡: {{ user.age }}</p>
            <p>城市: {{ user.city }}</p>
          </div>
          <div class="user-actions">
            <button @click="editUser(user)" class="edit-btn">編輯</button>
            <button @click="deleteUser(user.id)" class="delete-btn">刪除</button>
          </div>
        </div>
      </div>
    </div>

    <!-- 編輯用戶表單 -->
    <div v-if="editingUser" class="form-section">
      <h3>編輯用戶</h3>
      <form @submit.prevent="updateUser" class="user-form">
        <div class="form-group">
          <label>姓名：</label>
          <input 
            v-model="editingUser.name" 
            type="text"
            :class="{ 'error': validationErrors.name }"
          />
          <span v-if="validationErrors.name" class="field-error">{{ validationErrors.name }}</span>
        </div>
        
        <div class="form-group">
          <label>年齡：</label>
          <input 
            v-model.number="editingUser.age" 
            type="number"
            :class="{ 'error': validationErrors.age }"
          />
          <span v-if="validationErrors.age" class="field-error">{{ validationErrors.age }}</span>
        </div>
        
        <div class="form-group">
          <label>城市：</label>
          <input 
            v-model="editingUser.city" 
            type="text"
            :class="{ 'error': validationErrors.city }"
          />
          <span v-if="validationErrors.city" class="field-error">{{ validationErrors.city }}</span>
        </div>
        
        <div class="form-actions">
          <button type="submit" :disabled="loading">更新</button>
          <button type="button" @click="cancelEdit">取消</button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { usersApi } from '../services/api.js'
import { CreateUserSchema, UpdateUserSchema } from '../schemas/index.js'

// Reactive data
const users = ref([])
const newUser = reactive({
  name: '',
  age: '',
  city: ''
})
const editingUser = ref(null)
const loading = ref(false)
const error = ref('')
const success = ref('')
const validationErrors = reactive({})

// 清除訊息
const clearMessages = () => {
  error.value = ''
  success.value = ''
  Object.keys(validationErrors).forEach(key => {
    delete validationErrors[key]
  })
}

// 驗證資料
const validateData = (data, schema) => {
  try {
    schema.parse(data)
    return true
  } catch (err) {
    if (err.name === 'ZodError') {
      err.errors.forEach(error => {
        validationErrors[error.path[0]] = error.message
      })
    }
    return false
  }
}

// 取得所有用戶
const fetchUsers = async () => {
  loading.value = true
  clearMessages()
  
  try {
    users.value = await usersApi.getAll()
    success.value = '用戶資料載入成功'
  } catch (err) {
    error.value = `載入用戶失敗: ${err.message}`
  } finally {
    loading.value = false
  }
}

// 新增用戶
const createUser = async () => {
  clearMessages()
  
  // 前端驗證
  if (!validateData(newUser, CreateUserSchema)) {
    return
  }
  
  loading.value = true
  
  try {
    const createdUser = await usersApi.create(newUser)
    users.value.push(createdUser)
    
    // 重置表單
    Object.assign(newUser, { name: '', age: '', city: '' })
    success.value = `用戶 "${createdUser.name}" 新增成功`
  } catch (err) {
    error.value = `新增用戶失敗: ${err.message}`
  } finally {
    loading.value = false
  }
}

// 編輯用戶
const editUser = (user) => {
  editingUser.value = { ...user }
  clearMessages()
}

// 更新用戶
const updateUser = async () => {
  clearMessages()
  
  const updateData = {
    name: editingUser.value.name,
    age: editingUser.value.age,
    city: editingUser.value.city
  }
  
  // 前端驗證
  if (!validateData(updateData, UpdateUserSchema)) {
    return
  }
  
  loading.value = true
  
  try {
    const updatedUser = await usersApi.update(editingUser.value.id, updateData)
    
    // 更新本地列表
    const index = users.value.findIndex(u => u.id === updatedUser.id)
    if (index !== -1) {
      users.value[index] = updatedUser
    }
    
    editingUser.value = null
    success.value = `用戶 "${updatedUser.name}" 更新成功`
  } catch (err) {
    error.value = `更新用戶失敗: ${err.message}`
  } finally {
    loading.value = false
  }
}

// 取消編輯
const cancelEdit = () => {
  editingUser.value = null
  clearMessages()
}

// 刪除用戶
const deleteUser = async (userId) => {
  if (!confirm('確定要刪除這個用戶嗎？')) {
    return
  }
  
  clearMessages()
  loading.value = true
  
  try {
    await usersApi.delete(userId)
    users.value = users.value.filter(u => u.id !== userId)
    success.value = '用戶刪除成功'
  } catch (err) {
    error.value = `刪除用戶失敗: ${err.message}`
  } finally {
    loading.value = false
  }
}

// 組件掛載時載入資料
onMounted(() => {
  fetchUsers()
})
</script>

<style scoped>
.user-manager {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

.error-message {
  background: #ffe6e6;
  color: #d63031;
  padding: 10px;
  border-radius: 5px;
  margin-bottom: 20px;
}

.success-message {
  background: #e6ffe6;
  color: #00b894;
  padding: 10px;
  border-radius: 5px;
  margin-bottom: 20px;
}

.form-section {
  background: #f8f9fa;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 30px;
}

.user-form {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.form-group label {
  font-weight: bold;
}

.form-group input {
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.form-group input.error {
  border-color: #d63031;
}

.field-error {
  color: #d63031;
  font-size: 0.9em;
}

.form-actions {
  display: flex;
  gap: 10px;
}

button {
  padding: 10px 20px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: bold;
}

button[type="submit"], .refresh-btn {
  background: #0984e3;
  color: white;
}

button[type="submit"]:hover, .refresh-btn:hover {
  background: #0770c4;
}

button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.edit-btn {
  background: #fdcb6e;
  color: #2d3436;
}

.delete-btn {
  background: #e17055;
  color: white;
}

.users-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 20px;
  margin-top: 20px;
}

.user-card {
  background: white;
  padding: 15px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.user-info h4 {
  margin: 0 0 10px 0;
  color: #2d3436;
}

.user-info p {
  margin: 5px 0;
  color: #636e72;
}

.user-actions {
  margin-top: 15px;
  display: flex;
  gap: 10px;
}

.user-actions button {
  flex: 1;
  padding: 8px;
  font-size: 0.9em;
}

.no-data {
  text-align: center;
  color: #636e72;
  padding: 40px;
}
</style>
<template>
  <div class="post-form-container">
    <!-- 標題 -->
    <div class="header">
      <div class="breadcrumb">
        <router-link to="/">首頁</router-link>
        <span>/</span>
        <router-link to="/posts">文章管理</router-link>
        <span>/</span>
        <span>{{ isEditing ? '編輯文章' : '發表文章' }}</span>
      </div>
    </div>

    <!-- 表單卡片 -->
    <div class="form-card">
      <div class="form-header">
        <h1>{{ isEditing ? '✏️ 編輯文章' : '📝 發表文章' }}</h1>
        <p>{{ isEditing ? '修改文章內容' : '分享您的想法與見解' }}</p>
      </div>

      <form @submit.prevent="handleSubmit" class="post-form">
        <!-- 基本資訊 -->
        <div class="form-section">
          <h3>📋 文章資訊</h3>
          
          <div class="form-group">
            <label for="title">文章標題 *</label>
            <input
              id="title"
              v-model="formData.title"
              type="text"
              :class="{ error: errors.title }"
              placeholder="請輸入吸引人的標題"
              required
            />
            <span v-if="errors.title" class="error-message">{{ errors.title }}</span>
            <p class="form-hint">標題長度建議 10-50 字</p>
          </div>

          <div class="form-group">
            <label for="author">作者 *</label>
            <select id="author" v-model="formData.userId" :class="{ error: errors.userId }" required>
              <option value="">請選擇作者</option>
              <option v-for="author in userStore.users" :key="author.id" :value="author.id">
                {{ author.name }}
              </option>
            </select>
            <span v-if="errors.userId" class="error-message">{{ errors.userId }}</span>
          </div>
        </div>

        <!-- 文章內容 -->
        <div class="form-section">
          <h3>📝 文章內容</h3>
          
          <div class="form-group">
            <label for="content">內容 *</label>
            <div class="content-editor">
              <div class="editor-toolbar">
                <button type="button" @click="insertText('**', '**')" class="toolbar-btn" title="粗體">
                  <strong>B</strong>
                </button>
                <button type="button" @click="insertText('*', '*')" class="toolbar-btn" title="斜體">
                  <em>I</em>
                </button>
                <button type="button" @click="insertText('\n### ', '')" class="toolbar-btn" title="標題">
                  H
                </button>
                <button type="button" @click="insertText('\n- ', '')" class="toolbar-btn" title="項目符號">
                  •
                </button>
              </div>
              <textarea
                id="content"
                ref="contentRef"
                v-model="formData.content"
                :class="{ error: errors.content }"
                placeholder="請輸入文章內容...\n\n支援 Markdown 語法：\n**粗體** *斜體*\n### 標題\n- 項目符號"
                rows="15"
                required
              ></textarea>
            </div>
            <span v-if="errors.content" class="error-message">{{ errors.content }}</span>
            <p class="form-hint">字數: {{ contentLength }} | 建議至少 100 字</p>
          </div>
        </div>

        <!-- 標籤與分類 -->
        <div class="form-section">
          <h3>🏷️ 標籤與分類</h3>
          
          <div class="form-group">
            <label for="tags">標籤</label>
            <input
              id="tags"
              v-model="tagsInput"
              type="text"
              placeholder="請輸入標籤，用逗號分隔"
            />
            <p class="form-hint">例如：技術,教學,Vue.js,前端</p>
            
            <div v-if="parsedTags.length" class="tags-preview">
              <span v-for="tag in parsedTags" :key="tag" class="tag-item">
                #{{ tag }}
              </span>
            </div>
          </div>
        </div>

        <!-- 預覽區域 -->
        <div class="form-section">
          <h3>👁️ 文章預覽</h3>
          <div class="preview-card">
            <div class="preview-header">
              <h4>{{ formData.title || '文章標題' }}</h4>
              <div class="preview-meta">
                <span class="author">作者: {{ getAuthorName() }}</span>
                <span class="date">{{ formatDate(new Date()) }}</span>
                <span class="length">{{ contentLength }} 字</span>
              </div>
            </div>
            <div class="preview-content">
              <p>{{ getContentPreview() }}</p>
            </div>
            <div v-if="parsedTags.length" class="preview-tags">
              <span v-for="tag in parsedTags" :key="tag" class="tag">
                #{{ tag }}
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
            @click="saveDraft" 
            class="btn btn-secondary"
            :disabled="submitting"
          >
            儲存草稿
          </button>
          <button 
            type="submit" 
            class="btn btn-primary"
            :disabled="submitting || !isFormValid"
          >
            {{ submitting ? '處理中...' : (isEditing ? '更新文章' : '發表文章') }}
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
import { usePostStore } from '@/stores/post'
import { useUserStore } from '@/stores/user'
import { usePostForm } from '@/composables/usePostForm'

const route = useRoute()
const router = useRouter()
const postStore = usePostStore()
const userStore = useUserStore()
const { formData, errors, validate, submitCreate, submitUpdate, reset } = usePostForm()

// 響應式資料
const submitting = ref(false)
const message = ref('')
const messageType = ref('success')
const tagsInput = ref('')
const contentRef = ref(null)

const postId = computed(() => route.params.id ? parseInt(route.params.id) : null)
const isEditing = computed(() => !!postId.value)
const currentPost = computed(() => 
  isEditing.value ? postStore.posts.find(p => p.id === postId.value) : null
)

const contentLength = computed(() => formData.value.content?.length || 0)
const parsedTags = computed(() => 
  tagsInput.value ? tagsInput.value.split(',').map(tag => tag.trim()).filter(Boolean) : []
)

const isFormValid = computed(() => {
  return formData.value.title?.length >= 5 && 
         formData.value.content?.length >= 10 && 
         formData.value.userId
})

// 方法
const getAuthorName = () => {
  if (!formData.value.userId) return '請選擇作者'
  const user = userStore.users.find(u => u.id === formData.value.userId)
  return user ? user.name : '未知作者'
}

const formatDate = (date) => {
  return date.toLocaleDateString('zh-TW', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

const getContentPreview = () => {
  const content = formData.value.content
  if (!content) return '文章內容預覽...'
  return content.length > 200 ? content.slice(0, 200) + '...' : content
}

const insertText = (before, after) => {
  const textarea = contentRef.value
  if (!textarea) return

  const start = textarea.selectionStart
  const end = textarea.selectionEnd
  const selectedText = formData.value.content.substring(start, end)
  
  const replacement = before + selectedText + after
  const newContent = 
    formData.value.content.substring(0, start) + 
    replacement + 
    formData.value.content.substring(end)
  
  formData.value.content = newContent
  
  // 設置游標位置
  textarea.focus()
  const newCursorPos = start + before.length + selectedText.length
  textarea.setSelectionRange(newCursorPos, newCursorPos)
}

const loadPostData = async () => {
  if (!isEditing.value) return
  
  try {
    await Promise.all([
      postStore.fetchPosts(),
      userStore.fetchUsers()
    ])
    
    if (currentPost.value) {
      Object.assign(formData.value, {
        title: currentPost.value.title,
        content: currentPost.value.content,
        userId: currentPost.value.userId
      })
      tagsInput.value = currentPost.value.tags ? currentPost.value.tags.join(', ') : ''
    } else {
      showMessage('文章不存在', 'error')
      setTimeout(() => router.push('/posts'), 1500)
    }
  } catch (error) {
    showMessage('載入文章資料失敗', 'error')
    console.error('載入文章失敗:', error)
  }
}

const handleSubmit = async () => {
  // 處理標籤
  formData.value.tags = parsedTags.value
  
  if (!validate()) {
    showMessage('請檢查表單資料', 'error')
    return
  }

  submitting.value = true
  try {
    if (isEditing.value) {
      await submitUpdate(postId.value)
      showMessage('文章更新成功！', 'success')
    } else {
      await submitCreate()
      showMessage('文章發表成功！', 'success')
    }
    
    setTimeout(() => {
      router.push('/posts')
    }, 1500)
  } catch (error) {
    showMessage(isEditing.value ? '更新失敗' : '發表失敗', 'error')
    console.error('提交失敗:', error)
  } finally {
    submitting.value = false
  }
}

const saveDraft = () => {
  // 儲存到 localStorage 作為草稿
  const draft = {
    title: formData.value.title,
    content: formData.value.content,
    userId: formData.value.userId,
    tags: tagsInput.value,
    timestamp: Date.now()
  }
  
  localStorage.setItem('post-draft', JSON.stringify(draft))
  showMessage('草稿已儲存', 'info')
}

const loadDraft = () => {
  const draft = localStorage.getItem('post-draft')
  if (draft && !isEditing.value) {
    try {
      const parsed = JSON.parse(draft)
      Object.assign(formData.value, {
        title: parsed.title || '',
        content: parsed.content || '',
        userId: parsed.userId || ''
      })
      tagsInput.value = parsed.tags || ''
      showMessage('已載入草稿', 'info')
    } catch (error) {
      console.error('載入草稿失敗:', error)
    }
  }
}

const goBack = () => {
  router.push('/posts')
}

const showMessage = (text, type = 'success') => {
  message.value = text
  messageType.value = type
  setTimeout(() => {
    message.value = ''
  }, 3000)
}

// 生命週期
onMounted(async () => {
  await userStore.fetchUsers()
  
  if (isEditing.value) {
    await loadPostData()
  } else {
    loadDraft()
  }
})
</script>

<style scoped>
.post-form-container {
  max-width: 900px;
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

.post-form {
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

.form-group input,
.form-group select {
  width: 100%;
  padding: 0.75rem;
  border: 2px solid #e5e7eb;
  border-radius: 0.5rem;
  font-size: 1rem;
  transition: border-color 0.2s;
}

.form-group input:focus,
.form-group select:focus {
  outline: none;
  border-color: #667eea;
}

.form-group input.error,
.form-group select.error {
  border-color: #ef4444;
}

.content-editor {
  border: 2px solid #e5e7eb;
  border-radius: 0.5rem;
  overflow: hidden;
  transition: border-color 0.2s;
}

.content-editor:focus-within {
  border-color: #667eea;
}

.editor-toolbar {
  background: #f9fafb;
  padding: 0.5rem;
  border-bottom: 1px solid #e5e7eb;
  display: flex;
  gap: 0.25rem;
}

.toolbar-btn {
  background: white;
  border: 1px solid #d1d5db;
  border-radius: 0.25rem;
  padding: 0.25rem 0.5rem;
  cursor: pointer;
  font-size: 0.875rem;
  transition: all 0.2s;
}

.toolbar-btn:hover {
  background: #f3f4f6;
  border-color: #9ca3af;
}

.content-editor textarea {
  width: 100%;
  border: none;
  padding: 1rem;
  font-size: 1rem;
  line-height: 1.6;
  resize: vertical;
  min-height: 300px;
}

.content-editor textarea:focus {
  outline: none;
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

.tags-preview {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
  margin-top: 0.75rem;
}

.tag-item {
  background: #e5e7eb;
  color: #374151;
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
  font-size: 0.75rem;
}

.preview-card {
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  padding: 1.5rem;
}

.preview-header h4 {
  margin: 0 0 0.5rem;
  color: #1f2937;
  font-size: 1.25rem;
}

.preview-meta {
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
  font-size: 0.875rem;
  color: #6b7280;
}

.preview-content {
  margin-bottom: 1rem;
  line-height: 1.6;
  color: #374151;
}

.preview-tags {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.tag {
  background: #ddd6fe;
  color: #5b21b6;
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
  font-size: 0.75rem;
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
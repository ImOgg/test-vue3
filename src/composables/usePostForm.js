import { ref, reactive, computed } from 'vue'
import { usePostStore } from '../stores/post.js'
import { validatePostForm } from '../services/schema/index.js'

export function usePostForm(initialData = {}) {
  const postStore = usePostStore()
  
  // 表單資料 - 改為 reactive 以符合 PostForm.vue 的使用方式
  const formData = reactive({
    title: initialData.title || '',
    content: initialData.content || '',
    userId: initialData.userId || '',
    tags: initialData.tags || []
  })

  // 表單驗證錯誤 - 改為 reactive
  const errors = reactive({})
  
  // 提交狀態
  const isSubmitting = ref(false)

  // 計算屬性 - 更新 errors 的參考方式
  const isValid = computed(() => Object.keys(errors).length === 0)
  const hasChanges = computed(() => {
    return JSON.stringify(formData) !== JSON.stringify({
      title: initialData.title || '',
      content: initialData.content || '',
      userId: initialData.userId || '',
      tags: initialData.tags || []
    })
  })

  const wordCount = computed(() => formData.content.length)
  const titleLength = computed(() => formData.title.length)

  // 驗證表單 - 更新 formData 和 errors 的參考方式
  const validate = () => {
    const validation = validatePostForm(formData)
    Object.assign(errors, validation.errors)
    return validation.isValid
  }

  // 清除錯誤
  const clearErrors = () => {
    Object.keys(errors).forEach(key => delete errors[key])
  }

  // 設置特定欄位錯誤
  const setFieldError = (field, message) => {
    errors[field] = message
  }

  // 清除特定欄位錯誤
  const clearFieldError = (field) => {
    delete errors[field]
  }

  // 重置表單
  const resetForm = () => {
    Object.assign(formData, {
      title: initialData.title || '',
      content: initialData.content || '',
      userId: initialData.userId || '',
      tags: initialData.tags || []
    })
    clearErrors()
    isSubmitting.value = false
  }

  // 重置表單 - 添加 reset 別名以符合 PostForm.vue
  const reset = resetForm

  // 填入表單資料
  const fillForm = (data) => {
    Object.assign(formData, {
      title: data.title || '',
      content: data.content || '',
      userId: data.userId || '',
      tags: data.tags || []
    })
    clearErrors()
  }

  // 設置作者
  const setAuthor = (userId) => {
    formData.userId = userId
  }

  // 提交表單（創建文章）
  const submitCreate = async () => {
    if (!validate()) return { success: false, errors: errors }

    isSubmitting.value = true
    clearErrors()

    try {
      const newPost = await postStore.createPost(formData)
      resetForm()
      return { success: true, data: newPost }
    } catch (error) {
      setFieldError('submit', error.message)
      return { success: false, error: error.message }
    } finally {
      isSubmitting.value = false
    }
  }

  // 提交表單（更新文章）
  const submitUpdate = async (postId) => {
    if (!validate()) return { success: false, errors: errors }

    isSubmitting.value = true
    clearErrors()

    try {
      const updatedPost = await postStore.updatePost(postId, formData)
      return { success: true, data: updatedPost }
    } catch (error) {
      setFieldError('submit', error.message)
      return { success: false, error: error.message }
    } finally {
      isSubmitting.value = false
    }
  }

  // 儲存為草稿
  const saveDraft = async (postId = null) => {
    formData.status = 'draft'
    
    if (postId) {
      return await submitUpdate(postId)
    } else {
      return await submitCreate()
    }
  }

  // 發布文章
  const publish = async (postId = null) => {
    formData.status = 'published'
    
    if (postId) {
      return await submitUpdate(postId)
    } else {
      return await submitCreate()
    }
  }

  // 即時驗證特定欄位
  const validateField = (field) => {
    const tempData = { ...formData }
    const validation = validatePostForm(tempData)
    
    if (validation.errors[field]) {
      setFieldError(field, validation.errors[field])
    } else {
      clearFieldError(field)
    }
    
    return !validation.errors[field]
  }

  // 自動儲存（防丟失）
  const autoSave = ref(null)
  const lastSaved = ref(null)
  
  const enableAutoSave = (postId = null, interval = 30000) => {
    if (autoSave.value) clearInterval(autoSave.value)
    
    autoSave.value = setInterval(async () => {
      if (hasChanges.value && isValid.value) {
        try {
          if (postId) {
            await submitUpdate(postId)
          } else {
            const result = await saveDraft()
            if (result.success && result.data) {
              // 如果是新文章，更新 postId 用於後續自動儲存
              postId = result.data.id
            }
          }
          lastSaved.value = new Date()
        } catch (error) {
          console.warn('自動儲存失敗:', error)
        }
      }
    }, interval)
  }
  
  const disableAutoSave = () => {
    if (autoSave.value) {
      clearInterval(autoSave.value)
      autoSave.value = null
    }
  }

  return {
    // 響應式資料
    formData,
    errors,
    isSubmitting,
    lastSaved,
    
    // 計算屬性
    isValid,
    hasChanges,
    wordCount,
    titleLength,
    
    // 方法
    validate,
    reset, // 添加 reset 別名
    clearErrors,
    setFieldError,
    clearFieldError,
    resetForm,
    fillForm,
    setAuthor,
    submitCreate,
    submitUpdate,
    saveDraft,
    publish,
    validateField,
    enableAutoSave,
    disableAutoSave
  }
}
import { ref, computed } from 'vue'
import { useUserStore } from '../stores/user.js'
import { validateUserForm } from '../services/schema/index.js'

export function useUserForm(initialData = {}) {
  const userStore = useUserStore()
  
  // 表單資料
  const formData = ref({
    name: initialData.name || '',
    email: initialData.email || '',
    phone: initialData.phone || '',
    age: initialData.age || '',
    city: initialData.city || '',
    isActive: initialData.isActive ?? true
  })

  // 表單驗證錯誤
  const errors = ref({})
  
  // 提交狀態
  const isSubmitting = ref(false)

  // 計算屬性
  const isValid = computed(() => Object.keys(errors.value).length === 0)
  const hasChanges = computed(() => {
    return JSON.stringify(formData.value) !== JSON.stringify({
      name: initialData.name || '',
      email: initialData.email || '',
      phone: initialData.phone || '',
      age: initialData.age || '',
      city: initialData.city || '',
      isActive: initialData.isActive ?? true
    })
  })

  // 驗證表單
  const validate = () => {
    const validation = validateUserForm(formData.value)
    errors.value = validation.errors
    return validation.isValid
  }

  // 清除錯誤
  const clearErrors = () => {
    errors.value = {}
  }

  // 設置特定欄位錯誤
  const setFieldError = (field, message) => {
    errors.value = { ...errors.value, [field]: message }
  }

  // 清除特定欄位錯誤
  const clearFieldError = (field) => {
    const newErrors = { ...errors.value }
    delete newErrors[field]
    errors.value = newErrors
  }

  // 重置表單
  const resetForm = () => {
    formData.value = {
      name: initialData.name || '',
      email: initialData.email || '',
      phone: initialData.phone || '',
      age: initialData.age || '',
      city: initialData.city || '',
      isActive: initialData.isActive ?? true
    }
    errors.value = {}
    isSubmitting.value = false
  }

  // 填入表單資料
  const fillForm = (data) => {
    formData.value = {
      name: data.name || '',
      email: data.email || '',
      phone: data.phone || '',
      age: data.age || '',
      city: data.city || '',
      isActive: data.isActive ?? true
    }
    clearErrors()
  }

  // 提交表單（創建用戶）
  const submitCreate = async () => {
    if (!validate()) return { success: false, errors: errors.value }

    isSubmitting.value = true
    clearErrors()

    try {
      const newUser = await userStore.createUser(formData.value)
      resetForm()
      return { success: true, data: newUser }
    } catch (error) {
      setFieldError('submit', error.message)
      return { success: false, error: error.message }
    } finally {
      isSubmitting.value = false
    }
  }

  // 提交表單（更新用戶）
  const submitUpdate = async (userId) => {
    if (!validate()) return { success: false, errors: errors.value }

    isSubmitting.value = true
    clearErrors()

    try {
      const updatedUser = await userStore.updateUser(userId, formData.value)
      return { success: true, data: updatedUser }
    } catch (error) {
      setFieldError('submit', error.message)
      return { success: false, error: error.message }
    } finally {
      isSubmitting.value = false
    }
  }

  // 即時驗證特定欄位
  const validateField = (field) => {
    const tempData = { ...formData.value }
    const validation = validateUserForm(tempData)
    
    if (validation.errors[field]) {
      setFieldError(field, validation.errors[field])
    } else {
      clearFieldError(field)
    }
    
    return !validation.errors[field]
  }

  return {
    // 響應式資料
    formData,
    errors,
    isSubmitting,
    
    // 計算屬性
    isValid,
    hasChanges,
    
    // 方法
    validate,
    clearErrors,
    setFieldError,
    clearFieldError,
    resetForm,
    fillForm,
    submitCreate,
    submitUpdate,
    validateField
  }
}
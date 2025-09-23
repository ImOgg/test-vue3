import { ref, computed } from 'vue'
import { useUserStore } from '../stores/user.js'
import { validateLoginForm } from '../services/schema/index.js'

export function useAuth() {
  const userStore = useUserStore()
  
  // 登入表單資料
  const loginForm = ref({
    email: '',
    password: ''
  })

  // 登入表單錯誤
  const loginErrors = ref({})
  
  // 登入狀態
  const isLoggingIn = ref(false)

  // 從 store 獲取狀態
  const isLoggedIn = computed(() => userStore.isLoggedIn)
  const currentUser = computed(() => userStore.currentUser)
  const token = computed(() => userStore.token)

  // 驗證登入表單
  const validateLogin = () => {
    const validation = validateLoginForm(loginForm.value)
    loginErrors.value = validation.errors
    return validation.isValid
  }

  // 清除登入錯誤
  const clearLoginErrors = () => {
    loginErrors.value = {}
  }

  // 設置登入錯誤
  const setLoginError = (field, message) => {
    loginErrors.value = { ...loginErrors.value, [field]: message }
  }

  // 重置登入表單
  const resetLoginForm = () => {
    loginForm.value = {
      email: '',
      password: ''
    }
    loginErrors.value = {}
  }

  // 登入
  const login = async () => {
    if (!validateLogin()) {
      return { success: false, errors: loginErrors.value }
    }

    isLoggingIn.value = true
    clearLoginErrors()

    try {
      const result = await userStore.login(loginForm.value)
      
      if (result.success) {
        resetLoginForm()
        return { success: true, user: result.user }
      } else {
        setLoginError('submit', result.error)
        return { success: false, error: result.error }
      }
    } catch (error) {
      setLoginError('submit', error.message)
      return { success: false, error: error.message }
    } finally {
      isLoggingIn.value = false
    }
  }

  // 登出
  const logout = async () => {
    try {
      await userStore.logout()
      return { success: true }
    } catch (error) {
      console.error('登出錯誤:', error)
      return { success: false, error: error.message }
    }
  }

  // 檢查認證狀態
  const checkAuth = async () => {
    try {
      const isAuthenticated = await userStore.checkAuth()
      return isAuthenticated
    } catch (error) {
      console.error('認證檢查失敗:', error)
      return false
    }
  }

  // 權限檢查輔助函數
  const hasPermission = (permission) => {
    if (!currentUser.value) return false
    
    // 這裡可以根據實際的權限系統來實作
    // 目前簡單地檢查用戶是否啟用
    return currentUser.value.isActive
  }

  // 檢查是否為用戶本人或管理員
  const canEditUser = (userId) => {
    if (!currentUser.value) return false
    
    // 用戶可以編輯自己的資料
    if (currentUser.value.id === userId) return true
    
    // 這裡可以加入管理員權限檢查
    // return currentUser.value.role === 'admin'
    
    return false
  }

  // 檢查是否可以編輯文章
  const canEditPost = (post) => {
    if (!currentUser.value) return false
    
    // 作者可以編輯自己的文章
    if (post.userId === currentUser.value.id) return true
    
    // 這裡可以加入管理員權限檢查
    // return currentUser.value.role === 'admin'
    
    return false
  }

  // 檢查是否可以刪除留言
  const canDeleteComment = (comment) => {
    if (!currentUser.value) return false
    
    // 留言作者可以刪除自己的留言
    if (comment.userId === currentUser.value.id) return true
    
    // 這裡可以加入管理員權限檢查
    // return currentUser.value.role === 'admin'
    
    return false
  }

  // 自動登入（頁面刷新時）
  const autoLogin = async () => {
    const token = localStorage.getItem('token')
    if (!token) return false

    try {
      const isAuthenticated = await checkAuth()
      return isAuthenticated
    } catch (error) {
      console.error('自動登入失敗:', error)
      return false
    }
  }

  // 重新導向到登入頁面
  const redirectToLogin = (router, returnUrl = null) => {
    const query = returnUrl ? { returnUrl } : {}
    router.push({ name: 'login', query })
  }

  // 檢查登入狀態的路由守衛
  const requireAuth = (to, from, next) => {
    if (isLoggedIn.value) {
      next()
    } else {
      next({ name: 'login', query: { returnUrl: to.fullPath } })
    }
  }

  // 檢查未登入狀態的路由守衛（如登入頁面）
  const requireGuest = (to, from, next) => {
    if (!isLoggedIn.value) {
      next()
    } else {
      next({ name: 'home' })
    }
  }

  return {
    // 響應式資料
    loginForm,
    loginErrors,
    isLoggingIn,
    
    // 計算屬性
    isLoggedIn,
    currentUser,
    token,
    
    // 表單方法
    validateLogin,
    clearLoginErrors,
    setLoginError,
    resetLoginForm,
    
    // 認證方法
    login,
    logout,
    checkAuth,
    autoLogin,
    
    // 權限方法
    hasPermission,
    canEditUser,
    canEditPost,
    canDeleteComment,
    
    // 路由方法
    redirectToLogin,
    requireAuth,
    requireGuest
  }
}
// 這個檔案展示 Zod 驗證的實際運作流程

import { UserSchema, CreateUserSchema, parseUsers } from './schemas/index.js'

// 📝 示範：驗證不同的資料情況

console.log('🧪 Zod 驗證測試開始...\n')

// ✅ 測試 1: 正確的用戶資料
console.log('📋 測試 1: 正確的用戶資料')
try {
  const validUser = {
    id: 1,
    name: '張三',
    age: 25,
    city: '台北'
  }
  
  const result = UserSchema.parse(validUser)
  console.log('✅ 驗證成功:', result)
} catch (error) {
  console.log('❌ 驗證失敗:', error.errors)
}

// ❌ 測試 2: 錯誤的用戶資料 (年齡超過範圍)
console.log('\n📋 測試 2: 年齡超過範圍')
try {
  const invalidUser = {
    id: 2,
    name: '李四',
    age: 200, // 超過 150 歲限制
    city: '台中'
  }
  
  const result = UserSchema.parse(invalidUser)
  console.log('✅ 驗證成功:', result)
} catch (error) {
  console.log('❌ 驗證失敗:')
  error.errors.forEach(err => {
    console.log(`  - ${err.path.join('.')}: ${err.message}`)
  })
}

// ❌ 測試 3: 缺少必要欄位
console.log('\n📋 測試 3: 缺少必要欄位')
try {
  const incompleteUser = {
    name: '王五',
    age: 30
    // 缺少 city
  }
  
  const result = CreateUserSchema.parse(incompleteUser)
  console.log('✅ 驗證成功:', result)
} catch (error) {
  console.log('❌ 驗證失敗:')
  error.errors.forEach(err => {
    console.log(`  - ${err.path.join('.')}: ${err.message}`)
  })
}

// 📊 測試 4: 驗證 API 回應格式
console.log('\n📋 測試 4: 模擬 API 回應驗證')
try {
  // 模擬從 JSON Server 回來的資料
  const apiResponse = [
    { id: 1, name: '張三', age: 25, city: '台北' },
    { id: 2, name: '李四', age: 30, city: '台中' },
    { id: 3, name: '王五', age: 28, city: '高雄' }
  ]
  
  const validatedUsers = parseUsers(apiResponse)
  console.log('✅ API 回應驗證成功:', validatedUsers.length, '筆用戶資料')
} catch (error) {
  console.log('❌ API 回應驗證失敗:', error.errors)
}

// 🔄 測試 5: 資料轉換
console.log('\n📋 測試 5: 自動資料轉換')
try {
  const userWithStringAge = {
    id: 4,
    name: '趙六',
    age: '35', // 字串會自動轉換為數字
    city: '新竹'
  }
  
  const result = UserSchema.parse(userWithStringAge)
  console.log('✅ 自動轉換成功:', result)
  console.log('年齡型別:', typeof result.age) // 應該是 number
} catch (error) {
  console.log('❌ 轉換失敗:', error.errors)
}

console.log('\n🎉 測試完成！')

// 💡 重點說明
console.log(`
🔍 重點總結:
1. 前端驗證: 用戶輸入 → CreateUserSchema 驗證 → 發送 API
2. 後端驗證: API 回應 → UserSchema 驗證 → 顯示給用戶
3. 錯誤處理: 詳細的錯誤訊息幫助除錯
4. 資料轉換: 自動處理型別轉換
5. 型別安全: 保證資料結構的一致性
`)
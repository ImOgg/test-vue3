# Vue 3 + Pinia + Zod  + Vue Query & VueUse

一個基於 Vue 3 + Pinia + Zod + Vue Query + VueUse + JSON Server 的完整前端架構示範專案。

## 🆕 最新更新 - 完整架構重構 ✅

**🎯 專案定位：** 現代化數據獲取方案的完整示範，展示 Vue Query 和 VueUse 的最佳實踐應用

### 📅 今日完成的重大更新

- **✅ 架構清理**: 移除所有認證相關功能，專注於數據獲取展示
- **✅ Schema 統一**: 合併重複的 schema 架構，統一使用 `services/schema/`
- **✅ 錯誤修復**: 解決所有 import 錯誤和依賴問題
- **✅ 功能精簡**: 移除編輯/刪除功能，專注於數據展示和緩存策略
- **✅ 文檔完善**: 詳細說明 axios.create、攔截器和數據流架構

### 🔥 核心特色

本專案現已整合了現代化的數據獲取方案：

- **🔥 Vue Query (@tanstack/vue-query)**: 強大的數據同步和緩存管理
- **⚡ VueUse (@vueuse/core)**: 豐富的組合式函數工具庫
- **🛡️ Axios 攔截器**: 統一的 HTTP 配置和錯誤處理
- **📝 Zod 驗證**: 完整的數據驗證和類型安全

### 🎯 為什麼選擇這個組合？

| 工具 | 優勢 | 適用場景 |
|------|------|----------|
| **Vue Query** | 智能緩存、背景更新、錯誤重試、樂觀更新 | 複雜數據管理、需要緩存的應用 |
| **VueUse** | 輕量級、TypeScript 支援、豐富工具函數 | 簡單數據獲取、工具函數集合 |

### 📊 實際應用策略

在我們的專案中：
- **文章和評論數據** 使用 **Vue Query** → 需要複雜的緩存和同步
- **用戶數據** 使用 **VueUse + Pinia** → 輕量數據獲取 + 全域緩存避免重複請求

### 🔄 緩存策略對比

| 數據類型 | 工具組合 | 緩存機制 | 適用場景 |
|---------|---------|----------|----------|
| **文章/評論** | Vue Query | 智能緩存、背景更新、5分鐘 stale time | 複雜數據管理、需要即時同步 |
| **用戶數據** | VueUse + Pinia | 全域 store 緩存、5分鐘過期檢查 | 簡單 CRUD、避免重複請求 |

### 🔍 查看實際效果

訪問以下頁面查看 Vue Query 和 VueUse 的實際應用：
- **文章詳情** (`/posts/1`) - Vue Query 智能緩存和載入狀態
- **用戶列表** (`/users`) - VueUse 響應式數據獲取和搜尋

### ⚠️ 功能範圍說明

本專案專注於展示 **Vue Query** 和 **VueUse** 的數據獲取能力，因此：

- ✅ **支援功能**: 文章瀏覽、評論發表、用戶查詢、數據緩存
- ❌ **不支援功能**: 文章編輯/刪除、評論刪除、用戶編輯、認證系統
- 🎯 **設計目標**: 展示現代化的數據獲取和狀態管理模式
- 🧹 **架構特色**: 清潔的代碼結構，專注於核心功能展示

### 🔧 技術實現亮點

- **混合數據策略**: Vue Query 處理複雜數據 + VueUse 處理簡單數據
- **智能緩存機制**: 避免重複請求，5分鐘智能緩存
- **統一錯誤處理**: Axios 攔截器 + Zod 雙重驗證
- **模組化架構**: 清晰的分層設計，易於維護和擴展

## 🏗️ 新架構概覽 (含 Vue Query & VueUse)

```
┌─────────────────────────────────────────────────────┐
│  🖼️ View Layer (組件)                                │
│  PostDetail.vue, UserList.vue                      │
└────────────────┬────────────────────────────────────┘
                 │ 使用
┌────────────────▼────────────────────────────────────┐
│  🪝 Hooks Layer (Vue Query & VueUse + Pinia)        │
│  hooks/usePosts.js, hooks/useUsers.js              │
│  - Vue Query: 文章數據獲取和智能緩存                  │
│  - VueUse + Pinia: 用戶數據獲取和全域緩存           │
│  - 避免重複請求，智能緩存管理                         │
└────────────────┬────────────────────────────────────┘
                 │ 使用
┌────────────────▼────────────────────────────────────┐
│  🧩 Composable Layer (可複用業務邏輯)                │
│  composables/useUserForm.js, usePostForm.js        │
└────────────────┬────────────────────────────────────┘
                 │ 使用
┌────────────────▼────────────────────────────────────┐
│  📦 Store Layer (Pinia 狀態管理) - 輕量化            │
│  stores/app.js, stores/user.js                     │
│  - 全域緩存控制 (VueUse 配合)                        │
│  - 基礎應用狀態                                       │
└────────────────┬────────────────────────────────────┘
                 │ 呼叫
┌────────────────▼────────────────────────────────────┐
│  🔌 API Layer (API 函數)                             │
│  services/api.js - 統一 API 管理                     │
│  - 定義 API 端點                                     │
│  - Zod 驗證整合                                      │
└────────────────┬────────────────────────────────────┘
                 │ 使用
┌────────────────▼────────────────────────────────────┐
│  🔧 HTTP Layer (Axios 實例)                          │
│  services/request.js                                │
│  - 統一配置 (baseURL, timeout, headers)             │
│  - 請求/回應攔截器                                    │
│  - 自動 Token 管理                                   │
│  - 統一錯誤處理                                       │
└────────────────┬────────────────────────────────────┘
                 │ 發送請求
┌────────────────▼────────────────────────────────────┐
│  🌐 Backend API                                      │
│  json-server (模擬後端)                              │
└─────────────────────────────────────────────────────┘
```

### 🔄 數據流變化

**傳統 Pinia 方式:**
```
組件 → Store → API → 手動快取 → 手動載入狀態
```

**Vue Query + VueUse 方式:**
```
組件 → Hooks → 自動快取 → 智能更新 → 內建載入狀態
```

## 🚀 快速開始

### 安裝依賴

```bash
npm install
```

### 啟動專案

1. **啟動 JSON Server (後端模擬)**
```bash
npm run json-server
```
JSON Server 會在 `http://localhost:3001` 啟動

2. **啟動 Vue 開發服務器**
```bash
npm run dev
```
前端會在 `http://localhost:5173` 啟動

## 📁 專案結構

```
src/
├── hooks/                  # 🆕 數據獲取 Hooks (Vue Query & VueUse)
│   ├── usePosts.js         # Vue Query 文章管理
│   └── useUsers.js         # VueUse 用戶管理
├── services/               # 服務層
│   ├── request.js          # HTTP 配置 (Axios) + 攔截器詳解
│   ├── api.js              # 統一 API 管理 (已整合)
│   └── schema/             # 資料驗證層 (Zod) - 統一管理
│       └── index.js        # 所有 schema 定義
├── stores/                 # 狀態管理層 (Pinia) - 🔄 輕量化
│   ├── app.js              # 應用全域狀態 (已簡化)
│   ├── user.js             # 用戶狀態 + 緩存控制
│   └── index.js            # 統一導出
├── composables/            # 組合式函數層
│   ├── useUserForm.js      # 用戶表單邏輯
│   ├── usePostForm.js      # 文章表單邏輯
│   └── useDataTable.js     # 資料表格邏輯
├── router/                 # 路由配置
│   └── index.js
├── views/                  # 頁面組件
│   ├── PostDetail.vue      # 🔄 已更新使用 Vue Query
│   ├── UserList.vue        # 🔄 已更新使用 VueUse
│   └── ...
├── components/             # 可複用組件
├── assets/                 # 靜態資源
├── main.js                 # 應用入口 (🔄 含 Vue Query 配置)
└── App.vue                 # 根組件
```

## 🛡️ 架構分層說明

### 🆕 0️⃣ Hooks 層 (`hooks/*.js`) - 現代數據獲取

**職責：**
- Vue Query 複雜數據管理
- VueUse 簡單數據獲取  
- 自動緩存和同步
- 載入和錯誤狀態

**Vue Query 特色：**
```javascript
// hooks/usePosts.js
export function usePosts() {
  return useQuery({
    queryKey: ['posts'],
    queryFn: async () => {
      const response = await postApi.getAll()
      return parsePosts(response)
    },
    staleTime: 5 * 60 * 1000, // 5分鐘快取
    cacheTime: 10 * 60 * 1000, // 10分鐘記憶體保留
  })
}

// 自動管理載入狀態、錯誤重試、背景更新
const { data: posts, isLoading, error, refetch } = usePosts()
```

**VueUse + Pinia 特色：**
```javascript
// hooks/useUsers.js - 智能緩存避免重複請求
export function useUsers() {
  const userStore = useUserStore()
  
  // 檢查緩存：有數據且未過期直接返回
  if (userStore.users.length > 0 && !userStore.isStale) {
    return {
      users: computed(() => userStore.users),
      isLoading: ref(false), // 無需載入
      error: ref(null),
      refetch: () => userStore.fetchUsers(),
    }
  }

  // 只有在無緩存或過期時才發送請求
  const { data, isFetching, error } = useFetch('/api/users', {
    afterFetch(ctx) {
      ctx.data = parseUsers(ctx.data) // Zod 驗證
      userStore.setUsers(ctx.data) // 存入 Pinia 全域緩存
      return ctx
    },
  }).json()

  return { users: computed(() => userStore.users), isFetching, error }
}

// 多個組件同時使用時，只有第一次會發送請求！
const { users, isLoading } = useUsers() // 第一次：發送請求
const { users: users2 } = useUsers()    // 第二次：直接從緩存返回
```
```

### 1️⃣ HTTP 層 (`services/request.js`)

**職責：**
- 統一 Axios 配置
- 請求/回應攔截器
- 錯誤處理
- Token 管理

**特色：**
```javascript
// 自動添加 Token
request.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// 統一錯誤處理
request.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      // 自動導向登入頁
    }
    return Promise.reject(error)
  }
)
```

### 2️⃣ Schema 層 (`services/schema/index.js`)

**職責：**
- Zod 驗證規則定義
- 資料型別定義
- 表單驗證輔助函數

**🔧 模組化選項：**

本專案目前使用單檔案管理，但可以拆分為：

```javascript
// 📁 建議的模組化結構
src/services/schema/
├── index.js          // 統一導出入口
├── user.js           // 用戶相關 schema
├── post.js           // 文章相關 schema  
├── comment.js        // 留言相關 schema
└── common.js         // 共用格式 (API 回應等)

// 📝 使用方式對比
// 單檔案方式 (目前)
import { userSchema, postSchema } from '@/services/schema'

// 模組化方式
import { userSchema } from '@/services/schema/user'
import { postSchema } from '@/services/schema/post'
```

**💡 拆分時機：**
- Schema 數量 > 10 個
- 單檔案 > 500 行  
- 團隊協作需求
- 更細緻的依賴控制

**特色：**
```javascript
// 🔍 Zod 操作說明與最佳實踐

// 基本用戶模型 - 完整資料結構
export const userSchema = z.object({
  id: z.number(),
  name: z.string().min(1, '姓名不能為空'),
  email: z.string().email('信箱格式錯誤'),
  phone: z.string().optional(),  // .optional() - 可選欄位
  age: z.number().min(1).max(150),
  isActive: z.boolean().default(true)  // .default() - 預設值
})

// .omit() - 排除指定欄位，用於新增操作（不需要 ID）
export const createUserSchema = userSchema.omit({ id: true })

// .partial() - 所有欄位變可選，用於更新操作（可只改部分欄位）  
export const updateUserSchema = userSchema.partial().omit({ id: true })

// .array() - 驗證陣列格式
export const userListSchema = z.array(userSchema)

// 表單驗證輔助函數 - 自動轉換 Zod 錯誤為前端可用格式
export const validateUserForm = (data) => {
  try {
    createUserSchema.parse(data)
    return { isValid: true, errors: {} }
  } catch (error) {
    // 回傳詳細錯誤訊息
  }
}
```

### 3️⃣ API 層 (`services/api/*.js`)

**職責：**
- 定義 API 端點
- 自動資料驗證
- 統一錯誤處理

**特色：**
```javascript
export const userAPI = {
  async getAll() {
    const response = await request.get('/users')
    return parseUsers(response.data) // 自動 Zod 驗證
  },

  async create(userData) {
    const validatedData = createUserSchema.parse(userData) // 前端驗證
    const response = await request.post('/users', validatedData)
    return parseUser(response.data) // 後端回應驗證
  }
}
```

### 4️⃣ Store 層 (`stores/*.js`)

**職責：**
- 全域狀態管理
- 業務邏輯封裝
- API 呼叫協調

**特色：**
```javascript
export const useUserStore = defineStore('user', () => {
  // State
  const users = ref([])
  const loading = ref(false)
  
  // Getters
  const activeUsers = computed(() => users.value.filter(u => u.isActive))
  
  // Actions
  const fetchUsers = async () => {
    loading.value = true
    try {
      users.value = await userAPI.getAll()
    } finally {
      loading.value = false
    }
  }
  
  return { users, activeUsers, fetchUsers }
})
```

### 5️⃣ Composable 層 (`composables/*.js`)

**職責：**
- 可複用業務邏輯
- 表單處理邏輯
- 生命週期管理

**特色：**
```javascript
export function useUserForm(initialData = {}) {
  const formData = ref({ name: '', email: '' })
  const errors = ref({})
  
  const validate = () => {
    const validation = validateUserForm(formData.value)
    errors.value = validation.errors
    return validation.isValid
  }
  
  const submitCreate = async () => {
    if (!validate()) return
    return await userStore.createUser(formData.value)
  }
  
  return { formData, errors, validate, submitCreate }
}
```

### 6️⃣ View 層 (`views/*.vue`)

**職責：**
- UI 呈現
- 使用者互動
- 組合 Hooks 和 Composable

**Vue Query 使用範例：**
```vue
<script setup>
import { usePostWithComments, useDeletePost } from '@/hooks/usePosts'

const postId = computed(() => parseInt(route.params.id))
const { post, comments, isLoading, error } = usePostWithComments(postId)
const deletePostMutation = useDeletePost()

const deletePost = async () => {
  await deletePostMutation.mutateAsync(postId.value)
  router.push('/posts')
}
</script>

<template>
  <div v-if="isLoading">載入中...</div>
  <div v-else-if="error">{{ error.message }}</div>
  <article v-else>
    <h1>{{ post.title }}</h1>
    <p>{{ post.content }}</p>
    <button @click="deletePost" :disabled="deletePostMutation.isLoading.value">
      {{ deletePostMutation.isLoading.value ? '刪除中...' : '刪除文章' }}
    </button>
  </article>
</template>
```

**VueUse 使用範例：**
```vue
<script setup>
import { useUserManagement } from '@/hooks/useUsers'

const {
  users,
  userStats,
  isLoading,
  error,
  refetch,
  searchTerm,
  deleteUser
} = useUserManagement()

const handleDelete = async (userId) => {
  await deleteUser(userId)
}
</script>

<template>
  <div class="user-management">
    <input v-model="searchTerm" placeholder="搜尋用戶..." />
    
    <div class="stats">
      <span>總用戶: {{ userStats.total }}</span>
      <span>活躍: {{ userStats.active }}</span>
    </div>

    <div v-if="isLoading">載入中...</div>
    <div v-else-if="error">載入失敗</div>
    <div v-else>
      <div v-for="user in users" :key="user.id" class="user-item">
        <span>{{ user.name }}</span>
        <button @click="handleDelete(user.id)">刪除</button>
      </div>
    </div>
  </div>
</template>
```

## 🔑 核心功能

### 🛡️ 資料驗證流程

```
用戶輸入 → 前端 Zod 驗證 → API 呼叫 → 後端回應 → Zod 驗證 → 更新 Store
```

**雙重驗證保護：**
1. **前端驗證**：即時回饋，提升用戶體驗
2. **後端驗證**：確保資料安全，防止格式錯誤

###  狀態管理最佳實踐

**特色：**
- 模組化 Store 設計
- 響應式資料更新
- 計算屬性優化
- 統一錯誤處理

### 🎯 表單處理系統

**功能：**
- 即時驗證
- 錯誤訊息顯示
- 自動重置
- 提交狀態管理

## 🧪 測試範例

### API 測試
```javascript
// 測試用戶 API
const users = await userAPI.getAll()
console.log(users) // 已通過 Zod 驗證的資料

// 測試錯誤處理
try {
  await userAPI.create({ name: '', email: 'invalid' })
} catch (error) {
  console.log(error.message) // "資料驗證失敗: 姓名不能為空, 信箱格式錯誤"
}
```

### Store 測試
```javascript
// 測試用戶 Store
const userStore = useUserStore()
await userStore.fetchUsers()
console.log(userStore.users) // 用戶列表
console.log(userStore.activeUsers) // 活躍用戶
```

### Composable 測試
```javascript
// 測試表單 Composable
const { formData, validate, submitCreate } = useUserForm()
formData.value = { name: '測試用戶', email: 'test@example.com' }
const isValid = validate()
if (isValid) {
  await submitCreate()
}
```

## 🛠️ 開發指南

### 新增 API 端點

1. **在 Schema 層定義驗證規則**
```javascript
// services/schema/index.js
export const newResourceSchema = z.object({
  // 定義欄位
})
```

2. **在 API 層建立端點**
```javascript
// services/api/newResource.js
export const newResourceAPI = {
  async getAll() {
    // API 實作
  }
}
```

3. **在 Store 層管理狀態**
```javascript
// stores/newResource.js
export const useNewResourceStore = defineStore('newResource', () => {
  // 狀態管理實作
})
```

### 新增頁面

1. **建立 View 組件**
```vue
<!-- views/NewPage.vue -->
<script setup>
import { useNewResourceStore } from '@/stores/newResource'
// 組件邏輯
</script>
```

2. **添加路由**
```javascript
// router/index.js
{
  path: '/new-page',
  name: 'new-page',
  component: () => import('../views/NewPage.vue')
}
```

## 📝 API 文件

### 用戶相關 API

| 方法 | 端點 | 說明 |
|------|------|------|
| GET | `/users` | 獲取用戶列表 |
| GET | `/users/:id` | 獲取單一用戶 |
| POST | `/users` | 創建用戶 |
| PUT | `/users/:id` | 更新用戶 |
| DELETE | `/users/:id` | 刪除用戶 |

### 文章相關 API

| 方法 | 端點 | 說明 |
|------|------|------|
| GET | `/posts` | 獲取文章列表 |
| GET | `/posts/:id` | 獲取單一文章 |
| POST | `/posts` | 創建文章 |
| PUT | `/posts/:id` | 更新文章 |
| DELETE | `/posts/:id` | 刪除文章 |

### 留言相關 API

| 方法 | 端點 | 說明 |
|------|------|------|
| GET | `/comments` | 獲取留言列表 |
| GET | `/comments?postId=:id` | 獲取文章留言 |
| POST | `/comments` | 創建留言 |
| DELETE | `/comments/:id` | 刪除留言 |

## 🎨 UI 組件

### 表單組件
- 用戶表單：資料展示和搜尋
- 文章表單：發表評論
- 數據表單：Zod 驗證展示

### 列表組件
- 用戶列表：分頁、搜尋、排序
- 文章列表：篩選、狀態管理
- 留言列表：即時更新

### 通用組件
- 資料表格：可配置的表格組件
- 載入狀態：統一的載入指示器
- 錯誤處理：友善的錯誤訊息顯示

## 🔧 配置說明

### 環境變數
```bash
# .env
VITE_API_URL=http://localhost:3001
```

### JSON Server 配置
```json
// package.json
{
  "scripts": {
    "json-server": "json-server --watch db.json --port 3001"
  }
}
```

## 🚦 最佳實踐

### 1. 錯誤處理
- 統一錯誤攔截
- 友善錯誤訊息
- 錯誤狀態管理

### 2. 效能優化
- 懶加載路由
- 計算屬性緩存
- API 請求去重

### 3. 程式碼品質
- 模組化設計
- 可復用組件
- 一致的命名規範

### 4. 安全性
- 輸入驗證
- 數據驗證
- 錯誤邊界處理

## 📚 技術棧

### 🏗️ 核心框架
- **Vue 3**: 漸進式 JavaScript 框架
- **Pinia**: Vue 官方狀態管理庫 (輕量化使用)
- **Vue Router**: 官方路由管理器

### 🆕 現代數據管理
- **Vue Query (@tanstack/vue-query)**: 強大的數據同步和緩存管理
- **VueUse (@vueuse/core)**: 豐富的組合式函數工具庫

### 🛡️ 數據處理
- **Zod**: TypeScript 優先的驗證庫
- **Axios**: HTTP 客戶端庫

### 🔧 開發工具
- **JSON Server**: 快速搭建 REST API
- **Vite**: 快速建構工具

### 📦 包大小對比

| 工具 | 大小 | 用途 |
|------|------|------|
| Vue 3 | ~34KB | 核心框架 |
| Vue Query | ~25KB | 數據管理 |
| VueUse | ~12KB | 工具函數 |
| Pinia | ~7KB | 狀態管理 |
| Zod | ~58KB | 數據驗證 |

**總計**: ~136KB (gzipped 後約 40KB)

## 🤝 貢獻指南

1. Fork 專案
2. 創建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交變更 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 開啟 Pull Request

## 📄 授權

本專案採用 MIT 授權 - 查看 [LICENSE](LICENSE) 文件了解詳情

## 🎯 未來規劃

### 🔄 已完成
- [x] Vue Query 整合 - 智能數據管理
- [x] VueUse 整合 - 輕量工具函數
- [x] 混合數據策略 - 複雜+簡單場景覆蓋
- [x] 實戰示範頁面 - 功能展示和對比
- [x] 架構重構 - 移除認證系統，專注數據獲取展示
- [x] Schema 統一 - 合併重複架構，統一管理
- [x] 錯誤修復 - 解決所有 import 和依賴問題
- [x] 文檔完善 - 詳細的技術說明和最佳實踐
- [x] 代碼清理 - 移除無用功能，專注核心展示

### 🎓 學習重點
- [x] axios.create() 和攔截器機制詳解
- [x] Vue Query vs VueUse 使用場景對比
- [x] 現代化數據獲取架構設計
- [x] Zod 驗證和錯誤處理最佳實踐
- [x] Pinia 輕量化使用策略

### 🚀 計劃中
- [ ] 添加單元測試 (Vitest + Vue Test Utils)
- [ ] 集成 TypeScript (完整類型安全)
- [ ] 添加 PWA 支援 (離線能力)
- [ ] 國際化支援 (Vue I18n)
- [ ] 主題切換功能 (深色模式)
- [ ] React Query 遷移指南
- [ ] Suspense 和 ErrorBoundary 整合
- [ ] 無限滾動和虛擬列表
- [ ] WebSocket 即時數據同步
- [ ] Storybook 組件文檔

### 🎓 學習資源
- [ ] Vue Query 最佳實踐文檔
- [ ] VueUse 使用案例集合
- [ ] 性能優化指南
- [ ] 架構決策文檔

---

## 📋 今日開發總結

### ✅ 完成的重要工作
1. **架構清理** - 移除認證系統，專注數據獲取功能展示
2. **Schema 統一** - 解決重複 schema 目錄問題，統一使用 `services/schema/`
3. **錯誤修復** - 修復所有 import 錯誤和依賴問題
4. **文檔優化** - 詳細說明 axios.create、攔截器和數據流架構
5. **代碼精簡** - 移除編輯/刪除功能，專注於數據查詢和緩存展示

### 🎯 專案當前狀態
- **核心功能**: Vue Query + VueUse 混合數據獲取策略
- **技術棧**: Vue 3 + Pinia (輕量) + Zod + Axios 攔截器
- **展示重點**: 現代化數據管理和緩存機制
- **代碼品質**: 清潔架構，專注核心功能

💡 **提示**: 這個架構適合中大型專案，提供了完整的開發體驗和最佳實踐範例。可以直接用於生產環境或作為學習參考。

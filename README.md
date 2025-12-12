# SWAG 自動化登入測試

自動化登入測試專案，主用於測試 Geetest 滑塊驗證功能。

## 使用語言與框架

| 類型     | 技術                 |
| -------- | -------------------- |
| 語言     | JavaScript           |
| 測試框架 | Cypress / Playwright |
| 圖像處理 | OpenCV.js            |
| 運行環境 | Node.js              |

### 主要依賴

- **Cypress** `^15.7.1` - E2E 測試框架
- **Playwright** `^1.40.0` - E2E 測試框架（支援更好的反檢測）
- **OpenCV.js** - 滑塊缺口位置偵測

---

## 如何安裝套件

### 1. 確保已安裝 Node.js

```bash
node -v  # 建議 v18 以上
npm -v
```

### 2. 安裝專案依賴

```bash
# 如果有 package.json，直接安裝所有依賴
npm install

# 或者手動安裝各框架
npm install -D cypress                        # Cypress
npm install -D @playwright/test               # Playwright
npm install cypress-real-events               # Cypress 真實事件插件
```

### 3. 安裝 Playwright 瀏覽器

```bash
npx playwright install chromium
```

---

## 如何執行測試

### Cypress 測試

```bash
# 開啟 Cypress GUI
npm run test:cypress
```

> **已知問題**：Cypress 目前會遇到 Geetest `60500` 錯誤（極驗封禁），因為 Geetest 會偵測到 Cypress 的自動化特徵。

### Playwright 測試（推薦）

```bash
# 有頭模式（可觀察瀏覽器操作）
npm run test:playwright:headed

# Headless 模式
npm run test:playwright

# UI 模式（圖形化介面）
npm run test:playwright:ui
```

> **Playwright 運行正常**：已配置反自動化檢測，可成功通過滑塊驗證。

---

## 專案結構

```
├── cypress/                    # Cypress 測試 (JavaScript)
│   └── e2e/
│       ├── slider-verification.cy.js
│       ├── slider-opencv.cy.js
│       └── slider-console.cy.js
├── playwright/                 # Playwright 測試 (TypeScript)
│   └── tests/
│       └── slider-verification.spec.ts
├── cypress.config.js           # Cypress 配置
├── playwright.config.js        # Playwright 配置
└── package.json
```

---

## 測試框架比較

| 特點             | Cypress            | Playwright     |
| ---------------- | ------------------ | -------------- |
| Geetest 滑塊驗證 | X 60500 錯誤       | O 正常運行     |
| 反自動化檢測     | X 無法繞過         | O 支援 stealth |
| 真實滑鼠操作     | - 事件派發         | O 原生 API     |
| 推薦度           | 不推薦用於滑塊驗證 | O 推薦         |

---

## 注意事項

- Geetest 可能會封禁頻繁測試的 IP，建議適度測試
- 若遇到 `60500` 錯誤，表示 IP 被暫時封禁，請等待 10-30 分鐘後重試
- 建議使用 **Playwright** 進行滑塊驗證測試

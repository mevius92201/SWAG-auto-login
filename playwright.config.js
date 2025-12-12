// @ts-check
const { defineConfig, devices } = require('@playwright/test');

module.exports = defineConfig({
  testDir: './playwright/tests',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1,
  reporter: 'html',
  
  use: {
    baseURL: 'https://swag.live',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    
    // 更長的超時時間
    actionTimeout: 30000,
    navigationTimeout: 30000,
    
    // 視窗大小
    viewport: { width: 1280, height: 720 },
    
    // 忽略 HTTPS 錯誤
    ignoreHTTPSErrors: true,
  },

  // 全局超時
  timeout: 60000,
  expect: {
    timeout: 10000,
  },

  projects: [
    {
      name: 'chromium',
      use: { 
        ...devices['Desktop Chrome'],
        // 關閉 headless 模式，使用有頭瀏覽器
        headless: false,
        // 啟動參數
        launchOptions: {
          args: [
            '--disable-blink-features=AutomationControlled',
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-accelerated-2d-canvas',
            '--no-first-run',
            '--no-zygote',
            '--disable-gpu',
          ],
        },
      },
    },
  ],
});


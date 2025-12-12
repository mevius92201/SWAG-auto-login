// @ts-check
const { test, expect } = require('@playwright/test');

// 配置
const config = {
  testUrl: 'https://swag.live',
  sliderSelector: '.geetest_btn',
  bgCanvasSelector: '.geetest_bg',
  gapCanvasSelector: '.geetest_slice_bg',
  successSelector: '.geetest_lock_success',
};

// 隨機延遲函數
const randomDelay = (min, max) => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

// 增加測試超時時間
test.setTimeout(120000);

test.describe('滑塊驗證測試 - Playwright', () => {
  
  test.beforeEach(async ({ page }) => {
    // 隱藏 WebDriver 標記
    await page.addInitScript(() => {
      Object.defineProperty(navigator, 'webdriver', {
        get: () => undefined,
      });
      Object.defineProperty(navigator, 'plugins', {
        get: () => [1, 2, 3, 4, 5],
      });
      Object.defineProperty(navigator, 'languages', {
        get: () => ['zh-TW', 'zh', 'en-US', 'en'],
      });
      window.chrome = { runtime: {} };
      const originalQuery = window.navigator.permissions.query;
      window.navigator.permissions.query = (parameters) => (
        parameters.name === 'notifications' ?
          Promise.resolve({ state: Notification.permission }) :
          originalQuery(parameters)
      );
    });
    
    // 阻止不必要的請求
    await page.route('**/*sentry.io/**', route => route.abort());
    await page.route('**/*zendesk*/**', route => route.abort());
    await page.route('**/*hotjar*/**', route => route.abort());
    await page.route('**/*analytics*/**', route => route.abort());
    await page.route('**/api.swag.live/pusher/**', route => route.abort());
    await page.route('**/api.swag.live/feed**', route => route.abort());
    await page.route('**/api.swag.live/story/**', route => route.abort());
  });

  test('智能滑塊驗證', async ({ page }) => {
    console.log('🚀 開始測試...');
    
    // 訪問頁面
    await page.goto(config.testUrl, { waitUntil: 'domcontentloaded' });
    console.log('✓ 頁面載入完成');
    
    await page.waitForTimeout(randomDelay(3000, 5000));
    
    // 點擊免費註冊登入按鈕
    const loginButton = page.locator('.LandingContent__LoginRegisterButton-sc-68dc63b-7');
    await loginButton.waitFor({ state: 'visible', timeout: 10000 });
    await page.waitForTimeout(randomDelay(500, 1000));
    await loginButton.click();
    console.log('✓ 點擊登入按鈕');
    
    await page.waitForTimeout(randomDelay(2000, 3000));
    
    // 點擊「已有帳號點此登入」
    const hasAccountButton = page.locator('.AuthenticateMethodSelect__EntryButton-sc-a44af821-20');
    await hasAccountButton.waitFor({ state: 'visible', timeout: 10000 });
    await page.waitForTimeout(randomDelay(300, 600));
    await hasAccountButton.click();
    console.log('✓ 選擇登入方式');
    
    // 切換到帳號密碼登入
    const toggleButton = page.locator('.EmailPhoneForm__MethodToggleButton-sc-b748f2b7-12');
    await toggleButton.waitFor({ state: 'visible', timeout: 10000 });
    await page.waitForTimeout(randomDelay(300, 600));
    await toggleButton.click();
    console.log('✓ 切換到帳號密碼登入');
    
    // 輸入帳號
    const usernameInput = page.locator('#username-form');
    await usernameInput.waitFor({ state: 'visible', timeout: 10000 });
    await page.waitForTimeout(randomDelay(300, 500));
    await usernameInput.click();
    await usernameInput.pressSequentially('qa_test_ying', { delay: randomDelay(50, 150) });
    console.log('✓ 輸入帳號');
    
    // 輸入密碼
    const passwordInput = page.locator('#password-form');
    await passwordInput.waitFor({ state: 'visible', timeout: 10000 });
    await page.waitForTimeout(randomDelay(300, 500));
    await passwordInput.click();
    await passwordInput.pressSequentially('qaying', { delay: randomDelay(50, 150) });
    console.log('✓ 輸入密碼');
    
    // 點擊登入按鈕
    const submitButton = page.locator('.UsernamePasswordForm__SubmitButton-sc-a1a7333c-23');
    await submitButton.waitFor({ state: 'visible', timeout: 10000 });
    await page.waitForTimeout(randomDelay(500, 1000));
    await submitButton.click();
    console.log('✓ 點擊登入');
    
    // 等待滑塊出現
    await page.waitForTimeout(3000);
    
    const slider = page.locator(config.sliderSelector);
    const bgCanvas = page.locator(config.bgCanvasSelector);
    const gapCanvas = page.locator(config.gapCanvasSelector);
    
    await slider.waitFor({ state: 'visible', timeout: 15000 });
    await bgCanvas.waitFor({ state: 'visible', timeout: 15000 });
    await gapCanvas.waitFor({ state: 'visible', timeout: 15000 });
    console.log('✓ 滑塊驗證元素出現');
    
    // 等待圖片完全加載
    await page.waitForTimeout(2000);
    
    // 注入 OpenCV
    console.log('⏳ 正在載入 OpenCV.js...');
    await page.addScriptTag({
      url: 'https://cdn.jsdelivr.net/npm/@techstark/opencv-js@4.12.0-release.1/dist/opencv.min.js'
    });
    
    // 等待 OpenCV 初始化
    await page.waitForFunction(() => {
      return window.cv && window.cv.imread;
    }, { timeout: 30000 });
    console.log('✓ OpenCV.js 載入完成');
    
    // 獲取缺口位置
    console.log('⏳ 正在偵測缺口位置...');
    const gapX = await page.evaluate(() => {
      function extractImageUrl(element) {
        const style = window.getComputedStyle(element);
        const backgroundImage = style.backgroundImage;
        const urlMatch = backgroundImage.match(/url\(['"]?(.*?)['"]?\)/);
        if (!urlMatch || !urlMatch[1]) {
          throw new Error('無法提取圖片 URL');
        }
        return urlMatch[1];
      }

      function loadImage(url) {
        return new Promise((resolve, reject) => {
          const img = new Image();
          img.crossOrigin = 'anonymous';
          img.onload = () => resolve(img);
          img.onerror = () => reject(new Error('圖片載入失敗'));
          img.src = url;
        });
      }

      return new Promise(async (resolve, reject) => {
        try {
          const bgElement = document.querySelector('.geetest_bg');
          const gapElement = document.querySelector('.geetest_slice_bg');
          
          if (!bgElement || !gapElement) {
            throw new Error('找不到背景圖片或缺口圖片元素');
          }
          
          const bgUrl = extractImageUrl(bgElement);
          const gapUrl = extractImageUrl(gapElement);
          
          const [bgImg, gapImg] = await Promise.all([
            loadImage(bgUrl),
            loadImage(gapUrl),
          ]);
          
          const src = cv.imread(bgImg);
          const template = cv.imread(gapImg);
          
          // 清除白邊
          const clearWhite = (img) => {
            const gray = new cv.Mat();
            cv.cvtColor(img, gray, cv.COLOR_RGBA2GRAY);
            const binary = new cv.Mat();
            cv.threshold(gray, binary, 250, 255, cv.THRESH_BINARY_INV);
            const rect = cv.boundingRect(binary);
            gray.delete();
            binary.delete();
            if (rect.width > 0 && rect.height > 0) {
              return img.roi(rect);
            }
            return img;
          };
          
          const templateCropped = clearWhite(template);
          
          const grayTemplate = new cv.Mat();
          const graySrc = new cv.Mat();
          cv.cvtColor(templateCropped, grayTemplate, cv.COLOR_RGBA2GRAY);
          cv.cvtColor(src, graySrc, cv.COLOR_RGBA2GRAY);
          
          const blurTemplate = new cv.Mat();
          const blurSrc = new cv.Mat();
          cv.GaussianBlur(grayTemplate, blurTemplate, new cv.Size(5, 5), 0);
          cv.GaussianBlur(graySrc, blurSrc, new cv.Size(5, 5), 0);
          
          const edgesTemplate = new cv.Mat();
          const edgesSrc = new cv.Mat();
          cv.Canny(blurTemplate, edgesTemplate, 50, 150);
          cv.Canny(blurSrc, edgesSrc, 50, 150);
          
          const kernel = cv.getStructuringElement(cv.MORPH_RECT, new cv.Size(3, 3));
          cv.morphologyEx(edgesTemplate, edgesTemplate, cv.MORPH_CLOSE, kernel);
          cv.morphologyEx(edgesSrc, edgesSrc, cv.MORPH_CLOSE, kernel);
          
          const result = new cv.Mat();
          cv.matchTemplate(edgesSrc, edgesTemplate, result, cv.TM_CCOEFF_NORMED);
          const minMax = cv.minMaxLoc(result);
          const gapX = minMax.maxLoc.x;
          
          // 清理記憶體
          src.delete();
          template.delete();
          templateCropped.delete();
          grayTemplate.delete();
          graySrc.delete();
          blurTemplate.delete();
          blurSrc.delete();
          edgesTemplate.delete();
          edgesSrc.delete();
          kernel.delete();
          result.delete();
          
          resolve(gapX);
        } catch (error) {
          reject(error);
        }
      });
    });
    
    console.log(`✓ 偵測到缺口位置: X = ${gapX}px`);
    
    // 使用 Playwright 的真實滑鼠操作
    console.log('⏳ 開始滑動滑塊...');
    
    const sliderBox = await slider.boundingBox();
    if (!sliderBox) {
      throw new Error('無法獲取滑塊位置');
    }
    
    const startX = sliderBox.x + sliderBox.width / 2;
    const startY = sliderBox.y + sliderBox.height / 2;
    const endX = startX + gapX;
    
    // 移動到滑塊位置
    await page.mouse.move(startX, startY);
    await page.waitForTimeout(randomDelay(200, 400));
    
    // 按下滑鼠
    await page.mouse.down();
    await page.waitForTimeout(randomDelay(100, 200));
    
    // 貝塞爾曲線滑動
    const steps = 50;
    const controlPoint1X = startX + (endX - startX) * (0.3 + Math.random() * 0.2);
    const controlPoint1Y = startY + (Math.random() * 20 - 10);
    const controlPoint2X = startX + (endX - startX) * (0.6 + Math.random() * 0.2);
    const controlPoint2Y = startY + (Math.random() * 20 - 10);
    
    for (let i = 1; i <= steps; i++) {
      const t = i / steps;
      const x = Math.pow(1 - t, 3) * startX +
                3 * Math.pow(1 - t, 2) * t * controlPoint1X +
                3 * (1 - t) * Math.pow(t, 2) * controlPoint2X +
                Math.pow(t, 3) * endX;
      const y = Math.pow(1 - t, 3) * startY +
                3 * Math.pow(1 - t, 2) * t * controlPoint1Y +
                3 * (1 - t) * Math.pow(t, 2) * controlPoint2Y +
                Math.pow(t, 3) * startY;
      
      await page.mouse.move(x, y);
      await page.waitForTimeout(randomDelay(15, 35));
    }
    
    // 釋放滑鼠
    await page.waitForTimeout(randomDelay(50, 100));
    await page.mouse.up();
    
    console.log('✓ 滑塊滑動完成');
    
    // 等待驗證結果
    await page.waitForTimeout(3000);
    
    // 檢查結果
    const success = await page.locator(config.successSelector).isVisible().catch(() => false);
    
    if (success) {
      console.log('🎉 滑塊驗證成功！');
    } else {
      console.log('⚠️ 驗證結果待確認，請檢查截圖');
    }
    
    // 截圖保存結果
    await page.screenshot({ path: 'playwright/screenshots/result.png', fullPage: true });
    console.log('✓ 截圖已保存');
    
    // 保持瀏覽器開啟一段時間以便觀察
    await page.waitForTimeout(5000);
  });
});

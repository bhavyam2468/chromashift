import { chromium } from 'playwright';
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  page.on('console', msg => console.log('BROWSER CONSOLE:', msg.type(), msg.text()));
  page.on('pageerror', err => console.log('BROWSER ERROR:', err.message));
  
  await page.goto('http://localhost:5175/');
  console.log("Page loaded");
  await page.waitForTimeout(2000);
  
  // Press space
  console.log("Pressing space");
  await page.keyboard.press('Space');
  await page.waitForTimeout(1000);
  
  await page.screenshot({ path: 'test-after-space.png' });
  console.log("Screenshot saved");
  
  await browser.close();
})();

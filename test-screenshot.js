import puppeteer from 'puppeteer-core';
(async () => {
  const browser = await puppeteer.launch({
    executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    headless: "new"
  });
  const page = await browser.newPage();
  page.on('console', msg => console.log('BROWSER LOG:', msg.text()));
  page.on('pageerror', err => console.log('BROWSER ERROR:', err.toString()));
  await page.goto('http://localhost:8080');
  await new Promise(r => setTimeout(r, 2000));
  await page.screenshot({ path: 'screenshot_menu.png' });
  console.log("Screenshot menu saved");
  
  // click canvas
  await page.mouse.click(200, 300);
  await new Promise(r => setTimeout(r, 1000));
  await page.screenshot({ path: 'screenshot_game1.png' });
  console.log("Screenshot game1 saved");
  
  await browser.close();
})();

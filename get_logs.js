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
  await page.click('#start-btn');
  await new Promise(r => setTimeout(r, 2000));
  await browser.close();
})();

import puppeteer from 'puppeteer-core';
(async () => {
  const browser = await puppeteer.launch({
    executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    headless: "new"
  });
  const page = await browser.newPage();
  page.on('console', msg => console.log('BROWSER LOG:', msg.text()));
  await page.goto('http://localhost:8080');
  await new Promise(r => setTimeout(r, 1000));
  
  // check DOM
  let isHidden = await page.$eval('#menu-scene', el => el.classList.contains('hidden'));
  console.log("Menu hidden before click?", isHidden);
  
  await page.mouse.click(200, 300);
  await new Promise(r => setTimeout(r, 1000));
  
  isHidden = await page.$eval('#menu-scene', el => el.classList.contains('hidden'));
  console.log("Menu hidden after click?", isHidden);
  
  let towerLength = await page.evaluate(() => window.gameEngine?.towerManager?.tower?.length || -1);
  console.log("Tower length from evaluate:", towerLength);
  
  let hudHidden = await page.$eval('#hud', el => el.classList.contains('hidden'));
  console.log("HUD hidden after click?", hudHidden);
  
  await browser.close();
})();

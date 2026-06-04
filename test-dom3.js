import puppeteer from 'puppeteer-core';
(async () => {
  const browser = await puppeteer.launch({
    executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    headless: "new"
  });
  const page = await browser.newPage();
  
  await page.goto('http://localhost:8080');
  await new Promise(r => setTimeout(r, 1000));
  
  console.log("Clicking menu...");
  await page.mouse.click(200, 300); // Start game
  await new Promise(r => setTimeout(r, 1000));
  
  console.log("Clicking to place block 1...");
  await page.mouse.click(200, 300); 
  await new Promise(r => setTimeout(r, 1000));
  let score1 = await page.$eval('#score', el => el.textContent);
  console.log("Score after block 1:", score1);
  
  console.log("Clicking to place block 2...");
  await page.mouse.click(200, 300); 
  await new Promise(r => setTimeout(r, 1000));
  let score2 = await page.$eval('#score', el => el.textContent);
  console.log("Score after block 2:", score2);
  
  console.log("Clicking to place block 3...");
  await page.mouse.click(200, 300); 
  await new Promise(r => setTimeout(r, 1000));
  let score3 = await page.$eval('#score', el => el.textContent);
  console.log("Score after block 3:", score3);
  
  let gameOverHidden = await page.$eval('#game-over-scene', el => el.classList.contains('hidden'));
  console.log("Game over scene hidden?", gameOverHidden);
  
  await browser.close();
})();

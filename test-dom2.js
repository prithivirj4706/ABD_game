import puppeteer from 'puppeteer-core';
(async () => {
  const browser = await puppeteer.launch({
    executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    headless: "new"
  });
  const page = await browser.newPage();
  
  // Set up a way to capture the engine
  await page.evaluateOnNewDocument(() => {
    window.addEventListener('game:start', () => {
      console.log("Game started! Exposing engine via hack");
    });
  });
  
  page.on('console', msg => {
    if (!msg.text().includes('Renderer cameraY') && !msg.text().includes('ERR_CONNECTION_REFUSED')) {
      console.log('BROWSER LOG:', msg.text());
    }
  });
  
  await page.goto('http://localhost:8080');
  await new Promise(r => setTimeout(r, 1000));
  
  // Expose the engine
  await page.evaluate(() => {
    window.gameEngine = document.getElementById('game-canvas').__engine; 
    // wait, I don't have access to engine easily. I'll just click.
  });
  
  console.log("Clicking menu...");
  await page.mouse.click(200, 300); // Start game
  await new Promise(r => setTimeout(r, 1000)); // wait for block to move
  
  console.log("Clicking canvas to place first block...");
  await page.mouse.click(200, 300); // Place first block
  await new Promise(r => setTimeout(r, 500));
  
  let score = await page.$eval('#score', el => el.textContent);
  console.log("Score after place:", score);
  
  let gameOverHidden = await page.$eval('#game-over-scene', el => el.classList.contains('hidden'));
  console.log("Game over scene hidden?", gameOverHidden);
  
  await browser.close();
})();

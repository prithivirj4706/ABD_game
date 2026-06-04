export class GameOverScene {
  constructor(engine) {
    this.engine = engine;
    this.container = document.getElementById('game-over-scene');
    this.finalScoreElement = document.getElementById('final-score');
    
    this.container.addEventListener('click', () => {
      this.hide();
      this.engine.stateManager.transition('MENU');
    });
    
    window.addEventListener('game:gameover', () => {
      this.show();
      this.animateScore(this.engine.gameState.score);
    });
  }
  
  animateScore(targetScore) {
    let startTime = null;
    const duration = 1500;
    
    const step = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      
      // Use cubic ease out
      const easeProgress = 1 - Math.pow(1 - progress, 3);
      const currentScore = Math.floor(easeProgress * targetScore);
      
      this.finalScoreElement.textContent = currentScore;
      
      if (progress < 1) {
        requestAnimationFrame(step);
      } else {
        this.finalScoreElement.textContent = targetScore;
      }
    };
    
    requestAnimationFrame(step);
  }
  
  show() {
    this.container.classList.remove('hidden');
  }
  
  hide() {
    this.container.classList.add('hidden');
  }
}

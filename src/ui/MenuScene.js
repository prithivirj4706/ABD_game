export class MenuScene {
  constructor(engine) {
    this.engine = engine;
    this.container = document.getElementById('menu-scene');
    
    // Allow tapping the menu scene itself to start the game
    this.container.addEventListener('click', () => {
      this.engine.handleAction(0, 0);
    });
    
    // Engine handles taps anywhere on canvas to start the game
    window.addEventListener('game:start', () => this.hide());
    
    // Listen to state manager to show menu properly instead of overlapping gameover
    this.engine.stateManager.on('enter:MENU', () => this.show());
  }
  
  show() {
    this.container.classList.remove('hidden');
    document.getElementById('top-icons').classList.remove('hidden');
  }
  
  hide() {
    this.container.classList.add('hidden');
    document.getElementById('top-icons').classList.add('hidden');
  }
}

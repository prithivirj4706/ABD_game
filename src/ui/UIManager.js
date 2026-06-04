import { firebaseManager } from '../backend/FirebaseManager.js';

export class UIManager {
  constructor(engine) {
    this.engine = engine;
    this.gameState = engine.gameState;
    this.scoreElement = document.getElementById('score');
    this.bestScoreElement = document.getElementById('best-score');
    this.modeElement = document.getElementById('mode-indicator');
    
    // Bind UI elements
    this.initModals();

    // Listen for custom events to update UI
    window.addEventListener('game:score', () => this.updateScore());
    window.addEventListener('game:mode', (e) => this.updateMode(e.detail));
    window.addEventListener('game:perfect', () => this.createFloatingText('PERFECT!', false));
    window.addEventListener('game:purged', () => this.createFloatingText('PURGED!', true));
    window.addEventListener('game:perfect_purge', () => this.createFloatingText('PERFECT PURGE! +1000', true));
    window.addEventListener('game:warning', (e) => this.createFloatingText(e.detail, true));
  }

  initModals() {
    const btnSettings = document.getElementById('btn-settings');
    const btnLeaderboard = document.getElementById('btn-leaderboard');
    const modalSettings = document.getElementById('settings-modal');
    const modalLeaderboard = document.getElementById('leaderboard-modal');
    const closeSettings = document.getElementById('close-settings');
    const closeLeaderboard = document.getElementById('close-leaderboard');
    const volumeSlider = document.getElementById('volume-slider');

    if (btnSettings) {
      btnSettings.addEventListener('click', () => {
        // Initialize slider value
        volumeSlider.value = this.engine.audio.volume;
        modalSettings.classList.remove('hidden');
      });
    }

    if (closeSettings) {
      closeSettings.addEventListener('click', () => {
        modalSettings.classList.add('hidden');
      });
    }

    if (volumeSlider) {
      volumeSlider.addEventListener('input', (e) => {
        const vol = parseFloat(e.target.value);
        this.engine.audio.setVolume(vol);
        this.engine.gameState.settings.volume = vol;
        this.engine.gameState.saveProgress();
      });
    }

    if (btnLeaderboard) {
      btnLeaderboard.addEventListener('click', () => {
        modalLeaderboard.classList.remove('hidden');
        this.loadLeaderboard();
      });
    }

    if (closeLeaderboard) {
      closeLeaderboard.addEventListener('click', () => {
        modalLeaderboard.classList.add('hidden');
      });
    }
  }

  async loadLeaderboard() {
    const listEl = document.getElementById('leaderboard-list');
    listEl.innerHTML = '<div class="loading">Fetching data...</div>';
    
    try {
      const topScores = await firebaseManager.getTopScores();
      listEl.innerHTML = '';
      
      if (topScores.length === 0) {
        listEl.innerHTML = '<div class="loading">No scores yet.</div>';
        return;
      }
      
      topScores.forEach(entry => {
        const div = document.createElement('div');
        div.className = 'leaderboard-entry';
        
        const nameEl = document.createElement('span');
        nameEl.className = 'leaderboard-name';
        nameEl.textContent = entry.displayName || 'Unknown';
        if (entry.uid === firebaseManager.uid) {
          nameEl.textContent += ' (You)';
          nameEl.style.color = '#FF4500';
        }
        
        const scoreEl = document.createElement('span');
        scoreEl.className = 'leaderboard-score';
        scoreEl.textContent = entry.score;
        
        div.appendChild(nameEl);
        div.appendChild(scoreEl);
        listEl.appendChild(div);
      });
    } catch (e) {
      listEl.innerHTML = '<div class="loading">Error loading scores</div>';
      console.error(e);
    }
  }

  updateScore() {
    if (this.scoreElement) {
      this.scoreElement.textContent = this.gameState.score;
      this.scoreElement.classList.remove('pop');
      void this.scoreElement.offsetWidth; // trigger reflow
      this.scoreElement.classList.add('pop');
      
      // Emit star particles for score increase
      for (let i = 0; i < 15; i++) {
        this.createStar();
      }
    }
  }

  createStar() {
    const el = document.createElement('div');
    el.classList.add('star');
    el.style.left = `${Math.random() * 100}%`;
    el.style.top = `${Math.random() * 100}%`;
    
    const size = Math.random() * 2 + 1;
    el.style.width = `${size}px`;
    el.style.height = `${size}px`;
    
    document.getElementById('ui-layer').appendChild(el);
    
    setTimeout(() => {
      if (el.parentNode) el.remove();
    }, 1500);
  }

  updateMode(mode) {
    if (this.modeElement) {
      this.modeElement.textContent = mode === 'PURGE' ? 'PURGE PROTOCOL' : '';
      if (mode === 'PURGE') {
        this.modeElement.classList.add('visible', 'text-red');
      } else {
        this.modeElement.classList.remove('visible', 'text-red');
      }
    }
  }

  createFloatingText(text, isPurged) {
    const el = document.createElement('div');
    el.classList.add('floating-text');
    if (isPurged) el.classList.add('purged');
    el.textContent = text;
    
    // Randomize position slightly near the center
    const rx = (Math.random() - 0.5) * 100;
    const ry = (Math.random() - 0.5) * 50;
    
    el.style.left = `calc(50% + ${rx}px)`;
    el.style.top = `calc(50% - 100px + ${ry}px)`;
    
    document.getElementById('ui-layer').appendChild(el);
    
    // Remove after animation (1s)
    setTimeout(() => {
      el.remove();
    }, 1000);
  }
}

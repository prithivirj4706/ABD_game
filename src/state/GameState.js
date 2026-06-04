import { Storage } from '../utils/Storage.js';

export class GameState {
  constructor() {
    const stats = Storage.loadStats();
    const settings = Storage.loadSettings();
    this.score = 0;
    this.bestScore = stats.bestScore;
    this.placementCount = 0;
    this.comboCount = 0; // consecutive perfects
    this.highestCombo = 0; // tracking for stats
    this.infectedIndices = new Set(); // tower block indices that are infected
    this.currentPurgeMisses = 0;
    this.corruptedIndices = new Set(); // blocks corruption has spread to
    this.difficulty = 0; // 0 to 1
    this.gameOver = false;
    this.isPurgeMode = false;
    this.stats = stats;
    this.settings = settings;
  }
  
  reset() {
    this.score = 0;
    this.placementCount = 0;
    this.comboCount = 0;
    this.highestCombo = 0;
    this.infectedIndices.clear();
    this.currentPurgeMisses = 0;
    this.corruptedIndices.clear();
    this.difficulty = 0;
    this.gameOver = false;
    this.isPurgeMode = false;
  }
  
  addScore(points) {
    this.score += points;
    if (this.score > this.bestScore) {
      this.bestScore = this.score;
    }
  }
  
  saveProgress() {
    this.stats.bestScore = this.bestScore;
    if (this.highestCombo > this.stats.highestCombo) {
      this.stats.highestCombo = this.highestCombo;
    }
    Storage.saveStats(this.stats);
    Storage.saveSettings(this.settings);
  }
}

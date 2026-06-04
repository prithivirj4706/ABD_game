import { DIFFICULTY, BLOCK, INFECTION } from '../core/Constants.js';
import { clamp } from '../utils/MathUtils.js';

/**
 * Continuous difficulty scaling based on score with logarithmic curve.
 */
export class DifficultyManager {
  /**
   * @param {import('../state/GameState.js').GameState} gameState
   */
  constructor(gameState) {
    this.gameState = gameState;
  }

  /**
   * Recalculate difficulty (0 → 1) from the current score.
   * Logarithmic curve: rises quickly at first, then plateaus.
   */
  update() {
    const score = this.gameState.score;
    this.gameState.difficulty = clamp(
      Math.log(1 + score * 0.01) / Math.log(1 + 5000 * 0.01),
      0,
      1
    );
  }

  /** Current block movement speed (px / s). */
  getBlockSpeed() {
    const multiplier =
      1 + this.gameState.difficulty * (DIFFICULTY.MAX_SPEED_MULTIPLIER - 1);
    return BLOCK.BASE_SPEED * multiplier;
  }

  /** Number of placements between infection events. */
  getInfectionThreshold() {
    return Math.max(
      DIFFICULTY.MIN_INFECTION_THRESHOLD,
      Math.floor(INFECTION.INITIAL_THRESHOLD * (1 - this.gameState.difficulty * 0.5))
    );
  }

  /** Corruption spread interval in milliseconds. */
  getSpreadInterval() {
    return Math.max(
      INFECTION.MIN_SPREAD_INTERVAL,
      INFECTION.SPREAD_BASE_INTERVAL * (1 - this.gameState.difficulty * 0.6)
    );
  }

  reset() {
    this.gameState.difficulty = 0;
  }
}

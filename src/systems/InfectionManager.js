import { BLOCK, INFECTION, SCORING } from '../core/Constants.js';
import { randomInt } from '../utils/MathUtils.js';

/**
 * Infection events, corruption spread, and purge-mode block removal.
 */
export class InfectionManager {
  /**
   * @param {import('../state/GameState.js').GameState} gameState
   * @param {import('./TowerManager.js').TowerManager} towerManager
   * @param {import('./ParticleSystem.js').ParticleSystem} particleSystem
   */
  constructor(gameState, towerManager, particleSystem) {
    this.gameState = gameState;
    this.towerManager = towerManager;
    this.particleSystem = particleSystem;
    this.spreadTimer = 0;
    this.spreadInterval = INFECTION.SPREAD_BASE_INTERVAL;
    this.spreading = false;
    this.nextInfectionTarget = undefined;
  }

  /* ── Infection trigger ─────────────────────────────────────── */

  calculateNextInfectionTarget() {
    const baseThreshold = Math.max(
      INFECTION.MIN_THRESHOLD,
      Math.floor(INFECTION.INITIAL_THRESHOLD * (1 - this.gameState.difficulty * 0.5))
    );
    
    // Add randomized offset (e.g. 0 to 3) to make timing unpredictable
    const offset = Math.floor(Math.random() * 4);
    this.nextInfectionTarget = Math.max(this.gameState.placementCount, 0) + baseThreshold + offset;
  }

  /**
   * Should a new infection event fire right now?
   * @returns {boolean}
   */
  shouldInfect() {
    if (this.nextInfectionTarget === undefined) {
      this.calculateNextInfectionTarget();
    }

    if (
      this.gameState.placementCount > 0 &&
      this.gameState.placementCount >= this.nextInfectionTarget &&
      this.gameState.infectedIndices.size === 0 // Enforce single-infection-at-a-time constraint
    ) {
      this.calculateNextInfectionTarget();
      return true;
    }

    return false;
  }

  /**
   * Infect random tower blocks.
   * @returns {number[]} Indices of newly-infected blocks.
   */
  infectBlocks() {
    const tower = this.towerManager.tower;
    if (tower.length <= 1) return [];

    const infected = [];
    const count = INFECTION.INFECTION_COUNT;

    // Eligible: skip base (0) and the two most recent blocks
    const availableIndices = [];
    for (let i = 1; i < tower.length - 2; i++) {
      if (!this.gameState.infectedIndices.has(i)) {
        availableIndices.push(i);
      }
    }

    for (let n = 0; n < count && availableIndices.length > 0; n++) {
      const randIdx = randomInt(0, availableIndices.length - 1);
      const blockIdx = availableIndices.splice(randIdx, 1)[0];
      const block = tower.getBlock(blockIdx);
      block.infected = true;
      this.gameState.infectedIndices.add(blockIdx);
      infected.push(blockIdx);

      // Visual feedback
      this.particleSystem.emitInfection(
        block.centerX,
        block.y + BLOCK.HEIGHT / 2,
        block.centerZ,
        block.width,
        block.depth
      );
    }

    return infected;
  }

  /* ── Corruption spread (purge mode) ────────────────────────── */

  startSpread() {
    this.spreading = true;
    this.spreadTimer = 0;
    this.spreadInterval = Math.max(
      INFECTION.MIN_SPREAD_INTERVAL,
      INFECTION.SPREAD_BASE_INTERVAL * (1 - this.gameState.difficulty * 0.5)
    );
  }

  stopSpread() {
    this.spreading = false;
    this.spreadTimer = 0;
  }

  /**
   * Called every frame during purge mode.
   * @param {number} dt  Seconds.
   */
  update(dt) {
    if (!this.spreading) return;

    this.spreadTimer += dt * 1000; // → ms
    if (this.spreadTimer >= this.spreadInterval) {
      this.spreadTimer = 0;
      this.spreadCorruption();
    }
  }

  /**
   * Expand corruption to blocks adjacent (upward) to already-infected / corrupted ones.
   */
  spreadCorruption() {
    const tower = this.towerManager.tower;
    const newCorrupted = new Set();

    const allInfected = new Set([
      ...this.gameState.infectedIndices,
      ...this.gameState.corruptedIndices,
    ]);

    for (const idx of allInfected) {
      const spreadIdx = idx + 1;
      if (
        spreadIdx < tower.length &&
        !this.gameState.infectedIndices.has(spreadIdx) &&
        !this.gameState.corruptedIndices.has(spreadIdx)
      ) {
        newCorrupted.add(spreadIdx);
      }
    }

    for (const idx of newCorrupted) {
      this.gameState.corruptedIndices.add(idx);
      const block = tower.getBlock(idx);
      if (block) {
        block.corrupted = true;
        this.particleSystem.emitCorruption(
          block.centerX,
          block.y + block.height / 2,
          block.centerZ
        );
      }
    }
  }

  /* ── Block removal (purge mode) ────────────────────────────── */

  /**
   * Remove the bottom-most block from the tower.
   * @param {number} index  Must be 0 (bottom block).
   * @returns {{ success: boolean, wasInfected: boolean, score: number }}
   */
  removeBlock(index) {
    const tower = this.towerManager.tower;
    const block = tower.getBlock(index);
    if (!block) return { success: false, wasInfected: false, score: 0 };

    // Only the topmost block (visually the bottom of the pyramid in Purge Mode) can be removed
    if (index !== tower.length - 1) {
      return { success: false, wasInfected: false, score: 0 };
    }

    const wasInfected = block.infected;
    const score = wasInfected ? SCORING.INFECTED_REMOVAL : SCORING.SAFE_REMOVAL;

    // Remove from tracking sets (if it was infected/corrupted)
    this.gameState.infectedIndices.delete(index);
    this.gameState.corruptedIndices.delete(index);

    // No need to shift indices down because we are removing from the end of the array


    // Particles
    if (wasInfected) {
      this.particleSystem.emitPurge(
        block.centerX,
        block.y + block.height / 2,
        block.centerZ,
        block.width,
        block.depth
      );
    } else {
      this.particleSystem.emitPlacement(
        block.centerX,
        block.y + block.height / 2,
        block.centerZ
      );
    }

    // Actually remove from the tower structure
    block.triggerRemoval();
    this.towerManager.deadBlocks.push(block);
    tower.removeBlock(index);

    this.gameState.addScore(score);
    return { success: true, wasInfected, score };
  }

  /* ── Queries ───────────────────────────────────────────────── */

  /** Have all infected blocks been cleared? */
  isPurgeComplete() {
    return this.gameState.infectedIndices.size === 0;
  }

  /** Has corruption reached the top block? (game over) */
  isCorruptionAtTop() {
    const tower = this.towerManager.tower;
    if (tower.length === 0) return false;
    return this.gameState.corruptedIndices.has(tower.length - 1);
  }

  /* ── Cleanup ───────────────────────────────────────────────── */

  clearInfection() {
    const tower = this.towerManager.tower;
    for (const block of tower.blocks) {
      block.infected = false;
      block.corrupted = false;
    }
    this.gameState.infectedIndices.clear();
    this.gameState.corruptedIndices.clear();
    this.spreading = false;
    this.spreadTimer = 0;
  }

  reset() {
    this.clearInfection();
    this.nextInfectionTarget = undefined;
  }
}

import { Block } from '../entities/Block.js';
import { Tower } from '../entities/Tower.js';
import { CollisionSystem } from './CollisionSystem.js';
import { BLOCK, GAME, SCORING } from '../core/Constants.js';

export class TowerManager {
  constructor(gameState, physicsSystem, particleSystem) {
    this.gameState = gameState;
    this.physicsSystem = physicsSystem;
    this.particleSystem = particleSystem;
    this.tower = new Tower();
    this.currentBlock = null;
    this.deadBlocks = [];
    this.baseY = 0;
    this.colorIndex = 0;
  }

  init() {
    this.baseY = GAME.HEIGHT - BLOCK.HEIGHT * 2;

    // Center base at 0, 0 in iso space
    const base = new Block(
      -BLOCK.START_WIDTH / 2, 
      this.baseY, 
      -BLOCK.START_DEPTH / 2,
      BLOCK.START_WIDTH,
      BLOCK.HEIGHT,
      BLOCK.START_DEPTH,
      BLOCK.COLORS_STACK[0]
    );
    base.settled = true;
    this.tower.addBlock(base);
    this.spawnNextBlock();
  }

  startStackMode() {
    if (this.tower.length === 0) {
      this.init();
    } else {
      this.spawnNextBlock();
    }
  }

  spawnNextBlock() {
    const top = this.tower.getTopBlock();
    this.colorIndex = (this.colorIndex + 1) % 10;
    const isPurge = this.gameState.isPurgeMode;
    const colors = isPurge ? BLOCK.COLORS_PURGE : BLOCK.COLORS_STACK;
    const color = colors[this.colorIndex % colors.length];

    const isXAxis = this.tower.length % 2 === 0;
    const blockY = this.baseY - this.tower.length * BLOCK.HEIGHT;

    // Start far off screen dynamically based on window width
    const spawnDistance = Math.max(300, window.innerWidth * 0.8); 

    let startX = top.x;
    let startZ = top.z;
    
    if (isXAxis) {
      startX = -spawnDistance;
    } else {
      startZ = -spawnDistance;
    }

    this.currentBlock = new Block(startX, blockY, startZ, top.width, BLOCK.HEIGHT, top.depth, color);
    this.currentBlock.moving = true;
    this.currentBlock.axis = isXAxis ? 'x' : 'z';
    this.currentBlock.direction = 1;

    const speedMultiplier = 1 + this.gameState.difficulty * 2;
    this.currentBlock.speed = BLOCK.BASE_SPEED * speedMultiplier;
  }

  placeBlock() {
    if (!this.currentBlock || !this.currentBlock.moving) {
      return { success: false, isPerfect: false, isGameOver: false, score: 0 };
    }

    const topBlock = this.tower.getTopBlock();
    const result = CollisionSystem.calculateOverlap(this.currentBlock, topBlock);

    if (result.isGameOver) {
      return { success: false, isPerfect: false, isGameOver: true, score: 0 };
    }

    let score = SCORING.PLACEMENT;

    if (result.isPerfect) {
      this.currentBlock.x = topBlock.x;
      this.currentBlock.z = topBlock.z;
      this.currentBlock.width = topBlock.width;
      this.currentBlock.depth = topBlock.depth;
      this.gameState.comboCount++;
      if (this.gameState.comboCount > this.gameState.highestCombo) {
        this.gameState.highestCombo = this.gameState.comboCount;
      }
      score = SCORING.PERFECT;
      if (this.gameState.comboCount > 1) {
        score = Math.floor(score * (1 + (this.gameState.comboCount - 1) * 0.5));
      }
      this.currentBlock.triggerSquash();
      this.currentBlock.triggerPerfectPulse();
      this.particleSystem.emitPerfect(this.currentBlock.centerX, this.currentBlock.y, this.currentBlock.centerZ);
    } else {
      this.gameState.comboCount = 0;

      if (result.cutSize > 0.5) {
        // Spawn falling piece
        this.physicsSystem.addFallingPiece(
          result.cutX,
          this.currentBlock.y,
          result.cutZ,
          result.cutWidth,
          BLOCK.HEIGHT,
          result.cutDepth,
          this.currentBlock.color,
          this.currentBlock.axis === 'x' ? result.cutDirection : 0, // x velocity
          this.currentBlock.axis === 'z' ? result.cutDirection : 0  // z velocity
        );
      }

      this.currentBlock.x = result.overlapX;
      this.currentBlock.z = result.overlapZ;
      this.currentBlock.width = result.overlapWidth;
      this.currentBlock.depth = result.overlapDepth;

      this.currentBlock.triggerSquash();
      this.particleSystem.emitPlacement(this.currentBlock.centerX, this.currentBlock.y, this.currentBlock.centerZ);
    }

    this.currentBlock.moving = false;
    this.currentBlock.settled = true;
    this.tower.addBlock(this.currentBlock);

    this.gameState.placementCount++;
    this.gameState.stats.totalBlocksPlaced++;
    this.gameState.addScore(score);

    // FIX: Spawn next block
    this.spawnNextBlock();

    return { success: true, isPerfect: result.isPerfect, isGameOver: false, score };
  }

  getCameraY() {
    const towerTopY = this.baseY - this.tower.length * BLOCK.HEIGHT;
    const targetCameraY = Math.min(0, -(towerTopY - GAME.HEIGHT * 0.6));
    return targetCameraY;
  }

  getBlockAtPosition(worldX, worldY) {
    const cos = Math.cos(Math.PI / 6);
    const sin = Math.sin(Math.PI / 6);

    for (let i = this.tower.length - 1; i >= 0; i--) {
      const block = this.tower.getBlock(i);
      const proj = block.project(block.centerX, block.y - block.height/2, block.centerZ);
      
      const dx = worldX - proj.screenX;
      const dy = worldY - proj.screenY;

      // Inverse isometric projection to find local offset
      const localX = (dx / cos + dy / sin) / 2;
      const localZ = (dy / sin - dx / cos) / 2;
      
      // Add a small padding (e.g., 10 units) for easier tapping on mobile
      const padding = 10;
      if (Math.abs(localX) <= (block.width / 2) + padding && 
          Math.abs(localZ) <= (block.depth / 2) + padding) {
        return i;
      }
    }
    return -1;
  }

  update(dt) {
    if (this.currentBlock && this.currentBlock.moving) {
      this.currentBlock.update(dt, GAME.WIDTH);
    }

    const now = performance.now();
    for (const block of this.tower.blocks) {
      if (block.infected || block.corrupted) {
        block.glowIntensity = 0.5 + 0.5 * Math.sin(now * 0.004);
      }
      block.update(dt, GAME.WIDTH); // Ensure squash/pulse animate
    }

    for (let i = this.deadBlocks.length - 1; i >= 0; i--) {
      const b = this.deadBlocks[i];
      b.update(dt, GAME.WIDTH);
      if (b.removalTimer <= 0) {
        this.deadBlocks.splice(i, 1);
      }
    }
  }

  render(ctx) {
    for (const block of this.tower.blocks) {
      block.render(ctx);
    }
    for (const block of this.deadBlocks) {
      block.render(ctx);
    }
    if (this.currentBlock && this.currentBlock.moving) {
      this.currentBlock.render(ctx);
    }
  }

  reset() {
    this.tower.reset();
    this.currentBlock = null;
    this.deadBlocks = [];
    this.colorIndex = 0;
  }
}

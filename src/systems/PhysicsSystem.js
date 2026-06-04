import { BLOCK, GAME } from '../core/Constants.js';
import { Block } from '../entities/Block.js';

export class PhysicsSystem {
  constructor() {
    this.fallingPieces = [];
  }

  addFallingPiece(x, y, z, width, height, depth, color, dirX, dirZ) {
    // We create a full Block to reuse the isometric rendering logic
    const block = new Block(x, y, z, width, height, depth, color);
    
    this.fallingPieces.push({
      block,
      vx: dirX * 50,
      vy: 0,
      vz: dirZ * 50,
      alpha: 1,
    });
  }

  update(dt) {
    for (let i = this.fallingPieces.length - 1; i >= 0; i--) {
      const p = this.fallingPieces[i];

      // Gravity
      p.vy += BLOCK.GRAVITY * dt;

      // Position
      p.block.x += p.vx * dt;
      p.block.y += p.vy * dt;
      p.block.z += p.vz * dt;

      // Fade out
      p.alpha -= 0.5 * dt;
      p.block.alpha = p.alpha;

      if (p.alpha <= 0 || p.block.y > GAME.HEIGHT + 200) {
        this.fallingPieces.splice(i, 1);
      }
    }
  }

  render(ctx) {
    for (const p of this.fallingPieces) {
      p.block.render(ctx);
    }
  }

  reset() {
    this.fallingPieces = [];
  }
}

import { ObjectPool } from '../utils/ObjectPool.js';
import { Particle } from '../entities/Particle.js';
import { randomRange } from '../utils/MathUtils.js';
import { PARTICLES } from '../core/Constants.js';

export class ParticleSystem {
  constructor() {
    this.pool = new ObjectPool(
      () => new Particle(),
      (p) => p.reset(),
      PARTICLES.POOL_SIZE
    );
    this.active = [];
  }

  emit(x, y, z, count, colors, options = {}) {
    const {
      speedMin = 50,
      speedMax = 200,
      lifeMin = 0.3,
      lifeMax = 1.0,
      sizeMin = 2,
      sizeMax = 6,
      angleMin = 0,
      angleMax = Math.PI * 2,
    } = options;

    const colorsArray = Array.isArray(colors) ? colors : [colors];

    for (let i = 0; i < count; i++) {
      const particle = this.pool.acquire();
      if (!particle) break;

      const angle = randomRange(angleMin, angleMax);
      const angleY = randomRange(-Math.PI/4, Math.PI/4); // spread vertically somewhat
      const speed = randomRange(speedMin, speedMax);
      
      const vx = Math.cos(angle) * Math.cos(angleY) * speed;
      const vz = Math.sin(angle) * Math.cos(angleY) * speed;
      const vy = Math.sin(angleY) * speed - 50; // default upward bias

      const color = colorsArray[Math.floor(Math.random() * colorsArray.length)];
      const life = randomRange(lifeMin, lifeMax);
      const size = randomRange(sizeMin, sizeMax);

      particle.init(x, y, z, vx, vy, vz, color, life, size);
      this.active.push(particle);
    }
  }

  emitPlacement(x, y, z) {
    this.emit(x, y, z, PARTICLES.PLACEMENT_COUNT, ['#4fc3f7', '#81d4fa', '#e1f5fe', '#ffffff'], {
      speedMin: 60,
      speedMax: 180,
      lifeMin: 0.2,
      lifeMax: 0.6,
      sizeMin: 2,
      sizeMax: 5,
    });
  }

  emitPerfect(x, y, z) {
    this.emit(x, y, z, PARTICLES.PERFECT_COUNT, ['#FFD700', '#FFA500', '#FF8C00', '#FFECB3', '#ffffff'], {
      speedMin: 80,
      speedMax: 260,
      lifeMin: 0.4,
      lifeMax: 1.0,
      sizeMin: 3,
      sizeMax: 8,
    });
  }

  emitCorruption(x, y, z) {
    this.emit(x, y, z, PARTICLES.CORRUPTION_COUNT, ['#9B30FF', '#FF0050', '#7B1FA2', '#CE93D8'], {
      speedMin: 15,
      speedMax: 60,
      lifeMin: 0.8,
      lifeMax: 1.8,
      sizeMin: 3,
      sizeMax: 7,
    });
  }

  emitPurge(x, y, z, width, depth) {
    const hw = (width || 100) / 2;
    const hd = (depth || 100) / 2;
    for (let i = 0; i < PARTICLES.PURGE_COUNT; i++) {
      const px = x + randomRange(-hw, hw);
      const pz = z + randomRange(-hd, hd);
      this.emit(px, y, pz, 1, ['#00E676', '#69F0AE', '#B9F6CA', '#ffffff'], {
        speedMin: 70,
        speedMax: 220,
        lifeMin: 0.3,
        lifeMax: 0.9,
        sizeMin: 2,
        sizeMax: 6,
      });
    }
  }

  emitInfection(x, y, z, width, depth) {
    const hw = (width || 100) / 2;
    const hd = (depth || 100) / 2;
    const count = 15;
    for (let i = 0; i < count; i++) {
      const px = x + randomRange(-hw, hw);
      const pz = z + randomRange(-hd, hd);
      this.emit(px, y, pz, 1, ['#9B30FF', '#FF0050', '#D500F9', '#E040FB', '#FF1744'], {
        speedMin: 40,
        speedMax: 160,
        lifeMin: 0.4,
        lifeMax: 1.2,
        sizeMin: 3,
        sizeMax: 7,
      });
    }
  }

  emitDebris(x, y, z, width, depth, color) {
    const hw = (width || 100) / 2;
    const hd = (depth || 100) / 2;
    for (let i = 0; i < 20; i++) {
      const px = x + randomRange(-hw, hw);
      const pz = z + randomRange(-hd, hd);
      this.emit(px, y, pz, 1, [color, '#FFFFFF', '#AAAAAA'], {
        speedMin: 50,
        speedMax: 300,
        lifeMin: 0.5,
        lifeMax: 2.0,
        sizeMin: 2,
        sizeMax: 8,
      });
    }
  }

  update(dt) {
    for (let i = this.active.length - 1; i >= 0; i--) {
      const p = this.active[i];
      p.update(dt);
      if (p.isDead) {
        this.pool.release(p);
        this.active.splice(i, 1);
      }
    }
  }

  render(ctx) {
    for (const p of this.active) {
      p.render(ctx);
    }
  }

  reset() {
    this.pool.releaseAll();
    this.active = [];
  }
}

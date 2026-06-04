import { PARTICLES } from '../core/Constants.js';

export class Particle {
  constructor() {
    this.reset();
  }
  
  init(x, y, z, vx, vy, vz, color, life = 1.0, size = 4) {
    this.x = x;
    this.y = y;
    this.z = z;
    this.vx = vx;
    this.vy = vy;
    this.vz = vz;
    this.color = color;
    this.life = life;
    this.maxLife = life;
    this.size = size;
    this.alpha = 1;
    this.active = true;
  }
  
  update(dt) {
    if (!this.active) return;
    
    this.x += this.vx * dt;
    this.y += this.vy * dt;
    this.z += this.vz * dt;
    this.vy += PARTICLES.GRAVITY * dt;
    
    this.life -= dt;
    if (this.life <= 0) {
      this.active = false;
      this.life = 0;
    }
    this.alpha = this.life / this.maxLife;
  }
  
  // 3D to 2D projection
  project(x, y, z) {
    const angle = Math.PI / 6; // 30 degrees
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    return {
      screenX: (x - z) * cos,
      screenY: y + (x + z) * sin
    };
  }

  render(ctx) {
    if (!this.active) return;
    ctx.save();
    ctx.globalAlpha = this.alpha;
    ctx.fillStyle = this.color;
    ctx.beginPath();
    const currentSize = this.size * (this.life / this.maxLife);
    const proj = this.project(this.x, this.y, this.z);
    ctx.arc(proj.screenX, proj.screenY, currentSize, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
  
  get isDead() {
    return !this.active || this.life <= 0;
  }
  
  reset() {
    this.x = 0;
    this.y = 0;
    this.z = 0;
    this.vx = 0;
    this.vy = 0;
    this.vz = 0;
    this.color = '#FFFFFF';
    this.life = 0;
    this.maxLife = 1;
    this.size = 1;
    this.alpha = 1;
    this.active = false;
  }
}

import { COLORS, PARTICLES } from '../core/Constants.js';
import { randomRange } from '../utils/MathUtils.js';

export class CorruptionEffect {
  constructor() {
    this.reset();
  }
  
  attach(block) {
    this.x = block.x;
    this.y = block.y;
    this.width = block.width;
    this.height = block.height;
    this.active = true;
  }
  
  update(dt) {
    if (!this.active) return;
    
    this.time += dt;
    this.intensity = 0.5 + 0.5 * Math.sin(this.time * 3);
    this.particleTimer -= dt;
  }
  
  render(ctx) {
    if (!this.active) return;
    
    ctx.save();
    
    // Purple semi-transparent fill
    ctx.fillStyle = `rgba(155, 48, 255, ${0.4 * this.intensity})`;
    ctx.fillRect(this.x, this.y, this.width, this.height);
    
    // Animated scan lines
    ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
    const scanY = this.y + ((this.time * 50) % this.height);
    ctx.fillRect(this.x, scanY, this.width, 2);
    
    // Small glitch rectangles
    if (Math.random() < 0.2) {
      ctx.fillStyle = Math.random() < 0.5 ? '#9B30FF' : '#FF0050';
      const gx = this.x + Math.random() * this.width;
      const gy = this.y + Math.random() * this.height;
      const gw = 2 + Math.random() * 10;
      const gh = 1 + Math.random() * 4;
      ctx.fillRect(gx, gy, gw, gh);
    }
    
    // Pulsing border glow
    ctx.strokeStyle = `rgba(255, 0, 80, ${0.5 * this.intensity})`;
    ctx.lineWidth = 1;
    ctx.strokeRect(this.x, this.y, this.width, this.height);
    
    ctx.restore();
  }
  
  reset() {
    this.x = 0;
    this.y = 0;
    this.width = 0;
    this.height = 0;
    this.intensity = 0;
    this.time = 0;
    this.active = false;
    this.particleTimer = 0;
  }
}

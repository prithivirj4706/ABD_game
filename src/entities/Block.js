import { BLOCK } from '../core/Constants.js';

export class Block {
  constructor(x = 0, y = 0, z = 0, width = BLOCK.START_WIDTH, height = BLOCK.HEIGHT, depth = BLOCK.START_DEPTH, color = '#4A9EFF') {
    this.x = x;
    this.y = y;
    this.z = z;
    this.width = width;
    this.height = height;
    this.depth = depth;
    this.color = color;
    
    this.infected = false;
    this.corrupted = false;
    this.moving = false;
    this.axis = 'x'; // 'x' or 'z'
    this.direction = 1; // 1 = forward, -1 = backward
    this.speed = BLOCK.BASE_SPEED;
    this.settled = false;
    this.glowIntensity = 0;
    this.removeHighlight = false;
    this.alpha = 1;
    this.time = 0;
    
    // Animation states
    this.squashTimer = 0;
    this.perfectTimer = 0;
    this.removalTimer = 0;
    this.isRemoving = false;
  }
  
  update(dt, canvasWidth = 400) {
    if (this.moving) {
      const limit = Math.max(300, canvasWidth * 0.8);
      if (this.axis === 'x') {
        this.x += this.speed * this.direction * dt;
        // Simple bounce bounds (just for safety)
        if (this.x < -limit) {
          this.x = -limit;
          this.direction = 1;
        } else if (this.x > limit) {
          this.x = limit;
          this.direction = -1;
        }
      } else {
        this.z += this.speed * this.direction * dt;
        if (this.z < -limit) {
          this.z = -limit;
          this.direction = 1;
        } else if (this.z > limit) {
          this.z = limit;
          this.direction = -1;
        }
      }
    }
    this.time += dt;
    this.glowIntensity = 0.5 + 0.5 * Math.sin(this.time * 5);
    
    // Animations
    if (this.squashTimer > 0) this.squashTimer = Math.max(0, this.squashTimer - dt);
    if (this.perfectTimer > 0) this.perfectTimer = Math.max(0, this.perfectTimer - dt);
    
    if (this.isRemoving) {
      this.removalTimer -= dt * 2; // 0.5s removal
      this.alpha = Math.max(0, this.removalTimer);
    }
  }

  triggerSquash() {
    this.squashTimer = 0.15;
  }
  
  triggerPerfectPulse() {
    this.perfectTimer = 0.3;
  }
  
  triggerRemoval() {
    this.isRemoving = true;
    this.removalTimer = 1.0;
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

  // Helper to adjust color brightness
  adjustColor(color, percent) {
    // Basic hex adjustment (assumes #RRGGBB)
    let R = parseInt(color.substring(1,3), 16);
    let G = parseInt(color.substring(3,5), 16);
    let B = parseInt(color.substring(5,7), 16);
    
    R = Math.min(255, Math.max(0, R + (R * percent / 100)));
    G = Math.min(255, Math.max(0, G + (G * percent / 100)));
    B = Math.min(255, Math.max(0, B + (B * percent / 100)));
    
    return `#${Math.round(R).toString(16).padStart(2, '0')}${Math.round(G).toString(16).padStart(2, '0')}${Math.round(B).toString(16).padStart(2, '0')}`;
  }
  
  render(ctx) {
    ctx.save();
    ctx.globalAlpha = this.alpha;
    
    let baseColor = this.color;
    if (this.corrupted) {
      baseColor = '#9B30FF';
    } else if (this.infected) {
      // Glow brightly if infected (Neon Cyan to contrast with Red tower)
      const intensity = 0.4 + 0.2 * this.glowIntensity;
      baseColor = '#00FFFF';
    }
    
    const topColor = this.adjustColor(baseColor, 10);
    const leftColor = this.adjustColor(baseColor, -15);
    const rightColor = this.adjustColor(baseColor, -30);
    
    let renderHeight = this.height;
    let renderY = this.y;
    let scaleOffset = 0;
    
    // Squash effect
    if (this.squashTimer > 0) {
      const t = this.squashTimer / 0.15;
      const squashFactor = Math.sin(t * Math.PI); // 0 -> 1 -> 0
      renderHeight = this.height * (1 - squashFactor * 0.3);
      renderY = this.y + (this.height - renderHeight);
    }
    
    // Perfect pulse effect (scale slightly up)
    if (this.perfectTimer > 0) {
      const t = this.perfectTimer / 0.3;
      scaleOffset = Math.sin(t * Math.PI) * 10; 
    }
    
    // Removal shrink effect
    if (this.isRemoving) {
      scaleOffset -= (1 - this.removalTimer) * 50; 
    }

    // Vertices
    // Top face
    const hw = scaleOffset;
    const hd = scaleOffset;
    
    const p0 = this.project(this.x - hw, renderY - renderHeight, this.z - hd);
    const p1 = this.project(this.x + this.width + hw, renderY - renderHeight, this.z - hd);
    const p2 = this.project(this.x + this.width + hw, renderY - renderHeight, this.z + this.depth + hd);
    const p3 = this.project(this.x - hw, renderY - renderHeight, this.z + this.depth + hd);
    
    // Bottom vertices
    const p1b = this.project(this.x + this.width + hw, renderY, this.z - hd);
    const p2b = this.project(this.x + this.width + hw, renderY, this.z + this.depth + hd);
    const p3b = this.project(this.x - hw, renderY, this.z + this.depth + hd);
    
    // Draw Top Face
    ctx.fillStyle = topColor;
    ctx.beginPath();
    ctx.moveTo(p0.screenX, p0.screenY);
    ctx.lineTo(p1.screenX, p1.screenY);
    ctx.lineTo(p2.screenX, p2.screenY);
    ctx.lineTo(p3.screenX, p3.screenY);
    ctx.closePath();
    ctx.fill();
    
    // Draw Left Face
    ctx.fillStyle = leftColor;
    ctx.beginPath();
    ctx.moveTo(p3.screenX, p3.screenY);
    ctx.lineTo(p2.screenX, p2.screenY);
    ctx.lineTo(p2b.screenX, p2b.screenY);
    ctx.lineTo(p3b.screenX, p3b.screenY);
    ctx.closePath();
    ctx.fill();
    
    // Draw Right Face
    ctx.fillStyle = rightColor;
    ctx.beginPath();
    ctx.moveTo(p2.screenX, p2.screenY);
    ctx.lineTo(p1.screenX, p1.screenY);
    ctx.lineTo(p1b.screenX, p1b.screenY);
    ctx.lineTo(p2b.screenX, p2b.screenY);
    ctx.closePath();
    ctx.fill();
    
    // Highlights
    if (this.removeHighlight) {
      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = 2;
      ctx.beginPath();
      // Outline the entire block
      ctx.moveTo(p0.screenX, p0.screenY);
      ctx.lineTo(p1.screenX, p1.screenY);
      ctx.lineTo(p1b.screenX, p1b.screenY);
      ctx.lineTo(p2b.screenX, p2b.screenY);
      ctx.lineTo(p3b.screenX, p3b.screenY);
      ctx.lineTo(p3.screenX, p3.screenY);
      ctx.closePath();
      ctx.stroke();
    }
    
    if (this.infected || this.corrupted) {
      ctx.shadowColor = this.corrupted ? '#9B30FF' : '#FF0050';
      ctx.shadowBlur = 15 * this.glowIntensity;
      ctx.strokeStyle = ctx.shadowColor;
      ctx.lineWidth = 1;
      ctx.stroke(); // Simple glow
    }

    ctx.restore();
  }
  
  reset(x = 0, y = 0, z = 0, width = BLOCK.START_WIDTH, height = BLOCK.HEIGHT, depth = BLOCK.START_DEPTH, color = '#4A9EFF') {
    this.x = x;
    this.y = y;
    this.z = z;
    this.width = width;
    this.height = height;
    this.depth = depth;
    this.color = color;
    this.infected = false;
    this.corrupted = false;
    this.moving = false;
    this.axis = 'x';
    this.direction = 1;
    this.speed = BLOCK.BASE_SPEED;
    this.settled = false;
    this.glowIntensity = 0;
    this.removeHighlight = false;
    this.alpha = 1;
    this.time = 0;
  }
  
  clone() {
    const b = new Block(this.x, this.y, this.z, this.width, this.height, this.depth, this.color);
    b.infected = this.infected;
    b.corrupted = this.corrupted;
    b.moving = this.moving;
    b.axis = this.axis;
    b.direction = this.direction;
    b.speed = this.speed;
    b.settled = this.settled;
    b.glowIntensity = this.glowIntensity;
    b.removeHighlight = this.removeHighlight;
    b.alpha = this.alpha;
    return b;
  }
  
  // X bounds
  get left() { return this.x; }
  get right() { return this.x + this.width; }
  // Z bounds
  get back() { return this.z; }
  get front() { return this.z + this.depth; }
  // Y bounds
  get top() { return this.y; }
  get bottom() { return this.y + this.height; }
  
  get centerX() { return this.x + this.width / 2; }
  get centerZ() { return this.z + this.depth / 2; }
}

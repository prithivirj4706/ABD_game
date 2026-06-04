import { GAME, COLORS } from './Constants.js';

export class Renderer {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.cameraY = 0;
    this.rotation = 0;
    this.targetRotation = 0;
    
    // Shake state
    this.shakeIntensity = 0;
    this.shakeTimer = 0;
    
    // Background color interpolation state
    this.bgLerp = 0; // 0 = Stack, 1 = Purge
    
    // Set up canvas dimensions
    this.resize();
    window.addEventListener('resize', () => this.resize());
  }

  resize() {
    this.canvas.style.width = `${window.innerWidth}px`;
    this.canvas.style.height = `${window.innerHeight}px`;
    
    // Internal resolution matches display exactly
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }

  setCameraPosition(y) {
    this.cameraY = y;
  }

  updateEffects(dt) {
    // Update shake
    if (this.shakeTimer > 0) {
      this.shakeTimer -= dt;
      if (this.shakeTimer <= 0) {
        this.shakeTimer = 0;
        this.shakeIntensity = 0;
      }
    }
  }

  triggerShake(intensity = 10, duration = 0.3) {
    this.shakeIntensity = intensity;
    this.shakeTimer = duration;
  }
  
  hexToRgb(hex) {
    let r = parseInt(hex.slice(1, 3), 16);
    let g = parseInt(hex.slice(3, 5), 16);
    let b = parseInt(hex.slice(5, 7), 16);
    return { r, g, b };
  }
  
  lerpColor(hexA, hexB, t) {
    const a = this.hexToRgb(hexA);
    const b = this.hexToRgb(hexB);
    const r = Math.round(a.r + (b.r - a.r) * t);
    const g = Math.round(a.g + (b.g - a.g) * t);
    const bColor = Math.round(a.b + (b.b - a.b) * t);
    return `rgb(${r}, ${g}, ${bColor})`;
  }

  setRotation(angle) {
    this.rotation = angle;
  }

  beginFrame(dt, isPurgeMode) {
    const ctx = this.ctx;
    
    // Lerp background transition
    if (isPurgeMode) {
      this.bgLerp = Math.min(1, this.bgLerp + dt * 2); // 0.5s transition
    } else {
      this.bgLerp = Math.max(0, this.bgLerp - dt * 2);
    }
    
    // Background colors
    const topColor = this.lerpColor(COLORS.STACK.BG_TOP, COLORS.PURGE.BG_TOP, this.bgLerp);
    const bottomColor = this.lerpColor(COLORS.STACK.BG_BOTTOM, COLORS.PURGE.BG_BOTTOM, this.bgLerp);
    
    const grad = ctx.createLinearGradient(0, 0, 0, GAME.HEIGHT);
    grad.addColorStop(0, topColor);
    grad.addColorStop(1, bottomColor);
    
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    
    // Setup Camera Transform
    ctx.save();
    
    // Move to center for rotation
    ctx.translate(this.canvas.width / 2, this.canvas.height / 2);
    ctx.rotate(this.rotation);
    ctx.translate(-this.canvas.width / 2, -this.canvas.height / 2);
    
    // Apply screen shake if active
    if (this.shakeTimer > 0) {
      const shakeX = (Math.random() - 0.5) * this.shakeIntensity;
      const shakeY = (Math.random() - 0.5) * this.shakeIntensity;
      ctx.translate(shakeX, shakeY);
    }
    
    // Apply camera Y offset (relative to bottom of screen)
    // Tower starts building up from the bottom
    // We also translate X to center the isometric tower
    ctx.translate(this.canvas.width / 2, this.cameraY);
  }

  endFrame() {
    this.ctx.restore();
  }
}

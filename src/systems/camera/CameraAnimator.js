import { CameraConfig } from './CameraConfig.js';
import { lerp } from '../../utils/MathUtils.js';

export class CameraAnimator {
  constructor() {
    this.currentY = 0;
    this.targetY = 0;
  }

  update(dt, targetY) {
    this.targetY = targetY;
    
    // Time-scaled lerp to ensure frame-rate independence while maintaining smooth damping
    // Using an exponential decay approach for frame-rate independent lerping
    const damping = CameraConfig.DAMPING_FACTOR;
    
    // Formula: current = lerp(current, target, 1 - exp(-damping * dt * 60))
    // Multiplied by 60 to normalize to a 60fps baseline
    const blend = 1 - Math.exp(-damping * dt * 60);
    
    this.currentY = lerp(this.currentY, this.targetY, blend);
    
    return this.currentY;
  }
  
  reset() {
    this.currentY = 0;
    this.targetY = 0;
  }
}

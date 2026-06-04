import { CameraConfig } from './CameraConfig.js';
import { BLOCK, GAME } from '../../core/Constants.js';

export class StackCamera {
  constructor() {}

  calculateTargetY(tower) {
    if (tower.length === 0) return 0;
    
    // The top of the tower in screen space (relative to bottom = 0)
    const towerHeight = tower.length * BLOCK.HEIGHT;
    
    // We want the tower top to be positioned such that there is LOOK_AHEAD_RATIO space above it.
    // If the tower is small, it stays at the bottom.
    // As it grows, the cameraY should move down (negative) to keep the top visible.
    
    // Screen height available for the game
    const screenHeight = GAME.HEIGHT;
    
    // Required space above the top block
    const lookAheadPixels = screenHeight * CameraConfig.LOOK_AHEAD_RATIO;
    
    // If the tower + safe area fits on screen, don't move camera.
    // If it exceeds, we move camera down by the excess.
    let targetY = 0;
    const totalRequiredSpace = towerHeight + lookAheadPixels + CameraConfig.SAFE_AREA_BOTTOM;
    
    if (totalRequiredSpace > screenHeight) {
      // Move camera positively to shift the world down, keeping the top block visible
      targetY = (totalRequiredSpace - screenHeight);
    }
    
    return targetY;
  }
}

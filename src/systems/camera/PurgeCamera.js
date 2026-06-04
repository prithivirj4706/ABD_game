import { CameraConfig } from './CameraConfig.js';
import { BLOCK, GAME } from '../../core/Constants.js';

export class PurgeCamera {
  constructor() {}

  calculateTargetY(tower, gameState) {
    if (tower.length === 0) return 0;
    
    // In Purge Mode, the world is rotated 180 degrees.
    // The infected blocks are at the top visually, but logically they are at a specific Y.
    // We need to frame the lowest infected block and the bottom removal area.
    // We want the lowest infected block to always be visible on screen.
    
    let lowestInfectedIndex = -1;
    let highestInfectedIndex = -1;
    
    // Find infected block bounds
    for (const index of gameState.infectedIndices) {
      if (lowestInfectedIndex === -1 || index < lowestInfectedIndex) lowestInfectedIndex = index;
      if (highestInfectedIndex === -1 || index > highestInfectedIndex) highestInfectedIndex = index;
    }
    
    // If no infected blocks, fallback to centering the tower top (which is visually at the bottom now)
    if (lowestInfectedIndex === -1) {
      return 0; // Return to base view
    }
    
    // Logical Y of the lowest infected block (closest to the bottom of the stack)
    // Wait, the tower is built upwards. Index 0 is bottom. Index N is top.
    // When flipped, index N is at the bottom visually. Index 0 is at the top visually.
    // The removal area is at the visual bottom (logical top).
    // So we need to ensure the logical highest infected index is visible.
    
    const infectedBlockTopY = (highestInfectedIndex + 1) * BLOCK.HEIGHT; // Height from logical bottom
    
    const screenHeight = GAME.HEIGHT;
    const requiredViewSpace = infectedBlockTopY + CameraConfig.PURGE_PADDING;
    
    let targetY = 0;
    
    // The logic here is tricky because the entire coordinate space is rotated 180 degrees.
    // When rotated 180 degrees, the cameraY translation pushes things up instead of down.
    // To see higher blocks (logically), we need to translate negatively.
    if (requiredViewSpace > screenHeight) {
       targetY = (requiredViewSpace - screenHeight);
    }
    
    // Ensure we don't scroll past the logical top (visual bottom)
    const towerTopY = tower.length * BLOCK.HEIGHT;
    if (targetY > (towerTopY - screenHeight * 0.5)) {
        targetY = (towerTopY - screenHeight * 0.5);
    }
    
    if (targetY < 0) targetY = 0;

    return targetY;
  }
}

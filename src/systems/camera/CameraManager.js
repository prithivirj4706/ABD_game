import { CameraTransitionState } from './CameraTransitionState.js';
import { StackCamera } from './StackCamera.js';
import { PurgeCamera } from './PurgeCamera.js';
import { CameraAnimator } from './CameraAnimator.js';
import { GAME } from '../../core/Constants.js';

export class CameraManager {
  constructor(gameState, towerManager) {
    this.gameState = gameState;
    this.towerManager = towerManager;
    
    this.stackCamera = new StackCamera();
    this.purgeCamera = new PurgeCamera();
    this.animator = new CameraAnimator();
    
    this.currentState = CameraTransitionState.STACK;
    this.cameraY = 0;
    
    // Debug toggle
    this.isDebugActive = false;
    
    window.addEventListener('keydown', (e) => {
      if (e.key === 'd' || e.key === 'D') {
        this.isDebugActive = !this.isDebugActive;
      }
    });
  }

  setState(newState) {
    this.currentState = newState;
  }

  update(dt) {
    let targetY = 0;
    const tower = this.towerManager.tower;

    switch (this.currentState) {
      case CameraTransitionState.STACK:
      case CameraTransitionState.TRANSITION_TO_PURGE:
      case CameraTransitionState.TRANSITION_TO_STACK:
        // Use stack camera target for normal mode and transitions
        targetY = this.stackCamera.calculateTargetY(tower);
        break;
      case CameraTransitionState.PURGE:
        targetY = this.purgeCamera.calculateTargetY(tower, this.gameState);
        break;
    }

    // Apply animation
    this.cameraY = this.animator.update(dt, targetY);
  }

  getTransform() {
    return {
      y: this.cameraY
    };
  }

  reset() {
    this.currentState = CameraTransitionState.STACK;
    this.animator.reset();
    this.cameraY = 0;
  }

  renderDebug(ctx) {
    if (!this.isDebugActive) return;

    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0); // Reset transform to draw absolute screen UI
    
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(10, 10, 200, 120);
    
    ctx.fillStyle = '#00FF00';
    ctx.font = '12px monospace';
    ctx.fillText('CAMERA DEBUG', 20, 30);
    ctx.fillText(`State: ${this.currentState}`, 20, 50);
    ctx.fillText(`Y: ${this.cameraY.toFixed(1)}`, 20, 70);
    ctx.fillText(`Target: ${this.animator.targetY.toFixed(1)}`, 20, 90);
    ctx.fillText(`Tower Len: ${this.towerManager.tower.length}`, 20, 110);
    
    ctx.restore();
  }
}

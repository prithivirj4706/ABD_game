import { BLOCK } from '../core/Constants.js';

export class CollisionSystem {
  static calculateOverlap(movingBlock, stationaryBlock) {
    let overlapX = stationaryBlock.x;
    let overlapWidth = stationaryBlock.width;
    let cutX = 0;
    let cutWidth = 0;
    
    let overlapZ = stationaryBlock.z;
    let overlapDepth = stationaryBlock.depth;
    let cutZ = 0;
    let cutDepth = 0;

    let cutDirection = 1;
    let isGameOver = false;
    let isPerfect = false;
    let cutSize = 0;

    if (movingBlock.axis === 'x') {
      const left1 = movingBlock.left;
      const right1 = movingBlock.right;
      const left2 = stationaryBlock.left;
      const right2 = stationaryBlock.right;

      const oLeft = Math.max(left1, left2);
      const oRight = Math.min(right1, right2);
      overlapWidth = oRight - oLeft;

      if (overlapWidth <= 0) {
        isGameOver = true;
        overlapWidth = 0;
        overlapX = 0;
      } else {
        overlapX = oLeft;
        
        const positionDiff = Math.abs(movingBlock.x - stationaryBlock.x);
        if (positionDiff <= BLOCK.PERFECT_THRESHOLD) {
          isPerfect = true;
        } else {
          if (left1 < left2) {
            cutX = left1;
            cutWidth = left2 - left1;
            cutDirection = -1;
          } else {
            cutX = right2;
            cutWidth = right1 - right2;
            cutDirection = 1;
          }
          cutSize = cutWidth;
          cutZ = movingBlock.z;
          cutDepth = movingBlock.depth;
        }
      }
    } else {
      const back1 = movingBlock.back;
      const front1 = movingBlock.front;
      const back2 = stationaryBlock.back;
      const front2 = stationaryBlock.front;

      const oBack = Math.max(back1, back2);
      const oFront = Math.min(front1, front2);
      overlapDepth = oFront - oBack;

      if (overlapDepth <= 0) {
        isGameOver = true;
        overlapDepth = 0;
        overlapZ = 0;
      } else {
        overlapZ = oBack;

        const positionDiff = Math.abs(movingBlock.z - stationaryBlock.z);
        if (positionDiff <= BLOCK.PERFECT_THRESHOLD) {
          isPerfect = true;
        } else {
          if (back1 < back2) {
            cutZ = back1;
            cutDepth = back2 - back1;
            cutDirection = -1;
          } else {
            cutZ = front2;
            cutDepth = front1 - front2;
            cutDirection = 1;
          }
          cutSize = cutDepth;
          cutX = movingBlock.x;
          cutWidth = movingBlock.width;
        }
      }
    }

    return {
      overlapX,
      overlapZ,
      overlapWidth,
      overlapDepth,
      cutX,
      cutZ,
      cutWidth,
      cutDepth,
      cutDirection,
      cutSize,
      isPerfect,
      isGameOver
    };
  }

  static pointInBlock(px, py, block) {
    // Project block bounds to 2D
    const proj = block.project(block.centerX, block.y - block.height/2, block.centerZ);
    // Rough bounding circle hit test
    const dx = px - proj.screenX;
    const dy = py - proj.screenY;
    return (dx*dx + dy*dy) < 2500; // 50px radius squared
  }
}

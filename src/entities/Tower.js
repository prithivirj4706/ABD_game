import { BLOCK } from '../core/Constants.js';

export class Tower {
  constructor() {
    this._blocks = [];
  }
  
  addBlock(block) {
    this._blocks.push(block);
  }
  
  removeBlock(index) {
    if (index >= 0 && index < this._blocks.length) {
      return this._blocks.splice(index, 1)[0];
    }
    return null;
  }
  
  getTopBlock() {
    if (this._blocks.length === 0) return null;
    return this._blocks[this._blocks.length - 1];
  }
  
  getBottomBlock() {
    if (this._blocks.length === 0) return null;
    return this._blocks[0];
  }
  
  getBlock(index) {
    if (index >= 0 && index < this._blocks.length) {
      return this._blocks[index];
    }
    return null;
  }
  
  get height() {
    return this._blocks.length * BLOCK.HEIGHT;
  }
  
  get length() {
    return this._blocks.length;
  }
  
  get blocks() {
    return this._blocks;
  }
  
  reset() {
    this._blocks = [];
  }
}

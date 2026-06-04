import { GAME } from '../core/Constants.js';

/**
 * Unified input handling for touch, mouse, and keyboard.
 * Supports two modes: 'stack' (tap to place) and 'purge' (tap to select block).
 */
export class InputManager {
  /**
   * @param {HTMLCanvasElement} canvas
   */
  constructor(canvas) {
    this.canvas = canvas;
    this.enabled = false;
    /** @type {'stack'|'purge'} */
    this.mode = 'stack';

    /** @type {Function|null} */
    this._tapCallback = null;
    /** @type {Function|null} */
    this._blockSelectCallback = null;
    /** @type {{x:number,y:number}|null} */
    this._lastClickPos = null;

    // Bound handlers (so we can remove them on destroy)
    this._onMouseDown = this._handleMouseDown.bind(this);
    this._onTouchStart = this._handleTouchStart.bind(this);
    this._onKeyDown = this._handleKeyDown.bind(this);

    // Attach
    this.canvas.addEventListener('mousedown', this._onMouseDown);
    this.canvas.addEventListener('touchstart', this._onTouchStart, { passive: false });
    document.addEventListener('keydown', this._onKeyDown);
  }

  /* ── Callback registration ─────────────────────────────────── */

  /** Register a callback for stack-mode taps (no positional data needed). */
  onTap(callback) {
    this._tapCallback = callback;
  }

  /** Register a callback for purge-mode block selection (receives x, y). */
  onBlockSelect(callback) {
    this._blockSelectCallback = callback;
  }

  /* ── State ─────────────────────────────────────────────────── */

  enable() { this.enabled = true; }
  disable() { this.enabled = false; }

  /** @param {'stack'|'purge'} mode */
  setMode(mode) { this.mode = mode; }

  /* ── Coordinate helpers ────────────────────────────────────── */

  /**
   * Convert page-space client coordinates to canvas-space coordinates,
   * accounting for CSS scaling.
   */
  _getCanvasPos(clientX, clientY) {
    const rect = this.canvas.getBoundingClientRect();
    const scaleX = this.canvas.width / rect.width;
    const scaleY = this.canvas.height / rect.height;
    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY,
    };
  }

  /* ── Event handlers ────────────────────────────────────────── */

  _handleMouseDown(e) {
    if (!this.enabled) return;
    e.preventDefault();
    const pos = this._getCanvasPos(e.clientX, e.clientY);
    this._handleInput(pos);
  }

  _handleTouchStart(e) {
    if (!this.enabled) return;
    e.preventDefault();
    const touch = e.touches[0];
    const pos = this._getCanvasPos(touch.clientX, touch.clientY);
    this._handleInput(pos);
  }

  _handleKeyDown(e) {
    if (!this.enabled) return;
    if (e.code === 'Space' || e.code === 'Enter') {
      e.preventDefault();
      if (this.mode === 'stack' && this._tapCallback) {
        this._tapCallback();
      }
    }
  }

  _handleInput(pos) {
    this._lastClickPos = pos;
    if (this.mode === 'stack') {
      if (this._tapCallback) this._tapCallback();
    } else if (this.mode === 'purge') {
      if (this._blockSelectCallback) this._blockSelectCallback(pos.x, pos.y);
    }
  }

  /* ── Accessors / cleanup ───────────────────────────────────── */

  /** @returns {{x:number,y:number}|null} */
  getLastClickPosition() {
    return this._lastClickPos;
  }

  /** Remove all event listeners. */
  destroy() {
    this.canvas.removeEventListener('mousedown', this._onMouseDown);
    this.canvas.removeEventListener('touchstart', this._onTouchStart);
    document.removeEventListener('keydown', this._onKeyDown);
  }
}

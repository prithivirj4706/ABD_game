import { STATES } from '../core/Constants.js';

// Define valid transitions
const VALID_TRANSITIONS = {
  [STATES.BOOT]: [STATES.MENU],
  [STATES.MENU]: [STATES.STACK_MODE],
  [STATES.STACK_MODE]: [STATES.FLIP_TO_PURGE, STATES.GAME_OVER],
  [STATES.FLIP_TO_PURGE]: [STATES.PURGE_MODE],
  [STATES.PURGE_MODE]: [STATES.FLIP_TO_STACK, STATES.GAME_OVER],
  [STATES.FLIP_TO_STACK]: [STATES.STACK_MODE],
  [STATES.GAME_OVER]: [STATES.MENU, STATES.STACK_MODE]
};

export class StateManager {
  constructor() {
    this._current = STATES.BOOT;
    this._previous = null;
    this._listeners = new Map();
  }

  get current() {
    return this._current;
  }

  get previous() {
    return this._previous;
  }

  canTransition(newState) {
    const valid = VALID_TRANSITIONS[this._current];
    return valid && valid.includes(newState);
  }

  transition(newState) {
    if (!this.canTransition(newState)) {
      console.warn(`[StateManager] Invalid transition: ${this._current} -> ${newState}`);
      return false;
    }

    const oldState = this._current;
    this._previous = oldState;
    this._current = newState;

    this._emit(`exit:${oldState}`);
    this._emit(`enter:${newState}`);

    return true;
  }

  on(event, callback) {
    if (!this._listeners.has(event)) {
      this._listeners.set(event, new Set());
    }
    this._listeners.get(event).add(callback);
  }

  off(event, callback) {
    if (this._listeners.has(event)) {
      this._listeners.get(event).delete(callback);
    }
  }

  _emit(event) {
    if (this._listeners.has(event)) {
      for (const callback of this._listeners.get(event)) {
        callback();
      }
    }
  }
}

/**
 * @fileoverview localStorage wrapper with graceful error handling.
 * All keys are prefixed with 'flipstack_' to avoid collisions.
 * @module utils/Storage
 */

/** @type {string} */
const KEY_PREFIX = 'flipstack_';

/** @type {string} */
const STATS_KEY = `${KEY_PREFIX}stats`;

/** @type {string} */
const SETTINGS_KEY = `${KEY_PREFIX}settings`;

/**
 * @typedef {Object} GameStats
 * @property {number} bestScore
 * @property {number} gamesPlayed
 * @property {number} totalBlocksPlaced
 * @property {number} totalPurgesCompleted
 */

/**
 * @typedef {Object} GameSettings
 * @property {boolean} soundEnabled
 * @property {number} volume
 */

/** @returns {GameStats} */
function defaultStats() {
  return {
    bestScore: 0,
    gamesPlayed: 0,
    totalBlocksPlaced: 0,
    totalPurgesCompleted: 0,
    highestCombo: 0
  };
}

/** @returns {GameSettings} */
function defaultSettings() {
  return {
    soundEnabled: true,
    volume: 0.7
  };
}

export class Storage {
  /**
   * Saves data to localStorage under a prefixed key.
   * @param {string} key - The storage key (will be prefixed).
   * @param {*} data - The data to store (will be JSON-stringified).
   */
  static save(key, data) {
    try {
      localStorage.setItem(`${KEY_PREFIX}${key}`, JSON.stringify(data));
    } catch (e) {
      console.warn(`[Storage] Failed to save key "${key}":`, e);
    }
  }

  /**
   * Loads data from localStorage.
   * @param {string} key - The storage key (will be prefixed).
   * @param {*} [defaultValue=null] - Value to return if key is missing or parse fails.
   * @returns {*} The parsed data, or defaultValue.
   */
  static load(key, defaultValue = null) {
    try {
      const raw = localStorage.getItem(`${KEY_PREFIX}${key}`);
      if (raw === null) {
        return defaultValue;
      }
      return JSON.parse(raw);
    } catch (e) {
      console.warn(`[Storage] Failed to load key "${key}":`, e);
      return defaultValue;
    }
  }

  /**
   * Clears all flipstack data from localStorage.
   */
  static clear() {
    try {
      const keysToRemove = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith(KEY_PREFIX)) {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach((key) => localStorage.removeItem(key));
    } catch (e) {
      console.warn('[Storage] Failed to clear data:', e);
    }
  }

  /**
   * Loads game statistics, returning defaults if not found.
   * @returns {GameStats}
   */
  static loadStats() {
    try {
      const raw = localStorage.getItem(STATS_KEY);
      if (raw === null) {
        return defaultStats();
      }
      const parsed = JSON.parse(raw);
      // Merge with defaults to handle missing fields from older saves
      return { ...defaultStats(), ...parsed };
    } catch (e) {
      console.warn('[Storage] Failed to load stats:', e);
      return defaultStats();
    }
  }

  /**
   * Saves game statistics.
   * @param {GameStats} stats
   */
  static saveStats(stats) {
    try {
      localStorage.setItem(STATS_KEY, JSON.stringify(stats));
    } catch (e) {
      console.warn('[Storage] Failed to save stats:', e);
    }
  }

  /**
   * Loads game settings, returning defaults if not found.
   * @returns {GameSettings}
   */
  static loadSettings() {
    try {
      const raw = localStorage.getItem(SETTINGS_KEY);
      if (raw === null) {
        return defaultSettings();
      }
      const parsed = JSON.parse(raw);
      return { ...defaultSettings(), ...parsed };
    } catch (e) {
      console.warn('[Storage] Failed to load settings:', e);
      return defaultSettings();
    }
  }

  /**
   * Saves game settings.
   * @param {GameSettings} settings
   */
  static saveSettings(settings) {
    try {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    } catch (e) {
      console.warn('[Storage] Failed to save settings:', e);
    }
  }
}

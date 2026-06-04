/**
 * @fileoverview Pure math utility functions for FlipStack.
 * All functions are stateless and side-effect free.
 * @module utils/MathUtils
 */

/**
 * Clamps a value between a minimum and maximum.
 * @param {number} val - The value to clamp.
 * @param {number} min - The minimum bound.
 * @param {number} max - The maximum bound.
 * @returns {number} The clamped value.
 */
export function clamp(val, min, max) {
  return Math.max(min, Math.min(max, val));
}

/**
 * Linearly interpolates between two values.
 * @param {number} a - Start value.
 * @param {number} b - End value.
 * @param {number} t - Interpolation factor (0 = a, 1 = b).
 * @returns {number} The interpolated value.
 */
export function lerp(a, b, t) {
  return a + (b - a) * t;
}

/**
 * Returns a random float in the range [min, max).
 * @param {number} min - Minimum value (inclusive).
 * @param {number} max - Maximum value (exclusive).
 * @returns {number} A random float.
 */
export function randomRange(min, max) {
  return min + Math.random() * (max - min);
}

/**
 * Returns a random integer in the range [min, max] (inclusive).
 * @param {number} min - Minimum value (inclusive).
 * @param {number} max - Maximum value (inclusive).
 * @returns {number} A random integer.
 */
export function randomInt(min, max) {
  const lo = Math.ceil(min);
  const hi = Math.floor(max);
  return lo + Math.floor(Math.random() * (hi - lo + 1));
}

/**
 * Maps a value from one range to another.
 * @param {number} val - The input value.
 * @param {number} inMin - Input range minimum.
 * @param {number} inMax - Input range maximum.
 * @param {number} outMin - Output range minimum.
 * @param {number} outMax - Output range maximum.
 * @returns {number} The mapped value.
 */
export function mapRange(val, inMin, inMax, outMin, outMax) {
  if (inMax === inMin) {
    return outMin;
  }
  return outMin + ((val - inMin) / (inMax - inMin)) * (outMax - outMin);
}

/**
 * Computes the Euclidean distance between two 2D points.
 * @param {number} x1 - X coordinate of the first point.
 * @param {number} y1 - Y coordinate of the first point.
 * @param {number} x2 - X coordinate of the second point.
 * @param {number} y2 - Y coordinate of the second point.
 * @returns {number} The distance between the points.
 */
export function distance(x1, y1, x2, y2) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  return Math.sqrt(dx * dx + dy * dy);
}

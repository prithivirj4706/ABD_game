/**
 * @fileoverview Easing functions for smooth animations.
 * All functions accept t in [0, 1] and return a value in [0, 1].
 * @module utils/Easing
 */

/**
 * Cubic ease-in-out: slow start, fast middle, slow end.
 * @param {number} t - Progress value in [0, 1].
 * @returns {number} Eased value in [0, 1].
 */
export function easeInOutCubic(t) {
  return t < 0.5
    ? 4 * t * t * t
    : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

/**
 * Bounce ease-out: simulates a bouncing ball settling.
 * @param {number} t - Progress value in [0, 1].
 * @returns {number} Eased value in [0, 1].
 */
export function easeOutBounce(t) {
  const n1 = 7.5625;
  const d1 = 2.75;

  if (t < 1 / d1) {
    return n1 * t * t;
  } else if (t < 2 / d1) {
    return n1 * (t -= 1.5 / d1) * t + 0.75;
  } else if (t < 2.5 / d1) {
    return n1 * (t -= 2.25 / d1) * t + 0.9375;
  } else {
    return n1 * (t -= 2.625 / d1) * t + 0.984375;
  }
}

/**
 * Elastic ease-out: overshoots then settles with elastic oscillation.
 * @param {number} t - Progress value in [0, 1].
 * @returns {number} Eased value in [0, 1].
 */
export function easeOutElastic(t) {
  const c4 = (2 * Math.PI) / 3;

  if (t === 0) return 0;
  if (t === 1) return 1;

  return Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * c4) + 1;
}

/**
 * Cubic ease-out: fast start, slow end.
 * @param {number} t - Progress value in [0, 1].
 * @returns {number} Eased value in [0, 1].
 */
export function easeOutCubic(t) {
  return 1 - Math.pow(1 - t, 3);
}

/**
 * Cubic ease-in: slow start, fast end.
 * @param {number} t - Progress value in [0, 1].
 * @returns {number} Eased value in [0, 1].
 */
export function easeInCubic(t) {
  return t * t * t;
}

/**
 * Quadratic ease-out: fast start, slow end (gentler than cubic).
 * @param {number} t - Progress value in [0, 1].
 * @returns {number} Eased value in [0, 1].
 */
export function easeOutQuad(t) {
  return 1 - (1 - t) * (1 - t);
}

/**
 * Quadratic ease-in-out: slow start, fast middle, slow end.
 * @param {number} t - Progress value in [0, 1].
 * @returns {number} Eased value in [0, 1].
 */
export function easeInOutQuad(t) {
  return t < 0.5
    ? 2 * t * t
    : 1 - Math.pow(-2 * t + 2, 2) / 2;
}

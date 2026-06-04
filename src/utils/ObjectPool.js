/**
 * @fileoverview Generic object pool to minimize garbage collection pressure.
 * Pre-allocates objects and recycles them instead of creating/destroying.
 * @module utils/ObjectPool
 */

export class ObjectPool {
  /** @type {Array} */
  #pool;

  /** @type {Set} */
  #active;

  /** @type {Function} */
  #factory;

  /** @type {Function} */
  #reset;

  /**
   * Creates a new ObjectPool.
   * @param {Function} factory - Function that creates a new instance.
   * @param {Function} reset - Function that resets an instance for reuse.
   * @param {number} [initialSize=50] - Number of objects to pre-allocate.
   */
  constructor(factory, reset, initialSize = 50) {
    if (typeof factory !== 'function') {
      throw new TypeError('ObjectPool factory must be a function');
    }
    if (typeof reset !== 'function') {
      throw new TypeError('ObjectPool reset must be a function');
    }

    this.#factory = factory;
    this.#reset = reset;
    this.#pool = [];
    this.#active = new Set();

    // Pre-allocate
    for (let i = 0; i < initialSize; i++) {
      this.#pool.push(this.#factory());
    }
  }

  /**
   * Acquires an object from the pool. Creates a new one if the pool is empty.
   * @returns {*} A ready-to-use object instance.
   */
  acquire() {
    let obj;
    if (this.#pool.length > 0) {
      obj = this.#pool.pop();
    } else {
      obj = this.#factory();
    }
    this.#active.add(obj);
    return obj;
  }

  /**
   * Releases an object back to the pool for reuse.
   * @param {*} obj - The object to release.
   */
  release(obj) {
    if (!this.#active.has(obj)) {
      return; // Not tracked — ignore silently
    }
    this.#active.delete(obj);
    this.#reset(obj);
    this.#pool.push(obj);
  }

  /**
   * Releases all active objects back to the pool.
   */
  releaseAll() {
    for (const obj of this.#active) {
      this.#reset(obj);
      this.#pool.push(obj);
    }
    this.#active.clear();
  }

  /**
   * The number of currently active (in-use) objects.
   * @returns {number}
   */
  get activeCount() {
    return this.#active.size;
  }

  /**
   * The number of objects currently available in the pool.
   * @returns {number}
   */
  get poolSize() {
    return this.#pool.length;
  }
}

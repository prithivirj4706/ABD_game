/**
 * Procedural audio via Web Audio API — all sounds synthesised at runtime,
 * no external files required.
 */
export class AudioManager {
  constructor() {
    /** @type {AudioContext|null} */
    this.ctx = null;
    /** @type {GainNode|null} */
    this.masterGain = null;
    this.initialized = false;
    this.muted = false;
    this._volume = 0.7;
  }

  /* ── Bootstrap (call after first user gesture) ─────────────── */

  init() {
    if (this.initialized) return;
    try {
      this.ctx = new (window.AudioContext || window.webkitAudioContext)();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.value = this._volume;
      this.masterGain.connect(this.ctx.destination);
      this.initialized = true;
    } catch (e) {
      console.warn('AudioManager: Web Audio not available', e);
    }
  }

  /* ── Public API ────────────────────────────────────────────── */

  /**
   * Play a named sound effect.
   * @param {'place'|'perfect'|'infect'|'flip'|'remove'|'purge_success'|'game_over'} name
   */
  play(name) {
    if (!this.initialized || this.muted) return;
    if (this.ctx.state === 'suspended') this.ctx.resume();

    try {
      switch (name) {
        case 'place':         this._playPlace(); break;
        case 'perfect':       this._playPerfect(); break;
        case 'infect':        this._playInfect(); break;
        case 'flip':          this._playFlip(); break;
        case 'remove':        this._playRemove(); break;
        case 'purge_success': this._playPurgeSuccess(); break;
        case 'game_over':     this._playGameOver(); break;
      }
    } catch (e) {
      console.warn('AudioManager: Failed to play sound', name, e);
    }
  }

  /* ── Sound definitions ─────────────────────────────────────── */

  /** PLACEMENT — short click / tap: brief high-frequency blip */
  _playPlace() {
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(800, t);
    osc.frequency.exponentialRampToValueAtTime(600, t + 0.08);
    gain.gain.setValueAtTime(0.3, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.1);
    osc.connect(gain).connect(this.masterGain);
    osc.start(t);
    osc.stop(t + 0.1);
  }

  /** PERFECT — satisfying two-note ascending chime */
  _playPerfect() {
    const t = this.ctx.currentTime;
    [880, 1320].forEach((freq, i) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0, t + i * 0.08);
      gain.gain.linearRampToValueAtTime(0.3, t + i * 0.08 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, t + i * 0.08 + 0.3);
      osc.connect(gain).connect(this.masterGain);
      osc.start(t + i * 0.08);
      osc.stop(t + i * 0.08 + 0.3);
    });
  }

  /** INFECTION ALERT — low rumble + dissonant high overtone */
  _playInfect() {
    const t = this.ctx.currentTime;
    // Low rumble
    const osc1 = this.ctx.createOscillator();
    const gain1 = this.ctx.createGain();
    osc1.type = 'sawtooth';
    osc1.frequency.setValueAtTime(80, t);
    osc1.frequency.linearRampToValueAtTime(60, t + 0.5);
    gain1.gain.setValueAtTime(0.2, t);
    gain1.gain.exponentialRampToValueAtTime(0.001, t + 0.6);
    osc1.connect(gain1).connect(this.masterGain);
    osc1.start(t);
    osc1.stop(t + 0.6);
    // Dissonant overtone
    const osc2 = this.ctx.createOscillator();
    const gain2 = this.ctx.createGain();
    osc2.type = 'square';
    osc2.frequency.setValueAtTime(440, t);
    osc2.frequency.linearRampToValueAtTime(220, t + 0.4);
    gain2.gain.setValueAtTime(0.1, t);
    gain2.gain.exponentialRampToValueAtTime(0.001, t + 0.4);
    osc2.connect(gain2).connect(this.masterGain);
    osc2.start(t);
    osc2.stop(t + 0.4);
  }

  /** FLIP — whoosh: filtered noise sweep */
  _playFlip() {
    const t = this.ctx.currentTime;
    const bufferSize = this.ctx.sampleRate * 0.8;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize);
    }
    const source = this.ctx.createBufferSource();
    source.buffer = buffer;
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(200, t);
    filter.frequency.exponentialRampToValueAtTime(2000, t + 0.4);
    filter.frequency.exponentialRampToValueAtTime(200, t + 0.8);
    filter.Q.value = 2;
    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.3, t);
    gain.gain.linearRampToValueAtTime(0.4, t + 0.3);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.8);
    source.connect(filter).connect(gain).connect(this.masterGain);
    source.start(t);
    source.stop(t + 0.8);
  }

  /** REMOVE — pop sound */
  _playRemove() {
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(400, t);
    osc.frequency.exponentialRampToValueAtTime(200, t + 0.1);
    gain.gain.setValueAtTime(0.25, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.15);
    osc.connect(gain).connect(this.masterGain);
    osc.start(t);
    osc.stop(t + 0.15);
  }

  /** PURGE SUCCESS — triumphant ascending C-major arpeggio */
  _playPurgeSuccess() {
    const t = this.ctx.currentTime;
    [523.25, 659.25, 783.99, 1046.5].forEach((freq, i) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0, t + i * 0.1);
      gain.gain.linearRampToValueAtTime(0.2, t + i * 0.1 + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.001, t + i * 0.1 + 0.5);
      osc.connect(gain).connect(this.masterGain);
      osc.start(t + i * 0.1);
      osc.stop(t + i * 0.1 + 0.5);
    });
  }

  /** GAME OVER — sad descending tone (A→F#→D#→C) */
  _playGameOver() {
    const t = this.ctx.currentTime;
    [440, 370, 311, 261].forEach((freq, i) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0, t + i * 0.2);
      gain.gain.linearRampToValueAtTime(0.2, t + i * 0.2 + 0.05);
      gain.gain.linearRampToValueAtTime(0.15, t + i * 0.2 + 0.15);
      gain.gain.exponentialRampToValueAtTime(0.001, t + i * 0.2 + 0.4);
      osc.connect(gain).connect(this.masterGain);
      osc.start(t + i * 0.2);
      osc.stop(t + i * 0.2 + 0.4);
    });
  }

  /* ── Volume / mute controls ────────────────────────────────── */

  setMute(muted) {
    this.muted = muted;
    if (this.masterGain) {
      this.masterGain.gain.value = muted ? 0 : this._volume;
    }
  }

  setVolume(vol) {
    this._volume = Math.max(0, Math.min(1, vol));
    if (this.masterGain && !this.muted) {
      this.masterGain.gain.value = this._volume;
    }
  }

  toggleMute() {
    this.setMute(!this.muted);
    return this.muted;
  }

  get isMuted() { return this.muted; }
  get volume() { return this._volume; }
}

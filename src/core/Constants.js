export const GAME = {
  WIDTH: 400,
  HEIGHT: 600,
  BG_COLOR: '#0a0a1a',
  TARGET_FPS: 60
};

export const BLOCK = {
  HEIGHT: 28,
  START_WIDTH: 200,
  START_DEPTH: 200,
  MIN_WIDTH: 5,
  MIN_DEPTH: 5,
  BASE_SPEED: 180,
  PERFECT_THRESHOLD: 3, // pixels tolerance for 'perfect' placement
  GRAVITY: 1200, // for falling cut pieces
  COLORS_STACK: [
    '#F7B6B3', '#F4A6A2', '#F19692', '#EE8681', '#EB7671',
    '#E86660', '#E55650', '#E24640', '#DF3630', '#DC2620'
  ],
  COLORS_PURGE: [
    '#3B1F3E', '#4D2447', '#5E2950', '#702F5A', '#813463',
    '#933A6C', '#A43F75', '#B6447E', '#C74A88', '#D94F91'
  ]
};

export const SCORING = {
  PLACEMENT: 10,
  PERFECT: 25,
  SAFE_REMOVAL: 5,
  INFECTED_REMOVAL: 100,
  PURGE_BONUS: 500,
  PERFECT_PURGE_BONUS: 1000,
  COMBO_MULTIPLIER: 1.5 // consecutive perfects
};

export const INFECTION = {
  INITIAL_THRESHOLD: 8, // placements before first infection
  MIN_THRESHOLD: 4,
  SPREAD_BASE_INTERVAL: 3000, // ms between spread ticks
  MIN_SPREAD_INTERVAL: 800,
  INFECTION_COUNT: 1 // blocks infected per event (can increase with difficulty)
};

export const DIFFICULTY = {
  SPEED_FACTOR: 0.0004,
  INFECTION_FACTOR: 0.0008,
  SPREAD_FACTOR: 0.0003,
  MAX_SPEED_MULTIPLIER: 3.0,
  MIN_INFECTION_THRESHOLD: 4
};

export const COLORS = {
  STACK: {
    BG_TOP: '#ECA1A1',
    BG_BOTTOM: '#F0B2AF',
    GRID: 'rgba(255, 255, 255, 0.06)',
    TEXT: '#FFFFFF'
  },
  PURGE: {
    BG_TOP: '#1A1521',
    BG_BOTTOM: '#352538',
    GRID: 'rgba(255, 255, 255, 0.03)',
    TEXT: '#FFFFFF',
    INFECTED_GLOW: '#FF0050',
    CORRUPTION: '#9B30FF'
  },
  PERFECT: '#FFD700',
  COMBO: '#FF8C00',
  UI_BG: 'rgba(10, 10, 30, 0.85)',
  UI_BORDER: 'rgba(255, 255, 255, 0.1)'
};

export const FLIP = {
  DURATION: 1500, // ms
  SHAKE_INTENSITY: 8,
  SHAKE_DURATION: 300
};

export const PARTICLES = {
  POOL_SIZE: 200,
  PLACEMENT_COUNT: 8,
  PERFECT_COUNT: 20,
  PURGE_COUNT: 30,
  CORRUPTION_COUNT: 5,
  GRAVITY: 300
};

export const STATES = {
  BOOT: 'BOOT',
  MENU: 'MENU',
  STACK_MODE: 'STACK_MODE',
  FLIP_TO_PURGE: 'FLIP_TO_PURGE',
  PURGE_MODE: 'PURGE_MODE',
  FLIP_TO_STACK: 'FLIP_TO_STACK',
  GAME_OVER: 'GAME_OVER'
};

import { GAME, STATES, SCORING } from './Constants.js';
import { StateManager } from '../state/StateManager.js';
import { GameState } from '../state/GameState.js';
import { Renderer } from './Renderer.js';
import { TowerManager } from '../systems/TowerManager.js';
import { InfectionManager } from '../systems/InfectionManager.js';
import { DifficultyManager } from '../systems/DifficultyManager.js';
import { PhysicsSystem } from '../systems/PhysicsSystem.js';
import { ParticleSystem } from '../systems/ParticleSystem.js';
import { InputManager } from '../systems/InputManager.js';
import { AudioManager } from '../audio/AudioManager.js';
import { CameraManager } from '../systems/camera/CameraManager.js';
import { CameraTransitionState } from '../systems/camera/CameraTransitionState.js';
import { easeInOutCubic } from '../utils/Easing.js';
import { firebaseManager } from '../backend/FirebaseManager.js';

export class GameEngine {
  constructor(canvas) {
    this.canvas = canvas;
    this.renderer = new Renderer(canvas);
    this.stateManager = new StateManager();
    this.gameState = new GameState();
    
    this.audio = new AudioManager();
    this.audio.setVolume(this.gameState.settings.volume);
    this.particles = new ParticleSystem();
    this.physics = new PhysicsSystem();
    this.difficulty = new DifficultyManager(this.gameState);
    this.towerManager = new TowerManager(this.gameState, this.physics, this.particles);
    this.infectionManager = new InfectionManager(this.gameState, this.towerManager, this.particles);
    this.cameraManager = new CameraManager(this.gameState, this.towerManager);
    this.input = new InputManager(this.canvas);
    
    this.lastTime = 0;
    this.accumulatedTime = 0;
    this.timeStep = 1 / GAME.TARGET_FPS;
    
    this.flipTimer = 0;
    this.flipDuration = 1.5; // 1.5 seconds per roadmap
    
    this.isRunning = false;
    this.boundLoop = this.loop.bind(this);
    
    this.setupEvents();
  }

  setupEvents() {
    this.input.onTap(() => this.handleAction(0, 0));
    this.input.onBlockSelect((x, y) => this.handleAction(x, y));
    
    this.stateManager.on(`enter:${STATES.MENU}`, () => {
      this.input.setMode('stack');
      this.towerManager.reset();
      this.gameState.reset();
      this.infectionManager.reset();
      this.cameraManager.reset();
      this.renderer.setRotation(0);
      this.renderer.setCameraPosition(0);
    });
    
    this.stateManager.on(`enter:${STATES.STACK_MODE}`, () => {
      this.input.setMode('stack');
      this.towerManager.startStackMode();
      window.dispatchEvent(new CustomEvent('game:mode', { detail: 'STACK' }));
    });
    
    this.stateManager.on(`enter:${STATES.FLIP_TO_PURGE}`, () => {
      this.towerManager.currentBlock = null; // Remove moving block during purge cycle
      this.gameState.currentPurgeMisses = 0; // Reset misses for the new purge
      window.dispatchEvent(new CustomEvent('game:warning', { detail: 'INFECTION DETECTED!' }));
    });
    
    this.stateManager.on(`enter:${STATES.PURGE_MODE}`, () => {
      this.input.setMode('purge');
      this.gameState.currentPurgeMisses = 0;
      window.dispatchEvent(new CustomEvent('game:mode', { detail: 'PURGE' }));
    });

    this.stateManager.on(`enter:${STATES.GAME_OVER}`, () => {
      this.gameState.stats.gamesPlayed++;
      this.gameState.saveProgress();
      
      // Async submit to mock backend
      firebaseManager.submitScore(this.gameState.score, this.gameState.stats).catch(e => console.error(e));

      this.audio.play('gameOver');
      this.renderer.triggerShake(20, 0.8);
      
      // Spawn debris for all blocks
      for (const block of this.towerManager.tower.blocks) {
        this.particles.emitDebris(block.centerX, block.y, block.centerZ, block.width, block.depth, block.color);
      }
      
      // Show game over UI event should be dispatched here
      window.dispatchEvent(new CustomEvent('game:gameover'));
    });
  }

  handleAction(x, y) {
    this.audio.init(); // Must be triggered by user gesture
    
    const state = this.stateManager.current;
    
    if (state === STATES.MENU) {
      this.stateManager.transition(STATES.STACK_MODE);
      window.dispatchEvent(new CustomEvent('game:start'));
    } 
    else if (state === STATES.STACK_MODE) {
      const result = this.towerManager.placeBlock();
      if (!result.success) {
        this.stateManager.transition(STATES.GAME_OVER);
      } else {
        if (result.isPerfect) {
          this.audio.play('perfect');
          window.dispatchEvent(new CustomEvent('game:perfect'));
        } else {
          this.audio.play('place');
        }
        
        window.dispatchEvent(new CustomEvent('game:score'));
        this.difficulty.update(this.gameState.score);
        if (this.infectionManager.shouldInfect()) {
          this.audio.play('infect');
          this.infectionManager.infectBlocks();
          if (this.gameState.infectedIndices.size > 0) { // Trigger flip immediately upon infection
            this.flipTimer = 0;
            this.audio.play('flip');
            this.renderer.triggerShake(5, 1.5);
            this.cameraManager.setState(CameraTransitionState.TRANSITION_TO_PURGE);
            this.stateManager.transition(STATES.FLIP_TO_PURGE);
          }
        }
      }
    }
    else if (state === STATES.PURGE_MODE) {
      // Adjust hit coordinates based on camera and rotation
      // Since it's upside down (Rotation = Math.PI) and translated by canvas.width/2
      const hitX = (this.canvas.width / 2) - x;
      const hitY = this.canvas.height - y - this.renderer.cameraY; 
      
      const blockIndex = this.towerManager.getBlockAtPosition(hitX, hitY);
      const purged = this.infectionManager.removeBlock(blockIndex);
      if (purged.success) {
        this.audio.play('remove');
        window.dispatchEvent(new CustomEvent('game:purged'));
        window.dispatchEvent(new CustomEvent('game:score'));
        
        if (this.infectionManager.isPurgeComplete()) {
          this.audio.play('purge_success');
          this.gameState.addScore(SCORING.PURGE_BONUS);
          if (this.gameState.currentPurgeMisses === 0) {
            this.gameState.addScore(SCORING.PERFECT_PURGE_BONUS);
            window.dispatchEvent(new CustomEvent('game:perfect_purge'));
          }
          this.gameState.stats.totalPurgesCompleted++;
          
          this.flipTimer = 0;
          this.renderer.triggerShake(5, 1.5);
          // Small delay before flip could be added here, but for now we flip
          this.audio.play('flip');
          this.cameraManager.setState(CameraTransitionState.TRANSITION_TO_STACK);
          this.stateManager.transition(STATES.FLIP_TO_STACK);
        }
      } else {
        // Punish wrong tap
        this.gameState.score = Math.max(0, this.gameState.score - 5);
        this.gameState.currentPurgeMisses++;
        window.dispatchEvent(new CustomEvent('game:score'));
      }
    }
  }

  start() {
    this.isRunning = true;
    this.input.enable();
    this.lastTime = performance.now();
    this.stateManager.transition(STATES.MENU);
    requestAnimationFrame(this.boundLoop);
  }

  stop() {
    this.isRunning = false;
  }

  loop(timestamp) {
    if (!this.isRunning) return;

    let dt = (timestamp - this.lastTime) / 1000;
    this.lastTime = timestamp;
    
    // Cap dt to prevent spiral of death
    if (dt > 0.1) dt = 0.1;

    this.accumulatedTime += dt;

    while (this.accumulatedTime >= this.timeStep) {
      this.update(this.timeStep);
      this.accumulatedTime -= this.timeStep;
    }

    this.render(dt); // pass dt for interpolation if needed

    requestAnimationFrame(this.boundLoop);
  }

  update(dt) {
    const state = this.stateManager.current;
    
    this.physics.update(dt);
    this.particles.update(dt);
    this.towerManager.update(dt, this.canvas.width);
    
    if (state === STATES.PURGE_MODE) {
      this.infectionManager.update(dt);
      if (this.infectionManager.isCorruptionAtTop()) {
         this.stateManager.transition(STATES.GAME_OVER);
      }
    }
    
    if (state === STATES.FLIP_TO_PURGE) {
      this.flipTimer += dt;
      let t = Math.min(1, this.flipTimer / this.flipDuration);
      let r = easeInOutCubic(t) * Math.PI;
      
      this.renderer.setRotation(r);
      
      if (t >= 1) {
        this.gameState.isPurgeMode = true;
        this.cameraManager.setState(CameraTransitionState.PURGE);
        this.stateManager.transition(STATES.PURGE_MODE);
        this.infectionManager.startSpread();
      }
    } else if (state === STATES.FLIP_TO_STACK) {
      this.flipTimer += dt;
      let t = Math.min(1, this.flipTimer / this.flipDuration);
      // from PI to 2PI
      let r = Math.PI + easeInOutCubic(t) * Math.PI;
      
      this.renderer.setRotation(r);
      
      if (t >= 1) {
        this.renderer.setRotation(0);
        this.gameState.isPurgeMode = false;
        this.cameraManager.setState(CameraTransitionState.STACK);
        this.stateManager.transition(STATES.STACK_MODE);
      }
    }
    
    // Update camera and effects
    this.renderer.updateEffects(dt);
    
    if (state !== STATES.MENU) {
       this.cameraManager.update(dt);
       const transform = this.cameraManager.getTransform();
       this.renderer.setCameraPosition(transform.y);
    }
  }

  render(dt) {
    this.renderer.beginFrame(dt, this.gameState.isPurgeMode);
    
    this.towerManager.render(this.renderer.ctx);
    this.particles.render(this.renderer.ctx);
    this.physics.render(this.renderer.ctx);
    this.cameraManager.renderDebug(this.renderer.ctx);
    
    this.renderer.endFrame();
  }
}

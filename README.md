# FlipStack: Infection Protocol

FlipStack: Infection Protocol is a tense, endless arcade stacking game built entirely in Vanilla JavaScript and HTML5 Canvas. It takes the traditional block-stacking genre and introduces a high-stakes risk-management layer called the **Flip Mechanic**.

## 🎮 The Core Gameplay Loop

The game continuously cycles between two distinct phases of gameplay, keeping players on their toes:

**BUILD → FLIP → PURGE → FLIP BACK → BUILD**

### 1. Stack Mode (Build)
- **Objective:** Precisely time your taps to drop sliding blocks perfectly on top of your growing tower.
- **Mechanics:** Perfectly aligned blocks grant combo points and slightly enlarge the tower. Misaligned blocks are sliced, narrowing your playable surface.
- **Tension:** As you build higher, the tower accumulates a hidden "Infection Threshold".

### 2. The Flip Sequence
- **Trigger:** Unpredictably, between every 8 to 11 block placements, an **Infection Event** occurs.
- **Rotation:** A loud warning flashes, and the entire game world physically rotates **180 degrees**. The camera pans to keep the tower framed perfectly upside down.

### 3. Purge Mode (Destroy)
- **Objective:** A highly visible **Neon Cyan** infected block is now buried inside the tower. The player must shift from *building* to *destruction*.
- **Mechanics:** Tap the narrow tip of the inverted tower to rapidly pop off the blocks you just placed, digging down to reach and destroy the infection.
- **Risk & Reward:** Tapping an incorrect block counts as a miss. If you clear the infection without a single miss, you are awarded a **Perfect Purge Bonus (+1000 points)**. If you take too long and the corruption reaches the limit, the tower collapses resulting in a Game Over.

---

## 🛠️ Technical Architecture

FlipStack is engineered from the ground up without any external game engines or heavy build tools. It utilizes a highly structured, modular architecture.

- **Engine:** Custom HTML5 Canvas Renderer with an isometric 3D projection system.
- **State Management:** A Finite State Machine (FSM) orchestrates transitions between Menu, Stack Mode, Flip animations, Purge Mode, and Game Over.
- **Camera System:** A dynamic panning system tracks the tower height and properly inverts coordinate framing when the world rotates 180 degrees.
- **Particle System:** Custom object-pooled particle engine for explosions, glowing corruption, and UI feedback.
- **Storage:** LocalStorage wrapping for saving high scores, highest combos, and audio settings.

### Project Structure
```text
/
├── index.html              # Entry point
├── style.css               # Base UI styling
└── src/
    ├── main.js             # Initialization loop
    ├── core/               # GameEngine, Renderer, FSM Constants
    ├── entities/           # Block logic, Particles, Tower Data Structure
    ├── state/              # GameState tracking, StateManager
    ├── systems/            # Physics, Infection calculations, Tower Manager
    ├── systems/camera/     # Modular Stack/Purge camera tracking logic
    ├── ui/                 # HTML UI overlays, Score popups
    └── utils/              # Math helpers, Easing curves, Object Pools
```

## 🚀 How to Play Locally

Because the game uses zero build tools and native ES6 Modules, running it is incredibly simple:

1. Clone the repository:
   ```bash
   git clone https://github.com/prithivirj4706/ABD_game.git
   cd ABD_game
   ```
2. Serve the directory using any local web server. 
   *(Note: You must use a local server rather than just opening the file so the browser doesn't block ES6 module imports due to CORS).*
   
   **Using Python 3:**
   ```bash
   python3 -m http.server 8080
   ```
   **Using Node/NPM (http-server):**
   ```bash
   npx http-server -p 8080
   ```
3. Open your browser and navigate to `http://localhost:8080`.
4. Tap or click to start stacking!

---

*Built by Prithviraj.*

# The Spudling Sorceress

A charming browser-based incremental farming game. Plant, nurture, and harvest magical potatoes and other whimsical crops! Designed for mobile and desktop browsers, the game features a retro emoji/text UI, simple controls, and satisfying idle/active gameplay.

---

## Features

- **Multiple Plots:** Manage several farm plots, each with its own growth cycle and state.
- **Seed Variety:** Plant different magical seeds (e.g., 🥔 Star Spud, 🍓 Giggleberry), each with unique growth times, yields, and costs.
- **Active Nurturing:** Occasionally, a 💧 Nurture opportunity appears on growing crops. Tap it to speed up growth!
- **Upgrades:** Spend your 💎 currency on upgrades like Faster Growth and Better Nurturing. Upgrades have multiple levels and scale in cost and effect.
- **Offline Progress:** The game calculates progress and rewards while you’re away, including estimated nurture bonuses.
- **Responsive UI:** Clean, mobile-friendly interface with emoji-rich feedback and clear visual states for each plot.
- **Sound Feedback:** Simple sound effects for planting, nurturing, harvesting, and upgrades (can be muted in code).
- **Local Save:** All progress is saved automatically in your browser’s local storage.

---

## Gameplay Overview

1. **Awaken Plots:** Tap to awaken empty plots and prepare them for planting.
2. **Select Seeds:** Choose a seed type from the top menu. Each seed has different stats and costs.
3. **Plant & Grow:** Plant your selected seed in an awakened plot. Watch the timer and progress bar.
4. **Nurture:** When a 💧 appears, tap it to reduce the remaining grow time. Upgrades can make nurturing more effective.
5. **Harvest:** When a crop is ready (🌟🥔), tap to harvest and earn 💎. The plot resets to empty.
6. **Upgrade:** Spend 💎 on upgrades to speed up growth, improve nurturing, and unlock more content.
7. **Repeat:** Expand your farm, unlock new seeds, and optimize your strategy!

---

## Project Structure

### Core Files
- `index.html` — Main HTML file, includes templates and accessibility features.
- `style.css` — All game styles, including dark/light mode and responsive design.
- `CLAUDE.md` — Development guidance for Claude Code AI assistance.

### Source Code (src/)
The game logic has been refactored into a modular ES6 structure:

#### Core Systems
- `src/main.js` — Main initialization and coordination
- `src/core/gameState.js` — Game state management and save/load functionality
- `src/core/gameLogic.js` — Core game calculations (grow times, nurture effects)

#### Data & Configuration
- `src/data/gameData.js` — All game constants, seeds, events, and upgrade definitions

#### Systems
- `src/systems/audioSystem.js` — Sound effect generation using Web Audio API
- `src/systems/eventSystem.js` — Special game events handling
- `src/systems/gameLoop.js` — Main game tick and timer management

#### User Interface
- `src/ui/renderer.js` — All UI rendering functions (plots, upgrades, currency)
- `src/ui/eventHandlers.js` — DOM event handling and user interactions
- `src/ui/feedback.js` — User feedback and notification system

### Documentation
- `archive/tasks.md` — Project TODOs and improvement notes
- `vision.md` — Phased development plan and design philosophy

---

## Getting Started

### For Players
1. Download or clone this repository.
2. Open `index.html` in your browser (no server or build step required).
3. Play instantly! Your progress is saved automatically.

### For Development
1. Clone the repository
2. Start a local HTTP server (required for ES6 modules):
   ```bash
   python3 -m http.server 8000
   # or
   npx serve .
   ```
3. Open `http://localhost:8000` in your browser
4. Edit the modular source files in the `src/` directory

---

## Development Notes

### Architecture
- **Modular ES6 Design:** All code is organized into logical modules with clear separation of concerns
- **No Build Process:** Uses native ES6 modules, runs directly in modern browsers
- **Client-Side Only:** No server requirements, all game logic runs in the browser
- **Modern JavaScript:** Uses contemporary patterns like destructuring, arrow functions, and modules

### Development Workflow
- **Main Logic:** Edit files in `src/core/` for game mechanics
- **UI Changes:** Modify `src/ui/` files for interface updates  
- **New Content:** Add seeds/upgrades in `src/data/gameData.js`
- **Styling:** Update `style.css` for visual changes
- **AI Assistance:** Reference `CLAUDE.md` for development guidance

### Customization & Expansion
- **New Seeds:** Add entries to the `SEEDS` object in `src/data/gameData.js`
- **New Upgrades:** Extend `UPGRADE_DEFS` in the same file
- **Game Balance:** Adjust costs, timers, and yields in the data file
- **New Features:** Add modules to appropriate `src/` subdirectories
- **UI Extensions:** The emoji/text design scales easily without graphics

---

## Example Plot States

- **Empty:** `Plot 1: [Empty 💨] (Tap to Awaken)`
- **Awakened:** `Plot 1: [Awakened ✨] (Tap to plant selected seed)`
- **Growing:** `Plot 1: [🌰 Star Spud - [▓▓░░░░░░░] ⏳30s] 💧 Nurture!`
- **Ready:** `Plot 1: [🌟🥔 Star Spud (Ready!)] (Tap to Harvest)`

---

## License

MIT License (see LICENSE)

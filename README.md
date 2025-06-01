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

- `index.html` — Main HTML file, includes templates and accessibility features.
- `main.js` — Game logic, state management, rendering, and event handling.
- `style.css` — All game styles, including dark/light mode and responsive design.
- `tasks.md` — Project TODOs, feature ideas, and improvement notes.
- `vision.md` — Phased development plan, design philosophy, and long-term goals.

---

## Getting Started

1. Download or clone this repository.
2. Open `index.html` in your browser (no server or build step required).
3. Play instantly! Your progress is saved automatically.

---

## Development Notes

- All code is client-side and requires only a modern browser.
- Edit `main.js` and `style.css` to add features or tweak the UI.
- Use `tasks.md` to track bugs, polish, and new ideas.
- See `vision.md` for the full roadmap and design intent.

### Customization & Expansion
- Add new seeds or upgrades by editing the `SEEDS` and `UPGRADE_DEFS` objects in `main.js`.
- Adjust plot count, growth times, or costs to rebalance the game.
- The UI is designed for easy emoji/text expansion—no graphics required!

---

## Example Plot States

- **Empty:** `Plot 1: [Empty 💨] (Tap to Awaken)`
- **Awakened:** `Plot 1: [Awakened ✨] (Tap to plant selected seed)`
- **Growing:** `Plot 1: [🌰 Star Spud - [▓▓░░░░░░░] ⏳30s] 💧 Nurture!`
- **Ready:** `Plot 1: [🌟🥔 Star Spud (Ready!)] (Tap to Harvest)`

---

## License

MIT License (see LICENSE)

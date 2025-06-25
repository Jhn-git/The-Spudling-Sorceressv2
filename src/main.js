import { loadGame } from './core/gameState.js';
import { renderCurrency, renderSeedSelect, renderPlots, renderGlobalActions, showOfflineModal } from './ui/renderer.js';
import { startGameTimers } from './systems/gameLoop.js';
import { initEventHandlers } from './ui/eventHandlers.js';

function initializeGame() {
    const offlineSummary = loadGame();
    renderCurrency();
    renderSeedSelect();
    renderPlots();
    renderGlobalActions();
    initEventHandlers();
    startGameTimers();

    if (offlineSummary) {
        showOfflineModal(offlineSummary);
    }
    console.log("Game Initialized: The Spudling Sorceress");
}

document.addEventListener('DOMContentLoaded', initializeGame);

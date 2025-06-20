import { loadGame, gameState } from './core/gameState.js';
import { renderCurrency, renderSeedSelect, renderPlots, renderGlobalActions } from './ui/renderer.js';
import { initEventHandlers } from './ui/eventHandlers.js';
import { startGameTimers } from './systems/gameLoop.js';
import { showFeedback } from './ui/feedback.js';

function initializeGame() {
    loadGame();
    renderCurrency();
    renderSeedSelect();
    renderPlots();
    renderGlobalActions();
    startGameTimers();
    initEventHandlers();

    if (gameState.offlineSummary) {
        showFeedback(gameState.offlineSummary, null);
        gameState.offlineSummary = '';
    }
    console.log("Game Initialized: The Spudling Sorceress");
}

document.addEventListener('DOMContentLoaded', initializeGame);
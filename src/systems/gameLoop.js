import { GAME_CONSTANTS } from '../data/gameData.js';
import { gameState, saveGame } from '../core/gameState.js';
import { renderPlots, renderCurrency, renderGlobalActions } from '../ui/renderer.js';
import { handleActiveEvents } from './eventSystem.js';

export function gameTick() {
    let needsRender = false;

    handleActiveEvents();

    gameState.plots.forEach((plot, index) => {
        if (plot.state === 'growing') {
            needsRender = true;
            
            if (!plot.nurtureActive && Math.random() < GAME_CONSTANTS.NURTURE_CHANCE_PER_SECOND) {
                plot.nurtureActive = true;
                setTimeout(() => {
                    if (plot.nurtureActive) {
                        plot.nurtureActive = false;
                        if (plot.state === 'growing') {
                            renderPlots();
                        }
                    }
                }, GAME_CONSTANTS.NURTURE_WINDOW * 1000);
            }

            plot.timeLeft--;

            if (plot.timeLeft <= 0) {
                plot.state = 'ready';
                plot.timeLeft = 0;
                plot.nurtureActive = false;
            }
        }
    });

    if (needsRender) {
        renderPlots();
        renderGlobalActions();
    }
    renderCurrency();
    saveGame();
}

export function startGameTimers() {
    if (gameState.gameTickInterval) clearInterval(gameState.gameTickInterval);
    gameState.gameTickInterval = setInterval(gameTick, 1000);
}
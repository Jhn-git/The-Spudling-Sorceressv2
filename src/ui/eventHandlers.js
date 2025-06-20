import { SEEDS, UPGRADE_DEFS, GAME_EVENTS } from '../data/gameData.js';
import { gameState, saveGame } from '../core/gameState.js';
import { getCurrentGrowTime, getCurrentNurtureTimeReduction } from '../core/gameLogic.js';
import { renderPlots, renderCurrency, renderSeedSelect, renderGlobalActions } from './renderer.js';
import { showFeedback } from './feedback.js';

function getElements() {
    return {
        seedSelectControls: document.getElementById('seed-select-controls'),
        plotListArea: document.getElementById('plot-list-area'),
        upgradeListUl: document.getElementById('upgrade-list'),
        harvestAllBtn: document.getElementById('harvest-all-btn'),
        replantAllBtn: document.getElementById('replant-all-btn')
    };
}

export function initEventHandlers() {
    const { seedSelectControls, plotListArea, upgradeListUl, harvestAllBtn, replantAllBtn } = getElements();
    
    if (seedSelectControls) seedSelectControls.addEventListener('click', handleSeedSelection);
    if (plotListArea) plotListArea.addEventListener('click', handlePlotActions);
    if (upgradeListUl) upgradeListUl.addEventListener('click', handleUpgradePurchase);
    if (harvestAllBtn) harvestAllBtn.addEventListener('click', handleHarvestAll);
    if (replantAllBtn) replantAllBtn.addEventListener('click', handleReplantAll);
}

function handleSeedSelection(e) {
    const seedButton = e.target.closest('.seed-btn');
    if (seedButton && seedButton.dataset.seed) {
        gameState.selectedSeed = seedButton.dataset.seed;
        renderSeedSelect();
        renderGlobalActions();
        showFeedback(`Selected: ${SEEDS[gameState.selectedSeed].name} for planting.`, null);
    }
}

function handlePlotActions(e) {
    const target = e.target;
    const plotItemLi = target.closest('.plot-item');
    if (!plotItemLi) return;

    const plotIndex = parseInt(plotItemLi.dataset.plotIndex);
    const plot = gameState.plots[plotIndex];

    const awakenButton = target.closest('.awaken-btn');
    const plantButton = target.closest('.plant-btn');
    const nurtureButton = target.closest('.nurture-btn');
    const harvestButton = target.closest('.harvest-btn');

    if (awakenButton && plot.state === 'empty') {
        plot.state = 'awakened';
        showFeedback(`Plot ${plotIndex + 1} awakened! ✨`, 'awaken');
    } else if (plantButton && plot.state === 'awakened') {
        const seedInfo = SEEDS[gameState.selectedSeed];
        if (gameState.currency >= seedInfo.cost) {
            gameState.currency -= seedInfo.cost;
            plot.state = 'growing';
            plot.seed = gameState.selectedSeed;
            plot.plantedAt = Date.now();
            plot.growTimeSnapshot = getCurrentGrowTime(gameState.selectedSeed);
            plot.timeLeft = plot.growTimeSnapshot;
            plot.nurtureActive = false;
            showFeedback(`${seedInfo.name} planted on Plot ${plotIndex + 1}!`, 'plant');
        } else {
            showFeedback('Not enough 💎 to plant!', 'error');
        }
    } else if (nurtureButton && plot.state === 'growing' && plot.nurtureActive) {
        plot.timeLeft = Math.max(0, plot.timeLeft - getCurrentNurtureTimeReduction());
        plot.nurtureActive = false;
        showFeedback('Nurtured! ✨', 'nurture');
    } else if (harvestButton && plot.state === 'ready') {
        const harvestedYield = SEEDS[plot.seed].yield;
        gameState.currency += harvestedYield;
        showFeedback(`Harvested ${SEEDS[plot.seed].name}! +${harvestedYield}💎`, 'harvest');
        gameState.plots[plotIndex] = { state: 'empty', seed: null, plantedAt: null, timeLeft: 0, nurtureActive: false, growTimeSnapshot: 0 };
    } else {
        if (plot.state === 'growing' && plot.nurtureActive) {
             plot.timeLeft = Math.max(0, plot.timeLeft - getCurrentNurtureTimeReduction());
             plot.nurtureActive = false;
             showFeedback('Nurtured! ✨', 'nurture');
        }
    }

    saveGame();
    renderPlots();
    renderCurrency();
}

function handleUpgradePurchase(e) {
    const purchaseButton = e.target.closest('.upgrade-purchase-btn');
    if (!purchaseButton || purchaseButton.disabled) return;

    const upgradeItemLi = e.target.closest('.upgrade-item');
    if (!upgradeItemLi) return;

    const upgradeKey = upgradeItemLi.dataset.upgradeKey;
    const def = UPGRADE_DEFS[upgradeKey];
    const currentLevel = gameState.upgrades[upgradeKey] || 0;

    if (currentLevel < def.maxLevel) {
        const cost = def.cost[currentLevel];
        if (gameState.currency >= cost) {
            gameState.currency -= cost;
            gameState.upgrades[upgradeKey] = currentLevel + 1;
            
            if (upgradeKey === 'unlock_plot') {
                const firstLockedPlotIndex = gameState.plots.findIndex(p => p.state === 'locked');
                if (firstLockedPlotIndex !== -1) {
                    gameState.plots[firstLockedPlotIndex].state = 'empty';
                }
                showFeedback(`New plot unlocked!`, 'upgrade');
            } else {
                showFeedback(`Upgraded: ${def.name} to Lv ${gameState.upgrades[upgradeKey]}!`, 'upgrade');
            }
            
            saveGame();
            renderCurrency();
            renderPlots();
        } else {
            showFeedback('Not enough 💎!', 'error');
        }
    }
}

function handleHarvestAll() {
    let harvestedCount = 0;
    let totalYield = 0;

    gameState.plots.forEach((plot, index) => {
        if (plot.state === 'ready') {
            let harvestedYield = SEEDS[plot.seed].yield;
            if (gameState.activeEvent && gameState.activeEvent.key === 'harvest_frenzy') {
                harvestedYield = GAME_EVENTS.harvest_frenzy.applyEffect(harvestedYield);
            }
            totalYield += harvestedYield;
            harvestedCount++;
            gameState.plots[index] = { state: 'empty', seed: null, plantedAt: null, timeLeft: 0, nurtureActive: false, growTimeSnapshot: 0 };
        }
    });

    if (harvestedCount > 0) {
        gameState.currency += totalYield;
        showFeedback(`Harvested ${harvestedCount} plots for +${totalYield}💎!`, 'harvest');
        saveGame();
        renderPlots();
        renderCurrency();
    }
}

function handleReplantAll() {
    let plantedCount = 0;
    const seedInfo = SEEDS[gameState.selectedSeed];

    gameState.plots.forEach((plot, index) => {
        if (plot.state === 'empty' && gameState.currency >= seedInfo.cost) {
            gameState.currency -= seedInfo.cost;
            gameState.plots[index] = {
                state: 'growing',
                seed: gameState.selectedSeed,
                plantedAt: Date.now(),
                growTimeSnapshot: getCurrentGrowTime(gameState.selectedSeed),
                timeLeft: getCurrentGrowTime(gameState.selectedSeed),
                nurtureActive: false
            };
            plantedCount++;
        }
    });

    if (plantedCount > 0) {
        showFeedback(`Planted ${seedInfo.name} on ${plantedCount} plots!`, 'plant');
        saveGame();
        renderPlots();
        renderCurrency();
    }
}
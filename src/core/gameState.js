import { STORAGE_KEYS, SEEDS, UPGRADE_DEFS } from '../data/gameData.js';

export let gameState = {
    currency: 0,
    plots: [
        { state: 'empty', seed: null, plantedAt: null, timeLeft: 0, nurtureActive: false, growTimeSnapshot: 0 },
        { state: 'locked', seed: null, plantedAt: null, timeLeft: 0, nurtureActive: false, growTimeSnapshot: 0 },
        { state: 'locked', seed: null, plantedAt: null, timeLeft: 0, nurtureActive: false, growTimeSnapshot: 0 }
    ],
    upgrades: { faster_growth: 0, better_nurture: 0, unlock_plot: 0 },
    selectedSeed: 'star_spud',
    gameTickInterval: null,
    offlineSummary: '',
    activeEvent: null
};

export function saveGame() {
    localStorage.setItem(STORAGE_KEYS.CURRENCY, gameState.currency);
    localStorage.setItem(STORAGE_KEYS.PLOTS, JSON.stringify(gameState.plots));
    localStorage.setItem(STORAGE_KEYS.UPGRADES, JSON.stringify(gameState.upgrades));
    localStorage.setItem(STORAGE_KEYS.LAST_TIME, Date.now());
}

export function loadGame() {
    gameState.currency = parseInt(localStorage.getItem(STORAGE_KEYS.CURRENCY)) || 0;
    const savedPlots = localStorage.getItem(STORAGE_KEYS.PLOTS);
    if (savedPlots) gameState.plots = JSON.parse(savedPlots);
    const savedUpgrades = localStorage.getItem(STORAGE_KEYS.UPGRADES);
    if (savedUpgrades) gameState.upgrades = JSON.parse(savedUpgrades);

    // Migration code for old saves
    if (!gameState.upgrades.hasOwnProperty('unlock_plot')) {
        gameState.upgrades.unlock_plot = 0;
    }
    
    // Migration code for plots
    gameState.plots.forEach((plot, index) => {
        if (!plot.hasOwnProperty('growTimeSnapshot')) {
            plot.growTimeSnapshot = 0;
        }
        const validStates = ['empty', 'awakened', 'growing', 'ready', 'locked'];
        if (!validStates.includes(plot.state)) {
            plot.state = 'empty';
            plot.seed = null;
            plot.plantedAt = null;
            plot.timeLeft = 0;
            plot.nurtureActive = false;
            plot.growTimeSnapshot = 0;
        }
    });

    // Ensure we have the expected number of plots
    while (gameState.plots.length < 3) {
        gameState.plots.push({ state: 'locked', seed: null, plantedAt: null, timeLeft: 0, nurtureActive: false, growTimeSnapshot: 0 });
    }

    calculateOfflineProgress();
}

export function calculateOfflineProgress() {
    const lastTime = parseInt(localStorage.getItem(STORAGE_KEYS.LAST_TIME) || Date.now());
    const now = Date.now();
    const elapsedSeconds = Math.floor((now - lastTime) / 1000);

    let totalGainedCurrency = 0;
    let totalNurtureTimeSaved = 0;

    gameState.plots.forEach((plot) => {
        if (plot.state === 'growing' && plot.plantedAt) {
            let estimatedNurtureOpportunities = Math.floor(elapsedSeconds * 0.18); // NURTURE_CHANCE_PER_SECOND
            let nurtureTimeReductionForPlot = estimatedNurtureOpportunities * 5; // BASE_NURTURE_TIME_REDUCTION
            totalNurtureTimeSaved += nurtureTimeReductionForPlot;

            let timeToAdvance = elapsedSeconds + nurtureTimeReductionForPlot;
            
            if (plot.timeLeft <= timeToAdvance) {
                totalGainedCurrency += SEEDS[plot.seed].yield;
                plot.state = 'ready';
                plot.timeLeft = 0;
                plot.nurtureActive = false;
            } else {
                plot.timeLeft -= timeToAdvance;
            }
        }
    });

    if (totalGainedCurrency > 0) {
        gameState.currency += totalGainedCurrency;
        gameState.offlineSummary = `Welcome back! While you were away, ${totalGainedCurrency}💎 was earned.`;
        if (totalNurtureTimeSaved > 0) {
            gameState.offlineSummary += ` (Nurture bonus saved ~${totalNurtureTimeSaved}s of growth time!)`;
        }
    }

    const offlineRewards = {
        totalGainedCurrency,
        report: gameState.offlineSummary
    };

    if (typeof window !== 'undefined') {
        window.offlineRewards = offlineRewards;
    }
}
// --- Game State (Same as before, ensure it matches your constants) ---
const PLOTS_KEY = 'spudling_plots';
const CURRENCY_KEY = 'spudling_currency';
const LAST_TIME_KEY = 'spudling_last_time';
const UPGRADE_KEY = 'spudling_upgrades';

const SEEDS = {
    star_spud: {
        name: 'Star Spud',
        emoji: '🥔',
        plantEmoji: '🌰',
        readyEmoji: '🌟🥔',
        growTime: 60, // Base grow time in seconds
        yield: 10,
        cost: 0
    },
    giggleberry: {
        name: 'Giggleberry',
        emoji: '🍓',
        plantEmoji: '🌱',
        readyEmoji: '🌟🍓',
        growTime: 90,
        yield: 18,
        cost: 5
    }
    // Add more seeds here
};

const NURTURE_EMOJI = '💧';
const BASE_NURTURE_TIME_REDUCTION = 5; // seconds reduced per nurture (base)
const NURTURE_WINDOW = 4; // seconds nurture emoji is visible
const NURTURE_CHANCE_PER_SECOND = 0.18; // chance per tick to show nurture

const UPGRADE_DEFS = {
    faster_growth: {
        name: 'Faster Growth',
        descTemplate: (effect) => `Time Multiplier: ${(effect * 100).toFixed(0)}%`,
        cost: [50, 120, 300, 800, 2000], // cost per level (index 0 is for level 1)
        effect: [0.9, 0.81, 0.729, 0.6561, 0.59049], // cumulative multiplier per level
        maxLevel: 5
    },
    better_nurture: {
        name: 'Better Nurturing',
        descTemplate: (effect) => `Nurture Bonus: +${effect}s`,
        cost: [40, 100, 250, 600, 1500],
        effect: [7, 9, 11, 13, 15], // seconds reduced per level
        maxLevel: 5
    }
    // Add more upgrade definitions here
};

let currency = 0;
let plots = [
    { state: 'empty', seed: null, plantedAt: null, timeLeft: 0, nurtureActive: false, growTimeSnapshot: 0 },
    { state: 'empty', seed: null, plantedAt: null, timeLeft: 0, nurtureActive: false, growTimeSnapshot: 0 },
    { state: 'empty', seed: null, plantedAt: null, timeLeft: 0, nurtureActive: false, growTimeSnapshot: 0 }
];
let upgrades = { faster_growth: 0, better_nurture: 0 }; // Stores current level (0 = not owned)
let selectedSeed = 'star_spud';
let gameTickInterval = null;
let offlineSummary = '';

// --- DOM Elements ---
const currencyEl = document.getElementById('currency');
const plotListArea = document.getElementById('plot-list-area'); // Changed from plotArea
const feedbackEl = document.getElementById('feedback');
const seedSelectControls = document.getElementById('seed-select-controls'); // For event delegation on seed buttons
const upgradeListUl = document.getElementById('upgrade-list'); // The UL for upgrades

const plotTemplate = document.getElementById('plot-template').content;
const upgradeTemplate = document.getElementById('upgrade-template').content;

// --- Utility Functions ---
function saveGame() {
    localStorage.setItem(CURRENCY_KEY, currency);
    localStorage.setItem(PLOTS_KEY, JSON.stringify(plots));
    localStorage.setItem(UPGRADE_KEY, JSON.stringify(upgrades));
    localStorage.setItem(LAST_TIME_KEY, Date.now());
}

function loadGame() {
    currency = parseInt(localStorage.getItem(CURRENCY_KEY)) || 0;
    const savedPlots = localStorage.getItem(PLOTS_KEY);
    if (savedPlots) plots = JSON.parse(savedPlots);
    const savedUpgrades = localStorage.getItem(UPGRADE_KEY);
    if (savedUpgrades) upgrades = JSON.parse(savedUpgrades);

    // Offline progress
    const lastTime = parseInt(localStorage.getItem(LAST_TIME_KEY) || Date.now());
    const now = Date.now();
    const elapsedSeconds = Math.floor((now - lastTime) / 1000);
    let totalGainedCurrency = 0;
    let totalNurtureTimeSaved = 0;

    plots.forEach((plot) => {
        if (plot.state === 'growing' && plot.plantedAt) {
            // Estimate nurtures during offline period
            // This is a heuristic: assumes constant chance and immediate effect for simplicity
            let estimatedNurtures = Math.floor(elapsedSeconds * NURTURE_CHANCE_PER_SECOND);
            let nurtureTimeReductionForPlot = estimatedNurtures * getCurrentNurtureTimeReduction();
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
        currency += totalGainedCurrency;
        offlineSummary = `Welcome back! While you were away, ${totalGainedCurrency}💎 was earned.`;
        if (totalNurtureTimeSaved > 0) {
            offlineSummary += ` Estimated nurture bonus saved ${totalNurtureTimeSaved}s.`;
        }
    }
}

function getCurrentGrowTime(seedKey) {
    let baseTime = SEEDS[seedKey].growTime;
    const growthLevel = upgrades.faster_growth;
    if (growthLevel > 0 && UPGRADE_DEFS.faster_growth.effect[growthLevel - 1]) {
        baseTime *= UPGRADE_DEFS.faster_growth.effect[growthLevel - 1];
    }
    return Math.floor(baseTime);
}

function getCurrentNurtureTimeReduction() {
    const nurtureLevel = upgrades.better_nurture;
    if (nurtureLevel > 0 && UPGRADE_DEFS.better_nurture.effect[nurtureLevel - 1]) {
        return UPGRADE_DEFS.better_nurture.effect[nurtureLevel - 1];
    }
    return BASE_NURTURE_TIME_REDUCTION;
}

function playSound(type) {
    // Basic sound implementation (same as before)
    if (!window.AudioContext && !window.webkitAudioContext) return;
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    let freq = 440;
    if (type === 'harvest') freq = 660;
    if (type === 'nurture') freq = 880;
    if (type === 'upgrade') freq = 550;
    if (type === 'plant') freq = 330;
    if (type === 'awaken') freq = 220;
    if (type === 'error') freq = 110;

    const o = ctx.createOscillator();
    o.type = 'triangle'; // triangle, sine, square, sawtooth
    o.frequency.setValueAtTime(freq, ctx.currentTime);

    const g = ctx.createGain();
    g.gain.setValueAtTime(0.08, ctx.currentTime); // Volume
    g.gain.exponentialRampToValueAtTime(0.00001, ctx.currentTime + 0.18); // Fade out

    o.connect(g).connect(ctx.destination);
    o.start();
    o.stop(ctx.currentTime + 0.18); // Duration of the sound
    setTimeout(() => { // Close context after sound finishes to free resources
        if (ctx.state !== 'closed') {
            ctx.close().catch(e => console.warn("AudioContext close error:", e));
        }
    }, 250);
}


function showFeedback(msg, soundType = null) {
    feedbackEl.textContent = msg;
    if (soundType) playSound(soundType);
    setTimeout(() => {
        if (feedbackEl.textContent === msg) feedbackEl.textContent = ''; // Clear only if it's the same message
    }, 2000);
}


// --- Rendering Functions (Adapted for Templates) ---

function renderPlots() {
    plotListArea.innerHTML = ''; // Clear previous plots

    plots.forEach((plot, index) => {
        const plotNode = plotTemplate.cloneNode(true);
        const plotItemLi = plotNode.querySelector('.plot-item');
        plotItemLi.dataset.plotIndex = index;
        plotItemLi.setAttribute('aria-label', `Plot ${index + 1}, state: ${plot.state}`);

        plotNode.querySelector('.plot-name-label').textContent = `Plot ${index + 1}:`;
        const stateIndicator = plotNode.querySelector('.plot-state-indicator');
        const progressBarSpan = plotNode.querySelector('.plot-progress-bar');
        const timerSpan = plotNode.querySelector('.plot-timer');

        // Hide all action buttons by default
        plotNode.querySelectorAll('.plot-action-btn').forEach(btn => btn.style.display = 'none');

        let stateText = '';
        progressBarSpan.textContent = '';
        timerSpan.textContent = '';

        if (plot.state === 'empty') {
            stateText = '[Empty 💨]';
            plotNode.querySelector('.awaken-btn').style.display = 'inline-block';
        } else if (plot.state === 'awakened') {
            stateText = '[Awakened ✨]';
            plotNode.querySelector('.plant-btn').style.display = 'inline-block';
        } else if (plot.state === 'growing') {
            const seedInfo = SEEDS[plot.seed];
            stateText = `[${seedInfo.plantEmoji} ${seedInfo.name}]`;
            
            // Progress bar
            let progress = 0;
            if (plot.growTimeSnapshot > 0) { // Ensure growTimeSnapshot is set
                 progress = Math.max(0, Math.min(1, 1 - plot.timeLeft / plot.growTimeSnapshot));
            }
            let barLen = 8;
            let filled = Math.round(progress * barLen);
            progressBarSpan.textContent = `Progress: [${'▓'.repeat(filled)}${'░'.repeat(barLen - filled)}]`;
            timerSpan.textContent = `⏳${plot.timeLeft}s`;

            if (plot.nurtureActive) {
                plotNode.querySelector('.nurture-btn').style.display = 'inline-block';
                plotNode.querySelector('.nurture-btn').textContent = `${NURTURE_EMOJI} Nurture!`;
            }
        } else if (plot.state === 'ready') {
            const seedInfo = SEEDS[plot.seed];
            stateText = `[${seedInfo.readyEmoji} ${seedInfo.name} (Ready!)]`;
            plotNode.querySelector('.harvest-btn').style.display = 'inline-block';
        }
        stateIndicator.textContent = stateText;
        plotListArea.appendChild(plotNode);
    });
}

function renderUpgrades() {
    upgradeListUl.innerHTML = ''; // Clear previous list

    Object.keys(UPGRADE_DEFS).forEach(key => {
        const def = UPGRADE_DEFS[key];
        const currentLevel = upgrades[key] || 0; // 0 if not owned

        const upgradeNode = upgradeTemplate.cloneNode(true);
        const upgradeItemLi = upgradeNode.querySelector('.upgrade-item');
        upgradeItemLi.dataset.upgradeKey = key;

        const nameEl = upgradeNode.querySelector('.upgrade-name');
        const descEl = upgradeNode.querySelector('.upgrade-description');
        const purchaseBtn = upgradeNode.querySelector('.upgrade-purchase-btn');
        const costSpan = upgradeNode.querySelector('.upgrade-cost');

        nameEl.textContent = `${def.name} (Lv ${currentLevel})`;

        if (currentLevel < def.maxLevel) {
            const nextLevelEffect = def.effect[currentLevel]; // Effect of the level they are buying
            descEl.textContent = `Next: ${def.descTemplate(nextLevelEffect)}`;
            costSpan.textContent = def.cost[currentLevel];
            purchaseBtn.disabled = currency < def.cost[currentLevel];
            purchaseBtn.innerHTML = `Cost: <span class="upgrade-cost">${def.cost[currentLevel]}</span>💎 [Upgrade]`;
        } else {
            descEl.textContent = `Max Level Reached! (${def.descTemplate(def.effect[currentLevel -1])})`;
            purchaseBtn.disabled = true;
            purchaseBtn.textContent = '[Max Level]';
        }
        upgradeListUl.appendChild(upgradeNode);
    });
}

function renderCurrency() {
    currencyEl.textContent = currency;
    // Potentially re-render upgrades if currency change might enable buttons
    renderUpgrades();
}

function renderSeedSelect() {
    const seedButtons = seedSelectControls.querySelectorAll('.seed-btn');
    seedButtons.forEach(btn => {
        const seedKey = btn.dataset.seed;
        const seedInfo = SEEDS[seedKey];
        btn.classList.toggle('selected', seedKey === selectedSeed);
        btn.textContent = `Plant ${seedInfo.emoji} ${seedInfo.name}`;
        if (seedInfo.cost > 0) {
            btn.textContent += ` (Cost: ${seedInfo.cost}💎)`;
        }
    });
}

// --- Game Logic / Tick ---
function gameTick() {
    let needsRender = false;
    plots.forEach((plot, index) => {
        if (plot.state === 'growing') {
            needsRender = true; // Assume render needed if anything is growing for timer update
            // Nurture chance
            if (!plot.nurtureActive && Math.random() < NURTURE_CHANCE_PER_SECOND) {
                plot.nurtureActive = true;
                setTimeout(() => {
                    if (plot.nurtureActive) { // Check if it wasn't already nurtured
                        plot.nurtureActive = false;
                        if (plot.state === 'growing') renderPlots(); // Re-render if still growing to remove nurture
                    }
                }, NURTURE_WINDOW * 1000);
            }

            plot.timeLeft--;

            if (plot.timeLeft <= 0) {
                plot.state = 'ready';
                plot.timeLeft = 0;
                plot.nurtureActive = false; // Clear nurture if it becomes ready
            }
        }
    });

    if (needsRender) {
        renderPlots(); // Update timers and progress bars
    }
    renderCurrency(); // Update currency display (might also re-render upgrades)
    saveGame();
}

function startGameTimers() {
    if (gameTickInterval) clearInterval(gameTickInterval);
    gameTickInterval = setInterval(gameTick, 1000);
}

// --- Event Handlers (Using Event Delegation) ---

seedSelectControls.addEventListener('click', (e) => {
    const seedButton = e.target.closest('.seed-btn');
    if (seedButton && seedButton.dataset.seed) {
        selectedSeed = seedButton.dataset.seed;
        renderSeedSelect();
        // Potentially provide feedback or visual cue for selection
        // showFeedback(`Selected: ${SEEDS[selectedSeed].name}`);
    }
});

plotListArea.addEventListener('click', (e) => {
    const target = e.target;
    const plotItemLi = target.closest('.plot-item');
    if (!plotItemLi) return;

    const plotIndex = parseInt(plotItemLi.dataset.plotIndex);
    const plot = plots[plotIndex];

    // Determine which button within the plot was clicked (if any)
    const awakenButton = target.closest('.awaken-btn');
    const plantButton = target.closest('.plant-btn');
    const nurtureButton = target.closest('.nurture-btn');
    const harvestButton = target.closest('.harvest-btn');

    if (awakenButton && plot.state === 'empty') {
        plot.state = 'awakened';
        showFeedback(`Plot ${plotIndex + 1} awakened! ✨`, 'awaken');
    } else if (plantButton && plot.state === 'awakened') {
        const seedInfo = SEEDS[selectedSeed];
        if (currency >= seedInfo.cost) {
            currency -= seedInfo.cost;
            plot.state = 'growing';
            plot.seed = selectedSeed;
            plot.plantedAt = Date.now();
            plot.growTimeSnapshot = getCurrentGrowTime(selectedSeed); // Snapshot for progress bar
            plot.timeLeft = plot.growTimeSnapshot;
            plot.nurtureActive = false;
            showFeedback(`${seedInfo.name} planted on Plot ${plotIndex + 1}!`, 'plant');
        } else {
            showFeedback('Not enough 💎 to plant!', 'error');
        }
    } else if (nurtureButton && plot.state === 'growing' && plot.nurtureActive) {
        plot.timeLeft = Math.max(0, plot.timeLeft - getCurrentNurtureTimeReduction());
        plot.nurtureActive = false; // Nurture consumed
        showFeedback('Nurtured! ✨', 'nurture');
    } else if (harvestButton && plot.state === 'ready') {
        const harvestedYield = SEEDS[plot.seed].yield;
        currency += harvestedYield;
        showFeedback(`Harvested ${SEEDS[plot.seed].name}! +${harvestedYield}💎`, 'harvest');
        // Reset plot
        plots[plotIndex] = { state: 'empty', seed: null, plantedAt: null, timeLeft: 0, nurtureActive: false, growTimeSnapshot: 0 };
    } else {
        // If no specific button, but a nurture is active, and the plot area was tapped
        if (plot.state === 'growing' && plot.nurtureActive) {
             plot.timeLeft = Math.max(0, plot.timeLeft - getCurrentNurtureTimeReduction());
             plot.nurtureActive = false;
             showFeedback('Nurtured! ✨', 'nurture');
        }
    }

    saveGame();
    renderPlots();
    renderCurrency(); // This will also call renderUpgrades
});


upgradeListUl.addEventListener('click', (e) => {
    const purchaseButton = e.target.closest('.upgrade-purchase-btn');
    if (!purchaseButton || purchaseButton.disabled) return;

    const upgradeItemLi = e.target.closest('.upgrade-item');
    if (!upgradeItemLi) return;

    const upgradeKey = upgradeItemLi.dataset.upgradeKey;
    const def = UPGRADE_DEFS[upgradeKey];
    const currentLevel = upgrades[upgradeKey] || 0;

    if (currentLevel < def.maxLevel) {
        const cost = def.cost[currentLevel];
        if (currency >= cost) {
            currency -= cost;
            upgrades[upgradeKey] = currentLevel + 1;
            showFeedback(`Upgraded: ${def.name} to Lv ${upgrades[upgradeKey]}!`, 'upgrade');
            saveGame();
            renderUpgrades(); // Re-render upgrades to show new level and next cost
            renderCurrency(); // Update currency display
            renderPlots(); // Grow times might change
        } else {
            // This case should ideally be prevented by the button being disabled, but good to have
            showFeedback('Not enough 💎!', 'error');
        }
    }
});


// --- Init ---
function initializeGame() {
    loadGame(); // Load existing game data or defaults
    renderCurrency();
    renderSeedSelect();
    renderUpgrades();
    renderPlots();
    startGameTimers();
    if (offlineSummary) {
        showFeedback(offlineSummary); // Show after initial render
        offlineSummary = ''; // Clear after showing
    }
    console.log("Game Initialized: The Spudling Sorceress");
}

// Wait for the DOM to be fully loaded before initializing
document.addEventListener('DOMContentLoaded', initializeGame);
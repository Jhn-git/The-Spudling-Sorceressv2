// --- Game State ---
const PLOTS_KEY = 'spudling_plots';
const CURRENCY_KEY = 'spudling_currency';
const LAST_TIME_KEY = 'spudling_last_time';
const UPGRADE_KEY = 'spudling_upgrades';

const SEEDS = {
    star_spud: {
        name: 'Star Spud',
        emoji: '🥔',
        plantEmoji: '🌰', // Emoji for the growing state
        readyEmoji: '🌟🥔', // Emoji for the ready-to-harvest state
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
    // Add more seeds here following the same structure
};

const NURTURE_EMOJI = '💧';
const BASE_NURTURE_TIME_REDUCTION = 5; // seconds reduced per nurture (base)
const NURTURE_WINDOW = 4; // seconds nurture emoji is visible before disappearing if not tapped
const NURTURE_CHANCE_PER_SECOND = 0.18; // chance per tick to show nurture opportunity

const GAME_EVENTS = {
    harvest_frenzy: {
        name: 'Harvest Frenzy! 🎉',
        desc: 'All harvests yield +50% 💎 for 60 seconds!',
        duration: 60, // seconds
        applyEffect: (yield) => Math.floor(yield * 1.5)
    },
    super_nurture: {
        name: 'Super Soak! 💧💧',
        desc: 'Nurture taps are twice as effective for 45 seconds!',
        duration: 45,
        applyEffect: (nurtureValue) => nurtureValue * 2
    }
};

const UPGRADE_DEFS = {
    faster_growth: {
        name: 'Faster Growth',
        // descTemplate function creates the descriptive text for the upgrade level
        descTemplate: (effectMultiplier) => `Time Multiplier: ${(effectMultiplier * 100).toFixed(0)}%`,
        cost: [50, 120, 300, 800, 2000], // cost per level (index 0 is for level 1 cost)
        effect: [0.9, 0.81, 0.729, 0.6561, 0.59049], // cumulative multiplier per level (index 0 is for level 1 effect)
        maxLevel: 5
    },
    better_nurture: {
        name: 'Better Nurturing',
        descTemplate: (effectSeconds) => `Nurture Bonus: +${effectSeconds}s`,
        cost: [40, 100, 250, 600, 1500],
        effect: [7, 9, 11, 13, 15], // seconds reduced per level
        maxLevel: 5
    },
    unlock_plot: {
        name: 'Unlock New Plot',
        descTemplate: () => `Unlocks your next farming plot!`,
        cost: [250, 1000], // Cost for plot #2, then plot #3
        effect: [1, 2], // Just for consistency, represents plot number unlocked
        maxLevel: 2 // Max of 3 plots total
    }
    // Add more upgrade definitions here
};

let currency = 0;
let plots = [
    // state: 'empty', 'awakened', 'growing', 'ready', 'locked'
    // growTimeSnapshot: Stores the calculated grow time when planted, for progress bar accuracy
    { state: 'empty', seed: null, plantedAt: null, timeLeft: 0, nurtureActive: false, growTimeSnapshot: 0 },
    { state: 'locked', seed: null, plantedAt: null, timeLeft: 0, nurtureActive: false, growTimeSnapshot: 0 },
    { state: 'locked', seed: null, plantedAt: null, timeLeft: 0, nurtureActive: false, growTimeSnapshot: 0 }
];
let upgrades = { faster_growth: 0, better_nurture: 0, unlock_plot: 0 }; // Stores current level (0 = not owned, 1 = first level, etc.)
let selectedSeed = 'star_spud'; // The currently selected seed for planting
let gameTickInterval = null; // Holds the interval ID for the game tick
let offlineSummary = ''; // Message to display upon returning to the game
let activeEvent = null; // { key: 'harvest_frenzy', timeLeft: 60 } - Not saved, ends on reload

// --- DOM Elements ---
const currencyEl = document.getElementById('currency');
const plotListArea = document.getElementById('plot-list-area'); // The <ul> where plots are rendered
const feedbackEl = document.getElementById('feedback');
const seedSelectControls = document.getElementById('seed-select-controls'); // The div containing seed buttons
const upgradeListUl = document.getElementById('upgrade-list'); // The <ul> where upgrades are rendered
const harvestAllBtn = document.getElementById('harvest-all-btn');
const replantAllBtn = document.getElementById('replant-all-btn');

const plotTemplate = document.getElementById('plot-template').content; // Access the content of the template
const upgradeTemplate = document.getElementById('upgrade-template').content;

// --- Utility Functions ---

/**
 * Saves the current game state to Local Storage.
 */
function saveGame() {
    localStorage.setItem(CURRENCY_KEY, currency);
    localStorage.setItem(PLOTS_KEY, JSON.stringify(plots));
    localStorage.setItem(UPGRADE_KEY, JSON.stringify(upgrades));
    localStorage.setItem(LAST_TIME_KEY, Date.now());
}

/**
 * Loads game state from Local Storage and calculates offline progress.
 */
function loadGame() {
    currency = parseInt(localStorage.getItem(CURRENCY_KEY)) || 0;
    const savedPlots = localStorage.getItem(PLOTS_KEY);
    if (savedPlots) plots = JSON.parse(savedPlots);
    const savedUpgrades = localStorage.getItem(UPGRADE_KEY);
    if (savedUpgrades) upgrades = JSON.parse(savedUpgrades);

    // Migration code for old saves - add missing upgrade properties
    if (!upgrades.hasOwnProperty('unlock_plot')) {
        upgrades.unlock_plot = 0; // Default for new upgrade
    }
    
    // Migration code for plots - ensure all plots have required properties
    plots.forEach((plot, index) => {
        if (!plot.hasOwnProperty('growTimeSnapshot')) {
            plot.growTimeSnapshot = 0;
        }
        // If the plot state is undefined or invalid, reset to a safe state
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
    while (plots.length < 3) {
        plots.push({ state: 'locked', seed: null, plantedAt: null, timeLeft: 0, nurtureActive: false, growTimeSnapshot: 0 });
    }

    // Calculate offline progress
    const lastTime = parseInt(localStorage.getItem(LAST_TIME_KEY) || Date.now());
    const now = Date.now();
    const elapsedSeconds = Math.floor((now - lastTime) / 1000);

    let totalGainedCurrency = 0;
    let totalNurtureTimeSaved = 0;

    plots.forEach((plot) => {
        if (plot.state === 'growing' && plot.plantedAt) {
            // Simulate nurtures during offline period as a heuristic
            // This is an estimate of how many times a nurture *could* have happened
            let estimatedNurtureOpportunities = Math.floor(elapsedSeconds * NURTURE_CHANCE_PER_SECOND);
            let nurtureTimeReductionForPlot = estimatedNurtureOpportunities * getCurrentNurtureTimeReduction();
            totalNurtureTimeSaved += nurtureTimeReductionForPlot; // Accumulate for feedback

            // Total time to advance includes regular elapsed time plus simulated nurture time
            let timeToAdvance = elapsedSeconds + nurtureTimeReductionForPlot;
            
            if (plot.timeLeft <= timeToAdvance) {
                totalGainedCurrency += SEEDS[plot.seed].yield;
                plot.state = 'ready'; // Crop is ready
                plot.timeLeft = 0;
                plot.nurtureActive = false; // Clear any pending nurture
            } else {
                plot.timeLeft -= timeToAdvance; // Subtract advanced time
            }
        }
    });

    if (totalGainedCurrency > 0) {
        currency += totalGainedCurrency;
        offlineSummary = `Welcome back! While you were away, ${totalGainedCurrency}💎 was earned.`;
        if (totalNurtureTimeSaved > 0) {
            offlineSummary += ` (Nurture bonus saved ~${totalNurtureTimeSaved}s of growth time!)`;
        }
    }
}

/**
 * Calculates the current grow time for a seed based on upgrades.
 * @param {string} seedKey - The key of the seed.
 * @returns {number} The calculated grow time in seconds.
 */
function getCurrentGrowTime(seedKey) {
    let baseTime = SEEDS[seedKey].growTime;
    const growthLevel = upgrades.faster_growth; // Get current level of faster_growth upgrade
    if (growthLevel > 0 && UPGRADE_DEFS.faster_growth.effect[growthLevel - 1]) {
        // Apply multiplier if upgrade is active. level-1 because effect array is 0-indexed.
        baseTime *= UPGRADE_DEFS.faster_growth.effect[growthLevel - 1];
    }
    return Math.floor(baseTime); // Return as a whole number
}

/**
 * Calculates the current time reduction per nurture based on upgrades.
 * @returns {number} The time reduction in seconds.
 */
function getCurrentNurtureTimeReduction() {
    const nurtureLevel = upgrades.better_nurture;
    let baseValue = BASE_NURTURE_TIME_REDUCTION; // Default if no upgrade
    if (nurtureLevel > 0 && UPGRADE_DEFS.better_nurture.effect[nurtureLevel - 1]) {
        baseValue = UPGRADE_DEFS.better_nurture.effect[nurtureLevel - 1];
    }
    
    // Apply event effects if active
    if (activeEvent && activeEvent.key === 'super_nurture') {
        return GAME_EVENTS.super_nurture.applyEffect(baseValue);
    }
    return baseValue;
}

/**
 * Plays a simple sound effect using Web Audio API.
 * @param {string} type - Type of sound ('harvest', 'nurture', 'upgrade', 'plant', 'awaken', 'error').
 */
function playSound(type) {
    if (!window.AudioContext && !window.webkitAudioContext) return; // Check for browser support
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    let freq = 440; // Default frequency
    let duration = 0.18; // Default duration

    switch (type) {
        case 'harvest': freq = 660; duration = 0.2; break;
        case 'nurture': freq = 880; duration = 0.15; break;
        case 'upgrade': freq = 550; duration = 0.2; break;
        case 'plant': freq = 330; duration = 0.15; break;
        case 'awaken': freq = 220; duration = 0.1; break;
        case 'error': freq = 110; duration = 0.3; break;
        default: freq = 440; // Fallback
    }

    const o = ctx.createOscillator();
    o.type = 'triangle'; // sine, square, sawtooth
    o.frequency.setValueAtTime(freq, ctx.currentTime);

    const g = ctx.createGain();
    g.gain.setValueAtTime(0.08, ctx.currentTime); // Initial volume
    g.gain.exponentialRampToValueAtTime(0.00001, ctx.currentTime + duration); // Fade out

    o.connect(g).connect(ctx.destination);
    o.start();
    o.stop(ctx.currentTime + duration); // Stop sound after duration

    // Ensure audio context is closed to free resources
    setTimeout(() => {
        if (ctx.state !== 'closed') {
            ctx.close().catch(e => console.warn("AudioContext close error:", e));
        }
    }, duration * 1000 + 50); // Small delay to ensure sound finishes
}

/**
 * Displays a temporary feedback message to the user.
 * @param {string} msg - The message to display.
 * @param {string} [soundType=null] - Optional sound type to play with the message.
 */
function showFeedback(msg, soundType = null) {
    feedbackEl.textContent = msg;
    if (soundType) playSound(soundType);
    // Clear the message after a delay, but only if it hasn't been replaced by a new message
    setTimeout(() => {
        if (feedbackEl.textContent === msg) {
            feedbackEl.textContent = '';
        }
    }, 2000);
}

// --- Rendering Functions ---

/**
 * Renders/updates all plot items in the UI.
 */
function renderPlots() {
    plotListArea.innerHTML = ''; // Clear existing plots before re-rendering

    plots.forEach((plot, index) => {
        const plotNode = plotTemplate.cloneNode(true); // Clone content from the template
        const plotItemLi = plotNode.querySelector('.plot-item');
        plotItemLi.dataset.plotIndex = index; // Store plot index on the li for event handling
        plotItemLi.setAttribute('aria-label', `Plot ${index + 1}, state: ${plot.state}`);

        // Get references to elements within the cloned template
        const nameLabel = plotNode.querySelector('.plot-name-label');
        const stateIndicator = plotNode.querySelector('.plot-state-indicator');
        const plotEmojiSpan = plotNode.querySelector('.plot-emoji'); // New span for specific plant emoji
        const plotPlantNameSpan = plotNode.querySelector('.plot-plant-name'); // New span for plant name
        const plotStatusTextSpan = plotNode.querySelector('.plot-status-text'); // New span for status text like (Ready!)
        const progressBarSpan = plotNode.querySelector('.plot-progress-bar');
        const timerSpan = plotNode.querySelector('.plot-timer');

        // Hide all action buttons by default, then show relevant ones
        const actionButtons = plotNode.querySelectorAll('.plot-action-btn');
        actionButtons.forEach(btn => btn.style.display = 'none');

        // Update plot content based on its state
        nameLabel.textContent = `Plot ${index + 1}:`; // Plot number

        if (plot.state === 'locked') {
            const contentDisplay = plotNode.querySelector('.plot-content-display');
            
            // Hide all the standard action buttons and clear progress/timer
            actionButtons.forEach(btn => btn.style.display = 'none');
            progressBarSpan.textContent = '';
            timerSpan.textContent = '';

            // Set a more descriptive aria-label for accessibility
            plotItemLi.setAttribute('aria-label', `Plot ${index + 1}, locked. Purchase the unlock upgrade in the shop.`);

            // Instead of using the small spans, take over the content display area
            // This gives better control over layout.
            contentDisplay.innerHTML = `
                <div class="locked-plot-info">
                    <span class="locked-plot-title">[Locked 🔒]</span>
                    <p class="locked-plot-text">Purchase "Unlock New Plot" in the shop.</p>
                </div>
            `;
        } else if (plot.state === 'empty') {
            stateIndicator.textContent = '[Empty 💨]';
            plotNode.querySelector('.awaken-btn').style.display = 'inline-block';
            plotEmojiSpan.textContent = ''; // Clear plant emoji
            plotPlantNameSpan.textContent = '';
            plotStatusTextSpan.textContent = '';
            progressBarSpan.textContent = '';
            timerSpan.textContent = '';
        } else if (plot.state === 'awakened') {
            stateIndicator.textContent = '[Awakened ✨]';
            
            const plantBtn = plotNode.querySelector('.plant-btn');
            plantBtn.style.display = 'inline-block';
            
            // Make the Plant button dynamic and informative
            const selectedSeedInfo = SEEDS[selectedSeed];
            plantBtn.textContent = `Plant ${selectedSeedInfo.emoji} ${selectedSeedInfo.name}`;
            // Add cost for extra clarity
            if (selectedSeedInfo.cost > 0) {
                plantBtn.textContent += ` (Cost: ${selectedSeedInfo.cost}💎)`;
            }
            
            plotEmojiSpan.textContent = '';
            plotPlantNameSpan.textContent = '';
            plotStatusTextSpan.textContent = '(Tap to plant selected seed)';
            progressBarSpan.textContent = '';
            timerSpan.textContent = '';
        } else if (plot.state === 'growing') {
            const seedInfo = SEEDS[plot.seed];
            stateIndicator.textContent = ''; // No general indicator, emoji/name replace it
            plotEmojiSpan.textContent = seedInfo.plantEmoji;
            plotPlantNameSpan.textContent = seedInfo.name;
            plotStatusTextSpan.textContent = ''; // No additional status text for growing
            
            // Progress bar
            let progress = 0;
            if (plot.growTimeSnapshot > 0) {
                progress = Math.max(0, Math.min(1, 1 - plot.timeLeft / plot.growTimeSnapshot));
            }
            let barLen = 12; // Length of the progress bar
            let filled = Math.round(progress * barLen);
            progressBarSpan.textContent = `Progress: [${'▓'.repeat(filled)}${'░'.repeat(barLen - filled)}]`;
            timerSpan.textContent = `⏳${plot.timeLeft}s`;

            if (plot.nurtureActive) {
                plotNode.querySelector('.nurture-btn').style.display = 'inline-block';
            }
        } else if (plot.state === 'ready') {
            const seedInfo = SEEDS[plot.seed];
            stateIndicator.textContent = '';
            plotEmojiSpan.textContent = seedInfo.readyEmoji;
            plotPlantNameSpan.textContent = seedInfo.name;
            plotStatusTextSpan.textContent = '(Ready!)';
            plotNode.querySelector('.harvest-btn').style.display = 'inline-block';
            progressBarSpan.textContent = ''; // Clear progress bar
            timerSpan.textContent = '';
        }
        plotListArea.appendChild(plotNode); // Add the fully configured plot item to the list
    });
}

/**
 * Renders/updates the upgrade list in the UI.
 */
function renderUpgrades() {
    upgradeListUl.innerHTML = ''; // Clear existing upgrades before re-rendering

    Object.keys(UPGRADE_DEFS).forEach(key => {
        const def = UPGRADE_DEFS[key];
        const currentLevel = upgrades[key] || 0; // Current level of this upgrade (0 if not purchased yet)
        const nextLevel = currentLevel + 1;

        const upgradeNode = upgradeTemplate.cloneNode(true);
        const upgradeItemLi = upgradeNode.querySelector('.upgrade-item');
        upgradeItemLi.dataset.upgradeKey = key; // Store upgrade key for event handling

        const nameEl = upgradeNode.querySelector('.upgrade-name');
        const descEl = upgradeNode.querySelector('.upgrade-description');
        const purchaseBtn = upgradeNode.querySelector('.upgrade-purchase-btn');
        const costSpan = upgradeNode.querySelector('.upgrade-cost');

        nameEl.textContent = `${def.name} (Lv ${currentLevel})`;

        if (currentLevel < def.maxLevel) {
            const nextLevelCost = def.cost[currentLevel]; // Cost for the NEXT level
            let nextLevelEffectValue;
            let upgradeDisabled = currency < nextLevelCost;

            // Special handling for unlock_plot - disable if all plots are already unlocked
            if (key === 'unlock_plot') {
                const lockedPlotsCount = plots.filter(p => p.state === 'locked').length;
                upgradeDisabled = upgradeDisabled || lockedPlotsCount === 0;
            }

            // Determine what the 'next' effect value is for the description
            if (key === 'faster_growth') {
                nextLevelEffectValue = def.effect[currentLevel]; // Multiplier for next level
            } else if (key === 'better_nurture') {
                nextLevelEffectValue = def.effect[currentLevel]; // Absolute seconds for next level
            }
            descEl.textContent = `Next: ${def.descTemplate(nextLevelEffectValue)}`; // Use the template function
            
            costSpan.textContent = nextLevelCost;
            purchaseBtn.disabled = upgradeDisabled;
            purchaseBtn.innerHTML = `Cost: <span class="upgrade-cost">${nextLevelCost}</span>💎 [Upgrade]`;
        } else {
            // Max level reached
            const maxEffectValue = def.effect[def.maxLevel - 1];
            descEl.textContent = `Max Level! (${def.descTemplate(maxEffectValue)})`;
            purchaseBtn.disabled = true;
            purchaseBtn.textContent = '[Max Level]';
            costSpan.textContent = ''; // Clear cost display
        }
        upgradeListUl.appendChild(upgradeNode);
    });
}

/**
 * Updates the currency display.
 */
function renderCurrency() {
    currencyEl.textContent = currency;
    // Call renderUpgrades here to ensure upgrade button states (disabled/enabled) are updated
    renderUpgrades();
    // Update global action buttons as well since currency affects replant capability
    renderGlobalActions();
}

/**
 * Renders/updates the seed selection buttons.
 */
function renderSeedSelect() {
    const seedButtons = seedSelectControls.querySelectorAll('.seed-btn');
    seedButtons.forEach(btn => {
        const seedKey = btn.dataset.seed;
        const seedInfo = SEEDS[seedKey];
        btn.classList.toggle('selected', seedKey === selectedSeed); // Add/remove 'selected' class
        
        // Update button text including cost
        btn.textContent = `Plant ${seedInfo.emoji} ${seedInfo.name}`;
        if (seedInfo.cost > 0) {
            btn.textContent += ` (Cost: ${seedInfo.cost}💎)`;
        }
        // Also disable if not enough currency to plant
        btn.disabled = currency < seedInfo.cost;
    });
}

/**
 * Renders/updates the global action buttons (Harvest All, Replant All).
 */
function renderGlobalActions() {
    // Check if there are any ready plots for harvesting
    const readyPlots = plots.filter(plot => plot.state === 'ready');
    harvestAllBtn.disabled = readyPlots.length === 0;
    
    // Check if there are any empty plots and if we can afford to plant
    const emptyPlots = plots.filter(plot => plot.state === 'empty');
    const seedInfo = SEEDS[selectedSeed];
    const canAffordToPlant = currency >= seedInfo.cost;
    replantAllBtn.disabled = emptyPlots.length === 0 || !canAffordToPlant;
}

// --- Game Logic / Tick ---

/**
 * The main game loop function, executed every second.
 */
function gameTick() {
    let needsRender = false; // Flag to optimize UI re-renders

    // Handle active events
    if (activeEvent) {
        activeEvent.timeLeft--;
        document.getElementById('event-timer').textContent = activeEvent.timeLeft;
        if (activeEvent.timeLeft <= 0) {
            activeEvent = null;
            document.getElementById('event-banner').style.display = 'none';
            showFeedback('The event has ended!', null);
        }
    } else {
        // Start a new event randomly (1% chance each second)
        if (Math.random() < 0.01) {
            const eventKeys = Object.keys(GAME_EVENTS);
            const randomEventKey = eventKeys[Math.floor(Math.random() * eventKeys.length)];
            activeEvent = {
                key: randomEventKey,
                timeLeft: GAME_EVENTS[randomEventKey].duration
            };
            // Show banner
            const banner = document.getElementById('event-banner');
            document.getElementById('event-name').textContent = GAME_EVENTS[randomEventKey].name;
            document.getElementById('event-desc').textContent = GAME_EVENTS[randomEventKey].desc;
            document.getElementById('event-timer').textContent = activeEvent.timeLeft;
            banner.style.display = 'block';
            showFeedback('A special event has started!', 'upgrade');
        }
    }

    plots.forEach((plot, index) => {
        if (plot.state === 'growing') {
            needsRender = true; // Something is growing, so UI needs update
            
            // Nurture chance: if no nurture active, try to spawn one
            if (!plot.nurtureActive && Math.random() < NURTURE_CHANCE_PER_SECOND) {
                plot.nurtureActive = true;
                // Set a timeout for the nurture emoji to disappear if not tapped
                setTimeout(() => {
                    if (plot.nurtureActive) { // Check if it's still active (wasn't tapped)
                        plot.nurtureActive = false;
                        if (plot.state === 'growing') { // Only re-render if plot is still growing
                            renderPlots(); // Update UI to remove nurture emoji
                        }
                    }
                }, NURTURE_WINDOW * 1000);
            }

            plot.timeLeft--; // Decrement time remaining

            if (plot.timeLeft <= 0) {
                plot.state = 'ready'; // Crop is ready to harvest
                plot.timeLeft = 0;
                plot.nurtureActive = false; // Clear any pending nurture
            }
        }
    });

    if (needsRender) {
        renderPlots(); // Update plot timers and progress bars
        renderGlobalActions(); // Update global action button states
    }
    renderCurrency(); // Update currency and re-render upgrades
    saveGame(); // Save game state every tick
}

/**
 * Starts the main game loop timer.
 */
function startGameTimers() {
    if (gameTickInterval) clearInterval(gameTickInterval); // Clear any existing interval
    gameTickInterval = setInterval(gameTick, 1000); // Set new interval for 1 second ticks
}

// --- Event Handlers (Using Event Delegation for Efficiency) ---

/**
 * Handles clicks on the seed selection buttons.
 */
seedSelectControls.addEventListener('click', (e) => {
    const seedButton = e.target.closest('.seed-btn');
    if (seedButton && seedButton.dataset.seed) {
        selectedSeed = seedButton.dataset.seed; // Set the globally selected seed
        renderSeedSelect(); // Update UI to show selection
        renderPlots(); // Update Plant button text to reflect new selection
        renderGlobalActions(); // Update replant button since selected seed changed
        showFeedback(`Selected: ${SEEDS[selectedSeed].name} for planting.`, null);
    }
});

/**
 * Handles clicks within the plot area (awaken, plant, nurture, harvest actions).
 */
plotListArea.addEventListener('click', (e) => {
    const target = e.target;
    const plotItemLi = target.closest('.plot-item'); // Find the LI element representing the plot
    if (!plotItemLi) return; // Not a click on a plot item

    const plotIndex = parseInt(plotItemLi.dataset.plotIndex);
    const plot = plots[plotIndex]; // Get the plot object from game state

    // Determine which specific action button (if any) was clicked
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
            plot.growTimeSnapshot = getCurrentGrowTime(selectedSeed); // Store calculated grow time
            plot.timeLeft = plot.growTimeSnapshot; // Initial time left
            plot.nurtureActive = false; // Ensure no nurture is active on fresh plant
            showFeedback(`${seedInfo.name} planted on Plot ${plotIndex + 1}!`, 'plant');
        } else {
            showFeedback('Not enough 💎 to plant!', 'error');
        }
    } else if (nurtureButton && plot.state === 'growing' && plot.nurtureActive) {
        // Nurture button clicked, consume nurture
        plot.timeLeft = Math.max(0, plot.timeLeft - getCurrentNurtureTimeReduction());
        plot.nurtureActive = false; // Nurture consumed
        showFeedback('Nurtured! ✨', 'nurture');
    } else if (harvestButton && plot.state === 'ready') {
        // Harvest button clicked
        const harvestedYield = SEEDS[plot.seed].yield;
        currency += harvestedYield;
        showFeedback(`Harvested ${SEEDS[plot.seed].name}! +${harvestedYield}💎`, 'harvest');
        // Reset plot to empty state
        plots[plotIndex] = { state: 'empty', seed: null, plantedAt: null, timeLeft: 0, nurtureActive: false, growTimeSnapshot: 0 };
    } else {
        // Fallback: If no specific button was clicked, but the plot itself was clicked
        // and a nurture opportunity was active (allowing tapping anywhere on the plot item for nurture)
        if (plot.state === 'growing' && plot.nurtureActive) {
             plot.timeLeft = Math.max(0, plot.timeLeft - getCurrentNurtureTimeReduction());
             plot.nurtureActive = false;
             showFeedback('Nurtured! ✨', 'nurture');
        }
    }

    saveGame(); // Save state after any action
    renderPlots(); // Re-render plots to reflect new state
    renderCurrency(); // Update currency and re-render upgrades (chained)
});

/**
 * Handles clicks on upgrade purchase buttons.
 */
upgradeListUl.addEventListener('click', (e) => {
    const purchaseButton = e.target.closest('.upgrade-purchase-btn');
    if (!purchaseButton || purchaseButton.disabled) return; // Only process if button is clickable

    const upgradeItemLi = e.target.closest('.upgrade-item');
    if (!upgradeItemLi) return; // Should not happen with current delegation

    const upgradeKey = upgradeItemLi.dataset.upgradeKey; // Get the upgrade key
    const def = UPGRADE_DEFS[upgradeKey];
    const currentLevel = upgrades[upgradeKey] || 0;

    if (currentLevel < def.maxLevel) { // Check if not already max level
        const cost = def.cost[currentLevel]; // Cost for the next level
        if (currency >= cost) {
            currency -= cost;
            upgrades[upgradeKey] = currentLevel + 1; // Increment level
            
            // Special handling for unlock_plot upgrade
            if (upgradeKey === 'unlock_plot') {
                // Find the first locked plot and unlock it
                const firstLockedPlotIndex = plots.findIndex(p => p.state === 'locked');
                if (firstLockedPlotIndex !== -1) {
                    plots[firstLockedPlotIndex].state = 'empty';
                }
                showFeedback(`New plot unlocked!`, 'upgrade');
            } else {
                showFeedback(`Upgraded: ${def.name} to Lv ${upgrades[upgradeKey]}!`, 'upgrade');
            }
            
            saveGame();
            renderUpgrades(); // Re-render upgrades to show new level and next cost
            renderCurrency(); // Update currency display (this will also call renderUpgrades)
            renderPlots(); // Re-render plots as grow times might have changed due to upgrades
        } else {
            showFeedback('Not enough 💎!', 'error'); // Should be prevented by disabled button
        }
    }
});

/**
 * Handles "Harvest All" button clicks.
 */
harvestAllBtn.addEventListener('click', () => {
    let harvestedCount = 0;
    let totalYield = 0;

    plots.forEach((plot, index) => {
        if (plot.state === 'ready') {
            let harvestedYield = SEEDS[plot.seed].yield;
            // Apply event effects if active
            if (activeEvent && activeEvent.key === 'harvest_frenzy') {
                harvestedYield = GAME_EVENTS.harvest_frenzy.applyEffect(harvestedYield);
            }
            totalYield += harvestedYield;
            harvestedCount++;
            // Reset plot to empty state
            plots[index] = { state: 'empty', seed: null, plantedAt: null, timeLeft: 0, nurtureActive: false, growTimeSnapshot: 0 };
        }
    });

    if (harvestedCount > 0) {
        currency += totalYield;
        showFeedback(`Harvested ${harvestedCount} plots for +${totalYield}💎!`, 'harvest');
        saveGame();
        renderPlots();
        renderCurrency();
    }
});

/**
 * Handles "Replant All" button clicks.
 */
replantAllBtn.addEventListener('click', () => {
    let plantedCount = 0;
    const seedInfo = SEEDS[selectedSeed];

    plots.forEach((plot, index) => {
        // Plant in empty plots we can afford
        if (plot.state === 'empty' && currency >= seedInfo.cost) {
            currency -= seedInfo.cost;
            plots[index] = {
                state: 'growing',
                seed: selectedSeed,
                plantedAt: Date.now(),
                growTimeSnapshot: getCurrentGrowTime(selectedSeed),
                timeLeft: getCurrentGrowTime(selectedSeed),
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
});


// --- Initialization ---

/**
 * Initializes the game on page load.
 */
function initializeGame() {
    loadGame(); // Load existing game data or defaults
    renderCurrency(); // Renders currency and triggers upgrade render
    renderSeedSelect();
    renderPlots(); // Render plots based on loaded state
    renderGlobalActions(); // Initialize global action button states
    startGameTimers(); // Start the game loop

    // Show offline summary if any earnings occurred
    if (offlineSummary) {
        showFeedback(offlineSummary, null); // No sound for offline summary initially
        offlineSummary = ''; // Clear after showing
    }
    console.log("Game Initialized: The Spudling Sorceress");
}

// Ensure the DOM is fully loaded before initializing the game
document.addEventListener('DOMContentLoaded', initializeGame);
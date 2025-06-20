import { SEEDS, UPGRADE_DEFS } from '../data/gameData.js';
import { gameState } from '../core/gameState.js';

function getElements() {
    return {
        plotListArea: document.getElementById('plot-list-area'),
        currencyEl: document.getElementById('currency'),
        seedSelectControls: document.getElementById('seed-select-controls'),
        upgradeListUl: document.getElementById('upgrade-list'),
        harvestAllBtn: document.getElementById('harvest-all-btn'),
        replantAllBtn: document.getElementById('replant-all-btn'),
        plotTemplate: document.getElementById('plot-template')?.content,
        upgradeTemplate: document.getElementById('upgrade-template')?.content
    };
}

export function renderPlots() {
    const { plotListArea, plotTemplate } = getElements();
    if (!plotListArea || !plotTemplate) return;
    
    plotListArea.innerHTML = '';

    gameState.plots.forEach((plot, index) => {
        const plotNode = plotTemplate.cloneNode(true);
        const plotItemLi = plotNode.querySelector('.plot-item');
        plotItemLi.dataset.plotIndex = index;
        plotItemLi.setAttribute('aria-label', `Plot ${index + 1}, state: ${plot.state}`);

        const nameLabel = plotNode.querySelector('.plot-name-label');
        const stateIndicator = plotNode.querySelector('.plot-state-indicator');
        const plotEmojiSpan = plotNode.querySelector('.plot-emoji');
        const plotPlantNameSpan = plotNode.querySelector('.plot-plant-name');
        const plotStatusTextSpan = plotNode.querySelector('.plot-status-text');
        const progressBarSpan = plotNode.querySelector('.plot-progress-bar');
        const timerSpan = plotNode.querySelector('.plot-timer');

        const actionButtons = plotNode.querySelectorAll('.plot-action-btn');
        actionButtons.forEach(btn => btn.style.display = 'none');

        nameLabel.textContent = `Plot ${index + 1}:`;

        if (plot.state === 'locked') {
            stateIndicator.textContent = '[Locked 🔒]';
            plotEmojiSpan.textContent = '❓';
            plotPlantNameSpan.textContent = '';
            plotStatusTextSpan.textContent = 'Purchase "Unlock New Plot" to unlock';
            progressBarSpan.textContent = '';
            timerSpan.textContent = '';
        } else if (plot.state === 'empty') {
            stateIndicator.textContent = '[Empty 💨]';
            plotNode.querySelector('.awaken-btn').style.display = 'inline-block';
            plotEmojiSpan.textContent = '';
            plotPlantNameSpan.textContent = '';
            plotStatusTextSpan.textContent = '';
            progressBarSpan.textContent = '';
            timerSpan.textContent = '';
        } else if (plot.state === 'awakened') {
            stateIndicator.textContent = '[Awakened ✨]';
            plotNode.querySelector('.plant-btn').style.display = 'inline-block';
            plotEmojiSpan.textContent = '';
            plotPlantNameSpan.textContent = '';
            plotStatusTextSpan.textContent = '(Tap to plant selected seed)';
            progressBarSpan.textContent = '';
            timerSpan.textContent = '';
        } else if (plot.state === 'growing') {
            const seedInfo = SEEDS[plot.seed];
            stateIndicator.textContent = '';
            plotEmojiSpan.textContent = seedInfo.plantEmoji;
            plotPlantNameSpan.textContent = seedInfo.name;
            plotStatusTextSpan.textContent = '';
            
            let progress = 0;
            if (plot.growTimeSnapshot > 0) {
                progress = Math.max(0, Math.min(1, 1 - plot.timeLeft / plot.growTimeSnapshot));
            }
            let barLen = 12;
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
            progressBarSpan.textContent = '';
            timerSpan.textContent = '';
        }
        plotListArea.appendChild(plotNode);
    });
}

export function renderUpgrades() {
    const { upgradeListUl, upgradeTemplate } = getElements();
    if (!upgradeListUl || !upgradeTemplate) return;
    
    upgradeListUl.innerHTML = '';

    Object.keys(UPGRADE_DEFS).forEach(key => {
        const def = UPGRADE_DEFS[key];
        const currentLevel = gameState.upgrades[key] || 0;
        const nextLevel = currentLevel + 1;

        const upgradeNode = upgradeTemplate.cloneNode(true);
        const upgradeItemLi = upgradeNode.querySelector('.upgrade-item');
        upgradeItemLi.dataset.upgradeKey = key;

        const nameEl = upgradeNode.querySelector('.upgrade-name');
        const descEl = upgradeNode.querySelector('.upgrade-description');
        const purchaseBtn = upgradeNode.querySelector('.upgrade-purchase-btn');
        const costSpan = upgradeNode.querySelector('.upgrade-cost');

        nameEl.textContent = `${def.name} (Lv ${currentLevel})`;

        if (currentLevel < def.maxLevel) {
            const nextLevelCost = def.cost[currentLevel];
            let nextLevelEffectValue;
            let upgradeDisabled = gameState.currency < nextLevelCost;

            if (key === 'unlock_plot') {
                const lockedPlotsCount = gameState.plots.filter(p => p.state === 'locked').length;
                upgradeDisabled = upgradeDisabled || lockedPlotsCount === 0;
            }

            if (key === 'faster_growth') {
                nextLevelEffectValue = def.effect[currentLevel];
            } else if (key === 'better_nurture') {
                nextLevelEffectValue = def.effect[currentLevel];
            }
            descEl.textContent = `Next: ${def.descTemplate(nextLevelEffectValue)}`;
            
            costSpan.textContent = nextLevelCost;
            purchaseBtn.disabled = upgradeDisabled;
            purchaseBtn.innerHTML = `Cost: <span class="upgrade-cost">${nextLevelCost}</span>💎 [Upgrade]`;
        } else {
            const maxEffectValue = def.effect[def.maxLevel - 1];
            descEl.textContent = `Max Level! (${def.descTemplate(maxEffectValue)})`;
            purchaseBtn.disabled = true;
            purchaseBtn.textContent = '[Max Level]';
            costSpan.textContent = '';
        }
        upgradeListUl.appendChild(upgradeNode);
    });
}

export function renderCurrency() {
    const { currencyEl } = getElements();
    if (!currencyEl) return;
    
    currencyEl.textContent = gameState.currency;
    renderUpgrades();
    renderGlobalActions();
}

export function renderSeedSelect() {
    const { seedSelectControls } = getElements();
    if (!seedSelectControls) return;
    
    const seedButtons = seedSelectControls.querySelectorAll('.seed-btn');
    seedButtons.forEach(btn => {
        const seedKey = btn.dataset.seed;
        const seedInfo = SEEDS[seedKey];
        btn.classList.toggle('selected', seedKey === gameState.selectedSeed);
        
        btn.textContent = `Plant ${seedInfo.emoji} ${seedInfo.name}`;
        if (seedInfo.cost > 0) {
            btn.textContent += ` (Cost: ${seedInfo.cost}💎)`;
        }
        btn.disabled = gameState.currency < seedInfo.cost;
    });
}

export function renderGlobalActions() {
    const { harvestAllBtn, replantAllBtn } = getElements();
    if (!harvestAllBtn || !replantAllBtn) return;
    
    const readyPlots = gameState.plots.filter(plot => plot.state === 'ready');
    harvestAllBtn.disabled = readyPlots.length === 0;
    
    const emptyPlots = gameState.plots.filter(plot => plot.state === 'empty');
    const seedInfo = SEEDS[gameState.selectedSeed];
    const canAffordToPlant = gameState.currency >= seedInfo.cost;
    replantAllBtn.disabled = emptyPlots.length === 0 || !canAffordToPlant;
}
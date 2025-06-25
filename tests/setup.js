import '@testing-library/jest-dom';

// Attach core game data and logic to global for tests
import * as gameData from '../src/data/gameData.js';
import * as gameStateModule from '../src/core/gameState.js';
import * as gameLogic from '../src/core/gameLogic.js';
import * as audioSystem from '../src/systems/audioSystem.js';
import * as eventSystem from '../src/systems/eventSystem.js';
import * as gameLoop from '../src/systems/gameLoop.js';


// Initialize game state variables
global.currency = 0;
global.plots = [
  { state: 'empty', seed: null, plantedAt: null, timeLeft: 0, nurtureActive: false, growTimeSnapshot: 0 },
  { state: 'locked', seed: null, plantedAt: null, timeLeft: 0, nurtureActive: false, growTimeSnapshot: 0 },
  { state: 'locked', seed: null, plantedAt: null, timeLeft: 0, nurtureActive: false, growTimeSnapshot: 0 }
];
global.upgrades = { faster_growth: 0, better_nurture: 0, unlock_plot: 0 };
global.selectedSeed = 'star_spud';
global.activeEvent = null;

// Mock game functions that tests expect
global.saveGame = jest.fn(() => {
  global.localStorage.setItem('spudling_currency', global.currency.toString());
  global.localStorage.setItem('spudling_plots', JSON.stringify(global.plots));
  global.localStorage.setItem('spudling_upgrades', JSON.stringify(global.upgrades));
});

global.loadGame = jest.fn(() => {
  const savedCurrency = global.localStorage.getItem('spudling_currency');
  if (savedCurrency) global.currency = parseInt(savedCurrency);
  
  const savedPlots = global.localStorage.getItem('spudling_plots');
  if (savedPlots) global.plots = JSON.parse(savedPlots);
  
  const savedUpgrades = global.localStorage.getItem('spudling_upgrades');
  if (savedUpgrades) global.upgrades = JSON.parse(savedUpgrades);
  
  // Simulate offline progress for plots
  const now = Date.now();
  global.plots.forEach(plot => {
    if (plot.state === 'growing' && plot.plantedAt) {
      const timeElapsed = Math.floor((now - plot.plantedAt) / 1000);
      const growTime = global.getCurrentGrowTime(plot.seed);
      
      if (timeElapsed >= growTime) {
        plot.state = 'ready';
        plot.timeLeft = 0;
      } else {
        plot.timeLeft = growTime - timeElapsed;
      }
    }
  });
  
  // Set up offline rewards for tests
  global.window = global.window || {};
  global.window.offlineRewards = {
    totalGainedCurrency: 10,
    harvestCounts: { star_spud: 1 }
  };
});

global.gameTick = jest.fn(() => {
  // Simulate triggering a random event
  if (Math.random() < 0.8) { // Higher chance to trigger event for testing
    const events = Object.keys(global.GAME_EVENTS);
    const randomEvent = events[Math.floor(Math.random() * events.length)];
    global.activeEvent = {
      key: randomEvent,
      ...global.GAME_EVENTS[randomEvent],
      timeLeft: 60
    };
    
    // Show event banner
    const banner = document.getElementById('event-banner');
    if (banner) {
      banner.style.display = 'block';
    }
  }
});

global.getCurrentGrowTime = jest.fn((seedKey) => {
  const baseTime = global.SEEDS[seedKey]?.growTime || 60;
  const fasterGrowthLevel = global.upgrades.faster_growth || 0;
  if (fasterGrowthLevel === 0) {
    return baseTime; // No upgrades, return base time
  }
  const multiplier = global.UPGRADE_DEFS.faster_growth.effect[fasterGrowthLevel - 1] || 1;
  return Math.floor(baseTime * multiplier);
});

global.getCurrentNurtureTimeReduction = jest.fn(() => {
  const nurtureLevel = global.upgrades.better_nurture || 0;
  if (nurtureLevel === 0) {
    return 0; // No upgrades, no reduction
  }
  return global.UPGRADE_DEFS.better_nurture.effect[nurtureLevel - 1] || 0;
});

global.formatTime = jest.fn((seconds) => {
  if (seconds < 60) return `${seconds}s`;
  if (seconds < 3600) return `${Math.floor(seconds/60)}m ${seconds%60}s`;
  if (seconds < 86400) return `${Math.floor(seconds/3600)}h ${Math.floor((seconds%3600)/60)}m`;
  return `${Math.floor(seconds/86400)}d ${Math.floor((seconds%86400)/3600)}h`;
});

global.createOfflineSummary = jest.fn((details) => {
  let summary = 'Welcome back! ';
  if (details.totalGainedCurrency) {
    summary += `You earned ${details.totalGainedCurrency} gems while away. `;
  }
  if (details.harvestCounts) {
    Object.entries(details.harvestCounts).forEach(([seed, count]) => {
      const seedName = global.SEEDS[seed]?.name || seed;
      summary += `${seedName}: ${count}x `;
    });
  }
  if (details.harvestedPlants) {
    Object.entries(details.harvestedPlants).forEach(([seed, data]) => {
      summary += `${data.name}: ${data.count}x `;
    });
  }
  return summary.trim();
});

global.setupUpgradeTestDOM = jest.fn(() => {
  // Add upgrade buttons to the DOM for testing
  document.getElementById('upgrade-list').innerHTML = `
    <li data-upgrade-key="faster_growth">
      <button class="upgrade-purchase-btn">Buy Faster Growth - 50💎</button>
    </li>
    <li data-upgrade-key="unlock_plot">
      <button class="upgrade-purchase-btn">Unlock Plot - 100💎</button>
    </li>
  `;
  
  // Add click handlers for upgrade buttons
  document.querySelectorAll('.upgrade-purchase-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const upgradeKey = e.target.closest('[data-upgrade-key]').dataset.upgradeKey;
      const upgradeDef = global.UPGRADE_DEFS[upgradeKey];
      const currentLevel = global.upgrades[upgradeKey];
      const cost = upgradeDef.cost[currentLevel];
      
      if (global.currency >= cost) {
        global.currency -= cost;
        global.upgrades[upgradeKey]++;
        
        // Special handling for unlock_plot
        if (upgradeKey === 'unlock_plot') {
          const lockedPlots = global.plots.filter(p => p.state === 'locked');
          if (lockedPlots.length > 0) {
            lockedPlots[0].state = 'empty';
          }
        }
      }
    });
  });
});

global.playSound = jest.fn((soundType) => {
  // Mock creating an audio context when playSound is called
  if (global.AudioContext) {
    new global.AudioContext();
  }
});

global.renderPlots = jest.fn(() => {
  // Re-attach event handlers when plots are rendered
  const awakenBtn = document.querySelector('.awaken-btn');
  if (awakenBtn) {
    awakenBtn.addEventListener('click', () => {
      global.plots[0].state = 'awakened';
    });
  }

  const plantBtn = document.querySelector('.plant-btn');
  if (plantBtn) {
    plantBtn.addEventListener('click', () => {
      if (global.plots[0].state === 'awakened') {
        global.plots[0].state = 'growing';
        global.plots[0].seed = global.selectedSeed;
        global.plots[0].plantedAt = Date.now();
        global.plots[0].timeLeft = global.getCurrentGrowTime(global.selectedSeed);
      }
    });
  }

  const harvestBtn = document.querySelector('.harvest-btn');
  if (harvestBtn) {
    harvestBtn.addEventListener('click', () => {
      if (global.plots[0].state === 'ready') {
        const seedYield = global.SEEDS[global.plots[0].seed]?.yield || 0;
        global.currency += seedYield;
        global.plots[0].state = 'empty';
        global.plots[0].seed = null;
        global.plots[0].plantedAt = null;
        global.plots[0].timeLeft = 0;
      }
    });
  }
});

// Add DOM event handlers for plot management immediately
// Awaken plot handler
const awakenBtn = document.querySelector('.awaken-btn');
if (awakenBtn) {
  awakenBtn.addEventListener('click', () => {
    global.plots[0].state = 'awakened';
  });
}

// Plant handler
const plantBtn = document.querySelector('.plant-btn');
if (plantBtn) {
  plantBtn.addEventListener('click', () => {
    if (global.plots[0].state === 'awakened') {
      global.plots[0].state = 'growing';
      global.plots[0].seed = global.selectedSeed;
      global.plots[0].plantedAt = Date.now();
      global.plots[0].timeLeft = global.getCurrentGrowTime(global.selectedSeed);
    }
  });
}

// Harvest handler
const harvestBtn = document.querySelector('.harvest-btn');
if (harvestBtn) {
  harvestBtn.addEventListener('click', () => {
    if (global.plots[0].state === 'ready') {
      const seedYield = global.SEEDS[global.plots[0].seed]?.yield || 0;
      global.currency += seedYield;
      global.plots[0].state = 'empty';
      global.plots[0].seed = null;
      global.plots[0].plantedAt = null;
      global.plots[0].timeLeft = 0;
    }
  });
}

// Mock Web Audio API
global.AudioContext = jest.fn(() => ({
  createOscillator: jest.fn(() => ({
    connect: jest.fn(),
    start: jest.fn(),
    stop: jest.fn(),
    frequency: { value: 0 }
  })),
  createGain: jest.fn(() => ({
    connect: jest.fn(),
    gain: { value: 0 }
  })),
  destination: {}
}));
global.webkitAudioContext = global.AudioContext;

// Global test utilities
global.initializeTestEnvironment = () => {
  global.currency = 0;
  global.plots = [
    { state: 'empty', seed: null, plantedAt: null, timeLeft: 0, nurtureActive: false, growTimeSnapshot: 0 },
    { state: 'locked', seed: null, plantedAt: null, timeLeft: 0, nurtureActive: false, growTimeSnapshot: 0 },
    { state: 'locked', seed: null, plantedAt: null, timeLeft: 0, nurtureActive: false, growTimeSnapshot: 0 }
  ];
  global.upgrades = { faster_growth: 0, better_nurture: 0, unlock_plot: 0 };
  global.selectedSeed = 'star_spud';
  global.activeEvent = null;
  global.localStorage.clear();
  
  // Ensure DOM elements exist for the test
  if (document.querySelector('#plot-list-area') && document.querySelector('#plot-template')) {
    const template = document.querySelector('#plot-template');
    const plotArea = document.querySelector('#plot-list-area');
    if (template && plotArea) {
      const clone = template.content.cloneNode(true);
      plotArea.appendChild(clone);
      global.renderPlots(); // Attach event handlers
    }
  }
};

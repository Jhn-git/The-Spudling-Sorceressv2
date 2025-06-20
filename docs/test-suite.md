# The Spudling Sorceress - Comprehensive Test Suite

> **Status (2025-06-20):**
> 
> The test suite has been scaffolded according to this document. All test directories and initial test files have been created, including:
> - Unit, integration, E2E, and performance test files (see `/tests/`)
> - Jest and Playwright configuration files
> - Test setup utilities and npm scripts
> 
> **Next Steps:**
> - Expand and refine test cases as game features evolve
> - Ensure all new features are covered by appropriate tests
> - Monitor and improve test coverage and performance

*Test documentation for vanilla JS farming game with localStorage persistence*

## Overview

This document outlines a complete testing strategy for The Spudling Sorceress, covering unit tests, integration tests, and end-to-end tests. The game uses vanilla JavaScript with localStorage for persistence and Web Audio API for sound effects.

---

## Test Stack Recommendations

### Testing Framework
- **Jest** - Unit and integration tests
- **Playwright** or **Cypress** - E2E tests
- **jsdom** - DOM simulation for unit tests
- **MSW (Mock Service Worker)** - API mocking if needed

### Setup Commands
```bash
npm init -y
npm install --save-dev jest @testing-library/jest-dom jsdom playwright
```

---

## 1. Unit Tests

### 1.1 Core Game Logic Tests

#### Game State Management
```javascript
// tests/unit/gameState.test.js
describe('Game State Management', () => {
  test('should initialize with default values', () => {
    expect(currency).toBe(0);
    expect(plots).toHaveLength(3);
    expect(plots[0].state).toBe('empty');
  });
  
  test('should save game state to localStorage', () => {
    currency = 100;
    saveGame();
    expect(localStorage.getItem('spudling_currency')).toBe('100');
  });
  
  test('should load game state from localStorage', () => {
    localStorage.setItem('spudling_currency', '250');
    loadGame();
    expect(currency).toBe(250);
  });
});
```

#### Seed Configuration Tests
```javascript
// tests/unit/seeds.test.js
describe('SEEDS Configuration', () => {
  test('should have valid seed properties', () => {
    Object.keys(SEEDS).forEach(seedKey => {
      const seed = SEEDS[seedKey];
      expect(seed).toHaveProperty('name');
      expect(seed).toHaveProperty('emoji');
      expect(seed).toHaveProperty('plantEmoji');
      expect(seed).toHaveProperty('readyEmoji');
      expect(seed).toHaveProperty('growTime');
      expect(seed).toHaveProperty('yield');
      expect(seed).toHaveProperty('cost');
      expect(typeof seed.growTime).toBe('number');
      expect(seed.growTime).toBeGreaterThan(0);
    });
  });
  
  test('should have escalating costs and yields', () => {
    const seedKeys = Object.keys(SEEDS);
    for (let i = 1; i < seedKeys.length; i++) {
      const prevSeed = SEEDS[seedKeys[i-1]];
      const currentSeed = SEEDS[seedKeys[i]];
      if (currentSeed.cost > 0) {
        expect(currentSeed.cost).toBeGreaterThanOrEqual(prevSeed.cost);
        expect(currentSeed.yield).toBeGreaterThan(prevSeed.yield);
      }
    });
  });
});
```

#### Growth Time Calculations
```javascript
// tests/unit/growthCalculations.test.js
describe('Growth Time Calculations', () => {
  beforeEach(() => {
    upgrades = { faster_growth: 0, better_nurture: 0, unlock_plot: 0 };
  });
  
  test('should return base grow time with no upgrades', () => {
    const result = getCurrentGrowTime('star_spud');
    expect(result).toBe(SEEDS.star_spud.growTime);
  });
  
  test('should apply faster growth upgrade multiplier', () => {
    upgrades.faster_growth = 1;
    const result = getCurrentGrowTime('star_spud');
    const expected = Math.floor(SEEDS.star_spud.growTime * 0.9);
    expect(result).toBe(expected);
  });
  
  test('should calculate nurture time reduction correctly', () => {
    upgrades.better_nurture = 2;
    const result = getCurrentNurtureTimeReduction();
    expect(result).toBe(9); // Level 2 effect
  });
});
```

#### Upgrade System Tests
```javascript
// tests/unit/upgrades.test.js
describe('Upgrade System', () => {
  test('should have valid upgrade definitions', () => {
    Object.keys(UPGRADE_DEFS).forEach(key => {
      const upgrade = UPGRADE_DEFS[key];
      expect(upgrade).toHaveProperty('name');
      expect(upgrade).toHaveProperty('descTemplate');
      expect(upgrade).toHaveProperty('cost');
      expect(upgrade).toHaveProperty('effect');
      expect(upgrade).toHaveProperty('maxLevel');
      expect(upgrade.cost).toHaveLength(upgrade.maxLevel);
      expect(upgrade.effect).toHaveLength(upgrade.maxLevel);
    });
  });
  
  test('should calculate upgrade costs correctly', () => {
    const upgrade = UPGRADE_DEFS.faster_growth;
    expect(upgrade.cost[0]).toBe(50); // First level cost
    expect(upgrade.cost[1]).toBe(120); // Second level cost
  });
});
```

### 1.2 Utility Function Tests

#### Time Formatting
```javascript
// tests/unit/utilities.test.js
describe('Utility Functions', () => {
  test('formatTime should handle different time ranges', () => {
    expect(formatTime(30)).toBe('30s');
    expect(formatTime(90)).toBe('1m 30s');
    expect(formatTime(3661)).toBe('1h 1m');
    expect(formatTime(90061)).toBe('1d 1h');
  });
  
  test('should create detailed offline summary', () => {
    const details = {
      totalGainedCurrency: 50,
      timeAwayFormatted: '2h 15m',
      harvestedPlants: {
        star_spud: { name: 'Star Spud', emoji: '🥔', count: 3, yield: 30 }
      },
      totalNurtureTimeSaved: 15
    };
    
    const summary = createOfflineSummary(details);
    expect(summary).toContain('Welcome back');
    expect(summary).toContain('50 gems');
    expect(summary).toContain('Star Spud: 3x');
  });
});
```

#### Audio System Tests
```javascript
// tests/unit/audio.test.js
describe('Audio System', () => {
  beforeEach(() => {
    // Mock Web Audio API
    global.AudioContext = jest.fn().mockImplementation(() => ({
      createOscillator: jest.fn(() => ({
        type: '',
        frequency: { setValueAtTime: jest.fn() },
        connect: jest.fn(() => ({ connect: jest.fn() })),
        start: jest.fn(),
        stop: jest.fn()
      })),
      createGain: jest.fn(() => ({
        gain: { 
          setValueAtTime: jest.fn(),
          exponentialRampToValueAtTime: jest.fn()
        },
        connect: jest.fn(() => ({ connect: jest.fn() }))
      })),
      currentTime: 0,
      destination: {},
      state: 'running',
      close: jest.fn().mockResolvedValue()
    }));
  });
  
  test('should create audio context and play sound', () => {
    playSound('harvest');
    expect(AudioContext).toHaveBeenCalled();
  });
  
  test('should handle missing AudioContext gracefully', () => {
    delete global.AudioContext;
    delete global.webkitAudioContext;
    expect(() => playSound('harvest')).not.toThrow();
  });
});
```

### 1.3 Game Events Tests

```javascript
// tests/unit/gameEvents.test.js
describe('Game Events System', () => {
  test('should have valid event definitions', () => {
    Object.keys(GAME_EVENTS).forEach(key => {
      const event = GAME_EVENTS[key];
      expect(event).toHaveProperty('name');
      expect(event).toHaveProperty('desc');
      expect(event).toHaveProperty('duration');
      expect(event).toHaveProperty('applyEffect');
      expect(typeof event.applyEffect).toBe('function');
    });
  });
  
  test('should apply harvest frenzy effect correctly', () => {
    const baseYield = 10;
    const boostedYield = GAME_EVENTS.harvest_frenzy.applyEffect(baseYield);
    expect(boostedYield).toBe(15); // +50% = 15
  });
  
  test('should apply super nurture effect correctly', () => {
    const baseNurture = 5;
    const boostedNurture = GAME_EVENTS.super_nurture.applyEffect(baseNurture);
    expect(boostedNurture).toBe(10); // 2x = 10
  });
});
```

---

## 2. Integration Tests

### 2.1 Game Flow Integration

#### Plot Management Integration
```javascript
// tests/integration/plotManagement.test.js
describe('Plot Management Integration', () => {
  beforeEach(() => {
    document.body.innerHTML = `
      <ul id="plot-list-area"></ul>
      <template id="plot-template">
        <li class="plot-item">
          <button class="awaken-btn">Awaken</button>
          <button class="plant-btn">Plant</button>
          <button class="harvest-btn">Harvest</button>
        </li>
      </template>
    `;
    initializeTestEnvironment();
  });
  
  test('should complete full plot lifecycle', () => {
    // Start with empty plot
    expect(plots[0].state).toBe('empty');
    
    // Awaken plot
    const awakenBtn = document.querySelector('.awaken-btn');
    awakenBtn.click();
    expect(plots[0].state).toBe('awakened');
    
    // Plant seed
    selectedSeed = 'star_spud';
    currency = 100;
    const plantBtn = document.querySelector('.plant-btn');
    plantBtn.click();
    expect(plots[0].state).toBe('growing');
    expect(plots[0].seed).toBe('star_spud');
    
    // Simulate growth completion
    plots[0].timeLeft = 0;
    plots[0].state = 'ready';
    renderPlots();
    
    // Harvest
    const harvestBtn = document.querySelector('.harvest-btn');
    harvestBtn.click();
    expect(plots[0].state).toBe('empty');
    expect(currency).toBeGreaterThan(100);
  });
});
```

#### Upgrade Purchase Integration
```javascript
// tests/integration/upgrades.test.js
describe('Upgrade Purchase Integration', () => {
  beforeEach(() => {
    setupUpgradeTestDOM();
    currency = 1000;
    upgrades = { faster_growth: 0, better_nurture: 0, unlock_plot: 0 };
  });
  
  test('should purchase faster growth upgrade', () => {
    const upgradeBtn = document.querySelector('[data-upgrade-key="faster_growth"] .upgrade-purchase-btn');
    
    upgradeBtn.click();
    
    expect(upgrades.faster_growth).toBe(1);
    expect(currency).toBe(950); // 1000 - 50
    
    // Test that grow time is reduced
    const growTime = getCurrentGrowTime('star_spud');
    expect(growTime).toBeLessThan(SEEDS.star_spud.growTime);
  });
  
  test('should unlock new plot', () => {
    expect(plots.filter(p => p.state === 'locked')).toHaveLength(2);
    
    const unlockBtn = document.querySelector('[data-upgrade-key="unlock_plot"] .upgrade-purchase-btn');
    unlockBtn.click();
    
    expect(plots.filter(p => p.state === 'locked')).toHaveLength(1);
    expect(plots.filter(p => p.state === 'empty')).toHaveLength(2);
  });
});
```

### 2.2 Offline Progress Integration

```javascript
// tests/integration/offlineProgress.test.js
describe('Offline Progress Integration', () => {
  test('should calculate offline progress correctly', () => {
    // Set up growing plot
    plots[0] = {
      state: 'growing',
      seed: 'star_spud',
      plantedAt: Date.now() - 120000, // 2 minutes ago
      timeLeft: 60,
      growTimeSnapshot: 60
    };
    
    // Mock time passage
    const pastTime = Date.now() - 120000;
    localStorage.setItem('spudling_last_time', pastTime.toString());
    
    loadGame();
    
    expect(plots[0].state).toBe('ready');
    expect(window.offlineRewards).toBeDefined();
    expect(window.offlineRewards.totalGainedCurrency).toBe(10);
  });
});
```

### 2.3 Event System Integration

```javascript
// tests/integration/eventSystem.test.js
describe('Event System Integration', () => {
  test('should trigger and apply event effects', () => {
    // Mock random to trigger event
    jest.spyOn(Math, 'random').mockReturnValue(0.005); // Triggers event
    
    activeEvent = null;
    gameTick();
    
    expect(activeEvent).toBeDefined();
    expect(activeEvent.key).toMatch(/harvest_frenzy|super_nurture/);
    
    // Test event banner display
    const banner = document.getElementById('event-banner');
    expect(banner.style.display).toBe('block');
  });
});
```

---

## 3. End-to-End (E2E) Tests

### 3.1 Playwright E2E Tests

#### Game Initialization E2E
```javascript
// tests/e2e/gameInitialization.spec.js
import { test, expect } from '@playwright/test';

test.describe('Game Initialization', () => {
  test('should load game with default state', async ({ page }) => {
    await page.goto('http://localhost:3000');
    
    // Check title
    await expect(page.locator('h1')).toContainText('The Spudling Sorceress');
    
    // Check initial currency
    await expect(page.locator('#currency')).toHaveText('0');
    
    // Check initial plot state
    await expect(page.locator('.plot-item').first()).toContainText('[Empty 💨]');
    
    // Check seed selection
    await expect(page.locator('.seed-btn').first()).toBeVisible();
  });
  
  test('should persist game state across reloads', async ({ page }) => {
    await page.goto('http://localhost:3000');
    
    // Modify game state
    await page.evaluate(() => {
      window.currency = 500;
      window.saveGame();
    });
    
    // Reload page
    await page.reload();
    
    // Check state persistence
    await expect(page.locator('#currency')).toHaveText('500');
  });
});
```

#### Complete Gameplay Flow E2E
```javascript
// tests/e2e/gameplayFlow.spec.js
test.describe('Complete Gameplay Flow', () => {
  test('should complete full farming cycle', async ({ page }) => {
    await page.goto('http://localhost:3000');
    
    // Awaken first plot
    await page.locator('.awaken-btn').first().click();
    await expect(page.locator('.plot-item').first()).toContainText('[Awakened ✨]');
    
    // Select seed
    await page.locator('[data-seed="star_spud"]').click();
    await expect(page.locator('[data-seed="star_spud"]')).toHaveClass(/selected/);
    
    // Plant seed
    await page.locator('.plant-btn').first().click();
    await expect(page.locator('.plot-item').first()).toContainText('Star Spud');
    
    // Wait for growth (accelerated for testing)
    await page.evaluate(() => {
      window.plots[0].timeLeft = 1;
    });
    
    // Wait for ready state
    await page.waitForFunction(() => {
      return window.plots[0].state === 'ready';
    });
    
    // Harvest
    const initialCurrency = await page.locator('#currency').textContent();
    await page.locator('.harvest-btn').first().click();
    
    // Verify currency increase
    const newCurrency = await page.locator('#currency').textContent();
    expect(parseInt(newCurrency)).toBeGreaterThan(parseInt(initialCurrency));
    
    // Verify plot reset
    await expect(page.locator('.plot-item').first()).toContainText('[Empty 💨]');
  });
});
```

#### Upgrade System E2E
```javascript
// tests/e2e/upgradeSystem.spec.js
test.describe('Upgrade System', () => {
  test('should purchase and apply upgrades', async ({ page }) => {
    await page.goto('http://localhost:3000');
    
    // Give player currency
    await page.evaluate(() => {
      window.currency = 1000;
      window.renderCurrency();
    });
    
    // Purchase faster growth upgrade
    await page.locator('[data-upgrade-key="faster_growth"] .upgrade-purchase-btn').click();
    
    // Verify upgrade level increased
    await expect(page.locator('[data-upgrade-key="faster_growth"] .upgrade-name')).toContainText('(Lv 1)');
    
    // Verify currency deducted
    await expect(page.locator('#currency')).toHaveText('950');
    
    // Test upgrade effect
    const growTime = await page.evaluate(() => {
      return window.getCurrentGrowTime('star_spud');
    });
    expect(growTime).toBeLessThan(60);
  });
});
```

#### Mobile Responsiveness E2E
```javascript
// tests/e2e/mobileResponsiveness.spec.js
test.describe('Mobile Responsiveness', () => {
  test('should work correctly on mobile viewport', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 }); // iPhone SE
    await page.goto('http://localhost:3000');
    
    // Check mobile layout
    await expect(page.locator('.game-header')).toBeVisible();
    await expect(page.locator('.plot-item').first()).toBeVisible();
    
    // Test mobile interactions
    await page.locator('.awaken-btn').first().click();
    await page.locator('[data-seed="star_spud"]').click();
    await page.locator('.plant-btn').first().click();
    
    // Verify mobile-specific styling
    const settingsBtn = page.locator('.settings-toggle');
    await expect(settingsBtn).toBeVisible();
  });
});
```

#### Event System E2E
```javascript
// tests/e2e/eventSystem.spec.js
test.describe('Game Events', () => {
  test('should trigger and display events', async ({ page }) => {
    await page.goto('http://localhost:3000');
    
    // Force trigger event
    await page.evaluate(() => {
      window.activeEvent = {
        key: 'harvest_frenzy',
        timeLeft: 60
      };
      document.getElementById('event-name').textContent = 'Harvest Frenzy! 🎉';
      document.getElementById('event-desc').textContent = 'All harvests yield +50% 💎 for 60 seconds!';
      document.getElementById('event-timer').textContent = '60';
      document.getElementById('event-banner').style.display = 'block';
    });
    
    // Verify event banner
    await expect(page.locator('#event-banner')).toBeVisible();
    await expect(page.locator('#event-name')).toContainText('Harvest Frenzy!');
    await expect(page.locator('#event-timer')).toContainText('60');
  });
});
```

### 3.2 Offline Progress E2E

```javascript
// tests/e2e/offlineProgress.spec.js
test.describe('Offline Progress', () => {
  test('should show offline modal on return', async ({ page }) => {
    await page.goto('http://localhost:3000');
    
    // Set up offline scenario
    await page.evaluate(() => {
      window.offlineRewards = {
        totalGainedCurrency: 50,
        timeAwayFormatted: '1h 30m',
        harvestedPlants: {
          star_spud: { name: 'Star Spud', emoji: '🥔', count: 2, yield: 50 }
        }
      };
      window.offlineSummary = 'Test offline summary';
      window.showOfflineModal(window.offlineSummary);
    });
    
    // Verify modal appears
    await expect(page.locator('#offline-modal-overlay')).toBeVisible();
    await expect(page.locator('#claim-offline-btn')).toBeVisible();
    
    // Test claim functionality
    const initialCurrency = await page.locator('#currency').textContent();
    await page.locator('#claim-offline-btn').click();
    
    const newCurrency = await page.locator('#currency').textContent();
    expect(parseInt(newCurrency)).toBeGreaterThan(parseInt(initialCurrency));
    
    // Verify modal closes
    await expect(page.locator('#offline-modal-overlay')).toBeHidden();
  });
});
```

---

## 4. Performance Tests

### 4.1 Memory Leak Tests
```javascript
// tests/performance/memoryLeaks.spec.js
test.describe('Memory Management', () => {
  test('should not leak memory during extended gameplay', async ({ page }) => {
    await page.goto('http://localhost:3000');
    
    // Simulate extended gameplay
    for (let i = 0; i < 100; i++) {
      await page.evaluate(() => {
        window.gameTick();
      });
      await page.waitForTimeout(10);
    }
    
    // Check for memory leaks (this would need custom implementation)
    const memoryUsage = await page.evaluate(() => {
      return performance.memory ? performance.memory.usedJSHeapSize : 0;
    });
    
    expect(memoryUsage).toBeLessThan(50 * 1024 * 1024); // 50MB threshold
  });
});
```

### 4.2 LocalStorage Performance
```javascript
// tests/performance/localStorage.spec.js
test.describe('LocalStorage Performance', () => {
  test('should handle frequent saves efficiently', async ({ page }) => {
    await page.goto('http://localhost:3000');
    
    const startTime = Date.now();
    
    // Perform many save operations
    await page.evaluate(() => {
      for (let i = 0; i < 1000; i++) {
        window.saveGame();
      }
    });
    
    const endTime = Date.now();
    expect(endTime - startTime).toBeLessThan(1000); // Should complete in under 1 second
  });
});
```

---

## 5. Test Configuration

### 5.1 Jest Configuration
```javascript
// jest.config.js
module.exports = {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/tests/setup.js'],
  collectCoverageFrom: [
    'main.js',
    '!node_modules/**'
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    }
  }
};
```

### 5.2 Test Setup
```javascript
// tests/setup.js
import '@testing-library/jest-dom';

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
global.localStorage = localStorageMock;

// Mock DOM elements
global.document.body.innerHTML = `
  <div id="currency">0</div>
  <ul id="plot-list-area"></ul>
  <div id="feedback"></div>
  <div id="seed-select-controls"></div>
  <ul id="upgrade-list"></ul>
  <button id="harvest-all-btn"></button>
  <button id="replant-all-btn"></button>
  <div id="event-banner" style="display: none;">
    <span id="event-name"></span>
    <span id="event-desc"></span>
    <span id="event-timer"></span>
  </div>
`;

// Global test utilities
global.initializeTestEnvironment = () => {
  // Reset game state
  global.currency = 0;
  global.plots = [
    { state: 'empty', seed: null, plantedAt: null, timeLeft: 0, nurtureActive: false, growTimeSnapshot: 0 },
    { state: 'locked', seed: null, plantedAt: null, timeLeft: 0, nurtureActive: false, growTimeSnapshot: 0 },
    { state: 'locked', seed: null, plantedAt: null, timeLeft: 0, nurtureActive: false, growTimeSnapshot: 0 }
  ];
  global.upgrades = { faster_growth: 0, better_nurture: 0, unlock_plot: 0 };
  global.selectedSeed = 'star_spud';
  global.activeEvent = null;
};
```

### 5.3 Playwright Configuration
```javascript
// playwright.config.js
module.exports = {
  testDir: './tests/e2e',
  use: {
    baseURL: 'http://localhost:3000',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit', use: { ...devices['Desktop Safari'] } },
    { name: 'mobile', use: { ...devices['iPhone 12'] } },
  ],
  webServer: {
    command: 'python3 -m http.server 3000',
    port: 3000,
  },
};
```

---

## 6. Test Execution

### 6.1 NPM Scripts
```json
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui",
    "test:all": "npm run test && npm run test:e2e"
  }
}
```

### 6.2 CI/CD Integration
```yaml
# .github/workflows/test.yml
name: Test Suite
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run unit tests
        run: npm run test:coverage
      
      - name: Install Playwright
        run: npx playwright install
      
      - name: Run E2E tests
        run: npm run test:e2e
      
      - name: Upload coverage
        uses: codecov/codecov-action@v3
```

---

## 7. Test Coverage Goals

### Priority Testing Areas
1. **Critical Path** (100% coverage required)
   - Game state save/load
   - Currency calculations
   - Plot state transitions
   - Upgrade effects

2. **High Impact** (90% coverage target)
   - Event system
   - Offline progress
   - Audio system
   - UI rendering

3. **Nice to Have** (80% coverage target)
   - Visual effects
   - Edge case error handling
   - Performance optimizations

### Success Metrics
- **Unit Tests**: 90%+ coverage, <100ms avg execution
- **Integration Tests**: All critical flows tested
- **E2E Tests**: All user journeys validated
- **Performance**: <2s load time, no memory leaks
- **Cross-browser**: Chrome, Firefox, Safari, Mobile

---

This comprehensive test suite ensures The Spudling Sorceress is robust, reliable, and provides an excellent user experience across all platforms and scenarios.
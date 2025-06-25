import { gameState } from '../../src/core/gameState.js';
import { getCurrentGrowTime } from '../../src/core/gameLogic.js';
import { SEEDS } from '../../src/data/gameData.js';
import { renderUpgrades } from '../../src/ui/renderer.js';
import { initEventHandlers } from '../../src/ui/eventHandlers.js';

describe('Upgrade Purchase Integration', () => {
  beforeEach(() => {
    document.body.innerHTML = `
      <ul id="upgrade-list"></ul>
      <template id="upgrade-template">
        <li class="upgrade-item">
          <span class="upgrade-name"></span>
          <span class="upgrade-description"></span>
          <button class="upgrade-purchase-btn">
            Cost: <span class="upgrade-cost"></span>
          </button>
        </li>
      </template>
    `;
    gameState.currency = 1000;
    gameState.upgrades = { faster_growth: 0, better_nurture: 0, unlock_plot: 0 };
    gameState.plots = [
      { id: 1, state: 'empty', seed: null, timeLeft: 0, needsNurture: false, lastNurture: 0 },
      { id: 2, state: 'locked', seed: null, timeLeft: 0, needsNurture: false, lastNurture: 0 },
      { id: 3, state: 'locked', seed: null, timeLeft: 0, needsNurture: false, lastNurture: 0 },
    ];
    renderUpgrades();
    initEventHandlers();
  });
  
  test('should purchase faster growth upgrade', () => {
    const upgradeBtn = document.querySelector('[data-upgrade-key="faster_growth"] .upgrade-purchase-btn');
    
    upgradeBtn.click();
    
    expect(gameState.upgrades.faster_growth).toBe(1);
    expect(gameState.currency).toBe(950); // 1000 - 50
    
    // Test that grow time is reduced
    const growTime = getCurrentGrowTime('star_spud');
    expect(growTime).toBeLessThan(SEEDS.star_spud.growTime);
  });
  
  test('should unlock new plot', () => {
    expect(gameState.plots.filter(p => p.state === 'locked')).toHaveLength(2);
    
    const unlockBtn = document.querySelector('[data-upgrade-key="unlock_plot"] .upgrade-purchase-btn');
    unlockBtn.click();
    
    expect(gameState.plots.filter(p => p.state === 'locked')).toHaveLength(1);
    expect(gameState.plots.filter(p => p.state === 'empty')).toHaveLength(2);
  });
});

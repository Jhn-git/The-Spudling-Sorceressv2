const { initializeTestEnvironment } = require('../setup.js');
import { gameState } from '../../src/core/gameState.js';
import { renderPlots } from '../../src/ui/renderer.js';
import { initEventHandlers } from '../../src/ui/eventHandlers.js';

describe('Plot Management Integration', () => {
  beforeEach(() => {
    document.body.innerHTML = `
      <ul id="plot-list-area"></ul>
      <template id="plot-template">
        <li class="plot-item">
          <span class="plot-name-label"></span>
          <span class="plot-state-indicator"></span>
          <span class="plot-emoji"></span>
          <span class="plot-plant-name"></span>
          <span class="plot-status-text"></span>
          <span class="plot-progress-bar"></span>
          <span class="plot-timer"></span>
          <button class="plot-action-btn awaken-btn">Awaken</button>
          <button class="plot-action-btn plant-btn">Plant</button>
          <button class="plot-action-btn nurture-btn">Nurture</button>
          <button class="plot-action-btn harvest-btn">Harvest</button>
        </li>
      </template>
    `;
    initializeTestEnvironment();
    gameState.plots = [
      { id: 1, state: 'empty', seed: null, timeLeft: 0, needsNurture: false, lastNurture: 0 }
    ];
    gameState.currency = 100;
    gameState.selectedSeed = 'star_spud';
    renderPlots();
    initEventHandlers();
  });
  
  test('should complete full plot lifecycle', () => {
    // Start with empty plot
    expect(gameState.plots[0].state).toBe('empty');
    
    // Awaken plot
    const awakenBtn = document.querySelector('.awaken-btn');
    awakenBtn.click();
    expect(gameState.plots[0].state).toBe('awakened');
    
    // Plant seed
    const plantBtn = document.querySelector('.plant-btn');
    plantBtn.click();
    expect(gameState.plots[0].state).toBe('growing');
    expect(gameState.plots[0].seed).toBe('star_spud');
    
    // Simulate growth completion
    gameState.plots[0].timeLeft = 0;
    gameState.plots[0].state = 'ready';
    renderPlots();
    
    // Harvest
    const harvestBtn = document.querySelector('.harvest-btn');
    harvestBtn.click();
    expect(gameState.plots[0].state).toBe('empty');
    expect(gameState.currency).toBeGreaterThan(100);
  });
});

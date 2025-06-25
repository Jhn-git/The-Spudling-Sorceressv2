import { gameTick } from '../../src/systems/gameLoop.js';
import { gameState } from '../../src/core/gameState.js';

describe('Event System Integration', () => {
  beforeEach(() => {
    document.body.innerHTML = `
      <div id="event-banner" style="display: none;">
        <h3 id="event-name"></h3>
        <p id="event-desc"></p>
        <p>Time left: <span id="event-timer"></span>s</p>
      </div>
    `;
    gameState.activeEvent = null;
  });

  test('should trigger and apply event effects', () => {
    // Mock random to trigger event
    jest.spyOn(Math, 'random').mockReturnValue(0.005); // Triggers event
    
    gameTick();
    
    expect(gameState.activeEvent).toBeDefined();
    expect(gameState.activeEvent.key).toMatch(/harvest_frenzy|super_nurture/);
    
    // Test event banner display
    const banner = document.getElementById('event-banner');
    expect(banner.style.display).toBe('block');
  });
});

import { getCurrentGrowTime, getCurrentNurtureTimeReduction } from '../../src/core/gameLogic.js';
import { SEEDS, UPGRADE_DEFS } from '../../src/data/gameData.js';
import { gameState } from '../../src/core/gameState.js';

describe('Growth Time Calculations', () => {
  beforeEach(() => {
    // Reset gameState before each test
    gameState.upgrades = { faster_growth: 0, better_nurture: 0, unlock_plot: 0 };
    gameState.activeEvent = null;
  });
  
  test('should return base grow time with no upgrades', () => {
    const result = getCurrentGrowTime('star_spud');
    expect(result).toBe(SEEDS.star_spud.growTime);
  });
  
  test('should apply faster growth upgrade multiplier', () => {
    gameState.upgrades.faster_growth = 1;
    const result = getCurrentGrowTime('star_spud');
    const expected = Math.floor(SEEDS.star_spud.growTime * UPGRADE_DEFS.faster_growth.effect[0]);
    expect(result).toBe(expected);
  });
  
  test('should calculate nurture time reduction correctly', () => {
    gameState.upgrades.better_nurture = 2;
    const result = getCurrentNurtureTimeReduction();
    // The effect for level 2 is at index 1
    const expected = UPGRADE_DEFS.better_nurture.effect[1];
    expect(result).toBe(expected);
  });
});

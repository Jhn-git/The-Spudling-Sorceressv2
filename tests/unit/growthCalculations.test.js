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

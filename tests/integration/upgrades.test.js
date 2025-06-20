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

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
    }
  });
});

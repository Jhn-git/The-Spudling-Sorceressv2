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

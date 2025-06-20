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

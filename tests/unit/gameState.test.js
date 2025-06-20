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

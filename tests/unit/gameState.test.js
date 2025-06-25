import { gameState, saveGame, loadGame } from '../../src/core/gameState.js';

describe('Game State Management', () => {
  test('should initialize with default values', () => {
    expect(gameState.currency).toBe(0);
    expect(gameState.plots).toHaveLength(3);
    expect(gameState.plots[0].state).toBe('empty');
  });
  
  test('should save game state to localStorage', () => {
    gameState.currency = 100;
    saveGame();
    expect(localStorage.getItem('spudling_currency')).toBe('100');
  });
  
  test('should load game state from localStorage', () => {
    localStorage.setItem('spudling_currency', '250');
    loadGame();
    expect(gameState.currency).toBe(250);
  });
});

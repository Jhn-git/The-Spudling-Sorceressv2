import { playSound } from '../../src/systems/audioSystem.js';

describe('Audio System', () => {
  beforeEach(() => {
    // Mock Web Audio API
    global.AudioContext = jest.fn().mockImplementation(() => ({
      createOscillator: jest.fn(() => ({
        type: '',
        frequency: { setValueAtTime: jest.fn() },
        connect: jest.fn(() => ({ connect: jest.fn() })),
        start: jest.fn(),
        stop: jest.fn()
      })),
      createGain: jest.fn(() => ({
        gain: { 
          setValueAtTime: jest.fn(),
          exponentialRampToValueAtTime: jest.fn()
        },
        connect: jest.fn(() => ({ connect: jest.fn() }))
      })),
      currentTime: 0,
      destination: {},
      state: 'running',
      close: jest.fn().mockResolvedValue()
    }));
  });
  
  test('should create audio context and play sound', () => {
    playSound('harvest');
    expect(AudioContext).toHaveBeenCalled();
  });
  
  test('should handle missing AudioContext gracefully', () => {
    delete global.AudioContext;
    delete global.webkitAudioContext;
    expect(() => playSound('harvest')).not.toThrow();
  });
});

import '@testing-library/jest-dom';

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
global.localStorage = localStorageMock;

// Mock DOM elements
global.document.body.innerHTML = `
  <div id="currency">0</div>
  <ul id="plot-list-area"></ul>
  <div id="feedback"></div>
  <div id="seed-select-controls"></div>
  <ul id="upgrade-list"></ul>
  <button id="harvest-all-btn"></button>
  <button id="replant-all-btn"></button>
  <div id="event-banner" style="display: none;">
    <span id="event-name"></span>
    <span id="event-desc"></span>
    <span id="event-timer"></span>
  </div>
`;

// Global test utilities
global.initializeTestEnvironment = () => {
  // Reset game state
  global.currency = 0;
  global.plots = [
    { state: 'empty', seed: null, plantedAt: null, timeLeft: 0, nurtureActive: false, growTimeSnapshot: 0 },
    { state: 'locked', seed: null, plantedAt: null, timeLeft: 0, nurtureActive: false, growTimeSnapshot: 0 },
    { state: 'locked', seed: null, plantedAt: null, timeLeft: 0, nurtureActive: false, growTimeSnapshot: 0 }
  ];
  global.upgrades = { faster_growth: 0, better_nurture: 0, unlock_plot: 0 };
  global.selectedSeed = 'star_spud';
  global.activeEvent = null;
};

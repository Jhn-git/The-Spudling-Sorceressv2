// jest.config.mjs for ESM support
export default {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/tests/setup.js'],
  testPathIgnorePatterns: [
    '<rootDir>/tests/e2e/',
    '<rootDir>/tests/performance/'
  ],
  collectCoverageFrom: [
    'main.js',
    'src/**/*.js',
    '!node_modules/**'
  ],
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70
    }
  }
};

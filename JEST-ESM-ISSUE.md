# Jest + ESM Setup Issues and Solution

## Problem

When using Jest with native ES modules (ESM) in a vanilla JavaScript project, you may encounter errors like:

- `SyntaxError: Cannot use import statement outside a module`
- `Jest failed to parse a file... Jest encountered an unexpected token`

This happens even if your `package.json` has `"type": "module"` and your Jest config is ESM (`jest.config.mjs`).

## Cause

- Jest's `setupFilesAfterEnv` and test file loading do **not** fully support ESM (`import`/`export`) in all environments without extra configuration.
- Jest expects setup files to be CommonJS (`require`), not ESM (`import`), unless you use Babel or experimental Node features.

## Solution (Best Practice for 2025)

1. **Keep your source code ESM** (`import`/`export`).
2. **Write your Jest setup file (`tests/setup.js`) in CommonJS** using `require`:
   ```js
   require('@testing-library/jest-dom');
   const gameData = require('../src/data/gameData.js');
   // ...etc
   ```
3. **Reference the setup file in your Jest config** (works for both `.js` and `.mjs`):
   ```js
   // jest.config.mjs
   export default {
     testEnvironment: 'jsdom',
     setupFilesAfterEnv: ['<rootDir>/tests/setup.js'],
     // ...other config
   };
   ```
4. **Do not use `import` in your setup file** unless you add Babel or use Node's experimental test runner.

## Alternative (Full ESM Support)
- Use Babel (`babel-jest`) to transform ESM for Jest.
- Or, use Node's experimental `node:test` runner for pure ESM.

## References
- [Jest ESM Docs](https://jestjs.io/docs/ecmascript-modules)
- [Jest Setup Files](https://jestjs.io/docs/configuration#setupfilesafterenv-array)

---

**Summary:**
- Use CommonJS (`require`) in Jest setup files for compatibility.
- Keep your app code ESM for modern JS best practices.

# Gemini Guidance

This file provides guidance to the Gemini AI assistant when working with the codebase in this repository.

## Project Overview

"The Spudling Sorceress" is a web-based incremental game built with vanilla JavaScript, HTML, and CSS. The project does not use a major frontend framework like React or Vue. It is managed with `npm` and uses ES Modules for its JavaScript files.

## Key Technologies

- **Language:** JavaScript (ES Modules)
- **Package Manager:** npm
- **Testing:**
  - **Jest:** For unit and integration tests (`.test.js`).
  - **Playwright:** For end-to-end tests (`.spec.js`).
- **Code Style:** While there is no explicit linter configuration visible, the code follows a consistent style. Please maintain this consistency.

## Development Workflow

### Installation

To install dependencies, run:
```bash
npm install
```

### Running the Application

The application can be run by opening the `index.html` file in a web browser. There is no dedicated development server.

### Running Tests

The `package.json` file contains the scripts for running tests. The primary commands are:

- **Run all tests (likely Jest):**
  ```bash
  npm test
  ```
- **Run End-to-End tests (Playwright):**
  ```bash
  npm run test:e2e
  ```

Always run the relevant tests after making changes to ensure that functionality is not broken.

## Code Style and Conventions

- **Directory Structure:** Adhere to the existing directory structure.
  - **`src/core`**: Core game logic and state management.
  - **`src/ui`**: UI rendering and event handling.
  - **`src/systems`**: High-level game systems (e.g., game loop, audio).
  - **`src/data`**: Static game data.
  - **`src/styles`**: CSS files, organized by BEM-like principles (base, components, layout).
- **Testing:**
  - Place new unit tests in `tests/unit/`.
  - Place new integration tests in `tests/integration/`.
  - Place new E2E tests in `tests/e2e/`.
  - Name test files to match the module they are testing, using the `*.test.js` (for Jest) or `*.spec.js` (for Playwright) suffix.
- **Modularity:** Use ES Modules (`import`/`export`) for all JavaScript files. Avoid CommonJS (`require`/`module.exports`).
- **Commits:** Before committing, ensure all tests pass. Write clear and concise commit messages that describe the "why" of the change.

## Important Notes

- **JEST/ESM Compatibility:** The project has a history of issues with Jest and ES Modules (see `archive/JEST-ESM-ISSUE.md`). Be mindful of this when working with tests and dependencies. Ensure any new test setup conforms to the existing configuration in `jest.config.mjs` and `tests/setup.mjs`.

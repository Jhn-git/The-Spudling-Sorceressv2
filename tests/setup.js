const { TextEncoder, TextDecoder } = require('util');

global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

const { JSDOM } = require('jsdom');

function setupJSDOM(html = '<!DOCTYPE html><html><body></body></html>') {
  const dom = new JSDOM(html, {
    url: 'http://localhost/',
    referrer: 'http://localhost/',
    contentType: 'text/html',
    storageQuota: 10000000
  });

  global.window = dom.window;
  global.document = dom.window.document;
  global.navigator = {
    userAgent: 'node.js',
  };
  global.requestAnimationFrame = (callback) => {
    return setTimeout(callback, 0);
  };
  global.cancelAnimationFrame = (id) => {
    clearTimeout(id);
  };
  global.localStorage = dom.window.localStorage;
  global.CustomEvent = dom.window.CustomEvent;
}

function initializeTestEnvironment() {
    // Reset DOM, game state, etc.
    setupJSDOM();
    // ... any other global setup
}

function setupUpgradeTestDOM() {
    const dom = new JSDOM(`
    <!DOCTYPE html>
    <html>
    <body>
      <div id="upgrades-container">
        <div class="upgrade-card" data-upgrade-key="faster_growth">
          <button class="upgrade-purchase-btn"></button>
        </div>
        <div class="upgrade-card" data-upgrade-key="unlock_plot">
          <button class="upgrade-purchase-btn"></button>
        </div>
      </div>
    </body>
    </html>
  `);
  global.document = dom.window.document;
}

module.exports = {
  setupJSDOM,
  initializeTestEnvironment,
  setupUpgradeTestDOM
};
import { test, expect } from '@playwright/test';

test.describe('Game Initialization', () => {
  test('should load game with default state', async ({ page }) => {
    await page.goto('http://localhost:3000');
    
    // Check title
    await expect(page.locator('h1')).toContainText('The Spudling Sorceress');
    
    // Check initial currency
    await expect(page.locator('#currency')).toHaveText('0');
    
    // Check initial plot state
    await expect(page.locator('.plot-item').first()).toContainText('[Empty 💨]');
    
    // Check seed selection
    await expect(page.locator('.seed-btn').first()).toBeVisible();
  });
  
  test('should persist game state across reloads', async ({ page }) => {
    await page.goto('http://localhost:3000');
    
    // Modify game state
    await page.evaluate(() => {
      window.currency = 500;
      window.saveGame();
    });
    
    // Reload page
    await page.reload();
    
    // Check state persistence
    await expect(page.locator('#currency')).toHaveText('500');
  });
});

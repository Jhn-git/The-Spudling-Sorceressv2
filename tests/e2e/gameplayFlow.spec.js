test.describe('Complete Gameplay Flow', () => {
  test('should complete full farming cycle', async ({ page }) => {
    await page.goto('http://localhost:3000');
    
    // Awaken first plot
    await page.locator('.awaken-btn').first().click();
    await expect(page.locator('.plot-item').first()).toContainText('[Awakened ✨]');
    
    // Select seed
    await page.locator('[data-seed="star_spud"]').click();
    await expect(page.locator('[data-seed="star_spud"]')).toHaveClass(/selected/);
    
    // Plant seed
    await page.locator('.plant-btn').first().click();
    await expect(page.locator('.plot-item').first()).toContainText('Star Spud');
    
    // Wait for growth (accelerated for testing)
    await page.evaluate(() => {
      window.plots[0].timeLeft = 1;
    });
    
    // Wait for ready state
    await page.waitForFunction(() => {
      return window.plots[0].state === 'ready';
    });
    
    // Harvest
    const initialCurrency = await page.locator('#currency').textContent();
    await page.locator('.harvest-btn').first().click();
    
    // Verify currency increase
    const newCurrency = await page.locator('#currency').textContent();
    expect(parseInt(newCurrency)).toBeGreaterThan(parseInt(initialCurrency));
    
    // Verify plot reset
    await expect(page.locator('.plot-item').first()).toContainText('[Empty 💨]');
  });
});

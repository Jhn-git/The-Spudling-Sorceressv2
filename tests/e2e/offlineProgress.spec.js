test.describe('Offline Progress', () => {
  test('should show offline modal on return', async ({ page }) => {
    await page.goto('http://localhost:3000');
    
    // Set up offline scenario
    await page.evaluate(() => {
      window.offlineRewards = {
        totalGainedCurrency: 50,
        timeAwayFormatted: '1h 30m',
        harvestedPlants: {
          star_spud: { name: 'Star Spud', emoji: '🥔', count: 2, yield: 50 }
        }
      };
      window.offlineSummary = 'Test offline summary';
      window.showOfflineModal(window.offlineSummary);
    });
    
    // Verify modal appears
    await expect(page.locator('#offline-modal-overlay')).toBeVisible();
    await expect(page.locator('#claim-offline-btn')).toBeVisible();
    
    // Test claim functionality
    const initialCurrency = await page.locator('#currency').textContent();
    await page.locator('#claim-offline-btn').click();
    
    const newCurrency = await page.locator('#currency').textContent();
    expect(parseInt(newCurrency)).toBeGreaterThan(parseInt(initialCurrency));
    
    // Verify modal closes
    await expect(page.locator('#offline-modal-overlay')).toBeHidden();
  });
});

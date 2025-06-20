test.describe('Mobile Responsiveness', () => {
  test('should work correctly on mobile viewport', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 }); // iPhone SE
    await page.goto('http://localhost:3000');
    
    // Check mobile layout
    await expect(page.locator('.game-header')).toBeVisible();
    await expect(page.locator('.plot-item').first()).toBeVisible();
    
    // Test mobile interactions
    await page.locator('.awaken-btn').first().click();
    await page.locator('[data-seed="star_spud"]').click();
    await page.locator('.plant-btn').first().click();
    
    // Verify mobile-specific styling
    const settingsBtn = page.locator('.settings-toggle');
    await expect(settingsBtn).toBeVisible();
  });
});

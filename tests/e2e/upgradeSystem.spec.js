test.describe('Upgrade System', () => {
  test('should purchase and apply upgrades', async ({ page }) => {
    await page.goto('http://localhost:3000');
    
    // Give player currency
    await page.evaluate(() => {
      window.currency = 1000;
      window.renderCurrency();
    });
    
    // Purchase faster growth upgrade
    await page.locator('[data-upgrade-key="faster_growth"] .upgrade-purchase-btn').click();
    
    // Verify upgrade level increased
    await expect(page.locator('[data-upgrade-key="faster_growth"] .upgrade-name')).toContainText('(Lv 1)');
    
    // Verify currency deducted
    await expect(page.locator('#currency')).toHaveText('950');
    
    // Test upgrade effect
    const growTime = await page.evaluate(() => {
      return window.getCurrentGrowTime('star_spud');
    });
    expect(growTime).toBeLessThan(60);
  });
});

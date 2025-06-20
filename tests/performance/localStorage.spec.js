test.describe('LocalStorage Performance', () => {
  test('should handle frequent saves efficiently', async ({ page }) => {
    await page.goto('http://localhost:3000');
    
    const startTime = Date.now();
    
    // Perform many save operations
    await page.evaluate(() => {
      for (let i = 0; i < 1000; i++) {
        window.saveGame();
      }
    });
    
    const endTime = Date.now();
    expect(endTime - startTime).toBeLessThan(1000); // Should complete in under 1 second
  });
});

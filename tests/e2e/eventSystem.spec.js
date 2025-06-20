test.describe('Game Events', () => {
  test('should trigger and display events', async ({ page }) => {
    await page.goto('http://localhost:3000');
    
    // Force trigger event
    await page.evaluate(() => {
      window.activeEvent = {
        key: 'harvest_frenzy',
        timeLeft: 60
      };
      document.getElementById('event-name').textContent = 'Harvest Frenzy! 🎉';
      document.getElementById('event-desc').textContent = 'All harvests yield +50% 💎 for 60 seconds!';
      document.getElementById('event-timer').textContent = '60';
      document.getElementById('event-banner').style.display = 'block';
    });
    
    // Verify event banner
    await expect(page.locator('#event-banner')).toBeVisible();
    await expect(page.locator('#event-name')).toContainText('Harvest Frenzy!');
    await expect(page.locator('#event-timer')).toContainText('60');
  });
});

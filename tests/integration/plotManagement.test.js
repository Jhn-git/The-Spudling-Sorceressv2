describe('Plot Management Integration', () => {
  beforeEach(() => {
    document.body.innerHTML = `
      <ul id="plot-list-area"></ul>
      <template id="plot-template">
        <li class="plot-item">
          <button class="awaken-btn">Awaken</button>
          <button class="plant-btn">Plant</button>
          <button class="harvest-btn">Harvest</button>
        </li>
      </template>
    `;
    initializeTestEnvironment();
  });
  
  test('should complete full plot lifecycle', () => {
    // Start with empty plot
    expect(plots[0].state).toBe('empty');
    
    // Awaken plot
    const awakenBtn = document.querySelector('.awaken-btn');
    awakenBtn.click();
    expect(plots[0].state).toBe('awakened');
    
    // Plant seed
    selectedSeed = 'star_spud';
    currency = 100;
    const plantBtn = document.querySelector('.plant-btn');
    plantBtn.click();
    expect(plots[0].state).toBe('growing');
    expect(plots[0].seed).toBe('star_spud');
    
    // Simulate growth completion
    plots[0].timeLeft = 0;
    plots[0].state = 'ready';
    renderPlots();
    
    // Harvest
    const harvestBtn = document.querySelector('.harvest-btn');
    harvestBtn.click();
    expect(plots[0].state).toBe('empty');
    expect(currency).toBeGreaterThan(100);
  });
});

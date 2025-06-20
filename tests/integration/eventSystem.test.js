describe('Event System Integration', () => {
  test('should trigger and apply event effects', () => {
    // Mock random to trigger event
    jest.spyOn(Math, 'random').mockReturnValue(0.005); // Triggers event
    
    activeEvent = null;
    gameTick();
    
    expect(activeEvent).toBeDefined();
    expect(activeEvent.key).toMatch(/harvest_frenzy|super_nurture/);
    
    // Test event banner display
    const banner = document.getElementById('event-banner');
    expect(banner.style.display).toBe('block');
  });
});

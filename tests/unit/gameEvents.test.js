describe('Game Events System', () => {
  test('should have valid event definitions', () => {
    Object.keys(GAME_EVENTS).forEach(key => {
      const event = GAME_EVENTS[key];
      expect(event).toHaveProperty('name');
      expect(event).toHaveProperty('desc');
      expect(event).toHaveProperty('duration');
      expect(event).toHaveProperty('applyEffect');
      expect(typeof event.applyEffect).toBe('function');
    });
  });
  
  test('should apply harvest frenzy effect correctly', () => {
    const baseYield = 10;
    const boostedYield = GAME_EVENTS.harvest_frenzy.applyEffect(baseYield);
    expect(boostedYield).toBe(15); // +50% = 15
  });
  
  test('should apply super nurture effect correctly', () => {
    const baseNurture = 5;
    const boostedNurture = GAME_EVENTS.super_nurture.applyEffect(baseNurture);
    expect(boostedNurture).toBe(10); // 2x = 10
  });
});

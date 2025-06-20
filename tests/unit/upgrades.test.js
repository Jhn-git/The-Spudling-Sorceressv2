describe('Upgrade System', () => {
  test('should have valid upgrade definitions', () => {
    Object.keys(UPGRADE_DEFS).forEach(key => {
      const upgrade = UPGRADE_DEFS[key];
      expect(upgrade).toHaveProperty('name');
      expect(upgrade).toHaveProperty('descTemplate');
      expect(upgrade).toHaveProperty('cost');
      expect(upgrade).toHaveProperty('effect');
      expect(upgrade).toHaveProperty('maxLevel');
      expect(upgrade.cost).toHaveLength(upgrade.maxLevel);
      expect(upgrade.effect).toHaveLength(upgrade.maxLevel);
    });
  });
  
  test('should calculate upgrade costs correctly', () => {
    const upgrade = UPGRADE_DEFS.faster_growth;
    expect(upgrade.cost[0]).toBe(50); // First level cost
    expect(upgrade.cost[1]).toBe(120); // Second level cost
  });
});

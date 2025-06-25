export function formatTime(seconds) {
    if (seconds < 60) return `${seconds}s`;
    if (seconds < 3600) return `${Math.floor(seconds/60)}m ${seconds%60}s`;
    if (seconds < 86400) return `${Math.floor(seconds/3600)}h ${Math.floor((seconds%3600)/60)}m`;
    return `${Math.floor(seconds/86400)}d ${Math.floor((seconds%86400)/3600)}h`;
}

export function createOfflineSummary(details) {
  let summary = 'Welcome back! ';
  if (details.totalGainedCurrency) {
    summary += `You earned ${details.totalGainedCurrency} gems while away. `;
  }
  if (details.harvestCounts) {
    Object.entries(details.harvestCounts).forEach(([seed, count]) => {
      const seedName = global.SEEDS[seed]?.name || seed;
      summary += `${seedName}: ${count}x `;
    });
  }
  if (details.harvestedPlants) {
    Object.entries(details.harvestedPlants).forEach(([seed, data]) => {
      summary += `${data.name}: ${data.count}x `;
    });
  }
  return summary.trim();
}
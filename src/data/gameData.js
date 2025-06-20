export const STORAGE_KEYS = {
    PLOTS: 'spudling_plots',
    CURRENCY: 'spudling_currency',
    LAST_TIME: 'spudling_last_time',
    UPGRADES: 'spudling_upgrades'
};

export const SEEDS = {
    star_spud: {
        name: 'Star Spud',
        emoji: '🥔',
        plantEmoji: '🌰',
        readyEmoji: '🌟🥔',
        growTime: 60,
        yield: 10,
        cost: 0
    },
    giggleberry: {
        name: 'Giggleberry',
        emoji: '🍓',
        plantEmoji: '🌱',
        readyEmoji: '🌟🍓',
        growTime: 90,
        yield: 18,
        cost: 5
    }
};

export const GAME_CONSTANTS = {
    NURTURE_EMOJI: '💧',
    BASE_NURTURE_TIME_REDUCTION: 5,
    NURTURE_WINDOW: 4,
    NURTURE_CHANCE_PER_SECOND: 0.18
};

export const GAME_EVENTS = {
    harvest_frenzy: {
        name: 'Harvest Frenzy! 🎉',
        desc: 'All harvests yield +50% 💎 for 60 seconds!',
        duration: 60,
        applyEffect: (yieldAmount) => Math.floor(yieldAmount * 1.5)
    },
    super_nurture: {
        name: 'Super Soak! 💧💧',
        desc: 'Nurture taps are twice as effective for 45 seconds!',
        duration: 45,
        applyEffect: (nurtureValue) => nurtureValue * 2
    }
};

export const UPGRADE_DEFS = {
    faster_growth: {
        name: 'Faster Growth',
        descTemplate: (effectMultiplier) => `Time Multiplier: ${(effectMultiplier * 100).toFixed(0)}%`,
        cost: [50, 120, 300, 800, 2000],
        effect: [0.9, 0.81, 0.729, 0.6561, 0.59049],
        maxLevel: 5
    },
    better_nurture: {
        name: 'Better Nurturing',
        descTemplate: (effectSeconds) => `Nurture Bonus: +${effectSeconds}s`,
        cost: [40, 100, 250, 600, 1500],
        effect: [7, 9, 11, 13, 15],
        maxLevel: 5
    },
    unlock_plot: {
        name: 'Unlock New Plot',
        descTemplate: () => `Unlocks your next farming plot!`,
        cost: [250, 1000],
        effect: [1, 2],
        maxLevel: 2
    }
};
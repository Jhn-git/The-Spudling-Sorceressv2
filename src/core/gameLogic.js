import { SEEDS, UPGRADE_DEFS, GAME_CONSTANTS, GAME_EVENTS } from '../data/gameData.js';
import { gameState } from './gameState.js';

export function getCurrentGrowTime(seedKey) {
    let baseTime = SEEDS[seedKey].growTime;
    const growthLevel = gameState.upgrades.faster_growth;
    if (growthLevel > 0 && UPGRADE_DEFS.faster_growth.effect[growthLevel - 1]) {
        baseTime *= UPGRADE_DEFS.faster_growth.effect[growthLevel - 1];
    }
    return Math.floor(baseTime);
}

export function getCurrentNurtureTimeReduction() {
    const nurtureLevel = gameState.upgrades.better_nurture;
    let baseValue = GAME_CONSTANTS.BASE_NURTURE_TIME_REDUCTION;
    if (nurtureLevel > 0 && UPGRADE_DEFS.better_nurture.effect[nurtureLevel - 1]) {
        baseValue = UPGRADE_DEFS.better_nurture.effect[nurtureLevel - 1];
    }
    
    if (gameState.activeEvent && gameState.activeEvent.key === 'super_nurture') {
        return GAME_EVENTS.super_nurture.applyEffect(baseValue);
    }
    return baseValue;
}
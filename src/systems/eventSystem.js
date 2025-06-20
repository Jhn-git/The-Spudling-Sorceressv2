import { GAME_EVENTS } from '../data/gameData.js';
import { gameState } from '../core/gameState.js';
import { showFeedback } from '../ui/feedback.js';

export function handleActiveEvents() {
    if (gameState.activeEvent) {
        gameState.activeEvent.timeLeft--;
        document.getElementById('event-timer').textContent = gameState.activeEvent.timeLeft;
        if (gameState.activeEvent.timeLeft <= 0) {
            gameState.activeEvent = null;
            document.getElementById('event-banner').style.display = 'none';
            showFeedback('The event has ended!', null);
        }
    } else {
        // Start a new event randomly (1% chance each second)
        if (Math.random() < 0.01) {
            const eventKeys = Object.keys(GAME_EVENTS);
            const randomEventKey = eventKeys[Math.floor(Math.random() * eventKeys.length)];
            gameState.activeEvent = {
                key: randomEventKey,
                timeLeft: GAME_EVENTS[randomEventKey].duration
            };
            // Show banner
            const banner = document.getElementById('event-banner');
            document.getElementById('event-name').textContent = GAME_EVENTS[randomEventKey].name;
            document.getElementById('event-desc').textContent = GAME_EVENTS[randomEventKey].desc;
            document.getElementById('event-timer').textContent = gameState.activeEvent.timeLeft;
            banner.style.display = 'block';
            showFeedback('A special event has started!', 'upgrade');
        }
    }
}
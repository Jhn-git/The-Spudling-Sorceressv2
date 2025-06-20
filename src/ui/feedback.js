import { playSound } from '../systems/audioSystem.js';

export function showFeedback(msg, soundType = null) {
    const feedbackEl = document.getElementById('feedback');
    if (!feedbackEl) return;
    
    feedbackEl.textContent = msg;
    if (soundType) playSound(soundType);
    setTimeout(() => {
        if (feedbackEl.textContent === msg) {
            feedbackEl.textContent = '';
        }
    }, 2000);
}
export function playSound(type) {
    if (!window.AudioContext && !window.webkitAudioContext) return;
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    let freq = 440;
    let duration = 0.18;

    switch (type) {
        case 'harvest': freq = 660; duration = 0.2; break;
        case 'nurture': freq = 880; duration = 0.15; break;
        case 'upgrade': freq = 550; duration = 0.2; break;
        case 'plant': freq = 330; duration = 0.15; break;
        case 'awaken': freq = 220; duration = 0.1; break;
        case 'error': freq = 110; duration = 0.3; break;
        default: freq = 440;
    }

    const o = ctx.createOscillator();
    o.type = 'triangle';
    o.frequency.setValueAtTime(freq, ctx.currentTime);

    const g = ctx.createGain();
    g.gain.setValueAtTime(0.08, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.00001, ctx.currentTime + duration);

    o.connect(g).connect(ctx.destination);
    o.start();
    o.stop(ctx.currentTime + duration);

    setTimeout(() => {
        if (ctx.state !== 'closed') {
            ctx.close().catch(e => console.warn("AudioContext close error:", e));
        }
    }, duration * 1000 + 50);
}
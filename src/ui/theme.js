
function setDarkMode(on) {
    document.body.classList.toggle('dark', on);
    localStorage.setItem('spudling_dark', on ? '1' : '0');
    const darkBtn = document.getElementById('dark-toggle');
    if (darkBtn) {
        darkBtn.textContent = on ? '☀️ Light Mode' : '🌙 Dark Mode';
        darkBtn.setAttribute('aria-pressed', on ? 'true' : 'false');
    }
}

function toggleDarkModeVisibility() {
    const darkToggle = document.getElementById('dark-toggle');
    if (!darkToggle) return;

    const isHidden = darkToggle.classList.contains('hidden');
    darkToggle.classList.toggle('hidden', !isHidden);
    localStorage.setItem('spudling_show_dark_toggle', isHidden ? '1' : '0');
    
    const settingsBtn = document.getElementById('settings-toggle');
    if (settingsBtn) {
        settingsBtn.setAttribute('aria-pressed', isHidden ? 'false' : 'true');
        settingsBtn.title = isHidden ? 'Settings (Dark mode visible)' : 'Settings (Dark mode hidden)';
    }
}

function initTheme() {
    const darkBtn = document.getElementById('dark-toggle');
    if (darkBtn) {
        darkBtn.onclick = () => setDarkMode(!document.body.classList.contains('dark'));
    }

    let prefersDark = localStorage.getItem('spudling_dark') === '1';
    if (localStorage.getItem('spudling_dark') === null && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        prefersDark = true;
    }
    if (prefersDark) {
        setDarkMode(true);
    }

    const settingsBtn = document.getElementById('settings-toggle');
    if (settingsBtn) {
        settingsBtn.onclick = toggleDarkModeVisibility;
    }

    const showDarkToggle = localStorage.getItem('spudling_show_dark_toggle');
    const darkToggle = document.getElementById('dark-toggle');
    if (darkToggle) {
        if (showDarkToggle === '0') {
            darkToggle.classList.add('hidden');
            if (settingsBtn) {
                settingsBtn.setAttribute('aria-pressed', 'true');
                settingsBtn.title = 'Settings (Dark mode hidden)';
            }
        } else {
            if (settingsBtn) {
                settingsBtn.title = 'Settings (Dark mode visible)';
            }
        }
    }

    const yearEl = document.getElementById('current-year');
    if (yearEl) {
        yearEl.textContent = new Date().getFullYear();
    }
}

document.addEventListener('DOMContentLoaded', initTheme);

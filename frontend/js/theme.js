// Persistent Theme Toggle System
(function() {
    const savedTheme = localStorage.getItem('theme') || 'light';
    if (savedTheme === 'dark') {
        document.body.classList.add('dark-mode');
    } else {
        document.body.classList.remove('dark-mode');
    }
})();

document.addEventListener('DOMContentLoaded', () => {
    const themeToggleBtn = document.getElementById('themeToggleBtn');
    const themeIcon = document.getElementById('themeIcon');

    if (themeToggleBtn && themeIcon) {
        // Sync initial icon state
        const currentTheme = localStorage.getItem('theme') || 'light';
        themeIcon.textContent = currentTheme === 'dark' ? '🌙' : '☀️';

        themeToggleBtn.addEventListener('click', () => {
            document.body.classList.toggle('dark-mode');
            const isDark = document.body.classList.contains('dark-mode');
            localStorage.setItem('theme', isDark ? 'dark' : 'light');
            themeIcon.textContent = isDark ? '🌙' : '☀️';
            
            // Dispatch a global event for other components if needed
            window.dispatchEvent(new CustomEvent('themechanged', { detail: { theme: isDark ? 'dark' : 'light' } }));
        });
    }
});

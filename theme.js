class ThemeManager {
    constructor() {
        this.currentTheme = 'dark'; // Default theme
        this.themeToggleBtn = null;
        this.themeIcon = null;

        this.init();
    }

    init() {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.setupTheme());
        } else {
            this.setupTheme();
        }
    }

    setupTheme() {
        this.themeToggleBtn = document.querySelector('.dark-mode-toggle');
        this.themeIcon = document.querySelector('.dark-mode-icon');

        if (!this.themeToggleBtn || !this.themeIcon) {
            console.error('Theme toggle elements not found');
            return;
        }

        this.loadSavedTheme();

        this.applyTheme(this.currentTheme);

        this.setupEventListeners();
    }

    setupEventListeners() {
        this.themeToggleBtn.addEventListener('click', () => {
            this.toggleTheme();
        });

        this.themeToggleBtn.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                this.toggleTheme();
            }
        });

        if (window.matchMedia) {
            const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
            mediaQuery.addEventListener('change', (e) => {
                if (!localStorage.getItem('todo-theme-preference')) {
                    const newTheme = e.matches ? 'dark' : 'light';
                    this.currentTheme = newTheme;
                    this.applyTheme(newTheme);
                }
            });
        }
    }

    toggleTheme() {
        console.log('Toggling theme...');
        console.log(`Current theme: ${this.currentTheme}`);
        const newTheme = this.currentTheme === 'dark' ? 'light' : 'dark';
        this.currentTheme = newTheme;
        this.applyTheme(newTheme);
        this.saveTheme(newTheme);

        this.animateToggle();
    }

    applyTheme(theme) {
        const body = document.body;
        const headerBackground = document.querySelector('.header-background');

        console.log(`Applying ${theme} theme`);

        if (theme === 'light') {
            body.classList.add('light-theme');
            if (headerBackground) {
                headerBackground.classList.add('light-theme');
            }

            this.updateThemeIcon('moon');

            this.themeToggleBtn.setAttribute('aria-label', 'Switch to dark mode');

        } else {
            body.classList.remove('light-theme');
            if (headerBackground) {
                headerBackground.classList.remove('light-theme');
            }
            this.updateThemeIcon('sun');

            this.themeToggleBtn.setAttribute('aria-label', 'Switch to light mode');
        }

        this.dispatchThemeChangeEvent(theme);
    }

    updateThemeIcon(iconType) {
        const iconPath = iconType === 'sun' ? './images/icon-sun.svg' : './images/icon-moon.svg';
        const altText = iconType === 'sun' ? 'Sun icon - Switch to light mode' : 'Moon icon - Switch to dark mode';

        this.themeIcon.src = iconPath;
        this.themeIcon.alt = altText;
    }

    animateToggle() {
        this.themeToggleBtn.style.transform = 'scale(0.95)';

        setTimeout(() => {
            this.themeToggleBtn.style.transform = 'scale(1)';
        }, 100);
    }

    saveTheme(theme) {
        try {
            localStorage.setItem('todo-theme-preference', theme);
        } catch (error) {
            console.warn('Could not save theme preference to localStorage:', error);
        }
    }

    loadSavedTheme() {
        try {
            const savedTheme = localStorage.getItem('todo-theme-preference');

            if (savedTheme && (savedTheme === 'light' || savedTheme === 'dark')) {
                this.currentTheme = savedTheme;
            } else {
                this.currentTheme = this.getSystemThemePreference();
            }
        } catch (error) {
            console.warn('Could not load theme preference from localStorage:', error);
            this.currentTheme = this.getSystemThemePreference();
        }
    }

    getSystemThemePreference() {
        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
            return 'dark';
        }
        return 'light';
    }

    dispatchThemeChangeEvent(theme) {
        const event = new CustomEvent('themeChanged', {
            detail: { theme: theme },
            bubbles: true
        });
        document.dispatchEvent(event);
    }

    getCurrentTheme() {
        return this.currentTheme;
    }

    setTheme(theme) {
        if (theme === 'light' || theme === 'dark') {
            this.currentTheme = theme;
            this.applyTheme(theme);
            this.saveTheme(theme);
        } else {
            console.error('Invalid theme. Use "light" or "dark".');
        }
    }
}

window.themeManager = new ThemeManager();

if (typeof module !== 'undefined' && module.exports) {
    module.exports = ThemeManager;
}

window.TodoThemeUtils = {
    getCurrentTheme: () => window.themeManager?.getCurrentTheme() || 'dark',

    setTheme: (theme) => window.themeManager?.setTheme(theme),

    isDarkTheme: () => window.themeManager?.getCurrentTheme() === 'dark',

    isLightTheme: () => window.themeManager?.getCurrentTheme() === 'light',

    onThemeChange: (callback) => {
        document.addEventListener('themeChanged', (e) => {
            callback(e.detail.theme);
        });
    }
};

if (typeof console !== 'undefined' && console.log) {
    console.log('Todo Theme Manager initialized');
    console.log('Use TodoThemeUtils for programmatic theme control');
}
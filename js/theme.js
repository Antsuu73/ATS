// Theme management logic
const themeToggleBtnId = "themeToggleBtn";
const darkThemeClass = "dark-theme";
const themeStorageKey = "ats_theme";

// Determine default theme
const defaultTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
let currentTheme = localStorage.getItem(themeStorageKey) || defaultTheme;

// Apply theme on load
if (currentTheme === "dark") {
    document.body.classList.add(darkThemeClass);
}

// Function to initialize toggle button
export function initThemeToggle() {
    const toggleBtn = document.getElementById(themeToggleBtnId);
    if (!toggleBtn) return;
    
    // Set initial icon
    updateToggleIcon(toggleBtn, currentTheme);

    toggleBtn.addEventListener("click", () => {
        document.body.classList.toggle(darkThemeClass);
        const isDark = document.body.classList.contains(darkThemeClass);
        currentTheme = isDark ? "dark" : "light";
        localStorage.setItem(themeStorageKey, currentTheme);
        updateToggleIcon(toggleBtn, currentTheme);
    });
}

function updateToggleIcon(btn, theme) {
    if (theme === "dark") {
        btn.textContent = "🌙";
        btn.setAttribute("aria-label", "Switch to light mode");
    } else {
        btn.textContent = "☀️";
        btn.setAttribute("aria-label", "Switch to dark mode");
    }
}

// Ensure init runs when DOM is loaded, if it wasn't a module
document.addEventListener("DOMContentLoaded", () => {
    initThemeToggle();
});

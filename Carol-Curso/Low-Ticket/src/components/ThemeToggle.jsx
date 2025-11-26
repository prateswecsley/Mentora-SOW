import { useTheme } from '../context/ThemeContext';
import './ThemeToggle.css';

function ThemeToggle() {
    const { isDarkMode, toggleDarkMode } = useTheme();

    return (
        <button
            className="theme-toggle"
            onClick={toggleDarkMode}
            aria-label="Toggle dark mode"
        >
            {isDarkMode ? '☀️' : '🌙'}
        </button>
    );
}

export default ThemeToggle;

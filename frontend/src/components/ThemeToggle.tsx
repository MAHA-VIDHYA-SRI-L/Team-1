import React from 'react';
import { Sun, Moon, Monitor } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

interface ThemeToggleProps {
  className?: string;
  showLabel?: boolean;
  variant?: 'pill' | 'button' | 'dropdown';
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({ 
  className = '', 
  showLabel = false,
  variant = 'pill' 
}) => {
  const { theme, setTheme, toggleTheme, isDark } = useTheme();

  if (variant === 'button') {
    return (
      <button
        onClick={toggleTheme}
        title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
        className={`relative inline-flex items-center justify-center p-2 rounded-xl transition-all duration-200 border border-slate-200/80 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 shadow-2xs hover:scale-105 active:scale-95 ${className}`}
      >
        <span className="sr-only">Toggle theme</span>
        {isDark ? (
          <Sun className="h-4 w-4 text-amber-400 animate-fadeIn" />
        ) : (
          <Moon className="h-4 w-4 text-slate-700 animate-fadeIn" />
        )}
        {showLabel && (
          <span className="ml-2 text-xs font-bold">
            {isDark ? 'Light' : 'Dark'}
          </span>
        )}
      </button>
    );
  }

  return (
    <div className={`inline-flex items-center p-1 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 shadow-2xs ${className}`}>
      <button
        type="button"
        onClick={() => setTheme('light')}
        title="Light Mode"
        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold transition-all duration-200 ${
          theme === 'light'
            ? 'bg-white dark:bg-slate-700 text-[#002D62] dark:text-amber-400 shadow-xs'
            : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
        }`}
      >
        <Sun className={`h-3.5 w-3.5 ${theme === 'light' ? 'text-amber-500 animate-spin-slow' : ''}`} />
        {showLabel && <span>Light</span>}
      </button>

      <button
        type="button"
        onClick={() => setTheme('dark')}
        title="Dark Mode"
        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold transition-all duration-200 ${
          theme === 'dark'
            ? 'bg-[#002D62] text-white shadow-xs'
            : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
        }`}
      >
        <Moon className={`h-3.5 w-3.5 ${theme === 'dark' ? 'text-blue-300' : ''}`} />
        {showLabel && <span>Dark</span>}
      </button>

      <button
        type="button"
        onClick={() => setTheme('system')}
        title="System Auto"
        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold transition-all duration-200 ${
          theme === 'system'
            ? 'bg-white dark:bg-slate-700 text-slate-800 dark:text-white shadow-xs'
            : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
        }`}
      >
        <Monitor className="h-3.5 w-3.5" />
        {showLabel && <span>Auto</span>}
      </button>
    </div>
  );
};

export default ThemeToggle;


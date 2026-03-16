/**
 * Theme context and provider.
 *
 * Manages a dark/light colour scheme toggle and persists the preference in
 * `localStorage`.  The site defaults to dark mode.
 *
 * @module contexts/ThemeContext
 */

import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

/**
 * Hook to access the current theme and toggle function.
 *
 * @returns {{ theme: string, toggleTheme: Function, isDark: boolean }}
 */
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used within ThemeProvider');
  return context;
};

/**
 * Provider component that applies the selected theme class to the document
 * root element and persists the choice.
 *
 * @param {{ children: React.ReactNode }} props
 */
export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(() => {
    // Site is always dark — ignore saved preference and system preference
    return 'dark';
  });

  useEffect(() => {
    localStorage.setItem('cvearity-theme', theme);
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
    } else {
      document.documentElement.classList.add('light');
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const toggleTheme = () => setTheme(prev => prev === 'dark' ? 'light' : 'dark');

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, isDark: theme === 'dark' }}>
      {children}
    </ThemeContext.Provider>
  );
};

import React, { createContext, useContext, useEffect, useState } from 'react';

const ThemeContext = createContext();

export const useTheme = () => useContext(ThemeContext);

export const ThemeProvider = ({ children }) => {
    const [theme, setTheme] = useState(() => {
        // Only run on client
        if (typeof window !== 'undefined') {
            const storedTheme = localStorage.getItem('finbridge-theme');
            if (storedTheme) {
                return storedTheme;
            }
            // If no preference, check system preference
            if (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) {
                return 'light';
            }
        }
        return 'dark'; // Default
    });

    useEffect(() => {
        // Apply theme to HTML tag
        document.documentElement.setAttribute('data-theme', theme);
        // Persist
        localStorage.setItem('finbridge-theme', theme);
    }, [theme]);

    const toggleTheme = () => {
        setTheme(prev => prev === 'dark' ? 'light' : 'dark');
    };

    return (
        <ThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>
            {children}
        </ThemeContext.Provider>
    );
};

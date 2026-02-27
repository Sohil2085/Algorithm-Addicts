import React from 'react';
import { motion } from 'framer-motion';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const ThemeToggle = () => {
    const { theme, toggleTheme } = useTheme();
    const isDark = theme === 'dark';

    return (
        <button
            onClick={toggleTheme}
            className="group relative flex items-center p-1 w-[60px] h-[32px] rounded-full border shadow-inner overflow-hidden transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            style={{
                backgroundColor: isDark ? 'rgba(15, 23, 42, 0.7)' : 'rgba(241, 245, 249, 1)',
                borderColor: isDark ? 'rgba(59, 130, 246, 0.3)' : 'rgba(148, 163, 184, 0.3)'
            }}
            aria-label={isDark ? "Switch to Light theme" : "Switch to Dark theme"}
            title={isDark ? "Switch to Light" : "Switch to Dark"}
        >
            {/* Shining sweep on hover */}
            <div className="absolute inset-0 -translate-x-full group-hover:translate-x-[100%] bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-[1.5s] ease-in-out pointer-events-none z-0"></div>

            {/* Glowing inner shadow on dark mode */}
            {isDark && (
                <div className="absolute inset-0 shadow-[inset_0_0_12px_rgba(59,130,246,0.15)] rounded-full pointer-events-none"></div>
            )}

            {/* Toggle Knob */}
            <motion.div
                className="relative z-10 w-6 h-6 rounded-full shadow-md flex items-center justify-center pointer-events-none"
                style={{
                    backgroundColor: isDark ? '#1E293B' : '#FFFFFF',
                    border: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.05)'
                }}
                initial={false}
                animate={{
                    x: isDark ? 0 : 28,
                    rotate: isDark ? 0 : 360,
                }}
                transition={{
                    type: "spring",
                    stiffness: 500,
                    damping: 30,
                }}
            >
                {isDark ? (
                    <Moon size={13} className="text-blue-400" />
                ) : (
                    <Sun size={13} className="text-amber-500" />
                )}
            </motion.div>
        </button>
    );
};

export default ThemeToggle;

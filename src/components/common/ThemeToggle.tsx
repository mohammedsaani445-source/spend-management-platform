"use client";

import { useTheme } from "@/context/ThemeContext";
import { useEffect, useState } from "react";

export default function ThemeToggle() {
    const { theme, toggleTheme } = useTheme();
    const [mounted, setMounted] = useState(false);

    // Prevent hydration mismatch
    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return <div style={{ width: '40px', height: '40px' }} />;

    return (
        <button
            onClick={toggleTheme}
            aria-label="Toggle Theme"
            style={{
                background: 'var(--glass-bg)',
                backdropFilter: 'blur(8px)',
                border: '1px solid var(--glass-border)',
                borderRadius: '50%',
                width: '42px',
                height: '42px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.25rem',
                cursor: 'pointer',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                boxShadow: 'var(--shadow-premium)',
                color: 'var(--text-main)',
                padding: 0
            }}
            onMouseOver={(e) => {
                e.currentTarget.style.transform = 'scale(1.1) rotate(10deg)';
                e.currentTarget.style.backgroundColor = 'var(--accent-soft)';
            }}
            onMouseOut={(e) => {
                e.currentTarget.style.transform = 'scale(1) rotate(0deg)';
                e.currentTarget.style.backgroundColor = 'var(--glass-bg)';
            }}
        >
            {theme === 'light' ? '🌙' : '☀️'}
        </button>
    );
}

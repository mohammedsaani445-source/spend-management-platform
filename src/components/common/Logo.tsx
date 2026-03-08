import React from 'react';

interface LogoProps {
    size?: number | string;
    className?: string;
    variant?: 'brand' | 'white' | 'dark';
}

/**
 * Apex Procure Official SVG Logo
 * A high-fidelity, best-in-class industry monogram.
 * Integrates the 'Apex' (A) and 'Process' (P) into a single geometric mark.
 */
export const Logo: React.FC<LogoProps> = ({
    size = 40,
    className = '',
    variant = 'brand'
}) => {
    const colors = {
        brand: { primary: "#E8572A", secondary: "#212B36" }, // Coral and Navy
        white: { primary: "#FFFFFF", secondary: "rgba(255,255,255,0.7)" },
        dark: { primary: "#0F172A", secondary: "#334155" }
    };

    const activeColors = colors[variant];

    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 100 100"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={className}
        >
            {/* Geometric Monogram: Apex Peak (A) + Process Loop (P) */}
            <g>
                {/* 1. The 'A' Peak Symbol (Navy) */}
                <path
                    d="M15 82L50 18L85 82"
                    stroke={activeColors.secondary}
                    strokeWidth="12"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />

                {/* 2. Negative Space Cutout (White) */}
                {/* Standard industry "lift" effect for layered symbols */}
                {variant === 'brand' && (
                    <circle
                        cx="70"
                        cy="55"
                        r="22"
                        stroke="#FFFFFF"
                        strokeWidth="16"
                    />
                )}

                {/* 3. The 'P' Process Loop (Coral) */}
                <circle
                    cx="70"
                    cy="55"
                    r="22"
                    stroke={activeColors.primary}
                    strokeWidth="12"
                />

                {/* 4. Connecting Stem - Aligns the mark's visual weight */}
                <path
                    d="M48 55V82"
                    stroke={activeColors.primary}
                    strokeWidth="12"
                    strokeLinecap="round"
                    style={{ opacity: variant === 'brand' ? 1 : 0 }}
                />

                {/* 5. Left Accent for 'A' definition */}
                <path
                    d="M38 58H25"
                    stroke={activeColors.secondary}
                    strokeWidth="10"
                    strokeLinecap="round"
                />
            </g>
        </svg>
    );
};

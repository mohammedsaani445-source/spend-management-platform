"use client";

import { useMemo, memo } from 'react';
import { formatCurrency } from '@/lib/currencies';

// Simple Bar Chart Component
export const SpendBarChart = memo(function SpendBarChart({ data, currency = 'USD' }: { data: { label: string, value: number, color?: string }[], currency?: string }) {
    const maxValue = data.length > 0 ? Math.max(...data.map(d => d.value), 0.01) : 1;

    return (
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: '1rem', height: '200px', paddingTop: '1rem' }}>
            {data.map((item, i) => (
                <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column-reverse', gap: '0.5rem', minWidth: '40px' }}>
                    <div
                        style={{
                            width: '100%',
                            height: `${(item.value / maxValue) * 100}%`,
                            backgroundColor: item.color || 'var(--accent)',
                            borderRadius: '4px 4px 0 0',
                            minHeight: '4px',
                            transition: 'height 0.5s ease-out',
                            position: 'relative',
                            boxShadow: `0 0 15px ${item.color || 'var(--accent)'}44`
                        }}
                        title={`${item.label}: ${formatCurrency(item.value, currency)}`}
                    >
                        {/* Tooltip on hover could go here */}
                    </div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', textAlign: 'center', height: '1rem', overflow: 'hidden' }}>
                        {item.label}
                    </div>
                </div>
            ))}
        </div>
    );
});

// Simple Donut Chart Component using SVG
export const BudgetDonutChart = memo(function BudgetDonutChart({ total, used }: { total: number, used: number }) {
    const radius = 40;
    const stroke = 8;
    const normalizedRadius = radius - stroke * 2;
    const circumference = normalizedRadius * 2 * Math.PI;
    const safeTotal = total || 1;
    const percent = Math.min((used / safeTotal) * 100, 100);
    const strokeDashoffset = circumference - (percent / 100) * circumference;

    // Determine color
    let color = 'var(--success)';
    if (percent > 80) color = '#eab308'; // Warning
    if (percent > 100) color = 'var(--error)';

    const percentage = Math.min((used / safeTotal) * 100, 100);

    return (
        <div style={{ position: 'relative', width: '120px', height: '120px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="100%" height="100%" viewBox="0 0 120 120">
                <circle
                    stroke="var(--glass-border)"
                    strokeWidth={stroke}
                    fill="transparent"
                    r={normalizedRadius}
                    cx="60"
                    cy="60"
                />
                <circle
                    stroke={color}
                    strokeWidth={stroke}
                    strokeDasharray={circumference + ' ' + circumference}
                    style={{
                        strokeDashoffset,
                        transition: 'stroke-dashoffset 0.5s ease-in-out',
                        filter: `drop-shadow(0 0 5px ${color}66)`
                    }}
                    strokeLinecap="round"
                    fill="transparent"
                    r={normalizedRadius}
                    cx="60"
                    cy="60"
                />
                <text
                    x="60" y="65"
                    textAnchor="middle"
                    style={{ fontSize: '18px', fontWeight: 800, fill: 'var(--text-main)' }}
                >
                    {Math.round(percentage)}%
                </text>
            </svg>
        </div>
    );
});

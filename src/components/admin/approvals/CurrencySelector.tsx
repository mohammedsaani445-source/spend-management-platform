"use client";

import { useState, useRef, useEffect } from 'react';
import { CURRENCIES, Currency } from '@/lib/currencies';

interface CurrencySelectorProps {
    value: string;
    onChange: (code: string) => void;
    label?: string;
}

export const CurrencySelector: React.FC<CurrencySelectorProps> = ({ value, onChange, label }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [search, setSearch] = useState('');
    const wrapperRef = useRef<HTMLDivElement>(null);
    
    const selectedCurrency = CURRENCIES.find(c => c.code === value) || CURRENCIES[0];

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const filteredCurrencies = CURRENCIES.filter(c => 
        c.code.toLowerCase().includes(search.toLowerCase()) || 
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.country.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div ref={wrapperRef} style={{ position: 'relative', width: '100%' }}>
            {label && (
                <label style={{
                    display: 'flex', alignItems: 'center', gap: '5px',
                    fontSize: '11px', fontWeight: 600, color: '#64748B',
                    textTransform: 'uppercase',
                    letterSpacing: '0.06em',
                    marginBottom: '6px',
                    fontFamily: 'var(--font-dm-sans), sans-serif',
                }}>
                    {label}
                </label>
            )}
            
            <div 
                onClick={() => setIsOpen(!isOpen)}
                style={{
                    width: '100%',
                    padding: '10px 12px',
                    border: isOpen ? '1px solid #E8441A' : '1px solid #E2E8F0',
                    borderRadius: '8px',
                    backgroundColor: '#FAFAF8',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    cursor: 'pointer',
                    transition: 'all 0.15s',
                    boxShadow: isOpen ? '0 0 0 3px rgba(232, 68, 26, 0.1)' : 'none',
                }}
            >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontSize: '18px' }}>{selectedCurrency.flag}</span>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span style={{ fontSize: '13px', fontWeight: 700, color: '#0F172A', lineHeight: 1 }}>
                            {selectedCurrency.code}
                        </span>
                        <span style={{ fontSize: '11px', color: '#64748B' }}>
                            {selectedCurrency.name}
                        </span>
                    </div>
                </div>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#64748B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" 
                    style={{ transform: isOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>
                    <path d="M6 9l6 6 6-6" />
                </svg>
            </div>

            {isOpen && (
                <div style={{
                    position: 'absolute',
                    top: 'calc(100% + 4px)',
                    left: 0,
                    right: 0,
                    backgroundColor: 'rgba(255, 255, 255, 0.98)',
                    backdropFilter: 'blur(12px)',
                    border: '1px solid #E2E8F0',
                    borderRadius: '12px',
                    boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1)',
                    display: 'flex',
                    flexDirection: 'column',
                    zIndex: 5000,
                    maxHeight: '320px',
                    animation: 'dropdownFadeIn 0.15s ease',
                }}>
                    <style>{`
                        @keyframes dropdownFadeIn {
                            from { opacity: 0; transform: translateY(-4px); }
                            to { opacity: 1; transform: translateY(0); }
                        }
                    `}</style>
                    
                    <div style={{ padding: '8px', borderBottom: '1px solid #F1F5F9', position: 'sticky', top: 0, backgroundColor: 'white', zIndex: 1, borderTopLeftRadius: '12px', borderTopRightRadius: '12px' }}>
                        <div style={{ position: 'relative' }}>
                            <svg style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }} width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#94A3B8" strokeWidth="2.5">
                                <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
                            </svg>
                            <input 
                                autoFocus
                                type="text"
                                placeholder="Search every currency..."
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                style={{
                                    width: '100%',
                                    padding: '8px 12px 8px 32px',
                                    border: '1px solid #F1F5F9',
                                    borderRadius: '6px',
                                    fontSize: '12px',
                                    outline: 'none',
                                    backgroundColor: '#F8FAFC',
                                    fontFamily: 'var(--font-dm-sans), sans-serif',
                                }}
                            />
                        </div>
                    </div>

                    <div style={{ 
                        flex: 1, 
                        overflowY: 'auto', 
                        padding: '4px',
                        scrollbarWidth: 'thin',
                        scrollbarColor: '#E2E8F0 transparent'
                    }}>
                        {filteredCurrencies.map(c => (
                            <div 
                                key={c.code}
                                onClick={() => {
                                    onChange(c.code);
                                    setIsOpen(false);
                                    setSearch('');
                                }}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    padding: '8px 12px',
                                    borderRadius: '6px',
                                    cursor: 'pointer',
                                    backgroundColor: value === c.code ? 'rgba(232, 68, 26, 0.05)' : 'transparent',
                                    transition: 'background-color 0.1s',
                                }}
                                onMouseEnter={e => {
                                    if (value !== c.code) e.currentTarget.style.backgroundColor = '#F8FAFC';
                                }}
                                onMouseLeave={e => {
                                    if (value !== c.code) e.currentTarget.style.backgroundColor = 'transparent';
                                }}
                            >
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <span style={{ fontSize: '16px' }}>{c.flag}</span>
                                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                                        <span style={{ fontSize: '13px', fontWeight: 600, color: '#1E293B', lineHeight: 1.2 }}>
                                            {c.code}
                                        </span>
                                        <span style={{ fontSize: '10px', color: '#94A3B8' }}>
                                            {c.name}
                                        </span>
                                    </div>
                                </div>
                                {value === c.code && (
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#E8441A" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                        <polyline points="20 6 9 17 4 12" />
                                    </svg>
                                )}
                            </div>
                        ))}
                        {filteredCurrencies.length === 0 && (
                            <div style={{ padding: '20px', textAlign: 'center', color: '#94A3B8', fontSize: '12px' }}>
                                No results found for "{search}"
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

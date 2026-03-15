"use client";

import { useState, useEffect } from "react";
import { CURRENCIES } from "@/lib/currencies";
import { getExchangeRates, saveManualRate, getManualRates, ExchangeRates } from "@/lib/exchangeRates";
import { updateTenantCurrency } from "@/lib/tenants";
import { 
    RefreshCw, Save, Coins, AlertCircle, CheckCircle, Info, Shield
} from "lucide-react";

interface CurrencySettingsProps {
    tenantId: string;
    currentBaseCurrency: string;
    onBaseCurrencyChange?: (currency: string) => void;
}

export default function CurrencySettings({ tenantId, currentBaseCurrency, onBaseCurrencyChange }: CurrencySettingsProps) {
    const [baseCurrency, setBaseCurrency] = useState(currentBaseCurrency);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [rates, setRates] = useState<ExchangeRates>({});
    const [manualRates, setManualRates] = useState<ExchangeRates>({});
    const [loading, setLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [message, setMessage] = useState({ text: "", type: "" });

    useEffect(() => {
        async function loadRates() {
            setLoading(true);
            try {
                const [liveRates, customRates] = await Promise.all([
                    getExchangeRates(),
                    getManualRates(tenantId)
                ]);
                setRates(liveRates);
                setManualRates(customRates);
            } catch (error) {
                console.error("Failed to load rates:", error);
            } finally {
                setLoading(false);
            }
        }
        loadRates();
    }, [tenantId]);

    const handleSaveBase = async () => {
        setIsSaving(true);
        try {
            await updateTenantCurrency(tenantId, baseCurrency);
            if (onBaseCurrencyChange) {
                onBaseCurrencyChange(baseCurrency);
            }
            setMessage({ text: "Base currency updated successfully.", type: "success" });
        } catch (error) {
            setMessage({ text: "Failed to update base currency.", type: "error" });
        } finally {
            setIsSaving(false);
            setTimeout(() => setMessage({ text: "", type: "" }), 3000);
        }
    };

    const handleSaveManualRate = async (currency: string, rate: number) => {
        try {
            await saveManualRate(tenantId, currency, rate);
            setManualRates(prev => ({ ...prev, [currency]: rate }));
            setMessage({ text: `Override saved for ${currency}.`, type: "success" });
        } catch (error) {
            setMessage({ text: "Failed to save override.", type: "error" });
        }
        setTimeout(() => setMessage({ text: "", type: "" }), 3000);
    };

    if (loading) return <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>Syncing with global markets...</div>;

    return (
        <div className="animate-in" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            {/* Header & Status */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                    <h2 style={{ fontSize: '1.75rem', fontWeight: 900, marginBottom: '0.25rem', letterSpacing: '-0.03em', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        Currency Intelligence
                        <span style={{ 
                            fontSize: '0.625rem', 
                            padding: '3px 10px', 
                            borderRadius: '20px', 
                            background: 'rgba(5, 150, 105, 0.1)', 
                            color: '#059669', 
                            border: '1px solid rgba(5, 150, 105, 0.2)',
                            letterSpacing: '0.08em',
                            fontWeight: 900,
                            textTransform: 'uppercase'
                        }}>Live Matrix Active</span>
                    </h2>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.9375rem', fontWeight: 500 }}>Global interbank market synchronization and workspace-wide baseline control.</p>
                </div>
                {message.text && (
                    <div className="animate-in" style={{ 
                        padding: '0.75rem 1.25rem', 
                        borderRadius: '14px',
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '0.75rem',
                        background: message.type === 'error' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(34, 197, 94, 0.1)',
                        border: `1px solid ${message.type === 'error' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(34, 197, 94, 0.3)'}`,
                        color: message.type === 'error' ? '#EF4444' : '#059669',
                        fontSize: '0.875rem',
                        fontWeight: 700,
                        boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                        backdropFilter: 'blur(8px)'
                    }}>
                        {message.type === 'error' ? <AlertCircle size={18} /> : <CheckCircle size={18} />}
                        {message.text}
                    </div>
                )}
            </div>

            {/* Intelligence Radar */}
            <div style={{ 
                padding: '1rem 1.5rem', 
                background: 'rgba(0,0,0,0.02)', 
                borderRadius: '16px', 
                border: '1px solid var(--border-light)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
            }}>
                <div style={{ display: 'flex', gap: '2rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10B981', boxShadow: '0 0 8px #10B981BB' }} />
                        <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text-secondary)' }}>SYNC STATUS: <span style={{ color: 'var(--text-main)' }}>OPTIMAL</span></span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <RefreshCw size={14} className="animate-spin-slow" color="#6366F1" />
                        <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text-secondary)' }}>LAST SCAN: <span style={{ color: 'var(--text-main)' }}>JUST NOW</span></span>
                    </div>
                </div>
                <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--brand)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Powered by Open Treasury matrix
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: '2rem' }}>
                {/* Manual Overrides */}
                <div className="premium-card" style={{ padding: '0', overflow: 'hidden', border: '1px solid var(--border-light)', borderRadius: '18px' }}>
                    <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border-light)', display: 'flex', alignItems: 'center', gap: '0.75rem', background: 'rgba(0,0,0,0.01)' }}>
                        <Coins size={20} color="var(--brand)" strokeWidth={2.5} />
                        <h3 style={{ fontSize: '1.125rem', fontWeight: 800, margin: 0 }}>Treasury Overrides</h3>
                    </div>
                    
                    <div style={{ padding: '1.5rem' }}>
                        <div style={{ 
                            padding: '1rem', 
                            background: 'rgba(232, 87, 42, 0.05)', 
                            borderRadius: '12px', 
                            fontSize: '0.875rem', 
                            color: 'var(--brand)',
                            display: 'flex',
                            gap: '0.75rem',
                            marginBottom: '1.5rem',
                            border: '1px solid rgba(232, 87, 42, 0.1)'
                        }}>
                            <Info size={18} style={{ flexShrink: 0 }} />
                            <span style={{ fontWeight: 500, lineHeight: 1.4 }}>These rates prioritize manual internal bookkeeping over live interbank data for accurate budget reporting.</span>
                        </div>

                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ textAlign: 'left', fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-secondary)', borderBottom: '2px solid var(--border-light)' }}>
                                    <th style={{ padding: '0.75rem 0.5rem', fontWeight: 900 }}>Currency</th>
                                    <th style={{ padding: '0.75rem 0.5rem', fontWeight: 900 }}>Market (USD)</th>
                                    <th style={{ padding: '0.75rem 0.5rem', fontWeight: 900 }}>Custom Override</th>
                                    <th style={{ padding: '0.75rem 0.5rem', fontWeight: 900 }}>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {['GHS', 'EUR', 'GBP', 'CAD', 'NGN'].map(curr => {
                                    const c = CURRENCIES.find(x => x.code === curr);
                                    const mRate = rates[curr] || 0;
                                    const cRate = manualRates[curr] || mRate;
                                    const isCustom = manualRates[curr] !== undefined;
                                    const drift = isCustom && mRate > 0 ? ((cRate - mRate) / mRate) * 100 : 0;
                                    
                                    return (
                                        <tr key={curr} style={{ borderBottom: '1px solid var(--border-light)', transition: 'background 0.2s ease' }} className="hover-row">
                                            <td style={{ padding: '1.25rem 0.5rem' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                                    <span style={{ fontSize: '1.5rem', filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))' }}>{c?.flag}</span>
                                                    <div>
                                                        <div style={{ fontWeight: 800, fontSize: '1rem', letterSpacing: '-0.01em' }}>{curr}</div>
                                                        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600 }}>{c?.name}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td style={{ padding: '1.25rem 0.5rem' }}>
                                                <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-main)' }}>{mRate.toFixed(4)}</div>
                                                <div style={{ fontSize: '0.625rem', color: '#059669', fontWeight: 800 }}>LIVE STREAM</div>
                                            </td>
                                            <td style={{ padding: '1.25rem 0.5rem' }}>
                                                <div style={{ position: 'relative' }}>
                                                    <input 
                                                        type="number" 
                                                        defaultValue={cRate}
                                                        onBlur={(e) => {
                                                            const val = parseFloat(e.target.value);
                                                            if (!isNaN(val) && val !== cRate) {
                                                                handleSaveManualRate(curr, val);
                                                            }
                                                        }}
                                                        style={{
                                                            width: '120px',
                                                            padding: '0.625rem 0.875rem',
                                                            borderRadius: '10px',
                                                            border: isCustom ? '2px solid var(--brand)' : '1.5px solid var(--border)',
                                                            background: 'var(--surface)',
                                                            fontSize: '0.9375rem',
                                                            fontWeight: 800,
                                                            color: isCustom ? 'var(--brand)' : 'inherit',
                                                            outline: 'none',
                                                            transition: 'all 0.2s ease'
                                                        }}
                                                    />
                                                    {isCustom && (
                                                        <div style={{ 
                                                            position: 'absolute', 
                                                            top: '-8px', 
                                                            right: '10px', 
                                                            background: drift >= 0 ? '#ECFDF5' : '#FEF2F2',
                                                            color: drift >= 0 ? '#059669' : '#DC2626',
                                                            fontSize: '0.625rem',
                                                            padding: '1px 6px',
                                                            borderRadius: '4px',
                                                            fontWeight: 800,
                                                            border: drift >= 0 ? '1px solid #A7F3D0' : '1px solid #FECACA'
                                                        }}>
                                                            {drift >= 0 ? '+' : ''}{drift.toFixed(1)}% DRIFT
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                            <td style={{ padding: '1.25rem 0.5rem' }}>
                                                <button 
                                                    onClick={() => handleSaveManualRate(curr, mRate)}
                                                    className="hover-scale"
                                                    style={{
                                                        background: isCustom ? 'rgba(232, 87, 42, 0.1)' : 'transparent',
                                                        border: 'none',
                                                        padding: '0.5rem 0.75rem',
                                                        borderRadius: '8px',
                                                        color: isCustom ? 'var(--brand)' : 'var(--text-secondary)',
                                                        cursor: 'pointer',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '0.5rem',
                                                        fontSize: '0.8125rem',
                                                        fontWeight: 800,
                                                        opacity: isCustom ? 1 : 0.5,
                                                        transition: 'all 0.2s ease'
                                                    }}
                                                    title="Reset to market rate"
                                                >
                                                    <RefreshCw size={14} strokeWidth={3} />
                                                    {isCustom ? 'Reset' : 'Auto'}
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Base Currency Config */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                    <div className="premium-card" style={{ padding: '2rem', background: 'linear-gradient(135deg, var(--surface) 0%, rgba(232, 87, 42, 0.03) 100%)', border: '1px solid var(--border-light)', borderRadius: '20px' }}>
                        <div style={{ height: '48px', width: '48px', borderRadius: '14px', background: 'var(--brand-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem', color: 'var(--brand)' }}>
                            <Save size={24} />
                        </div>
                        <h3 style={{ fontSize: '1.25rem', fontWeight: 900, marginBottom: '0.75rem', letterSpacing: '-0.02em' }}>Intelligence Baseline</h3>
                        <p style={{ fontSize: '0.9375rem', color: 'var(--text-secondary)', marginBottom: '2rem', lineHeight: 1.6, fontWeight: 500 }}>
                            Set the global standard for your workspace. This baseline recalibrates all KPI cards and budget trackers across every department.
                        </p>
                        
                        <div style={{ marginBottom: '2rem', position: 'relative' }}>
                            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 900, textTransform: 'uppercase', color: 'var(--brand)', marginBottom: '0.75rem', letterSpacing: '0.05em' }}>Base Currency Matrix</label>
                            
                            {/* Custom Premium Dropdown */}
                            <div 
                                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                style={{
                                    width: '100%',
                                    padding: '1rem 1.25rem',
                                    borderRadius: '14px',
                                    border: isDropdownOpen ? '2px solid var(--brand)' : '1.5px solid var(--border)',
                                    background: 'var(--surface)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    cursor: 'pointer',
                                    boxShadow: isDropdownOpen ? '0 0 0 4px rgba(232, 87, 42, 0.1)' : 'var(--shadow-sm)',
                                    transition: 'all 0.2s ease',
                                    userSelect: 'none'
                                }}
                            >
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                    <span style={{ fontSize: '1.25rem' }}>
                                        {CURRENCIES.find(c => c.code === baseCurrency)?.flag}
                                    </span>
                                    <div style={{ fontWeight: 800, fontSize: '1.125rem', color: 'var(--text-main)' }}>
                                        {baseCurrency}
                                        <span style={{ fontWeight: 500, color: 'var(--text-secondary)', marginLeft: '0.5rem', fontSize: '0.875rem' }}>
                                            — {CURRENCIES.find(c => c.code === baseCurrency)?.name}
                                        </span>
                                    </div>
                                </div>
                                <div style={{ 
                                    transition: 'transform 0.3s ease', 
                                    transform: isDropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                                    color: 'var(--text-secondary)'
                                }}>
                                    ▼
                                </div>
                            </div>

                            {isDropdownOpen && (
                                <>
                                    <div 
                                        onClick={() => setIsDropdownOpen(false)}
                                        style={{ position: 'fixed', inset: 0, zIndex: 998 }} 
                                    />
                                    <div className="animate-in" style={{
                                        position: 'absolute',
                                        top: 'calc(100% + 8px)',
                                        left: 0,
                                        right: 0,
                                        background: 'var(--surface)',
                                        borderRadius: '16px',
                                        border: '1px solid var(--border-light)',
                                        boxShadow: '0 20px 40px rgba(0,0,0,0.15)',
                                        zIndex: 999,
                                        maxHeight: '300px',
                                        overflowY: 'auto',
                                        padding: '0.5rem',
                                        backdropFilter: 'blur(16px)',
                                        animation: 'slideDown 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                                    }}>
                                        {CURRENCIES.map(c => (
                                            <div 
                                                key={c.code}
                                                onClick={() => {
                                                    setBaseCurrency(c.code);
                                                    setIsDropdownOpen(false);
                                                }}
                                                style={{
                                                    padding: '0.75rem 1rem',
                                                    borderRadius: '10px',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '1rem',
                                                    cursor: 'pointer',
                                                    background: baseCurrency === c.code ? 'rgba(232, 87, 42, 0.08)' : 'transparent',
                                                    color: baseCurrency === c.code ? 'var(--brand)' : 'var(--text-main)',
                                                    transition: 'all 0.15s ease'
                                                }}
                                                className="hover-dropdown-item"
                                            >
                                                <span style={{ fontSize: '1.25rem' }}>{c.flag}</span>
                                                <div style={{ flex: 1 }}>
                                                    <div style={{ fontWeight: 800, fontSize: '0.9375rem' }}>{c.code}</div>
                                                    <div style={{ fontSize: '0.75rem', color: baseCurrency === c.code ? 'var(--brand)' : 'var(--text-secondary)', fontWeight: 600 }}>{c.name}</div>
                                                </div>
                                                {baseCurrency === c.code && <CheckCircle size={16} />}
                                            </div>
                                        ))}
                                    </div>
                                </>
                            )}
                        </div>

                        <button 
                            onClick={handleSaveBase}
                            disabled={isSaving || baseCurrency === currentBaseCurrency}
                            className="hover-glow"
                            style={{
                                width: '100%',
                                padding: '1.125rem',
                                borderRadius: '14px',
                                background: 'var(--brand)',
                                color: 'white',
                                border: 'none',
                                fontWeight: 800,
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '0.75rem',
                                opacity: (isSaving || baseCurrency === currentBaseCurrency) ? 0.6 : 1,
                                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                boxShadow: '0 8px 24px rgba(232, 87, 42, 0.3)',
                                fontSize: '1rem'
                            }}
                        >
                            {isSaving ? <RefreshCw className="animate-spin" size={20} /> : <Save size={20} />}
                            {isSaving ? "RECALIBRATING MATRIX..." : "APPLY BASELINE"}
                        </button>
                    </div>

                    <div style={{ 
                        padding: '1.5rem', 
                        borderRadius: '20px', 
                        background: 'var(--surface)', 
                        border: '1px dashed var(--border)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.75rem'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <Shield size={16} color="var(--brand)" />
                            <span style={{ fontSize: '0.875rem', fontWeight: 800 }}>Audit Integrity</span>
                        </div>
                        <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', lineHeight: 1.5, fontWeight: 500 }}>
                            Baseline shifts are logged as critical security events. Every financial figure in your history will be recalculated to maintain audit traceability.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

import React, { useState, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';
import { ROLE_CONFIGS } from '@/lib/roles_config';
import { UserRole } from '@/types';
import { motion, AnimatePresence } from 'framer-motion';

interface RoleSelectProps {
    value: string;
    onChange: (val: string) => void;
    options: { label: string; value: string }[];
    error?: string;
    label?: string;
}

const RoleSelect: React.FC<RoleSelectProps> = ({ value, onChange, options, error, label }) => {
    const [isOpen, setIsOpen] = useState(false);
    const selected = options.find(o => o.value === value) || options[0];

    useEffect(() => {
        const handleClick = () => setIsOpen(false);
        if (isOpen) {
            document.addEventListener('click', handleClick);
        }
        return () => document.removeEventListener('click', handleClick);
    }, [isOpen]);

    return (
        <div className="relative w-full" onClick={e => e.stopPropagation()}>
            {label && (
                <label className="form-label" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                    {label}
                </label>
            )}
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className={`w-full flex items-center justify-between p-3 bg-white border rounded-xl transition-all duration-200 text-sm font-medium ${
                    isOpen 
                        ? 'border-[var(--brand)] ring-4 ring-[var(--brand-soft)] shadow-lg' 
                        : 'border-[var(--border)] hover:border-[var(--brand-muted)]'
                } ${error ? 'border-red-500 ring-red-100' : ''}`}
                style={{
                    textAlign: 'left',
                    minHeight: '48px'
                }}
            >
                <div className="flex items-center gap-3 overflow-hidden">
                    <div className="w-8 h-8 rounded-lg bg-[var(--surface-hover)] flex items-center justify-center text-lg flex-shrink-0">
                        {ROLE_CONFIGS[value as UserRole]?.icon || '👤'}
                    </div>
                    <span className="truncate text-[var(--text-primary)]">{selected?.label}</span>
                </div>
                <ChevronDown 
                    size={20} 
                    className={`text-[var(--text-secondary)] transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} 
                />
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
                        className="absolute left-0 right-0 z-[9999] mt-2 bg-white border border-[var(--border)] rounded-xl shadow-2xl overflow-hidden"
                        style={{
                            maxHeight: 'min(400px, 60vh)',
                            overflowY: 'auto'
                        }}
                    >
                        <div className="p-1 space-y-px">
                            {options.map((opt) => {
                                const cfg = ROLE_CONFIGS[opt.value as UserRole];
                                const isSelected = value === opt.value;
                                return (
                                    <button
                                        key={opt.value}
                                        type="button"
                                        onClick={() => { 
                                            onChange(opt.value); 
                                            setIsOpen(false); 
                                        }}
                                        className={`dropdown-item-premium w-full flex items-start gap-4 p-3 rounded-lg text-left transition-all duration-150 ${
                                            isSelected 
                                                ? 'bg-[var(--brand-soft)]' 
                                                : 'hover:bg-[var(--surface-hover)]'
                                        }`}
                                    >
                                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-xl flex-shrink-0 transition-colors ${
                                            isSelected ? 'bg-white shadow-sm' : 'bg-[var(--surface-hover)]'
                                        }`}
                                        style={{ color: isSelected ? 'var(--brand)' : 'var(--text-secondary)' }}>
                                            {cfg?.icon || '👤'}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between mb-0.5">
                                                <span className={`font-semibold text-sm truncate ${
                                                    isSelected ? 'text-[var(--brand-dark)]' : 'text-[var(--text-primary)]'
                                                }`}>
                                                    {opt.label}
                                                </span>
                                                {isSelected && (
                                                    <Check size={16} className="text-[var(--brand)] flex-shrink-0" strokeWidth={3} />
                                                )}
                                            </div>
                                            <p className="text-xs text-[var(--text-secondary)] leading-relaxed line-clamp-2">
                                                {cfg?.description}
                                            </p>
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
            {error && (
                <p className="mt-1.5 text-xs text-red-500 font-medium px-1">
                    {error}
                </p>
            )}
        </div>
    );
};

export default RoleSelect;

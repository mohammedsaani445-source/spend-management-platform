"use client";

import { useState, useRef, useEffect } from "react";

interface Option {
    label: string;
    value: string;
    icon?: string;
}

interface CustomSelectProps {
    options: Option[];
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    creatable?: boolean;
    onAddOption?: (newValue: string) => void;
    label?: string;
}

export default function CustomSelect({
    options,
    value,
    onChange,
    placeholder = "Select...",
    creatable = false,
    onAddOption,
    label
}: CustomSelectProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [isCreating, setIsCreating] = useState(false);
    const [newOptionValue, setNewOptionValue] = useState("");
    const wrapperRef = useRef<HTMLDivElement>(null);

    const selectedOption = options.find(o => o.value === value);

    // Close on click outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setIsOpen(false);
                setIsCreating(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleSelect = (val: string) => {
        onChange(val);
        setIsOpen(false);
        setSearchTerm("");
    };

    const handleCreate = () => {
        if (newOptionValue.trim() && onAddOption) {
            onAddOption(newOptionValue.trim());
            onChange(newOptionValue.trim()); // Auto select
            setNewOptionValue("");
            setIsCreating(false);
            setIsOpen(false);
        }
    };

    const filteredOptions = options.filter(opt =>
        opt.label.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="custom-select-wrapper" ref={wrapperRef} style={{ position: 'relative', marginBottom: '1rem' }}>
            {label && (
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-secondary)' }}>
                    {label}
                </label>
            )}

            {/* Trigger Button */}
            <div
                onClick={() => setIsOpen(!isOpen)}
                style={{
                    padding: '0.75rem 1rem',
                    background: 'var(--surface)',
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--radius-md)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    minHeight: '42px',
                    boxShadow: isOpen ? '0 0 0 2px rgba(4, 156, 99, 0.2)' : 'none',
                    transition: 'all 0.2s',
                    color: selectedOption ? 'var(--text-main)' : 'var(--text-secondary)'
                }}
            >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    {selectedOption?.icon && <span>{selectedOption.icon}</span>}
                    {selectedOption ? selectedOption.label : placeholder}
                </div>
                <span style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}>▼</span>
            </div>

            {/* Dropdown Menu */}
            {isOpen && (
                <div style={{
                    position: 'absolute',
                    top: '100%',
                    left: 0,
                    right: 0,
                    marginTop: '0.5rem',
                    background: 'var(--surface)', // Fallback
                    backdropFilter: 'blur(12px)',
                    backgroundColor: 'rgba(255, 255, 255, 0.95)', // Glass effect light
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--radius-md)',
                    boxShadow: 'var(--shadow-lg)',
                    zIndex: 100,
                    maxHeight: '300px',
                    overflowY: 'auto',
                    animation: 'fade-in-up 0.2s ease-out forwards'
                }}>
                    {/* Dark mode override via inline style logic is tricky, usually handled by class but we use standard vars */}
                    {/* We can rely on css modules or simpler global class usage for the dropdown specifically if needed, 
                        but relying on vars (surface) is safest. 
                        Let's refine the glass effect to be theme aware.
                    */}
                    <div style={{
                        background: 'var(--surface)',
                        opacity: 0.95
                    }}>
                        {/* Search / Filter (Optional, good for long lists) */}
                        {options.length > 5 && !isCreating && (
                            <div style={{ padding: '0.5rem' }}>
                                <input
                                    type="text"
                                    placeholder="Search..."
                                    value={searchTerm}
                                    onChange={e => setSearchTerm(e.target.value)}
                                    onClick={e => e.stopPropagation()}
                                    style={{
                                        width: '100%',
                                        padding: '0.5rem',
                                        border: '1px solid var(--border)',
                                        borderRadius: 'var(--radius-sm)',
                                        background: 'var(--background)',
                                        color: 'var(--text-main)'
                                    }}
                                />
                            </div>
                        )}

                        {/* Options List */}
                        {!isCreating ? (
                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                                {filteredOptions.map(opt => (
                                    <div
                                        key={opt.value}
                                        onClick={() => handleSelect(opt.value)}
                                        style={{
                                            padding: '0.75rem 1rem',
                                            cursor: 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '0.5rem',
                                            color: 'var(--text-main)',
                                            transition: 'background 0.1s',
                                            background: opt.value === value ? 'rgba(4, 156, 99, 0.1)' : 'transparent',
                                            borderLeft: opt.value === value ? '3px solid var(--accent)' : '3px solid transparent'
                                        }}
                                        onMouseEnter={e => e.currentTarget.style.background = 'rgba(4, 156, 99, 0.05)'}
                                        onMouseLeave={e => e.currentTarget.style.background = opt.value === value ? 'rgba(4, 156, 99, 0.1)' : 'transparent'}
                                    >
                                        {opt.icon && <span>{opt.icon}</span>}
                                        {opt.label}
                                    </div>
                                ))}

                                {filteredOptions.length === 0 && (
                                    <div style={{ padding: '1rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                                        No options found.
                                    </div>
                                )}

                                {/* Create Action */}
                                {creatable && (
                                    <div
                                        onClick={() => setIsCreating(true)}
                                        style={{
                                            padding: '0.75rem 1rem',
                                            borderTop: '1px solid var(--border)',
                                            color: 'var(--accent)',
                                            cursor: 'pointer',
                                            fontWeight: 500,
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '0.5rem'
                                        }}
                                        onMouseEnter={e => e.currentTarget.style.background = 'var(--background)'}
                                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                                    >
                                        <span>+</span> Add New...
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div style={{ padding: '1rem' }} onClick={e => e.stopPropagation()}>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>New Value Name</label>
                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                    <input
                                        autoFocus
                                        type="text"
                                        value={newOptionValue}
                                        onChange={e => setNewOptionValue(e.target.value)}
                                        onKeyDown={e => e.key === 'Enter' && handleCreate()}
                                        style={{
                                            flex: 1,
                                            padding: '0.5rem',
                                            border: '1px solid var(--border)',
                                            borderRadius: 'var(--radius-sm)',
                                            background: 'var(--background)',
                                            color: 'var(--text-main)'
                                        }}
                                    />
                                    <button
                                        onClick={handleCreate}
                                        className="btn btn-primary"
                                        style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}
                                    >
                                        Add
                                    </button>
                                    <button
                                        onClick={() => setIsCreating(false)}
                                        className="btn"
                                        style={{ padding: '0.5rem', color: 'var(--text-secondary)' }}
                                    >
                                        ✕
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

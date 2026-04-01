"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { Shield, ChevronRight, Eye, Table, LayoutGrid, Info } from 'lucide-react';
import { ROLE_CONFIGS } from '@/lib/roles_config';
import { UserRole } from '@/types';
import { RoleIcon } from './RoleIcon';

interface RoleGridProps {
    onViewPermissions: (role: UserRole) => void;
    onViewMatrix: () => void;
}

const RoleGrid: React.FC<RoleGridProps> = ({ onViewPermissions, onViewMatrix }) => {
    // Filter out legacy roles
    const activeRoles = (Object.entries(ROLE_CONFIGS) as [UserRole, any][]).filter(([id, cfg]) => !cfg.label.startsWith('Legacy:'));

    return (
        <div style={{ paddingBottom: "5rem", display: "flex", flexDirection: "column", gap: "2.5rem" }}>
            {/* ── Permission Matrix Banner ───────────────────────────────── */}
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                style={{ 
                    background: "var(--surface)", 
                    border: "1px solid var(--border)", 
                    borderRadius: "24px", 
                    padding: "2rem", 
                    display: "flex", 
                    alignItems: "center", 
                    justifyContent: "space-between", 
                    gap: "2rem",
                    boxShadow: "var(--shadow-sm)",
                    position: "relative",
                    overflow: "hidden"
                }}
            >
                {/* Watermark Icon */}
                <div style={{ position: 'absolute', right: '10%', top: '-20%', opacity: 0.03 }}>
                    <Table size={240} color="var(--brand)" />
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: "1.5rem", flex: 1, position: 'relative', zIndex: 1 }}>
                    <div style={{ 
                        width: 64, 
                        height: 64, 
                        borderRadius: "16px", 
                        background: "var(--brand-soft)", 
                        display: "flex", 
                        alignItems: "center", 
                        justifyContent: "center", 
                        color: "var(--brand)",
                        border: "1px solid rgba(232, 87, 42, 0.1)",
                        flexShrink: 0
                    }}>
                        <Table size={32} strokeWidth={2.5} />
                    </div>
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.375rem' }}>
                            <h3 style={{ fontSize: "1.25rem", fontWeight: 900, color: "var(--text-primary)", letterSpacing: '-0.01em' }}>
                                Master Permission Matrix
                            </h3>
                            <span style={{ 
                                color: "var(--brand)", 
                                fontWeight: 900, 
                                fontSize: "0.65rem", 
                                padding: "4px 8px", 
                                background: "var(--brand-soft)", 
                                borderRadius: "6px",
                                textTransform: 'uppercase',
                                letterSpacing: '0.05em',
                                border: '1px solid rgba(232, 87, 42, 0.1)'
                            }}>Analytical Console</span>
                        </div>
                        <p style={{ color: "var(--text-secondary)", fontSize: "0.9375rem", lineHeight: 1.6, maxWidth: "600px" }}>
                            Master technical view of the 10-tier organizational hierarchy. Contrast clearance levels across every module in the ecosystem.
                        </p>
                    </div>
                </div>

                <button 
                    onClick={onViewMatrix}
                    style={{ 
                        padding: '0.75rem 1.75rem', 
                        borderRadius: '12px', 
                        background: 'var(--brand)', 
                        border: 'none', 
                        color: '#FFF', 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '8px', 
                        cursor: 'pointer', 
                        fontWeight: 900, 
                        fontSize: '0.8125rem', 
                        boxShadow: '0 8px 16px rgba(232, 87, 42, 0.2)',
                        transition: 'all 0.2s ease',
                        whiteSpace: 'nowrap',
                        position: 'relative',
                        zIndex: 1
                    }}
                    onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 12px 20px rgba(232, 87, 42, 0.3)'; }}
                    onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 8px 16px rgba(232, 87, 42, 0.2)'; }}
                >
                    <Eye size={18} /> Open Repository
                </button>
            </motion.div>

            {/* ── Role Grid ──────────────────────────────────────────────── */}
            <div style={{ 
                display: "grid", 
                gridTemplateColumns: "repeat(3, 1fr)", 
                gap: "1.5rem" 
            }}>
                {activeRoles.map(([id, cfg], i) => {
                    const cleranceLevel = id === 'administrator' ? 10 : id.includes('mgr') ? 8 : id.includes('officer') ? 6 : id.includes('head') ? 7 : 2;
                    return (
                        <motion.div 
                            key={id} 
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: i * 0.05 }}
                            style={{ 
                                background: "var(--surface)", 
                                border: "1px solid var(--border)", 
                                borderRadius: "24px", 
                                padding: "1.75rem", 
                                display: "flex", 
                                flexDirection: "column", 
                                boxShadow: "var(--shadow-sm)",
                                position: "relative",
                                overflow: 'hidden',
                                transition: "all 0.2s ease",
                                cursor: 'default'
                            }}
                            onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--brand)'; e.currentTarget.style.boxShadow = 'var(--shadow-md)'; e.currentTarget.style.transform = 'translateY(-4px)'; }}
                            onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.boxShadow = 'var(--shadow-sm)'; e.currentTarget.style.transform = 'none'; }}
                        >
                            {/* Watermark background icon */}
                            <div style={{ position: 'absolute', right: '-10px', top: '-10px', opacity: 0.03 }}>
                                <RoleIcon roleId={id} size={100} />
                            </div>
                            
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1.5rem", position: 'relative', zIndex: 1 }}>
                                <div 
                                    style={{ 
                                        width: 52, 
                                        height: 52, 
                                        borderRadius: "14px", 
                                        display: "flex", 
                                        alignItems: "center", 
                                        justifyContent: "center", 
                                        backgroundColor: `${cfg.color}15`, 
                                        color: cfg.color, 
                                        border: `1px solid ${cfg.color}30` 
                                    }}
                                >
                                    <RoleIcon roleId={id} size={26} />
                                </div>
                                
                                <div style={{ textAlign: "right" }}>
                                    <div style={{ fontSize: "0.6rem", fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--text-disabled)", marginBottom: "0.5rem" }}>Clearance</div>
                                    <div style={{ display: "flex", gap: "0.3125rem", justifyContent: "flex-end" }}>
                                        {[...Array(5)].map((_, j) => (
                                            <div 
                                                key={j}
                                                style={{
                                                    width: "12px",
                                                    height: "4px",
                                                    borderRadius: "2px",
                                                    background: j < Math.ceil(cleranceLevel/2) ? "var(--brand)" : "var(--surface-2)",
                                                    border: j < Math.ceil(cleranceLevel/2) ? 'none' : '1px solid var(--border)'
                                                }}
                                            />
                                        ))}
                                    </div>
                                </div>
                            </div>
                            
                            <div style={{ flex: 1, marginBottom: "1.75rem", position: 'relative', zIndex: 1 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                                    <h4 style={{ fontSize: "1.125rem", fontWeight: 800, color: "var(--text-primary)", letterSpacing: '-0.01em' }}>
                                        {cfg.label}
                                    </h4>
                                </div>
                                <div style={{ 
                                    display: "inline-flex", 
                                    padding: "3px 8px", 
                                    background: "var(--surface-2)", 
                                    border: "1px solid var(--border)", 
                                    borderRadius: "4px", 
                                    fontFamily: "monospace", 
                                    fontSize: "0.6rem", 
                                    fontWeight: 800, 
                                    color: "var(--text-secondary)", 
                                    textTransform: "uppercase", 
                                    letterSpacing: "0.05em", 
                                    marginBottom: "1rem" 
                                }}>
                                    UID: {id.toUpperCase()}
                                </div>
                                <p style={{ color: "var(--text-secondary)", fontSize: "0.875rem", lineHeight: 1.6 }}>
                                    {cfg.description}
                                </p>
                            </div>

                            <button 
                                onClick={() => onViewPermissions(id as UserRole)}
                                style={{
                                    width: "100%",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "space-between",
                                    padding: "0.875rem 1.25rem",
                                    borderRadius: "12px",
                                    background: "var(--surface-2)",
                                    border: "1px solid var(--border)",
                                    color: "var(--text-primary)",
                                    fontWeight: 800,
                                    marginTop: "auto",
                                    transition: "all 0.2s ease",
                                    cursor: "pointer",
                                    fontSize: "0.75rem",
                                    textTransform: "uppercase",
                                    letterSpacing: "0.05em",
                                    position: 'relative',
                                    zIndex: 1
                                }}
                                onMouseEnter={e => { e.currentTarget.style.background = 'var(--brand-soft)'; e.currentTarget.style.color = 'var(--brand)'; e.currentTarget.style.borderColor = 'rgba(232, 87, 42, 0.2)'; }}
                                onMouseLeave={e => { e.currentTarget.style.background = 'var(--surface-2)'; e.currentTarget.style.color = 'var(--text-primary)'; e.currentTarget.style.borderColor = 'var(--border)'; }}
                            >
                                <span>Analyze Capabilities</span>
                                <ChevronRight size={16} />
                            </button>
                        </motion.div>
                    );
                })}
            </div>
        </div>
    );
};

export default RoleGrid;

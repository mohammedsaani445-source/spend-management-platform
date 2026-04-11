"use client";

import React from 'react';
import { X, Shield, Clock, User, Globe, Laptop2, Fingerprint, ExternalLink, ArrowRight, ChevronRight, Hash } from 'lucide-react';
import { formatCurrency } from '@/lib/currencies';

interface ForensicDrawerProps {
    log: any | null;
    onClose: () => void;
}

export default function ForensicDrawer({ log, onClose }: ForensicDrawerProps) {
    if (!log) return null;

    const timestamp = log.timestamp ? new Date(log.timestamp).toLocaleString(undefined, {
        year: 'numeric', month: 'long', day: 'numeric',
        hour: '2-digit', minute: '2-digit', second: '2-digit'
    }) : 'Unknown Time';

    const getActionColor = (action: string) => {
        if (action.includes('REJECTED') || action.includes('DENIED')) return '#FF4842';
        if (action.includes('APPROVED')) return '#00AB55';
        if (action.includes('EDIT') || action.includes('UPDATE')) return '#FFAB00';
        return '#5C6AC4';
    };

    return (
        <>
            {/* Backdrop */}
            <div 
                style={{
                    position: 'fixed',
                    top: 0, left: 0, right: 0, bottom: 0,
                    background: 'rgba(0, 0, 0, 0.2)',
                    backdropFilter: 'blur(4px)',
                    zIndex: 20000,
                    animation: 'fadeIn 0.2s ease-out'
                }}
                onClick={onClose}
            />

            {/* Drawer */}
            <div 
                style={{
                    position: 'fixed',
                    top: 0, right: 0, bottom: 0,
                    width: '600px',
                    maxWidth: '100%',
                    backgroundColor: 'white',
                    boxShadow: '-10px 0 40px rgba(0,0,0,0.1)',
                    zIndex: 20001,
                    display: 'flex',
                    flexDirection: 'column',
                    animation: 'slideInRight 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
                }}
            >
                <style>{`
                    @keyframes slideInRight {
                        from { transform: translateX(100%); }
                        to { transform: translateX(0); }
                    }
                    @keyframes fadeIn {
                        from { opacity: 0; }
                        to { opacity: 1; }
                    }
                `}</style>

                {/* Header */}
                <div style={{
                    padding: '2rem',
                    borderBottom: '1px solid #E2E8F0',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start'
                }}>
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                            <span style={{ 
                                color: getActionColor(log.action), 
                                background: `${getActionColor(log.action)}10`,
                                padding: '4px 8px',
                                borderRadius: '6px',
                                fontSize: '0.7rem',
                                fontWeight: 800,
                                textTransform: 'uppercase',
                                letterSpacing: '0.05em'
                            }}>
                                <Fingerprint size={12} style={{ marginRight: '4px', verticalAlign: 'middle' }} />
                                Forensic ID: {log.id?.slice(-8).toUpperCase()}
                            </span>
                        </div>
                        <h2 style={{ fontSize: '1.5rem', fontWeight: 900, color: '#1A202C', margin: 0, letterSpacing: '-0.02em' }}>
                            {log.action}
                        </h2>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '0.5rem', color: '#64748B', fontSize: '0.875rem' }}>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Clock size={14} /> {timestamp}</span>
                        </div>
                    </div>
                    <button 
                        onClick={onClose}
                        style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', padding: '10px', borderRadius: '12px', cursor: 'pointer', transition: 'all 0.2s' }}
                        onMouseEnter={e => e.currentTarget.style.backgroundColor = '#EDF2F7'}
                        onMouseLeave={e => e.currentTarget.style.backgroundColor = '#F8FAFC'}
                    >
                        <X size={20} color="#64748B" />
                    </button>
                </div>

                {/* Content */}
                <div style={{ flex: 1, overflowY: 'auto', padding: '2rem' }}>
                    
                    {/* Actor Details Section */}
                    <div style={{ marginBottom: '2.5rem' }}>
                        <h4 style={{ fontSize: '0.75rem', fontWeight: 800, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <User size={14} /> Chain of Custody (Actor)
                        </h4>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
                            <div style={{ padding: '1.25rem', background: '#F8FAFC', borderRadius: '16px', border: '1px solid #E2E8F0' }}>
                                <div style={{ fontSize: '0.7rem', color: '#64748B', marginBottom: '4px', fontWeight: 600 }}>Identified User</div>
                                <div style={{ fontWeight: 800, color: '#1E293B' }}>{log.actorName}</div>
                                <div style={{ fontSize: '0.75rem', color: '#64748B' }}>{log.actorEmail}</div>
                            </div>
                            <div style={{ padding: '1.25rem', background: '#F8FAFC', borderRadius: '16px', border: '1px solid #E2E8F0' }}>
                                <div style={{ fontSize: '0.7rem', color: '#64748B', marginBottom: '4px', fontWeight: 600 }}>Origin Intelligence</div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '4px' }}>
                                    <div style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#4F46E5', background: '#EEF2FF', padding: '2px 8px', borderRadius: '4px' }}>
                                        <Globe size={10} style={{ marginRight: '4px' }} />
                                        {log.ipAddress}
                                    </div>
                                    <div style={{ fontSize: '0.75rem', color: '#64748B' }}>
                                        <Laptop2 size={12} style={{ marginRight: '4px' }} />
                                        Verified System
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Change Intelligence Section */}
                    <div style={{ marginBottom: '2.5rem' }}>
                        <h4 style={{ fontSize: '0.75rem', fontWeight: 800, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '1rem' }}>
                            System State Deltas
                        </h4>
                        {log.changes && log.changes.length > 0 ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                {log.changes.map((change: any, idx: number) => (
                                    <div key={idx} style={{ padding: '1.25rem', background: 'white', border: '1.5px solid #F1F5F9', borderRadius: '16px' }}>
                                        <div style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#334155', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <Hash size={14} color="var(--brand)" /> 
                                            Field: <span style={{ fontFamily: 'monospace', color: 'var(--brand)', background: 'var(--brand-soft)', padding: '2px 6px', borderRadius: '4px' }}>{change.field}</span>
                                        </div>
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', alignItems: 'center', gap: '1rem' }}>
                                            <div style={{ padding: '1rem', background: '#FFF1F2', borderRadius: '12px', border: '1px solid #FECDD3' }}>
                                                <div style={{ fontSize: '0.65rem', color: '#BE123C', fontWeight: 800, textTransform: 'uppercase', marginBottom: '4px' }}>Original</div>
                                                <div style={{ fontSize: '0.875rem', fontWeight: 600, color: '#9F1239', wordBreak: 'break-all' }}>{String(change.oldValue)}</div>
                                            </div>
                                            <div style={{ color: '#94A3B8' }}><ArrowRight size={20} /></div>
                                            <div style={{ padding: '1rem', background: '#F0FDF4', borderRadius: '12px', border: '1px solid #BBF7D0' }}>
                                                <div style={{ fontSize: '0.65rem', color: '#15803D', fontWeight: 800, textTransform: 'uppercase', marginBottom: '4px' }}>Amended</div>
                                                <div style={{ fontSize: '0.875rem', fontWeight: 700, color: '#166534', wordBreak: 'break-all' }}>{String(change.newValue)}</div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div style={{ padding: '1.5rem', background: '#F8FAFC', borderRadius: '16px', border: '1px dashed #E2E8F0', color: '#64748B', fontSize: '0.875rem', textAlign: 'center' }}>
                                No field-level deltas captured for this action.
                            </div>
                        )}
                    </div>

                    {/* Description Section */}
                    <div style={{ marginBottom: '2.5rem' }}>
                        <h4 style={{ fontSize: '0.75rem', fontWeight: 800, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '1rem' }}>
                            Verbatim Event Log
                        </h4>
                        <div style={{ padding: '1.5rem', background: '#F8FAFC', borderRadius: '16px', borderLeft: '4px solid #CBD5E1', fontSize: '0.9375rem', color: '#334155', lineHeight: '1.6' }}>
                            {log.description}
                        </div>
                    </div>

                    {/* Entity Intelligence Section */}
                    <div style={{ marginBottom: '2rem' }}>
                        <h4 style={{ fontSize: '0.75rem', fontWeight: 800, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '1rem' }}>
                            Target Artifact
                        </h4>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.25rem', background: '#FFF', border: '1px solid #E2E8F0', borderRadius: '16px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <div style={{ width: '40px', height: '40px', background: 'var(--brand-soft)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <Shield size={20} color="var(--brand)" />
                                </div>
                                <div>
                                    <div style={{ fontWeight: 800, color: '#1E293B', fontSize: '0.9375rem' }}>{log.entityType}</div>
                                    <div style={{ fontSize: '0.75rem', color: '#64748B', fontFamily: 'monospace' }}>Ref: {log.entityId}</div>
                                </div>
                            </div>
                            <button style={{ 
                                display: 'flex', alignItems: 'center', gap: '6px', padding: '10px 16px', borderRadius: '10px',
                                background: 'white', border: '1.5px solid var(--brand)', color: 'var(--brand)', 
                                fontSize: '0.8125rem', fontWeight: 800, cursor: 'pointer', transition: 'all 0.2s'
                            }} onMouseEnter={e => { e.currentTarget.style.background = 'var(--brand)'; e.currentTarget.style.color = 'white'; }}
                               onMouseLeave={e => { e.currentTarget.style.background = 'white'; e.currentTarget.style.color = 'var(--brand)'; }}
                            >
                                Inspect Artifact <ExternalLink size={14} />
                            </button>
                        </div>
                    </div>

                </div>

                {/* Footer / Raw Payload */}
                <div style={{ padding: '1.5rem 2rem', borderTop: '1px solid #E2E8F0', backgroundColor: '#F8FAFC' }}>
                    <details>
                        <summary style={{ fontSize: '0.75rem', fontWeight: 800, color: '#64748B', cursor: 'pointer', listStyle: 'none', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <ChevronRight size={14} /> View Raw Forensic Payload
                        </summary>
                        <pre style={{ 
                            marginTop: '1rem', padding: '1rem', background: '#1E293B', color: '#D1D5DB', 
                            borderRadius: '12px', fontSize: '0.7rem', overflowX: 'auto', fontFamily: 'monospace',
                            lineHeight: '1.5'
                        }}>
                            {JSON.stringify(log, null, 2)}
                        </pre>
                    </details>
                </div>

            </div>
        </>
    );
}

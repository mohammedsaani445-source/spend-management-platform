"use client";

import { useState, useEffect } from "react";
import { VendorActionStatus } from "@/types";
import { getPendingVendorActions } from "@/lib/communications";
import { useAuth } from "@/context/AuthContext";

interface VendorActionWidgetProps {
    onPOClick?: (poId: string) => void;
}

export default function VendorActionWidget({ onPOClick }: VendorActionWidgetProps) {
    const { user } = useAuth();
    const [vendorActions, setVendorActions] = useState<VendorActionStatus[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user) loadVendorActions();
    }, [user]);

    const loadVendorActions = async () => {
        if (!user) return;
        try {
            const actions = await getPendingVendorActions(user.tenantId);
            // Filter for pending and overdue only
            const filtered = actions.filter(a =>
                a.status === 'PENDING_ACKNOWLEDGMENT' || a.status === 'OVERDUE'
            );
            setVendorActions(filtered);
        } catch (error) {
            console.error("Error loading vendor actions:", error);
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status: VendorActionStatus['status']) => {
        switch (status) {
            case 'OVERDUE': return 'var(--error)';
            case 'PENDING_ACKNOWLEDGMENT': return 'var(--warning)';
            case 'ACKNOWLEDGED': return 'var(--success)';
            default: return 'var(--text-muted)';
        }
    };

    const getEscalationBadge = (level: number) => {
        if (level === 0) return null;
        const colors = ['var(--warning)', 'var(--warning)', '#f97316', 'var(--error)'];
        return (
            <span style={{
                display: 'inline-block',
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                backgroundColor: colors[level - 1],
                marginLeft: '0.5rem',
                animation: level >= 3 ? 'pulse 2s infinite' : 'none',
                boxShadow: `0 0 8px ${colors[level - 1]}`
            }}></span>
        );
    };

    if (loading) {
        return (
            <div className="card" style={{ padding: '1.5rem' }}>
                <div style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>
                    Loading vendor actions...
                </div>
            </div>
        );
    }

    return (
        <>
            <style>{`
                @keyframes pulse {
                    0%, 100% { opacity: 1; }
                    50% { opacity: 0.5; }
                }
            `}</style>
            <div className="card" style={{ padding: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        📋 Vendor Actions Required
                    </h3>
                    {vendorActions.length > 0 && (
                        <span style={{
                            backgroundColor: 'var(--error)',
                            color: 'white',
                            padding: '0.25rem 0.75rem',
                            borderRadius: '12px',
                            fontSize: '0.85rem',
                            fontWeight: 700,
                            boxShadow: '0 2px 8px rgba(239, 68, 68, 0.4)'
                        }}>
                            {vendorActions.length} Actions
                        </span>
                    )}
                </div>

                {vendorActions.length === 0 ? (
                    <div style={{
                        textAlign: 'center',
                        padding: '2rem',
                        color: 'var(--text-secondary)',
                        backgroundColor: 'var(--background)',
                        borderRadius: '8px'
                    }}>
                        <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>✅</div>
                        <div style={{ fontSize: '0.9rem', fontWeight: 600 }}>All Caught Up!</div>
                        <div style={{ fontSize: '0.8rem', marginTop: '0.25rem' }}>
                            No pending vendor acknowledgments
                        </div>
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        {vendorActions.map((action) => (
                            <div
                                key={action.poId}
                                onClick={() => onPOClick && onPOClick(action.poId)}
                                style={{
                                    padding: '1rem',
                                    border: `1px solid ${getStatusColor(action.status)}`,
                                    borderLeft: `4px solid ${getStatusColor(action.status)}`,
                                    borderRadius: '8px',
                                    backgroundColor: 'var(--surface)',
                                    cursor: onPOClick ? 'pointer' : 'default',
                                    transition: 'all 0.2s'
                                }}
                                onMouseEnter={(e) => {
                                    if (onPOClick) {
                                        e.currentTarget.style.transform = 'translateX(4px)';
                                        e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)';
                                    }
                                }}
                                onMouseLeave={(e) => {
                                    if (onPOClick) {
                                        e.currentTarget.style.transform = 'translateX(0)';
                                        e.currentTarget.style.boxShadow = 'none';
                                    }
                                }}
                            >
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontSize: '0.9rem', fontWeight: 600, marginBottom: '0.25rem', display: 'flex', alignItems: 'center' }}>
                                            PO #{action.poId.substring(0, 8)}
                                            {getEscalationBadge(action.escalationLevel)}
                                        </div>
                                        <div style={{
                                            fontSize: '0.75rem',
                                            color: getStatusColor(action.status),
                                            fontWeight: 600,
                                            textTransform: 'uppercase'
                                        }}>
                                            {action.status === 'OVERDUE' ? '⚠️ OVERDUE' : '⏳ Pending'}
                                        </div>
                                    </div>
                                    {action.daysSinceLastContact !== undefined && (
                                        <div style={{ textAlign: 'right' }}>
                                            <div style={{ fontSize: '1.2rem', fontWeight: 700, color: getStatusColor(action.status) }}>
                                                {action.daysSinceLastContact}
                                            </div>
                                            <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>
                                                days
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {action.lastContact && (
                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                                        Last contact: {new Date(action.lastContact).toLocaleDateString()}
                                    </div>
                                )}

                                {action.escalationLevel >= 2 && (
                                    <div style={{
                                        marginTop: '0.5rem',
                                        padding: '0.6rem 0.8rem',
                                        backgroundColor: 'rgba(239, 68, 68, 0.1)',
                                        borderRadius: 'var(--radius-sm)',
                                        fontSize: '0.75rem',
                                        color: 'var(--error)',
                                        fontWeight: 600,
                                        border: '1px solid rgba(239, 68, 68, 0.2)'
                                    }}>
                                        🔔 {action.escalationLevel === 3 ? 'Critical: ' : 'High Priority: '}
                                        Follow-up recommended
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}

                {vendorActions.length > 0 && (
                    <div style={{
                        marginTop: '1rem',
                        padding: '0.75rem',
                        backgroundColor: 'var(--background)',
                        borderRadius: '8px',
                        fontSize: '0.75rem',
                        color: 'var(--text-secondary)',
                        textAlign: 'center'
                    }}>
                        💡 Click on any item to view PO details and send follow-up
                    </div>
                )}
            </div>
        </>
    );
}

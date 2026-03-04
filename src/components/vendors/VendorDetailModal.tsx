"use client";

import { useState, useEffect, useMemo } from "react";
import { Vendor } from "@/types";
import { getVendorPerformanceMetrics, VendorMetrics } from "@/lib/vendor_analytics";
import { useAuth } from "@/context/AuthContext";

interface VendorDetailModalProps {
    vendor: Vendor;
    onClose: () => void;
    onEdit: (vendor: Vendor) => void;
}

export default function VendorDetailModal({ vendor, onClose, onEdit }: VendorDetailModalProps) {
    const { user } = useAuth();
    const [metrics, setMetrics] = useState<VendorMetrics | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchMetrics = async () => {
            if (!user || !vendor.id) {
                setLoading(false);
                return;
            }
            setLoading(true);
            try {
                const data = await getVendorPerformanceMetrics(user.tenantId, vendor.id);
                setMetrics(data);
            } catch (error) {
                console.error("Failed to fetch vendor metrics:", error);
                setMetrics(null);
            } finally {
                setLoading(false);
            }
        };
        fetchMetrics();
    }, [user, vendor.id]);

    return (
        <div style={{
            position: 'fixed', inset: 0, zIndex: 100,
            backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(5px)',
            display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: '2rem 1rem',
            overflowY: 'auto'
        }}>
            <div className="card" style={{
                width: '800px', maxWidth: '95%', position: 'relative', padding: 0, border: 'none', marginBottom: '2rem'
            }}>

                {/* Header Banner */}
                <div style={{
                    backgroundColor: 'var(--primary)', color: 'white', padding: '2rem',
                    display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start'
                }}>
                    <div>
                        <div style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '1px', opacity: 0.8, marginBottom: '0.5rem' }}>Vendor Profile</div>
                        <h2 style={{ fontSize: '2rem', fontWeight: 700, margin: 0 }}>{vendor.name}</h2>
                        <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                            <span style={{
                                padding: '0.25rem 0.75rem', borderRadius: '999px', fontSize: '0.8rem', fontWeight: 600,
                                backgroundColor: vendor.status === 'ACTIVE' ? 'var(--success-bg)' : 'var(--error-bg)',
                                color: vendor.status === 'ACTIVE' ? 'var(--success)' : 'var(--error)', border: '1px solid rgba(255,255,255,0.2)'
                            }}>
                                {vendor.status}
                            </span>
                            {vendor.taxId && (
                                <span style={{ padding: '0.25rem 0.75rem', borderRadius: '4px', fontSize: '0.8rem', backgroundColor: 'rgba(255,255,255,0.1)' }}>
                                    Tax ID: {vendor.taxId}
                                </span>
                            )}
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        style={{ background: 'none', border: 'none', color: 'white', fontSize: '1.5rem', cursor: 'pointer', opacity: 0.8 }}
                        title="Close"
                    >
                        &times;
                    </button>
                </div>

                <div style={{ padding: '2rem', display: 'grid', gridTemplateColumns: '1fr 300px', gap: '2rem' }}>

                    {/* Left Column: Contact & Details */}
                    <div>
                        <h3 style={{ borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem', marginBottom: '1.5rem', fontSize: '1.1rem', color: 'var(--primary)' }}>Contact Information</h3>

                        <div style={{ display: 'grid', gap: '1.5rem' }}>
                            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                                <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: 'var(--surface-hover)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem' }}>👤</div>
                                <div>
                                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Contact Person</div>
                                    <div style={{ fontWeight: 600 }}>{vendor.contactName}</div>
                                </div>
                            </div>

                            <a href={`mailto:${vendor.email}`} style={{ display: 'flex', gap: '1rem', alignItems: 'center', textDecoration: 'none', color: 'inherit' }}>
                                <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: 'var(--brand-soft)', color: 'var(--brand)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem' }}>✉️</div>
                                <div>
                                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Email Address</div>
                                    <div style={{ fontWeight: 600, color: 'var(--primary)' }}>{vendor.email}</div>
                                </div>
                            </a>

                            <a href={`tel:${vendor.phone}`} style={{ display: 'flex', gap: '1rem', alignItems: 'center', textDecoration: 'none', color: 'inherit' }}>
                                <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: 'var(--success-bg)', color: 'var(--success)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem' }}>📞</div>
                                <div>
                                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Phone Number</div>
                                    <div style={{ fontWeight: 600 }}>{vendor.phone || 'N/A'}</div>
                                </div>
                            </a>

                            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                                <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: 'var(--surface-hover)', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem' }}>🏢</div>
                                <div>
                                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Address</div>
                                    <div style={{ fontWeight: 500, lineHeight: '1.4' }}>{vendor.address || 'No address provided'}</div>
                                </div>
                            </div>

                            <div style={{ marginTop: '1rem', padding: '1rem', backgroundColor: 'var(--surface-hover)', borderRadius: '8px', border: '1px solid var(--border)' }}>
                                <div style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    💳 Payment Configuration
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.5rem' }}>
                                    <span>Method:</span>
                                    <span style={{ fontWeight: 600 }}>{vendor.paymentMethod || 'ACH'}</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                                    <span>Direct Pay:</span>
                                    <span style={{
                                        fontWeight: 700,
                                        color: vendor.directPayEnabled ? 'var(--success)' : 'var(--text-secondary)'
                                    }}>
                                        {vendor.directPayEnabled ? 'ENABLED' : 'DISABLED'}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div style={{ marginTop: '2.5rem' }}>
                            <button
                                onClick={() => onEdit(vendor)}
                                className="btn"
                                style={{ width: '100%', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
                            >
                                ✏️ Edit Vendor Details
                            </button>
                        </div>
                    </div>

                    {/* Right Column: Scorecard & Metrics */}
                    <div style={{ backgroundColor: 'var(--surface)', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--border)' }}>
                        <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            🏆 Performance Scorecard
                        </h3>

                        {loading ? (
                            <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>Analyzing History...</div>
                        ) : metrics ? (
                            <>
                                <div style={{ marginBottom: '1.5rem' }}>
                                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>Quality Rating</div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <span style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--warning)' }}>{metrics.qualityRating.toFixed(1)}</span>
                                        <div style={{ display: 'flex', color: 'var(--warning)' }}>
                                            {[...Array(5)].map((_, i) => (
                                                <span key={i} style={{ opacity: i < Math.round(metrics.qualityRating) ? 1 : 0.3 }}>★</span>
                                            ))}
                                        </div>
                                    </div>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Verified across {metrics.totalOrders} transactions</div>
                                </div>

                                <div style={{ marginBottom: '1.5rem' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                                        <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>On-Time Delivery</span>
                                        <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>{metrics.onTimeDelivery}%</span>
                                    </div>
                                    <div style={{ width: '100%', height: '6px', backgroundColor: 'var(--border)', borderRadius: '99px' }}>
                                        <div style={{ width: `${metrics.onTimeDelivery}%`, height: '100%', backgroundColor: metrics.onTimeDelivery > 85 ? 'var(--success)' : 'var(--warning)', borderRadius: '99px' }}></div>
                                    </div>
                                </div>

                                <div style={{ marginBottom: '1.5rem' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                                        <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Fulfillment Efficiency</span>
                                        <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>{metrics.fulfillmentRatio}%</span>
                                    </div>
                                    <div style={{ width: '100%', height: '6px', backgroundColor: 'var(--border)', borderRadius: '99px' }}>
                                        <div style={{ width: `${metrics.fulfillmentRatio}%`, height: '100%', backgroundColor: metrics.fulfillmentRatio > 90 ? 'var(--brand)' : 'var(--warning)', borderRadius: '99px' }}></div>
                                    </div>
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border)' }}>
                                    <div>
                                        <div style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>{metrics.totalOrders}</div>
                                        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Lifetime POs</div>
                                    </div>
                                    <div>
                                        <div style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>{metrics.activeSince}</div>
                                        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Partner Since</div>
                                    </div>
                                </div>
                            </>
                        ) : (
                            <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)', fontStyle: 'italic' }}>
                                No transaction history found to calculate metrics.
                            </div>
                        )}
                    </div>

                </div>
            </div>
        </div>
    );
}

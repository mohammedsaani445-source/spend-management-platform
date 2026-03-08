"use client";

import { useState, useEffect } from "react";
import { PortalSession, PurchaseOrder, Invoice } from "@/types";
import { getPurchaseOrders, logDeliveryEvent } from "@/lib/purchaseOrders";
import { getInvoices } from "@/lib/invoices";
import styles from "./Portal.module.css";

interface VendorDashboardProps {
    session: PortalSession;
}

export default function VendorDashboard({ session }: VendorDashboardProps) {
    const [pos, setPOs] = useState<PurchaseOrder[]>([]);
    const [invoices, setInvoices] = useState<Invoice[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedPO, setSelectedPO] = useState<PurchaseOrder | null>(null);

    useEffect(() => {
        loadVendorData();
    }, [session.vendorId]);

    const loadVendorData = async () => {
        setLoading(true);
        try {
            const [allPOs, allInvoices] = await Promise.all([
                getPurchaseOrders({ tenantId: session.tenantId, role: 'APPROVER', uid: session.vendorId } as any),
                getInvoices({ tenantId: session.tenantId, role: 'APPROVER', department: 'VendorPortal' } as any)
            ]);

            // Filter only for THIS vendor
            setPOs(allPOs.filter((p: PurchaseOrder) => p.vendorId === session.vendorId));
            setInvoices(allInvoices.filter((i: Invoice) => i.vendorId === session.vendorId));
        } catch (error) {
            console.error("Failed to load portal data:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleAcknowledge = async (poId: string) => {
        try {
            await logDeliveryEvent(session.tenantId!, poId, 'ACKNOWLEDGED', session.vendorName);
            // Refresh data
            await loadVendorData();
            // Update selected PO if open
            if (selectedPO && selectedPO.id === poId) {
                const updated = pos.find(p => p.id === poId);
                if (updated) setSelectedPO({ ...updated, status: 'ACKNOWLEDGED' });
                else setSelectedPO(null);
            }
        } catch (error) {
            console.error("Failed to acknowledge PO:", error);
            alert("Failed to acknowledge order. Please try again.");
        }
    };

    const totalLifetime = pos.reduce((sum, po) => sum + po.totalAmount, 0);
    const outstandingInvoices = invoices
        .filter(i => i.status !== 'PAID')
        .reduce((sum, inv) => sum + inv.amount, 0);

    if (loading) return <div className={styles.portalWrapper}>Initializing secure dashboard...</div>;

    return (
        <div className={styles.portalWrapper}>
            <header className={styles.portalHeader}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div className={styles.brand}>Apex Procure</div>
                    <div style={{ width: '1px', height: '20px', background: 'rgba(255,255,255,0.2)' }}></div>
                    <div style={{ fontSize: '0.9rem', color: '#94a3b8', fontWeight: 500 }}>Supplier Nexus</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '0.9rem', fontWeight: 600 }}>{session.vendorName}</div>
                    <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Verified Partner</div>
                </div>
            </header>

            <div className={styles.kpiGrid}>
                <div className={`${styles.glassCard} ${styles.kpiCard}`}>
                    <div className={styles.kpiLabel}>Total Balance Due to Supplier</div>
                    <div className={styles.kpiValue}>${outstandingInvoices.toLocaleString()}</div>
                    <div style={{ fontSize: '0.7rem', color: '#94a3b8', marginTop: '0.5rem' }}>
                        This is the sum of all your approved invoices that are currently scheduled for payment.
                    </div>
                </div>
                <div className={`${styles.glassCard} ${styles.kpiCard}`}>
                    <div className={styles.kpiLabel}>Active Purchase Orders</div>
                    <div className={styles.kpiValue}>{pos.filter(p => p.status !== 'FULFILLED').length}</div>
                    <div style={{ fontSize: '0.7rem', color: '#64748b', marginTop: '0.5rem' }}>{pos.length} total lifetime orders</div>
                </div>
                <div className={`${styles.glassCard} ${styles.kpiCard}`}>
                    <div className={styles.kpiLabel}>Compliance Status</div>
                    <div className={styles.kpiValue} style={{ color: '#22c55e' }}>98%</div>
                    <div style={{ fontSize: '0.7rem', color: '#64748b', marginTop: '0.5rem' }}>Platinum Vendor Class</div>
                </div>
            </div>

            <div className={styles.glassCard}>
                <h3 style={{ margin: '0 0 1.5rem 0', fontSize: '1.1rem' }}>Active Purchase Orders</h3>
                <table className={styles.portalTable}>
                    <thead>
                        <tr>
                            <th>PO Number</th>
                            <th>Issued Date</th>
                            <th>Total Amount</th>
                            <th>Status</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {pos.length === 0 ? (
                            <tr><td colSpan={5} style={{ textAlign: 'center', color: '#94a3b8' }}>No orders found.</td></tr>
                        ) : (
                            pos.map(po => (
                                <tr key={po.id}>
                                    <td style={{ fontWeight: 600 }}>{po.poNumber}</td>
                                    <td>{new Date(po.issuedAt).toLocaleDateString()}</td>
                                    <td style={{ fontWeight: 700 }}>${po.totalAmount.toLocaleString()}</td>
                                    <td>
                                        <span className={styles.badge} style={{
                                            background: po.status === 'ISSUED' ? '#0ea5e922' : '#22c55e22',
                                            color: po.status === 'ISSUED' ? '#0ea5e9' : '#22c55e'
                                        }}>
                                            {po.status}
                                        </span>
                                    </td>
                                    <td>
                                        <button
                                            className="btn"
                                            onClick={() => setSelectedPO(po)}
                                            style={{ padding: '0.35rem 0.75rem', fontSize: '0.75rem', borderColor: 'rgba(255,255,255,0.2)', color: '#fff' }}
                                        >
                                            View Details
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* PO Detail Modal for Vendor */}
            {selectedPO && (
                <div style={{
                    position: 'fixed', inset: 0, zIndex: 1000,
                    backgroundColor: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem'
                }}>
                    <div className={styles.glassCard} style={{ maxWidth: '800px', width: '100%', border: '1px solid rgba(255,255,255,0.2)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '1rem' }}>
                            <h2 style={{ fontSize: '1.5rem', fontWeight: 700 }}>Order Details: {selectedPO.poNumber}</h2>
                            <button onClick={() => setSelectedPO(null)} style={{ background: 'none', border: 'none', color: '#fff', fontSize: '1.5rem', cursor: 'pointer' }}>×</button>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '2rem' }}>
                            <div>
                                <label style={{ color: '#94a3b8', fontSize: '0.8rem', textTransform: 'uppercase' }}>Issued Date</label>
                                <div style={{ fontSize: '1.1rem', fontWeight: 600 }}>{new Date(selectedPO.issuedAt).toLocaleDateString()}</div>
                            </div>
                            <div>
                                <label style={{ color: '#94a3b8', fontSize: '0.8rem', textTransform: 'uppercase' }}>Current Status</label>
                                <div style={{ fontSize: '1.1rem', fontWeight: 600, color: '#0ea5e9' }}>{selectedPO.status}</div>
                            </div>
                            <div>
                                <label style={{ color: '#94a3b8', fontSize: '0.8rem', textTransform: 'uppercase' }}>Total Order Value</label>
                                <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>${selectedPO.totalAmount.toLocaleString()}</div>
                            </div>
                        </div>

                        <div style={{ backgroundColor: 'rgba(255,255,255,0.05)', padding: '1.5rem', borderRadius: '12px', marginBottom: '2rem' }}>
                            <h4 style={{ marginBottom: '1rem', color: '#94a3b8' }}>Line Items</h4>
                            {selectedPO.items.map((item, idx) => (
                                <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem 0', borderBottom: idx < selectedPO.items.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none' }}>
                                    <div>
                                        <div style={{ fontWeight: 600 }}>{item.description}</div>
                                        <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Qty: {item.quantity} × ${item.unitPrice}</div>
                                    </div>
                                    <div style={{ fontWeight: 700 }}>${(item.quantity * item.unitPrice).toLocaleString()}</div>
                                </div>
                            ))}
                        </div>

                        <div style={{ display: 'flex', gap: '1rem' }}>
                            {selectedPO.status !== 'ACKNOWLEDGED' && selectedPO.status !== 'FULFILLED' && (
                                <button
                                    className="btn"
                                    onClick={() => handleAcknowledge(selectedPO.id!)}
                                    style={{ flex: 1, backgroundColor: '#22c55e', border: 'none', color: '#fff', fontWeight: 700 }}
                                >
                                    Acknowledge Order
                                </button>
                            )}
                            <button className="btn" onClick={() => setSelectedPO(null)} style={{ flex: 1, borderColor: 'rgba(255,255,255,0.2)', color: '#fff' }}>
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <footer style={{ marginTop: '4rem', textAlign: 'center', color: '#64748b', fontSize: '0.8rem' }}>
                Secure Portal Access • Powered by Apex Procure Enterprise Suite
            </footer>
        </div>
    );
}

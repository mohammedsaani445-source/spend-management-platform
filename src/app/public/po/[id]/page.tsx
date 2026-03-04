"use client";

import { useEffect, useState, use } from "react";
import { PurchaseOrder } from "@/types";
import { getPurchaseOrderById, logDeliveryEvent } from "@/lib/purchaseOrders";
import { formatCurrency } from "@/lib/currencies";

export default function PublicPOPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const [po, setPo] = useState<PurchaseOrder | null>(null);
    const [loading, setLoading] = useState(true);
    const [acknowledged, setAcknowledged] = useState(false);

    useEffect(() => {
        const fetchPO = async () => {
            // NOTE: In a multi-tenant environment, the tenantId is required.
            // Using 'default-tenant' as a fallback for the legacy public route.
            const tenantId = 'default-tenant';
            const data = await getPurchaseOrderById(tenantId, id);
            if (data) {
                setPo(data);
                // Log "OPENED" event as a Read Receipt
                await logDeliveryEvent(tenantId, id, 'OPENED', 'VENDOR');
            }
            setLoading(false);
        };
        fetchPO();
    }, [id]);

    const handleAcknowledge = async () => {
        const tenantId = po?.tenantId || 'default-tenant';
        await logDeliveryEvent(tenantId, id, 'ACKNOWLEDGED', 'VENDOR');
        setAcknowledged(true);
        // Refresh local state
        const updated = await getPurchaseOrderById(tenantId, id);
        if (updated) setPo(updated);
    };

    if (loading) return (
        <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f8fafc' }}>
            <div style={{ textAlign: 'center' }}>
                <div className="animate-spin" style={{ fontSize: '2rem', marginBottom: '1rem' }}>🔄</div>
                <p style={{ color: '#64748b' }}>Securely loading document...</p>
            </div>
        </div>
    );

    if (!po) return (
        <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f8fafc' }}>
            <div style={{ textAlign: 'center', maxWidth: '400px', padding: '2rem' }} className="card">
                <h1 style={{ color: '#e11d48', fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem' }}>404 - Document Not Found</h1>
                <p style={{ color: '#64748b' }}>The requested Purchase Order either does not exist or the link has expired.</p>
            </div>
        </div>
    );

    return (
        <div style={{ minHeight: '100vh', backgroundColor: '#f1f5f9', padding: '2rem' }}>
            <div style={{ maxWidth: '900px', margin: '0 auto' }}>

                {/* Header Action Bar */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }} className="no-print">
                    <div>
                        <h1 style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>Acme Corp - Vendor Portal</h1>
                        <p style={{ fontSize: '0.875rem', color: '#64748b' }}>Order Tracking & Acknowledgment</p>
                    </div>
                    <div style={{ display: 'flex', gap: '1rem' }}>
                        <button
                            onClick={() => window.print()}
                            style={{ padding: '0.5rem 1rem', backgroundColor: 'white', border: '1px solid #cbd5e1', borderRadius: '6px', fontWeight: 500, cursor: 'pointer' }}
                        >
                            🖨️ Save as PDF
                        </button>
                        {!acknowledged && po.status !== 'ACKNOWLEDGED' && (
                            <button
                                onClick={handleAcknowledge}
                                style={{ padding: '0.5rem 1rem', backgroundColor: '#0f172a', color: 'white', border: 'none', borderRadius: '6px', fontWeight: 600, cursor: 'pointer' }}
                            >
                                ✅ Acknowledge Receipt
                            </button>
                        )}
                        {(acknowledged || po.status === 'ACKNOWLEDGED') && (
                            <span style={{ padding: '0.5rem 1rem', backgroundColor: '#dcfce7', color: '#166534', borderRadius: '6px', fontWeight: 600, border: '1px solid #bbf7d0' }}>
                                Received & Acknowledged
                            </span>
                        )}
                    </div>
                </div>

                {/* The PO Document */}
                <div style={{
                    backgroundColor: 'white', borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                    padding: '4rem', fontFamily: 'serif',
                    position: 'relative', overflow: 'hidden'
                }} className="print-content">

                    {/* Professional Status Watermark */}
                    <div style={{
                        position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%) rotate(-25deg)',
                        fontSize: (po.status === 'ACKNOWLEDGED' || acknowledged) ? '6rem' : '10rem',
                        fontWeight: 900,
                        color: (po.status === 'ACKNOWLEDGED' || acknowledged) ? '#16a34a' : '#94a3b8',
                        opacity: 0.1, pointerEvents: 'none',
                        userSelect: 'none',
                        border: (po.status === 'ACKNOWLEDGED' || acknowledged) ? '12px solid #16a34a' : 'none',
                        padding: '1rem 2rem', borderRadius: '15px',
                        zIndex: 0, textTransform: 'uppercase', fontFamily: 'sans-serif',
                        whiteSpace: 'nowrap'
                    }}>
                        {(po.status === 'ACKNOWLEDGED' || acknowledged) ? 'ORDER ACKNOWLEDGED' : po.status}
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4rem' }}>
                        <div>
                            <h2 style={{ fontSize: '2.5rem', fontWeight: 'bold', fontFamily: 'sans-serif', letterSpacing: '-0.025em' }}>PURCHASE ORDER</h2>
                            <div style={{ marginTop: '0.5rem', fontSize: '1.125rem' }}>#{po.poNumber}</div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                            <div style={{ fontWeight: 'bold', fontSize: '1.25rem' }}>Acme Corp Inc.</div>
                            <div style={{ color: '#64748b' }}>Supply Chain Division</div>
                            <div style={{ color: '#64748b' }}>123 Enterprise Blvd, TC 94043</div>
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3rem', marginBottom: '4rem' }}>
                        <div>
                            <div style={{ fontSize: '0.75rem', fontWeight: 'bold', color: '#64748b', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Vendor</div>
                            <div style={{ fontWeight: 600, fontSize: '1.1rem' }}>{po.vendorName}</div>
                            <div style={{ color: '#475569' }}>{po.vendorEmail}</div>
                        </div>
                        <div>
                            <div style={{ fontSize: '0.75rem', fontWeight: 'bold', color: '#64748b', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Ship To</div>
                            <div style={{ fontWeight: 600 }}>Acme Main Warehouse</div>
                            <div style={{ color: '#475569' }}>Receiving Dock B</div>
                        </div>
                    </div>

                    <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '2rem' }}>
                        <thead>
                            <tr style={{ borderBottom: '2px solid #0f172a', textAlign: 'left' }}>
                                <th style={{ padding: '0.75rem 0', fontFamily: 'sans-serif' }}>Description</th>
                                <th style={{ padding: '0.75rem 0', textAlign: 'center', fontFamily: 'sans-serif' }}>Qty</th>
                                <th style={{ padding: '0.75rem 0', textAlign: 'right', fontFamily: 'sans-serif' }}>Unit Price</th>
                                <th style={{ padding: '0.75rem 0', textAlign: 'right', fontFamily: 'sans-serif' }}>Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            {po.items.map((item, i) => (
                                <tr key={i} style={{ borderBottom: '1px solid #e2e8f0' }}>
                                    <td style={{ padding: '1rem 0' }}>{item.description}</td>
                                    <td style={{ padding: '1rem 0', textAlign: 'center' }}>{item.quantity}</td>
                                    <td style={{ padding: '1rem 0', textAlign: 'right' }}>{formatCurrency(item.unitPrice, po.currency)}</td>
                                    <td style={{ padding: '1rem 0', textAlign: 'right', fontWeight: 600 }}>{formatCurrency(item.total, po.currency)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '2rem' }}>
                        <div style={{ width: '300px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0' }}>
                                <span>Subtotal:</span>
                                <span>{formatCurrency(po.totalAmount, po.currency)}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid #e2e8f0' }}>
                                <span>Estimated Tax:</span>
                                <span>{formatCurrency(0, po.currency)}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '1rem 0', fontSize: '1.25rem', fontWeight: 'bold' }}>
                                <span>Grand Total:</span>
                                <span>{formatCurrency(po.totalAmount, po.currency)}</span>
                            </div>
                        </div>
                    </div>

                    <div style={{ marginTop: '4rem', fontSize: '0.875rem', color: '#64748b' }}>
                        <p style={{ fontWeight: 'bold', color: '#1e293b', marginBottom: '0.5rem' }}>Important Instructions:</p>
                        <ol style={{ paddingLeft: '1.25rem' }}>
                            <li>Please reference the PO number on all invoices and pack slips.</li>
                            <li>Deliveries accepted Mon-Fri, 9AM-4PM.</li>
                            <li>This is an electronically generated and tracked document.</li>
                        </ol>
                    </div>
                </div>

                <style jsx global>{`
                    @media print {
                        .no-print { display: none !important; }
                        body { background: white !important; padding: 0 !important; }
                        .print-content { 
                            box-shadow: none !important; 
                            border: none !important; 
                            padding: 0 !important;
                            width: 100% !important;
                        }
                    }
                `}</style>
            </div>
        </div>
    );
}

"use client";

import React from 'react';
import { PurchaseOrder, ItemReceipt, Invoice } from '@/types';
import { formatCurrency } from '@/lib/currencies';
import { CheckCircle, AlertTriangle } from 'lucide-react';

interface MatchingConsoleProps {
    po: PurchaseOrder;
    receipts: ItemReceipt[];
    invoices: Invoice[];
    isDark?: boolean;
}

export const MatchingConsole: React.FC<MatchingConsoleProps> = ({ po, receipts, invoices, isDark = true }) => {
    // 1. Logic to aggregate data for the "Triangle"
    const poItems = po.items;
    const matchData = poItems.map((item, index) => {
        const received = receipts.reduce((sum, r) => {
            const line = r.lines?.find(l => l.itemIndex === index);
            return sum + (line?.receivedQty || 0);
        }, 0);

        const invoiced = invoices.reduce((sum, i) => {
            const line = i.lines?.find(l => l.itemIndex === index);
            return sum + (line?.receivedQty || 0); // Using receivedQty as billed qty in invoice line
        }, 0);

        const billedPrice = invoices.reduce((max, i) => {
            const line = i.lines?.find(l => l.itemIndex === index);
            return Math.max(max, line?.unitPrice || 0);
        }, 0);

        return {
            description: item.description,
            ordered: item.quantity,
            received,
            invoiced,
            price: item.unitPrice,
            billedPrice: billedPrice || item.unitPrice,
            hasQuantityGap: invoiced > received || invoiced > item.quantity,
            hasPriceGap: billedPrice > item.unitPrice && billedPrice > 0
        };
    });

    const isMatched = po.isMatched;

    return (
        <div style={{
            background: isDark ? 'rgba(255, 255, 255, 0.03)' : 'var(--surface)',
            backdropFilter: 'blur(16px)',
            borderRadius: '24px',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            padding: '2rem',
            boxShadow: 'var(--shadow-xl)',
            overflow: 'hidden',
            position: 'relative'
        }}>
            {/* Header / Status */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
                <div>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 900, color: isDark ? '#FFF' : 'var(--text-main)', margin: 0, letterSpacing: '-0.02em' }}>
                        3-Way Match Console
                    </h3>
                    <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                        Reconciling Order {po.poNumber} vs Delivery vs Billing
                    </p>
                </div>
                <div style={{
                    padding: '0.5rem 1.25rem',
                    borderRadius: '99px',
                    background: isMatched ? 'rgba(0, 171, 85, 0.1)' : 'rgba(255, 72, 66, 0.1)',
                    color: isMatched ? '#00AB55' : '#FF4842',
                    border: `1px solid ${isMatched ? 'rgba(0, 171, 85, 0.2)' : 'rgba(255, 72, 66, 0.2)'}`,
                    fontSize: '0.75rem',
                    fontWeight: 800,
                    textTransform: 'uppercase',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                }}>
                    {isMatched ? <CheckCircle size={14} /> : <AlertTriangle size={14} />}
                    {isMatched ? 'Audit Verified' : 'Discrepancy Detected'}
                </div>
            </div>

            {/* The Match Matrix */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                {matchData.map((item, i) => (
                    <div key={i} style={{
                        background: 'rgba(255, 255, 255, 0.02)',
                        borderRadius: '16px',
                        padding: '1.25rem',
                        border: '1.5px solid rgba(255, 255, 255, 0.05)',
                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    }} className="hover:border-brand-soft">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                            <div style={{ fontWeight: 800, fontSize: '0.9375rem', color: '#FFF' }}>{item.description}</div>
                            {item.hasPriceGap && (
                                <div style={{ fontSize: '0.7rem', color: '#FF4842', fontWeight: 800, background: 'rgba(255, 72, 66, 0.1)', padding: '2px 8px', borderRadius: '4px' }}>
                                    PRICE VARIANCE: +{formatCurrency(item.billedPrice - item.price, po.currency || 'USD')}
                                </div>
                            )}
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
                            {/* PO Column */}
                            <div style={{ textAlign: 'center' }}>
                                <div style={{ fontSize: '0.65rem', fontWeight: 900, color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Ordered</div>
                                <div style={{ 
                                    padding: '0.75rem',
                                    borderRadius: '12px',
                                    background: 'rgba(92, 106, 196, 0.1)',
                                    color: '#5C6AC4',
                                    fontSize: '1rem',
                                    fontWeight: 900,
                                    border: '1px solid rgba(92, 106, 196, 0.2)'
                                }}>
                                    {item.ordered}
                                </div>
                            </div>

                            {/* Receipt Column */}
                            <div style={{ textAlign: 'center' }}>
                                <div style={{ fontSize: '0.65rem', fontWeight: 900, color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Received</div>
                                <div style={{ 
                                    padding: '0.75rem',
                                    borderRadius: '12px',
                                    background: item.received >= item.ordered ? 'rgba(0, 171, 85, 0.1)' : 'rgba(255, 171, 0, 0.1)',
                                    color: item.received >= item.ordered ? '#00AB55' : '#FFAB00',
                                    fontSize: '1rem',
                                    fontWeight: 900,
                                    border: `1px solid ${item.received >= item.ordered ? 'rgba(0, 171, 85, 0.2)' : 'rgba(255, 171, 0, 0.2)'}`
                                }}>
                                    {item.received}
                                </div>
                            </div>

                            {/* Invoice Column */}
                            <div style={{ textAlign: 'center' }}>
                                <div style={{ fontSize: '0.65rem', fontWeight: 900, color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Billed</div>
                                <div style={{ 
                                    padding: '0.75rem',
                                    borderRadius: '12px',
                                    background: item.hasQuantityGap ? 'rgba(255, 72, 66, 0.1)' : 'rgba(0, 171, 85, 0.1)',
                                    color: item.hasQuantityGap ? '#FF4842' : '#00AB55',
                                    fontSize: '1rem',
                                    fontWeight: 900,
                                    border: `1px solid ${item.hasQuantityGap ? 'rgba(255, 72, 66, 0.2)' : 'rgba(0, 171, 85, 0.2)'}`
                                }}>
                                    {item.invoiced}
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Forensic Detail Footer */}
            {!isMatched && po.discrepancyNote && (
                <div style={{ 
                    marginTop: '2rem',
                    padding: '1.25rem',
                    borderRadius: '16px',
                    background: 'rgba(255, 72, 66, 0.05)',
                    border: '1.5px dashed rgba(255, 72, 66, 0.3)',
                    color: '#FF4842',
                    fontSize: '0.8125rem',
                    lineHeight: '1.5'
                }}>
                    <strong style={{ display: 'block', marginBottom: '0.25rem', textTransform: 'uppercase', fontSize: '0.7rem' }}>System Flag Log:</strong>
                    {po.discrepancyNote}
                </div>
            )}
        </div>
    );
};

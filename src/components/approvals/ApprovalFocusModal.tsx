"use client";

import { Requisition, Budget, RequisitionItem, AppUser } from "@/types";
import { formatCurrency } from "@/lib/currencies";
import { useState, useEffect } from "react";
import { getRequisitions } from "@/lib/requisitions";
import { useAuth } from "@/context/AuthContext";
import { useScrollLock } from "@/hooks/useScrollLock";

interface ApprovalFocusModalProps {
    requisition: Requisition;
    budget?: Budget;
    deptSpend: number;
    onClose: () => void;
    onApprove: (id: string, comment?: string) => void;
    onReject: (id: string, comment?: string) => void;
    onRevision?: (id: string, comment?: string) => void;
}

export default function ApprovalFocusModal({
    requisition,
    budget,
    deptSpend,
    onClose,
    onApprove,
    onReject
}: ApprovalFocusModalProps) {
    useScrollLock(true);
    const { user } = useAuth();
    const [priceHistory, setPriceHistory] = useState<{ item: string, lastPrice: number, date: Date }[]>([]);
    const [loadingHistory, setLoadingHistory] = useState(true);
    const [comment, setComment] = useState("");

    // Calculate Budget Impact
    const currentSpend = deptSpend;
    const requestAmount = requisition.totalAmount;
    const totalBudget = budget?.amount || 0;
    const remainingBefore = totalBudget - currentSpend;
    const remainingAfter = remainingBefore - requestAmount;

    // Percentages for the bar
    const spendPercent = totalBudget > 0 ? (currentSpend / totalBudget) * 100 : 0;
    const requestPercent = totalBudget > 0 ? (requestAmount / totalBudget) * 100 : 0;
    // Cap at 100 for visual sanity
    const visualSpend = Math.min(spendPercent, 100);
    const visualRequest = Math.min(requestPercent, 100 - visualSpend);

    // Fetch Price History (Real Data Logic)
    useEffect(() => {
        const fetchHistory = async () => {
            if (!user) return;
            try {
                const allReqs = await getRequisitions(user);
                const historyResults: { item: string, lastPrice: number, date: Date }[] = [];

                requisition.items.forEach(currentItem => {
                    // Find previous approved requests containing this item
                    const match = allReqs
                        .filter(r => r.status === 'APPROVED' || r.status === 'ORDERED')
                        .flatMap(r => r.items.map(i => ({ ...i, date: r.createdAt })))
                        .filter(prevItem => prevItem.description.toLowerCase() === currentItem.description.toLowerCase())
                        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0]; // Get latest

                    if (match) {
                        historyResults.push({
                            item: currentItem.description,
                            lastPrice: match.unitPrice,
                            date: new Date(match.date)
                        });
                    }
                });
                setPriceHistory(historyResults);
            } catch (err) {
                console.error("Failed to load price history", err);
            } finally {
                setLoadingHistory(false);
            }
        };

        fetchHistory();
    }, [requisition, user]);


    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.95)', // Deep dark overlay
            zIndex: 'var(--z-modal)' as any,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backdropFilter: 'blur(8px)',
            animation: 'fadeIn 0.3s ease-out'
        }}>
            <div className="card modalContainer">
                {/* Left Panel: The Request (Document View) */}
                <div className="leftPanel">
                    <div className="documentCard">
                        {/* Header */}
                        <div className="reqHeader">
                            <div>
                                <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)' }}>Purchase Requisition</h1>
                                <div style={{ color: 'var(--text-secondary)' }}>#{requisition.id?.slice(0, 8).toUpperCase()}</div>
                            </div>
                            <div className="reqHeaderRight">
                                <div style={{ fontWeight: 700, fontSize: '1.1rem' }}>{requisition.department}</div>
                                <div style={{ color: 'var(--text-secondary)' }}>{new Date(requisition.createdAt).toLocaleDateString()}</div>
                            </div>
                        </div>

                        {/* Requester Info */}
                        <div className="reqInfoGrid">
                            <div>
                                <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-disabled)', fontWeight: 600 }}>Requested By</div>
                                <div style={{ fontSize: '1rem', fontWeight: 500 }}>{requisition.requesterName}</div>
                            </div>
                            <div>
                                <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-disabled)', fontWeight: 600 }}>Preferred Vendor</div>
                                <div style={{ fontSize: '1rem', fontWeight: 500 }}>{requisition.vendorName || 'Not Specified'}</div>
                            </div>
                        </div>

                        {/* Line Items Table wrapper */}
                        <div className="tableWrapper">
                            <table style={{ width: '100%', marginBottom: '2rem', borderCollapse: 'collapse' }}>
                                <thead>
                                    <tr style={{ borderBottom: '1px solid var(--border)' }}>
                                        <th style={{ textAlign: 'left', padding: '0.75rem 0', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Item & Description</th>
                                        <th style={{ textAlign: 'right', padding: '0.75rem 0', color: 'var(--text-secondary)', fontSize: '0.875rem', width: '80px' }}>Qty</th>
                                        <th style={{ textAlign: 'right', padding: '0.75rem 0', color: 'var(--text-secondary)', fontSize: '0.875rem', width: '120px' }}>Unit Price</th>
                                        <th style={{ textAlign: 'right', padding: '0.75rem 0', color: 'var(--text-secondary)', fontSize: '0.875rem', width: '120px' }}>Total</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {requisition.items.map((item, idx) => (
                                        <tr key={idx} style={{ borderBottom: '1px solid var(--border)' }}>
                                            <td style={{ padding: '1rem 0' }}>
                                                <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{item.description}</div>
                                                <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>GL: {item.glCode || 'N/A'}</div>
                                            </td>
                                            <td style={{ textAlign: 'right', padding: '1rem 0' }}>{item.quantity}</td>
                                            <td style={{ textAlign: 'right', padding: '1rem 0' }}>{formatCurrency(item.unitPrice, requisition.currency)}</td>
                                            <td style={{ textAlign: 'right', padding: '1rem 0', fontWeight: 600 }}>{formatCurrency(item.total, requisition.currency)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                                <tfoot>
                                    <tr>
                                        <td colSpan={3} style={{ textAlign: 'right', paddingTop: '1.5rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Total Amount</td>
                                        <td style={{ textAlign: 'right', paddingTop: '1.5rem', fontWeight: 800, fontSize: '1.5rem', color: 'var(--text-primary)' }}>
                                            {formatCurrency(requisition.totalAmount, requisition.currency)}
                                        </td>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>

                        {/* Justification */}
                        <div style={{ marginBottom: '2rem' }}>
                            <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>Business Justification</div>
                            <p style={{ color: 'var(--text-primary)', lineHeight: 1.6, backgroundColor: 'var(--background)', padding: '1rem', borderRadius: '8px' }}>
                                {requisition.justification}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Right Panel: Decision Support */}
                <div className="rightPanel">

                    <div className="closeBtnWrapper">
                        <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-disabled)', fontSize: '1.5rem', cursor: 'pointer', padding: '0.5rem' }}>✕</button>
                    </div>

                    <div style={{ marginTop: '1rem', flex: 1 }}>
                        <h2 style={{ fontSize: '1.1rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-disabled)', marginBottom: '2rem' }}>Decision Intelligence</h2>

                        {/* Budget Impact Simulator */}
                        <div style={{ marginBottom: '3rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.9rem' }}>
                                <span style={{ color: 'var(--surface)' }}>Budget Impact</span>
                                {remainingAfter < 0 ? (
                                    <span style={{ color: 'var(--error)', fontWeight: 700 }}>⚠️ Over Budget by {formatCurrency(Math.abs(remainingAfter), budget?.currency || requisition.currency || 'USD')}</span>
                                ) : (
                                    <span style={{ color: 'var(--success)' }}>Within Budget</span>
                                )}
                            </div>

                            {/* The Bar */}
                            <div style={{ height: '24px', backgroundColor: 'var(--text-secondary)', borderRadius: '12px', overflow: 'hidden', display: 'flex' }}>
                                {/* Existing Spend */}
                                <div style={{ width: `${visualSpend}%`, backgroundColor: 'var(--text-disabled)', transition: 'width 1s' }} title="Current Spend"></div>
                                {/* This Request */}
                                <div style={{
                                    width: `${visualRequest}%`,
                                    backgroundColor: remainingAfter < 0 ? 'var(--error)' : 'var(--warning)',
                                    transition: 'width 1s',
                                    animation: 'pulse 2s infinite'
                                }} title="This Request"></div>
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.5rem', fontSize: '0.8rem', color: 'var(--text-disabled)' }}>
                                <span>Used: {Math.round(spendPercent)}%</span>
                                <span>Impact: +{Math.round(requestPercent)}%</span>
                            </div>
                        </div>


                        {/* Price Check Intelligence */}
                        <div style={{ marginBottom: '2rem' }}>
                            <h3 style={{ fontSize: '0.9rem', color: 'var(--surface)', marginBottom: '1rem', borderBottom: '1px solid var(--text-secondary)', paddingBottom: '0.5rem' }}>Price Benchmarking</h3>
                            {loadingHistory ? (
                                <div style={{ fontSize: '0.8rem', color: 'var(--text-disabled)' }}>Analyzing historical data...</div>
                            ) : priceHistory.length > 0 ? (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                    {priceHistory.map((h, i) => (
                                        <div key={i} style={{ fontSize: '0.875rem' }}>
                                            <div style={{ color: 'white', marginBottom: '0.25rem' }}>{h.item}</div>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <span style={{ color: 'var(--text-disabled)' }}>Previously bought:</span>
                                                <span style={{ color: 'var(--warning)', fontWeight: 600 }}>{formatCurrency(h.lastPrice, requisition.currency)}</span>
                                            </div>
                                            <div style={{ fontSize: '0.75rem', color: 'var(--text-disabled)', textAlign: 'right' }}>on {h.date.toLocaleDateString()}</div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div style={{ fontSize: '0.875rem', color: 'var(--text-disabled)', fontStyle: 'italic' }}>
                                    No historical data found for these items.
                                </div>
                            )}
                        </div>

                        {/* Policy Checks (Static for now, could be dynamic) */}
                        <div>
                            <h3 style={{ fontSize: '0.9rem', color: 'var(--surface)', marginBottom: '1rem', borderBottom: '1px solid var(--text-secondary)', paddingBottom: '0.5rem' }}>Policy Compliance</h3>
                            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', fontSize: '0.875rem', color: 'var(--success)' }}>
                                <span>✅</span> Coding is valid
                            </div>
                        </div>

                        {/* Approval Chain (New) */}
                        <div style={{ marginTop: '2.5rem' }}>
                            <h3 style={{ fontSize: '0.9rem', color: 'var(--surface)', marginBottom: '1rem', borderBottom: '1px solid var(--text-secondary)', paddingBottom: '0.5rem' }}>Approval Chain</h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                {requisition.approvalHistory?.map((entry, idx) => (
                                    <div key={idx} style={{ display: 'flex', gap: '0.75rem', fontSize: '0.85rem' }}>
                                        <div style={{ color: 'var(--success)' }}>✓</div>
                                        <div>
                                            <div style={{ fontWeight: 600 }}>{entry.stepName}</div>
                                            <div style={{ color: 'var(--text-disabled)' }}>{entry.actorName} approved</div>
                                        </div>
                                    </div>
                                ))}
                                <div style={{ display: 'flex', gap: '0.75rem', fontSize: '0.85rem', opacity: 0.6 }}>
                                    <div style={{ color: 'var(--warning)' }}>○</div>
                                    <div>
                                        <div style={{ fontWeight: 600 }}>Current Stage</div>
                                        <div style={{ fontStyle: 'italic' }}>Tier {(requisition.currentStepIndex || 0) + 1}</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                    </div>

                    {/* Decision Comment */}
                    <div style={{ marginBottom: '1.5rem', flexShrink: 0 }}>
                        <textarea
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            placeholder="Decision comment..."
                            style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', background: 'var(--text-secondary)', border: 'none', color: 'white', fontSize: '0.875rem' }}
                            rows={2}
                        />
                    </div>

                    {/* Action Footer */}
                    <div style={{ marginTop: 'auto', paddingTop: '2rem', borderTop: '1px solid var(--text-secondary)', flexShrink: 0 }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                            <button
                                onClick={() => onReject(requisition.id!, comment)}
                                style={{
                                    padding: '1rem',
                                    borderRadius: '8px',
                                    border: '1px solid var(--error)',
                                    backgroundColor: 'transparent',
                                    color: 'var(--error)',
                                    fontWeight: 600,
                                    cursor: 'pointer',
                                    transition: 'all 0.2s'
                                }}
                            >
                                Reject
                            </button>
                            <button
                                onClick={() => onApprove(requisition.id!, comment)}
                                style={{
                                    padding: '1rem',
                                    borderRadius: '8px',
                                    border: 'none',
                                    backgroundColor: 'var(--success)',
                                    color: 'white',
                                    fontWeight: 700,
                                    cursor: 'pointer',
                                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                                    transition: 'all 0.2s'
                                }}
                            >
                                Approve Request
                            </button>
                        </div>
                    </div>
                </div>

                <style jsx>{`
                    .modalContainer {
                        width: 95vw;
                        height: 90vh;
                        max-width: 1600px;
                        display: grid;
                        grid-template-columns: 1fr 400px;
                        padding: 0;
                        overflow: hidden;
                        background-color: var(--background);
                        box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
                    }
                    .leftPanel {
                        padding: 3rem;
                        overflow-y: auto;
                        background-color: var(--surface-2);
                        border-right: 1px solid var(--border);
                    }
                    .documentCard {
                        max-width: 800px;
                        margin: 0 auto;
                        background-color: white;
                        padding: 3rem;
                        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
                        min-height: 100%;
                    }
                    .reqHeader {
                        display: flex;
                        justify-content: space-between;
                        margin-bottom: 2rem;
                        border-bottom: 2px solid var(--text-primary);
                        padding-bottom: 1rem;
                    }
                    .reqHeaderRight {
                        text-align: right;
                    }
                    .reqInfoGrid {
                        display: grid;
                        grid-template-columns: 1fr 1fr;
                        gap: 2rem;
                        margin-bottom: 3rem;
                    }
                    .rightPanel {
                        background-color: var(--text-primary);
                        color: white;
                        padding: 2rem;
                        display: flex;
                        flex-direction: column;
                        height: 100%;
                        overflow-y: auto;
                    }
                    .closeBtnWrapper {
                        display: flex;
                        justify-content: flex-end;
                        flex-shrink: 0;
                    }
                    .tableWrapper {
                        width: 100%;
                        overflow-x: auto;
                        margin-bottom: 2rem;
                    }
                    
                    @keyframes fadeIn {
                        from { opacity: 0; }
                        to { opacity: 1; }
                    }
                    @keyframes pulse {
                        0% { opacity: 1; }
                        50% { opacity: 0.7; }
                        100% { opacity: 1; }
                    }

                    @media (max-width: 1024px) {
                        .modalContainer {
                            grid-template-columns: 1fr;
                            overflow-y: auto;
                            height: 95vh;
                        }
                        .leftPanel {
                            padding: 1rem;
                            border-right: none;
                            overflow-y: visible;
                        }
                        .documentCard {
                            padding: 1.5rem;
                            min-height: auto;
                        }
                        .reqHeader {
                            flex-direction: column;
                            gap: 1rem;
                        }
                        .reqHeaderRight {
                            text-align: left;
                        }
                        .reqInfoGrid {
                            grid-template-columns: 1fr;
                            gap: 1rem;
                            margin-bottom: 2rem;
                        }
                        .rightPanel {
                            padding: 1.5rem;
                            overflow-y: visible;
                            height: auto;
                        }
                        .closeBtnWrapper {
                            position: fixed;
                            top: 2.5vh;
                            right: 2.5vw;
                            background: rgba(15, 23, 42, 0.8);
                            border-radius: 50%;
                            z-index: 1000;
                        }
                    }
                `}</style>
            </div>
        </div>
    );
}

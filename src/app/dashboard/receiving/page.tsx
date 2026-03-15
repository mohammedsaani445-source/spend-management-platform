"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { 
    Search, Filter, Package, Truck, CheckCircle, 
    AlertCircle, Calendar, ClipboardCheck, 
    Zap, Shield, Info, Layers, Activity
} from "lucide-react";
import Loader from "@/components/common/Loader";
import { PurchaseOrder, ItemReceipt, GoodsReceiptLine, AppUser, Invoice } from "@/types";
import { getPurchaseOrders } from "@/lib/purchaseOrders";
import { getReceipts, createReceipt, updateReceiptQuality, unreceiveItems } from "@/lib/receipts";
import { ReceiptCaptureModal } from "@/components/receipts/ReceiptCaptureModal";
import { MatchingConsole } from "@/components/admin/MatchingConsole";
import { PromoteToRegistryModal } from "@/components/inventory/PromoteToRegistryModal";
import { formatCurrency } from "@/lib/currencies";
import { useAuth } from "@/context/AuthContext";
import { useModal } from "@/context/ModalContext";
import { ref, get } from "firebase/database";
import { db, DB_PREFIX } from "@/lib/firebase";

// ─── Status colours ───────────────────────────────────────────────────────────
const MATCH_STYLES: Record<string, { bg: string; color: string; label: string; icon: any }> = {
    MATCHED: { bg: "rgba(0, 171, 85, 0.1)", color: "#00AB55", label: "MATCHED", icon: Shield },
    PARTIAL: { bg: "rgba(255, 171, 0, 0.1)", color: "#FFAB00", label: "PARTIAL", icon: AlertCircle },
    UNMATCHED: { bg: "rgba(255, 72, 66, 0.1)", color: "#FF4842", label: "VARIANCE", icon: AlertCircle },
    PENDING: { bg: "rgba(145, 158, 171, 0.1)", color: "#919EAB", label: "AWAITING", icon: Info },
};

function getMatchStatus(po: PurchaseOrder): string {
    if (!po.receiptIds || po.receiptIds.length === 0) return "PENDING";
    if (po.isMatched) return "MATCHED";
    return po.status === 'DISCREPANCY_FLAGGED' ? "UNMATCHED" : "PARTIAL";
}

export default function ReceivingPage() {
    const { user } = useAuth();
    const { showConfirm, showError, showAlert } = useModal();

    const [pos, setPos] = useState<PurchaseOrder[]>([]);
    const [receipts, setReceipts] = useState<ItemReceipt[]>([]);
    const [invoices, setInvoices] = useState<Invoice[]>([]);
    const [loading, setLoading] = useState(true);
    const [tab, setTab] = useState<"pending" | "history">("pending");
    const [search, setSearch] = useState("");

    // ── Receive Modal state ──────────────────────────────────────────────────
    const [selectedPO, setSelectedPO] = useState<PurchaseOrder | null>(null);
    const [showModal, setShowModal] = useState(false);
    const [showMatchConsole, setShowMatchConsole] = useState(false);
    const [isAutoReceive, setIsAutoReceive] = useState(false);
    const [receiptLines, setReceiptLines] = useState<GoodsReceiptLine[]>([]);
    const [packingSlipName, setPackingSlipName] = useState("");
    const [notes, setNotes] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [isScanOpen, setIsScanOpen] = useState(false);
    
    // ── Promotion state ──────────────────────────────────────────────────────
    const [receiptToPromote, setReceiptToPromote] = useState<ItemReceipt | null>(null);
    const [lineIndexToPromote, setLineIndexToPromote] = useState<number | null>(null);

    const fetchData = useCallback(async () => {
        if (!user) return;
        setLoading(true);
        const [poData, receiptData] = await Promise.all([
            getPurchaseOrders(user),
            getReceipts(user),
        ]);

        // Fetch Invoices for Match Console
        const invRef = ref(db, `${DB_PREFIX}/tenants/${user.tenantId}/invoices`);
        const invSnap = await get(invRef);
        const invData = invSnap.exists() ? Object.values(invSnap.val()) as Invoice[] : [];
        
        setInvoices(invData);
        setPos(poData.filter(po => !["CANCELLED", "CLOSED"].includes(po.status)));
        setReceipts(receiptData);
        setLoading(false);
    }, [user]);

    useEffect(() => { fetchData(); }, [fetchData]);

    const stats = useMemo(() => {
        const today = new Date().toDateString();
        const receivedToday = receipts.filter(r => new Date(r.createdAt).toDateString() === today).length;
        const pending = pos.filter(po => !po.receiptIds || po.receiptIds.length === 0).length;
        const matched = pos.filter(po => po.isMatched).length;
        const matchRate = pos.length > 0 ? Math.round((matched / pos.length) * 100) : 0;
        return { receivedToday, pending, matchRate };
    }, [pos, receipts]);

    const filteredPOs = useMemo(() => {
        const q = search.toLowerCase();
        return pos.filter(po =>
            po.poNumber.toLowerCase().includes(q) ||
            po.vendorName.toLowerCase().includes(q)
        );
    }, [pos, search]);

    const openReceiveModal = (po: PurchaseOrder) => {
        setSelectedPO(po);
        setIsAutoReceive(false);
        setPackingSlipName("");
        setNotes("");
        setReceiptLines(po.items.map((item, i) => ({
            itemIndex: i,
            description: item.description,
            orderedQty: item.quantity,
            receivedQty: item.quantity,
            unitPrice: item.unitPrice,
            qualityStatus: "PASSED" as const,
        })));
        setShowModal(true);
    };

    const handleSubmitReceipt = async () => {
        if (!user || !selectedPO) return;
        const anyReceived = receiptLines.some(l => l.receivedQty > 0);
        if (!anyReceived && !isAutoReceive) {
            await showAlert("Validation", "Please enter at least one received quantity.");
            return;
        }
        setSubmitting(true);
        try {
            await createReceipt(user.tenantId, {
                poId: selectedPO.id!,
                poNumber: selectedPO.poNumber,
                poVendorName: selectedPO.vendorName,
                poCurrency: selectedPO.currency || "USD",
                poTotal: selectedPO.totalAmount,
                tenantId: user.tenantId,
                receivedBy: user.uid,
                receivedByName: user.displayName,
                lines: isAutoReceive
                    ? receiptLines.map(l => ({ ...l, receivedQty: l.orderedQty, qualityStatus: "PASSED" as const }))
                    : receiptLines,
                isAutoReceive,
                overallQualityStatus: "PASSED",
                packingSlipName,
                notes,
            }, user);
            setShowModal(false);
            await fetchData();
            showAlert("Success", "Goods receipt recorded and 3-way match triggered.");
        } catch (e: any) {
            await showError("Error", e.message || "Failed to record receipt.");
        } finally {
            setSubmitting(false);
        }
    };

    const handleScanSuccess = (data: any) => {
        setIsScanOpen(false);
        if (data.items && data.items.length > 0) {
            const updatedLines = receiptLines.map(line => {
                const match = data.items.find((item: any) =>
                    item.description.toLowerCase().includes(line.description.toLowerCase()) ||
                    line.description.toLowerCase().includes(item.description.toLowerCase())
                );
                if (match) return { ...line, receivedQty: match.quantity };
                return line;
            });
            setReceiptLines(updatedLines);
        }
        if (data.invoiceNumber) setPackingSlipName(data.invoiceNumber);
    };

    if (loading) return <div className="page-container"><Loader text="Initializing Receiving Logic..." /></div>;

    return (
        <div className="page-container" style={{ 
            background: 'var(--surface-2)',
            minHeight: '100vh',
            padding: '2rem'
        }}>
            {/* Header Area */}
            <div style={{ marginBottom: '2.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                <div>
                    <h1 style={{ fontSize: '1.75rem', fontWeight: 900, letterSpacing: '-0.02em', color: 'var(--text-primary)' }}>Receiving Console</h1>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.9375rem' }}>Audit-grade goods verification and 3-way matching.</p>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                    <div style={{ padding: '8px 16px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '8px', boxShadow: 'var(--shadow-sm)' }}>
                        <Activity size={16} color="#00AB55" />
                        <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#00AB55' }}>MATCH ENGINE: ACTIVE</span>
                    </div>
                </div>
            </div>

            {/* Premium KPI Strip */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem', marginBottom: '2rem' }}>
                {[
                    { label: "Scan Velocity", value: stats.receivedToday, sub: "Items today", icon: Zap, color: "#5C6AC4" },
                    { label: "Pipeline Depth", value: stats.pending, sub: "Open POs", icon: Layers, color: "#FFAB00" },
                    { label: "Audit Health", value: `${stats.matchRate}%`, sub: "Match Rate", icon: Shield, color: "#00AB55" },
                ].map((s, i) => (
                    <div key={i} style={{ 
                        background: 'var(--surface)', 
                        border: '1px solid var(--border)', 
                        borderRadius: '20px', 
                        padding: '1.5rem',
                        position: 'relative',
                        overflow: 'hidden',
                        boxShadow: 'var(--shadow-xl)'
                    }}>
                        <div style={{ position: 'absolute', top: '-10px', right: '-10px', opacity: 0.1 }}>
                            <s.icon size={80} color={s.color} />
                        </div>
                        <div style={{ color: 'var(--text-secondary)', fontSize: '0.65rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.5rem' }}>{s.label}</div>
                        <div style={{ fontSize: '1.75rem', fontWeight: 900, color: 'var(--text-primary)' }}>{s.value}</div>
                        <div style={{ fontSize: '0.75rem', color: s.color, fontWeight: 700 }}>{s.sub}</div>
                    </div>
                ))}
            </div>

            {/* Modern Tab Control */}
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', padding: '4px', background: 'var(--surface-2)', borderRadius: '12px', width: 'fit-content', border: '1px solid var(--border)' }}>
                {['pending', 'history'].map((t) => (
                    <button 
                        key={t}
                        onClick={() => setTab(t as any)}
                        style={{
                            padding: '8px 20px',
                            borderRadius: '10px',
                            border: 'none',
                            background: tab === t ? 'var(--brand)' : 'transparent',
                            color: tab === t ? 'white' : 'var(--text-secondary)',
                            fontWeight: 800,
                            fontSize: '0.8125rem',
                            cursor: 'pointer',
                            transition: 'all 0.2s'
                        }}
                    >
                        {t === 'pending' ? 'Open Shipments' : 'Audit History'}
                    </button>
                ))}
            </div>

            {/* List View */}
            <div style={{ 
                background: 'var(--surface)', 
                border: '1px solid var(--border)', 
                borderRadius: '24px',
                overflow: 'hidden',
                boxShadow: 'var(--shadow-xl)'
            }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ background: 'var(--surface-2)' }}>
                            <th style={{ textAlign: 'left', padding: '1rem 1.5rem', color: 'var(--text-secondary)', fontSize: '0.7rem', fontWeight: 900, textTransform: 'uppercase' }}>Purchase Order</th>
                            <th style={{ textAlign: 'left', padding: '1rem 1.5rem', color: 'var(--text-secondary)', fontSize: '0.7rem', fontWeight: 900, textTransform: 'uppercase' }}>Vendor</th>
                            <th style={{ textAlign: 'left', padding: '1rem 1.5rem', color: 'var(--text-secondary)', fontSize: '0.7rem', fontWeight: 900, textTransform: 'uppercase' }}>Amount</th>
                            <th style={{ textAlign: 'left', padding: '1rem 1.5rem', color: 'var(--text-secondary)', fontSize: '0.7rem', fontWeight: 900, textTransform: 'uppercase' }}>Status</th>
                            <th style={{ textAlign: 'left', padding: '1rem 1.5rem', color: 'var(--text-secondary)', fontSize: '0.7rem', fontWeight: 900, textTransform: 'uppercase' }}>3-Way Match</th>
                            <th style={{ textAlign: 'right', padding: '1rem 1.5rem' }}></th>
                        </tr>
                    </thead>
                    <tbody>
                        {(tab === 'pending' ? filteredPOs : receipts).map((item: any, i) => {
                            const po = tab === 'pending' ? item : pos.find(p => p.id === item.poId);
                            if (!po) return null;
                            const matchKey = getMatchStatus(po);
                            const match = MATCH_STYLES[matchKey];
                            
                            return (
                                <tr key={i} style={{ borderTop: '1px solid var(--border)', transition: 'background 0.2s' }} className="hover:bg-slate-50">
                                    <td style={{ padding: '1rem 1.5rem' }}>
                                        <div style={{ fontWeight: 800, color: 'var(--text-primary)', fontSize: '0.875rem' }}>{po.poNumber}</div>
                                        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{new Date(po.issuedAt).toLocaleDateString()}</div>
                                    </td>
                                    <td style={{ padding: '1rem 1.5rem', fontWeight: 700, color: 'var(--text-primary)' }}>{po.vendorName}</td>
                                    <td style={{ padding: '1rem 1.5rem', fontWeight: 800, color: 'var(--text-primary)' }}>{formatCurrency(po.totalAmount, po.currency || 'USD')}</td>
                                    <td style={{ padding: '1rem 1.5rem' }}>
                                        <span style={{ 
                                            padding: '4px 12px', 
                                            borderRadius: '6px', 
                                            fontSize: '0.7rem', 
                                            fontWeight: 800, 
                                            background: po.status === 'RECEIVED' ? 'rgba(0, 171, 85, 0.1)' : 'rgba(255, 171, 0, 0.1)',
                                            color: po.status === 'RECEIVED' ? '#00AB55' : '#FFAB00'
                                        }}>
                                            {po.status}
                                        </span>
                                    </td>
                                    <td style={{ padding: '1rem 1.5rem' }}>
                                        <div 
                                            onClick={() => { setSelectedPO(po); setShowMatchConsole(true); }}
                                            style={{ 
                                                display: 'inline-flex', 
                                                alignItems: 'center', 
                                                gap: '6px', 
                                                padding: '4px 12px', 
                                                borderRadius: '6px', 
                                                background: match.bg, 
                                                color: match.color,
                                                fontSize: '0.7rem',
                                                fontWeight: 800,
                                                cursor: 'pointer',
                                                border: `1px solid ${match.color}33`
                                            }}
                                        >
                                            <match.icon size={12} />
                                            {match.label}
                                        </div>
                                    </td>
                                    <td style={{ padding: '1rem 1.5rem', textAlign: 'right' }}>
                                        {tab === 'pending' ? (
                                            <button className="btn btn-primary btn-sm" onClick={() => openReceiveModal(po)}>Receive Items</button>
                                        ) : (
                                            <button className="btn btn-secondary btn-sm" onClick={() => { setSelectedPO(po); setShowMatchConsole(true); }}>View Pulse</button>
                                        )}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            {/* Receipt Drill-down in History */}
            {tab === "history" && receipts.length > 0 && (
                <div style={{ marginTop: '2rem' }}>
                    <h3 style={{ fontSize: '0.875rem', fontWeight: 900, color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '1rem', paddingLeft: '0.5rem' }}>Recorded Receipt Audit</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {receipts.map(r => (
                            <div key={r.id} style={{
                                background: 'var(--surface)',
                                border: '1px solid var(--border)',
                                borderRadius: '20px',
                                padding: '1.25rem',
                                boxShadow: 'var(--shadow-xl)'
                            }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', alignItems: 'center' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                        <div style={{ padding: '0.5rem', borderRadius: '10px', background: 'var(--brand-soft)', color: 'var(--brand)' }}>
                                            <Package size={18} />
                                        </div>
                                        <div>
                                            <div style={{ fontSize: '0.875rem', fontWeight: 800, color: 'var(--text-primary)' }}>{r.poNumber} · {r.id.slice(0, 8)}</div>
                                            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Received by {r.receivedByName} on {new Date(r.createdAt).toLocaleDateString()}</div>
                                        </div>
                                    </div>
                                    <div style={{
                                        padding: '0.4rem 0.8rem', borderRadius: '8px', 
                                        background: r.overallQualityStatus === 'PASSED' ? 'rgba(0, 171, 85, 0.1)' : 'rgba(255, 72, 66, 0.1)',
                                        color: r.overallQualityStatus === 'PASSED' ? '#00AB55' : '#FF4842',
                                        fontSize: '0.65rem', fontWeight: 900, textTransform: 'uppercase'
                                    }}>
                                        {r.overallQualityStatus}
                                    </div>
                                </div>
                                <div style={{ background: 'var(--surface-2)', borderRadius: '12px', overflow: 'hidden', border: '1px solid var(--border)' }}>
                                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                        <thead>
                                            <tr style={{ background: 'var(--surface-3)' }}>
                                                <th style={{ textAlign: 'left', padding: '0.75rem', fontSize: '0.65rem', color: 'var(--text-secondary)' }}>Description</th>
                                                <th style={{ textAlign: 'center', padding: '0.75rem', fontSize: '0.65rem', color: 'var(--text-secondary)' }}>Qty</th>
                                                <th style={{ textAlign: 'center', padding: '0.75rem', fontSize: '0.65rem', color: 'var(--text-secondary)' }}>Quality</th>
                                                <th style={{ textAlign: 'right', padding: '0.75rem', fontSize: '0.65rem', color: 'var(--text-secondary)' }}>Promote to Pulse</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {r.lines.map((l, idx) => (
                                                <tr key={idx} style={{ borderTop: '1px solid var(--border)' }}>
                                                    <td style={{ padding: '0.75rem', fontSize: '0.8125rem', color: 'var(--text-primary)' }}>{l.description}</td>
                                                    <td style={{ padding: '0.75rem', textAlign: 'center', fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text-primary)' }}>{l.receivedQty}</td>
                                                    <td style={{ padding: '0.75rem', textAlign: 'center' }}>
                                                        <span style={{ color: l.qualityStatus === 'PASSED' ? '#00AB55' : '#FF4842', fontSize: '0.7rem', fontWeight: 800 }}>{l.qualityStatus}</span>
                                                    </td>
                                                    <td style={{ padding: '0.75rem', textAlign: 'right' }}>
                                                        {l.isPromoted ? (
                                                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#5C6AC4', fontSize: '0.7rem', fontWeight: 900, justifyContent: 'flex-end' }}>
                                                                <CheckCircle size={14} /> PROMOTED
                                                            </div>
                                                        ) : (
                                                            <button 
                                                                onClick={() => { setReceiptToPromote(r); setLineIndexToPromote(idx); }}
                                                                style={{
                                                                    padding: '4px 12px', borderRadius: '6px', background: 'rgba(52, 211, 153, 0.1)', color: '#34d399',
                                                                    border: '1px solid rgba(52, 211, 153, 0.2)', fontSize: '0.65rem', fontWeight: 800, cursor: 'pointer'
                                                                }}
                                                            >
                                                                PROMOTE
                                                            </button>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Recording Modal Overhaul */}
            {showModal && selectedPO && (
                <div className="modal-backdrop" style={{ background: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal" style={{ maxWidth: 800, background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '32px', boxShadow: '0 20px 50px rgba(0,0,0,0.1)' }}>
                        <div className="modal-header" style={{ borderBottom: '1px solid var(--border)', padding: '1.5rem 2rem' }}>
                            <div>
                                <h2 style={{ fontSize: '1.25rem', fontWeight: 900, color: 'var(--text-primary)' }}>Log Delivery Pulse</h2>
                                <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>PO {selectedPO.poNumber} · {selectedPO.vendorName}</p>
                            </div>
                            <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', color: 'var(--text-primary)', fontSize: '1.5rem', cursor: 'pointer' }}>×</button>
                        </div>

                        <div className="modal-body" style={{ padding: '2rem' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '2rem' }}>
                                <div>
                                    <div style={{ marginBottom: '1.5rem' }}>
                                        <button className="btn btn-primary" style={{ width: '100%', gap: '10px', background: 'var(--brand)', height: '48px' }} onClick={() => setIsScanOpen(true)}>
                                            <Zap size={18} /> AI Scan Packing Slip
                                        </button>
                                    </div>

                                    <div style={{ background: 'var(--surface-2)', borderRadius: '16px', border: '1px solid var(--border)' }}>
                                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                            <thead>
                                                <tr>
                                                    <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.65rem', fontWeight: 900, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Item Pulse</th>
                                                    <th style={{ padding: '1rem', textAlign: 'center', fontSize: '0.65rem', fontWeight: 900, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Expected</th>
                                                    <th style={{ padding: '1rem', textAlign: 'center', fontSize: '0.65rem', fontWeight: 900, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Verified</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {receiptLines.map((line, i) => (
                                                    <tr key={i} style={{ borderTop: '1px solid var(--border)' }}>
                                                        <td style={{ padding: '1rem', color: 'var(--text-primary)', fontSize: '0.875rem', fontWeight: 600 }}>{line.description}</td>
                                                        <td style={{ padding: '1rem', textAlign: 'center', color: 'var(--text-secondary)', fontWeight: 700 }}>{line.orderedQty}</td>
                                                        <td style={{ padding: '1rem', textAlign: 'center' }}>
                                                            <input 
                                                                type="number" 
                                                                value={line.receivedQty} 
                                                                onChange={e => {
                                                                    const up = [...receiptLines];
                                                                    up[i].receivedQty = Number(e.target.value);
                                                                    setReceiptLines(up);
                                                                }}
                                                                style={{ width: '60px', background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text-primary)', padding: '4px 8px', borderRadius: '6px', textAlign: 'center', fontWeight: 800 }} 
                                                            />
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>

                                <div style={{ background: 'var(--surface-2)', borderRadius: '24px', padding: '1.5rem', border: '1px solid var(--border)' }}>
                                    <h4 style={{ fontSize: '0.75rem', fontWeight: 900, color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '1rem' }}>Audit Details</h4>
                                    
                                    <div style={{ marginBottom: '1.25rem' }}>
                                        <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.5rem' }}>Packing Slip Reference</label>
                                        <input 
                                            type="text" 
                                            placeholder="PO-SHP-2831" 
                                            value={packingSlipName}
                                            onChange={e => setPackingSlipName(e.target.value)}
                                            style={{ width: '100%', background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text-primary)', padding: '12px', borderRadius: '12px', fontSize: '0.875rem' }} 
                                        />
                                    </div>

                                    <div style={{ padding: '1rem', background: 'rgba(0, 171, 85, 0.05)', border: '1px solid rgba(0, 171, 85, 0.2)', borderRadius: '16px', marginBottom: '1.5rem' }}>
                                        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', color: '#00AB55' }}>
                                            <Shield size={16} />
                                            <span style={{ fontSize: '0.75rem', fontWeight: 800 }}>AUDIT COMPLIANT</span>
                                        </div>
                                        <p style={{ fontSize: '0.7rem', color: 'rgba(0, 171, 85, 0.6)', marginTop: '4px' }}>This entry will trigger an automated 3-way match across PO and Invoices.</p>
                                    </div>

                                    <button className="btn btn-primary" style={{ width: '100%', height: '50px', borderRadius: '16px', fontWeight: 800 }} onClick={handleSubmitReceipt} disabled={submitting}>
                                        {submitting ? 'RECORDING PULSE...' : 'RECORD & VERIFY'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Match Pulse Console Modal */}
            {showMatchConsole && selectedPO && (
                <div className="modal-backdrop" style={{ background: 'rgba(0,0,0,0.6)' }}>
                    <div style={{ maxWidth: '900px', width: '100%', margin: 'auto' }}>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem' }}>
                            <button onClick={() => setShowMatchConsole(false)} style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text-primary)', padding: '8px 20px', borderRadius: '12px', fontWeight: 800, cursor: 'pointer', boxShadow: 'var(--shadow-lg)' }}>Close Console</button>
                        </div>
                        <MatchingConsole po={selectedPO} receipts={receipts} invoices={invoices} />
                    </div>
                </div>
            )}

            <ReceiptCaptureModal
                isOpen={isScanOpen}
                onClose={() => setIsScanOpen(false)}
                onSuccess={handleScanSuccess}
            />

            {receiptToPromote && lineIndexToPromote !== null && (
                <PromoteToRegistryModal
                    receipt={receiptToPromote}
                    lineIndex={lineIndexToPromote}
                    onClose={() => { setReceiptToPromote(null); setLineIndexToPromote(null); }}
                    onPromoted={() => {
                        setReceiptToPromote(null);
                        setLineIndexToPromote(null);
                        fetchData();
                    }}
                />
            )}
        </div>
    );
}

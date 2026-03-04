"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { PurchaseOrder, ItemReceipt, GoodsReceiptLine, AppUser } from "@/types";
import { getPurchaseOrders } from "@/lib/purchaseOrders";
import { getReceipts, createReceipt, updateReceiptQuality, unreceiveItems } from "@/lib/receipts";
import { formatCurrency } from "@/lib/currencies";
import { useAuth } from "@/context/AuthContext";
import { useModal } from "@/context/ModalContext";

// ─── Status colours ───────────────────────────────────────────────────────────
const MATCH_STYLES: Record<string, { bg: string; color: string; label: string }> = {
    MATCHED: { bg: "#E9FBF0", color: "#00AB55", label: "3-Way Matched ✓" },
    PARTIAL: { bg: "#FFF7CD", color: "#B76E00", label: "Partial Match" },
    UNMATCHED: { bg: "#FFE7D9", color: "#B72136", label: "Not Matched" },
    PENDING: { bg: "#F4F6F8", color: "#637381", label: "Awaiting Receipt" },
};

const QUALITY_STYLES: Record<string, { bg: string; color: string }> = {
    PASSED: { bg: "#E9FBF0", color: "#00AB55" },
    FAILED: { bg: "#FFE7D9", color: "#B72136" },
    PARTIAL: { bg: "#FFF7CD", color: "#B76E00" },
    PENDING: { bg: "#F4F6F8", color: "#637381" },
};

function getMatchStatus(po: PurchaseOrder): string {
    if (!po.receiptIds || po.receiptIds.length === 0) return "PENDING";
    if (po.isMatched) return "MATCHED";
    return "PARTIAL";
}

export default function ReceivingPage() {
    const { user } = useAuth();
    const { showConfirm, showError, showAlert } = useModal();

    const [pos, setPos] = useState<PurchaseOrder[]>([]);
    const [receipts, setReceipts] = useState<ItemReceipt[]>([]);
    const [loading, setLoading] = useState(true);
    const [tab, setTab] = useState<"pending" | "history">("pending");
    const [search, setSearch] = useState("");

    // ── Receive Modal state ──────────────────────────────────────────────────
    const [selectedPO, setSelectedPO] = useState<PurchaseOrder | null>(null);
    const [showModal, setShowModal] = useState(false);
    const [isAutoReceive, setIsAutoReceive] = useState(false);
    const [receiptLines, setReceiptLines] = useState<GoodsReceiptLine[]>([]);
    const [packingSlipName, setPackingSlipName] = useState("");
    const [notes, setNotes] = useState("");
    const [submitting, setSubmitting] = useState(false);

    const fetchData = useCallback(async () => {
        if (!user) return;
        setLoading(true);
        const [poData, receiptData] = await Promise.all([
            getPurchaseOrders(user),
            getReceipts(user),
        ]);
        // Only show POs eligible for receiving
        setPos(poData.filter(po => !["CANCELLED", "CLOSED"].includes(po.status)));
        setReceipts(receiptData);
        setLoading(false);
    }, [user]);

    useEffect(() => { fetchData(); }, [fetchData]);

    // ── Stats ────────────────────────────────────────────────────────────────
    const stats = useMemo(() => {
        const today = new Date().toDateString();
        const receivedToday = receipts.filter(r => new Date(r.createdAt).toDateString() === today).length;
        const pending = pos.filter(po => !po.receiptIds || po.receiptIds.length === 0).length;
        const partial = pos.filter(po => po.status === "RECEIVED" && !po.isMatched).length;
        const matched = pos.filter(po => po.isMatched).length;
        const matchRate = pos.length > 0 ? Math.round((matched / pos.length) * 100) : 0;
        return { receivedToday, pending, partial, matchRate };
    }, [pos, receipts]);

    // ── Filter POs ───────────────────────────────────────────────────────────
    const filteredPOs = useMemo(() => {
        const q = search.toLowerCase();
        return pos.filter(po =>
            po.poNumber.toLowerCase().includes(q) ||
            po.vendorName.toLowerCase().includes(q) ||
            po.department.toLowerCase().includes(q)
        );
    }, [pos, search]);

    // ── Open Receive Modal ───────────────────────────────────────────────────
    const openReceiveModal = (po: PurchaseOrder) => {
        setSelectedPO(po);
        setIsAutoReceive(false);
        setPackingSlipName("");
        setNotes("");
        // Pre-populate lines from PO items
        setReceiptLines(po.items.map((item, i) => ({
            itemIndex: i,
            description: item.description,
            orderedQty: item.quantity,
            receivedQty: item.quantity,        // default to full quantity
            unitPrice: item.unitPrice,
            qualityStatus: "PASSED" as const,
        })));
        setShowModal(true);
    };

    // ── Submit receipt ───────────────────────────────────────────────────────
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
            });
            setShowModal(false);
            await fetchData();
        } catch (e: any) {
            await showError("Error", e.message || "Failed to record receipt.");
        } finally {
            setSubmitting(false);
        }
    };

    // ── Unreceive ────────────────────────────────────────────────────────────
    const handleUnreceive = async (receipt: ItemReceipt) => {
        const confirmed = await showConfirm("Confirm Unreceive",
            `Are you sure you want to un-receive this shipment from ${receipt.poVendorName || "vendor"}? This will revert the PO status.`);
        if (!confirmed) return;
        try {
            await unreceiveItems(user!.tenantId, receipt.id);
            await fetchData();
        } catch (e: any) {
            await showError("Error", e.message || "Unreceive failed.");
        }
    };

    // ── QC Pass / Fail ───────────────────────────────────────────────────────
    const handleQC = async (receipt: ItemReceipt, status: "PASSED" | "FAILED") => {
        const confirmed = await showConfirm(
            `Mark as ${status}`,
            `Mark all items in this receipt as ${status}?`
        );
        if (!confirmed) return;
        try {
            await updateReceiptQuality(user!.tenantId, receipt.id, status);
            await fetchData();
        } catch (e: any) {
            await showError("Error", e.message || "Failed to update quality status.");
        }
    };

    if (loading) return (
        <div className="page-container">
            <div style={{ textAlign: "center", padding: "4rem", color: "#637381" }}>Loading receiving...</div>
        </div>
    );

    return (
        <div className="page-container">
            {/* ── Header ─────────────────────────────────────────────────── */}
            <div className="page-header">
                <div>
                    <h1 className="page-title">Receiving</h1>
                    <p className="page-subtitle">Record goods receipts, verify quality, and close purchase orders</p>
                </div>
            </div>

            {/* ── Stats Strip ────────────────────────────────────────────── */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "1rem", marginBottom: "1.5rem" }}>
                {[
                    { label: "Received Today", value: stats.receivedToday, color: "#5C6AC4", bg: "#E8EAF6", icon: "📦" },
                    { label: "Awaiting Receipt", value: stats.pending, color: "#B76E00", bg: "#FFF7CD", icon: "⏳" },
                    { label: "Partially Received", value: stats.partial, color: "#006098", bg: "#CAFDF5", icon: "📋" },
                    { label: "3-Way Match Rate", value: `${stats.matchRate}%`, color: "#00AB55", bg: "#E9FBF0", icon: "✅" },
                ].map(s => (
                    <div key={s.label} style={{ background: "white", border: "1px solid #DFE3E8", borderRadius: 12, padding: "1.25rem" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.75rem" }}>
                            <span style={{ fontSize: "0.75rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", color: "#637381" }}>{s.label}</span>
                            <div style={{ width: 32, height: 32, background: s.bg, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center" }}>{s.icon}</div>
                        </div>
                        <div style={{ fontSize: "1.6rem", fontWeight: 800, color: s.color }}>{s.value}</div>
                    </div>
                ))}
            </div>

            {/* ── Tab Bar ────────────────────────────────────────────────── */}
            <div style={{ display: "flex", gap: "0.25rem", background: "#F4F6F8", padding: "0.25rem", borderRadius: 10, width: "fit-content", marginBottom: "1rem" }}>
                {(["pending", "history"] as const).map(t => (
                    <button key={t} onClick={() => setTab(t)} style={{
                        padding: "0.5rem 1.25rem", borderRadius: 8, border: "none", fontWeight: 600, fontSize: "0.875rem", cursor: "pointer", transition: "all 0.15s",
                        background: tab === t ? "white" : "transparent",
                        color: tab === t ? "#5C6AC4" : "#637381",
                        boxShadow: tab === t ? "0 1px 3px rgba(0,0,0,0.1)" : "none",
                    }}>
                        {t === "pending" ? "Open POs" : "Receipt History"}
                    </button>
                ))}
            </div>

            {/* ── Search ─────────────────────────────────────────────────── */}
            {tab === "pending" && (
                <div style={{ position: "relative", maxWidth: 380, marginBottom: "1rem" }}>
                    <span style={{ position: "absolute", left: "0.75rem", top: "50%", transform: "translateY(-50%)", color: "#919EAB" }}>🔍</span>
                    <input type="text" placeholder="Search PO#, vendor, department..."
                        value={search} onChange={e => setSearch(e.target.value)}
                        className="form-input" style={{ paddingLeft: "2.25rem" }} />
                </div>
            )}

            {/* ══════════════════════════════════════════════════════════════
                TAB: Open POs Awaiting Receipt
            ══════════════════════════════════════════════════════════════ */}
            {tab === "pending" && (
                filteredPOs.length === 0 ? (
                    <div className="card">
                        <div className="empty-state">
                            <div className="empty-state-icon">📦</div>
                            <h3>No POs awaiting receipt</h3>
                            <p>All purchase orders have been received or are cancelled.</p>
                        </div>
                    </div>
                ) : (
                    <div className="table-wrapper">
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>PO Number</th>
                                    <th>Vendor</th>
                                    <th>Department</th>
                                    <th>Items</th>
                                    <th>Expected By</th>
                                    <th style={{ textAlign: "right" }}>Total Value</th>
                                    <th>Status</th>
                                    <th>3-Way Match</th>
                                    <th></th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredPOs.map(po => {
                                    const matchKey = getMatchStatus(po);
                                    const match = MATCH_STYLES[matchKey];
                                    const poReceipts = receipts.filter(r => r.poId === po.id);
                                    const canReceive = !["CLOSED", "CANCELLED"].includes(po.status);
                                    return (
                                        <tr key={po.id}>
                                            <td>
                                                <div style={{ fontWeight: 700, color: "#5C6AC4", fontFamily: "monospace" }}>{po.poNumber}</div>
                                                <div style={{ fontSize: "0.75rem", color: "#919EAB" }}>
                                                    {new Date(po.issuedAt).toLocaleDateString()}
                                                </div>
                                            </td>
                                            <td style={{ fontWeight: 600 }}>{po.vendorName}</td>
                                            <td>
                                                <span style={{ fontSize: "0.8rem", background: "#E8EAF6", color: "#5C6AC4", padding: "2px 8px", borderRadius: 6, fontWeight: 600 }}>
                                                    {po.department}
                                                </span>
                                            </td>
                                            <td style={{ color: "#637381" }}>{po.items.length} line{po.items.length !== 1 ? "s" : ""}</td>
                                            <td style={{ color: "#637381", fontSize: "0.875rem" }}>
                                                {po.expectedDeliveryDate
                                                    ? new Date(po.expectedDeliveryDate).toLocaleDateString()
                                                    : "—"}
                                            </td>
                                            <td style={{ textAlign: "right", fontWeight: 700 }}>
                                                {formatCurrency(po.totalAmount, po.currency || "USD")}
                                            </td>
                                            <td>
                                                <span style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "2px 10px", borderRadius: 9999, fontSize: "0.75rem", fontWeight: 700, background: po.status === "RECEIVED" ? "#E9FBF0" : "#FFF7CD", color: po.status === "RECEIVED" ? "#00AB55" : "#B76E00" }}>
                                                    ● {po.status}
                                                </span>
                                            </td>
                                            <td>
                                                <span style={{ fontSize: "0.75rem", fontWeight: 700, padding: "2px 10px", borderRadius: 9999, background: match.bg, color: match.color }}>
                                                    {match.label}
                                                </span>
                                            </td>
                                            <td>
                                                <div style={{ display: "flex", gap: "0.5rem" }}>
                                                    {canReceive && (
                                                        <button
                                                            className="btn btn-primary btn-sm"
                                                            onClick={() => openReceiveModal(po)}>
                                                            {poReceipts.length > 0 ? "Receive More" : "Receive"}
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )
            )}

            {/* ══════════════════════════════════════════════════════════════
                TAB: Receipt History
            ══════════════════════════════════════════════════════════════ */}
            {tab === "history" && (
                receipts.length === 0 ? (
                    <div className="card">
                        <div className="empty-state">
                            <div className="empty-state-icon">📋</div>
                            <h3>No receipts recorded yet</h3>
                            <p>Receipts will appear here once goods are received against a PO.</p>
                        </div>
                    </div>
                ) : (
                    <div className="table-wrapper">
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Date</th>
                                    <th>PO Number</th>
                                    <th>Vendor</th>
                                    <th>Received By</th>
                                    <th>Lines</th>
                                    <th>Type</th>
                                    <th>Quality</th>
                                    <th>Packing Slip</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {[...receipts]
                                    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                                    .map(receipt => {
                                        const qStyle = QUALITY_STYLES[receipt.overallQualityStatus] || QUALITY_STYLES.PENDING;
                                        const createdAt = new Date(receipt.createdAt);
                                        const withinWindow = (Date.now() - createdAt.getTime()) / 3_600_000 < 24;
                                        return (
                                            <tr key={receipt.id}>
                                                <td style={{ color: "#637381", fontSize: "0.8125rem" }}>
                                                    {createdAt.toLocaleDateString()}{" "}
                                                    <span style={{ color: "#919EAB", fontSize: "0.75rem" }}>
                                                        {createdAt.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                                                    </span>
                                                </td>
                                                <td style={{ fontWeight: 700, color: "#5C6AC4", fontFamily: "monospace" }}>
                                                    {receipt.poNumber || receipt.poId.slice(-6)}
                                                </td>
                                                <td style={{ fontWeight: 600 }}>{receipt.poVendorName || "—"}</td>
                                                <td style={{ color: "#637381" }}>{receipt.receivedByName}</td>
                                                <td style={{ color: "#637381" }}>{receipt.lines?.length ?? 0} line(s)</td>
                                                <td>
                                                    {receipt.isAutoReceive
                                                        ? <span style={{ fontSize: "0.75rem", background: "#CAFDF5", color: "#006098", padding: "2px 8px", borderRadius: 9999, fontWeight: 700 }}>Auto-Receive</span>
                                                        : <span style={{ fontSize: "0.75rem", background: "#E8EAF6", color: "#5C6AC4", padding: "2px 8px", borderRadius: 9999, fontWeight: 700 }}>Physical</span>
                                                    }
                                                </td>
                                                <td>
                                                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                                                        <span style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "2px 10px", borderRadius: 9999, fontSize: "0.75rem", fontWeight: 700, background: qStyle.bg, color: qStyle.color }}>
                                                            ● {receipt.overallQualityStatus}
                                                        </span>
                                                        {receipt.overallQualityStatus === "PASSED" ? null : (
                                                            <button onClick={() => handleQC(receipt, "PASSED")} style={{ fontSize: "0.7rem", padding: "2px 6px", borderRadius: 4, border: "1px solid #00AB55", color: "#00AB55", background: "none", cursor: "pointer" }}>Pass</button>
                                                        )}
                                                        {receipt.overallQualityStatus === "FAILED" ? null : (
                                                            <button onClick={() => handleQC(receipt, "FAILED")} style={{ fontSize: "0.7rem", padding: "2px 6px", borderRadius: 4, border: "1px solid #B72136", color: "#B72136", background: "none", cursor: "pointer" }}>Fail</button>
                                                        )}
                                                    </div>
                                                </td>
                                                <td>
                                                    {receipt.packingSlipUrl
                                                        ? <a href={receipt.packingSlipUrl} target="_blank" rel="noreferrer" style={{ color: "#5C6AC4", fontWeight: 600, fontSize: "0.8rem" }}>📎 View</a>
                                                        : receipt.packingSlipName
                                                            ? <span style={{ color: "#637381", fontSize: "0.8rem" }}>📎 {receipt.packingSlipName}</span>
                                                            : <span style={{ color: "#DFE3E8" }}>—</span>
                                                    }
                                                </td>
                                                <td>
                                                    {withinWindow && (
                                                        <button
                                                            onClick={() => handleUnreceive(receipt)}
                                                            style={{ fontSize: "0.75rem", padding: "3px 10px", borderRadius: 6, border: "1px solid #DFE3E8", color: "#637381", background: "white", cursor: "pointer" }}>
                                                            Unreceive
                                                        </button>
                                                    )}
                                                </td>
                                            </tr>
                                        );
                                    })}
                            </tbody>
                        </table>
                    </div>
                )
            )}

            {/* ══════════════════════════════════════════════════════════════
                RECEIVE MODAL
            ══════════════════════════════════════════════════════════════ */}
            {showModal && selectedPO && (
                <div className="modal-backdrop">
                    <div className="modal" style={{ maxWidth: 720, width: "95%" }}>
                        {/* Header */}
                        <div className="modal-header">
                            <div>
                                <h2 className="modal-title">Record Receipt — {selectedPO.poNumber}</h2>
                                <p style={{ fontSize: "0.875rem", color: "#637381", marginTop: 2 }}>
                                    {selectedPO.vendorName} · {formatCurrency(selectedPO.totalAmount, selectedPO.currency || "USD")}
                                </p>
                            </div>
                            <button onClick={() => setShowModal(false)} style={{ background: "none", border: "none", fontSize: "1.5rem", color: "#637381", cursor: "pointer" }}>×</button>
                        </div>

                        <div className="modal-body">
                            {/* Auto-receive toggle */}
                            <div style={{ display: "flex", alignItems: "flex-start", gap: "1rem", background: "#F4F6F8", borderRadius: 10, padding: "1rem", marginBottom: "1.25rem" }}>
                                <input
                                    type="checkbox"
                                    id="auto-receive"
                                    checked={isAutoReceive}
                                    onChange={e => setIsAutoReceive(e.target.checked)}
                                    style={{ marginTop: 2, accentColor: "#5C6AC4", width: 16, height: 16 }}
                                />
                                <div>
                                    <label htmlFor="auto-receive" style={{ fontWeight: 700, fontSize: "0.9rem", cursor: "pointer" }}>Auto-Receive (Services / Digital Goods)</label>
                                    <p style={{ fontSize: "0.8rem", color: "#637381", marginTop: 2 }}>
                                        Skip physical inspection. All items will be marked as fully received and PASSED.
                                        Use for software licenses, subscriptions, and services.
                                    </p>
                                </div>
                            </div>

                            {/* Line Items Table */}
                            {!isAutoReceive && (
                                <div style={{ marginBottom: "1.25rem" }}>
                                    <h4 style={{ fontWeight: 700, marginBottom: "0.75rem", fontSize: "0.9rem", color: "#212B36" }}>Line Items</h4>
                                    <div style={{ border: "1px solid #DFE3E8", borderRadius: 10, overflow: "hidden" }}>
                                        <table style={{ width: "100%", borderCollapse: "collapse" }}>
                                            <thead>
                                                <tr style={{ background: "#F4F6F8" }}>
                                                    <th style={{ padding: "0.75rem 1rem", fontSize: "0.75rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: "#637381", textAlign: "left" }}>Description</th>
                                                    <th style={{ padding: "0.75rem 1rem", fontSize: "0.75rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: "#637381", textAlign: "center" }}>Ordered</th>
                                                    <th style={{ padding: "0.75rem 1rem", fontSize: "0.75rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: "#637381", textAlign: "center" }}>Received</th>
                                                    <th style={{ padding: "0.75rem 1rem", fontSize: "0.75rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: "#637381", textAlign: "center" }}>Quality</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {receiptLines.map((line, i) => (
                                                    <tr key={i} style={{ borderTop: "1px solid #DFE3E8" }}>
                                                        <td style={{ padding: "0.75rem 1rem", fontSize: "0.875rem" }}>{line.description}</td>
                                                        <td style={{ padding: "0.75rem 1rem", textAlign: "center", color: "#637381" }}>{line.orderedQty}</td>
                                                        <td style={{ padding: "0.75rem 1rem", textAlign: "center" }}>
                                                            <input
                                                                type="number"
                                                                min={0}
                                                                max={line.orderedQty}
                                                                value={line.receivedQty}
                                                                onChange={e => {
                                                                    const updated = [...receiptLines];
                                                                    updated[i] = { ...updated[i], receivedQty: Math.max(0, Math.min(line.orderedQty, Number(e.target.value))) };
                                                                    setReceiptLines(updated);
                                                                }}
                                                                style={{ width: 64, textAlign: "center", padding: "4px 8px", border: "1px solid #DFE3E8", borderRadius: 6, fontSize: "0.875rem" }}
                                                            />
                                                        </td>
                                                        <td style={{ padding: "0.75rem 1rem", textAlign: "center" }}>
                                                            <div style={{ display: "flex", gap: "0.25rem", justifyContent: "center" }}>
                                                                {(["PASSED", "FAILED"] as const).map(st => (
                                                                    <button
                                                                        key={st}
                                                                        onClick={() => {
                                                                            const updated = [...receiptLines];
                                                                            updated[i] = { ...updated[i], qualityStatus: st };
                                                                            setReceiptLines(updated);
                                                                        }}
                                                                        style={{
                                                                            padding: "3px 10px", borderRadius: 6, fontSize: "0.75rem", fontWeight: 700, cursor: "pointer",
                                                                            border: line.qualityStatus === st ? "none" : "1px solid #DFE3E8",
                                                                            background: line.qualityStatus === st ? (st === "PASSED" ? "#E9FBF0" : "#FFE7D9") : "white",
                                                                            color: line.qualityStatus === st ? (st === "PASSED" ? "#00AB55" : "#B72136") : "#637381",
                                                                        }}
                                                                    >
                                                                        {st === "PASSED" ? "✓ Pass" : "✗ Fail"}
                                                                    </button>
                                                                ))}
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}

                            {/* Auto-receive confirmation lines */}
                            {isAutoReceive && (
                                <div style={{ marginBottom: "1.25rem", background: "#E9FBF0", borderRadius: 10, padding: "1rem" }}>
                                    <p style={{ fontWeight: 600, color: "#00AB55", fontSize: "0.9rem" }}>✅ Auto-Receive Active</p>
                                    <p style={{ fontSize: "0.8rem", color: "#637381", marginTop: 4 }}>
                                        All {selectedPO.items.length} line(s) will be marked as fully received and quality PASSED.
                                    </p>
                                </div>
                            )}

                            {/* Packing Slip */}
                            <div style={{ marginBottom: "1rem" }}>
                                <label className="form-label">Packing Slip / Delivery Note (optional)</label>
                                <div style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
                                    <label style={{
                                        display: "flex", alignItems: "center", gap: "0.5rem", padding: "0.5rem 1rem",
                                        border: "1px dashed #DFE3E8", borderRadius: 8, cursor: "pointer",
                                        fontSize: "0.875rem", color: "#637381", background: "#F9FAFB"
                                    }}>
                                        📎 Upload Packing Slip
                                        <input
                                            type="file" accept="image/*,.pdf" style={{ display: "none" }}
                                            onChange={e => {
                                                const file = e.target.files?.[0];
                                                if (file) setPackingSlipName(file.name);
                                            }}
                                        />
                                    </label>
                                    {packingSlipName && (
                                        <span style={{ fontSize: "0.8rem", color: "#00AB55", fontWeight: 600 }}>✓ {packingSlipName}</span>
                                    )}
                                </div>
                            </div>

                            {/* Notes */}
                            <div>
                                <label className="form-label">Notes (optional)</label>
                                <textarea
                                    rows={2}
                                    className="form-input"
                                    placeholder="Condition of goods, discrepancies, carrier info..."
                                    value={notes}
                                    onChange={e => setNotes(e.target.value)}
                                    style={{ resize: "vertical" }}
                                />
                            </div>
                        </div>

                        <div className="modal-footer">
                            <button className="btn btn-secondary" onClick={() => setShowModal(false)} disabled={submitting}>Cancel</button>
                            <button className="btn btn-primary" onClick={handleSubmitReceipt} disabled={submitting}>
                                {submitting ? "Recording..." : "✓ Record Receipt"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

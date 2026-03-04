"use client";

import { useState, useEffect } from "react";
import { RFP, RFPStatus, Quotation, Requisition, Vendor } from "@/types";
import { getRFPs, getRFPQuotes, awardBid, getRFPSubmissionLink } from "@/lib/sourcing";
import { getRequisitions } from "@/lib/requisitions";
import { getVendors } from "@/lib/vendors";
import { useAuth } from "@/context/AuthContext";
import BidComparisonModal from "@/components/sourcing/BidComparisonModal";
import CreateRFPModal from "@/components/sourcing/CreateRFPModal";
import styles from "@/components/layout/Layout.module.css";
import tableStyles from "@/components/assets/Assets.module.css";
import { useRouter } from "next/navigation";

export default function SourcingPage() {
    const { user } = useAuth();
    const router = useRouter();
    const [rfps, setRFPs] = useState<RFP[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedRFP, setSelectedRFP] = useState<RFP | null>(null);
    const [bids, setBids] = useState<Quotation[]>([]);

    // For creating new sourcing from this page
    const [approvedReqs, setApprovedReqs] = useState<Requisition[]>([]);
    const [vendors, setVendors] = useState<Vendor[]>([]);
    const [showSelectReq, setShowSelectReq] = useState(false);
    const [selectedReqForNewRFP, setSelectedReqForNewRFP] = useState<Requisition | null>(null);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        if (!user) return;
        setLoading(true);
        try {
            const [rfpData, reqData, vendorData] = await Promise.all([
                getRFPs(user.tenantId),
                getRequisitions(user),
                getVendors(user.tenantId)
            ]);
            setRFPs(rfpData.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
            setApprovedReqs(reqData.filter(r => r.status === 'APPROVED'));
            setVendors(vendorData);
        } catch (error) {
            console.error("Error loading sourcing data:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleAward = async (bidId: string) => {
        if (!user || !selectedRFP) return;
        try {
            await awardBid(user.tenantId, selectedRFP.id!, bidId, user);
            alert("Bid awarded successfully! PO has been generated.");
            setSelectedRFP(null);
            loadData();
        } catch (error) {
            alert("Failed to award bid.");
        }
    };

    const handleViewBids = async (rfp: RFP) => {
        if (!user) return;
        const data = await getRFPQuotes(user.tenantId, rfp.id!);
        setBids(data);
        setSelectedRFP(rfp);
    };

    const getStatusColor = (status: RFPStatus) => {
        switch (status) {
            case 'OPEN': return '#dcfce7';
            case 'UNDER_REVIEW': return '#fef3c7';
            case 'AWARDED': return '#dbeafe';
            case 'CANCELLED': return '#f1f5f9';
            default: return '#f1f5f9';
        }
    };

    const getStatusTextColor = (status: RFPStatus) => {
        switch (status) {
            case 'OPEN': return '#15803d';
            case 'UNDER_REVIEW': return '#b45309';
            case 'AWARDED': return '#1d4ed8';
            case 'CANCELLED': return '#475569';
            default: return '#475569';
        }
    };

    if (loading) return <div style={{ padding: '2rem' }}>Loading sourcing events...</div>;

    return (
        <div className={styles.pageContainer}>
            <div className={styles.pageHeader}>
                <div>
                    <h1 className={styles.pageTitle}>Strategic Sourcing</h1>
                    <p className={styles.pageSubtitle}>Request proposals and evaluate vendor bids side-by-side.</p>
                </div>
                <button className={styles.primaryButton} onClick={() => setShowSelectReq(true)}>
                    <span>⚖️</span> New sourcing Event
                </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '2rem' }}>
                <div className={tableStyles.container}>
                    <div className={tableStyles.tableWrapper}>
                        <table className={tableStyles.table}>
                            <thead>
                                <tr>
                                    <th>RFP Title</th>
                                    <th>Status</th>
                                    <th>Deadline</th>
                                    <th>Invited</th>
                                    <th>Bids</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {rfps.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className={tableStyles.empty}>No active sourcing events.</td>
                                    </tr>
                                ) : (
                                    rfps.map((rfp) => (
                                        <tr key={rfp.id} className={tableStyles.row}>
                                            <td>
                                                <div style={{ fontWeight: 600 }}>{rfp.title}</div>
                                                <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{rfp.department}</div>
                                            </td>
                                            <td>
                                                <span style={{
                                                    padding: '0.25rem 0.5rem',
                                                    borderRadius: '4px',
                                                    fontSize: '0.75rem',
                                                    fontWeight: 700,
                                                    background: getStatusColor(rfp.status),
                                                    color: getStatusTextColor(rfp.status)
                                                }}>
                                                    {rfp.status}
                                                </span>
                                            </td>
                                            <td>{new Date(rfp.deadline).toLocaleDateString()}</td>
                                            <td>{rfp.invitedVendors?.length || 0} Vendors</td>
                                            <td><span style={{ fontWeight: 600 }}>0</span></td>
                                            <td>
                                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                    <button
                                                        className="btn"
                                                        style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem' }}
                                                        onClick={() => handleViewBids(rfp)}
                                                    >
                                                        View bids
                                                    </button>
                                                    <button
                                                        className="btn"
                                                        style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem', background: '#f8fafc' }}
                                                        onClick={() => {
                                                            if (!user) return;
                                                            const link = getRFPSubmissionLink(user.tenantId, rfp.id!);
                                                            navigator.clipboard.writeText(link);
                                                            alert("Bid link copied to clipboard!");
                                                        }}
                                                        title="Copy Public Submission Link"
                                                    >
                                                        🔗 Link
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Info Guide */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <div className="card" style={{ background: '#f8fafc', border: '1px solid #e2e8f0' }}>
                        <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '1rem' }}>📋 How it works</h3>
                        <div style={{ fontSize: '0.875rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                <span style={{ fontWeight: 700, color: 'var(--primary)' }}>1</span>
                                <span>Select an <strong>Approved Requisition</strong> to start a sourcing event.</span>
                            </div>
                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                <span style={{ fontWeight: 700, color: 'var(--primary)' }}>2</span>
                                <span>Invite multiple vendors to submit their <strong>blind bids</strong>.</span>
                            </div>
                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                <span style={{ fontWeight: 700, color: 'var(--primary)' }}>3</span>
                                <span>Compare prices and terms side-by-side once the deadline passes.</span>
                            </div>
                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                <span style={{ fontWeight: 700, color: 'var(--primary)' }}>4</span>
                                <span>Award the bid to the best vendor and <strong>auto-generate a PO</strong>.</span>
                            </div>
                        </div>
                    </div>

                    <div className="card" style={{ background: '#eff6ff', border: '1px solid #dbeafe' }}>
                        <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>💡</div>
                        <div style={{ fontWeight: 600, color: '#1e40af' }}>Pro Tip</div>
                        <p style={{ fontSize: '0.8rem', color: '#1e40af', marginTop: '0.25rem' }}>
                            Strategic sourcing is best used for high-value items where competitive pricing can save significantly on budget.
                        </p>
                    </div>
                </div>
            </div>

            {/* Select Requisition Modal */}
            {showSelectReq && (
                <div style={{ position: 'fixed', inset: 0, zIndex: 100, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div className="card" style={{ width: '500px', maxWidth: '95%' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                            <h2 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Select Requisition</h2>
                            <button onClick={() => setShowSelectReq(false)} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer' }}>&times;</button>
                        </div>
                        <div style={{ maxHeight: '300px', overflowY: 'auto', border: '1px solid #e2e8f0', borderRadius: '8px' }}>
                            {approvedReqs.length === 0 ? (
                                <div style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>No approved requisitions available.</div>
                            ) : (
                                approvedReqs.map(req => (
                                    <div
                                        key={req.id}
                                        onClick={() => {
                                            setSelectedReqForNewRFP(req);
                                            setShowSelectReq(false);
                                        }}
                                        style={{ padding: '1rem', borderBottom: '1px solid #f1f5f9', cursor: 'pointer', transition: 'background 0.2s' }}
                                        onMouseEnter={e => e.currentTarget.style.backgroundColor = '#f8fafc'}
                                        onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
                                    >
                                        <div style={{ fontWeight: 600 }}>{req.items[0]?.description}</div>
                                        <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Dept: {req.department} | Total: {req.totalAmount} {req.currency}</div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* RFP Creation Modal */}
            {selectedReqForNewRFP && (
                <CreateRFPModal
                    requisition={selectedReqForNewRFP}
                    vendors={vendors}
                    onClose={() => setSelectedReqForNewRFP(null)}
                    onCreated={() => {
                        setSelectedReqForNewRFP(null);
                        loadData();
                    }}
                />
            )}

            {selectedRFP && (
                <BidComparisonModal
                    rfp={selectedRFP}
                    bids={bids}
                    onClose={() => setSelectedRFP(null)}
                    onAward={handleAward}
                />
            )}
        </div>
    );
}

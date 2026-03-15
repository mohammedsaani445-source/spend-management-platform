"use client";

import { useState, useEffect } from "react";
import { PortalSession, PurchaseOrder, Invoice, Tender, Bid } from "@/types";
import { getPurchaseOrders, logDeliveryEvent } from "@/lib/purchaseOrders";
import { getInvoices } from "@/lib/invoices";
import { db, DB_PREFIX } from "@/lib/firebase";
import { ref, onValue } from "firebase/database";
import styles from "./Portal.module.css";
import { useScrollLock } from "@/hooks/useScrollLock";
import { Gavel, Clock, ShieldCheck, ShieldAlert, CheckCircle2, ChevronRight, Info, Package } from "lucide-react";
import SubmitBidModal from "./SubmitBidModal";
import PODetailsModal from "./PODetailsModal";

interface VendorDashboardProps {
    session: PortalSession;
}

export default function VendorDashboard({ session }: VendorDashboardProps) {
    const [pos, setPOs] = useState<PurchaseOrder[]>([]);
    const [invoices, setInvoices] = useState<Invoice[]>([]);
    const [tenders, setTenders] = useState<Tender[]>([]);
    const [vendorBids, setVendorBids] = useState<Bid[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedPO, setSelectedPO] = useState<PurchaseOrder | null>(null);
    const [selectedTender, setSelectedTender] = useState<Tender | null>(null);
    const [showBidModal, setShowBidModal] = useState(false);

    useScrollLock(!!selectedPO || !!selectedTender || showBidModal);

    useEffect(() => {
        if (!session.tenantId) return;

        loadStaticData();

        // Real-time listeners
        const tendersRef = ref(db, `${DB_PREFIX}/tenants/${session.tenantId}/tenders`);
        const bidsRef = ref(db, `${DB_PREFIX}/tenants/${session.tenantId}/bids`);
        const posRef = ref(db, `${DB_PREFIX}/tenants/${session.tenantId}/purchaseOrders`);

        const unsubscribeTenders = onValue(tendersRef, (snapshot) => {
            if (snapshot.exists()) {
                const data = snapshot.val();
                setTenders(Object.values(data) as Tender[]);
            } else {
                setTenders([]);
            }
        });

        const unsubscribeBids = onValue(bidsRef, (snapshot) => {
            if (snapshot.exists()) {
                const data = snapshot.val();
                const allBids = Object.values(data) as Bid[];
                // Filter bids only for THIS vendor
                setVendorBids(allBids.filter(b => b.vendorId === session.vendorId));
            } else {
                setVendorBids([]);
            }
        });

        const unsubscribePOs = onValue(posRef, (snapshot) => {
            if (snapshot.exists()) {
                const data = snapshot.val();
                const allPOs = Object.values(data) as PurchaseOrder[];
                // Filter POs only for THIS vendor
                setPOs(allPOs.filter(p => p.vendorId === session.vendorId));
            } else {
                setPOs([]);
            }
        });

        return () => {
            unsubscribeTenders();
            unsubscribeBids();
            unsubscribePOs();
        };
    }, [session.vendorId, session.tenantId]);

    const loadStaticData = async () => {
        setLoading(true);
        try {
            const allInvoices = await getInvoices({ tenantId: session.tenantId, role: 'APPROVER', department: 'VendorPortal' } as any);
            setInvoices(allInvoices.filter((i: Invoice) => i.vendorId === session.vendorId));
        } catch (error) {
            console.error("Failed to load invoices:", error);
        } finally {
            setLoading(false);
        }
    };

    const outstandingInvoices = invoices
        .filter(i => i.status !== 'PAID')
        .reduce((sum, inv) => sum + inv.amount, 0);

    const activeTenders = tenders.filter(t => t.status === 'OPEN');
    const hasSubmittedBid = (tenderId: string) => vendorBids.some(b => b.tenderId === tenderId);

    if (loading) return (
        <div className={styles.portalWrapper} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '1rem', color: '#60a5fa' }}>SUPPLIER NEXUS</div>
                <div style={{ color: '#94a3b8' }}>Initializing secure dashboard...</div>
            </div>
        </div>
    );

    return (
        <div className={styles.portalWrapper}>
            <header className={styles.portalHeader}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div className={styles.brand}>Coral Enterprise</div>
                    <div style={{ width: '1px', height: '20px', background: 'rgba(255,255,255,0.2)' }}></div>
                    <div style={{ fontSize: '0.9rem', color: '#94a3b8', fontWeight: 500 }}>Supplier Nexus</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '0.9rem', fontWeight: 600 }}>{session.vendorName}</div>
                    <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Verified Core Partner</div>
                </div>
            </header>

            <div className={styles.kpiGrid}>
                <div className={`${styles.glassCard} ${styles.kpiCard}`}>
                    <div className={styles.kpiLabel}>Total Balance Due</div>
                    <div className={styles.kpiValue}>${outstandingInvoices.toLocaleString()}</div>
                    <div style={{ fontSize: '0.7rem', color: '#94a3b8', marginTop: '0.5rem' }}>
                        Approved invoices scheduled for payment.
                    </div>
                </div>
                <div className={`${styles.glassCard} ${styles.kpiCard}`}>
                    <div className={styles.kpiLabel}>Open Opportunities</div>
                    <div className={styles.kpiValue} style={{ color: '#0ea5e9' }}>{activeTenders.length}</div>
                    <div style={{ fontSize: '0.7rem', color: '#94a3b8', marginTop: '0.5rem' }}>Active tenders awaiting your proposal.</div>
                </div>
                <div className={`${styles.glassCard} ${styles.kpiCard}`}>
                    <div className={styles.kpiLabel}>Active Orders</div>
                    <div className={styles.kpiValue}>{pos.filter(p => p.status !== 'FULFILLED').length}</div>
                    <div style={{ fontSize: '0.7rem', color: '#64748b', marginTop: '0.5rem' }}>{pos.length} total lifetime orders</div>
                </div>
                <div className={`${styles.glassCard} ${styles.kpiCard}`}>
                    <div className={styles.kpiLabel}>Compliance Rating</div>
                    <div className={styles.kpiValue} style={{ color: '#22c55e' }}>98%</div>
                    <div style={{ fontSize: '0.7rem', color: '#64748b', marginTop: '0.5rem' }}>Platinum Class Provider</div>
                </div>
            </div>

            {/* Sourcing & Opportunities Section */}
            <div className={styles.section}>
                <div className={styles.sectionHeader}>
                    <h3>Strategic Sourcing & Opportunities</h3>
                    <div style={{ fontSize: '0.8rem', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Info size={14} />
                        Live Tender Feed
                    </div>
                </div>
                
                <div className={styles.tenderGrid}>
                    {activeTenders.length === 0 && tenders.filter(t => t.status === 'AWARDED' && t.awardedTo === vendorBids.find(b => b.tenderId === t.id)?.id).length === 0 ? (
                        <div className={styles.glassCard} style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '3rem' }}>
                            <Gavel size={48} style={{ color: 'rgba(255,255,255,0.1)', marginBottom: '1rem' }} />
                            <p style={{ color: '#94a3b8' }}>No active tenders currently available for your profile.</p>
                        </div>
                    ) : (
                        <>
                            {/* Open Opportunities */}
                            {activeTenders.map(tender => (
                                <div key={tender.id} className={`${styles.glassCard} ${styles.tenderCard}`}>
                                    <div>
                                        <div className={styles.tenderHeader}>
                                            <h4 className={styles.tenderTitle}>{tender.title}</h4>
                                            {tender.isSealed ? (
                                                <span className={styles.badge} style={{ background: '#0ea5e922', color: '#0ea5e9' }}>
                                                    <ShieldCheck size={12} style={{ display: 'inline', marginRight: '4px' }} />
                                                    Sealed
                                                </span>
                                            ) : (
                                                <span className={styles.badge} style={{ background: '#22c55e22', color: '#22c55e' }}>Open</span>
                                            )}
                                        </div>
                                        <p className={styles.tenderDesc}>{tender.description}</p>
                                        
                                        <div className={styles.tenderMeta}>
                                            <div className={styles.metaItem}>
                                                <Clock size={14} />
                                                Deadline: {new Date(tender.deadline).toLocaleDateString()}
                                            </div>
                                            <div className={styles.metaItem}>
                                                <Gavel size={14} />
                                                Target Budget: {tender.currency} {tender.budget?.toLocaleString() || 'Undisclosed'}
                                            </div>
                                        </div>
                                    </div>

                                    <div className={styles.tenderFooter}>
                                        {hasSubmittedBid(tender.id) ? (
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#22c55e', fontSize: '0.9rem', fontWeight: 600 }}>
                                                <CheckCircle2 size={18} />
                                                Proposal Submitted
                                            </div>
                                        ) : (
                                            <button 
                                                className={styles.primaryBtn}
                                                style={{ width: '100%', padding: '0.5rem' }}
                                                onClick={() => {
                                                    setSelectedTender(tender);
                                                    setShowBidModal(true);
                                                }}
                                            >
                                                Submit Bid
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}

                            {/* Awarded to THIS vendor */}
                            {tenders
                                .filter(t => t.status === 'AWARDED' && vendorBids.some(b => b.tenderId === t.id && b.status === 'ACCEPTED'))
                                .map(tender => (
                                    <div key={tender.id} className={`${styles.glassCard} ${styles.tenderCard}`} style={{ borderColor: 'var(--success)' }}>
                                        <div>
                                            <div className={styles.tenderHeader}>
                                                <h4 className={styles.tenderTitle}>{tender.title}</h4>
                                                <span className={styles.badge} style={{ background: 'var(--success-soft)', color: 'var(--success)' }}>
                                                    WINNING BID
                                                </span>
                                            </div>
                                            <p className={styles.tenderDesc}>{tender.description}</p>
                                            
                                            <div className={styles.awardInfo} style={{ marginTop: '1rem', padding: '0.75rem', background: 'rgba(34, 197, 94, 0.1)', borderRadius: '8px', border: '1px solid rgba(34, 197, 94, 0.2)' }}>
                                                <div style={{ fontSize: '0.8rem', color: 'var(--success)', fontWeight: 700, marginBottom: '0.25rem' }}>CONTRACT AWARDED</div>
                                                <div style={{ fontSize: '0.9rem', fontWeight: 600 }}>Reference: {tender.poNumber || 'PO Generation in Progress'}</div>
                                            </div>
                                        </div>

                                        <div className={styles.tenderFooter}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--success)', fontSize: '0.9rem', fontWeight: 600 }}>
                                                <ShieldCheck size={18} />
                                                Business Secured
                                            </div>
                                        </div>
                                    </div>
                                ))
                            }
                        </>
                    )}
                </div>
            </div>

            <div className={styles.section}>
                <div className={styles.sectionHeader}>
                    <h3>Active Purchase Orders</h3>
                </div>
                <div className={styles.glassCard} style={{ padding: 0, overflow: 'hidden' }}>
                    <table className={styles.portalTable}>
                        <thead>
                            <tr>
                                <th>Ref #</th>
                                <th>Issued</th>
                                <th>Value</th>
                                <th>Status</th>
                                <th></th>
                            </tr>
                        </thead>
                        <tbody>
                            {pos.length === 0 ? (
                                <tr><td colSpan={5} style={{ textAlign: 'center', color: '#94a3b8', padding: '3rem' }}>No orders currently in progress.</td></tr>
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
                                        <td style={{ textAlign: 'right' }}>
                                            <button
                                                onClick={() => setSelectedPO(po)}
                                                style={{ background: 'none', border: 'none', color: '#3b82f6', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.85rem' }}
                                            >
                                                Details <ChevronRight size={14} />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* PO Detail Modal */}
            {selectedPO && (
                <PODetailsModal 
                    po={selectedPO}
                    tenantId={session.tenantId!}
                    vendorName={session.vendorName}
                    onClose={() => setSelectedPO(null)}
                    onAcknowledged={() => {
                        // Real-time listener handles the state update
                    }}
                />
            )}

            {/* Bid Submission Modal */}
            {showBidModal && selectedTender && (
                <SubmitBidModal 
                    tender={selectedTender}
                    session={session}
                    onClose={() => {
                        setShowBidModal(false);
                        setSelectedTender(null);
                    }}
                    onSuccess={() => {
                        setShowBidModal(false);
                        setSelectedTender(null);
                        // Data will refresh via onValue listener
                    }}
                />
            )}

            <footer style={{ marginTop: '4rem', textAlign: 'center', color: '#64748b', fontSize: '0.8rem' }}>
                Secure Trusted Portal • Protected by Coral Enterprise Infrastructure
            </footer>
        </div>
    );
}

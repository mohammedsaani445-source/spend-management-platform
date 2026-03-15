"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { db, DB_PREFIX } from "@/lib/firebase";
import { ref, onValue } from "firebase/database";
import { Tender, Bid } from "@/types";
import { createTender, updateTenderStatus, getTenderBids, awardBid } from "@/lib/bidding";
import { 
    Plus, Target, Clock, CheckCircle, 
    AlertCircle, Eye, EyeOff, Gavel,
    Search, Filter, ChevronRight, FileText,
    Trophy, Lock, Calendar, X, TrendingUp
} from "lucide-react";
import styles from "./Sourcing.module.css";
import BidVarianceChart from "@/components/sourcing/BidVarianceChart";

import Loader from "@/components/common/Loader";
import CreateTenderModal from "@/components/sourcing/CreateTenderModal";
import SourcingDashboard from "@/components/sourcing/SourcingDashboard";
import ExecutiveDashboard from "@/components/analytics/ExecutiveDashboard";
import { BarChart2 } from "lucide-react";

export default function SourcingPage() {
    const { user, loading: authLoading } = useAuth();
    const [tenders, setTenders] = useState<Tender[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedTender, setSelectedTender] = useState<Tender | null>(null);
    const [selectedTenderBids, setSelectedTenderBids] = useState<Bid[]>([]);
    const [isRefreshingBids, setIsRefreshingBids] = useState(false);
    const [activeTab, setActiveTab] = useState<'tenders' | 'analytics' | 'executive'>('tenders');

    useEffect(() => {
        if (authLoading || !user?.tenantId) return;

        console.log("[Sourcing] Subscribing to tenders for tenant:", user.tenantId);
        const tendersRef = ref(db, `${DB_PREFIX}/tenants/${user.tenantId}/tenders`);
        
        const unsubscribe = onValue(tendersRef, (snapshot) => {
            console.log("[Sourcing] Snapshot received");
            if (snapshot.exists()) {
                const data = snapshot.val();
                const tenderList = Object.entries(data).map(([id, val]: [string, any]) => ({
                    ...val,
                    id // Ensure ID is correct from key
                })) as Tender[];
                setTenders(tenderList.sort((a, b) => new Date(b.deadline).getTime() - new Date(a.deadline).getTime()));
            } else {
                setTenders([]);
            }
            setIsLoading(false);
        }, (error) => {
            console.error("[Sourcing] Firebase error:", error);
            setIsLoading(false);
        });

        // Fail-safe to prevent stuck loading
        const timeout = setTimeout(() => {
            setIsLoading(false);
        }, 8000);

        return () => {
            unsubscribe();
            clearTimeout(timeout);
        };
    }, [user, authLoading]);

    if (authLoading || isLoading) {
        return <Loader text="Synchronizing sourcing data..." />;
    }

    const handleViewBids = async (tender: Tender) => {
        if (!user) return;
        setSelectedTender(tender);
        setIsRefreshingBids(true);
        const bids = await getTenderBids(user.tenantId, tender.id);
        setSelectedTenderBids(bids);
        setIsRefreshingBids(false);
    };

    const handleCloseTender = async () => {
        if (!selectedTender || !user) return;
        try {
            setIsRefreshingBids(true);
            await updateTenderStatus(user.tenantId, selectedTender.id, 'EVALUATING', user);
            // Local update for immediate feedback
            setSelectedTender({ ...selectedTender, status: 'EVALUATING' });
            // Re-fetch bids to ensure we have any that were submitted just before closing
            const bids = await getTenderBids(user.tenantId, selectedTender.id);
            setSelectedTenderBids(bids);
        } catch (error) {
            console.error("Error closing tender:", error);
        } finally {
            setIsRefreshingBids(false);
        }
    };

    const handleAwardBid = async (bidId: string) => {
        if (!selectedTender || !user) return;
        if (!confirm("Are you sure you want to award this tender? This action will automatically generate a Purchase Order. This action is final.")) return;

        try {
            setIsRefreshingBids(true);
            const { poNumber } = await awardBid(user.tenantId, selectedTender.id, bidId, user);
            
            // Refresh state
            const bids = await getTenderBids(user.tenantId, selectedTender.id);
            setSelectedTenderBids(bids);
            setSelectedTender({ ...selectedTender, status: 'AWARDED' });
            
            alert(`Tender successfully awarded! Purchase Order ${poNumber} has been generated and sent to the vendor.`);
        } catch (error) {
            console.error("Error awarding bid:", error);
            alert("Failed to award tender. Please verify the bid and try again.");
        } finally {
            setIsRefreshingBids(false);
        }
    };

    const isAmountVisible = (tender: Tender) => {
        if (!tender.isSealed) return true;
        return tender.status !== 'OPEN';
    };

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <div className={styles.titleArea}>
                    <h1>Strategic Sourcing</h1>
                    <p>Manage strategic tenders and analyze sealed bids within a secure environment.</p>
                </div>
                {activeTab === 'tenders' && (
                    <button 
                        className={styles.primaryBtn}
                        onClick={() => setIsModalOpen(true)}
                    >
                        <Plus size={20} />
                        Create New Tender
                    </button>
                )}
            </header>

            <div className={styles.tabs}>
                <button 
                    className={`${styles.tabBtn} ${activeTab === 'tenders' ? styles.activeTab : ''}`}
                    onClick={() => setActiveTab('tenders')}
                >
                    <Target size={18} />
                    Active Tenders
                </button>
                <button 
                    className={`${styles.tabBtn} ${activeTab === 'analytics' ? styles.activeTab : ''}`}
                    onClick={() => setActiveTab('analytics')}
                >
                    <TrendingUp size={18} />
                    Savings Analytics
                </button>
                <button 
                    className={`${styles.tabBtn} ${activeTab === 'executive' ? styles.activeTab : ''}`}
                    onClick={() => setActiveTab('executive')}
                >
                    <BarChart2 size={18} />
                    Executive Overview
                </button>
            </div>

            {activeTab === 'executive' ? (
                <ExecutiveDashboard />
            ) : activeTab === 'analytics' ? (
                user && <SourcingDashboard user={user} />
            ) : (
                <>
                    <div className={styles.statsRow}>
                        <div className={styles.statCard}>
                            <div className={styles.statIcon}>
                                <FileText size={24} />
                            </div>
                            <div className={styles.statInfo}>
                                <span className={styles.statValue}>{tenders.length}</span>
                                <span className={styles.statLabel}>Active Tenders</span>
                            </div>
                        </div>
                <div className={styles.statCard}>
                    <div className={styles.statIcon} style={{ background: 'var(--success-soft)', color: 'var(--success)' }}>
                        <Trophy size={24} />
                    </div>
                    <div className={styles.statInfo}>
                        <span className={styles.statValue}>
                            {tenders.filter(t => t.status === 'AWARDED').length}
                        </span>
                        <span className={styles.statLabel}>Awarded</span>
                    </div>
                </div>
                <div className={styles.statCard}>
                    <div className={styles.statIcon} style={{ background: '#FFF3E0', color: '#F57C00' }}>
                        <Clock size={24} />
                    </div>
                    <div className={styles.statInfo}>
                        <span className={styles.statValue}>
                            {tenders.filter(t => t.status === 'OPEN').length}
                        </span>
                        <span className={styles.statLabel}>Open RFPs</span>
                    </div>
                </div>
                <div className={styles.statCard}>
                    <div className={styles.statIcon} style={{ background: '#E3F2FD', color: '#1976D2' }}>
                        <Lock size={24} />
                    </div>
                    <div className={styles.statInfo}>
                        <span className={styles.statValue}>
                            {tenders.filter(t => t.isSealed).length}
                        </span>
                        <span className={styles.statLabel}>Sealed Bids</span>
                    </div>
                </div>
            </div>

            <div className={styles.mainContent}>
                <section className={styles.tenderListSection}>
                    <div className={styles.sectionHeader}>
                        <h2>Procurement Tenders</h2>
                        <div className={styles.actions}>
                            <div className={styles.searchBar}>
                                <Search size={18} />
                                <input type="text" placeholder="Search tenders by name..." />
                            </div>
                            <button className={styles.iconBtn} title="Filter">
                                <Filter size={18} />
                            </button>
                        </div>
                    </div>

                    <div className={styles.tenderGrid}>
                        {tenders.length === 0 ? (
                            <div className={styles.loading}>
                                <FileText size={48} style={{ opacity: 0.2, marginBottom: '1rem' }} />
                                <p>No active tenders found. Create one to begin.</p>
                            </div>
                        ) : (
                            tenders.map((tender) => (
                                <div 
                                    key={tender.id} 
                                    className={`${styles.tenderCard} ${selectedTender?.id === tender.id ? styles.activeCard : ''}`}
                                    onClick={() => handleViewBids(tender)}
                                >
                                    <div className={styles.cardMainInfo}>
                                        <div className={styles.tenderStatus}>
                                            <span className={`${styles.statusBadge} ${styles['status' + tender.status]}`}>
                                                {tender.status}
                                            </span>
                                            <span className={styles.tenderDeadline}>
                                                <Calendar size={12} />
                                                Due {new Date(tender.deadline).toLocaleDateString()}
                                            </span>
                                        </div>
                                        <h3>{tender.title}</h3>
                                        <p className={styles.tenderDesc}>{tender.description}</p>
                                    </div>

                                    <div className={styles.cardSideInfo}>
                                        {tender.isSealed && (
                                            <div className={styles.sealedBadge}>
                                                <Lock size={10} />
                                                <span>SEALED</span>
                                            </div>
                                        )}
                                        <div className={styles.tenderBudget}>
                                            {tender.currency || 'USD'} {tender.budget?.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                        </div>
                                        <div className={styles.tenderMeta}>
                                            {selectedTender?.id === tender.id ? 'Viewing Bids' : 'Click to View Bids'}
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </section>

                <aside className={styles.bidPanel}>
                    {!selectedTender ? (
                        <div className={styles.panelPlaceholder}>
                            <FileText size={48} />
                            <h3>No Tender Selected</h3>
                            <p>Select a tender from the list to view vendor proposals and bid analytics.</p>
                        </div>
                    ) : (
                        <div className={styles.bidPanelContent}>
                            <div className={styles.panelHeader}>
                                <div>
                                    <h3>{selectedTender.title}</h3>
                                    <p className={styles.panelSub}>
                                        {selectedTenderBids.length} Proposals Submitted
                                    </p>
                                </div>
                                <div className={styles.panelActions}>
                                    {selectedTender.status === 'OPEN' && (
                                        <button className={styles.actionBtn} onClick={handleCloseTender}>
                                            <Eye size={16} />
                                            Close for Evaluation
                                        </button>
                                    )}
                                    <button className={styles.iconBtn} onClick={() => setSelectedTender(null)}>
                                        <X size={18} />
                                    </button>
                                </div>
                            </div>

                            {selectedTender.status === 'AWARDED' && (
                                <div className={styles.awardedBanner}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                        <Trophy size={20} />
                                        <span>Tender Awarded & Finalized</span>
                                    </div>
                                    {selectedTender.poNumber && (
                                        <div style={{ marginTop: '0.5rem', fontSize: '0.9rem', opacity: 0.9, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            <FileText size={14} />
                                            Reference PO: <strong>{selectedTender.poNumber}</strong>
                                        </div>
                                    )}
                                </div>
                            )}

                            {isAmountVisible(selectedTender) && selectedTenderBids.length > 0 && (
                                <BidVarianceChart 
                                    budget={selectedTender.budget || 0}
                                    bids={selectedTenderBids.map(b => ({ amount: b.amount, vendorName: b.vendorName }))}
                                    currency={selectedTender.currency}
                                />
                            )}

                            <div className={styles.bidList}>
                                {isRefreshingBids ? (
                                    <div className={styles.loading}>
                                        <Loader text="Loading Proposals..." />
                                    </div>
                                ) : selectedTenderBids.length === 0 ? (
                                    <div className={styles.emptyBids}>
                                        <AlertCircle size={40} />
                                        <h4>No Proposals Yet</h4>
                                        <p>Vendors have not submitted any bids for this tender.</p>
                                    </div>
                                ) : (
                                    selectedTenderBids.map((bid) => (
                                        <div key={bid.id} className={styles.bidCard}>
                                            <div className={styles.bidHeader}>
                                                <span className={styles.vendorName}>{bid.vendorName}</span>
                                                <span className={styles.bidDate}>
                                                    <Clock size={12} />
                                                    {new Date(bid.submittedAt).toLocaleDateString()}
                                                </span>
                                            </div>
                                            
                                            <div className={styles.bidAmount}>
                                                {isAmountVisible(selectedTender) ? (
                                                    <div className={styles.actualAmount}>
                                                        ${bid.amount.toLocaleString()}
                                                    </div>
                                                ) : (
                                                    <div className={styles.maskedAmount}>
                                                        <Lock size={18} />
                                                        <span>SEALED PROPOSAL</span>
                                                    </div>
                                                )}
                                            </div>

                                            <p className={styles.tenderDesc} style={{ maxHeight: 'none', WebkitLineClamp: 'unset' }}>
                                                {bid.notes}
                                            </p>

                                            {selectedTender.status !== 'AWARDED' && isAmountVisible(selectedTender) && (
                                                <div className={styles.bidFooter}>
                                                    <button 
                                                        className={styles.awardBtn}
                                                        onClick={() => handleAwardBid(bid.id)}
                                                    >
                                                        Award Contract
                                                    </button>
                                                </div>
                                            )}

                                            {bid.status === 'ACCEPTED' && (
                                                <div className={styles.winnerBadge}>
                                                    <Trophy size={14} />
                                                    Winner
                                                </div>
                                            )}
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    )}
                </aside>
            </div>
                </>
            )}

            {isModalOpen && (
                <CreateTenderModal 
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    tenantId={user?.tenantId || ''}
                />
            )}
        </div>
    );
}

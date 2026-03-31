"use client";

import { useEffect, useState } from "react";
import { getRFPs, calculateSavings } from "@/lib/sourcing";
import { getRequisitions } from "@/lib/requisitions";
import { useAuth } from "@/context/AuthContext";
import { RFP, Quotation, Requisition } from "@/types";
import { 
    Target, 
    Award, 
    Clock, 
    TrendingUp, 
    PiggyBank, 
    ChevronRight, 
    ArrowRight,
    Search,
    Filter,
    Plus,
    ShoppingCart,
    Zap
} from "lucide-react";
import styles from "@/components/layout/Layout.module.css";
import { formatCurrency } from "@/lib/currencies";
import { useRouter } from "next/navigation";
import CreateRFPModal from "./CreateRFPModal";

export default function RFQManager() {
    const { user } = useAuth();
    const router = useRouter();
    const [rfps, setRfps] = useState<RFP[]>([]);
    const [pendingReqs, setPendingReqs] = useState<Requisition[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'PENDING' | 'ACTIVE' | 'AWARDED' | 'DRAFT'>('PENDING');
    
    // Modal State
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [selectedPR, setSelectedPR] = useState<Requisition | null>(null);

    useEffect(() => {
        if (!user) return;
        async function load() {
            const [rfpData, reqData] = await Promise.all([
                getRFPs(user!.tenantId),
                getRequisitions(user!)
            ]);
            
            setRfps(rfpData);
            
            // Filter: Requisitions that are APPROVED and NOT already in an RFQ
            const sourcedPrIds = new Set(rfpData.map(r => r.requisitionId));
            const availablePrs = reqData.filter(pr => 
                pr.id && pr.status === 'APPROVED' && !sourcedPrIds.has(pr.id)
            );
            
            setPendingReqs(availablePrs);
            setLoading(false);
        }
        load();
    }, [user]);

    const handleSourcePR = (pr: Requisition) => {
        setSelectedPR(pr);
        setShowCreateModal(true);
    };

    const filteredRFPs = rfps.filter(r => {
        if (activeTab === 'ACTIVE') return r.status === 'OPEN';
        if (activeTab === 'AWARDED') return r.status === 'AWARDED';
        if (activeTab === 'DRAFT') return r.status === 'DRAFT';
        return false;
    });

    if (loading) return <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-secondary)' }}>Loading Strategic Sourcing Workbench...</div>;

    return (
        <div style={{ padding: '2rem' }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
                <div>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 900, display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <Target size={28} color="var(--brand)" />
                        Strategic Sourcing Command Center
                    </h2>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Automated RFQ pipeline from approved procurement requests.</p>
                </div>
            </div>

            {/* KPI Summary */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '2rem' }}>
                <div style={{ background: 'white', padding: '1.5rem', borderRadius: '16px', border: '1px solid var(--border)' }}>
                    <div style={{ color: 'var(--text-disabled)', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', marginBottom: '0.5rem' }}>Ready to Source</div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--brand)' }}>{pendingReqs.length} PRs</div>
                </div>
                <div style={{ background: 'white', padding: '1.5rem', borderRadius: '16px', border: '1px solid var(--border)' }}>
                    <div style={{ color: 'var(--text-disabled)', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', marginBottom: '0.5rem' }}>Live Auctions</div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 900 }}>{rfps.filter(r => r.status === 'OPEN').length}</div>
                </div>
                <div style={{ background: 'white', padding: '1.5rem', borderRadius: '16px', border: '1px solid var(--border)' }}>
                    <div style={{ color: 'var(--text-disabled)', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', marginBottom: '0.5rem' }}>Awarded Events</div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 900 }}>{rfps.filter(r => r.status === 'AWARDED').length}</div>
                </div>
                <div style={{ background: 'var(--success-soft)', padding: '1.5rem', borderRadius: '16px', border: '1px solid var(--success-soft)' }}>
                    <div style={{ color: 'var(--success)', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', marginBottom: '0.5rem' }}>Total Savings</div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--success)' }}>$42.5k</div>
                </div>
            </div>

            {/* Tabs */}
            <div style={{ display: 'flex', gap: '2rem', borderBottom: '1px solid var(--border)', marginBottom: '2rem' }}>
                {['PENDING', 'ACTIVE', 'AWARDED', 'DRAFT'].map(tab => (
                    <button 
                        key={tab}
                        onClick={() => setActiveTab(tab as any)}
                        style={{
                            padding: '1rem 0.5rem',
                            fontSize: '0.8125rem',
                            fontWeight: 800,
                            color: activeTab === tab ? 'var(--brand)' : 'var(--text-disabled)',
                            background: 'none', 
                            borderWidth: '0 0 2px 0', 
                            borderStyle: 'solid',
                            borderColor: activeTab === tab ? 'var(--brand)' : 'transparent',
                            cursor: 'pointer', 
                            textTransform: 'uppercase', 
                            letterSpacing: '0.05em'
                        }}
                    >
                        {tab === 'PENDING' ? `Queue (${pendingReqs.length})` : `${tab} Tenders`}
                    </button>
                ))}
            </div>

            {/* Main Content Area */}
            <div style={{ display: 'grid', gap: '1rem' }}>
                
                {activeTab === 'PENDING' ? (
                    /* Pending Queue */
                    pendingReqs.length === 0 ? (
                        <div style={{ padding: '4rem', textAlign: 'center', background: 'var(--surface-2)', borderRadius: '16px', border: '2px dashed var(--border)' }}>
                            <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>🧘</div>
                            <h4 style={{ margin: 0, fontWeight: 800 }}>Clean Queue</h4>
                            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>All approved requisitions have been sourced or moved to procurement.</p>
                        </div>
                    ) : (
                        pendingReqs.map(pr => (
                            <div key={pr.id} style={{ background: 'white', border: '1px solid var(--border)', borderRadius: '20px', padding: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
                                    <div style={{ width: '48px', height: '48px', background: 'var(--brand-soft)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--brand)' }}>
                                        <ShoppingCart size={24} />
                                    </div>
                                    <div>
                                        <div style={{ fontWeight: 800, fontSize: '1rem' }}>PR #{pr.id!.slice(-6).toUpperCase()} - {pr.department}</div>
                                        <div style={{ fontSize: '0.75rem', color: 'var(--text-disabled)', marginTop: '0.25rem' }}>
                                            Total: {formatCurrency(pr.totalAmount, pr.currency || 'USD')} • Submitted by {pr.requesterName}
                                        </div>
                                    </div>
                                </div>
                                <button className="btn btn-primary" onClick={() => handleSourcePR(pr)} style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                    <Zap size={16} /> Initiative Sourcing
                                </button>
                            </div>
                        ))
                    )
                ) : (
                    /* Tender Tabs */
                    filteredRFPs.length === 0 ? (
                        <div style={{ padding: '4rem', textAlign: 'center', background: 'var(--surface-2)', borderRadius: '16px', border: '2px dashed var(--border)' }}>
                            <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>📦</div>
                            <h4 style={{ margin: 0, fontWeight: 800 }}>No {activeTab.toLowerCase()} tenders found</h4>
                        </div>
                    ) : (
                        filteredRFPs.map(rfq => (
                            <div 
                                key={rfq.id}
                                style={{ background: 'white', border: '1px solid var(--border)', borderRadius: '16px', padding: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}
                                onClick={() => router.push(`/dashboard/sourcing/${rfq.id}`)}
                            >
                                <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
                                    <div style={{ width: '48px', height: '48px', background: 'var(--surface-2)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.25rem' }}>
                                        {rfq.isAuction ? '⚡' : '📋'}
                                    </div>
                                    <div>
                                        <div style={{ fontWeight: 800, fontSize: '1rem' }}>{rfq.title}</div>
                                        <div style={{ fontSize: '0.75rem', color: 'var(--text-disabled)', display: 'flex', gap: '1rem', marginTop: '0.25rem' }}>
                                            <span>Deadline: {new Date(rfq.deadline).toLocaleDateString()}</span>
                                            <span>{rfq.invitedVendors.length} Invited</span>
                                        </div>
                                    </div>
                                </div>
                                <ChevronRight size={18} color="var(--text-disabled)" />
                            </div>
                        ))
                    )
                )}
            </div>

            {/* Modals */}
            {showCreateModal && selectedPR && (
                <CreateRFPModal 
                    onClose={() => {
                        setShowCreateModal(false);
                        setSelectedPR(null);
                    }}
                    tenantId={user!.tenantId}
                    initialData={selectedPR}
                />
            )}
        </div>
    );
}

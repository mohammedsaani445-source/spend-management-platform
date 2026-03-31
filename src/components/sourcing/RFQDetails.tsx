"use client";

import { useEffect, useState } from "react";
import { RFP, Quotation, Bid } from "@/types";
import { getRFPQuotes, awardBid } from "@/lib/sourcing";
import { useAuth } from "@/context/AuthContext";
import { 
    ChevronLeft, 
    Clock, 
    Award, 
    Users, 
    TrendingDown, 
    Plus, 
    MessageCircle,
    Copy,
    Share2,
    Trophy
} from "lucide-react";
import styles from "@/components/layout/Layout.module.css";
import { formatCurrency } from "@/lib/currencies";
import { useRouter } from "next/navigation";
import SourcingEvaluation from "./SourcingEvaluation";
import { db } from "@/lib/firebase";
import { ref, onValue } from "firebase/database";

interface RFQDetailsProps {
    rfp: RFP;
}

export default function RFQDetails({ rfp }: RFQDetailsProps) {
    const { user } = useAuth();
    const router = useRouter();
    const [quotes, setQuotes] = useState<Quotation[]>([]);
    const [loading, setLoading] = useState(true);
    const [isAwarding, setIsAwarding] = useState(false);
    const [auctionValue, setAuctionValue] = useState(rfp.bestBidValue || 0);

    useEffect(() => {
        if (!user) return;
        
        // 1. Initial Load of Quotes
        if (rfp.id) {
            getRFPQuotes(user.tenantId, rfp.id!).then(data => {
                setQuotes(data);
                setLoading(false);
            });
        }

        // 2. Real-time Auction Listener
        if (rfp.isAuction && rfp.id) {
            const rfpRef = ref(db, `tenants/${user.tenantId}/rfps/${rfp.id}`);
            return onValue(rfpRef, (snapshot) => {
                if (snapshot.exists()) {
                    const data = snapshot.val();
                    setAuctionValue(data.bestBidValue || 0);
                    // Also refresh quotes if auction value changes
                    if (rfp.id) getRFPQuotes(user.tenantId, rfp.id!).then(setQuotes);
                }
            });
        }
    }, [user, rfp.id, rfp.tenantId]);

    const handleAward = async (quoteId: string, vendorId: string) => {
        if (!user || isAwarding || !rfp.id) return;
        if (!confirm("Are you sure you want to award this contract? This will automatically generate a Purchase Order.")) return;

        setIsAwarding(true);
        try {
            await awardBid(user.tenantId, rfp.id, quoteId, user);
            alert("Contract Awarded Successfully! Purchase Order generated.");
            router.push('/dashboard/purchase-orders');
        } catch (error) {
            console.error(error);
            alert("Failed to award contract.");
        } finally {
            setIsAwarding(false);
        }
    };

    const copyPortalLink = () => {
        if (!rfp.id) return;
        const url = `${window.location.origin}/public/rfq/${rfp.id}?tenant=${rfp.tenantId}`;
        navigator.clipboard.writeText(url);
        alert("Portal link copied to clipboard!");
    };

    return (
        <div style={{ padding: '2rem' }}>
            {/* Nav */}
            <button 
                onClick={() => router.push('/dashboard/sourcing')}
                style={{ background: 'none', border: 'none', color: 'var(--text-disabled)', display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', marginBottom: '1.5rem', fontWeight: 700 }}
            >
                <ChevronLeft size={16} /> Back to Sourcing
            </button>

            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '3rem' }}>
                <div>
                    <h1 style={{ fontSize: '2rem', fontWeight: 900, marginBottom: '0.5rem' }}>{rfp.title}</h1>
                    <div style={{ display: 'flex', gap: '1.5rem', color: 'var(--text-secondary)', fontSize: '0.875rem', fontWeight: 600 }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}><Clock size={16}/> {new Date(rfp.deadline).toLocaleDateString()}</span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}><Users size={16}/> {quotes.length} Bidder{quotes.length !== 1 ? 's' : ''}</span>
                        <span style={{ color: rfp.status === 'AWARDED' ? 'var(--success)' : 'var(--brand)', textTransform: 'uppercase' }}>{rfp.status}</span>
                    </div>
                </div>
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                    <button className="btn btn-primary" onClick={copyPortalLink} style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', padding: '0.75rem 1.25rem' }}>
                        <Share2 size={18} /> Share Portal Link
                    </button>
                    {rfp.status === 'OPEN' && (
                        <button className="btn btn-outline" style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', border: '1px solid var(--border)', background: 'white' }}>
                            <Plus size={18} /> Add Internal Bid
                        </button>
                    )}
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '2rem' }}>
                {/* Main Content */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                    
                    {/* Auction Pulse (If Active) - Solid Enterprise View */}
                    {rfp.isAuction && rfp.status === 'OPEN' && (
                        <div style={{ 
                            background: '#0f172a', 
                            padding: '2.5rem', borderRadius: '24px', color: 'white', 
                            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.3)',
                            border: '1px solid #1e293b'
                        }}>
                            <div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--brand)', marginBottom: '0.5rem' }}>
                                    <div style={{ width: '8px', height: '8px', background: 'var(--brand)', borderRadius: '50%', animation: 'pulse 1.5s infinite' }} />
                                    <span style={{ fontWeight: 800, textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '0.1em' }}>Live Reverse Auction</span>
                                </div>
                                <h2 style={{ fontSize: '2.5rem', fontWeight: 900, margin: 0 }}>
                                    {auctionValue ? formatCurrency(auctionValue, 'USD') : 'No Bids Yet'}
                                </h2>
                                <p style={{ opacity: 0.6, fontSize: '0.875rem', margin: 0 }}>Market-leading bid current baseline.</p>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                                <div style={{ background: '#1e293b', padding: '1.25rem', borderRadius: '16px', border: '1px solid #334155' }}>
                                    <div style={{ fontSize: '0.7rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 800, marginBottom: '0.25rem' }}>Bidding War Status</div>
                                    <div style={{ fontSize: '1.125rem', fontWeight: 800, color: 'var(--success)' }}>Highly Competitive</div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Comparative Scorecard */}
                    {quotes.length > 0 ? (
                        <SourcingEvaluation rfp={rfp} quotes={quotes} />
                    ) : (
                        <div style={{ padding: '6rem 2rem', textAlign: 'center', background: 'white', border: '1px solid var(--border)', borderRadius: '24px' }}>
                            <div style={{ fontSize: '3rem', marginBottom: '1.5rem' }}>⏳</div>
                            <h3 style={{ margin: 0, fontWeight: 900 }}>Awaiting Supplier Responses</h3>
                            <p style={{ color: 'var(--text-secondary)', maxWidth: '400px', margin: '0 auto 2rem' }}>Share the secure portal link with your invited suppliers to start receiving competitive bids.</p>
                            <button className="btn btn-primary" onClick={copyPortalLink}>
                                Copy Secure Quote Link
                            </button>
                        </div>
                    )}

                    {/* Technical Specification Recap */}
                    <div style={{ background: 'white', padding: '2rem', borderRadius: '24px', border: '1px solid var(--border)' }}>
                        <h3 style={{ margin: 0, fontSize: '1.125rem', fontWeight: 800, marginBottom: '1.5rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-secondary)' }}>Project Scope & Items</h3>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                                    <th style={{ textAlign: 'left', padding: '0.75rem 0', fontSize: '0.75rem', color: 'var(--text-disabled)' }}>Item / Requirement</th>
                                    <th style={{ textAlign: 'center', padding: '0.75rem 0', fontSize: '0.75rem', color: 'var(--text-disabled)', width: '100px' }}>Quantity</th>
                                    <th style={{ textAlign: 'center', padding: '0.75rem 0', fontSize: '0.75rem', color: 'var(--text-disabled)', width: '100px' }}>Unit</th>
                                </tr>
                            </thead>
                            <tbody>
                                {rfp.items.map((it, i) => (
                                    <tr key={i} style={{ borderBottom: '1px solid #f8fafc' }}>
                                        <td style={{ padding: '1.25rem 0', fontWeight: 700 }}>{it.description}</td>
                                        <td style={{ padding: '1.25rem 0', textAlign: 'center', fontWeight: 600 }}>{it.quantity}</td>
                                        <td style={{ padding: '1.25rem 0', textAlign: 'center', color: 'var(--text-secondary)' }}>{it.unit}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Sidebar Controls */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    
                    {/* Award Card */}
                    {rfp.status === 'OPEN' && quotes.length > 0 && (
                        <div style={{ background: 'white', padding: '1.5rem', borderRadius: '24px', border: '1px solid var(--border)', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.05)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                                <Trophy size={18} color="var(--brand)" />
                                <h4 style={{ margin: 0, fontSize: '0.8125rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--brand)' }}>Award Recommendation</h4>
                            </div>
                            {(() => {
                                const best = [...quotes].sort((a,b) => (b.scorecard?.weightedTotal || 0) - (a.scorecard?.weightedTotal || 0))[0];
                                return (
                                    <div>
                                        <div style={{ fontWeight: 900, fontSize: '1.125rem', marginBottom: '0.25rem' }}>{best.vendorName}</div>
                                        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>Highest Weighted Value: {best.scorecard?.weightedTotal || 94}.2%</div>
                                        <button 
                                            onClick={() => handleAward(best.id!, best.vendorId)}
                                            disabled={isAwarding}
                                            className="btn btn-primary" 
                                            style={{ width: '100%', padding: '0.875rem' }}
                                        >
                                            {isAwarding ? 'Generating PO...' : 'Award Contract'}
                                        </button>
                                    </div>
                                );
                            })()}
                        </div>
                    )}

                    {/* Invitation Control */}
                    <div style={{ background: 'white', padding: '1.5rem', borderRadius: '24px', border: '1px solid var(--border)' }}>
                        <h4 style={{ margin: 0, fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-disabled)', marginBottom: '1rem' }}>Sourcing Team</h4>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <div style={{ width: '32px', height: '32px', background: 'var(--brand-soft)', borderRadius: '50%', color: 'var(--brand)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.7rem' }}>AM</div>
                            <div>
                                <div style={{ fontSize: '0.8125rem', fontWeight: 700 }}>Alex Mitchell</div>
                                <div style={{ fontSize: '0.65rem', color: 'var(--text-disabled)' }}>Lead Sourcing Specialist</div>
                            </div>
                        </div>
                        <button className="btn btn-ghost btn-sm" style={{ width: '100%', marginTop: '1.25rem', justifyContent: 'center' }}>
                            <MessageCircle size={14} style={{ marginRight: '6px' }} /> Internal Discussion
                        </button>
                    </div>
                </div>
            </div>

            <style jsx>{`
                @keyframes pulse {
                    0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(79, 70, 229, 0.7); }
                    70% { transform: scale(1); box-shadow: 0 0 0 10px rgba(79, 70, 229, 0); }
                    100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(79, 70, 229, 0); }
                }
            `}</style>
        </div>
    );
}

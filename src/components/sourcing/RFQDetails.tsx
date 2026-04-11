"use client";

import { useEffect, useState } from "react";
import { RFP, Quotation, Bid } from "@/types";
import { getRFPQuotes, initiateAwardApproval, calculateNegotiationBridge } from "@/lib/sourcing";
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

    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 1024);
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

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
        if (!confirm("Are you sure you want to award this contract? Depending on company policy, this may require approval before a Purchase Order is generated.")) return;

        setIsAwarding(true);
        try {
            const result = await initiateAwardApproval(user.tenantId, rfp.id, quoteId, user);
            
            if (result.status === 'PENDING_AWARD') {
                alert("Award Approval Initiated! Once approved, the Purchase Order will be generated automatically.");
                router.push('/dashboard/approvals');
            } else {
                alert("Contract Awarded Successfully! Purchase Order generated.");
                router.push('/dashboard/purchase-orders');
            }
        } catch (error) {
            console.error(error);
            alert("Failed to initiate award.");
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
            <div style={{ 
                display: 'flex', 
                flexDirection: isMobile ? 'column' : 'row',
                justifyContent: 'space-between', 
                alignItems: isMobile ? 'flex-start' : 'flex-start', 
                marginBottom: '3rem',
                gap: isMobile ? '1.5rem' : '0'
            }}>
                <div>
                    <h1 style={{ fontSize: isMobile ? '1.5rem' : '2rem', fontWeight: 900, marginBottom: '0.5rem' }}>{rfp.title}</h1>
                    <div style={{ 
                        display: 'flex', 
                        flexWrap: 'wrap',
                        gap: '1rem', 
                        color: 'var(--text-secondary)', 
                        fontSize: '0.875rem', 
                        fontWeight: 600 
                    }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}><Clock size={16}/> {new Date(rfp.deadline).toLocaleDateString()}</span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}><Users size={16}/> {quotes.length} Bidder{quotes.length !== 1 ? 's' : ''}</span>
                        <span style={{ color: rfp.status === 'AWARDED' ? 'var(--success)' : 'var(--brand)', textTransform: 'uppercase' }}>{rfp.status}</span>
                    </div>
                </div>
                <div style={{ display: 'flex', gap: '0.75rem', width: isMobile ? '100%' : 'auto' }}>
                    <button className="btn btn-primary" onClick={copyPortalLink} style={{ flex: isMobile ? 1 : 'none', display: 'flex', gap: '0.75rem', alignItems: 'center', padding: '0.75rem 1.25rem', justifyContent: 'center' }}>
                        <Share2 size={18} /> {isMobile ? 'Share' : 'Share Portal Link'}
                    </button>
                    {rfp.status === 'OPEN' && (
                        <button className="btn btn-outline" style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', border: '1px solid var(--border)', background: 'white' }}>
                            <Plus size={18} /> {isMobile ? 'Bid' : 'Add Internal Bid'}
                        </button>
                    )}
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 350px', gap: '2rem' }}>
                {/* Main Content */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                    
                    {/* Negotiation Bridge & Market Velocity */}
                    {quotes.length > 0 && (
                        <div style={{ 
                            background: 'white', 
                            padding: '2rem', 
                            borderRadius: '24px', 
                            border: '1px solid var(--border)',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '1.5rem'
                        }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div>
                                    <h3 style={{ margin: 0, fontSize: '0.875rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-secondary)', letterSpacing: '0.05em' }}>Negotiation Bridge</h3>
                                    <p style={{ margin: 0, color: 'var(--text-disabled)', fontSize: '0.75rem' }}>Visualizing the value gap between budget and best market offers.</p>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <div style={{ fontSize: '1.25rem', fontWeight: 900, color: 'var(--success)' }}>
                                        {(() => {
                                            const bridge = calculateNegotiationBridge(rfp, quotes);
                                            return `+${bridge.percent.toFixed(1)}%`;
                                        })()}
                                    </div>
                                    <div style={{ fontSize: '0.65rem', fontWeight: 800, color: 'var(--success)', textTransform: 'uppercase' }}>Current Savings</div>
                                </div>
                            </div>

                            <div style={{ position: 'relative', height: '40px', background: 'var(--surface-2)', borderRadius: '12px', overflow: 'hidden', display: 'flex', alignItems: 'center', padding: '0 1rem' }}>
                                {(() => {
                                    const bridge = calculateNegotiationBridge(rfp, quotes);
                                    const budgetPos = 100;
                                    const bestPos = (bridge.lowest / (bridge.budget || bridge.lowest || 1)) * 100;
                                    
                                    return (
                                        <>
                                            {/* Bridge Line */}
                                            <div style={{ position: 'absolute', top: '50%', left: `${bestPos}%`, right: '1rem', height: '2px', background: 'var(--success)', opacity: 0.3, transform: 'translateY(-50%)' }} />
                                            
                                            {/* Data Points */}
                                            <div style={{ position: 'absolute', left: `${bestPos}%`, transform: 'translateX(-50%)', display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 2 }}>
                                                <div style={{ width: '12px', height: '12px', background: 'var(--success)', borderRadius: '50%', border: '2px solid white', boxShadow: '0 0 0 2px var(--success-soft)' }} />
                                                <span style={{ fontSize: '10px', fontWeight: 900, marginTop: '4px' }}>Best Bid</span>
                                            </div>

                                            <div style={{ position: 'absolute', right: '1rem', display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 2 }}>
                                                <div style={{ width: '12px', height: '12px', background: 'var(--text-disabled)', borderRadius: '50%', border: '2px solid white' }} />
                                                <span style={{ fontSize: '10px', fontWeight: 900, marginTop: '4px' }}>Budget</span>
                                            </div>
                                        </>
                                    );
                                })()}
                            </div>
                        </div>
                    )}

                    {/* Auction Pulse (If Active) - Solid Enterprise View */}
                    {rfp.isAuction && rfp.status === 'OPEN' && (
                        <div style={{ 
                            background: '#0f172a', 
                            padding: isMobile ? '1.5rem' : '2.5rem', 
                            borderRadius: '24px', color: 'white', 
                            display: 'flex', 
                            flexDirection: isMobile ? 'column' : 'row',
                            justifyContent: 'space-between', 
                            alignItems: isMobile ? 'flex-start' : 'center',
                            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.3)',
                            border: '1px solid #1e293b',
                            position: 'relative',
                            overflow: 'hidden',
                            gap: isMobile ? '1.5rem' : '0'
                        }}>
                            {/* Decorative Grid */}
                            <div style={{ position: 'absolute', inset: 0, opacity: 0.05, backgroundImage: 'radial-gradient(#6366f1 1px, transparent 0)', backgroundSize: '24px 24px' }} />
                            
                            <div style={{ position: 'relative', zIndex: 1 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#818cf8', marginBottom: '0.5rem' }}>
                                    <div style={{ width: '8px', height: '8px', background: '#6366f1', borderRadius: '50%', animation: 'pulse 1.5s infinite' }} />
                                    <span style={{ fontWeight: 800, textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '0.15em' }}>Live Auction Corridor</span>
                                </div>
                                <h2 style={{ fontSize: isMobile ? '2rem' : '2.75rem', fontWeight: 900, margin: 0, letterSpacing: '-0.02em' }}>
                                    {auctionValue ? formatCurrency(auctionValue, rfp.currency) : 'Awaiting Bids'}
                                </h2>
                                <p style={{ color: '#94a3b8', fontSize: '0.875rem', margin: '0.25rem 0 0 0', fontWeight: 500 }}>Competitive baseline updating in real-time.</p>
                            </div>
                            <div style={{ position: 'relative', zIndex: 1, textAlign: isMobile ? 'left' : 'right', width: isMobile ? '100%' : 'auto' }}>
                                <div style={{ background: 'rgba(30, 41, 59, 0.7)', padding: '1rem', borderRadius: '16px', border: '1px solid rgba(51, 65, 85, 0.5)', backdropFilter: 'blur(8px)' }}>
                                    <div style={{ fontSize: '0.7rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 800, marginBottom: '0.25rem' }}>Market Pulse</div>
                                    <div style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--success)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <TrendingDown size={18} /> High Velocity
                                    </div>
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

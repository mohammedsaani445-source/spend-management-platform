import { AppUser, PurchaseOrder } from "@/types";
import { formatCurrency } from "@/lib/currencies";
import { SpendBarChart, BudgetDonutChart } from "@/components/charts/SimpleCharts";
import Link from "next/link";
import SecurityBanner from "@/components/common/SecurityBanner";
import { 
    CheckCircle, AlertTriangle, 
    ShieldCheck, Zap, Activity 
} from "lucide-react";

interface FinanceDashboardProps {
    user: AppUser;
    stats: {
        budgetUsage: { total: number; used: number; percent: number };
        pendingCount: number;
        avgApprovalDays: number;
        monthlyData: any[];
    };
    currency: string;
    pos?: PurchaseOrder[];
}

export default function FinanceDashboard({ user, stats, currency, pos = [] }: FinanceDashboardProps) {

    // Filter logic for the Match Engine
    const readyForPayment = pos.filter(p => p.isMatched && p.status !== 'FULFILLED' && p.status !== 'CLOSED');
    const discrepancies = pos.filter(p => p.status === 'DISCREPANCY_FLAGGED');
    const matchRate = pos.length > 0 ? Math.round((pos.filter(p => p.isMatched).length / pos.length) * 100) : 0;

    return (
        <div style={{ color: '#FFF' }}>
            <SecurityBanner user={user} />
            
            <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                <div>
                    <h1 style={{ fontSize: '1.5rem', fontWeight: 900, margin: 0, letterSpacing: '-0.02em' }}>Finance Command Center</h1>
                    <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '4px' }}>Strategic Spend Governance & AP Intelligence Engine.</p>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                    <div style={{ padding: '8px 16px', background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <ShieldCheck size={16} color="#00AB55" />
                        <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#00AB55' }}>AUDIT COMPLIANT</span>
                    </div>
                </div>
            </div>

            {/* Premium KPI Strip */}
            <div className="kpi-grid" style={{ marginBottom: '2rem' }}>
                {[
                    { label: 'Total Budget', value: formatCurrency(stats.budgetUsage.total, currency), sub: 'Corporate Allocation', icon: '🏦', color: '#5C6AC4' },
                    { label: 'Current matched', value: formatCurrency(readyForPayment.reduce((sum, p) => sum + p.totalAmount, 0), currency), sub: `${readyForPayment.length} Verified Bills`, icon: <Zap size={16} />, color: '#00AB55' },
                    { label: 'Variance Risk', value: formatCurrency(discrepancies.reduce((sum, p) => sum + p.totalAmount, 0), currency), sub: `${discrepancies.length} Flagged Matches`, icon: <AlertTriangle size={16} />, color: '#FF4842' },
                    { label: 'Audit Velocity', value: `${matchRate}%`, sub: '3-Way Match Health', icon: <Activity size={16} />, color: '#FFAB00' },
                ].map((kpi, i) => (
                    <div key={typeof kpi.label === 'string' ? kpi.label : i} style={{ 
                        background: 'rgba(255, 255, 255, 0.03)', 
                        border: '1px solid rgba(255, 255, 255, 0.1)', 
                        borderRadius: '20px', 
                        padding: '1.25rem' 
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                            <span style={{ fontSize: '0.65rem', fontWeight: 900, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{kpi.label}</span>
                            <div style={{ color: kpi.color, opacity: 0.8 }}>{kpi.icon}</div>
                        </div>
                        <div style={{ fontSize: '1.5rem', fontWeight: 900, color: '#FFF' }}>{kpi.value}</div>
                        <div style={{ fontSize: '0.75rem', color: kpi.color, fontWeight: 700, marginTop: '4px' }}>{kpi.sub}</div>
                    </div>
                ))}
            </div>

            <div className="dashboard-grid">
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    {/* Ready for Payment Queue */}
                    <div style={{ background: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255, 255, 255, 0.05)', borderRadius: '24px', padding: '1.5rem', position: 'relative', overflow: 'hidden' }}>
                        <div style={{ position: 'absolute', top: 0, right: 0, padding: '1rem', opacity: 0.1 }}>
                            <Zap size={120} color="#00AB55" />
                        </div>
                        
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <h2 style={{ fontSize: '1rem', fontWeight: 900, margin: 0, color: '#FFF' }}>Verified: Ready for Payment</h2>
                            <Link href="/dashboard/payments" style={{ fontSize: '0.75rem', color: '#5C6AC4', fontWeight: 700, textDecoration: 'none' }}>Initiate PayRun →</Link>
                        </div>
                        
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            {readyForPayment.length === 0 ? (
                                <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>
                                    <CheckCircle size={32} style={{ marginBottom: '0.5rem', opacity: 0.3 }} />
                                    <p style={{ fontSize: '0.875rem' }}>Audit queue is clear.</p>
                                </div>
                            ) : (
                                readyForPayment.slice(0, 4).map(po => (
                                    <div key={po.id} style={{ padding: '1.25rem', background: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255, 255, 255, 0.05)', borderRadius: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <div>
                                            <div style={{ fontSize: '0.875rem', fontWeight: 800 }}>{po.poNumber}</div>
                                            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#00AB55' }} />
                                                3-Way Matched: {po.vendorName}
                                            </div>
                                        </div>
                                        <div style={{ textAlign: 'right' }}>
                                            <div style={{ fontSize: '0.9375rem', fontWeight: 900, color: '#00AB55' }}>{formatCurrency(po.totalAmount, po.currency || currency)}</div>
                                            <span style={{ fontSize: '0.65rem', fontWeight: 900, color: 'var(--text-secondary)' }}>FUNDS SECURED</span>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    <div style={{ background: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255, 255, 255, 0.05)', borderRadius: '24px', padding: '1.5rem' }}>
                        <h2 style={{ fontSize: '1rem', fontWeight: 900, marginBottom: '1.5rem' }}>Enterprise Spend Trend</h2>
                        <SpendBarChart data={stats.monthlyData} currency={currency} />
                    </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    {/* Variance Action Center */}
                    <div style={{ background: 'rgba(255, 72, 66, 0.03)', border: '1px solid rgba(255, 72, 66, 0.2)', borderRadius: '24px', padding: '1.5rem', minHeight: '300px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1.5rem' }}>
                            <div style={{ width: 32, height: 32, borderRadius: '8px', background: 'rgba(255, 72, 66, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <AlertTriangle size={16} color="#FF4842" />
                            </div>
                            <div>
                                <h2 style={{ fontSize: '0.9375rem', fontWeight: 900, margin: 0, color: '#FF4842' }}>Variance Warnings</h2>
                                <p style={{ fontSize: '0.75rem', color: 'rgba(255, 72, 66, 0.6)', margin: 0 }}>Review match discrepancies immediately.</p>
                            </div>
                        </div>

                        {discrepancies.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '3rem 0', opacity: 0.3 }}>
                                <ShieldCheck size={48} style={{ margin: '0 auto 1rem' }} />
                                <p style={{ fontSize: '0.8125rem' }}>No variances detected</p>
                            </div>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                {discrepancies.map(p => (
                                    <Link key={p.id} href={`/dashboard/purchase-orders/${p.id}`} style={{ textDecoration: 'none' }}>
                                        <div style={{ padding: '1rem', borderRadius: '16px', background: 'rgba(255, 72, 66, 0.05)', border: '1px solid rgba(255, 72, 66, 0.1)', transition: 'all 0.2s' }} className="hover:scale-[1.02]">
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '4px' }}>
                                                <div style={{ fontSize: '0.8125rem', fontWeight: 800, color: '#FFF' }}>{p.poNumber}</div>
                                                <div style={{ fontSize: '0.8125rem', fontWeight: 900, color: '#FF4842' }}>{formatCurrency(p.totalAmount, p.currency || currency)}</div>
                                            </div>
                                            <div style={{ fontSize: '0.7rem', color: 'rgba(255, 255, 255, 0.5)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                {p.discrepancyNote || 'Quantity variance detected during receiving.'}
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        )}
                    </div>

                    <div style={{ background: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255, 255, 255, 0.05)', borderRadius: '24px', padding: '1.5rem' }}>
                        <h2 style={{ fontSize: '1rem', fontWeight: 900, marginBottom: '1.5rem' }}>Budget Velocity</h2>
                        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem' }}>
                            <BudgetDonutChart total={stats.budgetUsage.total || 1} used={stats.budgetUsage.used || 0} />
                        </div>
                        <div style={{ padding: '1rem', borderRadius: '12px', background: 'rgba(255, 255, 255, 0.03)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text-secondary)' }}>Burn Rate</span>
                            <span style={{ fontSize: '0.8125rem', fontWeight: 900, color: '#00AB55' }}>Healthy</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

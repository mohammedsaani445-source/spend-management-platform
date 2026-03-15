"use client";

import { useEffect, useState } from "react";
import { getSourcingKpis } from "@/lib/sourcing";
import { AppUser } from "@/types";
import { 
    LayoutDashboard, 
    PiggyBank, 
    Target, 
    TrendingUp, 
    ArrowRight,
    Search,
    Filter
} from "lucide-react";

import styles from "./SourcingDashboard.module.css";

interface SourcingDashboardProps {
    user: AppUser;
}

export default function SourcingDashboard({ user }: SourcingDashboardProps) {
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchKpis() {
            try {
                const data = await getSourcingKpis(user.tenantId);
                setStats(data);
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        }
        fetchKpis();
    }, [user.tenantId]);

    if (loading) return <div className={styles.textCenter} style={{ padding: '4rem', color: 'var(--text-secondary)' }}>Calculating Savings...</div>;
    if (!stats) return <div className={styles.textCenter} style={{ padding: '4rem', color: 'var(--error)' }}>Failed to load analytics.</div>;

    return (
        <div className={styles.container}>
            {/* Header */}
            <div className={styles.header}>
                <h2>
                    <LayoutDashboard size={32} style={{ color: 'var(--brand)' }} />
                    Sourcing Savings Analytics
                </h2>
                <p>
                    Realized savings and procurement efficiency tracking.
                </p>
            </div>

            {/* KPI Cards */}
            <div className={styles.kpiGrid}>
                <div className={styles.kpiCard}>
                    <div className={styles.kpiHeader}>
                        <div className={styles.iconWrapper} style={{ background: 'var(--brand-soft)', color: 'var(--brand)' }}>
                            <PiggyBank size={24} />
                        </div>
                        <span className={styles.badge} style={{ background: 'var(--success-soft)', color: 'var(--success)' }}>
                            Realized
                        </span>
                    </div>
                    <div>
                        <span className={styles.label}>Total Savings</span>
                        <h3 className={styles.value}>
                            ${stats.totalSavings.toLocaleString()}
                        </h3>
                    </div>
                </div>

                <div className={styles.kpiCard}>
                    <div className={styles.kpiHeader}>
                        <div className={styles.iconWrapper} style={{ background: '#F3E5F5', color: '#7B1FA2' }}>
                            <Target size={24} />
                        </div>
                    </div>
                    <div>
                        <span className={styles.label}>Avg. Savings %</span>
                        <h3 className={styles.value}>
                            {stats.avgSavingsPercentage.toFixed(1)}%
                        </h3>
                    </div>
                </div>

                <div className={styles.kpiCard}>
                    <div className={styles.kpiHeader}>
                        <div className={styles.iconWrapper} style={{ background: 'var(--success-soft)', color: 'var(--success)' }}>
                            <TrendingUp size={24} />
                        </div>
                    </div>
                    <div>
                        <span className={styles.label}>Awarded Tenders</span>
                        <h3 className={styles.value}>
                            {stats.totalAwardedCount}
                        </h3>
                    </div>
                </div>
            </div>

            {/* Detailed Table */}
            <div className={styles.tableContainer}>
                <div className={styles.tableHeader}>
                    <h3 className={styles.title}>Sourcing Outcomes</h3>
                    <div className={styles.tableActions}>
                        <button className={styles.actionIconBtn}>
                            <Filter size={18} />
                        </button>
                        <button className={styles.actionIconBtn}>
                            <Search size={18} />
                        </button>
                    </div>
                </div>
                <div className={styles.overflowX}>
                    <table className={styles.table}>
                        <thead>
                            <tr>
                                <th>Tender / RFP</th>
                                <th className={styles.textRight}>Budget</th>
                                <th className={styles.textRight}>Awarded</th>
                                <th className={styles.textRight}>Savings</th>
                                <th className={styles.textRight}>Savings %</th>
                                <th className={styles.textCenter}>Bids</th>
                            </tr>
                        </thead>
                        <tbody>
                            {stats.results.map((r: any) => (
                                <tr key={r.id}>
                                    <td>
                                        <div className={styles.tenderTitle}>{r.title}</div>
                                        <div className={styles.tenderId}>ID: {r.id.slice(-8).toUpperCase()}</div>
                                    </td>
                                    <td className={`${styles.amount} ${styles.textRight}`} style={{ color: 'var(--text-secondary)' }}>
                                        ${r.budget.toLocaleString()}
                                    </td>
                                    <td className={`${styles.amount} ${styles.textRight}`}>
                                        ${r.awardedAmount.toLocaleString()}
                                    </td>
                                    <td className={`${styles.savings} ${styles.textRight}`}>
                                        +${r.savings.toLocaleString()}
                                    </td>
                                    <td className={styles.textRight}>
                                        <span className={`${styles.pctBadge} ${
                                            r.savingsPercentage > 15 ? styles.pctHigh : styles.pctMid
                                        }`}>
                                            {r.savingsPercentage.toFixed(1)}%
                                        </span>
                                    </td>
                                    <td className={styles.textCenter} style={{ color: 'var(--text-secondary)' }}>
                                        {r.bidVariance.count}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <div className={styles.tableFooter}>
                    <button className={styles.footerBtn}>
                        View Detailed Variance Report
                        <ArrowRight size={16} />
                    </button>
                </div>
            </div>
        </div>
    );
}

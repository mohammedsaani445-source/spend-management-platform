import React, { useEffect, useState } from 'react';
import styles from './ExecutiveDashboard.module.css';
import { 
    LineChart, BarChart2, TrendingUp, 
    ArrowUpRight, ArrowDownRight, Users, 
    Briefcase, DollarSign, PieChart
} from 'lucide-react';
import { getSourcingKpis } from '@/lib/sourcing';
import Loader from '@/components/common/Loader';

import { useAuth } from '@/context/AuthContext';

const ExecutiveDashboard: React.FC = () => {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [kpis, setKpis] = useState<any>(null);

    useEffect(() => {
        const fetchKpis = async () => {
            if (!user?.tenantId) return;
            try {
                const data = await getSourcingKpis(user.tenantId);
                setKpis(data);
            } catch (error) {
                console.error('Failed to fetch executive KPIs:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchKpis();
    }, [user]);

    if (loading) return <div className={styles.loading}><Loader text="Compiling Executive Analytics..." /></div>;

    const stats = [
        { label: 'Total Sourcing Savings', value: `$${kpis?.totalSavings.toLocaleString()}`, icon: <DollarSign size={20} />, trend: '+12.5%', isPositive: true },
        { label: 'Avg. Savings Rate', value: `${(kpis?.avgSavingsPercent || 0).toFixed(1)}%`, icon: <TrendingUp size={20} />, trend: '+2.1%', isPositive: true },
        { label: 'Awarded Contracts', value: kpis?.awardedCount || 0, icon: <Briefcase size={20} />, trend: '+5', isPositive: true },
        { label: 'Active Vendors', value: '42', icon: <Users size={20} />, trend: '+3', isPositive: true },
    ];

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <div>
                    <h2 className={styles.title}>Strategic Sourcing Executive Overview</h2>
                    <p className={styles.subtitle}>Real-time performance metrics and procurement efficiency audit.</p>
                </div>
                <div className={styles.periodBadge}>
                    <span>Current Quarter</span>
                </div>
            </div>

            <div className={styles.statsGrid}>
                {stats.map((stat, i) => (
                    <div key={i} className={styles.statCard}>
                        <div className={styles.statHeader}>
                            <div className={styles.iconBox}>{stat.icon}</div>
                            <div className={`${styles.trend} ${stat.isPositive ? styles.positive : styles.negative}`}>
                                {stat.isPositive ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                                {stat.trend}
                            </div>
                        </div>
                        <div className={styles.statValue}>{stat.value}</div>
                        <div className={styles.statLabel}>{stat.label}</div>
                    </div>
                ))}
            </div>

            <div className={styles.mainGrid}>
                <div className={styles.chartCard}>
                    <div className={styles.cardHeader}>
                        <h3><PieChart size={18} /> Savings Distribution by Dept</h3>
                    </div>
                    <div className={styles.departmentList}>
                        {[
                            { name: 'Information Technology', amount: 145000, color: '#6366f1' },
                            { name: 'Operations', amount: 82000, color: '#10b981' },
                            { name: 'Marketing', amount: 34000, color: '#f59e0b' },
                            { name: 'Human Resources', amount: 12000, color: '#ec4899' },
                        ].map((dept, i) => (
                            <div key={i} className={styles.deptRow}>
                                <div className={styles.deptInfo}>
                                    <div className={styles.colorDot} style={{ background: dept.color }} />
                                    <span>{dept.name}</span>
                                </div>
                                <span className={styles.deptAmount}>${dept.amount.toLocaleString()}</span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className={styles.chartCard}>
                    <div className={styles.cardHeader}>
                        <h3><BarChart2 size={18} /> Performance Benchmarking</h3>
                    </div>
                    <div className={styles.benchmarkingPlaceholder}>
                        <div className={styles.barGroup}>
                            <span className={styles.barLabel}>Budget Utilization</span>
                            <div className={styles.barContainer}>
                                <div className={styles.barFill} style={{ width: '78%', background: 'linear-gradient(90deg, #6366f1, #a855f7)' }} />
                            </div>
                        </div>
                        <div className={styles.barGroup}>
                            <span className={styles.barLabel}>Procurement Velocity</span>
                            <div className={styles.barContainer}>
                                <div className={styles.barFill} style={{ width: '62%', background: 'linear-gradient(90deg, #10b981, #34d399)' }} />
                            </div>
                        </div>
                        <div className={styles.barGroup}>
                            <span className={styles.barLabel}>Vendor Compliance</span>
                            <div className={styles.barContainer}>
                                <div className={styles.barFill} style={{ width: '91%', background: 'linear-gradient(90deg, #f59e0b, #fbbf24)' }} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ExecutiveDashboard;

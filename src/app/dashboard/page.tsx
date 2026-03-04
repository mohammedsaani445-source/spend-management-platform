"use client";

import { useAuth } from "@/context/AuthContext";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { getRequisitions } from "@/lib/requisitions";
import { getSpendAnalytics } from "@/lib/analytics";
import { DashboardEvent, Requisition } from "@/types";
import ExecutiveDashboard from "@/components/dashboard/ExecutiveDashboard";
import EmployeeDashboard from "@/components/dashboard/EmployeeDashboard";
import { getVendorPerformanceAnalytics, VendorPerformance } from "@/lib/vendorAnalytics";

export default function Dashboard() {
    const { user, loading: authLoading } = useAuth();
    const searchParams = useSearchParams();
    const [stats, setStats] = useState({
        pendingCount: 0,
        activeCount: 0,
        totalSpend: 0,
        savings: 0,
        avgApprovalDays: 0,
        monthlyData: [] as any[],
        activityFeed: [] as DashboardEvent[],
        spendByCategory: {} as Record<string, number>,
        budgetUsage: { total: 0, used: 0, percent: 0 },
        carbonFootprint: { totalCo2e: 0, byDepartment: {} as Record<string, number> }
    });
    const [requisitions, setRequisitions] = useState<Requisition[]>([]);
    const [vendorPerf, setVendorPerf] = useState<VendorPerformance[]>([]);
    const [loading, setLoading] = useState(true);
    const [targetCurrency, setTargetCurrency] = useState('USD');

    const loadData = async (currency: string = 'USD') => {
        if (!user) return;
        setLoading(true);
        try {
            const [reqs, analytics, vPerf] = await Promise.all([
                getRequisitions(user),
                getSpendAnalytics(user, currency),
                getVendorPerformanceAnalytics(user)
            ]);

            const pending = reqs.filter(r => r.status === 'PENDING').length;

            setRequisitions(reqs);
            setVendorPerf(vPerf);
            setStats({
                pendingCount: pending,
                activeCount: reqs.length,
                totalSpend: analytics.totalSpend,
                savings: analytics.savings,
                avgApprovalDays: analytics.avgApprovalDays,
                monthlyData: analytics.monthlySpend,
                activityFeed: analytics.activityFeed,
                spendByCategory: analytics.spendByCategory,
                budgetUsage: analytics.budgetUsage,
                carbonFootprint: analytics.carbonFootprint
            });
        } catch (error) {
            console.error("Error loading dashboard data:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!authLoading) {
            loadData(targetCurrency);
        }
    }, [authLoading, targetCurrency]);

    if (authLoading || loading) {
        return (
            <div style={{ height: 'calc(100vh - 80px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ textAlign: 'center' }}>
                    <div className="animate-spin" style={{ fontSize: '2rem', marginBottom: '1rem' }}>🔄</div>
                    <p style={{ color: '#64748b' }}>Loading your command center...</p>
                </div>
            </div>
        );
    }

    if (!user) return null;

    // Smart Router: Determine which dashboard to show
    const isExecutive = ['ADMIN', 'APPROVER', 'FINANCE'].includes(user.role);

    return (
        <div style={{ padding: '0 0 2rem 0' }}>
            {isExecutive ? (
                <ExecutiveDashboard
                    user={user}
                    stats={stats}
                    vendorPerf={vendorPerf}
                    currency={targetCurrency}
                    onCurrencyChange={setTargetCurrency}
                />
            ) : (
                <EmployeeDashboard user={user} requisitions={requisitions} />
            )}
        </div>
    );
}


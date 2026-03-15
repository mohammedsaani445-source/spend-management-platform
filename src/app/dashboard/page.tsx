"use client";

import { useAuth } from "@/context/AuthContext";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { getRequisitions } from "@/lib/requisitions";
import { getSpendAnalytics } from "@/lib/analytics";
import { DashboardEvent, Requisition } from "@/types";
import ExecutiveDashboard from "@/components/dashboard/ExecutiveDashboard";
import EmployeeDashboard from "@/components/dashboard/EmployeeDashboard";
import FinanceDashboard from "@/components/dashboard/FinanceDashboard";
import ProcurementDashboard from "@/components/dashboard/ProcurementDashboard";
import OperationsDashboard from "@/components/dashboard/OperationsDashboard";
import ApproverDashboard from "@/components/dashboard/ApproverDashboard";
import { getPurchaseOrders } from "@/lib/purchaseOrders";
import { getAssets } from "@/lib/assets";
import { getSKUs, getStockLevels } from "@/lib/inventory";
import Loader from "@/components/common/Loader";
import { PurchaseOrder } from "@/types";

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
        carbonFootprint: { totalCo2e: 0, byDepartment: {} as Record<string, number> },
        assetCount: 0,
        inventoryValue: 0,
        lowStockItems: 0
    });
    const [requisitions, setRequisitions] = useState<Requisition[]>([]);
    const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([]);
    const [loading, setLoading] = useState(true);
    const [targetCurrency, setTargetCurrency] = useState('USD');

    const loadData = async (currency: string = 'USD') => {
        if (!user) return;
        setLoading(true);
        try {
            const [reqs, pos, analytics, assets, skus, levelRecord] = await Promise.all([
                getRequisitions(user),
                getPurchaseOrders(user),
                getSpendAnalytics(user, currency),
                getAssets(user.tenantId, user),
                getSKUs(user.tenantId),
                getStockLevels(user.tenantId)
            ]);

            const pending = reqs.filter(r => r.status === 'PENDING').length;

            setRequisitions(reqs);
            setPurchaseOrders(pos);
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
                carbonFootprint: analytics.carbonFootprint,
                assetCount: assets.length,
                inventoryValue: skus.reduce((sum, sku) => {
                    const whLevels = Object.values(levelRecord);
                    const totalQty = whLevels.reduce((acc, wh) => acc + (wh[sku.id!]?.quantity || 0), 0);
                    return sum + (totalQty * (sku.unitPrice || 0));
                }, 0),
                lowStockItems: skus.filter(sku => {
                    const whLevels = Object.values(levelRecord);
                    const totalQty = whLevels.reduce((acc, wh) => acc + (wh[sku.id!]?.quantity || 0), 0);
                    return totalQty <= sku.minStockLevel;
                }).length
            });
        } catch (error) {
            console.error("Error loading dashboard data:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const syncCurrency = async () => {
            if (!authLoading && user) {
                try {
                    const { db, DB_PREFIX } = await import("@/lib/firebase");
                    const { ref, get } = await import("firebase/database");
                    const settingsSnap = await get(ref(db, `${DB_PREFIX}/tenants/${user.tenantId}/settings`));
                    if (settingsSnap.exists() && settingsSnap.val().baseCurrency) {
                        setTargetCurrency(settingsSnap.val().baseCurrency);
                    } else if (user.currency) {
                        setTargetCurrency(user.currency);
                    }
                } catch (e) {
                    console.error("Failed to sync currency:", e);
                }
            }
        };
        syncCurrency();
    }, [authLoading, user]);

    useEffect(() => {
        if (!authLoading && targetCurrency) {
            loadData(targetCurrency);
        }
    }, [authLoading, targetCurrency]);

    if (authLoading || loading) {
        return (
            <Loader fullScreen={true} text="Loading your command center..." />
        );
    }

    if (!user) return null;

    // Tactical Router: Determine which dashboard to show based on Role Clusters
    const renderDashboard = () => {
        const role = user.role;

        // 1. Admin/Executive View (Global Visibility)
        if (['ADMIN', 'WORKSPACE_ADMIN', 'PLATFORM_SUPERUSER'].includes(role)) {
            return (
                <ExecutiveDashboard
                    user={user}
                    stats={stats}
                    pos={purchaseOrders}
                    currency={targetCurrency}
                    onCurrencyChange={setTargetCurrency}
                />
            );
        }

        // 2. Finance Cluster
        if (['FINANCE_MANAGER', 'FINANCE_SPECIALIST', 'ACCOUNTS_PAYABLE'].includes(role)) {
            return <FinanceDashboard user={user} stats={stats} pos={purchaseOrders} currency={targetCurrency} />;
        }

        // 3. Procurement Cluster
        if (['PROCUREMENT_OFFICER', 'STRATEGIC_SOURCER'].includes(role)) {
            return <ProcurementDashboard user={user} stats={stats} pos={purchaseOrders} currency={targetCurrency} />;
        }

        // 4. Operations Cluster
        if (['OPERATIONS_RECEIVER'].includes(role)) {
            return <OperationsDashboard user={user} stats={stats} />;
        }

        // 5. Approver View
        if (role === 'AUTHORIZED_APPROVER') {
            return <ApproverDashboard user={user} stats={stats} currency={targetCurrency} />;
        }

        // Default: Employee/Requester View
        return <EmployeeDashboard user={user} requisitions={requisitions} />;
    };

    return (
        <div style={{ padding: '0 0 2rem 0' }}>
            {renderDashboard()}
        </div>
    );
}


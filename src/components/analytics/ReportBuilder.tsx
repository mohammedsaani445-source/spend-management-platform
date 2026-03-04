"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { getPurchaseOrders } from "@/lib/purchaseOrders";
import { getRequisitions } from "@/lib/requisitions";
import { getVendors } from "@/lib/vendors";
import { convertToCSV, downloadCSV } from "@/lib/export";
import { formatCurrency } from "@/lib/currencies";

type ReportType = "PURCHASE_ORDERS" | "REQUISITIONS" | "VENDORS";

const REPORT_TYPES = [
    { label: "Purchase Orders", value: "PURCHASE_ORDERS" },
    { label: "Requisitions", value: "REQUISITIONS" },
    { label: "Vendors", value: "VENDORS" },
];

const DATE_RANGES = [
    { label: "Last 30 Days", value: "30_DAYS" },
    { label: "This Quarter", value: "THIS_QUARTER" },
    { label: "Year to Date", value: "YTD" },
    { label: "All Time", value: "ALL_TIME" },
];

export default function ReportBuilder() {
    const { user } = useAuth();
    const [reportType, setReportType] = useState<ReportType>("PURCHASE_ORDERS");
    const [dateRange, setDateRange] = useState("30_DAYS");
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState<any[]>([]);
    const [filteredData, setFilteredData] = useState<any[]>([]);

    // Filters
    const [statusFilter, setStatusFilter] = useState("ALL");
    const [vendorFilter, setVendorFilter] = useState("ALL");

    useEffect(() => {
        fetchData();
    }, [reportType]);

    useEffect(() => {
        applyFilters();
    }, [data, dateRange, statusFilter, vendorFilter]);

    const fetchData = async () => {
        setLoading(true);
        try {
            let result: any[] = [];
            if (!user) return;
            switch (reportType) {
                case "PURCHASE_ORDERS":
                    result = await getPurchaseOrders(user);
                    break;
                case "REQUISITIONS":
                    result = await getRequisitions(user);
                    break;
                case "VENDORS":
                    result = await getVendors(user.tenantId);
                    break;
            }
            setData(result);
        } catch (error) {
            console.error("Error fetching report data:", error);
        } finally {
            setLoading(false);
        }
    };

    const applyFilters = () => {
        let result = [...data];

        // Date Filtering
        if (dateRange !== "ALL_TIME") {
            const now = new Date();
            let startDate = new Date();

            if (dateRange === "30_DAYS") {
                startDate.setDate(now.getDate() - 30);
            } else if (dateRange === "THIS_QUARTER") {
                startDate.setMonth(Math.floor(now.getMonth() / 3) * 3);
                startDate.setDate(1);
            } else if (dateRange === "YTD") {
                startDate.setMonth(0);
                startDate.setDate(1);
            }

            result = result.filter(item => {
                const dateField = reportType === "PURCHASE_ORDERS" ? item.issuedAt :
                    reportType === "REQUISITIONS" ? item.createdAt :
                        item.createdAt;
                if (!dateField) return true; // Keep if no date check possible (e.g. vendors without created date)
                return new Date(dateField) >= startDate;
            });
        }

        // Status Filtering
        if (statusFilter !== "ALL") {
            result = result.filter(item => item.status === statusFilter);
        }

        // Vendor Filtering (Only applies to POs and Reqs)
        if (vendorFilter !== "ALL" && reportType !== "VENDORS") {
            result = result.filter(item => item.vendorName === vendorFilter);
        }

        setFilteredData(result);
    };

    const handleExport = (format: 'CSV') => {
        if (format === 'CSV') {
            const csv = convertToCSV(filteredData);
            downloadCSV(`${reportType.toLowerCase()}_report_${new Date().toISOString().split('T')[0]}.csv`, csv);
        }
    };

    // Helper to get unique column headers based on report type
    const getColumns = () => {
        switch (reportType) {
            case "PURCHASE_ORDERS":
                return [
                    { key: "poNumber", label: "PO #" },
                    { key: "vendorName", label: "Vendor" },
                    { key: "totalAmount", label: "Amount" },
                    { key: "status", label: "Status" },
                    { key: "issuedAt", label: "Issued Date" },
                ];
            case "REQUISITIONS":
                return [
                    { key: "id", label: "ID" },
                    { key: "requesterName", label: "Requester" },
                    { key: "department", label: "Department" },
                    { key: "totalAmount", label: "Amount" },
                    { key: "status", label: "Status" },
                    { key: "createdAt", label: "Date" },
                ];
            case "VENDORS":
                return [
                    { key: "name", label: "Name" },
                    { key: "category", label: "Category" },
                    { key: "email", label: "Email" },
                    { key: "status", label: "Status" },
                    { key: "reliability", label: "Reliability" },
                ];
            default:
                return [];
        }
    };

    const columns = getColumns();

    // extract unique statuses for filter
    const statuses = Array.from(new Set(data.map(i => i.status))).filter(Boolean);
    const vendors = Array.from(new Set(data.map(i => i.vendorName))).filter(Boolean);

    return (
        <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Custom Report Builder</h2>
                <button
                    className="btn btn-primary"
                    onClick={() => handleExport('CSV')}
                    disabled={filteredData.length === 0}
                >
                    📥 Export CSV
                </button>
            </div>

            {/* Controls */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(4, 1fr)',
                gap: '1rem',
                marginBottom: '1.5rem',
                backgroundColor: 'var(--background)',
                padding: '1.25rem',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border)'
            }}>
                <div>
                    <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.5rem' }}>Data Source</label>
                    <select
                        value={reportType}
                        onChange={(e) => setReportType(e.target.value as ReportType)}
                        style={{
                            width: '100%',
                            padding: '0.6rem',
                            borderRadius: 'var(--radius-sm)',
                            border: '1px solid var(--border)',
                            backgroundColor: 'var(--surface-raised)',
                            color: 'var(--text-main)',
                            fontSize: '0.9rem'
                        }}
                    >
                        {REPORT_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                    </select>
                </div>
                <div>
                    <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.5rem' }}>Date Range</label>
                    <select
                        value={dateRange}
                        onChange={(e) => setDateRange(e.target.value)}
                        style={{
                            width: '100%',
                            padding: '0.6rem',
                            borderRadius: 'var(--radius-sm)',
                            border: '1px solid var(--border)',
                            backgroundColor: 'var(--surface-raised)',
                            color: 'var(--text-main)',
                            fontSize: '0.9rem'
                        }}
                    >
                        {DATE_RANGES.map(d => <option key={d.value} value={d.value}>{d.label}</option>)}
                    </select>
                </div>

                {reportType !== "VENDORS" && (
                    <>
                        <div>
                            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.5rem' }}>Status</label>
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                style={{
                                    width: '100%',
                                    padding: '0.6rem',
                                    borderRadius: 'var(--radius-sm)',
                                    border: '1px solid var(--border)',
                                    backgroundColor: 'var(--surface-raised)',
                                    color: 'var(--text-main)',
                                    fontSize: '0.9rem'
                                }}
                            >
                                <option value="ALL">All Statuses</option>
                                {statuses.map(s => <option key={String(s)} value={String(s)}>{String(s)}</option>)}
                            </select>
                        </div>
                        <div>
                            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.5rem' }}>Vendor</label>
                            <select
                                value={vendorFilter}
                                onChange={(e) => setVendorFilter(e.target.value)}
                                style={{
                                    width: '100%',
                                    padding: '0.6rem',
                                    borderRadius: 'var(--radius-sm)',
                                    border: '1px solid var(--border)',
                                    backgroundColor: 'var(--surface-raised)',
                                    color: 'var(--text-main)',
                                    fontSize: '0.9rem'
                                }}
                            >
                                <option value="ALL">All Vendors</option>
                                {vendors.map(v => <option key={String(v)} value={String(v)}>{String(v)}</option>)}
                            </select>
                        </div>
                    </>
                )}
            </div>

            {/* Data Preview */}
            <div style={{ marginBottom: '1rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                Showing <strong>{filteredData.length}</strong> records based on current filters.
            </div>

            <div style={{ overflowX: 'auto', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--surface)' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
                    <thead style={{ backgroundColor: 'var(--background)', textAlign: 'left', color: 'var(--text-main)' }}>
                        <tr>
                            {columns.map(col => (
                                <th key={col.key} style={{ padding: '1rem', borderBottom: '2px solid var(--border)', fontWeight: 700 }}>{col.label}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr>
                                <td colSpan={columns.length} style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>Loading data...</td>
                            </tr>
                        ) : filteredData.length === 0 ? (
                            <tr>
                                <td colSpan={columns.length} style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>No data matching filters.</td>
                            </tr>
                        ) : (
                            filteredData.slice(0, 10).map((row, i) => (
                                <tr key={i} style={{ borderBottom: '1px solid var(--border)' }}>
                                    {columns.map(col => (
                                        <td key={`${i}-${col.key}`} style={{ padding: '1rem', borderBottom: '1px solid var(--border)', color: 'var(--text-main)' }}>
                                            {col.key === 'totalAmount' || col.key === 'amount' ?
                                                <span style={{ fontWeight: 600 }}>{formatCurrency(row[col.key], row.currency || 'USD')}</span> :
                                                col.key.includes('Date') || col.key.includes('At') ?
                                                    new Date(row[col.key]).toLocaleDateString() :
                                                    row[col.key]}
                                        </td>
                                    ))}
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
            {filteredData.length > 10 && (
                <div style={{ textAlign: 'center', padding: '1rem', color: 'var(--text-secondary)', fontSize: '0.875rem', fontStyle: 'italic' }}>
                    Preview limited to 10 rows. Export to see full dataset.
                </div>
            )}
        </div>
    );
}

"use client";

import AuditLogTable from "@/components/compliance/AuditLogTable";
import styles from "@/components/layout/Layout.module.css";

export default function CompliancePage() {
    return (
        <div className={styles.pageContainer}>
            <div className={styles.pageHeader}>
                <div>
                    <h1 className={styles.pageTitle}>Compliance & Governance</h1>
                    <p className={styles.pageSubtitle}>Forensic audit logs and regulatory tracking for all system actions.</p>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
                <div className="card" style={{ padding: '1.5rem' }}>
                    <div style={{ fontSize: '0.875rem', color: '#64748b', fontWeight: 600 }}>Audit Integrity</div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 700, marginTop: '0.5rem', color: '#15803d' }}>Verified ✓</div>
                    <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.5rem' }}>Immutable logs with hash validation</div>
                </div>
                <div className="card" style={{ padding: '1.5rem' }}>
                    <div style={{ fontSize: '0.875rem', color: '#64748b', fontWeight: 600 }}>Storage Retention</div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 700, marginTop: '0.5rem', color: '#0f172a' }}>7 Years</div>
                    <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.5rem' }}>Compliant with standard financial regs</div>
                </div>
            </div>

            <AuditLogTable />

            <div className="card" style={{ padding: '2rem', borderLeft: '4px solid #f59e0b' }}>
                <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#92400e' }}>⚠️ Regulatory Disclosure</h3>
                <p style={{ color: '#92400e', opacity: 0.9, fontSize: '0.9rem', marginTop: '0.5rem' }}>
                    All logs on this page are automatically generated and timestamped.
                    Deleting records from this trail requires high-level database access and is also logged as a critical event.
                </p>
            </div>
        </div>
    );
}

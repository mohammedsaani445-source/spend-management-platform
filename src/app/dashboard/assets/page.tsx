"use client";

import AssetRegistry from "@/components/assets/AssetRegistry";
import styles from "@/components/layout/Layout.module.css";

export default function AssetsPage() {
    return (
        <div className={styles.pageContainer}>
            <div className={styles.pageHeader}>
                <div>
                    <h1 className={styles.pageTitle}>Company Assets</h1>
                    <p className={styles.pageSubtitle}>Track and manage fixed assets and equipment lifecycle.</p>
                </div>
            </div>

            <div style={{ marginTop: '2rem' }}>
                <AssetRegistry />
            </div>

            <div className="card" style={{ padding: '2rem', background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)', color: 'white' }}>
                <h3 style={{ margin: 0, fontSize: '1.1rem' }}>💡 Asset Tracking Tip</h3>
                <p style={{ opacity: 0.8, fontSize: '0.9rem', marginTop: '0.5rem' }}>
                    You can automatically create assets by marking Purchase Orders as "Received" in the Procurement section.
                    This ensures your registry is always synchronized with your spending.
                </p>
            </div>
        </div>
    );
}

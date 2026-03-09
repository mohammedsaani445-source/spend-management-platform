"use client";

import Link from "next/link";
import { useParams, notFound } from "next/navigation";
import {
    Zap, Shield, BarChart3, Smartphone,
    Check, ArrowLeft, Cpu, Lock, MousePointer2
} from "lucide-react";
import styles from "../Features.module.css";
import { Logo } from "@/components/common/Logo";

const FEATURE_DATA = {
    "autonomous-ap": {
        badge: "Automation Excellence",
        title: "Autonomous AP: The End of Manual Accounts Payable",
        description: "Our high-fidelity AI engine processes every invoice with 99.9% accuracy, liberating your finance team from data entry.",
        mainContent: {
            headline: "Proprietary AI OCR Technology",
            text: "Apex Procure doesn't just scan; it understands. Our neural networks are trained on millions of financial documents to capture every line item, tax value, and vendor detail with unmatched precision.",
            features: [
                "Real-time field extraction (No loading bars)",
                "Zero-touch PO matching logic",
                "Automated vendor tax ID verification",
                "Direct export to major ERP systems"
            ],
            visualLabel: "AI Scanning Interface"
        }
    },
    "fraud-protection": {
        badge: "Next-Gen Security",
        title: "Guardrail AI™: Real-Time Fraud Protection",
        description: "Protect your bottom line with an intelligent shield that monitors every transaction, ensuring every dollar is authorized and secure.",
        mainContent: {
            headline: "Multi-Layered Anomaly Detection",
            text: "Our Guardrail AI™ engine runs 50+ background checks on every invoice, looking for duplicate submissions, bank detail changes, and suspicious vendor behavior.",
            features: [
                "Duplicate invoice detection (Fuzzy matching)",
                "Vendor bank account change alerts",
                "Social engineering risk scoring",
                "Budget threshold guardrails"
            ],
            visualLabel: "Fraud Risk Analyst"
        }
    },
    "spend-insights": {
        badge: "Actionable Intelligence",
        title: "Deep Spend Insights & Analytics",
        description: "Transform raw spending data into competitive advantages. Gain a crystal-clear view of where your money goes.",
        mainContent: {
            headline: "Predictive Budget Forecasting",
            text: "Stop looking at the rearview mirror. Our analytics engine uses historic trends to predict future spend, helping you allocate capital more effectively.",
            features: [
                "Automated category classification",
                "Real-time budget vs. actuals tracking",
                "Leakage and savings identification",
                "Executive-ready reporting suite"
            ],
            visualLabel: "Spend Analytics Dashboard"
        }
    },
    "mobile-procurement": {
        badge: "On-the-Go Management",
        title: "100% Mobile Ready Infrastructure",
        description: "The power of a full procurement office in your pocket. Optimized for zero friction on any device.",
        mainContent: {
            headline: "Proprietary Smart Card View",
            text: "We reinvented the data table for mobile. Our 'Smart Card' architecture ensures that complex procurement data is perfectly readable and actionable on a smartphone.",
            features: [
                "One-tap approval workflows",
                "Mobile receipt capture with AI OCR",
                "Barcode scanning for receiving",
                "Real-time push notifications for approvals"
            ],
            visualLabel: "Mobile Native Experience"
        }
    }
};

export default function FeatureDetail() {
    const params = useParams();
    const slug = params.slug as string;
    const data = FEATURE_DATA[slug as keyof typeof FEATURE_DATA];

    if (!data) {
        notFound();
    }

    const icons = {
        "autonomous-ap": <Zap />,
        "fraud-protection": <Shield />,
        "spend-insights": <BarChart3 />,
        "mobile-procurement": <Smartphone />
    };

    const currentIcon = icons[slug as keyof typeof icons] || <Cpu />;

    return (
        <div className={styles.featureDetailWrapper}>
            <nav className={styles.nav}>
                <Link href="/" className={styles.logoArea}>
                    <Logo size={32} />
                    <span>APEX PROCURE</span>
                </Link>
                <Link href="/" className="btn btn-secondary">
                    <ArrowLeft size={16} /> Back to Home
                </Link>
            </nav>

            <header className={styles.hero}>
                <span className={styles.badge}>{data.badge}</span>
                <h1 className={styles.title}>{data.title}</h1>
                <p className={styles.description}>{data.description}</p>
                <Link href="/login" className="btn btn-primary btn-lg">
                    Try this feature now
                </Link>
            </header>

            <section className={styles.contentGrid}>
                <div className={styles.textContent}>
                    <h2>{data.mainContent.headline}</h2>
                    <p>{data.mainContent.text}</p>
                    <ul className={styles.featureList}>
                        {data.mainContent.features.map((f, i) => (
                            <li key={i} className={styles.featureItem}>
                                <div className={styles.iconBox}><Check size={14} /></div>
                                <span>{f}</span>
                            </li>
                        ))}
                    </ul>
                </div>
                <div className={styles.visualArea}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
                        <div style={{ padding: '0.75rem', background: '#FFFFFF', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', color: '#E8572A' }}>
                            {currentIcon}
                        </div>
                        <div>
                            <div style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: '#919EAB', letterSpacing: '0.05em' }}>PREVIEW</div>
                            <div style={{ fontWeight: 800 }}>{data.mainContent.visualLabel}</div>
                        </div>
                    </div>
                    <div style={{ background: '#FFFFFF', height: '300px', borderRadius: '16px', border: '1px solid #DFE3E8', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#DFE3E8' }}>
                        {/* Placeholder for feature-specific visual or GIF */}
                        <div style={{ textAlign: 'center' }}>
                            <Cpu size={48} strokeWidth={1} />
                            <div style={{ marginTop: '1rem', fontSize: '0.875rem' }}>Full product preview available in dashboard</div>
                        </div>
                    </div>
                </div>
            </section>

            <section className={styles.ctaSection}>
                <h2 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '1.5rem' }}>Ready to Experience the Difference?</h2>
                <p style={{ opacity: 0.8, maxWidth: '600px', margin: '0 auto 3rem' }}>
                    Join the elite finance teams using Apex Procure to automate their spend management.
                </p>
                <Link href="/login" className="btn btn-primary btn-lg">
                    Create Your Free Account
                </Link>
            </section>

            <footer className={styles.footer}>
                © 2026 Apex Procure. All rights reserved. Built for Industry-Grade Finance.
            </footer>
        </div>
    );
}

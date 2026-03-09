"use client";

import Link from "next/link";
import Image from "next/image";
import {
    Zap, Shield, BarChart3, ArrowRight,
    ChevronRight, Play, Globe, Cpu, Smartphone
} from "lucide-react";
import styles from "../VariantB.module.css";
import { Logo } from "@/components/common/Logo";

export default function VariantB() {
    return (
        <div className={styles.wrapper}>
            {/* --- NAVIGATION --- */}
            <nav className={styles.nav}>
                <Link href="/" className={styles.logoArea}>
                    <Logo size={36} variant="white" />
                    <span>APEX PROCURE</span>
                </Link>
                <div style={{ display: 'flex', gap: '2.5rem', alignItems: 'center' }}>
                    <Link href="/" style={{ color: '#919EAB', textDecoration: 'none', fontWeight: 600, fontSize: '0.9375rem' }}>Variant A</Link>
                    <Link href="/login" className="btn btn-primary" style={{ padding: '0.75rem 2rem', borderRadius: '30px' }}>
                        Book a Demo
                    </Link>
                </div>
            </nav>

            {/* --- HERO SECTION --- */}
            <section className={styles.hero}>
                <span className={styles.tag}>Powered by Guardrail AI™</span>
                <h1 className={styles.title}>
                    The Future of Enterprise <br />
                    Spend Management
                </h1>
                <p className={styles.subtitle}>
                    Apex Procure replaces fragmented tools with a single, intelligent platform.
                    Unify purchasing, AP automation, and analytics in one high-octane workspace.
                </p>

                <div style={{ display: 'flex', justifyContent: 'center', gap: '1.5rem' }}>
                    <Link href="/login" className="btn btn-primary" style={{ height: '56px', padding: '0 2.5rem', fontSize: '1.125rem', borderRadius: '32px' }}>
                        Join the Waitlist
                    </Link>
                    <button className="btn btn-secondary" style={{ height: '56px', padding: '0 2.5rem', fontSize: '1.125rem', borderRadius: '32px', background: 'rgba(255,255,255,0.05)', color: '#FFFFFF', borderColor: 'rgba(255,255,255,0.1)' }}>
                        <Play size={18} fill="currentColor" /> Live Product Demo
                    </button>
                </div>

                <div className={styles.heroVisual}>
                    <div style={{ background: '#1E293B', borderRadius: '24px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)' }}>
                        <Image
                            src="/hero-mockup.png"
                            alt="Apex Dashboard Dark"
                            width={1000}
                            height={600}
                            style={{ width: '100%', height: 'auto', opacity: 0.9 }}
                        />
                    </div>
                </div>
            </section>

            {/* --- FEATURE SECTION --- */}
            <section className={styles.featureGrid}>
                {[
                    {
                        icon: <Cpu />,
                        title: "Autonomous OCR",
                        text: "Our proprietary neural networks extract 99% of invoice data instantly. Zero human intervention needed.",
                        slug: "autonomous-ap"
                    },
                    {
                        icon: <Shield />,
                        title: "Guardrail AI™",
                        text: "Dynamic risk scoring and fraud detection built directly into your approval flows.",
                        slug: "fraud-protection"
                    },
                    {
                        icon: <BarChart3 />,
                        title: "Crystal Velocity",
                        text: "Real-time analytics that move at the speed of your business. Integrated budget forecasting.",
                        slug: "spend-insights"
                    }
                ].map((item, idx) => (
                    <div key={idx} className={styles.featureCard}>
                        <div className={styles.icon}>{item.icon}</div>
                        <h3 className={styles.featureTitle}>{item.title}</h3>
                        <p className={styles.featureText}>{item.text}</p>
                        <Link href={`/features/${item.slug}`} className={styles.learnMore}>
                            View Technical Specs <ChevronRight size={16} />
                        </Link>
                    </div>
                ))}
            </section>

            {/* --- LOGO STRIP --- */}
            <div style={{ padding: '40px 5%', textAlign: 'center', opacity: 0.4 }}>
                <p style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.2em', marginBottom: '2.5rem' }}>ENTERPRISE CLASS INTEGRATIONS</p>
                <div style={{ display: 'flex', justifyContent: 'center', gap: '4rem', flexWrap: 'wrap', grayscale: '100%', filter: 'invert(100%)' }}>
                    <span style={{ fontSize: '1.5rem', fontWeight: 900 }}>NETSUITE</span>
                    <span style={{ fontSize: '1.5rem', fontWeight: 900 }}>SAGE</span>
                    <span style={{ fontSize: '1.5rem', fontWeight: 900 }}>QUICKBOOKS</span>
                    <span style={{ fontSize: '1.5rem', fontWeight: 900 }}>XERO</span>
                </div>
            </div>

            {/* --- MOBILE SECTION --- */}
            <section style={{ padding: '120px 5%', textAlign: 'center' }}>
                <h2 style={{ fontSize: '3rem', fontWeight: 950, marginBottom: '4rem', letterSpacing: '-0.02em' }}>Built for the Mobile CEO.</h2>
                <div style={{ display: 'flex', justifyContent: 'center', gap: '3rem', flexWrap: 'wrap' }}>
                    <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', padding: '3rem', borderRadius: '32px', maxWidth: '400px', textAlign: 'left' }}>
                        <Smartphone size={40} color="#E8572A" style={{ marginBottom: '1.5rem' }} />
                        <h3 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '1rem' }}>Pocket Visibility</h3>
                        <p style={{ color: '#919EAB', lineHeight: 1.6 }}>Our responsive card-view ensures that total spend visibility is never just a desktop experience.</p>
                        <Link href="/features/mobile-procurement" className={styles.learnMore} style={{ marginTop: '2rem' }}>Mobile Overview <ArrowRight size={16} /></Link>
                    </div>
                    <div style={{ width: '280px', height: '560px', borderRadius: '40px', border: '8px solid rgba(255,255,255,0.1)', overflow: 'hidden' }}>
                        <Image src="/mobile-mockup.png" alt="Mobile View" width={280} height={560} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                </div>
            </section>

            {/* --- FINAL CTA --- */}
            <div className={styles.ctaSection}>
                <h2 style={{ fontSize: '3.5rem', fontWeight: 950, marginBottom: '1.5rem', letterSpacing: '-0.03em' }}>Ready to Lead?</h2>
                <p style={{ fontSize: '1.25rem', maxWidth: '600px', margin: '0 auto 3rem', opacity: 0.9 }}>
                    The most intelligent procure-to-pay platform is one click away.
                </p>
                <Link href="/login" className="btn btn-secondary" style={{ background: '#FFFFFF', color: '#E8572A', height: '64px', padding: '0 3rem', fontSize: '1.25rem', fontWeight: 800, borderRadius: '32px' }}>
                    Get Early Access
                </Link>
            </div>

            <footer style={{ padding: '60px 5% 40px', textAlign: 'center', color: '#637381', fontSize: '0.875rem' }}>
                <p>© 2026 Apex Procure. The Industry Standard for Intelligent Spend.</p>
            </footer>
        </div>
    );
}

"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import {
    Zap, Shield, BarChart3, ArrowRight, CheckCircle2,
    ChevronRight, PlayCircle, Globe, Lock, Cpu,
    स्मार्टफोन, Smartphone, CheckCircle, XCircle, Play
} from "lucide-react";
import { Logo } from "@/components/common/Logo";
import { useIntersection } from "@/hooks/useIntersection";
import styles from "../VariantB.module.css";
import motion from "../Animations.module.css";

export default function VariantB() {
    const [scrolled, setScrolled] = useState(false);

    // Intersection Refs
    const [heroRef, heroInView] = useIntersection();
    const [compRef, compInView] = useIntersection();
    const [gridRef, gridInView] = useIntersection();
    const [mobileRef, mobileInView] = useIntersection();
    const [ctaRef, ctaInView] = useIntersection();

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 50);
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    return (
        <div className={styles.wrapper}>
            {/* --- NAVIGATION --- */}
            <nav className={`${styles.nav} ${scrolled ? styles.navScrolled : ""}`} style={{ background: scrolled ? 'rgba(15, 23, 42, 0.9)' : 'transparent', borderBottom: scrolled ? '1px solid rgba(255,255,255,0.1)' : 'none' }}>
                <Link href="/" className={styles.logoArea}>
                    <Logo size={36} variant="white" />
                    <span>APEX PROCURE</span>
                </Link>
                <div style={{ display: 'flex', gap: '2.5rem', alignItems: 'center' }}>
                    <Link href="/" style={{ color: '#919EAB', textDecoration: 'none', fontWeight: 600, fontSize: '0.9375rem' }}>Light Mode</Link>
                    <Link href="/login" className="btn btn-primary" style={{ padding: '0.75rem 2rem', borderRadius: '30px' }}>
                        Book a Demo
                    </Link>
                </div>
            </nav>

            {/* --- HERO SECTION --- */}
            <section className={styles.hero} ref={heroRef as any}>
                <div className={heroInView ? motion.reveal : ""} style={{ opacity: 0 }}>
                    <span className={styles.tag}>Powered by Guardrail AI™</span>
                    <h1 className={styles.title}>
                        Proactive Procurement <br />
                        <span style={{ color: '#E8572A' }}>Reimagined.</span>
                    </h1>
                    <p className={styles.subtitle}>
                        Apex Procure replaces manual, reactive spend tracking with a single,
                        intelligent workspace. Centralize your purchasing, automate your AP,
                        and see every dollar in real-time.
                    </p>

                    <div style={{ display: 'flex', justifyContent: 'center', gap: '1.5rem' }}>
                        <Link href="/login" className="btn btn-primary" style={{ height: '56px', padding: '0 2.5rem', fontSize: '1.125rem', borderRadius: '32px' }}>
                            Book a Demo
                        </Link>
                        <button className="btn btn-secondary" style={{ height: '56px', padding: '0 2.5rem', fontSize: '1.125rem', borderRadius: '32px', background: 'rgba(255,255,255,0.05)', color: '#FFFFFF', border: '1px solid rgba(255,255,255,0.1)' }}>
                            <Play size={18} fill="currentColor" /> Watch Product Video
                        </button>
                    </div>
                </div>

                <div className={`${styles.heroVisual} ${heroInView ? motion.scale : ""}`} style={{ opacity: 0 }}>
                    <div style={{ background: '#1E293B', borderRadius: '24px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)' }}>
                        <Image
                            src="/hero-crystal-dark.png"
                            alt="Apex Dashboard Dark"
                            width={1000}
                            height={600}
                            style={{ width: '100%', height: 'auto', display: 'block' }}
                            className={motion.zoomIn}
                        />
                    </div>
                </div>
            </section>

            {/* --- THE "WHY" (COMPARISON) --- */}
            <section style={{ padding: '80px 5%', background: '#0F172A' }} ref={compRef as any}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '3rem', maxWidth: '1200px', margin: '0 auto' }}>
                    <div className={`${styles.featureCard} ${compInView ? motion.reveal : ""}`} style={{ opacity: 0 }}>
                        <XCircle color="#B72136" size={32} style={{ marginBottom: '1.5rem' }} />
                        <h3 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '1rem', color: '#FFFFFF' }}>Before Apex</h3>
                        <p style={{ color: '#919EAB', lineHeight: 1.7 }}>
                            Fragmented purchase requests, rogue spending, and blind-spot financial
                            tracking until the end-of-month reconciliation.
                        </p>
                    </div>
                    <div className={`${styles.featureCard} ${compInView ? motion.reveal : ""}`} style={{ opacity: 0, border: '1px solid #E8572A', background: 'rgba(232, 87, 42, 0.03)' }}>
                        <CheckCircle color="#00AB55" size={32} style={{ marginBottom: '1.5rem' }} />
                        <h3 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '1rem', color: '#FFFFFF' }}>With Apex</h3>
                        <p style={{ color: '#919EAB', lineHeight: 1.7 }}>
                            Unified procurement, real-time budget guardrails, and autonomous
                            AP processing that scales with your organization.
                        </p>
                    </div>
                </div>
            </section>

            {/* --- FEATURE GRID --- */}
            <section className={styles.featureGrid} ref={gridRef as any}>
                {[
                    {
                        icon: <Zap />,
                        title: "Autonomous OCR",
                        text: "Extract 99.9% of invoice data instantly with our proprietary AI engine.",
                        slug: "autonomous-ap"
                    },
                    {
                        icon: <Shield />,
                        title: "Guardrail AI™",
                        text: "Dynamic risk scoring and fraud prevention built into every approval flow.",
                        slug: "fraud-protection"
                    },
                    {
                        icon: <BarChart3 />,
                        title: "Spend Velocity",
                        text: "Real-time analytics and predictive forecasting to lead your finance team.",
                        slug: "spend-insights"
                    }
                ].map((item, idx) => (
                    <div key={idx} className={`${styles.featureCard} ${gridInView ? motion.reveal : ""} ${motion['delay' + (idx + 1) as keyof typeof motion]}`} style={{ opacity: 0 }}>
                        <div className={styles.icon}>{item.icon}</div>
                        <h3 className={styles.featureTitle}>{item.title}</h3>
                        <p className={styles.featureText}>{item.text}</p>
                        <Link href={`/features/${item.slug}`} className={styles.learnMore}>
                            Technical Specifications <ChevronRight size={16} />
                        </Link>
                    </div>
                ))}
            </section>

            {/* --- MOBILE SECTION --- */}
            <section style={{ padding: '120px 5%', textAlign: 'center' }} ref={mobileRef as any}>
                <div className={mobileInView ? motion.reveal : ""} style={{ opacity: 0 }}>
                    <h2 style={{ fontSize: '3.5rem', fontWeight: 950, marginBottom: '4rem', letterSpacing: '-0.03em', color: '#FFFFFF' }}>Total Visibility, In Your Pocket.</h2>
                </div>
                <div style={{ display: 'flex', justifyContent: 'center', gap: '4rem', flexWrap: 'wrap', alignItems: 'center' }}>
                    <div className={`${styles.featureCard} ${mobileInView ? motion.reveal : ""}`} style={{ opacity: 0, maxWidth: '450px', textAlign: 'left' }}>
                        <Smartphone size={40} color="#E8572A" style={{ marginBottom: '1.5rem' }} />
                        <h3 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '1.5rem', color: '#FFFFFF' }}>Modern Mobile Approval</h3>
                        <p style={{ color: '#919EAB', lineHeight: 1.7, marginBottom: '2rem' }}>
                            Our 100% responsive "Smart Card" architecture ensures that
                            complex procurement data is perfectly readable and actionable
                            anywhere, anytime.
                        </p>
                        <Link href="/features/mobile-procurement" className={styles.learnMore}>Explore Mobile Power <ArrowRight size={16} /></Link>
                    </div>
                    <div className={mobileInView ? motion.scale : ""} style={{ opacity: 0, width: '280px', height: '560px', borderRadius: '40px', border: '8px solid rgba(255,255,255,0.1)', overflow: 'hidden' }}>
                        <Image src="/mobile-mockup.png" alt="Mobile View" width={280} height={560} style={{ width: '100%', height: '100%', objectFit: 'cover' }} className={motion.float} />
                    </div>
                </div>
            </section>

            {/* --- FINAL CTA --- */}
            <section className={styles.ctaSection} ref={ctaRef as any}>
                <div className={ctaInView ? motion.scale : ""} style={{ opacity: 0 }}>
                    <h2 style={{ fontSize: '3.5rem', fontWeight: 950, marginBottom: '1.5rem', letterSpacing: '-0.03em' }}>Ready to Scale?</h2>
                    <p style={{ fontSize: '1.25rem', maxWidth: '600px', margin: '0 auto 3rem', opacity: 0.9 }}>
                        Join the elite teams automating their spend with Apex Procure.
                    </p>
                    <Link href="/login" className="btn btn-secondary" style={{ background: '#FFFFFF', color: '#E8572A', height: '64px', padding: '0 3rem', fontSize: '1.25rem', fontWeight: 800, borderRadius: '32px' }}>
                        Get Started Now
                    </Link>
                </div>
            </section>

            <footer style={{ padding: '60px 5% 40px', textAlign: 'center', color: '#637381', fontSize: '0.875rem', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                <p>© 2026 Apex Procure. Built for Proactive Finance Leaders.</p>
            </footer>
        </div>
    );
}

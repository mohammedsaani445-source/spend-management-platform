"use client";

import Link from "next/link";
import Image from "next/image";
import {
  Zap, Shield, Smartphone, ArrowRight,
  BarChart3, CheckCircle2, Globe, Lock,
  ChevronRight, PlayCircle
} from "lucide-react";
import styles from "./Landing.module.css";
import { Logo } from "@/components/common/Logo";

export default function Home() {
  return (
    <div className={styles.landingWrapper}>
      {/* --- NAVIGATION --- */}
      <nav className={styles.nav}>
        <Link href="/" className={styles.logoArea}>
          <Logo size={32} />
          <span>APEX PROCURE</span>
        </Link>
        <div className={styles.navLinks}>
          <Link href="#features" className={styles.navLink}>Features</Link>
          <Link href="#solutions" className={styles.navLink}>Solutions</Link>
          <Link href="#mobile" className={styles.navLink}>Mobile</Link>
          <Link href="/login" className={styles.navLink}>Login</Link>
          <Link href="/login" className="btn btn-primary" style={{ padding: '0.625rem 1.5rem', fontSize: '0.875rem' }}>
            Request Demo
          </Link>
        </div>
      </nav>

      {/* --- HERO SECTION --- */}
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <span className={styles.heroTag}>Industry-Grade AI Procurement</span>
          <h1 className={styles.heroTitle}>
            The Most Intelligent Way to Manage Business Spend
          </h1>
          <p className={styles.heroSubtitle}>
            Unify your procurement and AP automation. Eliminate 99% of manual data entry with our
            high-fidelity AI OCR and real-time fraud protection engine.
          </p>
          <div className={styles.ctaGroup}>
            <Link href="/login" className="btn btn-primary" style={{ padding: '0.875rem 2.25rem', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              Start for Free <ArrowRight size={18} />
            </Link>
            <button className="btn btn-secondary" style={{ padding: '0.875rem 2.25rem', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <PlayCircle size={18} /> Watch Product Tour
            </button>
          </div>

          <div style={{ marginTop: '3rem', display: 'flex', alignItems: 'center', gap: '1.5rem', opacity: 0.6 }}>
            <span style={{ fontSize: '0.8125rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>TRUSTED BY GLOBAL TEAMS</span>
            <div style={{ display: 'flex', gap: '1rem', fontSize: '1.25rem', fontWeight: 800 }}>
              <span>NETSUITE</span>
              <span>SAGE</span>
              <span>ORACLE</span>
            </div>
          </div>
        </div>

        <div className={styles.heroVisual}>
          <Image
            src="/hero-mockup.png"
            alt="AI Invoicing Dashboard"
            width={720}
            height={450}
            className={styles.heroMockup}
          />
        </div>
      </section>

      {/* --- FEATURE HIGHLIGHTS --- */}
      <section id="features" className={styles.section}>
        <h2 className={styles.sectionTitle}>Built for the Modern Finance Team</h2>
        <p className={styles.sectionSubtitle}>
          Procurify-grade controls with next-generation AI intelligence.
          Everything you need to control spend from request to payment.
        </p>

        <div className={styles.featureGrid}>
          {[
            {
              icon: <Zap />,
              title: "Autonomous AP",
              text: "Our 99% accurate AI OCR extracts every field from invoices instantly, mapping them to purchase orders automatically.",
              slug: "autonomous-ap"
            },
            {
              icon: <Shield />,
              title: "Guardrail AI™",
              text: "Proactive fraud detection checks for duplicate invoices, vendor anomalies, and budget overruns in real-time.",
              slug: "fraud-protection"
            },
            {
              icon: <BarChart3 />,
              title: "Deep Spend Insights",
              text: "Get a real-time view of every dollar spent. Forecast budgets and identify savings opportunities with AI analytics.",
              slug: "spend-insights"
            }
          ].map((feature, idx) => (
            <div key={idx} className={styles.featureCard}>
              <div className={styles.featureIcon}>{feature.icon}</div>
              <h3 className={styles.featureTitle}>{feature.title}</h3>
              <p className={styles.featureText}>{feature.text}</p>
              <Link href={`/features/${feature.slug}`} style={{ color: '#E8572A', fontWeight: 700, fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.25rem', marginTop: '1.5rem', textDecoration: 'none' }}>
                Learn More <ChevronRight size={16} />
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* --- MOBILE FIRST PROOF --- */}
      <section id="mobile" className={styles.mobileSection}>
        <div className={styles.mobileFlex}>
          <div className={styles.mobileVisuals}>
            <div className={styles.mobileCard}>
              <Image
                src="/mobile-mockup.png"
                alt="Mobile App"
                width={280}
                height={560}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </div>
          </div>
          <div className={styles.mobileContent}>
            <span className={styles.heroTag} style={{ background: '#FFFFFF' }}>Mobile First Architecture</span>
            <h2 className={styles.sectionTitle} style={{ textAlign: 'left' }}>Your Procurement Office, On-the-Go</h2>
            <p className={styles.heroSubtitle} style={{ textAlign: 'left' }}>
              Never miss an approval. Our 100% responsive platform uses "Smart Card"
              view to ensure that even the most complex data tables are perfectly
              readable on any smartphone.
            </p>
            <ul style={{ listStyle: 'none', padding: 0, marginTop: '2rem', display: 'grid', gap: '1rem', marginBottom: '2.5rem' }}>
              {[
                "Approve requests in one tap",
                "Capture receipts with AI scanning",
                "Receive items with barcode support",
                "Real-time spend notifications"
              ].map(item => (
                <li key={item} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontWeight: 600 }}>
                  <CheckCircle2 color="#00AB55" size={20} /> {item}
                </li>
              ))}
            </ul>
            <Link href="/features/mobile-procurement" className="btn btn-secondary" style={{ padding: '0.75rem 2rem', display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
              Explore Mobile Capabilities <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>

      {/* --- INTEGRATIONS --- */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Seamless ERP Connect</h2>
        <p className={styles.sectionSubtitle}>
          Connect with the tools your team already uses. No manual data sync required.
        </p>
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '3rem', opacity: 0.5, filter: 'grayscale(100%)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.5rem', fontWeight: 800 }}>
            <Globe size={32} /> NETSUITE
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.5rem', fontWeight: 800 }}>
            <Lock size={32} /> QUICKBOOKS
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.5rem', fontWeight: 800 }}>
            <BarChart3 size={32} /> SAGE INTACCT
          </div>
        </div>
      </section>

      {/* --- FINAL CTA --- */}
      <section style={{ padding: '100px 5%', background: '#212B36', color: '#FFFFFF', textAlign: 'center' }}>
        <h2 style={{ fontSize: '3rem', fontWeight: 800, marginBottom: '1.5rem' }}>Ready to Scale Smarter?</h2>
        <p style={{ fontSize: '1.25rem', opacity: 0.8, maxWidth: '600px', margin: '0 auto 3rem' }}>
          Join high-growth teams using Apex Procure to gain total control over their business spend.
        </p>
        <Link href="/login" className="btn btn-primary" style={{ padding: '1rem 3rem', fontSize: '1.125rem' }}>
          Get Started Today — It's Free
        </Link>
      </section>

      {/* --- FOOTER --- */}
      <footer className={styles.footer}>
        <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr 1fr', gap: '4rem', maxWidth: 1440, margin: '0 auto' }}>
          <div>
            <Logo size={40} />
            <p style={{ color: '#919EAB', marginTop: '1.5rem', lineHeight: 1.6 }}>
              The most intelligent procure-to-pay platform for modern companies.
              Control spend, automate finances, and scale with confidence.
            </p>
          </div>
          {[
            { title: "Product", links: ["Features", "Pricing", "Integrations", "Mobile"] },
            { title: "Solutions", links: ["Procurement", "AP Automation", "Expenses", "AI Insights"] },
            { title: "Company", links: ["About", "Careers", "Security", "Contact"] },
          ].map(group => (
            <div key={group.title}>
              <h4 style={{ fontSize: '1rem', marginBottom: '1.5rem' }}>{group.title}</h4>
              <ul style={{ listStyle: 'none', padding: 0, display: 'grid', gap: '1rem' }}>
                {group.links.map(link => (
                  <li key={link}>
                    <Link href="#" style={{ color: '#919EAB', textDecoration: 'none', fontSize: '0.875rem' }}>{link}</Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', marginTop: '4rem', paddingTop: '2rem', display: 'flex', justifyContent: 'space-between', color: '#919EAB', fontSize: '0.8125rem' }}>
          <span>© 2026 Apex Procure. All rights reserved.</span>
          <div style={{ display: 'flex', gap: '2rem' }}>
            <span>Privacy Policy</span>
            <span>Terms of Service</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

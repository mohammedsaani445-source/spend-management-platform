"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Zap, Shield, BarChart3, ArrowRight, CheckCircle2,
  ChevronRight, PlayCircle, Globe, Lock, Cpu,
  XCircle, CheckCircle, Smartphone, MousePointer2
} from "lucide-react";
import { Logo } from "@/components/common/Logo";
import { useIntersection } from "@/hooks/useIntersection";
import styles from "./Procurify.module.css";
import motion from "./Animations.module.css";

export default function LandingPage() {
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
      <nav className={`${styles.nav} ${scrolled ? styles.navScrolled : ""}`}>
        <Link href="/" className={styles.logoArea}>
          <Logo size={32} />
          <span>APEX PROCURE</span>
        </Link>
        <div className={styles.navLinks}>
          <Link href="#features" className={styles.navLink}>Platform</Link>
          <Link href="#solutions" className={styles.navLink}>Solutions</Link>
          <Link href="/variant-b" className={styles.navLink} style={{ color: '#E8572A' }}>Variant B (Dark)</Link>
          <Link href="/login" className={styles.navLink}>Login</Link>
          <Link href="/login" className="btn btn-primary" style={{ height: '44px', borderRadius: '100px', padding: '0 2rem' }}>
            Get a Demo
          </Link>
        </div>
      </nav>

      {/* --- HERO SECTION --- */}
      <header className={styles.hero} ref={heroRef as any}>
        <div className={heroInView ? motion.reveal : ""}>
          <span className={`${styles.heroTag} ${motion.fade}`}>Spend Management for the Modern Enterprise</span>
          <h1 className={styles.heroTitle}>
            Procurement that's <br />
            <span style={{ color: "#E8572A" }}>Proactive</span>, Not Reactive.
          </h1>
          <p className={styles.heroSubtitle}>
            Apex Procure centralizes your spend, automates your AP, and gives
            you 100% visibility. Eliminate the "where did our budget go?" moments forever.
          </p>
          <div style={{ display: "flex", gap: "1rem", justifyContent: "center" }}>
            <Link href="/login" className="btn btn-primary btn-lg" style={{ borderRadius: "100px", padding: "0 2.5rem" }}>
              Book a Demo <ArrowRight size={18} />
            </Link>
            <button className="btn btn-secondary btn-lg" style={{ borderRadius: "100px", padding: "0 2.5rem" }}>
              <PlayCircle size={18} /> Watch Product Tour
            </button>
          </div>
        </div>

        <div className={`${styles.heroVisual} ${heroInView ? motion.scale : ""}`} style={{ opacity: 0 }}>
          <Image
            src="/hero-crystal-light.png"
            alt="Apex Procure Dashboard"
            width={1200}
            height={700}
            className={motion.zoomIn}
            priority
          />
        </div>
      </header>

      {/* --- THE "WHY" (COMPARISON) --- */}
      <section className={styles.comparison} ref={compRef as any}>
        <div className={styles.comparisonInner}>
          <div className={`${styles.comparisonCard} ${compInView ? motion.reveal : ""}`} style={{ opacity: 0 }}>
            <XCircle color="#B72136" size={32} style={{ marginBottom: '1.5rem' }} />
            <h3 className={styles.comparisonTitle}>The Manual Way</h3>
            <div className={styles.comparisonItem}>• Fragmented emails & spreadsheet tracking</div>
            <div className={styles.comparisonItem}>• 2-3 week approval cycles</div>
            <div className={styles.comparisonItem}>• Blind spend until the end of the month</div>
            <div className={styles.comparisonItem}>• High risk of duplicate or fraudulent invoices</div>
          </div>

          <div className={`${styles.comparisonCard} ${compInView ? motion.reveal : ""}`} style={{ opacity: 0, border: '2px solid #E8572A' }}>
            <CheckCircle color="#00AB55" size={32} style={{ marginBottom: '1.5rem' }} />
            <h3 className={styles.comparisonTitle}>The Apex Way</h3>
            <div className={styles.comparisonItem} style={{ color: '#1A1A1A', fontWeight: 600 }}><CheckCircle2 size={18} color="#00AB55" /> Centralized real-time requisitioning</div>
            <div className={styles.comparisonItem} style={{ color: '#1A1A1A', fontWeight: 600 }}><CheckCircle2 size={18} color="#00AB55" /> 24-hour autonomous approval flows</div>
            <div className={styles.comparisonItem} style={{ color: '#1A1A1A', fontWeight: 600 }}><CheckCircle2 size={18} color="#00AB55" /> Instant spend vs budget visibility</div>
            <div className={styles.comparisonItem} style={{ color: '#1A1A1A', fontWeight: 600 }}><CheckCircle2 size={18} color="#00AB55" /> AI Guardrails protecting every dollar</div>
          </div>
        </div>
      </section>

      {/* --- FEATURE CLUSTERS --- */}
      <section id="features" style={{ padding: '100px 0' }} ref={gridRef as any}>
        <h2 className={styles.sectionTitle}>Everything you need to scale.</h2>
        <div className={styles.grid}>
          {[
            {
              icon: <Zap />,
              title: "Autonomous AP",
              text: "Our AI OCR extracts 99% of data from invoices, eliminating manual entry forever.",
              slug: "autonomous-ap"
            },
            {
              icon: <Shield />,
              title: "Guardrail AI™",
              text: "Advanced fraud detection and risk scoring integrated into every transaction.",
              slug: "fraud-protection"
            },
            {
              icon: <BarChart3 />,
              title: "Deep Insights",
              text: "Crystal-clear analytics and forecasting to help you make smarter financial decisions.",
              slug: "spend-insights"
            },
            {
              icon: <Lock />,
              title: "Purchasing Control",
              text: "Set granular budgets and limits by department, project, or individual.",
              slug: "autonomous-ap"
            },
            {
              icon: <Globe />,
              title: "Global Supply Chain",
              text: "Manage multiple currencies and locations with unified procurement logic.",
              slug: "spend-insights"
            },
            {
              icon: <Cpu />,
              title: "Smart Integrations",
              text: "Seamless sync with NetSuite, Sage, QuickBooks, and Xero in real-time.",
              slug: "spend-insights"
            }
          ].map((item, idx) => (
            <div key={idx} className={`${styles.card} ${gridInView ? motion.reveal : ""} ${motion['delay' + (idx % 3 + 1) as keyof typeof motion]}`} style={{ opacity: 0 }}>
              <div className={styles.icon}>{item.icon}</div>
              <h3 className={styles.cardTitle}>{item.title}</h3>
              <p className={styles.cardText}>{item.text}</p>
              <Link href={`/features/${item.slug}`} className={styles.navLink} style={{ color: '#E8572A', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                Learn More <ChevronRight size={16} />
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* --- MOBILE MASTERY --- */}
      <section className={styles.mobileSection} ref={mobileRef as any}>
        <div className={styles.mobileInner}>
          <div className={mobileInView ? motion.reveal : ""} style={{ opacity: 0 }}>
            <span style={{ color: '#E8572A', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Mobile Native</span>
            <h2 className={styles.heroTitle} style={{ color: 'white', marginTop: '1rem' }}>Total Control in Your Pocket.</h2>
            <p className={styles.heroSubtitle} style={{ color: '#919EAB', textAlign: 'left', marginLeft: 0 }}>
              Approving a $50k purchase should be as easy as sending a text. 100% responsive, zero friction.
            </p>
            <div style={{ display: 'grid', gap: '1rem', marginTop: '2rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}><CheckCircle2 color="#00AB55" /> One-tap mobile approvals</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}><CheckCircle2 color="#00AB55" /> Real-time push spend alerts</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}><CheckCircle2 color="#00AB55" /> Mobile receipt & invoice capture</div>
            </div>
            <Link href="/features/mobile-procurement" className="btn btn-primary btn-lg" style={{ marginTop: '3rem', borderRadius: '100px' }}>
              Explore Mobile Features
            </Link>
          </div>
          <div className={mobileInView ? motion.scale : ""} style={{ opacity: 0, display: 'flex', justifyContent: 'center' }}>
            <Image src="/mobile-mockup.png" alt="Mobile App" width={300} height={600} className={motion.float} />
          </div>
        </div>
      </section>

      {/* --- FINAL CTA --- */}
      <section className={styles.cta} ref={ctaRef as any}>
        <div className={`${styles.ctaBox} ${ctaInView ? motion.scale : ""} ${motion.glow}`} style={{ opacity: 0 }}>
          <h2 style={{ fontSize: '3rem', fontWeight: 900, marginBottom: '1.5rem' }}>Take the first step to proactive spend management.</h2>
          <p style={{ fontSize: '1.25rem', opacity: 0.9, marginBottom: '3rem' }}>Join the forward-thinking finance teams using Apex Procure.</p>
          <Link href="/login" className="btn btn-secondary btn-lg" style={{ background: 'white', color: '#E8572A', fontSize: '1.25rem', borderRadius: '100px', padding: '0 3.5rem' }}>
            Book Your Free Demo
          </Link>
          <div style={{ marginTop: '2rem', fontSize: '0.875rem', opacity: 0.7 }}>No credit card required • Clear 30-day implementation</div>
        </div>
      </section>

      <footer style={{ padding: '80px 4% 40px', background: '#F9FAFB', borderTop: '1px solid #DFE3E8' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '4rem' }}>
          <div>
            <Logo size={40} />
            <div style={{ fontWeight: 850, marginTop: '1rem' }}>APEX PROCURE</div>
            <div style={{ fontSize: '0.875rem', color: '#637381', marginTop: '1rem' }}>The standard in intelligent procurement.</div>
          </div>
          <div style={{ display: 'flex', gap: '6rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ fontWeight: 800 }}>Product</div>
              <Link href="#features" className={styles.navLink}>Features</Link>
              <Link href="/login" className={styles.navLink}>Demo</Link>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ fontWeight: 800 }}>Company</div>
              <Link href="/login" className={styles.navLink}>About</Link>
              <Link href="/login" className={styles.navLink}>Security</Link>
            </div>
          </div>
        </div>
        <div style={{ textAlign: 'center', marginTop: '60px', color: '#919EAB', fontSize: '0.75rem' }}>
          © {new Date().getFullYear()} Apex Procure Inc. All rights reserved.
        </div>
      </footer>
    </div>
  );
}

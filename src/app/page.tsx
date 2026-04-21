"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight, CheckCircle2, PlayCircle,
  ShieldCheck, Zap, BarChart3, Brain, Layers, Globe,
  Smartphone, Users, Lock, CreditCard,
  Menu, X, ChevronRight, Sparkles
} from "lucide-react";
import { Logo } from "@/components/common/Logo";
import { useIntersection } from "@/hooks/useIntersection";
import styles from "./LandingPage.module.css";

// ─── Tab Data ───
const PRODUCT_TABS = [
  {
    id: "purchasing",
    label: "Purchasing",
    title: "Simplify intake-to-receive",
    description:
      "Control purchasing with ease — from AI-powered request intake and approval routing to purchase orders and receiving logs — giving you the visibility to cut rogue spend and make better buying decisions.",
    image: "/apex-purchasing-module-v4.png",
    link: "/features/procurement",
    linkText: "Explore Purchasing",
  },
  {
    id: "ap",
    label: "Accounts Payable",
    title: "Streamline invoice-to-pay",
    description:
      "Move faster and reduce errors by automating your AP workflow, from AI-powered invoice capture to automated three-way matching and seamless payments — freeing up time for strategic tasks.",
    image: "/apex-ap-automation-hero-v4.png",
    link: "/features/ap-automation",
    linkText: "Explore AP Automation",
  },
  {
    id: "expense",
    label: "Expense Management",
    title: "Smarter expense & card management",
    description:
      "Gain complete visibility and control over employee spending with AI-powered expense reports and configurable corporate spending cards — all in one unified platform.",
    image: "/apex-expense-mgmt-v4-mobile-desktop.png",
    link: "/features/expense-management",
    linkText: "Explore Expense Management",
  },
];

export default function LandingPage() {
  const [scrolled, setScrolled] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Intersection observers
  const [heroRef, heroInView] = useIntersection();
  const [statsRef, statsInView] = useIntersection();
  const [aiRef, aiInView] = useIntersection();
  const [tabRef, tabInView] = useIntersection();
  const [featureRef1, featureInView1] = useIntersection();
  const [featureRef2, featureInView2] = useIntersection();
  const [roiRef, roiInView] = useIntersection();
  const [mobileRef, mobileInView] = useIntersection();
  const [ctaRef, ctaInView] = useIntersection();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close mobile menu on resize
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 1024) setMobileMenuOpen(false);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const scrollToSection = useCallback((id: string) => {
    setMobileMenuOpen(false);
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth" });
  }, []);

  return (
    <div className={styles.wrapper}>
      {/* ═══ NAVIGATION ═══ */}
      <nav
        className={`${styles.nav} ${scrolled ? styles.navScrolled : ""}`}
        style={{ top: 0 }}
      >
        <Link href="/" className={styles.logoArea}>
          <Logo size={30} />
          <span>Apex Procure</span>
        </Link>

        <div className={styles.navLinks}>
          <button onClick={() => scrollToSection("platform")} className={styles.navLink} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
            Platform
          </button>
          <button onClick={() => scrollToSection("solutions")} className={styles.navLink} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
            Solutions
          </button>
          <button onClick={() => scrollToSection("roi")} className={styles.navLink} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
            Customers
          </button>
          <Link href="/login" className={styles.navLink}>Login</Link>
          <Link href="/login" className={styles.navCta}>
            Book a Demo
          </Link>
        </div>

        <button
          className={styles.mobileMenuBtn}
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </nav>

      {/* Mobile Drawer */}
      <div className={`${styles.mobileDrawer} ${mobileMenuOpen ? styles.open : ""}`}>
        <button onClick={() => scrollToSection("platform")} className={styles.mobileDrawerLink} style={{ background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left' }}>Platform</button>
        <button onClick={() => scrollToSection("solutions")} className={styles.mobileDrawerLink} style={{ background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left' }}>Solutions</button>
        <button onClick={() => scrollToSection("roi")} className={styles.mobileDrawerLink} style={{ background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left' }}>Customers</button>
        <Link href="/login" className={styles.mobileDrawerLink}>Login</Link>
        <div style={{ marginTop: '1rem', padding: '0 1.25rem' }}>
          <Link href="/login" className={styles.btnPrimary} style={{ width: '100%', justifyContent: 'center' }}>
            Book a Demo <ArrowRight size={16} />
          </Link>
        </div>
      </div>

      {/* ═══ HERO ═══ */}
      <header className={`${styles.hero} ${styles.meshBg}`} ref={heroRef as React.Ref<HTMLElement>}>
        <div
          style={{
            opacity: heroInView ? 1 : 0,
            transform: heroInView ? "translateY(0)" : "translateY(30px)",
            transition: "all 0.8s cubic-bezier(0.16, 1, 0.3, 1)",
          }}
        >
          <span className={styles.heroEyebrow}>
            <span className={styles.heroEyebrowDot} />
            AI-Powered Procurement Platform • <span style={{ color: '#10b981', fontWeight: 600 }}>Live & Verified</span>
          </span>

          <h1 className={styles.heroTitle}>
            Take the complexity out{" "}
            <br />
            of <span style={{ color: "#E8572A" }}>procurement</span>
          </h1>

          <p className={styles.heroSubtitle}>
            Apex Procure redefines the intake-to-pay process with powerful AI
            workflows and complete procurement visibility — all in one platform.
          </p>

          <div className={styles.heroCtas}>
            <Link href="/login" className={styles.btnPrimary}>
              Book a Demo <ArrowRight size={18} />
            </Link>
            <Link
              href="/tour"
              className={styles.btnSecondary}
            >
              <PlayCircle size={18} /> Take a Tour
            </Link>
          </div>
        </div>

        <div
          className={styles.heroVisual}
          style={{
            opacity: heroInView ? 1 : 0,
            transform: heroInView ? "translateY(0) scale(1)" : "translateY(40px) scale(0.97)",
            transition: "all 1s cubic-bezier(0.16, 1, 0.3, 1) 0.2s",
          }}
        >
          <Image
            src="/apex-hero-dashboard-v4-high-res.png"
            alt="Apex Procure — Enterprise Procurement Dashboard"
            width={1200}
            height={700}
            style={{ width: "100%", height: "auto", display: "block" }}
            priority
          />
        </div>
      </header>

      {/* ═══ SOCIAL PROOF / STATS ═══ */}
      <section className={styles.socialProof} ref={statsRef as React.Ref<HTMLElement>}>
        <div className={styles.socialProofInner}>
          <p className={styles.socialProofLabel}>
            Trusted by forward-thinking procurement teams
          </p>
          <div className={styles.statsRow}>
            {[
              { value: "96%", label: "Reduction in\nrequisition time" },
              { value: "90%", label: "Weekly time\nsavings" },
              { value: "$30K", label: "Saved in first\nfew weeks" },
              { value: "10X", label: "Faster\npurchasing" },
            ].map((stat, i) => (
              <div
                key={i}
                className={styles.statItem}
                style={{
                  opacity: statsInView ? 1 : 0,
                  transform: statsInView ? "translateY(0)" : "translateY(20px)",
                  transition: `all 0.6s cubic-bezier(0.16, 1, 0.3, 1) ${i * 0.1}s`,
                }}
              >
                <div className={styles.statValue}>{stat.value}</div>
                <div className={styles.statLabel}>{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ AI SECTION ═══ */}
      <section id="platform" className={styles.aiSection} ref={aiRef as React.Ref<HTMLElement>}>
        <div className={styles.aiHeader}>
          <span
            className={styles.sectionEyebrow}
            style={{
              opacity: aiInView ? 1 : 0,
              transition: "opacity 0.6s ease",
            }}
          >
            <Sparkles size={14} /> AI-Powered
          </span>
          <h2
            className={styles.sectionTitle}
            style={{
              opacity: aiInView ? 1 : 0,
              transform: aiInView ? "translateY(0)" : "translateY(20px)",
              transition: "all 0.7s cubic-bezier(0.16, 1, 0.3, 1) 0.1s",
            }}
          >
            Powerful AI for proactive procurement control
          </h2>
          <p
            className={styles.sectionSubtitle}
            style={{
              opacity: aiInView ? 1 : 0,
              transform: aiInView ? "translateY(0)" : "translateY(20px)",
              transition: "all 0.7s cubic-bezier(0.16, 1, 0.3, 1) 0.2s",
            }}
          >
            Automate data capture, streamline approvals, and proactively identify
            cost-saving opportunities across your procurement workflows.
          </p>
        </div>

        <div className={styles.aiGrid}>
          {[
            {
              icon: <ShieldCheck size={22} />,
              title: "Shape purchasing policies your way",
              text: "Standardize and configure workflows, enforce policies, and simplify approvals to improve financial discipline.",
            },
            {
              icon: <Zap size={22} />,
              title: "Automate workflows with AI",
              text: "Built-in AI automates purchasing and AP, freeing your team to focus on strategic priorities.",
            },
            {
              icon: <Brain size={22} />,
              title: "Make AI-informed purchasing decisions",
              text: "Gain full procurement visibility and get instant answers to complex questions with an AI-powered Procurement Analyst.",
            },
          ].map((card, i) => (
            <div
              key={i}
              className={styles.aiCard}
              style={{
                opacity: aiInView ? 1 : 0,
                transform: aiInView ? "translateY(0)" : "translateY(24px)",
                transition: `all 0.7s cubic-bezier(0.16, 1, 0.3, 1) ${0.15 + i * 0.1}s`,
              }}
            >
              <div className={styles.aiCardIcon}>{card.icon}</div>
              <h3 className={styles.aiCardTitle}>{card.title}</h3>
              <p className={styles.aiCardText}>{card.text}</p>
            </div>
          ))}
        </div>
      </section>

      <div className={styles.sectionDivider} />

      {/* ═══ PRODUCT TABS ═══ */}
      <section id="solutions" className={styles.tabSection} ref={tabRef as React.Ref<HTMLElement>}>
        <div className={styles.tabSectionInner}>
          <div className={styles.tabHeader}>
            <span className={styles.sectionEyebrow}>
              <Layers size={14} /> Solutions
            </span>
            <h2 className={styles.sectionTitle}>
              One platform for your entire procurement lifecycle
            </h2>
          </div>

          <div className={styles.tabRowWrapper}>
            <div className={styles.tabRow}>
              {PRODUCT_TABS.map((tab, i) => (
                <button
                  key={tab.id}
                  className={`${styles.tabBtn} ${activeTab === i ? styles.tabBtnActive : ""}`}
                  onClick={() => setActiveTab(i)}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          <div
            className={styles.tabContent}
            style={{
              opacity: tabInView ? 1 : 0,
              transform: tabInView ? "translateY(0)" : "translateY(20px)",
              transition: "all 0.6s cubic-bezier(0.16, 1, 0.3, 1)",
            }}
          >
            <div>
              <h3 className={styles.tabContentTitle}>
                {PRODUCT_TABS[activeTab].title}
              </h3>
              <p className={styles.tabContentText}>
                {PRODUCT_TABS[activeTab].description}
              </p>
              <Link
                href={PRODUCT_TABS[activeTab].link}
                className={styles.featureLink}
              >
                {PRODUCT_TABS[activeTab].linkText}{" "}
                <ChevronRight size={16} />
              </Link>
            </div>
            <div className={styles.tabContentVisual}>
              <Image
                key={PRODUCT_TABS[activeTab].id}
                src={PRODUCT_TABS[activeTab].image}
                alt={PRODUCT_TABS[activeTab].title}
                width={700}
                height={480}
                style={{ width: "100%", height: "auto", display: "block" }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* ═══ FEATURE DETAIL: P2P ═══ */}
      <section className={styles.featureSection} ref={featureRef1 as React.Ref<HTMLElement>}>
        <div className={styles.featureLayout}>
          <div
            className={styles.featureContent}
            style={{
              opacity: featureInView1 ? 1 : 0,
              transform: featureInView1 ? "translateX(0)" : "translateX(-30px)",
              transition: "all 0.8s cubic-bezier(0.16, 1, 0.3, 1)",
            }}
          >
            <span className={styles.featureLabel}>
              <Zap size={14} /> Procure-to-Pay
            </span>
            <h2 className={styles.featureTitle}>
              From request to payment,{" "}
              <span style={{ color: "#E8572A" }}>completely unified.</span>
            </h2>
            <p className={styles.featureDescription}>
              Eliminate &quot;rogue spend&quot; with a centralized platform that
              scales with your growth. Manage requisitions, purchase orders, and
              vendor payments in one seamless flow.
            </p>
            <div className={styles.featureChecklist}>
              {[
                "3-Way OCR Matching (PO, Invoice, Receipt)",
                "Custom Multi-level Approval Workflows",
                "Real-time Budget vs. Actual Tracking",
              ].map((item, i) => (
                <div key={i} className={styles.featureCheckItem}>
                  <span className={styles.checkIcon}>
                    <CheckCircle2 size={14} />
                  </span>
                  {item}
                </div>
              ))}
            </div>
            <Link href="/features/ap-automation" className={styles.featureLink}>
              Explore P2P Flow <ChevronRight size={16} />
            </Link>
          </div>
          <div
            className={styles.featureVisual}
            style={{
              opacity: featureInView1 ? 1 : 0,
              transform: featureInView1 ? "translateX(0) scale(1)" : "translateX(30px) scale(0.96)",
              transition: "all 0.9s cubic-bezier(0.16, 1, 0.3, 1) 0.1s",
            }}
          >
            <Image
              src="/apex-ap-automation-hero-v4.png"
              alt="Procure-to-Pay Dashboard"
              width={700}
              height={500}
              style={{ width: "100%", height: "auto", display: "block" }}
            />
          </div>
        </div>
      </section>

      <div className={styles.sectionDivider} />

      {/* ═══ FEATURE DETAIL: AI ═══ */}
      <section className={styles.featureSection} ref={featureRef2 as React.Ref<HTMLElement>}>
        <div className={`${styles.featureLayout} ${styles.featureLayoutReverse}`}>
          <div
            className={styles.featureContent}
            style={{
              opacity: featureInView2 ? 1 : 0,
              transform: featureInView2 ? "translateX(0)" : "translateX(30px)",
              transition: "all 0.8s cubic-bezier(0.16, 1, 0.3, 1)",
            }}
          >
            <span className={styles.featureLabel}>
              <Brain size={14} /> Apex AI™
            </span>
            <h2 className={styles.featureTitle}>
              Financial intelligence,{" "}
              <span style={{ color: "#E8572A" }}>autonomous & proactive.</span>
            </h2>
            <p className={styles.featureDescription}>
              Meet your AI-powered procurement analyst. It doesn&apos;t just report numbers
              — it finds savings opportunities, predicts budget breaches, and flags
              risks before they become problems.
            </p>
            <div className={styles.featureChecklist}>
              {[
                "Proactive Savings Opportunity Alerts",
                "Natural Language Financial Analysis",
                "AI Guardrail™ Fraud Detection",
              ].map((item, i) => (
                <div key={i} className={styles.featureCheckItem}>
                  <span className={styles.checkIcon}>
                    <CheckCircle2 size={14} />
                  </span>
                  {item}
                </div>
              ))}
            </div>
            <Link href="/features/procurement/spend-insights" className={styles.featureLink}>
              Explore Apex AI <ChevronRight size={16} />
            </Link>
          </div>
          <div
            className={styles.featureVisual}
            style={{
              opacity: featureInView2 ? 1 : 0,
              transform: featureInView2 ? "translateX(0) scale(1)" : "translateX(-30px) scale(0.96)",
              transition: "all 0.9s cubic-bezier(0.16, 1, 0.3, 1) 0.1s",
            }}
          >
            <Image
              src="/apex-ai-analyst-v4-interactive.png"
              alt="AI Financial Analyst Dashboard"
              width={700}
              height={500}
              style={{ width: "100%", height: "auto", display: "block" }}
            />
          </div>
        </div>
      </section>

      {/* ═══ ROI STATS ═══ */}
      <section id="roi" className={styles.roiSection} ref={roiRef as React.Ref<HTMLElement>}>
        <div className={styles.roiHeader}>
          <span className={styles.sectionEyebrow}>
            <BarChart3 size={14} /> Results
          </span>
          <h2 className={styles.sectionTitle}>Real customer ROI</h2>
          <p className={styles.sectionSubtitle}>
            The #1 mid-market procurement solution with results to prove it.
          </p>
        </div>
        <div className={styles.roiGrid}>
          {[
            { value: "96%", label: "Reduction in requisition time" },
            { value: "90%", label: "Weekly time savings" },
            { value: "$30K", label: "Saved in a few weeks" },
            { value: "10X", label: "Faster purchasing" },
          ].map((stat, i) => (
            <div
              key={i}
              className={styles.roiCard}
              style={{
                opacity: roiInView ? 1 : 0,
                transform: roiInView ? "translateY(0)" : "translateY(20px)",
                transition: `all 0.6s cubic-bezier(0.16, 1, 0.3, 1) ${i * 0.1}s`,
              }}
            >
              <div className={styles.roiValue}>{stat.value}</div>
              <div className={styles.roiLabel}>{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ═══ MOBILE ═══ */}
      <section className={styles.mobileSection} ref={mobileRef as React.Ref<HTMLElement>}>
        <div className={styles.mobileInner}>
          <div
            style={{
              opacity: mobileInView ? 1 : 0,
              transform: mobileInView ? "translateX(0)" : "translateX(-30px)",
              transition: "all 0.8s cubic-bezier(0.16, 1, 0.3, 1)",
            }}
          >
            <span className={styles.featureLabel} style={{ color: "#E8572A" }}>
              <Smartphone size={14} /> Mobile Native
            </span>
            <h2 className={styles.mobileTitle}>
              Manage business procurement remotely
            </h2>
            <p className={styles.mobileSubtitle}>
              Manage end-to-end procurement workflows on the go with our
              top-rated mobile app — powered by AI for fast, error-free receipt
              capture.
            </p>
            <div className={styles.mobileChecklist}>
              {[
                "One-tap mobile approvals",
                "Real-time push procurement alerts",
                "AI-powered receipt & invoice capture",
              ].map((item, i) => (
                <div key={i} className={styles.mobileCheckItem}>
                  <span className={styles.mobileCheckIcon}>
                    <CheckCircle2 size={13} />
                  </span>
                  {item}
                </div>
              ))}
            </div>
            <Link
              href="/features/procurement/receiving-inventory"
              className={styles.btnPrimary}
              style={{ marginTop: "2.5rem" }}
            >
              Explore Mobile <ArrowRight size={16} />
            </Link>
          </div>
          <div
            className={styles.mobileVisual}
            style={{
              opacity: mobileInView ? 1 : 0,
              transform: mobileInView ? "translateY(0) scale(1)" : "translateY(30px) scale(0.95)",
              transition: "all 0.9s cubic-bezier(0.16, 1, 0.3, 1) 0.15s",
            }}
          >
            <Image
              src="/apex-receiving-v4-mobile-v2.png"
              alt="Mobile Procurement App"
              width={300}
              height={600}
              style={{ filter: "drop-shadow(0 30px 60px rgba(0,0,0,0.3))" }}
            />
          </div>
        </div>
      </section>

      {/* ═══ CTA ═══ */}
      <section className={styles.ctaSection} ref={ctaRef as React.Ref<HTMLElement>}>
        <div
          className={styles.ctaBox}
          style={{
            opacity: ctaInView ? 1 : 0,
            transform: ctaInView ? "translateY(0) scale(1)" : "translateY(20px) scale(0.98)",
            transition: "all 0.7s cubic-bezier(0.16, 1, 0.3, 1)",
          }}
        >
          <h2 className={styles.ctaTitle}>
            Get started with proactive procurement
          </h2>
          <p className={styles.ctaSubtitle}>
            Book a demo to see how Apex Procure's AI-powered
            platform streamlines the intake-to-pay process.
          </p>
          <div className={styles.ctaBtns}>
            <Link href="/login" className={styles.ctaBtnLight}>
              Book a Demo <ArrowRight size={16} />
            </Link>
            <Link
              href="/tour"
              className={styles.ctaBtnGhost}
            >
              <PlayCircle size={16} /> Take a Tour
            </Link>
          </div>
          <p className={styles.ctaDisclaimer}>
            No credit card required · Free 30-day implementation
          </p>
        </div>
      </section>

      {/* ═══ FOOTER ═══ */}
      <footer className={styles.footer}>
        <div className={styles.footerInner}>
          <div className={styles.footerBrand}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.625rem" }}>
              <Logo size={28} />
              <span className={styles.footerBrandName}>Apex Procure</span>
            </div>
            <p className={styles.footerBrandDesc}>
              The AI-powered procurement, AP, and purchasing management platform built
              for growing organizations.
            </p>
          </div>

          <div>
            <h4 className={styles.footerColumnTitle}>Platform</h4>
            <Link href="/login" className={styles.footerLink}>Product Overview</Link>
            <Link href="/features/procurement/spend-insights" className={styles.footerLink}>Apex AI</Link>
            <Link href="/features/purchase-requests" className={styles.footerLink}>Purchase Requests</Link>
            <Link href="/features/approvals" className={styles.footerLink}>Approvals</Link>
            <Link href="/login" className={styles.footerLink}>Pricing</Link>
          </div>

          <div>
            <h4 className={styles.footerColumnTitle}>Solutions</h4>
            <Link href="/features/procurement" className={styles.footerLink}>Procurement</Link>
            <Link href="/features/ap-automation" className={styles.footerLink}>Accounts Payable</Link>
            <Link href="/features/expense-management" className={styles.footerLink}>Expense Management</Link>
            <Link href="/login" className={styles.footerLink}>Integrations</Link>
          </div>

          <div>
            <h4 className={styles.footerColumnTitle}>Company</h4>
            <Link href="/login" className={styles.footerLink}>About</Link>
            <Link href="/login" className={styles.footerLink}>Customers</Link>
            <Link href="/login" className={styles.footerLink}>Security</Link>
            <Link href="/login" className={styles.footerLink}>Contact</Link>
          </div>
        </div>

        <div className={styles.footerBottom}>
          <span>© {new Date().getFullYear()} Apex Procure Inc. All rights reserved.</span>
          <div className={styles.footerSocials}>
            <a href="#" className={styles.footerSocialLink} aria-label="LinkedIn">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
            </a>
            <a href="#" className={styles.footerSocialLink} aria-label="Twitter">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
            </a>
          </div>
        </div>
      </footer>

    </div>
  );
}

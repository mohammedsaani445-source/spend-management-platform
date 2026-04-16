"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight, CheckCircle2, ChevronDown, ChevronRight,
  PieChart, BarChart3, ShieldCheck, Target, Zap, 
  Layers, Menu, X, PlayCircle, TrendingUp
} from "lucide-react";
import { Logo } from "@/components/common/Logo";
import styles from "../../SolutionPage.module.css";

const VALUE_PROPS = [
  {
    icon: <PieChart size={20} />,
    title: "Real-time Visibility",
    text: "Monitor spending against budgets in real-time. Gain instant insights into how your organization is performing against its financial targets at any level of detail.",
  },
  {
    icon: <ShieldCheck size={20} />,
    title: "Proactive Spend Controls",
    text: "Auto-enforce budget limits during the requisition process. Prevent overspending before it happens by guiding employees with clear, real-time budget data.",
  },
  {
    icon: <Target size={20} />,
    title: "Strategic Asset Allocation",
    text: "Easily allocate budgets across departments, locations, and projects. Use historical data to make more accurate forecasts and strategic financial decisions.",
  },
];

const FEATURES = [
  {
    id: "budget-tracking",
    icon: <BarChart3 size={20} />,
    title: "Dynamic Budget Dashboards",
    description: "Move away from static spreadsheets with real-time, interactive budget tracking.",
    bullets: [
      "Compare actual spend vs. budget in real-time with automatic updates",
      "Drill down into individual departments, categories, and account codes",
      "Automated variance analysis flags significant over or under-spending",
      "Visualize spending trends over time to identify seasonal patterns",
    ],
    image: "/apex-insights-analytics.png",
  },
  {
    id: "spend-controls",
    icon: <Zap size={20} />,
    title: "Intelligent Spending Controls",
    description: "Enforce your organization's financial policies automatically and at scale.",
    bullets: [
      "Enforce hard or soft budget limits at the point of request creation",
      "Automatic custom notifications for budget owners when thresholds are met",
      "Configurable approval overrides for critical or emergency spending",
      "Guide users toward preferred vendors to maximize budget impact",
    ],
    image: "/apex-budget-mgmt.png",
  },
  {
    id: "forecasting",
    icon: <TrendingUp size={20} />,
    title: "Advanced Forecasting & Planning",
    description: "Use data-driven insights to build more accurate financial plans.",
    bullets: [
      "Model 'what-if' scenarios based on historical spending data",
      "Easily roll forward unspent budget or reallocate across departments",
      "Consolidate budgets from multiple locations or subsidiaries",
      "Export reports in multiple formats for external analysis",
    ],
    image: "/apex-ai-analyst.png",
  },
];

const FAQS = [
  {
    q: "How often is the budget data updated?",
    a: "Budget data is updated in real-time. As soon as a purchase request is submitted, approved, or an invoice is paid, the system automatically reflects these changes in your budget dashboards.",
  },
  {
    q: "Can I set different budget limits for different departments?",
    a: "Absolutely. Apex Procure allows you to create granular budgets for departments, projects, and locations, each with its own specific limits and approval workflows.",
  },
  {
    q: "What happens if a request exceeds the budget?",
    a: "You can configure 'hard' limits that block requests, or 'soft' limits that provide a warning and require additional approval. The budget owner is always notified when a request exceeds established thresholds.",
  },
  {
    q: "Can I integrate my existing budgets from another system?",
    a: "Yes, you can easily upload your existing budgets via CSV or integrate with your ERP/accounting system to keep your financial data synchronized.",
  },
];

export default function BudgetManagementPage() {
  const [scrolled, setScrolled] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToSection = useCallback((id: string) => {
    setMobileMenuOpen(false);
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth" });
  }, []);

  return (
    <div className={styles.wrapper}>
      {/* NAV */}
      <nav className={`${styles.nav} ${scrolled ? styles.navScrolled : ""}`}>
        <Link href="/" className={styles.logoArea}>
          <Logo size={30} />
          <span>Apex Procure</span>
        </Link>
        <div className={styles.navLinks}>
          <Link href="/" className={styles.navLink}>Platform</Link>
          <Link href="/features/procurement" className={styles.navLink}>Procurement</Link>
          <Link href="/features/ap-automation" className={styles.navLink}>AP Automation</Link>
          <Link href="/features/expense-management" className={styles.navLink}>Expense</Link>
          <Link href="/login" className={styles.navLink}>Login</Link>
          <Link href="/login" className={styles.navCta}>Book a Demo</Link>
        </div>
        <button className={styles.mobileMenuBtn} onClick={() => setMobileMenuOpen(!mobileMenuOpen)} aria-label="Toggle menu">
          {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </nav>

      {/* HERO */}
      <header className={styles.hero}>
        <span className={styles.heroEyebrow}>
          <PieChart size={14} /> BUDGET MANAGEMENT
        </span>
        <h1 className={styles.heroTitle}>
          Take full control of your <span style={{ color: "#E8572A" }}>organization's budgets</span>
        </h1>
        <p className={styles.heroSubtitle}>
          Gain real-time visibility and control over your organization's spend with smart allocation tools and automated enforcement that keeps you on budget.
        </p>
        <div className={styles.heroCtas}>
          <Link href="/login" className={styles.btnPrimary}>
            Book a Demo <ArrowRight size={18} />
          </Link>
          <Link href="/features/procurement" className={styles.btnSecondary}>
            <PlayCircle size={18} /> Tour Procurement
          </Link>
        </div>
      </header>

      {/* HERO IMAGE */}
      <div className={styles.heroVisual}>
        <Image
          src="/apex-budget-tracking.png" 
          alt="Apex Procure — Budget Management Dashboard"
          width={1200}
          height={700}
          style={{ width: "100%", height: "auto", display: "block" }}
          priority
          unoptimized={true}
        />
      </div>

      {/* ANCHOR NAV */}
      <div className={styles.anchorNav}>
        <button onClick={() => scrollToSection("value-props")} className={styles.anchorLink}>Benefits</button>
        <button onClick={() => scrollToSection("features")} className={styles.anchorLink}>Features</button>
        <button onClick={() => scrollToSection("faqs")} className={styles.anchorLink}>FAQs</button>
      </div>

      {/* VALUE PROPS */}
      <section id="value-props" className={styles.valueSection}>
        <div className={styles.valueSectionHeader}>
          <span className={styles.sectionEyebrow}><Target size={14} /> Strategy and Control</span>
          <h2 className={styles.sectionTitle}>Manage your spend with confidence</h2>
          <p className={styles.sectionSubtitle}>
            Traditional budget tracking is reactive and siloed. Apex Procure provides the real-time insights and proactive tools needed for strategic financial governance.
          </p>
        </div>
        <div className={styles.valueGrid}>
          {VALUE_PROPS.map((prop, i) => (
            <div key={i} className={styles.valueCard}>
              <div className={styles.valueCardIcon}>{prop.icon}</div>
              <h3 className={styles.valueCardTitle}>{prop.title}</h3>
              <p className={styles.valueCardText}>{prop.text}</p>
            </div>
          ))}
        </div>
      </section>

      <div className={styles.divider} />

      {/* FEATURES */}
      <div id="features">
        {FEATURES.map((feature, i) => (
          <div key={feature.id} id={feature.id}>
            <section className={`${styles.featureBlock} ${i % 2 !== 0 ? styles.featureBlockAlt : ""}`}>
              <div className={styles.featureBlockHeader}>
                <h2 className={styles.featureBlockTitle}>{feature.title}</h2>
                <p className={styles.featureBlockDesc}>{feature.description}</p>
              </div>
              <div className={`${styles.featureBlockGrid} ${i % 2 !== 0 ? styles.featureBlockGridReverse : ""}`}>
                <div className={styles.featureBullets}>
                  {feature.bullets.map((bullet, j) => (
                    <div key={j} className={styles.featureBullet}>
                      <span className={styles.featureBulletIcon}>
                        <CheckCircle2 size={12} />
                      </span>
                      {bullet}
                    </div>
                  ))}
                  <Link href="/login" className={styles.featureExploreLink}>
                    Learn more about {feature.title} <ChevronRight size={14} />
                  </Link>
                </div>
                <div className={styles.featureBlockVisual}>
                  <Image
                    src={feature.image}
                    alt={feature.title}
                    width={600}
                    height={400}
                    style={{ width: "100%", height: "auto", display: "block" }}
                    unoptimized={true}
                  />
                </div>
              </div>
            </section>
            {i < FEATURES.length - 1 && <div className={styles.divider} />}
          </div>
        ))}
      </div>

      {/* FAQ */}
      <section id="faqs" className={styles.faqSection}>
        <h2 className={styles.faqTitle}>Budget management FAQs</h2>
        {FAQS.map((faq, i) => (
          <div key={i} className={faqItemClass(i)}>
            <button
              className={styles.faqQuestion}
              onClick={() => setOpenFaq(openFaq === i ? null : i)}
            >
              {faq.q}
              <ChevronDown
                size={18}
                className={`${styles.faqChevron} ${openFaq === i ? styles.faqChevronOpen : ""}`}
              />
            </button>
            <div className={`${styles.faqAnswer} ${openFaq === i ? styles.faqAnswerOpen : ""}`}>
              <p className={styles.faqAnswerInner}>{faq.a}</p>
            </div>
          </div>
        ))}
      </section>

      {/* CTA */}
      <section className={styles.ctaSection}>
        <div className={styles.ctaBox}>
          <h2 className={styles.ctaTitle}>Ready to control your spending?</h2>
          <p className={styles.ctaSubtitle}>
            Join the organizations that use Apex Procure to gain total visibility into their budgets.
          </p>
          <div className={styles.ctaBtns}>
            <Link href="/login" className={styles.ctaBtnLight}>
              Book a Demo <ArrowRight size={16} />
            </Link>
            <Link href="/features/procurement" className={styles.ctaBtnGhost}>
              <PlayCircle size={16} /> Explore Procurement
            </Link>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className={styles.footer}>
        <div className={styles.footerInner}>
          <div className={styles.footerBrand}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.625rem" }}>
              <Logo size={28} />
              <span className={styles.footerBrandName}>Apex Procure</span>
            </div>
            <p className={styles.footerBrandDesc}>
              The AI-powered procurement, AP, and spend management platform built for growing organizations.
            </p>
          </div>
          <div>
            <h4 className={styles.footerColumnTitle}>Solutions</h4>
            <Link href="/features/procurement" className={styles.footerLink}>Procurement</Link>
            <Link href="/features/ap-automation" className={styles.footerLink}>Accounts Payable</Link>
            <Link href="/features/expense-management" className={styles.footerLink}>Expense Management</Link>
          </div>
          <div>
            <h4 className={styles.footerColumnTitle}>Platform</h4>
            <Link href="/" className={styles.footerLink}>Product Overview</Link>
            <Link href="/login" className={styles.footerLink}>Apex AI</Link>
            <Link href="/features/procurement/budget-management" className={styles.footerLink} style={{ color: '#E8572A' }}>Budgets</Link>
            <Link href="/login" className={styles.footerLink}>Pricing</Link>
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
        </div>
      </footer>
    </div>
  );

  function faqItemClass(index: number) {
    return styles.faqItem;
  }
}

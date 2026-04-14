"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight, CheckCircle2, ChevronDown, ChevronRight,
  TrendingUp, BarChart, PieChart, Search, Zap,
  Layers, Menu, X, PlayCircle, Lightbulb
} from "lucide-react";
import { Logo } from "@/components/common/Logo";
import styles from "../../SolutionPage.module.css";

const VALUE_PROPS = [
  {
    icon: <BarChart size={20} />,
    title: "Actionable Intelligence",
    text: "Turn raw procurement data into clear, actionable business intelligence. Identify spending trends, vendor performance issues, and cost-saving opportunities in seconds.",
  },
  {
    icon: <Lightbulb size={20} />,
    title: "AI-Powered Analysis",
    text: "Leverage advanced AI to uncover hidden patterns in your spend data. Get proactive recommendations for vendor consolidation and negotiation strategies.",
  },
  {
    icon: <Zap size={20} />,
    title: "Automated Reporting",
    text: "Save dozens of hours every month with automated report generation. Schedule key insights to be delivered directly to stakeholders' inboxes on a recurring basis.",
  },
];

const FEATURES = [
  {
    id: "spend-dashboards",
    icon: <TrendingUp size={20} />,
    title: "Advanced Spend Dashboards",
    description: "Visualize your organization's financial health with interactive, customizable dashboards.",
    bullets: [
      "Drill down into spending by vendor, category, department, and location",
      "Real-time tracking of key procurement KPIs and metrics",
      "Easy-to-use filters allow for ad-hoc analysis and discovery",
      "Compare spending data across multiple time periods and subsidiaries",
    ],
    image: "/feature-analytics.png",
  },
  {
    id: "savings-id",
    icon: <Search size={20} />,
    title: "Savings Opportunity Discovery",
    description: "Let the system find ways for you to save money and optimize your budget.",
    bullets: [
      "Automatically identify duplicate vendors and rogue spending",
      "Highlight opportunities for volume discounts and contract negotiations",
      "Track realized vs. projected savings for procurement initiatives",
      "Benchmarking tools compare your pricing against industry standards",
    ],
    image: "/feature-analytics.png",
  },
  {
    id: "compliance-reporting",
    icon: <CheckCircle2 size={20} />,
    title: "Compliance & Audit Reporting",
    description: "Ensure your organization stays compliant with powerful tracking and reporting tools.",
    bullets: [
      "Monitor policy compliance across departments and projects",
      "Generate forensic-grade audit logs for regulatory requirements",
      "Track diverse supplier spend and sustainability metrics",
      "Customizable report templates for board and executive presentations",
    ],
    image: "/feature-analytics.png",
  },
];

const FAQS = [
  {
    q: "Can I create custom reports in Apex Procure?",
    a: "Yes! Our report builder allows you to create custom views and dashboards based on any data point in the system. You can save these reports and share them with other team members.",
  },
  {
    q: "Does the system support data export?",
    a: "Absolutely. You can export any report or dashboard data in multiple formats, including PDF, CSV, and Excel, for further analysis or presentation.",
  },
  {
    q: "How does the AI spend analysis work?",
    a: "Our AI engine analyzes your historical transaction data to identify patterns, anomalies, and opportunities. It looks for things like duplicate vendors, unusual spending spikes, and potential savings through consolidation.",
  },
  {
    q: "Can I schedule reports to be sent automatically?",
    a: "Yes. You can schedule any report to be delivered via email to specific individuals or groups on a daily, weekly, or monthly basis.",
  },
];

export default function SpendInsightsPage() {
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
          <TrendingUp size={14} /> SPEND INSIGHTS & ANALYTICS
        </span>
        <h1 className={styles.heroTitle}>
          Data-driven insights for <span style={{ color: "#E8572A" }}>smarter spending</span>
        </h1>
        <p className={styles.heroSubtitle}>
          Turn procurement data into actionable business intelligence with powerful analytics and reporting tools that reveal cost-saving opportunities and spending trends.
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
          src="/feature-analytics.png" 
          alt="Apex Procure — Spend Insights & Analytics Dashboard"
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
          <span className={styles.sectionEyebrow}><TrendingUp size={14} /> Intelligence and Savings</span>
          <h2 className={styles.sectionTitle}>Unlock the value in your spend data</h2>
          <p className={styles.sectionSubtitle}>
            Passive data collection is not enough. Apex Procure provides the active insights needed to optimize your budget, consolidate vendor spend, and drive organizational efficiency.
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
        <h2 className={styles.faqTitle}>Spend insights FAQs</h2>
        {FAQS.map((faq, i) => (
          <div key={i} className={styles.faqItem}>
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
          <h2 className={styles.ctaTitle}>Ready for data-driven procurement?</h2>
          <p className={styles.ctaSubtitle}>
            Join the organizations that use Apex Procure to transform their spend data into strategic advantage.
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
            <Link href="/features/procurement/spend-insights" className={styles.footerLink} style={{ color: '#E8572A' }}>Insights</Link>
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
}

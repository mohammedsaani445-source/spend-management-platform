"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight, CheckCircle2, ChevronDown, ChevronRight,
  FileText, Zap, Layers, Menu, X, PlayCircle, Eye, ShieldCheck, Mail, Database
} from "lucide-react";
import { Logo } from "@/components/common/Logo";
import styles from "../../SolutionPage.module.css";

const VALUE_PROPS = [
  {
    icon: <Zap size={20} />,
    title: "AI-Powered Data Entry",
    text: "Eliminate manual data entry with OCR technology that captures invoice details with 99% accuracy. Auto-populate bill fields and reduce processing time by up to 80%.",
  },
  {
    icon: <Mail size={20} />,
    title: "Dedicated Email Inbox",
    text: "Set up a centralized email address where vendors send invoices directly. Apex AI automatically extracts data and creates draft bills for your review.",
  },
  {
    icon: <ShieldCheck size={20} />,
    title: "Compliance & Control",
    text: "Enforce company policies with automated two-way and three-way matching. Ensure every invoice corresponds to a valid PO and received goods before payment.",
  },
];

const FEATURES = [
  {
    id: "ocr-capture",
    icon: <Zap size={20} />,
    title: "Intelligent OCR Capture",
    description: "Scan and extract data from invoices instantly using our industry-leading OCR technology.",
    bullets: [
      "Automatically extract vendor name, invoice date, and line-item details",
      "Convert PDF and image files into structured digital bills",
      "Continuous machine learning improves extraction accuracy over time",
      "Flag potential duplicates and missing information automatically",
    ],
    image: "/ap-invoice-capture.png",
  },
  {
    id: "3-way-matching",
    icon: <ShieldCheck size={20} />,
    title: "Automated Three-Way Matching",
    description: "Connect the dots between purchase orders, receiving notes, and invoices automatically.",
    bullets: [
      "Verify that the price on the invoice matches the purchase order",
      "Ensure quantities invoiced align with actual items received",
      "Automatically flag variances for manual review",
      "Reduce the risk of fraud and overpayment by up to 95%",
    ],
    image: "/ap-bill-mgmt.png",
  },
  {
    id: "audit-trail",
    icon: <Database size={20} />,
    title: "Comprehensive Audit Log",
    description: "Maintain a legally defensible record of every action taken on an invoice.",
    bullets: [
      "Track every change, approval, and comment with timestamps",
      "Centralize all related documents in one accessible location",
      "Export audit reports for painless end-of-year tax compliance",
      "Role-based access ensures only authorized users see sensitive data",
    ],
    image: "/ap-bill-mgmt.png",
  },
];

const FAQS = [
  {
    q: "How accurate is the AI invoice capture?",
    a: "Our AI-powered OCR technology achieves over 99% accuracy on standard invoice formats. It extracts key data points like vendor, date, amount, tax, and line items, requiring only a quick final review.",
  },
  {
    q: "What is three-way matching?",
    a: "Three-way matching is a verification process that matches the invoice against the original purchase order and the receiving document (GRN). This ensures you only pay for what was ordered and actually received.",
  },
  {
    q: "Can I manage multiple entities with one AP account?",
    a: "Yes, Apex Procure supports multi-entity structures, allowing you to manage invoices across different locations or subsidiaries while maintaining centralized visibility and reporting.",
  },
];

export default function InvoiceProcessingPage() {
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
          <Link href="/features/ap-automation" className={styles.navLink} style={{ color: '#E8572A' }}>AP Automation</Link>
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
          <FileText size={14} /> AI INVOICE PROCESSING
        </span>
        <h1 className={styles.heroTitle}>
          Automated <span style={{ color: "#E8572A" }}>bill capture</span> and processing
        </h1>
        <p className={styles.heroSubtitle}>
          Eliminate manual data entry and speed up your AP cycle with AI-powered invoice capture. Centralize all your billing documentation in one place for effortless reconciliation and audit readiness.
        </p>
        <div className={styles.heroCtas}>
          <Link href="/login" className={styles.btnPrimary}>
            Book a Demo <ArrowRight size={18} />
          </Link>
          <Link href="/features/ap-automation" className={styles.btnSecondary}>
            <PlayCircle size={18} /> Tour AP Automation
          </Link>
        </div>
      </header>

      {/* HERO IMAGE */}
      <div className={styles.heroVisual}>
        <Image
          src="/ap-invoice-capture.png"
          alt="Apex Procure — AI Invoice Capture Interface"
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
          <span className={styles.sectionEyebrow}><Zap size={14} /> Why AI Processing?</span>
          <h2 className={styles.sectionTitle}>Faster processing, fewer errors</h2>
          <p className={styles.sectionSubtitle}>
            Manual invoice processing is a bottleneck for finance teams. Apex Procure uses advanced AI to turn piles of paper and PDFs into actionable data, allowing your team to focus on strategic financial management instead of data entry.
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
        <h2 className={styles.faqTitle}>Invoice processing FAQs</h2>
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
          <h2 className={styles.ctaTitle}>Ready to automate your accounts payable?</h2>
          <p className={styles.ctaSubtitle}>
            Join organizations that use Apex Procure to eliminate manual data entry and gain total visibility over their billing cycles.
          </p>
          <div className={styles.ctaBtns}>
            <Link href="/login" className={styles.ctaBtnLight}>
              Book a Demo <ArrowRight size={16} />
            </Link>
            <Link href="/features/ap-automation" className={styles.ctaBtnGhost}>
              <PlayCircle size={16} /> Explore AP Automation
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
            <Link href="/features/ap-automation/invoice-processing" className={styles.footerLink} style={{ color: '#E8572A' }}>Invoice Processing</Link>
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

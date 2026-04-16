"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight, CheckCircle2, ChevronDown, ChevronRight,
  CreditCard, Zap, Layers, Menu, X, PlayCircle, Wallet, ShieldCheck, Globe, DollarSign
} from "lucide-react";
import { Logo } from "@/components/common/Logo";
import styles from "../../SolutionPage.module.css";

const VALUE_PROPS = [
  {
    icon: <Wallet size={20} />,
    title: "Consolidated Bill Payments",
    text: "Manage all your vendor payments in one unified platform. Eliminate the need to log into multiple bank portals and streamline your month-end close.",
  },
  {
    icon: <ShieldCheck size={20} />,
    title: "Secure Approval Routing",
    text: "Never pay an unverified bill again. Our automated workflows ensure every payment is approved by the right budget owners before funds are released.",
  },
  {
    icon: <Globe size={20} />,
    title: "Global Payment reach",
    text: "Pay vendors in over 100 currencies using ACH, wire transfers, or EFT. Manage local and international payments with transparent rates and tracking.",
  },
];

const FEATURES = [
  {
    id: "payment-workflows",
    icon: <Zap size={20} />,
    title: "Flexible Payment Workflows",
    description: "Customize how and when you pay your vendors with granular control over disbursement timing.",
    bullets: [
      "Select multiple bills for batch payment processing",
      "Schedule payments in advance to capture early-pay discounts",
      "Hold or dispute payments directly from the dashboard",
      "Automatic vendor notification upon successful payment",
    ],
    image: "/apex-ap-payments.png",
  },
  {
    id: "security-compliance",
    icon: <ShieldCheck size={20} />,
    title: "Banking-Grade Security",
    description: "Protect your organization's funds with enterprise-grade security protocols and fraud prevention.",
    bullets: [
      "Multi-factor authentication (MFA) for all payment approvals",
      "Encryption of sensitive vendor banking information",
      "Automated OFAC and AML screening for international payments",
      "Detailed audit trails for every disbursement of funds",
    ],
    image: "/apex-ap-bill-mgmt.png",
  },
  {
    id: "erp-sync",
    icon: <Layers size={20} />,
    title: "Real-Time ERP Sync",
    description: "Keep your accounting system in sync with every payment made through Apex Procure.",
    bullets: [
      "Automatically mark bills as 'Paid' in NetSuite, Intacct, or QuickBooks",
      "Real-time visibility into cash flow and pending liabilities",
      "Drill down from payment records to original invoices and POs",
      "Painless reconciliation with automated GL entry creation",
    ],
    image: "/apex-ap-bill-mgmt.png",
  },
];

const FAQS = [
  {
    q: "What payment methods are supported?",
    a: "Apex Procure supports a wide range of payment methods including domestic ACH, international wire transfers (SWIFT), EFT, and virtual corporate cards.",
  },
  {
    q: "How secure is the platform for handling payments?",
    a: "We use banking-grade encryption and security protocols. Vendor banking details are encrypted, and every payment requires approval through multi-factor authentication (MFA).",
  },
  {
    q: "Can I schedule payments for a future date?",
    a: "Yes, you can schedule payments to go out on any future date, allowing you to manage cash flow and ensure vendors are paid exactly when you want them to be.",
  },
];

export default function PaymentsPage() {
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
          <DollarSign size={14} /> VENDOR PAYMENTS
        </span>
        <h1 className={styles.heroTitle}>
          Pay your vendors <span style={{ color: "#E8572A" }}>quickly and securely</span>
        </h1>
        <p className={styles.heroSubtitle}>
          Centralize your global vendor payments with Apex Procure. From ACH to international wires, manage every disbursement with automated approval workflows and real-time ERP synchronization.
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
          src="/apex-ap-payments.png"
          alt="Apex Procure — Vendor Payments Interface"
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
          <span className={styles.sectionEyebrow}><Zap size={14} /> Why Pay with Apex?</span>
          <h2 className={styles.sectionTitle}>Secure, automated global payments</h2>
          <p className={styles.sectionSubtitle}>
            Consolidate your accounts payable and payment workflows into one platform. Reduce manual work, eliminate fraud risk, and ensure your vendors are always paid on time, every time.
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
        <h2 className={styles.faqTitle}>Vendor payment FAQs</h2>
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
          <h2 className={styles.ctaTitle}>Ready to streamline your vendor payments?</h2>
          <p className={styles.ctaSubtitle}>
            Join organizations that use Apex Procure to automate their accounts payable and gain global payment capabilities.
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
            <Link href="/features/ap-automation/payments" className={styles.footerLink} style={{ color: '#E8572A' }}>Vendor Payments</Link>
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

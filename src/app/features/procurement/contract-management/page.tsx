"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight, CheckCircle2, ChevronDown, ChevronRight,
  HandshakeIcon, FileText, Bell, ShieldCheck, History,
  Zap, Layers, Menu, X, PlayCircle, Eye
} from "lucide-react";
import { Logo } from "@/components/common/Logo";
import styles from "../../SolutionPage.module.css";

const VALUE_PROPS = [
  {
    icon: <Eye size={20} />,
    title: "Centralized Repository",
    text: "Store all active and historical contracts in a single, secure location. Never lose track of a vendor agreement or legal document again.",
  },
  {
    icon: <Bell size={20} />,
    title: "Automated Renewal Alerts",
    text: "Get ahead of contract expirations with automated notifications. Ensure you have enough time to renegotiate terms or source alternative vendors.",
  },
  {
    icon: <ShieldCheck size={20} />,
    title: "Compliance & Governance",
    text: "Maintain a full audit log of all contract changes and approvals. Ensure your organization is always compliant with internal and external regulations.",
  },
];

const FEATURES = [
  {
    id: "contract-tracking",
    icon: <Zap size={20} />,
    title: "Real-time Spend Tracking",
    description: "Connect your contracts directly to your spending for total visibility into commitment vs. actuals.",
    bullets: [
      "Track current spend against total contract value automatically",
      "Real-time visibility into contract utilization across departments",
      "Identify underperforming or underutilized vendor agreements",
      "Auto-flag invoices that exceed contract limits",
    ],
    image: "/apex-contract-tracking.png", 
  },
  {
    id: "document-management",
    icon: <FileText size={20} />,
    title: "Advanced Document Workflows",
    description: "Streamline the way you capture and manage contract data.",
    bullets: [
      "Capture key dates, amounts, payment terms, and notice periods",
      "Support for multiple file types and large attachments",
      "Secure access controls based on user roles and departments",
      "Easy search and discovery with smart tagging",
    ],
    image: "/apex-contract-tracking.png",
  },
  {
    id: "audit-history",
    icon: <History size={20} />,
    title: "Version History & Audit Log",
    description: "Maintain a forensic-grade record of every contract's lifecycle.",
    bullets: [
      "Track every revision, approval, and modification",
      "Capture the 'who, what, and when' for every change",
      "Simplified compliance reporting with easy-to-export audit logs",
      "Historical record of previous vendor terms and pricing",
    ],
    image: "/apex-contract-tracking.png",
  },
];

const FAQS = [
  {
    q: "Can I store historical contracts in the system?",
    a: "Yes, Apex Procure allows you to upload and categorize both active and historical contracts, giving you a complete view of your vendor relationships over time.",
  },
  {
    q: "How do the renewal notifications work?",
    a: "You can set custom alert thresholds (e.g., 30, 60, or 90 days) for each contract. The system will send notifications to the contract owner and relevant stakeholders via email and in-app alerts.",
  },
  {
    q: "Can I track spending against specific contract values?",
    a: "Absolutely. When you link a purchase order or invoice to a contract, Apex Procure automatically updates the 'spent fixed' amount, allowing you to see remaining contract value in real-time.",
  },
  {
    q: "Is the contract data secure?",
    a: "Security is our top priority. All contract data is encrypted and access is controlled by granular role-based permissions, ensuring only authorized personnel can view sensitive legal documents.",
  },
];

export default function ContractManagementPage() {
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
          <HandshakeIcon size={14} /> CONTRACT MANAGEMENT
        </span>
        <h1 className={styles.heroTitle}>
          A central home for all your <span style={{ color: "#E8572A" }}>vendor contracts</span>
        </h1>
        <p className={styles.heroSubtitle}>
          Conveniently store contracts in a centralized repository and easily track current spend against total contract value to ensure compliance and cost control.
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
          src="/apex-contract-tracking.png" 
          alt="Apex Procure — Contract Management Dashboard"
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
          <span className={styles.sectionEyebrow}><HandshakeIcon size={14} /> Visibility and Control</span>
          <h2 className={styles.sectionTitle}>Maximize the value of every contract</h2>
          <p className={styles.sectionSubtitle}>
            Fragmented contract storage leads to missed renewals, rogue spend, and legal risks. Apex Procure centralizes your contract lifecycle management for peak organizational efficiency.
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
        <h2 className={styles.faqTitle}>Contract management FAQs</h2>
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
          <h2 className={styles.ctaTitle}>Ready to master your contracts?</h2>
          <p className={styles.ctaSubtitle}>
            Join organizations that use Apex Procure to gain total visibility into their vendor commitments.
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
            <Link href="/features/procurement/contract-management" className={styles.footerLink} style={{ color: '#E8572A' }}>Contracts</Link>
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

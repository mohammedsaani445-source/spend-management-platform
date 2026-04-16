"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight, CheckCircle2, ChevronDown, ChevronRight,
  Package, FileText, Send, Clock, Smartphone, Bell,
  ShieldCheck, Zap, Layers, Menu, X, PlayCircle
} from "lucide-react";
import { Logo } from "@/components/common/Logo";
import styles from "../../SolutionPage.module.css";

const VALUE_PROPS = [
  {
    icon: <FileText size={20} />,
    title: "Automated PO Creation",
    text: "Automatically convert approved purchase requisitions into professional purchase orders. Eliminate manual data entry and ensure 100% accuracy in your procurement documents.",
  },
  {
    icon: <Send size={20} />,
    title: "Direct Vendor Communication",
    text: "Send POs directly to vendors from within the platform. Track when POs are opened and accepted, and maintain a centralized record of all vendor communications.",
  },
  {
    icon: <Clock size={20} />,
    title: "Recurring & Blanket POs",
    text: "Save time on regular purchases with recurring purchase orders. Use blanket POs for long-term vendor agreements with automated tracking against totals.",
  },
];

const FEATURES = [
  {
    id: "po-automation",
    icon: <Zap size={20} />,
    title: "Requisition to PO Automation",
    description: "Connect your entire procurement cycle by automating the bridge between intent and commitment.",
    bullets: [
      "Instantly generate POs from approved requests",
      "Consolidate multiple requests into single POs for vendor efficiency",
      "Customizable PO templates to match your brand and requirements",
      "Dynamic approval logic for PO modifications",
    ],
    image: "/apex-approval-flows.png",
  },
  {
    id: "vendor-integration",
    icon: <Package size={20} />,
    title: "Smart Vendor Workflows",
    description: "Build stronger vendor relationships with clear, professional, and trackable purchase orders.",
    bullets: [
      "One-click PO delivery via email with secure tracking links",
      "Vendor acknowledgment portals for faster confirmation",
      "Automatic reminders for unacknowledged POs",
      "Centralized history of all PO versions and revisions",
    ],
    image: "/apex-vendor-portal.png",
  },
  {
    id: "mobile-po",
    icon: <Smartphone size={20} />,
    title: "Mobile PO Management",
    description: "Keep procurement moving even when you're away from your desk with our powerful mobile app.",
    bullets: [
      "Review and approve purchase orders on the go",
      "View PO status and delivery timelines in real-time",
      "Instant push notifications for critical PO updates",
      "Access vendor contact info and history anywhere",
    ],
    image: "/apex-receiving-mobile.png",
  },
];

const FAQS = [
  {
    q: "Can I customize the purchase order template?",
    a: "Yes, Apex Procure allows you to fully customize your purchase order templates, including adding your company logo, legal terms, custom fields, and specific formatting to match your organization's standards.",
  },
  {
    q: "How does the platform handle PO revisions?",
    a: "Our system maintains a full version history. When a PO is revised, the changes are tracked, and a new version is created. You can easily compare versions and see exactly who made what changes and why.",
  },
  {
    q: "Does it support blanket purchase orders?",
    a: "Absolutely. You can set up blanket POs for long-term vendor contracts and track all subsequent releases and invoices against the total value, ensuring you never exceed your agreed limits.",
  },
  {
    q: "Can vendors respond directly to the POs?",
    a: "Yes, vendors receive a secure link where they can view, download, and acknowledge the PO. They can also leave comments or request clarifications directly on the platform, which notifies your procurement team instantly.",
  },
];

export default function PurchaseOrdersPage() {
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
          <Package size={14} /> PURCHASE ORDER SOFTWARE
        </span>
        <h1 className={styles.heroTitle}>
          The smartest way to manage <span style={{ color: "#E8572A" }}>purchase orders</span>
        </h1>
        <p className={styles.heroSubtitle}>
          Ensure proper tracking and approval of every purchase while capturing all the information your accounting and AP teams need to ensure accuracy and compliance.
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
          src="/apex-purchase-orders.png"
          alt="Apex Procure — Purchase Order Management Dashboard"
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
          <span className={styles.sectionEyebrow}><Zap size={14} /> Efficiency and Control</span>
          <h2 className={styles.sectionTitle}>Streamline your commitment to spend</h2>
          <p className={styles.sectionSubtitle}>
            Manual purchase order processes are slow, disconnected, and lack the visibility needed for proper financial governance. Apex Procure automates the PO lifecycle, connecting requests, approvals, and fulfillment.
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
        <h2 className={styles.faqTitle}>Purchase order FAQs</h2>
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
          <h2 className={styles.ctaTitle}>Ready to control your purchase orders?</h2>
          <p className={styles.ctaSubtitle}>
            Join thousands of teams that use Apex Procure to automate their procurement and gain total visibility.
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
            <Link href="/features/procurement/purchase-orders" className={styles.footerLink} style={{ color: '#E8572A' }}>Purchase Orders</Link>
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

"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight, CheckCircle2, ChevronDown, ChevronRight,
  Package, Truck, ClipboardList, Warehouse, AlertTriangle,
  Zap, Layers, Menu, X, PlayCircle
} from "lucide-react";
import { Logo } from "@/components/common/Logo";
import styles from "../../SolutionPage.module.css";

const VALUE_PROPS = [
  {
    icon: <Truck size={20} />,
    title: "Accurate Receipt Logging",
    text: "Log received goods directly against purchase orders. Capture quantity, condition, and packing slip details instantly to ensure what you ordered is what you received.",
  },
  {
    icon: <AlertTriangle size={20} />,
    title: "Discrepancy Flagging",
    text: "Automatically flag discrepancies between purchase orders and received items. Bridge the gap between procurement and AP by ensuring you only pay for what was delivered.",
  },
  {
    icon: <Warehouse size={20} />,
    title: "Multi-Location Tracking",
    text: "Manage index across multiple warehouses, locations, and departments. Modern inventory tracking built for distributed and global organizations.",
  },
];

const FEATURES = [
  {
    id: "digital-receiving",
    icon: <Package size={20} />,
    title: "Digital Receiving Workflows",
    description: "Move away from paper packing slips with streamlined digital receipt logging.",
    bullets: [
      "Capture and attach photos of physical delivery documents",
      "Support for partial receipts and complex delivery schedules",
      "Automatic linking of receipts to purchase orders and invoices",
      "Mobile receiving allows staff to log items directly from the loading dock",
    ],
    image: "/procurement-hero-v2.png",
  },
  {
    id: "inventory-mgmt",
    icon: <ClipboardList size={20} />,
    title: "Real-time Inventory Management",
    description: "Gain full traceability of your goods from receipt to consumption.",
    bullets: [
      "Track stock levels by location, project, or department",
      "Set low-stock alerts and automatic reorder points",
      "Comprehensive history of stock movements and consumption",
      "Easy-to-perform inventory counts and reconciliations",
    ],
    image: "/procurement-hero-v2.png",
  },
  {
    id: "traceability",
    icon: <Zap size={20} />,
    title: "End-to-End Traceability",
    description: "Ensure compliance and transparency with a full audit trail for every item.",
    bullets: [
      "Track serial numbers, lot numbers, and expiration dates",
      "See the full lifecycle: Request > PO > Receipt > Storage > Usage",
      "Simplified returns management for damaged or incorrect items",
      "Customizable fields for asset tagging and specialized inventory",
    ],
    image: "/procurement-hero-v2.png",
  },
];

const FAQS = [
  {
    q: "How does Apex Procure handle partial shipments?",
    a: "Our system is designed to handle complex delivery schedules. You can log partial receipts against a single PO, and the system will track the remaining balances automatically.",
  },
  {
    q: "Can I use the platform on a mobile device for receiving?",
    a: "Yes! Our mobile-optimized interface allows receiving staff to log deliveries, take photos of packing slips, and update stock levels directly from the warehouse floor.",
  },
  {
    q: "Does the system support asset tagging?",
    a: "Absolutely. You can configure custom fields for received items to capture serial numbers, asset IDs, and other location-specific information for long-term tracking.",
  },
  {
    q: "How does receiving impact my AP process?",
    a: "Apex Procure enables three-way matching by connecting your receipts with the original PO and the vendor's invoice, ensuring your AP team only approves payments for verified deliveries.",
  },
];

export default function ReceivingInventoryPage() {
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
          <Warehouse size={14} /> RECEIVING & INVENTORY
        </span>
        <h1 className={styles.heroTitle}>
          Total visibility into your <span style={{ color: "#E8572A" }}>goods and services</span>
        </h1>
        <p className={styles.heroSubtitle}>
          Track deliveries and manage inventory from receipt to storage with full traceability and automated discrepancy flagging that keeps your spend in check.
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
          src="/procurement-hero-v2.png" 
          alt="Apex Procure — Receiving & Inventory Tracking"
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
          <span className={styles.sectionEyebrow}><Package size={14} /> Accuracy and Control</span>
          <h2 className={styles.sectionTitle}>Bridge the gap between order and delivery</h2>
          <p className={styles.sectionSubtitle}>
            Blind spots in your delivery process lead to payment errors, stockouts, and waste. Apex Procure provides the digital tools needed for accurate fulfillment tracking.
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
        <h2 className={styles.faqTitle}>Receiving & inventory FAQs</h2>
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
          <h2 className={styles.ctaTitle}>Ready to master your inventory?</h2>
          <p className={styles.ctaSubtitle}>
            Join the organizations that use Apex Procure to gain total visibility into their supply chain.
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
            <Link href="/features/procurement/receiving-inventory" className={styles.footerLink} style={{ color: '#E8572A' }}>Receiving</Link>
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

"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight, CheckCircle2, ChevronDown, ChevronRight,
  Users, UserPlus, Star, Layout, ShieldCheck,
  Zap, Layers, Menu, X, PlayCircle
} from "lucide-react";
import { Logo } from "@/components/common/Logo";
import styles from "../../SolutionPage.module.css";

const VALUE_PROPS = [
  {
    icon: <Users size={20} />,
    title: "Centralized Vendor Hub",
    text: "Maintain a complete directory of all your vendors in one place. Access contact details, compliance documents, and purchase history with a single click.",
  },
  {
    icon: <UserPlus size={20} />,
    title: "Streamlined Intake",
    text: "Onboard new vendors faster with standardized intake forms and automated approval workflows. Ensure every vendor meets your organization's compliance standards.",
  },
  {
    icon: <Star size={20} />,
    title: "Performance Tracking",
    text: "Monitor vendor performance with real-time metrics on delivery times, quality scores, and pricing trends. Make data-driven decisions about your supplier base.",
  },
];

const FEATURES = [
  {
    id: "vendor-directory",
    icon: <Layout size={20} />,
    title: "Comprehensive Vendor Directory",
    description: "Go beyond a simple contact list with a robust, data-rich vendor hub.",
    bullets: [
      "Store certifications, tax documents, and insurance records",
      "Categorize vendors by risk, strategic importance, and spend category",
      "Maintain a centralized history of all interactions and transactions",
      "Global search filters make finding preferred vendors effortless",
    ],
    image: "/apex-vendor-portal.png",
  },
  {
    id: "vendor-portal",
    icon: <Zap size={20} />,
    title: "Interactive Vendor Portal",
    description: "Empower your vendors to manage their own data and stay connected.",
    bullets: [
      "Vendors can view and acknowledge purchase orders online",
      "Allow suppliers to upload and update their own compliance documents",
      "Real-time visibility into payment status and invoice history",
      "Streamlined communication channel for PO clarifications",
    ],
    image: "/apex-vendor-portal.png",
  },
  {
    id: "risk-mitigation",
    icon: <ShieldCheck size={20} />,
    title: "Vendor Risk Management",
    description: "Protect your organization with proactive monitoring and compliance tracking.",
    bullets: [
      "Automated alerts for expiring certifications or insurance",
      "Track diverse spending and ESG metrics across your supplier base",
      "Standardized risk assessment workflows for onboarding",
      "Flag vendors with recurring performance or quality issues",
    ],
    image: "/apex-vendor-portal.png",
  },
];

const FAQS = [
  {
    q: "Can vendors upload their own documents?",
    a: "Yes, our interactive vendor portal allows suppliers to securely upload and manage their own certifications, tax forms, and insurance documents, reducing the administrative burden on your team.",
  },
  {
    q: "How does the platform track vendor performance?",
    a: "We automatically track metrics like on-time delivery rates, invoice accuracy, and lead times. You can also add manual quality scores and internal reviews to provide a holistic view of vendor performance.",
  },
  {
    q: "Is there aLimit to the number of vendors I can manage?",
    a: "No, Apex Procure is built to scale with your organization. You can manage thousands of vendors and maintain detailed records for every one of them.",
  },
  {
    q: "Can I enforce the use of preferred vendors?",
    a: "Yes. You can mark vendors as 'Preferred' and guide employees toward these suppliers during the requisition process, helping consolidate spend and leverage better pricing.",
  },
];

export default function VendorManagementPage() {
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
          <Users size={14} /> VENDOR MANAGEMENT
        </span>
        <h1 className={styles.heroTitle}>
          Build better relationships with <span style={{ color: "#E8572A" }}>your vendors</span>
        </h1>
        <p className={styles.heroSubtitle}>
          Manage your entire vendor lifecycle from onboarding to performance tracking in one centralized hub designed for maximum visibility and efficiency.
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
          src="/apex-vendor-portal.png" 
          alt="Apex Procure — Vendor Management Dashboard"
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
          <span className={styles.sectionEyebrow}><Users size={14} /> Collaborative Partnerships</span>
          <h2 className={styles.sectionTitle}>Supplier management that scales with you</h2>
          <p className={styles.sectionSubtitle}>
            Fragmented vendor data and manual onboarding create bottlenecks and increase risk. Apex Procure centralizes your supplier base, fostering transparency and better collaboration.
          </p>
        </div>
        <div className={VALUE_PROPS.length > 0 ? styles.valueGrid : ""}>
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
        <h2 className={styles.faqTitle}>Vendor management FAQs</h2>
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
          <h2 className={styles.ctaTitle}>Ready to optimize your vendor portal?</h2>
          <p className={styles.ctaSubtitle}>
            Join the organizations that use Apex Procure to streamline supplier management and reduce operational risk.
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
            <Link href="/features/procurement/vendor-management" className={styles.footerLink} style={{ color: '#E8572A' }}>Vendors</Link>
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

"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight, CheckCircle2, ChevronDown, ChevronRight,
  Smartphone, Bell, MessageSquare, ShoppingBag, Globe, List,
  ShieldCheck, Zap, Layers, Menu, X, PlayCircle
} from "lucide-react";
import { Logo } from "@/components/common/Logo";
import styles from "../SolutionPage.module.css";

const VALUE_PROPS = [
  {
    icon: <Smartphone size={20} />,
    title: "Request anytime, anywhere",
    text: "Submit and manage purchase requests on the go with our top-rated mobile app. Never let a lack of desk time slow down your procurement process.",
  },
  {
    icon: <Bell size={20} />,
    title: "Instant status updates",
    text: "Eliminate the 'where is my request?' guesswork. Get real-time notifications via email, mobile push, or Slack the moment your request is updated.",
  },
  {
    icon: <MessageSquare size={20} />,
    title: "Built-in collaboration",
    text: "Discuss purchases directly within the platform. Tag team members and leave comments on specific requests to keep all communication centralized.",
  },
];

const FEATURES = [
  {
    id: "mobile-access",
    icon: <Smartphone size={20} />,
    title: "Mobile Access",
    description: "Submit, track, and manage purchase requests from anywhere using the Apex Procure mobile app. Designed for the modern, remote workforce.",
    bullets: [
      "Create new requisitions in seconds from your phone",
      "Attach receipts and quotes using your mobile camera",
      "Approvers can review and sign off with one tap",
      "Offline mode ensures you can draft requests even without signal",
    ],
    image: "/purchase-requests-feature.png",
  },
  {
    id: "notifications",
    icon: <Bell size={20} />,
    title: "Instant Status Updates",
    description: "Keep every stakeholder informed with automated, real-time notifications that eliminate bottlenecks.",
    bullets: [
      "Customizable alerts for mobile, email, and Slack",
      "Automated reminders for pending approvals",
      "Notifications for budget breaches or policy violations",
      "Track the full lifecycle from draft to 'Received' status",
    ],
    image: "/purchase-requests-feature.png",
  },
  {
    id: "collaboration",
    icon: <MessageSquare size={20} />,
    title: "Built-in Chat & Collaboration",
    description: "Break down silos with centralized communication around every purchase request.",
    bullets: [
      "Direct tagging with @mentions for quick team input",
      "Threaded comments keep discussions organized",
      "Audit trail captures all context for later review",
      "Internal-only notes for sensitive budget discussions",
    ],
    image: "/purchase-requests-feature.png",
  },
  {
    id: "integrations",
    icon: <ShoppingBag size={20} />,
    title: "Punchout & Integrations",
    description: "Connect Apex Procure with your favorite vendors to streamline the shopping experience.",
    bullets: [
      "Amazon Business punchout for seamless shopping",
      "Direct sync with preferred vendor catalogs",
      "Automatically pull item details into requests",
      "Reduce data entry errors by 95%",
    ],
    image: "/purchase-requests-feature.png",
  },
  {
    id: "multi-currency",
    icon: <Globe size={20} />,
    title: "Multi-Currency Support",
    description: "Manage global spending with automatic currency conversion and localized reporting.",
    bullets: [
      "Support for over 100 global currencies",
      "Automatic daily rate updates",
      "Report in your base currency for unified visibility",
      "Local tax compliance and handling",
    ],
    image: "/purchase-requests-feature.png",
  },
  {
    id: "catalog",
    icon: <List size={20} />,
    title: "Product Catalog",
    description: "Speed up the requisition process with a pre-approved catalog of frequently ordered items.",
    bullets: [
      "Enforce preferred vendor usage automatically",
      "Standardize pricing and SKU information",
      "Reduce rogue spend by guiding users to approved items",
      "One-click reordering for business essentials",
    ],
    image: "/purchase-requests-feature.png",
  },
];

const FAQS = [
  {
    q: "Can I customize the purchase requisition workflow?",
    a: "Yes, Apex Procure offers highly configurable approval workflows based on your organization's structure, different approval thresholds, and customizable requisition forms to match your specific needs.",
  },
  {
    q: "How does Apex Procure ensure compliance and control?",
    a: "We enforce compliance through automated approval routing, real-time budget checks at the point of request, and detailed audit trails that track every change and approval action.",
  },
  {
    q: "What integrations do you offer?",
    a: "Apex Procure integrates seamlessly with major ERPs and accounting systems like NetSuite, QuickBooks Online, and Sage Intacct. We also offer Amazon Business punchout and an open API for custom workflows.",
  },
  {
    q: "What kind of reporting and analytics are provided?",
    a: "You get detailed reports on requisition status, spending by department and category, and vendor performance. Our real-time dashboards allow you to monitor key procurement metrics at a glance.",
  },
  {
    q: "What support and training is offered?",
    a: "We provide personalized onboarding, dedicated customer success managers, and ongoing support via email, phone, and 24/7 live chat to ensure your team's success.",
  },
];

export default function PurchaseRequestsPage() {
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
          <Layers size={14} /> PURCHASE REQUISITION SOFTWARE
        </span>
        <h1 className={styles.heroTitle}>
          Easy-to-use purchase <span style={{ color: "#E8572A" }}>requisition software</span>
        </h1>
        <p className={styles.heroSubtitle}>
          Submit purchase requests anytime, anywhere on your mobile device or desktop. Real-time visibility and updates keep everyone informed and on the same page, fostering seamless collaboration.
        </p>
        <div className={styles.heroCtas}>
          <Link href="/login" className={styles.btnPrimary}>
            Book a Demo <ArrowRight size={18} />
          </Link>
          <Link href="/features/procurement" className={styles.btnSecondary}>
            <PlayCircle size={18} /> Tour Purchasing
          </Link>
        </div>
      </header>

      {/* HERO IMAGE */}
      <div className={styles.heroVisual}>
        <Image
          src="/purchase-requests-feature.png"
          alt="Apex Procure — Purchase Requisition Interface"
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
          <span className={styles.sectionEyebrow}><Zap size={14} /> Why Choose Apex Procure</span>
          <h2 className={styles.sectionTitle}>Streamline purchase requests and boost collaboration</h2>
          <p className={styles.sectionSubtitle}>
            Manual purchase request processes are slow and error-prone, leading to delays in approvals, difficulty tracking request status, and a lack of collaboration between departments. Apex Procure streamlines requisition workflows with mobile access, instant status updates, and built-in chat.
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
        <h2 className={styles.faqTitle}>Purchase requisition FAQs</h2>
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
          <h2 className={styles.ctaTitle}>Ready to control your business spend?</h2>
          <p className={styles.ctaSubtitle}>
            Join the organizations that use Apex Procure to streamline their purchase requisition processes and gain total visibility.
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
            <Link href="/features/purchase-requests" className={styles.footerLink} style={{ color: '#E8572A' }}>Purchase Requests</Link>
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

"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight, CheckCircle2, ChevronDown, ChevronRight,
  CreditCard, Zap, Layers, Menu, X, PlayCircle, ShieldCheck, PieChart,
  Smartphone, Lock, Globe
} from "lucide-react";
import { Logo } from "@/components/common/Logo";
import styles from "../../SolutionPage.module.css";

const VALUE_PROPS = [
  {
    icon: <Lock size={20} />,
    title: "Granular Card Controls",
    text: "Set precise spending limits by Merchant Category Code (MCC), single transaction amount, or time period. Turn cards on or off instantly with a single click.",
  },
  {
    icon: <Zap size={20} />,
    title: "Unlimited Virtual Cards",
    text: "Issue secure virtual cards for software subscriptions, online ads, or one-time vendor payments. Keep your primary accounts secure and manage every cent.",
  },
  {
    icon: <ShieldCheck size={20} />,
    title: "Fraud Prevention",
    text: "Protect company funds with real-time transaction monitoring and automated fraud alerts. Every card is backed by robust security protocols and liability protection.",
  },
];

const FEATURES = [
  {
    id: "card-issuance",
    icon: <CreditCard size={20} />,
    title: "Instant Card Issuance",
    description: "Empower your team without losing control. Issue virtual cards in seconds and physical cards with global delivery.",
    bullets: [
      "Create virtual cards for immediate use in online transactions",
      "Assign cards to specific departments, projects, or employees",
      "Set auto-replenishing budgets for recurring expenses",
      "Track card delivery and activation through a single dashboard",
    ],
    image: "/expense-cards.png",
  },
  {
    id: "auto-matching",
    icon: <Zap size={20} />,
    title: "Automated Receipt Matching",
    description: "Eliminate the month-end receipt chase. Transactions are matched to receipts the moment they are uploaded.",
    bullets: [
      "Real-time SMS and app notifications for every transaction",
      "Mobile receipt capture with AI-powered data extraction",
      "Automatic matching of receipts to card transactions",
      "Instant coding to your GL and ERP categories",
    ],
    image: "/expense-mobile.png",
  },
  {
    id: "visibility",
    icon: <PieChart size={20} />,
    title: "Real-Time Spending Insights",
    description: "Know exactly where your money is going before the statement arrives.",
    bullets: [
      "View live transaction feeds across all company cards",
      "Analyze spend by department, vendor, or category",
      "Detect duplicate subscriptions and redundant spend",
      "Export clean, reconciled data to your accounting system",
    ],
    image: "/expense-hero.png",
  },
];

const FAQS = [
  {
    q: "How many cards can I issue?",
    a: "You can issue unlimited virtual cards and as many physical cards as your team needs, depending on your plan tier. Virtual cards are free and can be created instantly.",
  },
  {
    q: "Can I set vendor-specific limits?",
    a: "Yes, you can restrict cards to specific vendors or merchant categories, ensuring that funds are only used for their intended purpose.",
  },
  {
    q: "What happens if an employee loses their card?",
    a: "Cards can be frozen or canceled instantly from the Apex Procure mobile app or web dashboard by either the employee or an admin, preventing any unauthorized spend.",
  },
];

export default function CardsPage() {
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
          <Link href="/features/expense-management" className={styles.navLink} style={{ color: '#E8572A' }}>Expense</Link>
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
          <CreditCard size={14} /> CORPORATE SPENDING CARDS
        </span>
        <h1 className={styles.heroTitle}>
          Empower your team with <span style={{ color: "#E8572A" }}>smart cards</span>
        </h1>
        <p className={styles.heroSubtitle}>
          Give your employees the tools they need to move fast while maintaining total control over every dollar spent. Issue cards, set limits, and automate reconciliations instantly.
        </p>
        <div className={styles.heroCtas}>
          <Link href="/login" className={styles.btnPrimary}>
            Get Started <ArrowRight size={18} />
          </Link>
          <Link href="/features/expense-management" className={styles.btnSecondary}>
            <PlayCircle size={18} /> Expense Management
          </Link>
        </div>
      </header>

      {/* HERO IMAGE */}
      <div className={styles.heroVisual}>
        <Image
          src="/expense-cards.png"
          alt="Apex Procure — Corporate Card Management"
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
          <span className={styles.sectionEyebrow}><Smartphone size={14} /> Control at your fingertips</span>
          <h2 className={styles.sectionTitle}>Built for security and scale</h2>
          <p className={styles.sectionSubtitle}>
            Traditional corporate cards are opaque and difficult to manage. Apex Procure cards are integrated directly into your spend management platform for instant visibility and control.
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
        <h2 className={styles.faqTitle}>Spending card FAQs</h2>
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
          <h2 className={styles.ctaTitle}>Ready to issue your first smart card?</h2>
          <p className={styles.ctaSubtitle}>
            Join the modern finance teams that use Apex Procure to automate expenses and control corporate spend.
          </p>
          <div className={styles.ctaBtns}>
            <Link href="/login" className={styles.ctaBtnLight}>
              Book a Demo <ArrowRight size={16} />
            </Link>
            <Link href="/features/expense-management" className={styles.ctaBtnGhost}>
              <PlayCircle size={16} /> Explore Expense Management
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
            <Link href="/features/expense-management/cards" className={styles.footerLink} style={{ color: '#E8572A' }}>Corporate Cards</Link>
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

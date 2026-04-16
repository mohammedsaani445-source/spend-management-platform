"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight, CheckCircle2, ChevronDown, ChevronRight,
  Receipt, Zap, Layers, Menu, X, PlayCircle, Smartphone, 
  Clock, CreditCard, Banknote
} from "lucide-react";
import { Logo } from "@/components/common/Logo";
import styles from "../../SolutionPage.module.css";

const VALUE_PROPS = [
  {
    icon: <Clock size={20} />,
    title: "Faster Reimbursements",
    text: "Reduce reimbursement cycles from weeks to days. Automated workflows and direct deposit capabilities ensure employees get their money back faster.",
  },
  {
    icon: <Smartphone size={20} />,
    title: "Mobile-First Capture",
    text: "Employees can snap photos of receipts on the go. Our mobile app handles the rest, extracting data and creating expense entries automatically.",
  },
  {
    icon: <Banknote size={20} />,
    title: "Direct Deposit Integration",
    text: "Skip the checks. Pay employees directly through ACH or international EFT for a seamless, paperless reimbursement experience.",
  },
];

const FEATURES = [
  {
    id: "receipt-ocr",
    icon: <Receipt size={20} />,
    title: "AI-Powered Receipt Capture",
    description: "Stop manual data entry. Our AI reads every receipt with over 99% accuracy.",
    bullets: [
      "Auto-detects vendor, date, amount, and currency",
      "Categorizes expenses based on company policy",
      "Flags duplicate receipts to prevent overpayment",
      "Supports multi-currency receipts with real-time conversion",
    ],
    image: "/apex-expense-mobile.png",
  },
  {
    id: "approval-flows",
    icon: <Zap size={20} />,
    title: "Custom Approval Routing",
    description: "Ensure every reimbursement follows your company policy with automated routing.",
    bullets: [
      "Route by amount, department, project, or category",
      "Parallel and sequential approval workflows",
      "Real-time notifications for pending approvals",
      "Mobile approval for managers on the move",
    ],
    image: "/apex-expense-hero.png",
  },
  {
    id: "policy-compliance",
    icon: <CheckCircle2 size={20} />,
    title: "Automated Policy Enforcement",
    description: "Enforce your travel and expense policies at the point of submission.",
    bullets: [
      "Audit 100% of expenses for policy violations",
      "Set per-diem limits and category caps",
      "Require justifications for out-of-policy spend",
      "Configure mandatory fields and receipt requirements",
    ],
    image: "/apex-expense-cards.png",
  },
];

const FAQS = [
  {
    q: "How long does it take for employees to get reimbursed?",
    a: "With Apex Procure and direct deposit, reimbursements can be processed in as little as 2-3 business days once approved by the finance team.",
  },
  {
    q: "Do employees need to keep physical receipts?",
    a: "Once a receipt is captured and uploaded via our mobile app, the digital version satisfies tax requirements in most jurisdictions, including the IRS.",
  },
  {
    q: "Does the platform support international reimbursements?",
    a: "Yes, employees can submit expenses in any currency, and the system will automatically calculate the conversion based on the transaction date.",
  },
];

export default function ReimbursementsPage() {
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
          <Banknote size={14} /> EMPLOYEE REIMBURSEMENTS
        </span>
        <h1 className={styles.heroTitle}>
          Get employees paid back <span style={{ color: "#E8572A" }}>effortlessly</span>
        </h1>
        <p className={styles.heroSubtitle}>
          Streamline out-of-pocket expenses with AI-powered receipt capture, flexible approval workflows, and lightning-fast direct deposit reimbursements.
        </p>
        <div className={styles.heroCtas}>
          <Link href="/login" className={styles.btnPrimary}>
            Start for Free <ArrowRight size={18} />
          </Link>
          <Link href="/features/expense-management" className={styles.btnSecondary}>
            <PlayCircle size={18} /> Tour Expense Solution
          </Link>
        </div>
      </header>

      {/* HERO IMAGE */}
      <div className={styles.heroVisual}>
        <Image
          src="/apex-expense-mobile.png"
          alt="Apex Procure — Mobile Expense Reimbursement"
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
          <span className={styles.sectionEyebrow}><Receipt size={14} /> Reimbursements done right</span>
          <h2 className={styles.sectionTitle}>Happy employees, efficient finance teams</h2>
          <p className={styles.sectionSubtitle}>
            Eliminate the frustration of slow reimbursements. Apex Procure automates the heavy lifting, so finance stays in control and employees stay productive.
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
        <h2 className={styles.faqTitle}>Reimbursement FAQs</h2>
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
          <h2 className={styles.ctaTitle}>Start reimbursing employees faster?</h2>
          <p className={styles.ctaSubtitle}>
            Join the modern companies that trust Apex Procure for global spend management and effortless expense reporting.
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
            <Link href="/features/expense-management/reimbursements" className={styles.footerLink} style={{ color: '#E8572A' }}>Reimbursements</Link>
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

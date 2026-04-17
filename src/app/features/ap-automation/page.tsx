"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight, CheckCircle2, ChevronDown, ChevronRight,
  FileText, Receipt, CreditCard, Zap, Layers, Menu, X, PlayCircle,
  Eye, ShieldCheck, Wallet
} from "lucide-react";
import { Logo } from "@/components/common/Logo";
import styles from "../SolutionPage.module.css";

const VALUE_PROPS = [
  {
    icon: <Zap size={20} />,
    title: "Increase the speed and accuracy of invoice processing",
    text: "AI-enhanced invoice processing pre-populates bills, minimizing error-prone manual tasks and redundant data entry. OCR technology captures invoice data accurately and instantly.",
  },
  {
    icon: <ShieldCheck size={20} />,
    title: "Know what's okay to pay with easy reconciliation",
    text: "Automated three-way matching speeds up reconciliation while eliminating errors, fraud, and overspending. Match invoices with POs and receiving notes automatically.",
  },
  {
    icon: <Wallet size={20} />,
    title: "Pay bills your way with increased flexibility",
    text: "Feel confident knowing invoices have been verified and approved by the right people, with flexible payment options ensuring accurate and timely bill payments every time.",
  },
];

const FEATURES = [
  {
    id: "invoice-processing",
    title: "Invoice Processing",
    description: "Streamline AP invoice processing with automation tools that save time and increase data accuracy during your billing processes.",
    bullets: [
      "Automatic OCR invoice capture helps populate bills based on the corresponding invoice and purchase order",
      "Forward invoices to a dedicated email inbox and a corresponding bill will automatically be created",
      "Delegate bills for approvals based on pre-configured workflows and conditions",
      "Streamline reconciliation with automated two-way and three-way matching",
    ],
    exploreUrl: "/features/ap-automation/invoice-processing",
    image: "/apex-ap-automation-v4-ocr.png",
  },
  {
    id: "bill-management",
    title: "Bill Management",
    description: "Speed up the AP reconciliation process and sync approved bills to ERP and accounting systems.",
    bullets: [
      "Track and report accruals in real time across all departments",
      "Reconcile deposits, prepayments, and partial invoices with ease",
      "Integrate seamlessly with your accounting software or ERP to centralize spend data",
      "Comprehensive audit trail tracks every action for compliance and governance",
    ],
    image: "/apex-approvals-v4-workflow.png",
  },
  {
    id: "payments",
    title: "Payments",
    description: "Increase the speed, accuracy, and visibility of your vendor payments by managing everything from procure to pay.",
    bullets: [
      "Approval workflows ensure the right teams have signed off before payments are approved",
      "Flexible payment options: ACH, wire transfer, EFT, and more",
      "Schedule bill payments in advance to avoid missed or late vendor payments",
      "Create bills for items not yet received to make deposit payments to vendors",
    ],
    exploreUrl: "/features/ap-automation/payments",
    image: "/apex-hero-dashboard-v4-high-res.png",
  },
];

const FAQS = [
  {
    q: "What is accounts payable automation software?",
    a: "Accounts payable automation software is a tool designed to streamline and automate the AP process. It manages tasks such as invoice capture, approval workflows, payment processing, and reconciliation. By automating these processes, AP automation software reduces manual effort, minimizes errors, and accelerates payment cycles.",
  },
  {
    q: "What are the benefits of implementing AP automation?",
    a: "Key benefits include: Increased efficiency by automating repetitive tasks; Enhanced accuracy by reducing manual data entry errors; Improved compliance with audit trails for accountability; Cost savings from reduced paper usage and payment delays; Better cash flow management with real-time visibility into invoices and payment schedules.",
  },
  {
    q: "How does Apex Procure's AP automation work?",
    a: "Apex Procure captures invoice data using OCR technology, matches invoices with purchase orders and goods received notes, and routes them for approval based on configurable workflows. This reduces the time and effort required for manual data entry, ensuring invoices are processed quickly and accurately with real-time tracking and notifications.",
  },
  {
    q: "Can I customize invoice processing workflows?",
    a: "Yes, Apex Procure offers extensive configuration options for invoice processing workflows. You can configure approval workflows based on your organization's hierarchy and policies, set different approval thresholds, and configure notifications to ensure compliance with internal controls.",
  },
  {
    q: "Does Apex Procure integrate with accounting software?",
    a: "Yes, Apex Procure integrates seamlessly with leading ERP and accounting systems. These integrations enable data to flow smoothly between Apex Procure and your existing systems, ensuring comprehensive and accurate financial data management.",
  },
  {
    q: "How long does implementation take?",
    a: "Implementation typically includes initial consultation, system configuration, data integration with your existing ERP, training sessions for your team, and go-live support. The process can take anywhere from a few weeks to a few months depending on the scope and scale of the project.",
  },
];

export default function APAutomationPage() {
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
          <Receipt size={14} /> AP Automation
        </span>
        <h1 className={styles.heroTitle}>
          More efficient AP <span style={{ color: "#E8572A" }}>invoice processing</span>
        </h1>
        <p className={styles.heroSubtitle}>
          Unify purchasing and accounts payable with Apex Procure, centralizing context and documentation for effortless reconciliation and accurate, on-time payments.
        </p>
        <div className={styles.heroCtas}>
          <Link href="/login" className={styles.btnPrimary}>
            Book a Demo <ArrowRight size={18} />
          </Link>
          <Link href="/" className={styles.btnSecondary}>
            <PlayCircle size={18} /> Platform Features
          </Link>
        </div>
      </header>

      {/* HERO IMAGE */}
      <div className={styles.heroVisual}>
        <Image
          src="/apex-ap-automation-hero-v4.png"
          alt="Apex Procure — AP Automation Dashboard"
          width={1200}
          height={700}
          style={{ width: "100%", height: "auto", display: "block" }}
          priority
        />
      </div>

      {/* ANCHOR NAV */}
      <div className={styles.anchorNav}>
        <button onClick={() => scrollToSection("value-props")} className={styles.anchorLink}>AP Overview</button>
        <button onClick={() => scrollToSection("features")} className={styles.anchorLink}>Features</button>
        <button onClick={() => scrollToSection("faqs")} className={styles.anchorLink}>FAQs</button>
        <button onClick={() => scrollToSection("testimonials")} className={styles.anchorLink}>Testimonials</button>
      </div>

      {/* VALUE PROPS */}
      <section id="value-props" className={styles.valueSection}>
        <div className={styles.valueSectionHeader}>
          <span className={styles.sectionEyebrow}><Zap size={14} /> Why Apex Procure AP</span>
          <h2 className={styles.sectionTitle}>More efficient AP invoice processing</h2>
          <p className={styles.sectionSubtitle}>
            When purchasing and accounting systems are siloed, AP teams face labor-intensive manual data entry and reconciliation tasks prone to errors. Apex Procure unifies your purchasing and accounts payable workflows with AI-enhanced automation tools.
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
                  <Link href={feature.exploreUrl || "/login"} className={styles.featureExploreLink}>
                    Explore {feature.title} <ChevronRight size={14} />
                  </Link>
                </div>
                <div className={styles.featureBlockVisual}>
                  <Image
                    src={feature.image || "/apex-ap-automation-hero-v4.png"}
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
        <h2 className={styles.faqTitle}>AP automation software FAQs</h2>
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

      {/* TESTIMONIALS */}
      <section id="testimonials" className={styles.testimonialSection}>
        <div className={styles.testimonialInner}>
          <h2 className={styles.testimonialSectionTitle}>Accounts Payable testimonials</h2>
          <div className={styles.testimonialCard}>
            <p className={styles.testimonialQuote}>
              &ldquo;With Apex Procure, we have seen significant improvement in the accounts payable process — we are at least 50% faster. The platform has given us more firepower with the same headcount while growing and expanding rapidly.&rdquo;
            </p>
            <p className={styles.testimonialAuthor}>Senior Controller</p>
            <p className={styles.testimonialRole}>Growth-stage Technology Company</p>
          </div>
          <div className={styles.testimonialCard}>
            <p className={styles.testimonialQuote}>
              &ldquo;The three-way matching alone has eliminated hours of manual reconciliation each week. Our AP team can now focus on strategic vendor relationships instead of chasing paper invoices.&rdquo;
            </p>
            <p className={styles.testimonialAuthor}>Director of Finance</p>
            <p className={styles.testimonialRole}>Multi-location Retail Organization</p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className={styles.ctaSection}>
        <div className={styles.ctaBox}>
          <h2 className={styles.ctaTitle}>Streamline your accounts payable today</h2>
          <p className={styles.ctaSubtitle}>
            Book a personalized demo to see how Apex Procure&apos;s AI-powered AP automation unifies purchasing and accounts payable in one platform.
          </p>
          <div className={styles.ctaBtns}>
            <Link href="/login" className={styles.ctaBtnLight}>
              Book a Demo <ArrowRight size={16} />
            </Link>
            <Link href="/" className={styles.ctaBtnGhost}>
              <PlayCircle size={16} /> Explore Platform
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
            <Link href="/login" className={styles.footerLink}>Features</Link>
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
          <div className={styles.footerSocials}>
            <a href="#" className={styles.footerSocialLink} aria-label="LinkedIn">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
            </a>
            <a href="#" className={styles.footerSocialLink} aria-label="Twitter">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}

"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight, CheckCircle2, ChevronDown, ChevronRight,
  Receipt, CreditCard, Zap, Layers, Menu, X, PlayCircle,
  PieChart, ShieldCheck, Clock
} from "lucide-react";
import { Logo } from "@/components/common/Logo";
import styles from "../SolutionPage.module.css";

const VALUE_PROPS = [
  {
    icon: <Receipt size={20} />,
    title: "Simplified expense reporting",
    text: "Simplify the expense reporting process for employees and finance teams with streamlined workflows, automated receipt capture, and real-time budget visibility that keeps everyone on track.",
  },
  {
    icon: <ShieldCheck size={20} />,
    title: "Real-time spending control",
    text: "Get full visibility and control over all employee spend with configurable spending limits, real-time alerts, and proactive budget management that catches policy violations before they happen.",
  },
  {
    icon: <Clock size={20} />,
    title: "No reimbursement delays",
    text: "Eliminate tedious reimbursement backlogs by giving employees corporate spending cards. Remove the friction of out-of-pocket expenses and simplify reconciliation with automatic transaction matching.",
  },
];

const FEATURES = [
  {
    id: "expense-reports",
    title: "Expense Reports",
    description: "Give employees a fast, intuitive way to submit expense reports while giving finance teams the visibility and control they need over company spend.",
    bullets: [
      "Track expenses against budgets and departmental allocations in real time",
      "AI-powered OCR captures receipt details and auto-populates expense line items",
      "Interactive dashboards provide real-time visibility into spending patterns and trends",
      "Streamline reconciliation with automated matching of expenses to budgets and GL codes",
      "Custom approval workflows route expense reports to the right approvers by amount, department, or category",
    ],
    exploreUrl: "/features/expense-management/reimbursements",
    image: "/apex-expense-mobile.png",
  },
  {
    id: "spending-cards",
    title: "Spending Cards",
    description: "Replace petty cash and personal expense reimbursements with secure, configurable corporate spending cards that give you control over every transaction.",
    bullets: [
      "Issue physical or virtual spending cards to employees with pre-set spending limits",
      "Real-time balance alerts ensure employees and managers know exactly where they stand",
      "Employees can request additional funds directly from the platform with automatic routing to approvers",
      "Automatic transaction feeds eliminate manual data entry and speed up month-end close",
      "Configurable card controls allow you to set limits by merchant category, transaction amount, or time period",
    ],
    exploreUrl: "/features/expense-management/cards",
    image: "/apex-expense-cards.png",
  },
];

const FAQS = [
  {
    q: "What is expense management software?",
    a: "Expense management software is a system designed to track, manage, and control employee business expenses and corporate card spending. It automates the process of submitting, approving, and reimbursing expenses, reducing manual work and increasing policy compliance. Apex Procure takes this further by integrating expense management with procurement and AP workflows for complete spend visibility.",
  },
  {
    q: "How do corporate spending cards work with Apex Procure?",
    a: "Apex Procure allows you to issue physical and virtual spending cards to employees with configurable spending limits. Every transaction flows automatically into the platform, eliminating manual receipt chasing. Managers can set limits by category, amount, or time period, and employees can request additional funds directly through the platform.",
  },
  {
    q: "Can I set spending limits and controls on employee cards?",
    a: "Yes. Apex Procure provides granular control over spending cards including per-transaction limits, daily/weekly/monthly caps, merchant category restrictions, and time-based controls. You can customize these controls for each employee or group, ensuring policy compliance while giving employees the flexibility they need.",
  },
  {
    q: "How does Apex Procure handle receipt capture?",
    a: "Our AI-powered OCR technology allows employees to capture receipts using their mobile phone camera. The system automatically extracts key data points (vendor, amount, date, category) and matches them to the corresponding transaction, virtually eliminating manual data entry.",
  },
  {
    q: "Does the platform support reimbursement workflows?",
    a: "Yes. For out-of-pocket expenses, Apex Procure streamlines the reimbursement process with automated approval workflows, direct deposit capabilities, and real-time status tracking. Employees can see exactly where their reimbursement request stands at any point in the process.",
  },
];

export default function ExpenseManagementPage() {
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
          <CreditCard size={14} /> Expense & Card Management
        </span>
        <h1 className={styles.heroTitle}>
          Smarter <span style={{ color: "#E8572A" }}>expense & card</span> management
        </h1>
        <p className={styles.heroSubtitle}>
          Gain complete visibility and control over employee spending with AI-powered expense reports and configurable corporate spending cards — all in one unified platform.
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
          src="/apex-expense-hero.png"
          alt="Apex Procure — Expense Management Dashboard"
          width={1200}
          height={700}
          style={{ width: "100%", height: "auto", display: "block" }}
          priority
        />
      </div>

      {/* ANCHOR NAV */}
      <div className={styles.anchorNav}>
        <button onClick={() => scrollToSection("value-props")} className={styles.anchorLink}>Expense Overview</button>
        <button onClick={() => scrollToSection("features")} className={styles.anchorLink}>Features</button>
        <button onClick={() => scrollToSection("faqs")} className={styles.anchorLink}>FAQs</button>
        <button onClick={() => scrollToSection("testimonials")} className={styles.anchorLink}>Testimonials</button>
      </div>

      {/* VALUE PROPS */}
      <section id="value-props" className={styles.valueSection}>
        <div className={styles.valueSectionHeader}>
          <span className={styles.sectionEyebrow}><PieChart size={14} /> Why Apex Procure</span>
          <h2 className={styles.sectionTitle}>Complete expense visibility and control</h2>
          <p className={styles.sectionSubtitle}>
            Managing expenses with spreadsheets, email receipts, and manual reconciliation wastes time and creates compliance gaps. Apex Procure streamlines expense reporting and spending card management with AI-powered automation.
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
                    src={feature.image || "/expense-hero.png"}
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
        <h2 className={styles.faqTitle}>Expense management FAQs</h2>
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
          <h2 className={styles.testimonialSectionTitle}>Expense management testimonials</h2>
          <div className={styles.testimonialCard}>
            <p className={styles.testimonialQuote}>
              &ldquo;We eliminated the chaos of paper receipts and spreadsheet tracking completely. Apex Procure&apos;s corporate cards gave every team member the ability to make purchases within policy, and the automatic reconciliation saved our finance team an entire day per week.&rdquo;
            </p>
            <p className={styles.testimonialAuthor}>CFO</p>
            <p className={styles.testimonialRole}>Fast-growing SaaS Company</p>
          </div>
          <div className={styles.testimonialCard}>
            <p className={styles.testimonialQuote}>
              &ldquo;The spending visibility was instant. From day one, we could see exactly who was spending what, where, and why. The real-time alerts caught a few policy violations before they became problems, which made adopting the tool an easy sell to leadership.&rdquo;
            </p>
            <p className={styles.testimonialAuthor}>VP of Operations</p>
            <p className={styles.testimonialRole}>Professional Services Firm</p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className={styles.ctaSection}>
        <div className={styles.ctaBox}>
          <h2 className={styles.ctaTitle}>Take control of employee spending</h2>
          <p className={styles.ctaSubtitle}>
            Book a personalized demo to see how Apex Procure&apos;s expense and card management simplifies reporting and gives you real-time spend visibility.
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

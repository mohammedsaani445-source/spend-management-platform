"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight, CheckCircle2, ChevronDown, ChevronRight,
  GitBranch, ShieldCheck, Zap, Bell, Smartphone, UserCheck, 
  Layers, Menu, X, PlayCircle, BarChart3, Database
} from "lucide-react";
import { Logo } from "@/components/common/Logo";
import styles from "../SolutionPage.module.css";

const VALUE_PROPS = [
  {
    icon: <ShieldCheck size={20} />,
    title: "Enforce policy at every step",
    text: "Automatically route requests based on your company's delegation of authority, ensuring every dollar spent is properly authorized and compliant.",
  },
  {
    icon: <BarChart3 size={20} />,
    title: "Real-time budget visibility",
    text: "Equip your approvers with the financial context they need. Show them the exact impact a request will have on their budget before they hit 'Approve'.",
  },
  {
    icon: <Zap size={20} />,
    title: "Drastically reduce cycle times",
    text: "Move from request to order in minutes, not days. Automated routing and mobile notifications keep the process moving without manual follow-ups.",
  },
];

const FEATURES = [
  {
    id: "configurable-workflows",
    icon: <GitBranch size={20} />,
    title: "Configurable Approval Workflows",
    description: "Build unlimited, custom approval workflows tailored to your specific organizational structure.",
    bullets: [
      "Route by department, location, project, or custom fields",
      "Set multi-level approval thresholds (e.g., Finance Manager > VP > CFO)",
      "Supports parallel approvals (multiple people must approve at once)",
      "Conditional logic branches for complex routing needs",
    ],
    image: "/approvals-feature.png",
  },
  {
    id: "budget-impact",
    icon: <BarChart3 size={20} />,
    title: "Budget Impact Insights",
    description: "Empower approvers with proactive budget visibility.",
    bullets: [
      "Compare request amount against remaining budget in real-time",
      "Automatic warnings for over-budget requests",
      "Drill down into budget utilization by category or project",
      "Identify potential savings before the commitment is made",
    ],
    image: "/approvals-feature.png",
  },
  {
    id: "omnichannel-notifications",
    icon: <Bell size={20} />,
    title: "Omnichannel Notifications",
    description: "Reach your approvers where they are to keep procurement moving.",
    bullets: [
      "Mobile push notifications for instant action",
      "Actionable email alerts with direct approval links",
      "Slack and Microsoft Teams integrations",
      "Automated escalation reminders for delayed approvals",
    ],
    image: "/approvals-feature.png",
  },
  {
    id: "mobile-approvals",
    icon: <Smartphone size={20} />,
    title: "Mobile-First Approvability",
    description: "Never let travel or meetings slow down your approvals.",
    bullets: [
      "Review and approve requests on-the-go with the mobile app",
      "View attached quotes and documents directly on your phone",
      "Leave comments and request more information effortlessly",
      "Secure biometric authentication for critical approvals",
    ],
    image: "/approvals-feature.png",
  },
  {
    id: "delegated-approvals",
    icon: <UserCheck size={20} />,
    title: "Approver Delegation",
    description: "Ensure business continuity when approvers are out-of-office.",
    bullets: [
      "Schedule delegation periods for vacations or travel",
      "Redirect pending tasks to a trusted colleague",
      "Full audit trail of who approved on behalf of whom",
      "Easy one-click reactivation when you return",
    ],
    image: "/approvals-feature.png",
  },
  {
    id: "audit-trails",
    icon: <Database size={20} />,
    title: "Audit Trails & Compliance",
    description: "Maintain a forensic record of every spend decision.",
    bullets: [
      "Complete history of request creation, edits, and approvals",
      "Capture every comment and document version",
      "Timestamped logs for SOX and external audit compliance",
      "Secure, tamper-proof record keeping in a centralized hub",
    ],
    image: "/approvals-workflow.png",
  },
];

const FAQS = [
  {
    q: "Can we have different approval levels for different departments?",
    a: "Absolutely. Apex Procure allows you to create completely independent workflows for every department, location, or project. You can have a 2-step process for Marketing and a 5-step process for Operations if needed.",
  },
  {
    q: "How do we handle emergencies or 'rush' requests?",
    a: "You can configure logic to expedite certain requests based on priority flags or specific vendor types. Additionally, mobile notifications ensure that 'rush' requests are seen and acted upon immediately.",
  },
  {
    q: "What happens if an approver is on vacation?",
    a: "Our Delegation feature allows users to set a delegate for a specific timeframe. During this period, all approval requests are automatically routed to the secondary approver, ensuring no bottlenecks.",
  },
  {
    q: "Does this integrate with our accounting software?",
    a: "Yes. Once a request is fully approved, it can automatically trigger the creation of a purchase order or sync the data directly with ERPs like NetSuite, QuickBooks, or Intacct for seamless AP processing.",
  },
  {
    q: "Can we set dynamic thresholds?",
    a: "Yes, you can set rules such as 'If Amount > $10k, seek Finance Director approval' or 'If Vendor = New, seek Legal review'. The system handles the complexity automatically.",
  },
];

export default function ApprovalsPage() {
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
          <Layers size={14} /> APPROVAL WORKFLOW SOFTWARE
        </span>
        <h1 className={styles.heroTitle}>
          Transform your <span style={{ color: "#E8572A" }}>spend approval process</span>
        </h1>
        <p className={styles.heroSubtitle}>
          Say goodbye to approval bottlenecks. Apex Procure provides the visibility and automation you need to ensure every purchase is authorized, compliant, and on-budget — all in one centralized platform.
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
          src="/approvals-feature.png"
          alt="Apex Procure — Approval Workflow Interface"
          width={1200}
          height={700}
          style={{ width: "100%", height: "auto", display: "block" }}
          priority
        />
      </div>

      {/* ANCHOR NAV */}
      <div className={styles.anchorNav}>
        <button onClick={() => scrollToSection("value-props")} className={styles.anchorLink}>Value Props</button>
        <button onClick={() => scrollToSection("features")} className={styles.anchorLink}>Features</button>
        <button onClick={() => scrollToSection("faqs")} className={styles.anchorLink}>FAQs</button>
      </div>

      {/* VALUE PROPS */}
      <section id="value-props" className={styles.valueSection}>
        <div className={styles.valueSectionHeader}>
          <span className={styles.sectionEyebrow}><Zap size={14} /> The Apex Advantage</span>
          <h2 className={styles.sectionTitle}>Centralized approvals for total spend control</h2>
          <p className={styles.sectionSubtitle}>
            Unstructured approval processes lead to delays, policy violations, and poor financial oversight. Apex Procure provides a robust, scalable framework to automate approvals and protect your bottom line.
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
        <h2 className={styles.faqTitle}>Approval software FAQs</h2>
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
          <h2 className={styles.ctaTitle}>Empower your team with smarter approvals</h2>
          <p className={styles.ctaSubtitle}>
            Join the organizations that use Apex Procure to automate workflows and maintain real-time spend control.
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
            <Link href="/features/purchase-requests" className={styles.footerLink}>Purchase Requests</Link>
            <Link href="/features/approvals" className={styles.footerLink} style={{ color: '#E8572A' }}>Approvals</Link>
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

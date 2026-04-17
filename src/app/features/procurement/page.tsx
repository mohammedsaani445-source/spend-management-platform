"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight, CheckCircle2, ChevronDown, ChevronRight,
  Eye, GitBranch, FileText, HandshakeIcon, Users, Package, PieChart, TrendingUp,
  ShieldCheck, Zap, Layers, Menu, X, PlayCircle
} from "lucide-react";
import { Logo } from "@/components/common/Logo";
import styles from "../SolutionPage.module.css";

const VALUE_PROPS = [
  {
    icon: <Eye size={20} />,
    title: "Real-time visibility into all company spend",
    text: "Guide your company towards responsible spend practices with real-time budget visibility. Easily track spending across locations, departments, and account codes.",
  },
  {
    icon: <GitBranch size={20} />,
    title: "Standardize workflows for increased control",
    text: "Accelerate cycle times with standardized workflows and processes that scale. Automation tools eliminate error-prone manual work and free up time to focus on what really matters.",
  },
  {
    icon: <Users size={20} />,
    title: "Improve transparency and team collaboration",
    text: "Centralize documentation and communication around every purchase in one integrated spend management solution. Break down silos with in-app notifications that keep everyone informed.",
  },
];

const FEATURES = [
  {
    id: "purchase-requests",
    icon: <FileText size={20} />,
    title: "Purchase Requests",
    description: "Standardize and streamline the procurement process from request to payment. Accelerate request creation with AI Intake that auto-fills line items from vendor quotes.",
    bullets: [
      "Create, edit, and submit requests in real time on desktop or mobile",
      "Get real-time status updates and notifications on email, mobile, and Slack",
      "Select suggested items from preferred vendor product catalogs",
      "Auto-populate requests using AI-powered document parsing",
    ],
    exploreUrl: "/features/purchase-requests",
    image: "/apex-purchase-requests-v4-ai.png",
  },
  {
    id: "approvals",
    icon: <ShieldCheck size={20} />,
    title: "Approvals",
    description: "Shorten cycle times between requesters and approvers by routing requests to the right teams for approvals.",
    bullets: [
      "Build unlimited approval workflows tailored to your specific needs by location, department, and more",
      "In-app chat enables team members to leave comments on pending or approved requests and purchase orders",
      "Approve on mobile and receive instant notifications when a request requires your attention",
      "Delegate approvals for pending requests to different approvers for a set period of time",
    ],
    exploreUrl: "/features/approvals",
    image: "/apex-approvals-v4-workflow.png",
  },
  {
    id: "purchase-orders",
    icon: <Package size={20} />,
    title: "Purchase Order Management",
    description: "Ensure proper tracking and approval of every purchase order while capturing all the information your AP team needs.",
    bullets: [
      "Create, edit, and send electronic purchase orders to vendors from a centralized system",
      "Automatically turn approved purchase requisitions into purchase orders",
      "Make a purchase order recurring or blanket and configure automatic vendor emails",
      "Access and view purchase orders on mobile from anywhere",
    ],
    exploreUrl: "/features/procurement/purchase-orders",
    image: "/apex-purchase-orders-v4-detail.png",
  },
  {
    id: "contract-management",
    icon: <HandshakeIcon size={20} />,
    title: "Contract Management",
    description: "Conveniently store contracts in a centralized repository and easily track current spend against total contract value.",
    bullets: [
      "Store active and historical contracts by vendor in a centralized repository",
      "Capture contract details including names, dates, amounts, payment terms, and more",
      "Set notifications for upcoming renewals and expired contracts",
      "Keep a historical record of changes in an audit log for compliance purposes",
    ],
    exploreUrl: "/features/procurement/contract-management",
    image: "/apex-contracts-v4-tracking.png",
  },
  {
    id: "vendor-management",
    icon: <Users size={20} />,
    title: "Vendor Management",
    description: "Manage your entire vendor lifecycle from onboarding to performance tracking in one centralized hub.",
    bullets: [
      "Maintain a complete vendor directory with contact details, documents, and certifications",
      "Track vendor performance with delivery metrics and quality scores",
      "Streamline vendor onboarding with standardized intake forms",
      "Portal access lets vendors view POs, update invoices, and manage documentation",
    ],
    exploreUrl: "/features/procurement/vendor-management",
    image: "/apex-vendors-v4-portal.png",
  },
  {
    id: "receiving",
    icon: <Package size={20} />,
    title: "Receiving & Inventory",
    description: "Track deliveries and manage inventory from receipt to storage with full traceability.",
    bullets: [
      "Log received goods against purchase orders with quantity and condition tracking",
      "Flag discrepancies between ordered and received items automatically",
      "Track inventory levels across multiple locations and warehouses",
      "Set low-stock alerts and reorder point notifications",
    ],
    exploreUrl: "/features/procurement/receiving-inventory",
    image: "/apex-receiving-v4-mobile-v2.png",
  },
  {
    id: "budget-management",
    icon: <PieChart size={20} />,
    title: "Budget Management",
    description: "Gain full control over your organization's budgets with real-time tracking and smart allocation tools.",
    bullets: [
      "Create budgets across departments, locations, and projects",
      "Real-time budget vs. actual spend dashboards with variance analysis",
      "Auto-enforce budget limits at the point of request creation",
      "Roll forward unspent budget or reallocate across departments",
    ],
    exploreUrl: "/features/procurement/budget-management",
    image: "/apex-budget-mgmt-v4-charts.png",
  },
  {
    id: "spend-insights",
    icon: <TrendingUp size={20} />,
    title: "Spend Insights",
    description: "Turn procurement data into actionable business intelligence with powerful analytics and reporting.",
    bullets: [
      "AI-powered spend analytics with customizable dashboards",
      "Drill-down reports by vendor, category, department, and location",
      "Identify cost-saving opportunities and spending trends",
      "Export reports in PDF, CSV, or schedule automated delivery",
    ],
    exploreUrl: "/features/procurement/spend-insights",
    image: "/apex-insights-v4-analytics.png",
  },
];

const FAQS = [
  {
    q: "What is Apex Procure procurement software?",
    a: "Apex Procure is an AI-powered procurement management platform that streamlines the entire purchasing process — from purchase requests and approvals to purchase orders, vendor management, and spend analytics. It provides end-to-end visibility and control over company spend.",
  },
  {
    q: "How does Apex Procure help standardize procurement workflows?",
    a: "Apex Procure enables you to build unlimited, custom approval workflows based on department, location, budget thresholds, and more. Every purchase request follows a standardized process, eliminating rogue spend and ensuring compliance with your organization's procurement policies.",
  },
  {
    q: "Can I track spending across multiple departments and locations?",
    a: "Yes. Apex Procure provides real-time budget tracking across all departments, locations, and project codes. You can set budgets per entity and monitor actual vs. planned spend through interactive dashboards that update in real time.",
  },
  {
    q: "Does Apex Procure integrate with accounting software?",
    a: "Yes, Apex Procure integrates with leading ERP and accounting systems. Approved purchase orders and invoices sync directly with your financial system, ensuring accurate data and eliminating manual re-entry.",
  },
  {
    q: "How does AI improve the procurement process?",
    a: "Our AI-powered features include smart document parsing that auto-fills purchase requests from vendor quotes, intelligent spend analysis that identifies savings opportunities, and automated categorization of purchases. This reduces manual work by up to 90% and improves data accuracy.",
  },
];

export default function ProcurementPage() {
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
          <Link href="/features/procurement" className={styles.navLink} style={{ color: '#E8572A' }}>Procurement</Link>
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
          <Layers size={14} /> Procurement Solution
        </span>
        <h1 className={styles.heroTitle}>
          Efficient, budget-informed <span style={{ color: "#E8572A" }}>procurement</span>
        </h1>
        <p className={styles.heroSubtitle}>
          Apex Procure empowers businesses to track and control every purchase from request to payment, ensuring more compliant and effective procurement with complete spend visibility.
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
          src="/apex-purchasing-module-v4.png"
          alt="Apex Procure — Procurement Dashboard"
          width={1200}
          height={700}
          style={{ width: "100%", height: "auto", display: "block" }}
          priority
          unoptimized={true}
        />
      </div>

      {/* ANCHOR NAV */}
      <div className={styles.anchorNav}>
        <button onClick={() => scrollToSection("value-props")} className={styles.anchorLink}>Budget-Informed Spend</button>
        <button onClick={() => scrollToSection("features")} className={styles.anchorLink}>Features</button>
        <button onClick={() => scrollToSection("faqs")} className={styles.anchorLink}>FAQs</button>
        <button onClick={() => scrollToSection("testimonials")} className={styles.anchorLink}>Testimonials</button>
      </div>

      {/* VALUE PROPS */}
      <section id="value-props" className={styles.valueSection}>
        <div className={styles.valueSectionHeader}>
          <span className={styles.sectionEyebrow}><Zap size={14} /> Why Apex Procure</span>
          <h2 className={styles.sectionTitle}>Efficient, budget-informed spend</h2>
          <p className={styles.sectionSubtitle}>
            Unstructured procurement practices lead to inefficient manual work, significant delays, and rogue spending. Apex Procure standardizes your procurement process to create scalable workflows that save time and promote budget discipline.
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
                    src={feature.image || "/procurement-hero-v2.png"}
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
        <h2 className={styles.faqTitle}>Procurement software FAQs</h2>
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
          <h2 className={styles.testimonialSectionTitle}>Procurement testimonials</h2>
          <div className={styles.testimonialCard}>
            <p className={styles.testimonialQuote}>
              &ldquo;With Apex Procure, we have seen significant improvement in the procurement process. We are at least 50% faster and the platform has given us more firepower with the same headcount. The approval workflows alone saved us countless hours each week.&rdquo;
            </p>
            <p className={styles.testimonialAuthor}>Director of Operations</p>
            <p className={styles.testimonialRole}>Enterprise Manufacturing Company</p>
          </div>
          <div className={styles.testimonialCard}>
            <p className={styles.testimonialQuote}>
              &ldquo;Apex Procure provides a single unified system that accommodates different departments and locations. Everyone adheres to the same process and guidelines — creating a level of oversight that would be impossible with manual systems.&rdquo;
            </p>
            <p className={styles.testimonialAuthor}>VP of Finance</p>
            <p className={styles.testimonialRole}>Multi-site Healthcare Organization</p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className={styles.ctaSection}>
        <div className={styles.ctaBox}>
          <h2 className={styles.ctaTitle}>Get started with proactive procurement</h2>
          <p className={styles.ctaSubtitle}>
            Book a personalized demo to see how Apex Procure&apos;s AI-powered platform streamlines the entire procurement lifecycle.
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

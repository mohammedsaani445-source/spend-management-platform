"use client";

import { useRef, useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, useScroll, useTransform, AnimatePresence, useInView } from "framer-motion";
import { ArrowLeft, ArrowRight, Sparkles } from "lucide-react";
import { Logo } from "@/components/common/Logo";
import styles from "./Tour.module.css";

const TOUR_CHAPTERS = [
  {
    id: "mission",
    tag: "The Mission",
    title: "Product Goals & Vision",
    description: "Built to solve the chaos of enterprise spending. Apex Procure brings institutional-grade clarity to every transaction, ensuring maximum efficiency and cost-containment across your entire organization.",
    image: "/mission-hero.png",
    color: "#E8572A",
    stats: [
      { label: "Cost Savings", value: "22%" },
      { label: "Visibility", value: "100%" }
    ]
  },
  {
    id: "design",
    tag: "Design Solution",
    title: "Institutional-Grade DNA",
    description: "Our 'Institutional Intelligence' interface isn't just about beauty—it's about confidence. High-fidelity layouts and precise typography reduce cognitive load, allowing procurement teams to focus on what matters.",
    image: "/design-hero.png",
    color: "#E8572A",
    stats: [
      { label: "Cognitive Load", value: "-40%" },
      { label: "UX Rating", value: "4.9/5" }
    ]
  },
  {
    id: "audience",
    tag: "Target Audience",
    title: "Built for Modern Leaders",
    description: "Tailored for CFOs, CPOs, and controllers who demand more than just 'tracking'. Apex is designed for scale-ups and enterprises that require institutional-grade controls with SaaS-level agility.",
    image: "/audience-hero.png",
    color: "#E8572A",
    stats: [
      { label: "Enterprise Ready", value: "Yes" },
      { label: "User Adoption", value: "98%" }
    ]
  },
  {
    id: "procurement",
    tag: "Product: Procurement",
    title: "Simplified Intake-to-Receive",
    description: "Control purchasing with ease. From AI-powered request intake to automated approval routing, we give you the visibility to secure procurement excellence instantly.",
    image: "/procurement-hero.png",
    color: "#E8572A",
    stats: [
      { label: "PO Creation", value: "< 2m" },
      { label: "Approvals", value: "Auto" }
    ]
  },
  {
    id: "ap-automation",
    tag: "Product: Autonomous AP",
    title: "The Magic of 3-Way Matching",
    description: "Our AI engine automatically matches Purchase Orders, Invoices, and Receipts. No manual data entry, no errors, just pure speed and autonomous precision.",
    image: "/ap-automation-hero.png",
    color: "#E8572A",
    stats: [
      { label: "Matching Rate", value: "94%" },
      { label: "Error Margin", value: "0.01%" }
    ]
  },
  {
    id: "inventory",
    tag: "Product: Asset Intelligence",
    title: "Real-time Fleet Control",
    description: "Track the health, location, and value of every enterprise asset. Our high-fidelity registry ensures you never lose sight of your physical and digital investments.",
    image: "/asset-intelligence-hero.png",
    color: "#E8572A",
    stats: [
      { label: "Asset Tracking", value: "Live" },
      { label: "Fleet Health", value: "A+" }
    ]
  },
  {
    id: "ai-analyst",
    tag: "Product: Apex AI™",
    title: "Your Financial Superpower",
    description: "Engage with Apex AI to uncover hidden savings, flag risks, and get proactive budget insights through a native natural language interface. Your 24/7 procurement analyst.",
    image: "/apex-ai-hero.png",
    color: "#E8572A",
    stats: [
      { label: "Smarter Insights", value: "Proactive" },
      { label: "Risk Flagging", value: "Instant" }
    ]
  }
];

export default function TourPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const sectionRef = useRef<HTMLElement>(null);
  const [activeChapter, setActiveChapter] = useState(0);
  
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  const { scrollYProgress: sectionProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end end"]
  });

  // Fade out hero elements on scroll
  const heroOpacity = useTransform(scrollYProgress, [0, 0.05], [1, 0]);
  const heroY = useTransform(scrollYProgress, [0, 0.05], [0, -20]);

  // We will now use individual ChapterSection callbacks for activation
  // to ensure "level" alignment as requested.

  return (
    <div className={styles.container} ref={containerRef}>

      <nav className={styles.nav}>
        <Link href="/" className={styles.logoArea}>
          <Logo size={32} />
          <span>Apex Procure</span>
        </Link>
        <Link href="/" className={styles.backBtn}>
          <ArrowLeft size={18} /> Exit Tour
        </Link>
      </nav>

      {/* ═══ HERO CHAPTER ═══ */}
      <header className={styles.hero}>
        <motion.div
           style={{ opacity: heroOpacity, y: heroY }}
        >
          <span className={styles.heroEyebrow}>
            <Sparkles size={14} /> Experience the Future
          </span>
          <h1 className={styles.heroTitle}>
            A cinematic tour of <br />
            <span style={{ color: "#E8572A" }}>procurement excellence.</span>
          </h1>
          <p className={styles.heroSubtitle}>
            Step into the platform that redefines how modern enterprises 
            control, analyze, and optimize every dollar.
          </p>
        </motion.div>

        <motion.div className={styles.scrollIndicator} style={{ opacity: heroOpacity }}>
          <span>Scroll to begin journey</span>
          <div className={styles.mouse}>
            <div className={styles.mouseWheel} />
          </div>
        </motion.div>
      </header>

      {/* ═══ STORYSELLING SECTION ═══ */}
      <section className={styles.section} ref={sectionRef}>
        <div className={styles.sectionInner}>
          {/* Sticky Visual Display */}
          <div className={styles.stickyVisual}>
            <div className={styles.visualContainer}>
              {TOUR_CHAPTERS.map((chapter, i) => (
                <motion.div
                  key={chapter.id}
                  initial={false}
                  animate={{ 
                    opacity: activeChapter === i ? 1 : 0,
                    scale: activeChapter === i ? 1 : 1.1,
                    zIndex: activeChapter === i ? 10 : 0
                  }}
                  transition={{ 
                    duration: 0.8, 
                    ease: [0.16, 1, 0.3, 1]
                  }}
                    style={{ 
                      width: "100%", 
                      height: "100%", 
                      position: "absolute", 
                      top: 0, 
                      left: 0,
                      pointerEvents: activeChapter === i ? "auto" : "none",
                      zIndex: activeChapter === i ? 10 : i,
                      background: "#fff" 
                    }}
                >
                  <Image
                    src={chapter.image}
                    alt={chapter.title}
                    fill
                    style={{ objectFit: "cover" }}
                    priority={true}
                    unoptimized={true}
                  />
                  
                  {/* Premium Overlay Gradient */}
                  <div style={{
                    position: "absolute",
                    inset: 0,
                    background: "linear-gradient(to top, rgba(0,0,0,0.6) 0%, transparent 50%)"
                  }} />

                  {/* Visual Metadata Overlay */}
                  <AnimatePresence mode="wait">
                    {activeChapter === i && (
                      <motion.div 
                        key={`overlay-${i}`}
                        className={styles.visualOverlay}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.5, ease: "easeOut" }}
                      >
                        <div className={styles.indicatorTrack}>
                           <span className={styles.activeNumber}>0{i + 1}</span>
                           <span className={styles.totalNumber}>/ 07</span>
                        </div>
                        <div className={styles.overlayTag}>
                           {chapter.tag}
                        </div>
                        <div className={styles.overlayTitle}>
                           {chapter.title}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Scrolling Content */}
          <div className={styles.textContent}>
            {TOUR_CHAPTERS.map((chapter, i) => (
              <ChapterSection 
                key={chapter.id} 
                chapter={chapter} 
                isActive={activeChapter === i}
                onInView={() => setActiveChapter(i)}
                isLast={i === TOUR_CHAPTERS.length - 1}
              />
            ))}
          </div>
        </div>
      </section>
      <section className={styles.ctaSection}>
        <motion.div 
          className={styles.ctaCard}
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        >
          <span className={styles.heroEyebrow} style={{ marginBottom: "1.5rem" }}>
             Ready to Transform?
          </span>
          <h2 className={styles.ctaTitle}>
             See what Apex can do <br />
             for <span style={{ color: "#E8572A" }}>your team.</span>
          </h2>
          <p className={styles.ctaSubtitle}>
             Join 500+ enterprises who have automated their procurement 
             workflows and saved millions in operational costs.
          </p>
          <div className={styles.ctaButtons}>
            <Link href="/login" className={styles.btnPrimaryLarge}>
               Book a Demo <ArrowRight size={20} />
            </Link>
            <Link href="/" className={styles.btnSecondaryLarge}>
               Back to Home
            </Link>
          </div>
        </motion.div>
      </section>

      {/* ═══ PROGRESS BAR ═══ */}
      <motion.div 
        className={styles.progressBar}
        style={{ 
          scaleX: scrollYProgress,
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          height: "4px",
          background: "#E8572A",
          transformOrigin: "0%",
          zIndex: 2000
        }}
      />
    </div>
  );
}

function ChapterSection({ chapter, isActive, onInView, isLast }: any) {
  const ref = useRef(null);
  const isInView = useInView(ref, {
    // Standard chapters trigger when centered. 
    // The last chapter uses a massive bottom margin to stay active until the very end.
    margin: isLast ? "-45% 0% 100% 0%" : "-45% 0% -45% 0%"
  });

  useEffect(() => {
    if (isInView) {
      onInView();
    }
  }, [isInView, onInView]);

  return (
    <motion.div 
      ref={ref}
      className={styles.chapter} 
      initial={{ opacity: 0.1 }}
      animate={{ 
        opacity: isActive ? 1 : 0.05,
        scale: isActive ? 1 : 0.98,
        y: isActive ? 0 : 20
      }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      style={{ 
        minHeight: "80vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center"
      }}
    >
      <div className={styles.chapterContent}>
        <div className={styles.chapterTag}>{chapter.tag}</div>
        <h2 className={styles.chapterTitle}>{chapter.title}</h2>
        <p className={styles.chapterDesc}>{chapter.description}</p>
        
        <div className={styles.chapterStats}>
          {chapter.stats?.map((stat: any, idx: number) => (
            <div key={idx} className={styles.statItem}>
              <span className={styles.statValue}>{stat.value}</span>
              <span className={styles.statLabel}>{stat.label}</span>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { X, ChevronLeft, ChevronRight, Play, Pause, RotateCcw } from "lucide-react";

interface TourStep {
    title: string;
    description: string;
    image: string;
    tag: string;
}

const TOUR_STEPS: TourStep[] = [
    {
        tag: "Procure-to-Pay",
        title: "The Requisition Flow",
        description: "Experience the ease of requesting spend. From the first click to the final approval, every step is optimized for speed and clarity.",
        image: "/apex_tour_p2p_cinematic_1773601842141.png"
    },
    {
        tag: "Autonomous AP",
        title: "3-Way Match Perfection",
        description: "Our AI OCR engine automatically matches Purchase Orders, Invoices, and Receipts, eliminating manual data entry and human error.",
        image: "/apex_tour_matching_cinematic_1773601859432.png"
    },
    {
        tag: "Asset Intelligence",
        title: "Complete Fleet Control",
        description: "Track the health, location, and value of every enterprise asset in real-time with our high-fidelity registry.",
        image: "/apex_tour_assets_cinematic_1773601874048.png"
    },
    {
        tag: "AI Strategy",
        title: "Apex: Your Financial Brain",
        description: "Engage with Apex AI to uncover savings, flag risks, and get proactive budget insights through a native chat interface.",
        image: "/apex_tour_ai_cinematic_1773601891009.png"
    }
];

export default function ProductTour({ onClose }: { onClose: () => void }) {
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth <= 768);
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    const next = useCallback(() => {
        setCurrentStep((s) => (s + 1) % TOUR_STEPS.length);
        setProgress(0);
    }, []);

    const prev = () => {
        setCurrentStep((s) => (s - 1 + TOUR_STEPS.length) % TOUR_STEPS.length);
        setProgress(0);
    };

    useEffect(() => {
        if (!isPlaying) return;
        
        const interval = setInterval(() => {
            setProgress((p) => {
                if (p >= 100) {
                    next();
                    return 0;
                }
                return p + 0.5; // Controls autoplay speed (~5-6 seconds per slide)
            });
        }, 30);

        return () => clearInterval(interval);
    }, [isPlaying, next]);

    return (
        <div style={{ 
            position: 'fixed', inset: 0, zIndex: 10000, 
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'rgba(0,0,0,0.95)', backdropFilter: 'blur(20px)'
        }}>
            <style jsx global>{`
                @keyframes KenBurns {
                    from { transform: scale(1.0) translate(0, 0); }
                    to { transform: scale(1.08) translate(-1%, -1%); }
                }
                .ken-burns {
                    animation: KenBurns 8s ease-in-out infinite alternate;
                }
                .fade-in {
                    animation: fadeIn 0.8s ease-out forwards;
                }
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `}</style>

            <div style={{ 
                width: '100%', maxWidth: '1200px', height: isMobile ? '100vh' : '85vh',
                background: '#0F172A', borderRadius: isMobile ? '0' : '48px', overflow: 'hidden',
                display: 'flex', flexDirection: isMobile ? 'column' : 'row',
                boxShadow: '0 50px 100px -20px rgba(0,0,0,0.8)',
                border: '1px solid rgba(255,255,255,0.1)'
            }}>
                {/* Visual Area (Simulated Video) */}
                <div style={{ flex: isMobile ? 'none' : 1.6, height: isMobile ? '45vh' : '100%', background: '#000', position: 'relative', overflow: 'hidden' }}>
                    <div key={currentStep} className="ken-burns" style={{ width: '100%', height: '100%', position: 'relative' }}>
                        <Image 
                            src={step.image} 
                            alt={step.title} 
                            fill 
                            style={{ objectFit: 'cover', opacity: 0.9 }}
                            priority
                        />
                    </div>
                    {/* Progress Bar Over Image */}
                    <div style={{ position: 'absolute', bottom: 0, left: 0, height: '4px', width: `${progress}%`, background: '#E8572A', transition: 'width 0.1s linear', zIndex: 10 }} />
                </div>

                {/* Content Area */}
                <div style={{ 
                    flex: 1, 
                    padding: isMobile ? '2rem 1.5rem' : '80px 60px', 
                    display: 'flex', 
                    flexDirection: 'column', 
                    background: 'linear-gradient(135deg, #1A1A1A 0%, #0F172A 100%)', 
                    color: 'white',
                    overflowY: 'auto'
                }}>
                    <div className="fade-in" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: isMobile ? '1.5rem' : '2.5rem' }}>
                        <span style={{ 
                            padding: '6px 12px', background: 'rgba(232, 87, 42, 0.1)', color: '#E8572A', 
                            borderRadius: '100px', fontSize: '0.75rem', fontWeight: 900, 
                            textTransform: 'uppercase', letterSpacing: '0.15em', border: '1px solid rgba(232, 87, 42, 0.2)'
                        }}>
                            {step.tag}
                        </span>
                        <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.05)', border: 'none', borderRadius: '12px', padding: '8px', cursor: 'pointer', color: 'rgba(255,255,255,0.6)', transition: 'all 0.2s' }}>
                            <X size={20} />
                        </button>
                    </div>

                    <div key={`content-${currentStep}`} className="fade-in">
                        <h2 style={{ fontSize: isMobile ? '1.75rem' : '3rem', fontWeight: 900, color: '#FFFFFF', lineHeight: 1.1, marginBottom: '1rem', letterSpacing: '-0.02em' }}>
                            {step.title}
                        </h2>
                        <p style={{ fontSize: isMobile ? '1rem' : '1.25rem', color: 'rgba(255,255,255,0.6)', lineHeight: 1.6, marginBottom: isMobile ? '2rem' : '4rem', fontWeight: 500 }}>
                            {step.description}
                        </p>
                    </div>

                    <div style={{ marginTop: 'auto' }}>
                        {/* Interactive Controls */}
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: isMobile ? '1.5rem' : '2rem' }}>
                            <div style={{ display: 'flex', gap: '8px' }}>
                                {TOUR_STEPS.map((_, i) => (
                                    <div key={i} style={{ 
                                        width: i === currentStep ? (isMobile ? '30px' : '40px') : '8px', height: '8px', 
                                        background: i === currentStep ? '#E8572A' : 'rgba(255,255,255,0.1)', 
                                        borderRadius: '10px', transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)' 
                                    }} />
                                ))}
                            </div>
                            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                <button onClick={() => setIsPlaying(!isPlaying)} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', padding: '10px', borderRadius: '100px', cursor: 'pointer' }}>
                                    {isPlaying ? <Pause size={16} fill="white" /> : <Play size={16} fill="white" />}
                                </button>
                                <button onClick={() => {setCurrentStep(0); setProgress(0);}} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', padding: '10px', borderRadius: '100px', cursor: 'pointer' }}>
                                    <RotateCcw size={16} />
                                </button>
                            </div>
                        </div>

                        <div style={{ display: 'flex', gap: '1rem' }}>
                            <button onClick={prev} style={{ padding: '0.875rem', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.1)', background: 'transparent', color: 'white', cursor: 'pointer', flex: 1, fontWeight: 700, fontSize: isMobile ? '0.875rem' : '1rem' }}>
                                Previous
                            </button>
                            <button onClick={next} style={{ padding: isMobile ? '0.875rem' : '1rem 2rem', borderRadius: '14px', border: 'none', background: '#E8572A', color: 'white', fontWeight: 900, cursor: 'pointer', flex: 2, fontSize: isMobile ? '0.9375rem' : '1.125rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', boxShadow: '0 10px 30px rgba(232, 87, 42, 0.3)' }}>
                                {isMobile ? 'Next' : 'Next Scene'} <ChevronRight size={isMobile ? 18 : 22} />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

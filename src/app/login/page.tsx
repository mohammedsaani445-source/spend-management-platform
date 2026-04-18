"use client";

import { useState, useEffect } from "react";
import { signInWithPopup, GoogleAuthProvider, signInWithEmailAndPassword, sendPasswordResetEmail } from "firebase/auth";
import { auth, db, DB_PREFIX } from "@/lib/firebase";
import { ref, get } from "firebase/database";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Logo } from "@/components/common/Logo";
import {
    ArrowRight, Mail, Lock, Eye, EyeOff,
    AlertCircle, CheckCircle2, Loader2, ChevronLeft,
    Sparkles, ShieldCheck, Cpu, Zap, Package, 
    Globe, Database, Layers
} from "lucide-react";
import * as OTPAuth from "otpauth";
import styles from "./Login.module.css";

const AI_PROCUREMENT_EVENTS = [
    "Apex AI: Optimizing Sourcing Strategy for Sector-9 • Complexity Reduced by 40%",
    "Neural Network Tender Analysis: Anomaly Detected in Supplier Bid #881",
    "Autonomous PO Execution: $2.4M Transaction Verified by AI Protocol",
    "Generative RFP Generation: Sustainable Material Initiative Live",
    "Predictive Logistics: Lead Times Shortened via Intelligent Routing",
    "Global Compliance Shield: Automated Risk Mitigation Active for EMEA",
    "Sourcing Intelligence: Strategic Benchmarking Completed for Tier-1 Network",
];

const INTELLIGENCE_NODES = [
    { Icon: Sparkles, top: '15%', left: '10%', delay: 0, duration: 12 },
    { Icon: Cpu, top: '70%', left: '15%', delay: 2, duration: 15 },
    { Icon: Zap, top: '25%', left: '85%', delay: 1, duration: 14 },
    { Icon: Database, top: '75%', left: '80%', delay: 3, duration: 18 },
    { Icon: Layers, top: '10%', left: '75%', delay: 4, duration: 16 },
    { Icon: ShieldCheck, top: '85%', left: '45%', delay: 5, duration: 20 },
];

export default function LoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isEmailStep, setIsEmailStep] = useState(true);
    const [error, setError] = useState("");
    const [show2FA, setShow2FA] = useState(false);
    const [twoFactorCode, setTwoFactorCode] = useState("");
    const [isVerifying, setIsVerifying] = useState(false);
    const [userSecret, setUserSecret] = useState("");
    const [userEmail, setUserEmail] = useState("");
    const [isSendingReset, setIsSendingReset] = useState(false);
    const [resetSent, setResetSent] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [currentYear, setCurrentYear] = useState("");
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setCurrentYear(new Date().getFullYear().toString());
        setMounted(true);
    }, []);

    const handleEmailContinue = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        if (isEmailStep) {
            if (!email) { setError("Institutional email required"); return; }
            setIsEmailStep(false);
            return;
        }

        setIsVerifying(true);
        try {
            const result = await signInWithEmailAndPassword(auth, email, password);
            await check2FA(result.user.uid, result.user.email || "");
        } catch (err: any) {
            if (err.code === "auth/invalid-credential") setError("Verification mismatch. Try again.");
            else setError("Authentication failed. Contact IT.");
            setIsVerifying(false);
        }
    };

    const handleGoogleLogin = async () => {
        setIsVerifying(true);
        setError("");
        try {
            const provider = new GoogleAuthProvider();
            provider.setCustomParameters({ prompt: 'select_account' });
            const result = await signInWithPopup(auth, provider);
            await check2FA(result.user.uid, result.user.email || "");
        } catch (err: any) {
            if (err.code !== "auth/popup-closed-by-user") setError("Institutional SSO failed.");
            setIsVerifying(false);
        }
    };

    const check2FA = async (uid: string, email: string) => {
        try {
            const mappingRef = ref(db, `${DB_PREFIX}/userTenants/${uid}`);
            const mappingSnap = await get(mappingRef);

            if (!mappingSnap.exists()) {
                await auth.signOut();
                setError("Access denied. No workspace associated.");
                setIsVerifying(false);
                return;
            }

            const tenantId = mappingSnap.val().tenantId;
            const userRef = ref(db, `${DB_PREFIX}/tenants/${tenantId}/users/${uid}`);
            const snapshot = await get(userRef);

            if (snapshot.exists()) {
                const userData = snapshot.val();
                if (userData.isActive === false) {
                    await auth.signOut();
                    setError("Credentials suspended.");
                    setIsVerifying(false);
                    return;
                }
                if (userData.twoFactorEnabled && userData.twoFactorSecret) {
                    setUserSecret(userData.twoFactorSecret);
                    setUserEmail(email);
                    setShow2FA(true);
                    setIsVerifying(false);
                    return;
                }
            }
            router.push("/dashboard");
        } catch (err) {
            router.push("/dashboard");
        }
    };

    const handleVerify2FA = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setIsVerifying(true);
        try {
            const totp = new OTPAuth.TOTP({
                issuer: "Apex Procure", label: userEmail,
                algorithm: "SHA1", digits: 6, period: 30, secret: userSecret
            });
            const delta = totp.validate({ token: twoFactorCode, window: 1 });
            if (delta !== null) router.push("/dashboard");
            else { setError("Invalid 2FA signature."); setIsVerifying(false); }
        } catch {
            setError("Protocol error."); setIsVerifying(false);
        }
    };

    if (!mounted) return null;

    return (
        <div className={styles.wrapper}>
            {/* Spectacular Unified Stage Background */}
            <div className={styles.meshGradient} />
            <div className={styles.gridOverlay} />
            
            {INTELLIGENCE_NODES.map((item, idx) => (
                <div 
                    key={idx} 
                    className={styles.atmosIcon}
                    style={{ 
                        top: item.top, 
                        left: item.left,
                        '--delay': `${item.delay}s`,
                        '--duration': `${item.duration}s`
                    } as React.CSSProperties}
                >
                    <item.Icon size={44} strokeWidth={1} />
                </div>
            ))}

            <div className={styles.container}>
                <div className={styles.brandSection}>
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.6 }}
                    >
                        <Link href="/" className={styles.logoArea}>
                            <Logo size={42} />
                            <span>APEX PROCURE</span>
                        </Link>
                    </motion.div>
                    
                    <motion.h1 
                        className={styles.title}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                    >
                        Redefining Procurement
                    </motion.h1>
                    <motion.p 
                        className={styles.subtitle}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                    >
                        Apex AI: Redefining Procurement through Institutional Intelligence. <br />
                        Our AI engine simplifies complexity, transforming procurement into a strategic advantage.
                    </motion.p>
                </div>

                <motion.div 
                    className={styles.authCard}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    whileHover={{ 
                        y: -5,
                        transition: { duration: 0.3, ease: "easeOut" }
                    }}
                    transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                >
                    <AnimatePresence mode="wait">
                        {show2FA ? (
                            <motion.div 
                                key="2fa"
                                initial={{ opacity: 0, x: 10 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -10 }}
                            >
                                <h3 className="text-xl font-bold mb-2 flex items-center gap-2">
                                    <ShieldCheck className="text-orange-600" /> Multi-Factor Protocol
                                </h3>
                                <p className="text-neutral-500 mb-6 font-medium">Synchronizing with authorized device.</p>

                                {error && (
                                    <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-6 flex gap-2 items-center text-xs font-bold border border-red-100 uppercase tracking-tighter">
                                        <AlertCircle size={14} /> {error}
                                    </div>
                                )}

                                <form onSubmit={handleVerify2FA}>
                                    <div className={styles.inputGroup}>
                                        <label className={styles.label}>Intelligence Key</label>
                                        <div className={styles.inputWrapper}>
                                            <input
                                                type="text"
                                                className={styles.input}
                                                placeholder="000 000"
                                                value={twoFactorCode}
                                                onChange={e => setTwoFactorCode(e.target.value)}
                                                maxLength={6}
                                                autoFocus
                                            />
                                            <ShieldCheck size={20} className={styles.inputIcon} />
                                        </div>
                                    </div>
                                    <button type="submit" className={styles.primaryBtn} disabled={isVerifying || twoFactorCode.length < 6}>
                                        {isVerifying ? <Loader2 className="animate-spin" /> : "Verify Identity"}
                                    </button>
                                    <button type="button" onClick={() => setShow2FA(false)} className={styles.forgotLink}>
                                        Restart Authentication
                                    </button>
                                </form>
                            </motion.div>
                        ) : (
                            <motion.div 
                                key="login"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                            >
                                <h3 className="text-xl font-bold mb-2">Access Portal</h3>
                                <p className="text-neutral-500 mb-8 font-medium">Verify your organizational profile.</p>

                                {error && (
                                    <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-6 flex gap-2 items-center text-xs font-bold border border-red-100 uppercase tracking-tighter">
                                        <AlertCircle size={14} /> {error}
                                    </div>
                                )}

                                <form onSubmit={handleEmailContinue}>
                                    <div className={styles.inputGroup}>
                                        <label className={styles.label}>{isEmailStep ? "Provide your institutional email address" : "Verification Password"}</label>
                                        <div className={styles.inputWrapper}>
                                            {isEmailStep ? (
                                                <>
                                                    <input
                                                        type="email"
                                                        className={styles.input}
                                                        placeholder="address@enterprise.com"
                                                        value={email}
                                                        onChange={e => setEmail(e.target.value)}
                                                        required
                                                    />
                                                    <Mail size={20} className={styles.inputIcon} />
                                                </>
                                            ) : (
                                                <>
                                                    <input
                                                        type={showPassword ? "text" : "password"}
                                                        className={styles.input}
                                                        placeholder="••••••••"
                                                        value={password}
                                                        onChange={e => setPassword(e.target.value)}
                                                        required
                                                        autoFocus
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => setShowPassword(!showPassword)}
                                                        className="absolute right-6 top-1/2 -translate-y-1/2 border-none bg-transparent cursor-pointer flex p-0"
                                                    >
                                                        {showPassword ? <EyeOff size={20} color="#A3A3A3" /> : <Eye size={20} color="#A3A3A3" />}
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    </div>

                                    <button type="submit" className={styles.primaryBtn} disabled={isVerifying}>
                                        {isVerifying ? <Loader2 className="animate-spin" /> : (
                                            <>
                                                {isEmailStep ? "Continue to Security" : "Submit Access Request"}
                                                <ArrowRight size={18} />
                                            </>
                                        )}
                                    </button>

                                    {!isEmailStep && (
                                        <div className="mt-5 flex justify-between items-center">
                                            <button type="button" onClick={() => setIsEmailStep(true)} className={styles.forgotLink + " mt-0"}>
                                                Identity Switch
                                            </button>
                                            <button type="button" onClick={() => {}} className={styles.forgotLink + " mt-0"}>
                                                Recovery Protocol
                                            </button>
                                        </div>
                                    )}
                                </form>

                                <div className={styles.divider}>
                                    <div className={styles.line} />
                                    <span className={styles.dividerText}>SSO AUTHENTICATION</span>
                                    <div className={styles.line} />
                                </div>

                                <button className={styles.googleBtn} onClick={handleGoogleLogin} disabled={isVerifying}>
                                    <svg width="20" height="20" viewBox="0 0 24 24">
                                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.26.81-.58z" fill="#FBBC05" />
                                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                                    </svg>
                                    Continue with Google
                                </button>

                                <div className={styles.inviteOnlyBox}>
                                    <h4 className={styles.inviteTitle}>
                                        <Sparkles size={14} className="text-orange-600" />
                                        Invitation Exclusive
                                    </h4>
                                    <p className={styles.inviteText}>
                                        New user should join via admin invitation.
                                    </p>
                                    <Link href="mailto:ai@apexprocure.com?subject=Strategic Procurement Access" className={styles.requestBtn}>
                                        Request Access
                                    </Link>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.div>
                
                <p className="mt-8 text-neutral-400 text-xs font-semibold tracking-widest uppercase opacity-60">
                    © {currentYear || "2026"} APEX PROCURE • AI NEURAL SECURITY ENFORCED
                </p>
            </div>

            <div className={styles.tickerContainer}>
                <div className={styles.tickerTrack}>
                    {[...AI_PROCUREMENT_EVENTS, ...AI_PROCUREMENT_EVENTS].map((event, i) => (
                        <div key={i} className={styles.tickerItem}>
                            <div className={styles.tickerDot} />
                            {event}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

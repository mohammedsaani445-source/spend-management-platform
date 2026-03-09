"use client";

import { useState, useEffect } from "react";
import { signInWithPopup, GoogleAuthProvider, signInWithEmailAndPassword, sendPasswordResetEmail } from "firebase/auth";
import { auth, db, DB_PREFIX } from "@/lib/firebase";
import { ref, get } from "firebase/database";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Logo } from "@/components/common/Logo";
import {
    ArrowRight, Mail, Lock, Eye, EyeOff,
    AlertCircle, CheckCircle2, Loader2, ChevronLeft
} from "lucide-react";
import * as OTPAuth from "otpauth";
import styles from "./Login.module.css";

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
    const [isCapsLockOn, setIsCapsLockOn] = useState(false);

    const handleEmailContinue = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        if (isEmailStep) {
            if (!email) { setError("Please enter your work email"); return; }
            setIsEmailStep(false);
            return;
        }

        setIsVerifying(true);
        try {
            const result = await signInWithEmailAndPassword(auth, email, password);
            await check2FA(result.user.uid, result.user.email || "");
        } catch (err: any) {
            console.error("Login Error:", err);
            if (err.code === "auth/invalid-credential") {
                setError("Invalid password. Please try again.");
            } else {
                setError("Authentication failed. Please check your credentials.");
            }
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
            console.error("Google Login Error:", err);
            setError("Google sign-in failed. Please try again.");
            setIsVerifying(false);
        }
    };

    const handleForgotPassword = async () => {
        if (!email) {
            setError("Please enter your email to receive a reset link.");
            return;
        }
        setIsSendingReset(true);
        setError("");
        try {
            await sendPasswordResetEmail(auth, email);
            setResetSent(true);
            setIsSendingReset(false);
        } catch (err: any) {
            setError("Failed to send reset email.");
            setIsSendingReset(false);
        }
    };

    const check2FA = async (uid: string, email: string) => {
        try {
            const mappingRef = ref(db, `${DB_PREFIX}/userTenants/${uid}`);
            const mappingSnap = await get(mappingRef);

            if (!mappingSnap.exists()) {
                await auth.signOut();
                setError("No workspace found for this account.");
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
                    setError("Account disabled. Contact your administrator.");
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
            else { setError("Invalid 2FA code."); setIsVerifying(false); }
        } catch {
            setError("Verification error."); setIsVerifying(false);
        }
    };

    return (
        <div className={styles.wrapper}>
            {/* --- LEFT PANEL --- */}
            <div className={styles.brandPanel}>
                <Image
                    src="/auth-crystal.png"
                    alt="Authenticating..."
                    fill
                    className={styles.brandVisual}
                    priority
                />
                <div className={styles.brandContent}>
                    <Logo size={48} variant="white" />
                    <h1 className={styles.brandHeading}>
                        Empowering <br />
                        The Proactive <br />
                        Finance Leader.
                    </h1>
                    <p className={styles.brandText}>
                        Join 1,200+ companies using Apex Procure to centralize spend,
                        automate AP, and gain total financial visibility.
                    </p>
                </div>
                <div style={{ position: 'relative', zIndex: 10 }}>
                    <p style={{ color: '#919EAB', fontSize: '0.875rem' }}>
                        © {new Date().getFullYear()} Apex Procure Inc.
                    </p>
                </div>
            </div>

            {/* --- RIGHT PANEL --- */}
            <div className={styles.authPanel}>
                <div className={styles.authCard}>
                    {/* Mobile Logo */}
                    <div className={styles.logoArea} onClick={() => router.push("/")} style={{ cursor: 'pointer' }}>
                        <Logo size={32} />
                        <span>APEX PROCURE</span>
                    </div>

                    {show2FA ? (
                        <div style={{ animation: 'fadeIn 0.5s' }}>
                            <h2 className={styles.title}>Secure Login</h2>
                            <p className={styles.subtitle}>Enter your authenticator code to proceed.</p>

                            {error && (
                                <div style={{ background: '#FFE7D9', color: '#B72136', padding: '1rem', borderRadius: '12px', marginBottom: '1.5rem', display: 'flex', gap: '0.5rem', alignItems: 'center', fontSize: '0.875rem', fontWeight: 600 }}>
                                    <AlertCircle size={18} /> {error}
                                </div>
                            )}

                            <form onSubmit={handleVerify2FA}>
                                <div className={styles.inputGroup}>
                                    <label className={styles.label}>6-Digit Code</label>
                                    <input
                                        type="text"
                                        className={styles.input}
                                        placeholder="000000"
                                        value={twoFactorCode}
                                        onChange={e => setTwoFactorCode(e.target.value)}
                                        maxLength={6}
                                        autoFocus
                                    />
                                </div>
                                <button type="submit" className={styles.primaryBtn} disabled={isVerifying || twoFactorCode.length < 6}>
                                    {isVerifying ? <Loader2 className="animate-spin" /> : "Verify Identity"}
                                </button>
                                <button type="button" onClick={() => setShow2FA(false)} style={{ border: 'none', background: 'none', color: '#637381', fontWeight: 600, marginTop: '1.5rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <ChevronLeft size={16} /> Back to login
                                </button>
                            </form>
                        </div>
                    ) : (
                        <div>
                            <h2 className={styles.title}>Welcome back.</h2>
                            <p className={styles.subtitle}>
                                {isEmailStep ? "Enter your work email to get started." : `Continue as ${email}`}
                            </p>

                            <button className={styles.googleBtn} onClick={handleGoogleLogin} disabled={isVerifying}>
                                <svg width="20" height="20" viewBox="0 0 24 24">
                                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.26.81-.58z" fill="#FBBC05" />
                                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                                </svg>
                                Continue with Google
                            </button>

                            <div style={{ display: 'flex', alignItems: 'center', margin: '2rem 0', gap: '1rem' }}>
                                <div style={{ flex: 1, height: '1px', background: '#F4F6F8' }} />
                                <span style={{ fontSize: '0.75rem', color: '#919EAB', fontWeight: 700, textTransform: 'uppercase' }}>or</span>
                                <div style={{ flex: 1, height: '1px', background: '#F4F6F8' }} />
                            </div>

                            {error && (
                                <div style={{ background: '#FFE7D9', color: '#B72136', padding: '1rem', borderRadius: '12px', marginBottom: '1.5rem', display: 'flex', gap: '0.5rem', alignItems: 'center', fontSize: '0.875rem', fontWeight: 600 }}>
                                    <AlertCircle size={18} /> {error}
                                </div>
                            )}

                            {resetSent && (
                                <div style={{ background: '#E1F5FE', color: '#0288D1', padding: '1rem', borderRadius: '12px', marginBottom: '1.5rem', display: 'flex', gap: '0.5rem', alignItems: 'center', fontSize: '0.875rem', fontWeight: 600 }}>
                                    <CheckCircle2 size={18} /> Reset email sent.
                                </div>
                            )}

                            <form onSubmit={handleEmailContinue}>
                                <div className={styles.inputGroup}>
                                    <label className={styles.label}>{isEmailStep ? "Work Email" : "Password"}</label>
                                    {isEmailStep ? (
                                        <div style={{ position: 'relative' }}>
                                            <input
                                                type="email"
                                                className={styles.input}
                                                placeholder="name@company.com"
                                                value={email}
                                                onChange={e => setEmail(e.target.value)}
                                                required
                                            />
                                            <Mail size={20} color="#919EAB" style={{ position: 'absolute', right: '1.25rem', top: '18px' }} />
                                        </div>
                                    ) : (
                                        <div style={{ position: 'relative' }}>
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
                                                style={{ position: 'absolute', right: '1.25rem', top: '18px', border: 'none', background: 'none', cursor: 'pointer', display: 'flex' }}
                                            >
                                                {showPassword ? <EyeOff size={20} color="#919EAB" /> : <Eye size={20} color="#919EAB" />}
                                            </button>
                                        </div>
                                    )}
                                </div>

                                <button type="submit" className={styles.primaryBtn} disabled={isVerifying}>
                                    {isVerifying ? <Loader2 className="animate-spin" /> : (isEmailStep ? "Continue" : "Sign In")}
                                </button>

                                {!isEmailStep && (
                                    <div style={{ marginTop: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <button type="button" onClick={() => setIsEmailStep(true)} style={{ border: 'none', background: 'none', color: '#E8572A', fontWeight: 700, cursor: 'pointer', fontSize: '0.875rem' }}>
                                            Change email
                                        </button>
                                        <button type="button" onClick={handleForgotPassword} style={{ border: 'none', background: 'none', color: '#637381', fontWeight: 600, cursor: 'pointer', fontSize: '0.875rem' }}>
                                            Forgot password?
                                        </button>
                                    </div>
                                )}
                            </form>

                            <div style={{ marginTop: '3rem', textAlign: 'center' }}>
                                <p style={{ fontSize: '0.9375rem', color: '#637381' }}>
                                    Don't have an account? <Link href="/signup" style={{ color: '#E8572A', fontWeight: 800 }}>Sign up for free</Link>
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

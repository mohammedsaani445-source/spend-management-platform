"use client";

import { useState } from "react";
import { signInWithPopup, GoogleAuthProvider, signInWithEmailAndPassword, sendPasswordResetEmail } from "firebase/auth";
import { auth, db, DB_PREFIX } from "@/lib/firebase";
import { ref, get } from "firebase/database";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Logo } from "@/components/common/Logo";
import * as OTPAuth from "otpauth";

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
            if (!email) { setError("Please enter your email"); return; }
            setIsEmailStep(false);
            return;
        }

        setIsVerifying(true);
        try {
            const result = await signInWithEmailAndPassword(auth, email, password);
            await check2FA(result.user.uid, result.user.email || "");
        } catch (err: any) {
            console.error("Login Error:", err);
            if (err.code === "auth/network-request-failed") {
                setError("Network error. Please check your internet connection or disable ad-blockers/VPNs and try again.");
            } else if (err.code === "auth/invalid-credential") {
                setError("Incorrect password or account not found. Please try again or use the 'Forgot Password' link below.");
            } else {
                setError("Invalid email or password");
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
            if (err.code === "auth/network-request-failed") {
                setError("Network error during Google login. Please check your connection or ad-blocker.");
            } else if (err.code === "auth/popup-blocked") {
                setError("Sign-in popup was blocked by your browser. Please allow pop-ups for this site and try again.");
            } else if (err.code === "auth/popup-closed-by-user") {
                setError("Sign-in popup was closed before completing. Please try again.");
            } else {
                setError("Google login failed: " + (err.message || ""));
            }
            setIsVerifying(false);
        }
    };

    const handleForgotPassword = async () => {
        if (!email) {
            setError("Please enter your email first to reset your password.");
            return;
        }

        setIsSendingReset(true);
        setError("");
        try {
            await sendPasswordResetEmail(auth, email);
            setResetSent(true);
            setIsSendingReset(false);
        } catch (err: any) {
            console.error("Reset Email Error:", err);
            if (err.code === "auth/network-request-failed") {
                setError("Network error sending reset email. Please ensure Firebase is not blocked by an ad-blocker or firewall.");
            } else {
                setError("Failed to send reset email. Please ensure the email is correct.");
            }
            setIsSendingReset(false);
        }
    };

    const check2FA = async (uid: string, email: string) => {
        try {
            // First check if user belongs to a workspace
            const mappingRef = ref(db, `${DB_PREFIX}/userTenants/${uid}`);
            const mappingSnap = await get(mappingRef);

            if (!mappingSnap.exists()) {
                await auth.signOut();
                setError("No workspace found for this account. Please sign up first.");
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
                    setError("Your account has been disabled. Contact your administrator.");
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

            // If no 2FA required, proceed to dashboard
            router.push("/dashboard");
        } catch (err) {
            console.error("Login verification error:", err);
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
            else { setError("Invalid authentication code."); setIsVerifying(false); }
        } catch {
            setError("Verification error."); setIsVerifying(false);
        }
    };

    return (
        <div style={{ display: 'flex', minHeight: '100vh', fontFamily: "'Inter', -apple-system, sans-serif" }}>

            {/* ======= LEFT PANEL — Brand ======= */}
            <div style={{
                width: '42%',
                background: 'linear-gradient(145deg, #5C6AC4 0%, #303f9f 60%, #1a237e 100%)',
                display: 'flex',
                flexDirection: 'column',
                padding: '3rem',
                position: 'relative',
                overflow: 'hidden',
            }}>
                {/* Background decoration */}
                <div style={{
                    position: 'absolute', top: '-80px', right: '-80px',
                    width: '300px', height: '300px',
                    background: 'rgba(255,255,255,0.06)', borderRadius: '50%',
                }} />
                <div style={{
                    position: 'absolute', bottom: '-60px', left: '-60px',
                    width: '240px', height: '240px',
                    background: 'rgba(255,255,255,0.04)', borderRadius: '50%',
                }} />

                {/* Logo */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', zIndex: 1 }}>
                    <Logo size={48} variant="white" />
                    <span style={{ color: 'white', fontSize: '1.5rem', fontWeight: 800, letterSpacing: '-0.02em' }}>
                        Apex Procure
                    </span>
                </div>

                {/* Main copy */}
                <div style={{ marginTop: 'auto', marginBottom: 'auto', zIndex: 1, paddingTop: '3rem' }}>
                    <h1 style={{
                        color: 'white', fontSize: '2.25rem', fontWeight: 800,
                        lineHeight: 1.2, marginBottom: '1.25rem', letterSpacing: '-0.02em'
                    }}>
                        Spend Control,<br />Simplified with AI.
                    </h1>
                    <p style={{ color: 'rgba(255,255,255,0.78)', fontSize: '1rem', lineHeight: 1.6, marginBottom: '2.5rem', maxWidth: '340px' }}>
                        The all-in-one procurement platform that helps mid-market teams gain real-time spend visibility and control.
                    </p>

                    {/* Feature bullets */}
                    {[
                        { icon: '✓', text: 'Automated purchase order workflows' },
                        { icon: '✓', text: 'Real-time budget tracking & alerts' },
                        { icon: '✓', text: 'AI-powered spend insights' },
                        { icon: '✓', text: 'Seamless ERP integrations' },
                    ].map(f => (
                        <div key={f.text} style={{
                            display: 'flex', alignItems: 'center', gap: '0.75rem',
                            marginBottom: '0.75rem', color: 'rgba(255,255,255,0.88)'
                        }}>
                            <div style={{
                                width: '22px', height: '22px',
                                background: 'rgba(255,255,255,0.2)',
                                borderRadius: '50%', display: 'flex',
                                alignItems: 'center', justifyContent: 'center',
                                fontSize: '0.75rem', fontWeight: 700, color: 'white', flexShrink: 0
                            }}>{f.icon}</div>
                            <span style={{ fontSize: '0.9rem' }}>{f.text}</span>
                        </div>
                    ))}
                </div>

                {/* Customer quote */}
                <div style={{
                    background: 'rgba(255,255,255,0.1)', borderRadius: '12px',
                    padding: '1.25rem', zIndex: 1, borderLeft: '3px solid rgba(255,255,255,0.4)'
                }}>
                    <p style={{ color: 'rgba(255,255,255,0.9)', fontSize: '0.875rem', lineHeight: 1.6, marginBottom: '0.75rem', fontStyle: 'italic' }}>
                        "Apex Procure gave us 10x purchasing efficiency and complete visibility into our spend."
                    </p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div style={{
                            width: '32px', height: '32px', borderRadius: '50%',
                            background: 'rgba(255,255,255,0.3)', display: 'flex',
                            alignItems: 'center', justifyContent: 'center',
                            color: 'white', fontWeight: 700, fontSize: '0.8rem'
                        }}>JM</div>
                        <div>
                            <div style={{ color: 'white', fontSize: '0.8rem', fontWeight: 700 }}>Jordan Mitchell</div>
                            <div style={{ color: 'rgba(255,255,255,0.65)', fontSize: '0.75rem' }}>VP Finance, TechCorp</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* ======= RIGHT PANEL — Login Form ======= */}
            <div style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: '#FFFFFF',
                padding: '2rem',
            }}>
                <div style={{ width: '100%', maxWidth: '400px' }}>

                    {/* 2FA VIEW */}
                    {show2FA ? (
                        <div style={{ textAlign: 'center' }}>
                            <div style={{
                                width: '60px', height: '60px', background: '#E8EAF6',
                                borderRadius: '14px', display: 'flex', alignItems: 'center',
                                justifyContent: 'center', margin: '0 auto 1.5rem', fontSize: '1.75rem'
                            }}>🔐</div>
                            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.5rem', color: '#212B36' }}>
                                Two-Factor Verification
                            </h2>
                            <p style={{ color: '#637381', marginBottom: '2rem', fontSize: '0.875rem', lineHeight: 1.5 }}>
                                Enter the 6-digit code from your Authenticator app to confirm your identity.
                            </p>
                            {error && (
                                <div style={{ background: '#FFE7D9', color: '#B72136', padding: '0.75rem 1rem', borderRadius: '8px', fontSize: '0.875rem', marginBottom: '1.25rem', fontWeight: 600 }}>
                                    {error}
                                </div>
                            )}
                            <form onSubmit={handleVerify2FA}>
                                <input
                                    type="text" placeholder="000 000" maxLength={6}
                                    value={twoFactorCode}
                                    onChange={e => setTwoFactorCode(e.target.value)}
                                    autoFocus required
                                    style={{
                                        textAlign: 'center', letterSpacing: '0.5rem',
                                        fontSize: '1.75rem', fontWeight: 700,
                                        border: '2px solid #DFE3E8', borderRadius: '12px',
                                        padding: '0.875rem', width: '100%',
                                        marginBottom: '1.25rem', outline: 'none', color: '#5C6AC4', fontFamily: 'inherit'
                                    }}
                                />
                                <button type="submit" disabled={isVerifying || twoFactorCode.length < 6} style={{
                                    width: '100%', height: '44px', borderRadius: '8px',
                                    border: 'none', background: '#5C6AC4', color: 'white',
                                    fontWeight: 700, fontSize: '0.9375rem', cursor: 'pointer',
                                    opacity: (isVerifying || twoFactorCode.length < 6) ? 0.6 : 1, fontFamily: 'inherit'
                                }}>
                                    {isVerifying ? "Verifying..." : "Verify & Sign In"}
                                </button>
                            </form>
                            <button onClick={() => setShow2FA(false)} style={{
                                marginTop: '1.25rem', background: 'none', border: 'none',
                                color: '#637381', fontSize: '0.875rem', cursor: 'pointer', fontFamily: 'inherit'
                            }}>
                                ← Back to login
                            </button>
                        </div>
                    ) : (
                        <>
                            {/* Header */}
                            <div style={{ marginBottom: '2rem' }}>
                                <h2 style={{ fontSize: '1.625rem', fontWeight: 700, color: '#212B36', marginBottom: '0.375rem', letterSpacing: '-0.02em' }}>
                                    {isEmailStep ? 'Welcome back' : `Hello, ${email.split('@')[0]}!`}
                                </h2>
                                <p style={{ color: '#637381', fontSize: '0.9375rem' }}>
                                    {isEmailStep ? 'Sign in to your Apex Procure account' : 'Enter your password to continue'}
                                </p>
                            </div>

                            {/* If showing password step, show the email above */}
                            {!isEmailStep && (
                                <div style={{
                                    display: 'flex', alignItems: 'center', gap: '0.75rem',
                                    padding: '0.75rem 1rem', background: '#F4F6F8',
                                    borderRadius: '8px', marginBottom: '1.25rem',
                                    border: '1px solid #DFE3E8'
                                }}>
                                    <div style={{
                                        width: '32px', height: '32px', background: '#E8EAF6',
                                        borderRadius: '50%', display: 'flex', alignItems: 'center',
                                        justifyContent: 'center', color: '#5C6AC4', fontWeight: 700, fontSize: '0.8rem'
                                    }}>
                                        {email[0].toUpperCase()}
                                    </div>
                                    <span style={{ fontSize: '0.875rem', color: '#212B36', fontWeight: 500 }}>{email}</span>
                                    <button onClick={() => setIsEmailStep(true)} style={{
                                        marginLeft: 'auto', background: 'none', border: 'none',
                                        color: '#5C6AC4', fontSize: '0.8125rem', cursor: 'pointer',
                                        fontWeight: 600, fontFamily: 'inherit'
                                    }}>Change</button>
                                </div>
                            )}

                            {/* Error */}
                            {error && (
                                <div style={{
                                    background: '#FFE7D9', color: '#B72136', padding: '0.75rem 1rem',
                                    borderRadius: '8px', fontSize: '0.875rem', marginBottom: '1.25rem', fontWeight: 600
                                }}>{error}</div>
                            )}

                            {resetSent && (
                                <div style={{
                                    background: '#E3F2FD', color: '#1976D2', padding: '0.75rem 1rem',
                                    borderRadius: '8px', fontSize: '0.875rem', marginBottom: '1.25rem', fontWeight: 600
                                }}>
                                    Password reset email sent! Please check your inbox.
                                </div>
                            )}

                            {/* Form */}
                            <form onSubmit={handleEmailContinue}>
                                <div style={{ marginBottom: '1.25rem' }}>
                                    <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: '#212B36', marginBottom: '0.4rem' }}>
                                        {isEmailStep ? 'Work email' : 'Password'}
                                    </label>
                                    {isEmailStep ? (
                                        <input
                                            type="email" placeholder="you@company.com"
                                            value={email} onChange={e => setEmail(e.target.value)}
                                            required autoFocus
                                            style={{
                                                width: '100%', height: '44px', padding: '0 1rem',
                                                border: '1px solid #DFE3E8', borderRadius: '8px',
                                                fontSize: '0.9375rem', color: '#212B36', background: 'white',
                                                outline: 'none', fontFamily: 'inherit',
                                                transition: 'border-color 0.15s'
                                            }}
                                            onFocus={e => e.target.style.borderColor = '#5C6AC4'}
                                            onBlur={e => e.target.style.borderColor = '#DFE3E8'}
                                        />
                                    ) : (
                                        <>
                                            <div style={{ position: 'relative' }}>
                                                <input
                                                    type={showPassword ? "text" : "password"}
                                                    placeholder="Enter your password"
                                                    value={password}
                                                    onChange={e => setPassword(e.target.value)}
                                                    onKeyDown={e => {
                                                        const capsOn = e.getModifierState('CapsLock');
                                                        setIsCapsLockOn(capsOn);
                                                    }}
                                                    required autoFocus
                                                    style={{
                                                        width: '100%', height: '44px', padding: '0 3rem 0 1rem',
                                                        border: '1px solid #DFE3E8', borderRadius: '8px',
                                                        fontSize: '0.9375rem', color: '#212B36', background: 'white',
                                                        outline: 'none', fontFamily: 'inherit'
                                                    }}
                                                    onFocus={e => e.target.style.borderColor = '#5C6AC4'}
                                                    onBlur={e => e.target.style.borderColor = '#DFE3E8'}
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setShowPassword(!showPassword)}
                                                    style={{
                                                        position: 'absolute', right: '12px', top: '50%',
                                                        transform: 'translateY(-50%)', background: 'none',
                                                        border: 'none', color: '#637381', cursor: 'pointer',
                                                        fontSize: '1.25rem', padding: '4px', display: 'flex'
                                                    }}
                                                >
                                                    {showPassword ? '👁️' : '👁️‍🗨️'}
                                                </button>
                                            </div>
                                            {isCapsLockOn && (
                                                <div style={{
                                                    fontSize: '0.75rem', color: '#F57C00', fontWeight: 600,
                                                    marginTop: '0.5rem', display: 'flex', alignItems: 'center', gap: '4px'
                                                }}>
                                                    ⚠️ Caps Lock is ON
                                                </div>
                                            )}
                                        </>
                                    )}
                                </div>

                                {!isEmailStep && (
                                    <div style={{ textAlign: 'right', marginBottom: '1.25rem', marginTop: '-0.75rem' }}>
                                        <button
                                            type="button"
                                            onClick={handleForgotPassword}
                                            disabled={isSendingReset}
                                            style={{
                                                background: 'none', border: 'none', padding: 0,
                                                fontSize: '0.8125rem', color: '#5C6AC4', fontWeight: 600,
                                                cursor: isSendingReset ? 'wait' : 'pointer'
                                            }}
                                        >
                                            {isSendingReset ? 'Sending...' : 'Forgot password?'}
                                        </button>
                                    </div>
                                )}

                                <button type="submit" disabled={isVerifying} style={{
                                    width: '100%', height: '44px', borderRadius: '8px',
                                    border: 'none', background: '#5C6AC4', color: 'white',
                                    fontWeight: 700, fontSize: '0.9375rem', cursor: 'pointer',
                                    marginBottom: '1.25rem', fontFamily: 'inherit',
                                    opacity: isVerifying ? 0.7 : 1,
                                    transition: 'background 0.15s'
                                }}
                                    onMouseEnter={e => !isVerifying && ((e.target as HTMLElement).style.background = '#303f9f')}
                                    onMouseLeave={e => ((e.target as HTMLElement).style.background = '#5C6AC4')}
                                >
                                    {isVerifying ? 'Signing in...' : (isEmailStep ? 'Continue' : 'Sign In')}
                                </button>
                            </form>

                            {/* Divider */}
                            <div style={{ display: 'flex', alignItems: 'center', margin: '0 0 1.25rem', gap: '1rem' }}>
                                <div style={{ flex: 1, height: '1px', background: '#DFE3E8' }} />
                                <span style={{ fontSize: '0.8125rem', color: '#919EAB', fontWeight: 500 }}>or</span>
                                <div style={{ flex: 1, height: '1px', background: '#DFE3E8' }} />
                            </div>

                            {/* SSO Buttons */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                <button onClick={handleGoogleLogin} disabled={isVerifying} style={{
                                    width: '100%', height: '44px', borderRadius: '8px',
                                    border: '1px solid #DFE3E8', background: 'white',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    gap: '0.625rem', fontWeight: 600, fontSize: '0.9rem',
                                    color: '#212B36', cursor: 'pointer', fontFamily: 'inherit',
                                    transition: 'background 0.15s'
                                }}
                                    onMouseEnter={e => (e.currentTarget.style.background = '#F4F6F8')}
                                    onMouseLeave={e => (e.currentTarget.style.background = 'white')}
                                >
                                    <svg style={{ width: '18px', height: '18px', flexShrink: 0 }} viewBox="0 0 24 24">
                                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.26.81-.58z" fill="#FBBC05" />
                                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                                    </svg>
                                    Continue with Google
                                </button>

                                <button disabled style={{
                                    width: '100%', height: '44px', borderRadius: '8px',
                                    border: '1px solid #DFE3E8', background: 'white',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    gap: '0.625rem', fontWeight: 600, fontSize: '0.9rem',
                                    color: '#919EAB', cursor: 'not-allowed', fontFamily: 'inherit'
                                }}>
                                    🔑 Single Sign-On (SSO)
                                </button>
                            </div>

                            {/* Footer links */}
                            <div style={{ marginTop: '2rem', textAlign: 'center' }}>
                                <p style={{ fontSize: '0.875rem', color: '#637381' }}>
                                    Don't have an account?{' '}
                                    <Link href="/signup" style={{ color: '#5C6AC4', fontWeight: 700 }}>
                                        Sign up
                                    </Link>
                                </p>

                            </div>
                        </>
                    )}

                    {/* Legal */}
                    <p style={{ marginTop: '2.5rem', textAlign: 'center', fontSize: '0.75rem', color: '#919EAB', lineHeight: 1.5 }}>
                        By signing in, you agree to Apex Procure's{' '}
                        <a href="#" style={{ color: '#5C6AC4' }}>Terms of Service</a> and{' '}
                        <a href="#" style={{ color: '#5C6AC4' }}>Privacy Policy</a>.
                    </p>
                </div>
            </div>
        </div>
    );
}

"use client";

import { useState, useRef, useEffect } from "react";
import { signInWithPopup, GoogleAuthProvider, createUserWithEmailAndPassword, updateProfile, signInWithEmailAndPassword } from "firebase/auth";
import { auth, db, DB_PREFIX } from "@/lib/firebase";
import { ref, set, push, get } from "firebase/database";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
    Building2, User, Lock, Mail, ChevronLeft,
    Search, Check, ChevronDown, Loader2, Globe, ArrowRight
} from "lucide-react";
import { Logo } from "@/components/common/Logo";
import styles from "./Signup.module.css";

const CURRENCIES = [
    { code: "USD", symbol: "$", name: "United States Dollar" },
    { code: "EUR", symbol: "€", name: "Euro" },
    { code: "GBP", symbol: "£", name: "British Pound Sterling" },
    { code: "CAD", symbol: "$", name: "Canadian Dollar" },
    { code: "AUD", symbol: "$", name: "Australian Dollar" },
    { code: "INR", symbol: "₹", name: "Indian Rupee" },
    { code: "AED", symbol: "د.إ", name: "United Arab Emirates Dirham" },
    { code: "SGD", symbol: "$", name: "Singapore Dollar" },
    { code: "JPY", symbol: "¥", name: "Japanese Yen" },
    // Simplified for the premium UI demo
];

export default function SignupPage() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [fullName, setFullName] = useState("");
    const [companyName, setCompanyName] = useState("");
    const [currency, setCurrency] = useState("USD");
    const [isEmailStep, setIsEmailStep] = useState(true);
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [currencySearchQuery, setCurrencySearchQuery] = useState("");
    const [isCurrencyDropdownOpen, setIsCurrencyDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsCurrencyDropdownOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const filteredCurrencies = CURRENCIES.filter(c =>
        c.code.toLowerCase().includes(currencySearchQuery.toLowerCase()) ||
        c.name.toLowerCase().includes(currencySearchQuery.toLowerCase())
    );
    const selectedCurrencyObj = CURRENCIES.find(c => c.code === currency) || CURRENCIES[0];

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        if (isEmailStep) {
            if (!email) { setError("Please enter your work email"); return; }
            setIsEmailStep(false);
            return;
        }
        setIsLoading(true);
        try {
            let userAuthResult;
            try {
                userAuthResult = await createUserWithEmailAndPassword(auth, email, password);
            } catch (authErr: any) {
                if (authErr.code === "auth/email-already-in-use") {
                    setError("This email is already in use. Please log in.");
                    setIsLoading(false);
                    return;
                }
                throw authErr;
            }
            await updateProfile(userAuthResult.user, { displayName: fullName });
            const tenantsRef = ref(db, `${DB_PREFIX}/tenants`);
            const newTenantRef = push(tenantsRef);
            const tenantId = newTenantRef.key;
            if (!tenantId) throw new Error("Could not generate workspace ID");
            await set(newTenantRef, { name: companyName, currency: currency, createdAt: Date.now() });
            await set(ref(db, `${DB_PREFIX}/tenants/${tenantId}/users/${userAuthResult.user.uid}`), {
                email: userAuthResult.user.email,
                displayName: fullName,
                role: 'SUPERUSER',
                createdAt: Date.now(),
                isActive: true
            });
            await set(ref(db, `${DB_PREFIX}/userTenants/${userAuthResult.user.uid}`), { tenantId: tenantId });
            router.push("/dashboard");
        } catch (err: any) {
            setError(err.message || "Failed to create organization");
            setIsLoading(false);
        }
    };

    const handleGoogleSignup = async () => {
        setIsLoading(true);
        try {
            const provider = new GoogleAuthProvider();
            provider.setCustomParameters({ prompt: 'select_account' });
            const result = await signInWithPopup(auth, provider);
            const initialCompanyName = `${result.user.displayName || 'My'} Workspace`;
            const tenantsRef = ref(db, `${DB_PREFIX}/tenants`);
            const newTenantRef = push(tenantsRef);
            const tenantId = newTenantRef.key;
            if (!tenantId) throw new Error("Could not generate workspace ID");
            await set(newTenantRef, { name: initialCompanyName, currency: 'USD', createdAt: Date.now() });
            await set(ref(db, `${DB_PREFIX}/tenants/${tenantId}/users/${result.user.uid}`), {
                email: result.user.email,
                displayName: result.user.displayName || 'User',
                role: 'SUPERUSER',
                createdAt: Date.now(),
                isActive: true
            });
            await set(ref(db, `${DB_PREFIX}/userTenants/${result.user.uid}`), { tenantId: tenantId });
            router.push("/dashboard");
        } catch (err: any) {
            setError("Google signup failed.");
            setIsLoading(false);
        }
    };

    return (
        <div className={styles.wrapper}>
            {/* --- LEFT PANEL --- */}
            <div className={styles.brandPanel}>
                <Image
                    src="/auth-crystal.png"
                    alt="Start your journey"
                    fill
                    className={styles.brandVisual}
                    priority
                />
                <div className={styles.brandContent}>
                    <Logo size={48} variant="white" />
                    <h1 className={styles.brandHeading}>
                        The Future <br />
                        Of Enterprise <br />
                        Procurement.
                    </h1>
                    <p className={styles.brandText}>
                        Take control of your company's financial destiny today.
                        Set up your workspace in less than 2 minutes.
                    </p>
                </div>
                <div style={{ position: 'relative', zIndex: 10 }}>
                    <p style={{ color: '#919EAB', fontSize: '0.875rem' }}>
                        Trusted by industry-leading finance teams worldwide.
                    </p>
                </div>
            </div>

            {/* --- RIGHT PANEL --- */}
            <div className={styles.authPanel}>
                <div className={styles.authCard}>
                    <div className={styles.logoArea} style={{ marginBottom: '2rem' }}>
                        <Logo size={32} />
                        <span style={{ fontWeight: 850, fontSize: '1.25rem' }}>APEX PROCURE</span>
                    </div>

                    <h2 className={styles.title}>Create your workspace.</h2>
                    <p className={styles.subtitle}>
                        {isEmailStep ? "Join the high-performing teams using Apex." : `Welcome, ${email}! Let's set up your team.`}
                    </p>

                    {error && (
                        <div style={{ background: '#FFE7D9', color: '#B72136', padding: '1rem', borderRadius: '12px', marginBottom: '1.5rem', display: 'flex', gap: '0.5rem', alignItems: 'center', fontSize: '0.875rem', fontWeight: 600 }}>
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSignup}>
                        {isEmailStep ? (
                            <>
                                <button className={styles.googleBtn} type="button" onClick={handleGoogleSignup} disabled={isLoading}>
                                    <svg width="20" height="20" viewBox="0 0 24 24">
                                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.26.81-.58z" fill="#FBBC05" />
                                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                                    </svg>
                                    Sign up with Google
                                </button>
                                <div style={{ display: 'flex', alignItems: 'center', margin: '1.5rem 0', gap: '1rem' }}>
                                    <div style={{ flex: 1, height: '1px', background: '#F4F6F8' }} />
                                    <span style={{ fontSize: '0.75rem', color: '#919EAB', fontWeight: 700 }}>OR EMAIL</span>
                                    <div style={{ flex: 1, height: '1px', background: '#F4F6F8' }} />
                                </div>
                                <div className={styles.inputGroup}>
                                    <label className={styles.label}>Work Email</label>
                                    <div style={{ position: 'relative' }}>
                                        <input type="email" className={styles.input} placeholder="name@company.com" value={email} onChange={e => setEmail(e.target.value)} required />
                                        <Mail size={18} color="#919EAB" style={{ position: 'absolute', right: '1rem', top: '16px' }} />
                                    </div>
                                </div>
                            </>
                        ) : (
                            <div style={{ animation: 'fadeIn 0.5s' }}>
                                <div className={styles.inputGroup}>
                                    <label className={styles.label}>Company Details</label>
                                    <div style={{ position: 'relative', marginBottom: '1rem' }}>
                                        <input type="text" className={styles.input} placeholder="Company Name" value={companyName} onChange={e => setCompanyName(e.target.value)} required autoFocus />
                                        <Building2 size={18} color="#919EAB" style={{ position: 'absolute', right: '1rem', top: '16px' }} />
                                    </div>

                                    {/* Premium Currency Selector */}
                                    <div ref={dropdownRef} style={{ position: 'relative' }}>
                                        <div className={styles.select} onClick={() => setIsCurrencyDropdownOpen(!isCurrencyDropdownOpen)}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                                <Globe size={18} color="#919EAB" />
                                                <span style={{ fontWeight: 600 }}>{selectedCurrencyObj.name} ({selectedCurrencyObj.code})</span>
                                            </div>
                                            <ChevronDown size={18} color="#919EAB" />
                                        </div>
                                        {isCurrencyDropdownOpen && (
                                            <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: 'white', border: '2px solid #F4F6F8', borderRadius: '12px', marginTop: '8px', zIndex: 100, boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }}>
                                                <div style={{ padding: '8px', borderBottom: '1px solid #F4F6F8' }}>
                                                    <div style={{ position: 'relative' }}>
                                                        <input type="text" className={styles.input} style={{ height: '40px' }} placeholder="Search..." value={currencySearchQuery} onChange={e => setCurrencySearchQuery(e.target.value)} />
                                                        <Search size={14} color="#919EAB" style={{ position: 'absolute', right: '12px', top: '12px' }} />
                                                    </div>
                                                </div>
                                                <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
                                                    {filteredCurrencies.map(c => (
                                                        <div key={c.code} onClick={() => { setCurrency(c.code); setIsCurrencyDropdownOpen(false); }} style={{ padding: '12px 16px', display: 'flex', justifyContent: 'space-between', cursor: 'pointer', background: currency === c.code ? '#F9FAFB' : 'transparent' }}>
                                                            <span style={{ fontWeight: 600 }}>{c.name}</span>
                                                            <span style={{ color: '#E8572A', fontWeight: 800 }}>{c.code}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className={styles.inputGroup}>
                                    <label className={styles.label}>Primary Administrator</label>
                                    <div style={{ position: 'relative', marginBottom: '1rem' }}>
                                        <input type="text" className={styles.input} placeholder="Full Name" value={fullName} onChange={e => setFullName(e.target.value)} required />
                                        <User size={18} color="#919EAB" style={{ position: 'absolute', right: '1rem', top: '16px' }} />
                                    </div>
                                    <div style={{ position: 'relative' }}>
                                        <input type="password" className={styles.input} placeholder="Secure Password" value={password} onChange={e => setPassword(e.target.value)} required minLength={8} />
                                        <Lock size={18} color="#919EAB" style={{ position: 'absolute', right: '1rem', top: '16px' }} />
                                    </div>
                                </div>
                            </div>
                        )}

                        <button type="submit" className={styles.primaryBtn} disabled={isLoading}>
                            {isLoading ? <Loader2 className="animate-spin" /> : (isEmailStep ? "Get Started" : "Create Workspace")}
                        </button>
                    </form>

                    <div style={{ marginTop: '2.5rem', textAlign: 'center' }}>
                        <p style={{ fontSize: '0.9375rem', color: '#637381' }}>
                            Already have an account? <Link href="/login" style={{ color: '#E8572A', fontWeight: 800 }}>Sign in</Link>
                        </p>
                    </div>

                    {!isEmailStep && (
                        <button onClick={() => setIsEmailStep(true)} style={{ border: 'none', background: 'none', color: '#637381', width: '100%', marginTop: '1.5rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', fontWeight: 600 }}>
                            <ChevronLeft size={16} /> Use a different email
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, CheckCircle2, User, Shield, Briefcase, Zap, ShieldCheck, ArrowRight, Lock, Key } from "lucide-react";
import { auth } from "@/lib/firebase";
import { signInWithPopup, GoogleAuthProvider, createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { toast } from "sonner";
import { Invite } from "@/types";
import { ROLE_CONFIGS } from "@/lib/roles_config";
import { Logo } from "@/components/common/Logo";

export default function ActivatePage() {
    const router = useRouter();
    const [step, setStep] = useState(1);
    const [invite, setInvite] = useState<Invite & { token: string } | null>(null);
    const [loading, setLoading] = useState(true);
    const [finishing, setFinishing] = useState(false);
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

    useEffect(() => {
        const stored = sessionStorage.getItem("apex_pending_invite");
        if (!stored) {
            router.push("/login");
            return;
        }
        setInvite(JSON.parse(stored));
        setLoading(false);
    }, [router]);

    const handleGoogleActivate = async () => {
        setFinishing(true);
        setError("");
        try {
            const provider = new GoogleAuthProvider();
            const result = await signInWithPopup(auth, provider);
            
            await finalizeActivation(result.user.uid, result.user.email || "", result.user.displayName || invite?.invited_name || "");
        } catch (err: any) {
            console.error("Auth error:", err);
            setError(err.message);
            setFinishing(false);
        }
    };

    const handlePasswordActivate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!password || password.length < 8) {
            setError("Password must be at least 8 characters");
            return;
        }

        setFinishing(true);
        setError("");
        try {
            // Check if user already exists with this email
            const email = invite?.invited_email;
            if (!email) {
                setError("Email address is required for password setup. Please use Google Login.");
                setFinishing(false);
                return;
            }

            const result = await createUserWithEmailAndPassword(auth, email, password);
            await updateProfile(result.user, { displayName: invite?.invited_name });
            
            await finalizeActivation(result.user.uid, email, invite?.invited_name || "");
        } catch (err: any) {
            console.error("Signup error:", err);
            setError(err.message || "Credential provisioning failed");
            setFinishing(false);
        }
    };

    const finalizeActivation = async (uid: string, email: string, displayName: string) => {
        try {
            const res = await fetch("/api/v1/invites/complete", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    uid,
                    email,
                    displayName,
                    token: invite?.token
                })
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Failed to finalize account");

            setStep(3); // Success step
            toast.success("Account Activation Successful");
            
            // Clear invite from session
            sessionStorage.removeItem("apex_pending_invite");

            // Redirect after delay
            setTimeout(() => {
                router.push("/dashboard");
            }, 3000);

        } catch (err: any) {
            console.error("Finalization error:", err);
            setError(err.message);
            setFinishing(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[var(--background)] flex items-center justify-center">
                <Loader2 className="animate-spin text-[var(--brand)] w-10 h-10" />
            </div>
        );
    }

    const roleConfig = invite ? ROLE_CONFIGS[invite.role] : null;

    return (
        <div className="min-h-screen bg-[var(--background)] text-[var(--text-primary)] py-8 px-4 md:px-8 flex flex-col items-center justify-center font-sans overflow-y-auto">
            <div className="max-w-[1280px] w-full grid grid-cols-1 lg:grid-cols-[0.7fr_1.3fr] gap-0 items-stretch relative z-10 transition-all duration-700 bg-white border border-[var(--border)] rounded-md shadow-2xl overflow-hidden min-h-[650px]">
                
                {/* Visual / Info Side - SHARP ENTERPRISE */}
                <div className="hidden lg:flex flex-col justify-between bg-[#F9FAFB] border-r border-[var(--border)] p-10 md:p-14 animate-in fade-in slide-in-from-left-10 duration-700">
                    <div className="space-y-10">
                        <div className="mb-14">
                            <Logo size={56} variant="brand" className="hover:opacity-80 transition-opacity cursor-pointer" />
                        </div>
                        <div className="space-y-8">
                            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-sm bg-[var(--brand)] text-white text-[9px] uppercase font-bold tracking-[0.2em] shadow-sm">
                                <ShieldCheck size={12} /> SECURE PROTOCOL v4.0
                            </div>
                            <h1 className="text-6xl font-black text-[var(--text-primary)] uppercase tracking-tighter leading-[0.85]">
                                Account <br /> <span className="text-[var(--brand)]">Provision.</span>
                            </h1>
                            <p className="text-[var(--text-secondary)] font-medium text-lg max-w-md mt-6 leading-relaxed opacity-80 border-l-2 border-[var(--brand)]/20 pl-6">
                                Initializing your administrative footprint and role-based permissions within the <span className="text-[var(--text-primary)] font-bold italic">Apex Procure</span> core enterprise cluster.
                            </p>
                        </div>
                    </div>

                    <div className="space-y-8 pt-10 border-t border-[var(--border)]">
                         <div className="flex items-center gap-6 group">
                             <div className="w-12 h-12 rounded-sm bg-white border border-[var(--border)] flex items-center justify-center text-[var(--text-disabled)] group-hover:text-[var(--brand)] group-hover:border-[var(--brand)] transition-all duration-300 shadow-sm">
                                 <Lock size={20} />
                             </div>
                             <div>
                                 <h4 className="text-[9px] font-black uppercase tracking-[0.15em] text-[var(--text-primary)] mb-0.5">End-to-End Encryption</h4>
                                 <p className="text-[11px] text-[var(--text-secondary)] font-medium">All data is encrypted in transit and at rest.</p>
                             </div>
                         </div>
                    </div>
                </div>

                {/* Interaction Side - FORM WINDOW */}
                <div className="bg-white p-8 md:p-12 lg:p-16 relative flex flex-col justify-center min-h-[600px]">
                    {step === 1 && (
                        <div className="animate-in fade-in slide-in-from-right-10 duration-500 w-full max-w-xl mx-auto lg:mx-0">
                            <div className="flex items-center gap-3 mb-10">
                                <span className="text-[9px] font-bold px-2.5 py-1 bg-[#111827] text-white rounded-sm uppercase tracking-widest">GATE_01 // IDENTITY</span>
                                <div className="h-[1px] flex-1 bg-[var(--border)]"></div>
                            </div>
                            
                            <h2 className="text-4xl md:text-5xl font-black text-[var(--text-primary)] uppercase tracking-tighter mb-8 leading-[0.9]">Identity <br />Verification</h2>
                            
                            {/* Identity Card: Sharp & Compact */}
                            <div className="space-y-4 mb-10">
                                <div className="p-6 md:p-8 bg-[#F9FAFB] border border-[var(--border)] rounded-sm group transition-all duration-300 relative overflow-hidden">
                                    <label className="text-[8px] font-black text-[var(--text-disabled)] uppercase tracking-[0.3em] mb-6 block font-mono">/ TARGET_REGISTRY_LOOKUP</label>
                                    <div className="flex items-center gap-6">
                                        <div className="w-16 h-16 rounded-sm bg-[var(--brand)] flex items-center justify-center text-white shadow-lg shadow-[var(--brand)]/15 shrink-0">
                                            <User size={30} />
                                        </div>
                                        <div className="min-w-0">
                                            <div className="text-3xl font-black text-[var(--text-primary)] uppercase tracking-tight leading-none mb-2 truncate">{invite?.invited_name}</div>
                                            <div className="text-[9px] text-[var(--brand)] font-bold uppercase tracking-[0.2em] flex items-center gap-2">
                                                <div className="w-1.5 h-1.5 bg-[var(--brand)] rounded-full animate-pulse"></div> Authenticated Identity
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div className="p-4 bg-white border border-[var(--border)] rounded-sm hover:border-[var(--brand)]/20 transition-all">
                                        <label className="text-[7px] font-bold text-[var(--text-disabled)] uppercase tracking-[0.2em] mb-1.5 block">Department</label>
                                        <div className="flex items-center gap-2 font-bold text-[var(--text-primary)] uppercase text-[10px] tracking-wide truncate">
                                            <Briefcase size={12} className="text-[var(--text-disabled)] shrink-0" /> {invite?.department}
                                        </div>
                                    </div>
                                    <div className="p-4 bg-white border border-[var(--border)] rounded-sm hover:border-[var(--brand)]/20 transition-all">
                                        <label className="text-[7px] font-bold text-[var(--text-disabled)] uppercase tracking-[0.2em] mb-1.5 block">Access Level</label>
                                        <div className="flex items-center gap-2 font-bold text-[var(--brand)] uppercase text-[10px] tracking-wide truncate">
                                            <Shield size={12} className="text-[var(--brand)]/40 shrink-0" /> {roleConfig?.label}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <button 
                                onClick={() => setStep(2)}
                                className="w-full bg-[#111827] text-white py-5 rounded-sm font-bold uppercase tracking-[0.25em] text-[10px] hover:bg-[var(--brand)] transition-all duration-300 shadow-lg flex items-center justify-center gap-4 group active:scale-[0.98]"
                            >
                                PROCEED TO AUTHENTICATION <ArrowRight size={16} className="group-hover:translate-x-1.5 transition-transform" />
                            </button>
                        </div>
                    )}

                    {step === 2 && (
                        <div className="animate-in fade-in slide-in-from-right-10 duration-500 w-full max-w-xl mx-auto lg:mx-0">
                             <button onClick={() => setStep(1)} className="text-[8px] font-bold text-[var(--text-disabled)] uppercase hover:text-[var(--brand)] mb-8 transition-colors tracking-[0.2em] flex items-center gap-2">
                                <ArrowRight size={12} className="rotate-180" /> BACK TO IDENTITY
                             </button>
                             <div className="flex items-center gap-3 mb-8">
                                <span className="text-[9px] font-bold px-2.5 py-1 bg-[var(--brand)] text-white rounded-sm uppercase tracking-widest">GATE_02 // BINDING</span>
                                <div className="h-[1px] flex-1 bg-[var(--border)] opacity-30"></div>
                             </div>
                             
                             <h2 className="text-4xl font-black text-[var(--text-primary)] uppercase tracking-tight mb-3 leading-tight">Account Binding</h2>
                             <p className="text-[var(--text-secondary)] text-[13px] mb-10 leading-relaxed font-medium max-w-md opacity-80">
                                Connect your corporate credentials to sync with the <span className="text-[var(--text-primary)]">Apex Procure Security Cluster.</span>
                             </p>

                             {error && (
                                <div className="p-4 bg-red-50 border border-red-200 rounded-sm text-red-600 text-[10px] font-bold mb-8 flex items-center gap-3 animate-in shake">
                                    <Shield size={16} /> {error}
                                </div>
                             )}

                             <div className="space-y-4">
                                <button 
                                    onClick={handleGoogleActivate}
                                    disabled={finishing}
                                    className="w-full bg-white border border-[var(--border)] text-[var(--text-primary)] py-4 rounded-sm font-bold text-[10px] uppercase tracking-[0.15em] flex items-center justify-center gap-3 hover:border-black transition-all hover:shadow-sm disabled:opacity-50"
                                >
                                    <svg width="16" height="16" viewBox="0 0 24 24" className="mr-0.5">
                                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.26.81-.58z" fill="#FBBC05" />
                                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                                    </svg>
                                    Verify Internal Google Identity
                                </button>

                                <div className="flex items-center gap-4 py-4">
                                    <div className="h-[1px] flex-1 bg-[var(--border)] opacity-40"></div>
                                    <span className="text-[8px] font-bold text-[var(--text-disabled)] uppercase tracking-[0.4em]">OR</span>
                                    <div className="h-[1px] flex-1 bg-[var(--border)] opacity-40"></div>
                                </div>

                                <form onSubmit={handlePasswordActivate} className="space-y-4">
                                    <div className="space-y-3">
                                        <div className="relative group">
                                            <input 
                                                type="password" 
                                                placeholder="NEW CLUSTER PASSWORD"
                                                value={password}
                                                onChange={e => setPassword(e.target.value)}
                                                className="w-full bg-[#F9FAFB] border border-[var(--border)] rounded-sm py-4 px-5 text-[var(--text-primary)] placeholder:text-[var(--text-disabled)] outline-none focus:border-black transition-all font-mono text-[13px] tracking-wider"
                                            />
                                            <div className="absolute inset-y-0 right-5 flex items-center text-[var(--text-disabled)] group-focus-within:text-black transition-colors pointer-events-none">
                                                <Key size={18} />
                                            </div>
                                        </div>
                                        <p className="text-[8px] text-[var(--text-disabled)] font-bold uppercase tracking-[0.1em] font-mono leading-relaxed">System Requirement: 14+ Chars / Alpha-Numeric / Secure Vault Storage</p>
                                    </div>

                                    <button 
                                        type="submit"
                                        disabled={finishing || !password}
                                        className="w-full bg-[#111827] text-white py-5 rounded-sm font-bold uppercase tracking-[0.25em] text-[10px] hover:bg-[var(--brand)] transition-all shadow-lg disabled:opacity-50 flex items-center justify-center gap-3 active:scale-[0.98]"
                                    >
                                        {finishing ? <Loader2 className="animate-spin" size={16} /> : <>Finalize Provisioning <ArrowRight size={14} /></>}
                                    </button>
                                </form>
                             </div>
                        </div>
                    )}

                    {step === 3 && (
                        <div className="text-center animate-in zoom-in-110 duration-1000 max-w-sm mx-auto">
                             <div className="w-20 h-20 bg-green-50 border border-green-200 flex items-center justify-center mx-auto mb-8 rounded-sm">
                                <CheckCircle2 size={40} className="text-green-500" />
                             </div>
                             
                             <h2 className="text-4xl font-black text-[var(--text-primary)] uppercase tracking-tighter mb-4 leading-none">Authentication <br />Synchronized</h2>
                             <p className="text-[var(--text-secondary)] text-[13px] font-medium mb-12 leading-relaxed opacity-70">
                                Handshake verified. Your administrative node has been initialized. Redirecting to workspace...
                             </p>

                             <div className="w-full h-1.5 bg-[var(--border)] opacity-30 rounded-full overflow-hidden mb-5">
                                <div className="h-full bg-[var(--brand)] animate-[progress_3s_linear_forwards]"></div>
                             </div>
                             <div className="text-[9px] font-bold text-[var(--brand)] uppercase tracking-[0.3em] font-mono italic">SYNCING_METRICS_CLUSTER</div>
                        </div>
                    )}
                </div>
            </div>

            <style jsx global>{`
                @keyframes progress {
                    from { width: 0%; }
                    to { width: 100%; }
                }
                @keyframes shake {
                    0%, 100% { transform: translateX(0); }
                    10%, 30%, 50%, 70%, 90% { transform: translateX(-4px); }
                    20%, 40%, 60%, 80% { transform: translateX(4px); }
                }
                .shake { animation: shake 0.5s ease-in-out; }
            `}</style>
        </div>
    );

}

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
        <div className="min-h-screen bg-[var(--background)] text-[var(--text-primary)] py-12 px-4 md:px-8 flex flex-col items-center justify-start font-sans overflow-y-auto">
            <div className="max-w-[1440px] w-full grid grid-cols-1 lg:grid-cols-[0.8fr_1.4fr] gap-12 lg:gap-20 items-stretch relative z-10 transition-all duration-700 my-auto">
                {/* Visual Side */}
                <div className="hidden lg:flex flex-col justify-between bg-[#F9FAFB] border border-[var(--border)] rounded-xl p-12 md:p-16 animate-in fade-in slide-in-from-left-10 duration-700">
                    <div className="space-y-12">
                        <div className="mb-20">
                            <Logo size={72} variant="brand" className="hover:scale-105 transition-transform cursor-pointer" />
                        </div>
                        <div className="space-y-10">
                            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md bg-[var(--brand-soft)] border border-[var(--brand)]/20 text-[var(--brand)] text-[10px] uppercase font-black tracking-[0.2em]">
                                <Zap size={14} /> Internal Protocol: 4022
                            </div>
                            <h1 className="text-8xl font-black text-[var(--text-primary)] uppercase tracking-tighter leading-[0.8]">
                                Account <br /> <span className="text-[var(--brand)]">Provision.</span>
                            </h1>
                            <p className="text-[var(--text-secondary)] font-medium text-2xl max-w-lg mt-10 leading-relaxed opacity-90 border-l-4 border-[var(--brand)]/30 pl-8">
                                Establishing secure administrative footprint for <span className="text-[var(--text-primary)] font-bold">{invite?.invited_name}</span>. 
                            </p>
                        </div>
                    </div>

                    <div className="space-y-10 pt-16 border-t border-[var(--border)]">
                         <div className="flex items-start gap-8 group">
                             <div className="w-14 h-14 rounded-lg bg-white border border-[var(--border)] flex items-center justify-center text-[var(--text-disabled)] group-hover:text-[var(--brand)] group-hover:border-[var(--brand)] transition-all duration-300 shadow-sm">
                                 <ShieldCheck size={28} />
                             </div>
                             <div>
                                 <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--text-primary)] mb-1">Standard Security</h4>
                                 <p className="text-[12px] text-[var(--text-secondary)] font-medium leading-relaxed">Enterprise-grade authentication required.</p>
                             </div>
                         </div>
                    </div>
                </div>

                {/* Form Side */}
                <div className="bg-white border border-[var(--border)] rounded-xl p-8 md:p-16 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.08)] relative animate-in zoom-in-95 duration-500 w-full min-h-[750px] flex flex-col justify-center overflow-visible">
                    {step === 1 && (
                        <div className="animate-in fade-in slide-in-from-right-10 duration-500">
                            <div className="flex items-center gap-4 mb-16">
                                <span className="text-[9px] font-black px-3 py-1.5 bg-[#111827] text-white rounded-md uppercase tracking-widest shadow-md">GATE_01</span>
                                <div className="h-[2px] flex-1 bg-[var(--border)] opacity-40"></div>
                            </div>
                            
                            <h2 className="text-5xl md:text-6xl font-black text-[var(--text-primary)] uppercase tracking-tighter mb-12 leading-[0.9]">Identity <br />Verification</h2>
                            
                            <div className="space-y-6 mb-16">
                                <div className="p-8 md:p-10 bg-[#F9FAFB] border border-[var(--border)] rounded-xl group transition-all duration-300 relative overflow-hidden">
                                    <label className="text-[9px] font-black text-[var(--text-disabled)] uppercase tracking-[0.3em] mb-8 block font-mono">/ authentication_target</label>
                                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-8">
                                        <div className="w-20 h-20 rounded-xl bg-[var(--brand)] flex items-center justify-center text-white shadow-xl shadow-[var(--brand)]/20 shrink-0">
                                            <User size={36} />
                                        </div>
                                        <div>
                                            <div className="text-4xl font-black text-[var(--text-primary)] uppercase tracking-tight leading-none mb-3 break-words">{invite?.invited_name}</div>
                                            <div className="text-[10px] text-[var(--brand)] font-black uppercase tracking-[0.2em] flex items-center gap-2">
                                                <div className="w-2.5 h-2.5 bg-[var(--brand)] rounded-full animate-pulse"></div> Identity Confirmed
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="p-6 bg-white border border-[var(--border)] rounded-lg hover:border-[var(--brand)]/30 transition-all group">
                                        <label className="text-[8px] font-black text-[var(--text-disabled)] uppercase tracking-[0.3em] mb-3 block">Assignment</label>
                                        <div className="flex items-center gap-3 font-black text-[var(--text-primary)] uppercase text-[11px] tracking-wider">
                                            <Briefcase size={16} className="text-[var(--text-disabled)]" /> {invite?.department}
                                        </div>
                                    </div>
                                    <div className="p-6 bg-white border border-[var(--border)] rounded-lg hover:border-[var(--brand)]/30 transition-all group">
                                        <label className="text-[8px] font-black text-[var(--text-disabled)] uppercase tracking-[0.3em] mb-3 block">Privilege</label>
                                        <div className="flex items-center gap-3 font-black text-[var(--brand)] uppercase text-[11px] tracking-wider">
                                            <Shield size={16} className="text-[var(--brand)]/40" /> {roleConfig?.label}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <button 
                                onClick={() => setStep(2)}
                                className="w-full bg-[#111827] text-white py-6 md:py-8 rounded-lg font-black uppercase tracking-[0.3em] text-[11px] hover:bg-[var(--brand)] transition-all duration-300 shadow-xl flex items-center justify-center gap-6 group"
                            >
                                Continue To Authentication <ArrowRight size={20} className="group-hover:translate-x-2 transition-transform" />
                            </button>
                        </div>
                    )}

                    {step === 2 && (
                        <div className="animate-in fade-in slide-in-from-right-10 duration-500">
                             <button onClick={() => setStep(1)} className="text-[9px] font-black text-[var(--text-disabled)] uppercase hover:text-[var(--brand)] mb-12 transition-colors tracking-widest flex items-center gap-2">
                                <ArrowRight size={14} className="rotate-180" /> Return to Step 01
                             </button>
                             <div className="flex items-center gap-3 mb-10">
                                <span className="text-[9px] font-black px-3 py-1.5 bg-[var(--brand)] text-white rounded-md uppercase tracking-widest">GATE_02</span>
                                <div className="h-[2px] flex-1 bg-[var(--border)] opacity-30"></div>
                             </div>
                             
                             <h2 className="text-4xl font-black text-[var(--text-primary)] uppercase tracking-tight mb-4">Account Binding</h2>
                             <p className="text-[var(--text-secondary)] text-sm mb-12 leading-relaxed font-medium max-w-lg">
                                Link your corporate identity to the Apex Procure security cluster to finalize your permissions.
                             </p>

                             {error && (
                                <div className="p-5 bg-red-50 border border-red-200 rounded-lg text-red-600 text-xs font-bold mb-10 flex items-center gap-3 animate-in shake">
                                    <Shield size={18} /> {error}
                                </div>
                             )}

                             <div className="space-y-6">
                                <button 
                                    onClick={handleGoogleActivate}
                                    disabled={finishing}
                                    className="w-full bg-white border-2 border-[var(--border)] text-[var(--text-primary)] py-5 rounded-lg font-black text-[11px] uppercase tracking-[0.2em] flex items-center justify-center gap-4 hover:border-black transition-all disabled:opacity-50"
                                >
                                    <svg width="20" height="20" viewBox="0 0 24 24" className="mr-1">
                                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.26.81-.58z" fill="#FBBC05" />
                                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                                    </svg>
                                    Verify Corporate Google Identity
                                </button>

                                <div className="flex items-center gap-4 py-8">
                                    <div className="h-[2px] flex-1 bg-[var(--border)] opacity-30"></div>
                                    <span className="text-[10px] font-black text-[var(--text-disabled)] uppercase tracking-[0.4em]">Alternative</span>
                                    <div className="h-[2px] flex-1 bg-[var(--border)] opacity-30"></div>
                                </div>

                                <form onSubmit={handlePasswordActivate} className="space-y-6">
                                    <div className="space-y-4">
                                        <div className="relative group">
                                            <input 
                                                type="password" 
                                                placeholder="SET SECURE PASSWORD"
                                                value={password}
                                                onChange={e => setPassword(e.target.value)}
                                                className="w-full bg-[#F9FAFB] border-2 border-[var(--border)] rounded-lg py-6 px-6 text-[var(--text-primary)] placeholder:text-[var(--text-disabled)] outline-none focus:border-black transition-all font-mono text-sm tracking-[0.2em]"
                                            />
                                            <div className="absolute inset-y-0 right-6 flex items-center text-[var(--text-disabled)] group-focus-within:text-black transition-colors pointer-events-none">
                                                <Lock size={20} />
                                            </div>
                                        </div>
                                        <p className="text-[9px] text-[var(--text-disabled)] font-black uppercase tracking-[0.2em] font-mono">Required: 14+ Chars / Alpha-Numeric / Standard Cluster Sync</p>
                                    </div>

                                    <button 
                                        type="submit"
                                        disabled={finishing || !password}
                                        className="w-full bg-[#111827] text-white py-6 rounded-lg font-black uppercase tracking-[0.3em] text-[11px] hover:bg-[var(--brand)] transition-all shadow-xl disabled:opacity-50 flex items-center justify-center gap-4"
                                    >
                                        {finishing ? <Loader2 className="animate-spin" /> : <>Finalize Provisioning <ArrowRight size={16} /></>}
                                    </button>
                                </form>
                             </div>
                        </div>
                    )}

                    {step === 3 && (
                        <div className="text-center animate-in zoom-in-110 duration-1000 max-w-lg mx-auto">
                             <div className="w-24 h-24 bg-green-50 border-2 border-green-200 flex items-center justify-center mx-auto mb-10 rounded-xl">
                                <CheckCircle2 size={48} className="text-green-500" />
                             </div>
                             
                             <h2 className="text-5xl font-black text-[var(--text-primary)] uppercase tracking-tighter mb-6 leading-none">Authentication <br />Synchronized</h2>
                             <p className="text-[var(--text-secondary)] text-sm font-medium mb-16 leading-relaxed opacity-80">
                                Identity handshake verified. Your administrative workspace has been initialized. Proceeding to system dashboard...
                             </p>

                             <div className="w-full h-2 bg-[var(--border)] opacity-30 rounded-full overflow-hidden mb-6">
                                <div className="h-full bg-[var(--brand)] animate-[progress_3s_linear_forwards]"></div>
                             </div>
                             <div className="text-[10px] font-black text-[var(--brand)] uppercase tracking-[0.4em] italic font-mono">HANDSHAKE_PROTOCOL_ACTIVE</div>
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

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
            <div className="max-w-5xl w-full grid grid-cols-1 lg:grid-cols-[1.1fr_1.5fr] gap-12 lg:gap-16 items-start lg:items-center relative z-10 transition-all duration-700 my-auto">
                {/* Visual Side */}
                <div className="hidden lg:block space-y-12 animate-in fade-in slide-in-from-left-10 duration-700">
                    <div className="space-y-8">
                        <div className="mb-12">
                            <Logo size={56} variant="brand" className="hover:scale-110 transition-transform cursor-pointer" />
                        </div>
                        <div className="space-y-6">
                            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[var(--brand-soft)] border border-[var(--brand)]/10 text-[var(--brand)] text-[10px] uppercase font-black tracking-widest">
                                <Zap size={14} /> Secure Access Protocol
                            </div>
                            <h1 className="text-7xl font-black text-[var(--text-primary)] uppercase tracking-tighter leading-[0.85]">
                                Welcome to <br /> <span className="text-[var(--brand)]">Apex Procure.</span>
                            </h1>
                            <p className="text-[var(--text-secondary)] font-medium text-xl max-w-md mt-8 leading-relaxed opacity-80">
                                Finalizing your secure administrative environment for <span className="text-[var(--text-primary)] font-bold">{invite?.invited_name}</span>. 
                                Identity records have been pre-provisioned for synchronization.
                            </p>
                        </div>
                    </div>

                    <div className="space-y-10 pt-10 border-t border-[var(--border)] max-w-sm">
                         <div className="flex items-start gap-6 group">
                             <div className="w-16 h-16 rounded-2xl bg-white border border-[var(--border)] flex items-center justify-center text-[var(--text-disabled)] group-hover:text-[var(--brand)] group-hover:border-[var(--brand)]/30 group-hover:shadow-[0_20px_40px_-15px_rgba(232,87,42,0.15)] transition-all duration-500">
                                 <ShieldCheck size={32} />
                             </div>
                             <div>
                                 <h4 className="text-xs font-black uppercase tracking-[0.2em] text-[var(--text-primary)] mb-1.5">Advanced RBAC</h4>
                                 <p className="text-[11px] text-[var(--text-secondary)] font-medium leading-relaxed">Your assigned role comes with pre-defined mission-critical permissions.</p>
                             </div>
                         </div>
                         <div className="flex items-start gap-6 group">
                             <div className="w-16 h-16 rounded-2xl bg-white border border-[var(--border)] flex items-center justify-center text-[var(--text-disabled)] group-hover:text-blue-500 group-hover:border-blue-500/30 group-hover:shadow-[0_20px_40px_-15px_rgba(59,130,246,0.15)] transition-all duration-500">
                                 <Lock size={32} />
                             </div>
                             <div>
                                 <h4 className="text-xs font-black uppercase tracking-[0.2em] text-[var(--text-primary)] mb-1.5">Encrypted Identity</h4>
                                 <p className="text-[11px] text-[var(--text-secondary)] font-medium leading-relaxed">All administrative actions are recorded with forensic precision.</p>
                             </div>
                         </div>
                    </div>
                </div>

                {/* Form Side */}
                <div className="bg-white border border-[var(--border)] rounded-[48px] md:rounded-[64px] p-8 md:p-16 shadow-[0_48px_96px_-32px_rgba(0,0,0,0.12)] relative animate-in zoom-in-95 duration-500 w-full overflow-visible">
                    {step === 1 && (
                        <div className="animate-in fade-in slide-in-from-right-10 duration-500">
                            <div className="flex items-center gap-4 mb-10 md:mb-14">
                                <span className="text-[10px] font-black px-4 py-2 bg-[var(--brand)] text-white rounded-xl uppercase tracking-widest shadow-lg shadow-[var(--brand)]/20">STEP 01</span>
                                <div className="h-[1px] flex-1 bg-[var(--border)] opacity-60"></div>
                            </div>
                            
                            <h2 className="text-4xl md:text-5xl font-black text-[var(--text-primary)] uppercase tracking-tighter mb-10 md:mb-14 leading-[1]">Identity <br />Verification</h2>
                            
                            <div className="space-y-8 md:space-y-10 mb-12 md:mb-16">
                                <div className="p-8 md:p-12 bg-[#F9FAFB] border border-[var(--border)] rounded-[40px] md:rounded-[48px] group hover:border-[var(--brand)]/20 transition-all duration-500 shadow-sm relative overflow-hidden">
                                     <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                                        <Logo size={120} />
                                     </div>
                                    <label className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-[0.3em] mb-8 block opacity-70">Authenticated Identity</label>
                                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 md:gap-10">
                                        <div className="w-20 h-20 md:w-24 md:h-24 rounded-[28px] md:rounded-[32px] bg-[var(--brand)] flex items-center justify-center text-white shadow-2xl shadow-[var(--brand)]/30 transform group-hover:scale-105 transition-transform duration-500 shrink-0">
                                            <User size={40} md:size={48} />
                                        </div>
                                        <div>
                                            <div className="text-3xl md:text-4xl font-black text-[var(--text-primary)] uppercase tracking-tight leading-none mb-4 break-words">{invite?.invited_name}</div>
                                            <div className="text-[11px] text-[var(--text-secondary)] font-bold uppercase tracking-[0.15em] flex items-center gap-3">
                                                <div className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse shadow-[0_0_12px_rgba(34,197,94,0.5)]"></div> Records Validated
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 md:gap-8">
                                    <div className="p-8 md:p-10 bg-[#F9FAFB] border border-[var(--border)] rounded-[32px] md:rounded-[40px] hover:bg-white transition-all duration-500 group">
                                        <label className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-[0.3em] mb-4 md:mb-5 block opacity-70">Unit Assignment</label>
                                        <div className="flex items-center gap-4 font-black text-[var(--text-primary)] uppercase text-[10px] md:text-xs tracking-wider">
                                            <Briefcase size={18} md:size={20} className="text-[var(--text-disabled)] group-hover:text-[var(--brand)] transition-colors" /> {invite?.department}
                                        </div>
                                    </div>
                                    <div className="p-8 md:p-10 bg-[#F9FAFB] border border-[var(--border)] rounded-[32px] md:rounded-[40px] hover:bg-white transition-all duration-500 group">
                                        <label className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-[0.3em] mb-4 md:mb-5 block opacity-70">Security Protocol</label>
                                        <div className="flex items-center gap-4 font-black text-[var(--brand)] uppercase text-[10px] md:text-xs tracking-wider">
                                            <Shield size={18} md:size={20} className="text-[var(--brand)]/40 group-hover:text-[var(--brand)] transition-colors" /> {roleConfig?.label}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <button 
                                onClick={() => setStep(2)}
                                className="w-full bg-[var(--text-primary)] text-white py-6 md:py-8 rounded-[28px] md:rounded-[32px] font-black uppercase tracking-[0.3em] md:tracking-[0.4em] text-[11px] md:text-[12px] hover:bg-[var(--brand)] transition-all duration-500 shadow-2xl hover:shadow-[var(--brand)]/30 flex items-center justify-center gap-4 md:gap-6 group"
                            >
                                Initiate Secure Handshake <ArrowRight size={20} md:size={24} className="group-hover:translate-x-2 transition-transform" />
                            </button>
                        </div>
                    )}

                    {step === 2 && (
                        <div className="animate-in fade-in slide-in-from-right-10 duration-500">
                             <button onClick={() => setStep(1)} className="text-[10px] font-black text-[var(--text-secondary)] uppercase hover:text-[var(--brand)] mb-8 transition-colors tracking-widest flex items-center gap-2.5">
                                <ArrowRight size={16} className="rotate-180" /> Identity Overview
                             </button>
                             <div className="flex items-center gap-3 mb-12">
                                <span className="text-[10px] font-black px-3 py-1.5 bg-[var(--brand)] text-white rounded-lg uppercase tracking-widest">STEP 02</span>
                                <div className="h-[1px] flex-1 bg-[var(--border)] opacity-60"></div>
                             </div>

                             <h2 className="text-3xl font-black text-[var(--text-primary)] uppercase tracking-tight mb-4">Account Binding</h2>
                             <p className="text-[var(--text-secondary)] text-sm mb-10 leading-relaxed font-medium">
                                Create or link your preferred authentication method to the secure access cluster.
                             </p>

                             {error && (
                                <div className="p-5 bg-[var(--error-bg)] border border-[var(--error)]/20 rounded-2xl text-[var(--error)] text-xs font-bold mb-8 flex items-center gap-3 animate-in shake duration-300">
                                    <Shield size={18} /> {error}
                                </div>
                             )}

                             <div className="space-y-4">
                                <button 
                                    onClick={handleGoogleActivate}
                                    disabled={finishing}
                                    className="w-full bg-white border border-[var(--border)] text-[var(--text-primary)] py-5 rounded-3xl font-black text-[10px] uppercase tracking-[0.2em] flex items-center justify-center gap-4 hover:bg-[#F9FAFB] transition-all disabled:opacity-50 shadow-sm"
                                >
                                    <svg width="20" height="20" viewBox="0 0 24 24" className="mr-1">
                                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.26.81-.58z" fill="#FBBC05" />
                                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                                    </svg>
                                    Verify with G-Suite Workspace
                                </button>

                                <div className="flex items-center gap-4 py-8">
                                    <div className="h-[1px] flex-1 bg-[var(--border)]"></div>
                                    <span className="text-[9px] font-black text-[var(--text-disabled)] uppercase tracking-[0.3em]">Direct Identity Access</span>
                                    <div className="h-[1px] flex-1 bg-[var(--border)]"></div>
                                </div>

                                <form onSubmit={handlePasswordActivate} className="space-y-6">
                                    <div className="space-y-3">
                                        <div className="relative group">
                                            <input 
                                                type="password" 
                                                placeholder="Set Internal Password"
                                                value={password}
                                                onChange={e => setPassword(e.target.value)}
                                                className="w-full bg-[#F9FAFB] border border-[var(--border)] rounded-2xl py-6 px-6 text-[var(--text-primary)] placeholder:text-[var(--text-disabled)] outline-none focus:border-[var(--brand)]/50 focus:bg-white transition-all font-mono text-sm tracking-widest shadow-inner"
                                            />
                                            <div className="absolute inset-y-0 right-6 flex items-center text-[var(--text-disabled)] group-focus-within:text-[var(--brand)] transition-colors pointer-events-none">
                                                <Key size={20} />
                                            </div>
                                        </div>
                                        <p className="text-[9px] text-[var(--text-disabled)] font-bold px-2 italic uppercase tracking-widest">Requires min 14 chars for security cluster synchronization.</p>
                                    </div>

                                    <button 
                                        type="submit"
                                        disabled={finishing || !password}
                                        className="w-full bg-[var(--brand)] text-white py-6 rounded-3xl font-black uppercase tracking-[0.3em] text-[10px] hover:bg-[var(--brand-dark)] transition-all shadow-xl disabled:opacity-50 flex items-center justify-center gap-4"
                                    >
                                        {finishing ? <Loader2 className="animate-spin" /> : <>Provision Credentials <ArrowRight size={14} /></>}
                                    </button>
                                </form>
                             </div>
                        </div>
                    )}

                    {step === 3 && (
                        <div className="text-center animate-in zoom-in-110 duration-1000">
                             <div className="w-28 h-28 rounded-full bg-[var(--success-soft)] border border-[var(--success)]/20 flex items-center justify-center mx-auto mb-12 relative">
                                <div className="absolute inset-0 bg-[var(--success)]/10 blur-3xl rounded-full animate-pulse"></div>
                                <CheckCircle2 size={56} className="text-[var(--success)] relative z-10" />
                             </div>
                             
                             <h2 className="text-4xl font-black text-[var(--text-primary)] uppercase tracking-tighter mb-6">Identity Synchronized</h2>
                             <p className="text-[var(--text-secondary)] text-sm font-medium mb-16 leading-relaxed max-w-xs mx-auto">
                                Handshake complete. Your workspace has been provisioned. Redirecting to your secure mission dashboard...
                             </p>

                             <div className="w-full h-1.5 bg-[var(--background)] rounded-full overflow-hidden mb-5 shadow-inner">
                                <div className="h-full bg-[var(--brand)] animate-[progress_3s_linear_forwards] shadow-[0_0_12px_rgba(232,87,42,0.3)]"></div>
                             </div>
                             <div className="text-[9px] font-black text-[var(--text-disabled)] uppercase tracking-[0.3em] italic">Initializing Secure Handshake Protocol...</div>
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

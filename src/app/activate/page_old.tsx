"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, CheckCircle2, User, Shield, Briefcase, Zap, ShieldCheck, ArrowRight, Lock, Key } from "lucide-react";
import { auth } from "@/lib/firebase";
import { signInWithPopup, GoogleAuthProvider, createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { toast } from "sonner";
import { Invite } from "@/types";
import { ROLE_CONFIGS } from "@/lib/roles_config";

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
            <div className="min-h-screen bg-black flex items-center justify-center">
                <Loader2 className="animate-spin text-orange-500 w-10 h-10" />
            </div>
        );
    }

    const roleConfig = invite ? ROLE_CONFIGS[invite.role] : null;

    return (
        <div className="min-h-screen bg-black text-white p-6 md:p-12 flex flex-col items-center justify-center font-sans overflow-hidden">
            <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
                <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-orange-600/5 blur-[120px] rounded-full"></div>
                <div className="absolute bottom-1/4 right-1/4 w-[600px] h-[600px] bg-blue-600/5 blur-[120px] rounded-full"></div>
            </div>

            <div className="max-w-4xl w-full grid grid-cols-1 lg:grid-cols-2 gap-12 items-center relative z-10 transition-all duration-700">
                {/* Visual Side */}
                <div className="hidden lg:block space-y-10 animate-in fade-in slide-in-from-left-10 duration-700">
                    <div className="space-y-4">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-500 text-[10px] uppercase font-black tracking-widest mb-4">
                            <Zap size={12} /> Secure Onboarding
                        </div>
                        <h1 className="text-5xl font-black text-white uppercase tracking-tighter leading-none">
                            Welcome to the <br /> <span className="text-orange-500">Apex Cluster.</span>
                        </h1>
                        <p className="text-white/40 font-medium text-lg max-w-sm mt-6">
                            Setting up your administrative workspace for <span className="text-white font-bold">{invite?.invited_name}</span>. 
                            Your identity records have been pre-provisioned.
                        </p>
                    </div>

                    <div className="space-y-8 pt-8 border-t border-white/5">
                         <div className="flex items-start gap-4 group">
                             <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-white/40 group-hover:text-orange-500 group-hover:bg-orange-500/10 group-hover:border-orange-500/30 transition-all duration-300">
                                 <ShieldCheck size={24} />
                             </div>
                             <div>
                                 <h4 className="text-sm font-bold uppercase tracking-wider text-white">Advanced RBAC</h4>
                                 <p className="text-xs text-white/30 font-medium mt-1">Your role comes with pre-defined mission permissions.</p>
                             </div>
                         </div>
                         <div className="flex items-start gap-4 group">
                             <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-white/40 group-hover:text-blue-500 group-hover:bg-blue-500/10 group-hover:border-blue-500/30 transition-all duration-300">
                                 <Lock size={24} />
                             </div>
                             <div>
                                 <h4 className="text-sm font-bold uppercase tracking-wider text-white">Encrypted Identity</h4>
                                 <p className="text-xs text-white/30 font-medium mt-1">All actions are recorded in the immutable audit trail.</p>
                             </div>
                         </div>
                    </div>
                </div>

                {/* Form Side */}
                <div className="bg-[#0A0A0A] border border-white/10 rounded-[48px] p-10 md:p-14 shadow-2xl relative overflow-hidden backdrop-blur-3xl animate-in zoom-in-95 duration-500">
                    {step === 1 && (
                        <div className="animate-in fade-in slide-in-from-right-10 duration-500">
                            <div className="flex items-center gap-3 mb-10">
                                <span className="text-xs font-black px-2.5 py-1 bg-white text-black rounded-lg">STEP 01</span>
                                <div className="h-[1px] flex-1 bg-white/10"></div>
                            </div>
                            
                            <h2 className="text-4xl font-black text-white uppercase tracking-tight mb-8">Confirm Identity</h2>
                            
                            <div className="space-y-4 mb-10">
                                <div className="p-6 bg-white/[0.03] border border-white/5 rounded-3xl group hover:border-white/10 transition-all">
                                    <label className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] mb-4 block">User Entity</label>
                                    <div className="flex items-center gap-5">
                                        <div className="w-14 h-14 rounded-2xl bg-orange-500/10 flex items-center justify-center text-orange-500 border border-orange-500/20 shadow-lg shadow-orange-500/5">
                                            <User size={28} />
                                        </div>
                                        <div>
                                            <div className="text-2xl font-black text-white uppercase tracking-tight leading-none">{invite?.invited_name}</div>
                                            <div className="text-[10px] text-white/20 font-bold uppercase tracking-widest mt-1">Status: Identity Validated</div>
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="p-6 bg-white/[0.03] border border-white/5 rounded-3xl">
                                        <label className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] mb-3 block">Sector / Unit</label>
                                        <div className="flex items-center gap-3 font-bold text-white uppercase text-sm">
                                            <Briefcase size={16} className="text-white/20" /> {invite?.department}
                                        </div>
                                    </div>
                                    <div className="p-6 bg-white/[0.03] border border-white/5 rounded-3xl">
                                        <label className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] mb-3 block">Security Tier</label>
                                        <div className="flex items-center gap-3 font-bold text-orange-500 uppercase text-sm">
                                            <Shield size={16} className="text-orange-500/40" /> {roleConfig?.label}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <button 
                                onClick={() => setStep(2)}
                                className="w-full bg-white text-black py-6 rounded-3xl font-black uppercase tracking-[0.3em] text-[10px] hover:bg-orange-500 hover:text-white transition-all shadow-2xl hover:shadow-orange-500/20 flex items-center justify-center gap-4 group"
                            >
                                Proceed to Authentication <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                            </button>
                        </div>
                    )}

                    {step === 2 && (
                        <div className="animate-in fade-in slide-in-from-right-10 duration-500">
                             <button onClick={() => setStep(1)} className="text-[10px] font-black text-white/30 uppercase hover:text-white mb-6 transition-colors tracking-widest">
                                ΓåÉ Back to Identity Check
                             </button>
                             <div className="flex items-center gap-3 mb-10">
                                <span className="text-xs font-black px-2.5 py-1 bg-white text-black rounded-lg">STEP 02</span>
                                <div className="h-[1px] flex-1 bg-white/10"></div>
                             </div>

                             <h2 className="text-3xl font-black text-white uppercase tracking-tight mb-4">Account Binding</h2>
                             <p className="text-white/40 text-sm mb-10 leading-relaxed font-medium">
                                Create or link your preferred authentication method to the secure access cluster.
                             </p>

                             {error && (
                                <div className="p-5 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-500 text-xs font-bold mb-8 flex items-center gap-3 animate-in shake duration-300">
                                    <Shield size={18} /> {error}
                                </div>
                             )}

                             <div className="space-y-4">
                                <button 
                                    onClick={handleGoogleActivate}
                                    disabled={finishing}
                                    className="w-full bg-white text-black py-5 rounded-3xl font-black text-[10px] uppercase tracking-[0.2em] flex items-center justify-center gap-4 hover:bg-orange-500 hover:text-white transition-all disabled:opacity-50"
                                >
                                    <svg width="20" height="20" viewBox="0 0 24 24" className="mr-1">
                                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="currentColor" />
                                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="currentColor" />
                                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.26.81-.58z" fill="currentColor" />
                                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="currentColor" />
                                    </svg>
                                    Verify with G-Suite Workspace
                                </button>

                                <div className="flex items-center gap-4 py-6">
                                    <div className="h-[1px] flex-1 bg-white/5"></div>
                                    <span className="text-[9px] font-black text-white/10 uppercase tracking-[0.3em]">Direct Identity Access</span>
                                    <div className="h-[1px] flex-1 bg-white/5"></div>
                                </div>

                                <form onSubmit={handlePasswordActivate} className="space-y-6">
                                    <div className="space-y-2">
                                        <div className="relative group">
                                            <input 
                                                type="password" 
                                                placeholder="Set Internal Password"
                                                value={password}
                                                onChange={e => setPassword(e.target.value)}
                                                className="w-full bg-white/[0.03] border border-white/10 rounded-2xl py-5 px-6 text-white placeholder:text-white/10 outline-none focus:border-orange-500/50 focus:bg-white/[0.05] transition-all font-mono text-sm tracking-widest"
                                            />
                                            <div className="absolute inset-y-0 right-6 flex items-center text-white/10 group-focus-within:text-orange-500 transition-colors pointer-events-none">
                                                <Key size={20} />
                                            </div>
                                        </div>
                                        <p className="text-[9px] text-white/20 font-bold px-2 italic uppercase tracking-widest">Requires min 14 chars for security cluster synchronization.</p>
                                    </div>

                                    <button 
                                        type="submit"
                                        disabled={finishing || !password}
                                        className="w-full bg-white/[0.05] border border-white/10 text-white/40 py-6 rounded-3xl font-black uppercase tracking-[0.3em] text-[10px] hover:bg-white hover:text-black transition-all shadow-xl disabled:opacity-50 flex items-center justify-center gap-4"
                                    >
                                        {finishing ? <Loader2 className="animate-spin" /> : <>Provision Credentials <ArrowRight size={14} /></>}
                                    </button>
                                </form>
                             </div>
                        </div>
                    )}

                    {step === 3 && (
                        <div className="text-center animate-in zoom-in-110 duration-1000">
                             <div className="w-24 h-24 rounded-full bg-green-500/10 border border-green-500/20 flex items-center justify-center mx-auto mb-10 relative">
                                <div className="absolute inset-0 bg-green-500/20 blur-3xl rounded-full animate-pulse"></div>
                                <CheckCircle2 size={48} className="text-green-500 relative z-10" />
                             </div>
                             
                             <h2 className="text-4xl font-black text-white uppercase tracking-tighter mb-4">Identity Synchronized</h2>
                             <p className="text-white/40 text-sm font-medium mb-12 leading-relaxed max-w-xs mx-auto">
                                Handshake complete. Your workspace has been provisioned. Redirecting to your secure mission dashboard...
                             </p>

                             <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden mb-3">
                                <div className="h-full bg-orange-500 animate-[progress_3s_linear_forwards] shadow-[0_0_12px_rgba(232,68,26,0.5)]"></div>
                             </div>
                             <div className="text-[9px] font-black text-white/20 uppercase tracking-[0.3em] italic">Initializing Secure Handshake Protocol...</div>
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

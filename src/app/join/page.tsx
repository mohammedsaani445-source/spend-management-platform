"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, ShieldCheck, ArrowRight, Zap, Target, Lock, Command } from "lucide-react";
import { toast } from "sonner";

export default function JoinManualPage() {
    const router = useRouter();
    const [code, setCode] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleJoin = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!code || code.length < 5) {
            setError("Please enter a valid access code");
            return;
        }

        setLoading(true);
        setError("");

        try {
            // Ensure AP- prefix if they just typed numbers, but be flexible
            let finalCode = code.trim().toUpperCase();
            if (!finalCode.startsWith("AP-")) {
                if (/^\d+$/.test(finalCode)) {
                    finalCode = `AP-${finalCode}`;
                }
            }

            const res = await fetch("/api/v1/invites/validate", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ code: finalCode })
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Verification failed");

            // Store in session for ActivatePage
            sessionStorage.setItem("apex_pending_invite", JSON.stringify({
                ...data.invite,
                token: data.invite.token // Keep compatibility
            }));

            toast.success("Security Handshake Successful");
            
            // Brief delay for effect
            setTimeout(() => {
                router.push("/activate");
            }, 800);

        } catch (err: any) {
            console.error("Join error:", err);
            setError(err.message);
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-black text-white p-6 md:p-12 flex flex-col items-center justify-center font-sans overflow-hidden">
            {/* Background elements */}
            <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-orange-600/5 blur-[160px] rounded-full"></div>
                <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-blue-600/5 blur-[120px] rounded-full"></div>
            </div>

            <div className="max-w-md w-full relative z-10">
                {/* Header Section */}
                <div className="text-center mb-12 animate-in fade-in slide-in-from-top-4 duration-700">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-500 text-[10px] uppercase font-black tracking-widest mb-6">
                        <Command size={12} /> External Access Portal
                    </div>
                    <h1 className="text-5xl font-black text-white uppercase tracking-tighter leading-none mb-4">
                        Secure <br /> <span className="text-orange-500">Handshake</span>
                    </h1>
                    <p className="text-white/40 font-medium text-sm leading-relaxed px-4">
                        Enter your 6-digit mission access code to synchronize your identity with the Apex platform.
                    </p>
                </div>

                {/* Input Card */}
                <div className="bg-[#0A0A0A] border border-white/10 rounded-[32px] p-8 md:p-10 shadow-2xl relative overflow-hidden backdrop-blur-3xl animate-in zoom-in-95 duration-500">
                    <form onSubmit={handleJoin} className="space-y-8">
                        <div className="space-y-4">
                            <label className="text-[10px] font-black text-white/30 uppercase tracking-[0.3em] block ml-1">Identity Access Code</label>
                            <div className="relative group">
                                <input 
                                    autoFocus
                                    type="text" 
                                    placeholder="AP-XXXXXX"
                                    value={code}
                                    onChange={e => setCode(e.target.value.toUpperCase())}
                                    className="w-full bg-white/[0.03] border border-white/10 rounded-2xl py-6 px-6 text-2xl text-white placeholder:text-white/5 outline-none focus:border-orange-500/50 focus:bg-white/[0.05] transition-all font-mono tracking-[0.2em] text-center"
                                />
                                <div className="absolute inset-y-0 right-6 flex items-center pointer-events-none text-white/5 group-focus-within:text-orange-500/30 transition-colors">
                                    <Target size={24} />
                                </div>
                            </div>
                        </div>

                        {error && (
                            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-500 text-[11px] font-bold flex items-center gap-3 animate-in shake duration-300">
                                <Lock size={16} /> {error}
                            </div>
                        )}

                        <button 
                            disabled={loading || !code}
                            className="w-full bg-white text-black py-6 rounded-2xl font-black uppercase tracking-[0.3em] text-[10px] hover:bg-orange-500 hover:text-white transition-all shadow-2xl hover:shadow-orange-500/20 flex items-center justify-center gap-4 group disabled:opacity-30 disabled:cursor-not-allowed"
                        >
                            {loading ? <Loader2 className="animate-spin" /> : <>Initiate Synchronization <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" /></>}
                        </button>
                    </form>

                    <div className="mt-10 pt-8 border-t border-white/5 flex items-center justify-between">
                        <div className="flex flex-col gap-1">
                            <span className="text-[9px] font-black text-white/20 uppercase tracking-widest italic">Encryption Mode</span>
                            <div className="flex items-center gap-1.5 text-green-500/50 text-[9px] font-black uppercase">
                                <ShieldCheck size={10} /> AES-256 Validated
                            </div>
                        </div>
                        <Zap size={20} className="text-white/5" />
                    </div>
                </div>

                <p className="mt-12 text-center text-[10px] font-bold text-white/10 uppercase tracking-[0.4em] italic animate-pulse">
                    Waiting for secure handshake protocol...
                </p>
            </div>

            <style jsx global>{`
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

"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Loader2, ShieldAlert, ArrowRight, Home } from "lucide-react";
import Link from "next/link";

export default function JoinPage() {
    const params = useParams();
    const token = params.token as string;
    const router = useRouter();
    const [status, setStatus] = useState<"loading" | "error" | "valid">("loading");
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!token) return;

        const validate = async () => {
            try {
                const res = await fetch("/api/v1/invites/validate", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ token })
                });

                const data = await res.json();
                if (!res.ok) throw new Error(data.error || "Token validation failed");

                // Store invite info in sessionStorage for the activate page
                sessionStorage.setItem("apex_pending_invite", JSON.stringify({
                    ...data.invite,
                    token
                }));

                setStatus("valid");
                // Brief delay for user feedback
                setTimeout(() => {
                    router.push("/activate");
                }, 1500);

            } catch (err: any) {
                console.error("Token error:", err);
                setError(err.message);
                setStatus("error");
            }
        };

        validate();
    }, [token, router]);

    if (status === "error") {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center p-6 font-sans">
                <div className="max-w-md w-full bg-[#0A0A0A] border border-white/10 rounded-[32px] p-10 text-center shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-red-500/50 to-transparent"></div>
                    
                    <div className="w-20 h-20 rounded-3xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto mb-8">
                        <ShieldAlert size={40} className="text-red-500" />
                    </div>
                    
                    <h1 className="text-2xl font-black text-white uppercase tracking-tight mb-4">Link Inaccessible</h1>
                    
                    <p className="text-white/40 text-sm leading-relaxed mb-10 px-4">
                        This magic link has either expired, was already used, or is mathematically invalid within the Apex Procure security cluster.
                    </p>
                    
                    <div className="space-y-4">
                        <Link 
                            href="/login"
                            className="flex items-center justify-center gap-3 bg-white text-black py-4 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-orange-500 hover:text-white transition-all shadow-xl shadow-white/5 w-full"
                        >
                            Return to HQ <Home size={16} />
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-black flex items-center justify-center p-6">
            <div className="text-center animate-in fade-in duration-700">
                <div className="relative mb-12">
                   <div className="absolute inset-0 bg-orange-500/20 blur-3xl rounded-full scale-110 animate-pulse"></div>
                   <div className="w-24 h-24 rounded-[32px] bg-white/[0.03] border border-white/10 flex items-center justify-center mx-auto relative z-10">
                        <Loader2 className="text-orange-500 w-10 h-10 animate-spin" />
                   </div>
                </div>
                
                <h1 className="text-3xl font-black text-white uppercase tracking-[0.2em] mb-4">
                    {status === 'valid' ? 'Identity Verified' : 'Authenticating...'}
                </h1>
                
                <p className="text-white/30 font-medium italic tracking-widest uppercase text-[10px]">
                    {status === 'valid' ? 'Provisioning secure onboarding terminal' : 'Decrypting secure magic link access token'}
                </p>

                {status === 'valid' && (
                    <div className="mt-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
                        <div className="flex items-center justify-center gap-3 text-green-500 font-black text-xs uppercase tracking-widest">
                            Handshake Successful <ArrowRight size={16} className="animate-pulse" />
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { validatePortalToken } from "@/lib/portal";
import { PortalSession } from "@/types";
import VendorDashboard from "@/components/portal/VendorDashboard";

export default function PortalPage() {
    const { token } = useParams();
    const router = useRouter();
    const [session, setSession] = useState<PortalSession | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (token) {
            checkAccess();
        }
    }, [token]);

    const checkAccess = async () => {
        setLoading(true);
        try {
            const validSession = await validatePortalToken(token as string);
            if (validSession) {
                setSession(validSession);
            } else {
                setError("Your secure link has expired or is invalid. Please contact the procurement team for a new link.");
            }
        } catch (err) {
            setError("A connection error occurred. Please try again later.");
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0f172a', color: '#fff' }}>
                <div style={{ textAlign: 'center' }}>
                    <div style={{ marginBottom: '1rem', fontSize: '1.5rem', fontWeight: 800 }}>SUPPLIER NEXUS</div>
                    <p style={{ color: '#94a3b8' }}>Verifying secure connection...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0f172a', color: '#fff', padding: '1rem' }}>
                <div style={{ maxWidth: '400px', textAlign: 'center', background: 'rgba(255,255,255,0.05)', padding: '2rem', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.1)' }}>
                    <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⚠️</div>
                    <h2 style={{ marginBottom: '1rem' }}>Access Denied</h2>
                    <p style={{ color: '#94a3b8', lineHeight: 1.6 }}>{error}</p>
                    <button
                        onClick={() => router.push('/')}
                        style={{ marginTop: '2rem', background: '#0ea5e9', color: '#fff', border: 'none', padding: '0.75rem 1.5rem', borderRadius: '8px', fontWeight: 600, cursor: 'pointer' }}
                    >
                        Return to Site
                    </button>
                </div>
            </div>
        );
    }

    if (!session) return null;

    return <VendorDashboard session={session} />;
}

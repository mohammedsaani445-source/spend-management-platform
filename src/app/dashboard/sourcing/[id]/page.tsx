"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { getRFP } from "@/lib/sourcing";
import { useAuth } from "@/context/AuthContext";
import RFQDetails from "@/components/sourcing/RFQDetails";
import { RFP } from "@/types";

export default function RFPDetailPage() {
    const params = useParams();
    const id = params.id as string;
    const { user } = useAuth();
    const [rfp, setRfp] = useState<RFP | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user || !id) return;
        getRFP(user.tenantId, id).then(data => {
            setRfp(data);
            setLoading(false);
        });
    }, [user, id]);

    if (loading) return (
        <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
            Loading tender details...
        </div>
    );

    if (!rfp) return (
        <div style={{ padding: '4rem', textAlign: 'center' }}>
            <h3 style={{ margin: 0 }}>Tender Not Found</h3>
            <p style={{ color: 'var(--text-secondary)' }}>The requested sourcing event does not exist or has been archived.</p>
        </div>
    );

    return (
        <div style={{ background: 'var(--background)' }}>
            <RFQDetails rfp={rfp} />
        </div>
    );
}

"use client";

import { useAuth } from "@/context/AuthContext";
import RFQManager from "@/components/sourcing/RFQManager";
import Loader from "@/components/common/Loader";

export default function SourcingPage() {
    const { user, loading: authLoading } = useAuth();

    if (authLoading) {
        return <Loader text="Synchronizing sourcing data..." />;
    }

    return (
        <div style={{ background: 'var(--background)' }}>
            <RFQManager />
        </div>
    );
}

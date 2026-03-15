"use client";

import { ShieldCheck, ArrowRight, X } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";

interface SecurityBannerProps {
    user: any;
}

export default function SecurityBanner({ user }: SecurityBannerProps) {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        // Show banner only if 2FA is disabled
        if (user && !user.twoFactorEnabled) {
            setIsVisible(true);
        }
    }, [user]);

    if (!isVisible) return null;

    return (
        <div style={{
            background: 'linear-gradient(90deg, #FDF7EF 0%, #FFFBE6 100%)',
            border: '1px solid #FFE58F',
            borderRadius: '12px',
            padding: '1rem 1.5rem',
            marginBottom: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            boxShadow: '0 2px 4px rgba(0,0,0,0.02)',
            animation: 'fadeIn 0.5s ease-out'
        }}>
            <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '10px',
                background: '#FFF1B8',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#D48806',
                flexShrink: 0
            }}>
                <ShieldCheck size={22} />
            </div>

            <div style={{ flex: 1 }}>
                <h4 style={{ margin: 0, fontSize: '0.9375rem', fontWeight: 700, color: '#874D00' }}>
                    Secure Your Account
                </h4>
                <p style={{ margin: '0.125rem 0 0', fontSize: '0.8125rem', color: '#B78103', fontWeight: 500 }}>
                    Enable Two-Factor Authentication (2FA) for enterprise-grade protection on your workspace.
                </p>
            </div>

            <Link href="/dashboard/settings?tab=security" style={{
                background: '#FAAD14',
                color: 'white',
                padding: '0.5rem 1rem',
                borderRadius: '8px',
                fontSize: '0.8125rem',
                fontWeight: 700,
                textDecoration: 'none',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                transition: 'all 0.2s'
            }}
                onMouseEnter={e => e.currentTarget.style.background = '#D48806'}
                onMouseLeave={e => e.currentTarget.style.background = '#FAAD14'}
            >
                Enable Now
                <ArrowRight size={14} />
            </Link>

            <button
                onClick={() => setIsVisible(false)}
                style={{
                    background: 'none',
                    border: 'none',
                    color: '#D48806',
                    cursor: 'pointer',
                    padding: '0.25rem',
                    borderRadius: '4px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}
            >
                <X size={16} />
            </button>
        </div>
    );
}

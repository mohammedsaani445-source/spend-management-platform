"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import UserManagement from "@/components/admin/UserManagement";
import LogoutModal from "@/components/layout/LogoutModal";
import * as OTPAuth from "otpauth";
import QRCode from "qrcode";
import {
    User, Shield, Bell, ScrollText, Network,
    GitMerge, Users, LogOut, CheckCircle2,
    Smartphone, X, Coins
} from "lucide-react";
import Loader from "@/components/common/Loader";
import styles from "./Settings.module.css";
import { useScrollLock } from "@/hooks/useScrollLock";

import WorkflowBuilder from "@/components/admin/WorkflowBuilder";
import AuditLogViewer from "@/components/admin/AuditLogViewer";
import HierarchyManager from "@/components/admin/HierarchyManager";
import CurrencySettings from "@/components/admin/CurrencySettings";

type Tab = 'PROFILE' | 'SECURITY' | 'NOTIFICATIONS' | 'TEAM' | 'WORKFLOWS' | 'AUDIT' | 'HIERARCHY' | 'POLICY' | 'CURRENCY';

export default function SettingsPage() {
    return (
        <Suspense fallback={<Loader text="Initializing settings..." />}>
            <SettingsContent />
        </Suspense>
    );
}

function SettingsContent() {
    const { user, updateProfile } = useAuth();
    const searchParams = useSearchParams();
    const initialTab = (searchParams.get('tab')?.toUpperCase() as Tab) || 'PROFILE';

    const [activeTab, setActiveTab] = useState<Tab>(initialTab);
    const [formData, setFormData] = useState({
        displayName: "",
        jobTitle: "",
        phone: "",
        bio: "",
        location: "",
        twoFactorEnabled: false,
        twoFactorSecret: "",
        marketingEmails: true,
        securityAlerts: true,
        budgetEnforcementLevel: 'SOFT' as 'SOFT' | 'HARD',
        baseCurrency: 'USD'
    });

    const [isSaving, setIsSaving] = useState(false);
    const [saveSuccess, setSaveSuccess] = useState(false);
    const [is2FAModalOpen, setIs2FAModalOpen] = useState(false);
    const [qrCodeUrl, setQrCodeUrl] = useState("");
    const [tempSecret, setTempSecret] = useState("");
    const [verificationCode, setVerificationCode] = useState("");
    const [verificationError, setVerificationError] = useState("");
    const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

    useScrollLock(is2FAModalOpen || isLogoutModalOpen);

    useEffect(() => {
        if (user) {
            setFormData({
                displayName: user.displayName || "",
                jobTitle: user.jobTitle || "",
                phone: user.phone || "",
                bio: user.bio || "",
                location: user.location || "",
                twoFactorEnabled: user.twoFactorEnabled || false,
                twoFactorSecret: user.twoFactorSecret || "",
                marketingEmails: user.marketingEmails ?? true,
                securityAlerts: user.securityAlerts ?? true,
                budgetEnforcementLevel: 'SOFT', // Default, will be updated if we fetch it
                baseCurrency: (user as any).currency || 'USD'
            });

            // Fetch tenant settings for policy
            const fetchSettings = async () => {
                const { db, DB_PREFIX } = await import("@/lib/firebase");
                const { ref, get } = await import("firebase/database");
                const settingsSnap = await get(ref(db, `${DB_PREFIX}/tenants/${user.tenantId}/settings`));
                if (settingsSnap.exists()) {
                    const settings = settingsSnap.val();
                    setFormData(prev => ({ 
                        ...prev, 
                        budgetEnforcementLevel: settings.budgetEnforcementLevel || 'SOFT',
                        baseCurrency: settings.baseCurrency || user.currency || 'USD'
                    }));
                } else {
                    setFormData(prev => ({ ...prev, baseCurrency: (user as any).currency || 'USD' }));
                }
            };
            fetchSettings();
        }
    }, [user]);

    useEffect(() => {
        const tab = searchParams.get('tab');
        if (tab) {
            const upperTab = tab.toUpperCase() as Tab;
            if (['PROFILE', 'SECURITY', 'NOTIFICATIONS', 'TEAM', 'WORKFLOWS', 'AUDIT', 'HIERARCHY', 'POLICY', 'CURRENCY'].includes(upperTab)) {
                setActiveTab(upperTab);
            }
        }
        
        // Phase 45: Mandatory 2FA Setup
        if (searchParams.get('setupSecret') === 'true' && !formData.twoFactorEnabled) {
            generate2FA();
            setIs2FAModalOpen(true);
        }
    }, [searchParams, formData.twoFactorEnabled]);

    const generate2FA = async () => {
        if (!user) return;

        const secret = new OTPAuth.Secret({ size: 20 });
        const secretBase32 = secret.base32;
        setTempSecret(secretBase32);

        const totp = new OTPAuth.TOTP({
            issuer: "Apex Procure Enterprise",
            label: user.email,
            algorithm: "SHA1",
            digits: 6,
            period: 30,
            secret: secret
        });

        const uri = totp.toString();
        const qrDataUrl = await QRCode.toDataURL(uri);
        setQrCodeUrl(qrDataUrl);
    };

    const handle2FAToggle = () => {
        if (!formData.twoFactorEnabled) {
            generate2FA();
            setIs2FAModalOpen(true);
        } else {
            if (confirm("Are you sure you want to disable 2FA? This will reduce your account security.")) {
                const updatedData = { ...formData, twoFactorEnabled: false, twoFactorSecret: "" };
                setFormData(updatedData);
                updateProfile(updatedData);
            }
        }
    };

    const verifyAndEnable2FA = async () => {
        setVerificationError("");

        const totp = new OTPAuth.TOTP({
            issuer: "Apex Procure Enterprise",
            label: user?.email,
            algorithm: "SHA1",
            digits: 6,
            period: 30,
            secret: tempSecret
        });

        const delta = totp.validate({
            token: verificationCode,
            window: 1
        });

        if (delta !== null) {
            const updatedData = {
                ...formData,
                twoFactorEnabled: true,
                twoFactorSecret: tempSecret
            };
            setFormData(updatedData);
            await updateProfile(updatedData);
            setIs2FAModalOpen(false);
            setVerificationCode("");
        } else {
            setVerificationError("Invalid verification code. Please check your app and try again.");
        }
    };

    const getSecurityScore = () => {
        if (!user) return 0;
        let score = 0;
        if (formData.twoFactorEnabled) score += 50;
        if (user.email) score += 25; // Base verified email
        if (formData.phone) score += 25;
        return score;
    };

    const handleBaseCurrencyUpdate = async (newCurrency: string) => {
        setFormData(prev => ({ ...prev, baseCurrency: newCurrency }));
        // Also update AuthContext user state to ensure session is current
        if (user) {
            await updateProfile({ ...formData, baseCurrency: newCurrency } as any);
        }
    };

    const handleSave = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        setIsSaving(true);
        try {
            await updateProfile(formData);
            
            // If on policy tab, also update tenant settings
            if (activeTab === 'POLICY' || activeTab === 'PROFILE') {
                const { setGlobalEnforcementLevel } = await import("@/lib/budgets");
                await setGlobalEnforcementLevel(user!.tenantId, formData.budgetEnforcementLevel);
            }

            setSaveSuccess(true);
            setTimeout(() => setSaveSuccess(false), 3000);
        } catch (error) {
            alert("Failed to update settings.");
        } finally {
            setIsSaving(false);
        }
    };

    if (!user) return <Loader text="Loading user data..." />;

    return (
        <div className={styles.container}>
            {/* 2FA Enrollment Modal */}
            {is2FAModalOpen && (
                <div style={{
                    position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)',
                    zIndex: 'var(--z-modal-backdrop)' as any, display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                    <div className={styles.card} style={{ maxWidth: '450px', width: '90%', textAlign: 'center', position: 'relative' }}>
                        <button
                            onClick={() => setIs2FAModalOpen(false)}
                            style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', background: 'none', border: 'none', cursor: 'pointer', color: '#6B7280' }}
                        >
                            <X size={24} />
                        </button>

                        <div style={{
                            width: '64px', height: '64px', background: '#ECFDF5', color: '#059669',
                            borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                            margin: '0 auto 1.5rem auto'
                        }}>
                            <Smartphone size={32} />
                        </div>

                        <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.75rem', color: '#111827' }}>Set Up 2FA</h2>
                        <p style={{ color: '#6B7280', marginBottom: '2rem', fontSize: '0.9375rem', lineHeight: 1.5 }}>
                            Scan the QR code below with your Authenticator app to secure your account.
                        </p>

                        <div style={{
                            width: '200px', height: '200px', margin: '0 auto 1.5rem auto', padding: '1rem',
                            border: '1px solid #E5E7EB', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center'
                        }}>
                            {qrCodeUrl ? (
                                <img src={qrCodeUrl} alt="2FA QR Code" style={{ width: '100%', height: '100%' }} />
                            ) : (
                                <div style={{ fontSize: '0.875rem', color: '#9CA3AF' }}>Generating QR...</div>
                            )}
                        </div>

                        <div style={{ marginBottom: '1.5rem' }}>
                            <code style={{ background: '#F3F4F6', padding: '0.5rem 1rem', borderRadius: '8px', fontSize: '0.875rem', color: 'var(--brand)', fontWeight: 700 }}>
                                {tempSecret}
                            </code>
                        </div>

                        <div style={{ textAlign: 'left', marginBottom: '1.5rem' }}>
                            <label style={{ fontSize: '0.875rem', fontWeight: 600, color: '#374151', display: 'block', marginBottom: '0.5rem' }}>Enter 6-Digit Code</label>
                            <input
                                type="text"
                                placeholder="000000"
                                maxLength={6}
                                value={verificationCode}
                                style={{
                                    width: '100%', textAlign: 'center', letterSpacing: '0.5rem', fontSize: '1.5rem', fontWeight: 800,
                                    border: verificationError ? '2px solid #DC2626' : '1px solid #D1D5DB', borderRadius: '10px', height: '56px', outline: 'none'
                                }}
                                onChange={(e) => setVerificationCode(e.target.value)}
                            />
                            {verificationError && (
                                <p style={{ color: '#DC2626', fontSize: '0.875rem', marginTop: '0.5rem', fontWeight: 500 }}>
                                    {verificationError}
                                </p>
                            )}
                        </div>

                        <button className={styles.primaryButton} style={{ width: '100%' }} onClick={verifyAndEnable2FA} disabled={verificationCode.length < 6}>
                            Verify & Enable
                        </button>
                    </div>
                </div>
            )}

            <div className={styles.header}>
                <h1 className={styles.title}>Account Hub</h1>
                <p className={styles.subtitle}>Manage your professional identity, security protocols, and preferences.</p>
            </div>

            <div className={styles.layout}>
                {/* Fixed Navigation Sidebar */}
                <div className={styles.sidebar}>
                    <button onClick={() => setActiveTab('PROFILE')} className={`${styles.navLink} ${activeTab === 'PROFILE' ? styles.navLinkActive : ''}`} data-label="Profile Details">
                        <User size={18} className={styles.navIcon} /> Profile Details
                    </button>
                    <button onClick={() => setActiveTab('SECURITY')} className={`${styles.navLink} ${activeTab === 'SECURITY' ? styles.navLinkActive : ''}`} data-label="Security & Privacy">
                        <Shield size={18} className={styles.navIcon} /> Security & Privacy
                    </button>
                    <button onClick={() => setActiveTab('NOTIFICATIONS')} className={`${styles.navLink} ${activeTab === 'NOTIFICATIONS' ? styles.navLinkActive : ''}`} data-label="Notifications">
                        <Bell size={18} className={styles.navIcon} /> Notifications
                    </button>

                    {(['ADMIN', 'WORKSPACE_ADMIN', 'PLATFORM_SUPERUSER', 'SUPERUSER'].includes(user.role)) && (
                        <>
                            <div className={styles.navSection}>Administrative</div>
                            <button onClick={() => setActiveTab('AUDIT')} className={`${styles.navLink} ${activeTab === 'AUDIT' ? styles.navLinkActive : ''}`} data-label="Security Audit Log">
                                <ScrollText size={18} className={styles.navIcon} /> Security Audit Log
                            </button>
                            <button onClick={() => setActiveTab('HIERARCHY')} className={`${styles.navLink} ${activeTab === 'HIERARCHY' ? styles.navLinkActive : ''}`} data-label="Organizational Hierarchy">
                                <Network size={18} className={styles.navIcon} /> Organizational Hierarchy
                            </button>
                            <button onClick={() => setActiveTab('POLICY')} className={`${styles.navLink} ${activeTab === 'POLICY' ? styles.navLinkActive : ''}`} data-label="Procurement Policy">
                                <Shield size={18} className={styles.navIcon} /> Procurement Policy
                            </button>
                            <button onClick={() => setActiveTab('WORKFLOWS')} className={`${styles.navLink} ${activeTab === 'WORKFLOWS' ? styles.navLinkActive : ''}`} data-label="Workflow Designer">
                                <GitMerge size={18} className={styles.navIcon} /> Workflow Designer
                            </button>
                            <button onClick={() => setActiveTab('TEAM')} className={`${styles.navLink} ${activeTab === 'TEAM' ? styles.navLinkActive : ''}`} data-label="Team Management">
                                <Users size={18} className={styles.navIcon} /> Team Management
                            </button>
                            <button onClick={() => setActiveTab('CURRENCY')} className={`${styles.navLink} ${activeTab === 'CURRENCY' ? styles.navLinkActive : ''}`} data-label="Currency & Intelligence">
                                <Coins size={18} className={styles.navIcon} /> Currency & Intelligence
                            </button>
                        </>
                    )}
                    <button onClick={() => setIsLogoutModalOpen(true)} className={`${styles.navLink} ${styles.navLinkDanger}`} data-label="Sign Out">
                        <LogOut size={18} className={styles.navIcon} /> Sign Out
                    </button>
                </div>

                {/* Main Content Area */}
                <div className={styles.contentArea}>
                    <div className={styles.card}>
                        {activeTab === 'PROFILE' && (
                            <div>
                                <h3 className={styles.sectionTitle}>Digital Identity</h3>
                                <div className={styles.profileHeader}>
                                    <div className={styles.avatarWrapper}>
                                        <div className={styles.avatar}>
                                            {user.displayName?.[0] || 'U'}
                                        </div>
                                        <button className={styles.avatarEdit} title="Modify Identity Image">
                                            <Smartphone size={14} />
                                        </button>
                                    </div>
                                    <div>
                                        <h3 className={styles.profileName}>{user.displayName || "Personal Branding"}</h3>
                                        <p className={styles.profileEmail}>{user.jobTitle || "Professional at Apex Procure"}</p>
                                        <div className={styles.badge}>
                                            <CheckCircle2 size={14} /> IDENTITY VERIFIED
                                        </div>
                                    </div>
                                </div>

                                <div className={styles.formGrid}>
                                    <div className={styles.formGroup}>
                                        <label className={styles.label}>Full Name</label>
                                        <input type="text" className={styles.input} value={formData.displayName} onChange={e => setFormData({ ...formData, displayName: e.target.value })} placeholder="John Doe" required />
                                    </div>
                                    <div className={styles.formGroup}>
                                        <label className={styles.label}>Job Title/Role</label>
                                        <input type="text" className={styles.input} placeholder="e.g. Procurement Specialsit" value={formData.jobTitle} onChange={e => setFormData({ ...formData, jobTitle: e.target.value })} />
                                    </div>
                                    <div className={styles.formGroup}>
                                        <label className={styles.label}>Primary Contact Number</label>
                                        <input type="tel" className={styles.input} placeholder="+1 (555) 000-0000" value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} />
                                    </div>
                                    <div className={styles.formGroup}>
                                        <label className={styles.label}>Physical Branch / Location</label>
                                        <input type="text" className={styles.input} placeholder="e.g. Headquarters" value={formData.location} onChange={e => setFormData({ ...formData, location: e.target.value })} />
                                    </div>
                                </div>

                                <div className={styles.formGroup} style={{ marginTop: '1.5rem' }}>
                                    <label className={styles.label}>Professional Biography</label>
                                    <textarea className={styles.textarea} placeholder="Describe your management style and procurement expertise..." value={formData.bio} onChange={e => setFormData({ ...formData, bio: e.target.value })} />
                                </div>
                            </div>
                        )}

                        {activeTab === 'SECURITY' && (
                            <div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
                                    <h3 className={styles.sectionTitle} style={{ marginBottom: 0 }}>Account Access & Security</h3>
                                    <div style={{ textAlign: 'right' }}>
                                        <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#6B7280', marginBottom: '0.25rem' }}>SECURITY STRENGTH</div>
                                        <div style={{ display: 'flex', gap: '4px' }}>
                                            {[...Array(4)].map((_, i) => (
                                                <div
                                                    key={i}
                                                    style={{
                                                        width: '24px', height: '4px', borderRadius: '2px',
                                                        background: i < (getSecurityScore() / 25)
                                                            ? (getSecurityScore() <= 50 ? '#EF4444' : getSecurityScore() <= 75 ? '#F59E0B' : '#10B981')
                                                            : '#E5E7EB'
                                                    }}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                <div className={styles.formGrid} style={{ marginBottom: '2rem' }}>
                                    <div className={styles.formGroup}>
                                        <label className={styles.label}>Primary Email Address</label>
                                        <input type="email" className={styles.input} value={user.email} disabled />
                                        <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.75rem', color: '#6B7280' }}>Contact Admin to update primary email.</p>
                                    </div>
                                    <div className={styles.formGroup}>
                                        <label className={styles.label}>Login Status</label>
                                        <div style={{ padding: '0.75rem 1rem', background: '#F9FAFB', borderRadius: '10px', fontSize: '0.9375rem', color: '#111827', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            <Shield size={16} color="#10B981" /> Authenticated via Google
                                        </div>
                                    </div>
                                </div>

                                <h3 className={styles.sectionTitle} style={{ fontSize: '1.125rem' }}>Authentication Protocols</h3>
                                <div className={styles.securityCard}>
                                    <div>
                                        <h4 className={styles.securityHeader}>
                                            Two-Factor Authentication (2FA)
                                            <span className={`${styles.statusBadge} ${formData.twoFactorEnabled ? styles.statusProtected : styles.statusUnprotected}`} style={{ marginRight: '0.5rem' }}>
                                                {formData.twoFactorEnabled ? 'PROTECTED' : 'NOT ENABLED'}
                                            </span>
                                            {!formData.twoFactorEnabled && (
                                                <span style={{
                                                    fontSize: '0.625rem',
                                                    fontWeight: 800,
                                                    padding: '2px 6px',
                                                    borderRadius: '4px',
                                                    background: '#E6F7FF',
                                                    color: '#1890FF',
                                                    border: '1px solid #91D5FF',
                                                    letterSpacing: '0.02em',
                                                    verticalAlign: 'middle'
                                                }}>HIGHLY RECOMMENDED</span>
                                            )}
                                        </h4>
                                        <p className={styles.securityDesc}>
                                            Add an extra layer of security to your account with a mobile authenticator app.
                                        </p>
                                    </div>
                                    <div onClick={handle2FAToggle} className={`${styles.toggleSwitch} ${formData.twoFactorEnabled ? styles.toggleSwitchEnabled : styles.toggleSwitchDisabled}`}>
                                        <div className={`${styles.toggleKnob} ${formData.twoFactorEnabled ? styles.toggleKnobEnabled : styles.toggleKnobDisabled}`} />
                                    </div>
                                </div>

                                <h3 className={styles.sectionTitle} style={{ fontSize: '1.125rem' }}>Preferences & Privacy</h3>
                                <div>
                                    <div className={styles.preferenceItem}>
                                        <div className={styles.prefContent}>
                                            <div className={styles.prefTitle}>Public Profile Visibility</div>
                                            <div className={styles.prefDesc}>Allow other users in your organization to see your professional bio.</div>
                                        </div>
                                        <div className={`${styles.toggleSwitch} ${styles.toggleSwitchEnabled}`}>
                                            <div className={`${styles.toggleKnob} ${styles.toggleKnobEnabled}`} />
                                        </div>
                                    </div>
                                    <div className={styles.preferenceItem} style={{ borderBottom: 'none', marginBottom: 0, paddingBottom: 0 }}>
                                        <div className={styles.prefContent}>
                                            <div className={styles.prefTitle}>Security Logging</div>
                                            <div className={styles.prefDesc}>Keep a secure log of all sensitive actions performed on your account.</div>
                                        </div>
                                        <div className={`${styles.toggleSwitch} ${styles.toggleSwitchEnabled}`}>
                                            <div className={`${styles.toggleKnob} ${styles.toggleKnobEnabled}`} />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'NOTIFICATIONS' && (
                            <div>
                                <h3 className={styles.sectionTitle}>Preference Center</h3>

                                <div>
                                    <div className={styles.checkboxItem}>
                                        <input type="checkbox" className={styles.checkboxInput} checked={formData.securityAlerts} onChange={e => setFormData({ ...formData, securityAlerts: e.target.checked })} />
                                        <div className={styles.prefContent}>
                                            <div className={styles.prefTitle}>Critical Security Alerts</div>
                                            <div className={styles.prefDesc}>Get notified immediately about password changes or unauthorized login attempts.</div>
                                        </div>
                                    </div>

                                    <div className={styles.checkboxItem}>
                                        <input type="checkbox" className={styles.checkboxInput} checked={formData.marketingEmails} onChange={e => setFormData({ ...formData, marketingEmails: e.target.checked })} />
                                        <div className={styles.prefContent}>
                                            <div className={styles.prefTitle}>Feature Updates & Product News</div>
                                            <div className={styles.prefDesc}>Weekly digest of new enterprise features and spend management best practices.</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'POLICY' && (
                            <div>
                                <h3 className={styles.sectionTitle}>Procurement & Budget Policy</h3>
                                <p className={styles.sectionDesc} style={{ marginBottom: '1.5rem', color: 'var(--text-secondary)' }}>
                                    Define how the system enforces financial controls and budget limits across all departments.
                                </p>

                                <div className={styles.securityCard} style={{ cursor: 'default' }}>
                                    <div style={{ flex: 1 }}>
                                        <h4 className={styles.securityHeader}>
                                            Budget Enforcement Level
                                            <span className={`${styles.statusBadge} ${formData.budgetEnforcementLevel === 'HARD' ? styles.statusProtected : styles.statusUnprotected}`} style={{ marginLeft: '1rem' }}>
                                                {formData.budgetEnforcementLevel} ENFORCEMENT
                                            </span>
                                        </h4>
                                        <p className={styles.securityDesc} style={{ marginTop: '0.5rem' }}>
                                            {formData.budgetEnforcementLevel === 'HARD' 
                                                ? "Strict: Users are blocked from submitting requisitions that exceed their department's remaining budget."
                                                : "Flexible: Users receive a warning but can still submit requisitions over budget. Approvers will see an 'OVER_BUDGET' flag."}
                                        </p>
                                    </div>
                                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                                        <button 
                                            type="button"
                                            className={`${styles.badge} ${formData.budgetEnforcementLevel === 'SOFT' ? styles.badgeActive : ''}`}
                                            style={{ cursor: 'pointer', border: formData.budgetEnforcementLevel === 'SOFT' ? '1px solid var(--accent)' : '1px solid var(--border)', background: formData.budgetEnforcementLevel === 'SOFT' ? 'var(--accent-light)' : 'transparent' }}
                                            onClick={() => setFormData({ ...formData, budgetEnforcementLevel: 'SOFT' })}
                                        >
                                            SOFT
                                        </button>
                                        <button 
                                            type="button"
                                            className={`${styles.badge} ${formData.budgetEnforcementLevel === 'HARD' ? styles.badgeActive : ''}`}
                                            style={{ cursor: 'pointer', border: formData.budgetEnforcementLevel === 'HARD' ? '1px solid var(--error)' : '1px solid var(--border)', background: formData.budgetEnforcementLevel === 'HARD' ? 'rgba(239, 68, 68, 0.1)' : 'transparent' }}
                                            onClick={() => setFormData({ ...formData, budgetEnforcementLevel: 'HARD' })}
                                        >
                                            HARD
                                        </button>
                                    </div>
                                </div>

                                <div className={styles.formGroup} style={{ marginTop: '2rem', padding: '1rem', background: 'rgba(255, 147, 79, 0.05)', borderRadius: '12px', borderLeft: '4px solid var(--brand)' }}>
                                    <h5 style={{ fontWeight: 700, marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <CheckCircle2 size={16} /> Impact of Policy Changes
                                    </h5>
                                    <ul style={{ fontSize: '0.875rem', color: 'var(--text-main)', paddingLeft: '1.25rem', lineHeight: 1.6 }}>
                                        <li>Funds are reserved ('Committed') immediately upon final requisition approval.</li>
                                        <li>Cancellations or rejections automatically release committed funds back to the department.</li>
                                        <li>Audit logs will track every policy adjustment for compliance reporting.</li>
                                    </ul>
                                </div>
                            </div>
                        )}

                        {activeTab === 'TEAM' && <UserManagement />}
                        {activeTab === 'WORKFLOWS' && <WorkflowBuilder />}
                        {activeTab === 'AUDIT' && <AuditLogViewer />}
                        {activeTab === 'HIERARCHY' && <HierarchyManager />}

                        {activeTab === 'CURRENCY' && (
                            <CurrencySettings 
                                tenantId={user.tenantId} 
                                currentBaseCurrency={formData.baseCurrency} 
                                onBaseCurrencyChange={handleBaseCurrencyUpdate}
                            />
                        )}

                        {!['TEAM', 'WORKFLOWS', 'AUDIT', 'HIERARCHY', 'CURRENCY'].includes(activeTab) && (
                            <div className={styles.actionsFooter}>
                                {saveSuccess && (
                                    <span className={styles.successMessage}>
                                        <CheckCircle2 size={18} /> Changes saved successfully
                                    </span>
                                )}
                                <button type="button" onClick={handleSave} className={styles.primaryButton} disabled={isSaving}>
                                    {isSaving ? 'Synchronizing...' : 'Save All Changes'}
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
            <LogoutModal isOpen={isLogoutModalOpen} onClose={() => setIsLogoutModalOpen(false)} />
        </div>
    );
}

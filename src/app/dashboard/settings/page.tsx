"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import UserManagement from "@/components/admin/UserManagement";
import LogoutModal from "@/components/layout/LogoutModal";
import * as OTPAuth from "otpauth";
import QRCode from "qrcode";
import {
    User, Shield, Bell, ScrollText, Network,
    GitMerge, Users, LogOut, CheckCircle2,
    Smartphone, X
} from "lucide-react";
import styles from "./Settings.module.css";

import WorkflowBuilder from "@/components/admin/WorkflowBuilder";
import AuditLogViewer from "@/components/admin/AuditLogViewer";
import HierarchyManager from "@/components/admin/HierarchyManager";

type Tab = 'PROFILE' | 'SECURITY' | 'NOTIFICATIONS' | 'TEAM' | 'WORKFLOWS' | 'AUDIT' | 'HIERARCHY';

export default function SettingsPage() {
    const { user, updateProfile } = useAuth();
    const [activeTab, setActiveTab] = useState<Tab>('PROFILE');
    const [formData, setFormData] = useState({
        displayName: "",
        jobTitle: "",
        phone: "",
        bio: "",
        location: "",
        twoFactorEnabled: false,
        twoFactorSecret: "",
        marketingEmails: true,
        securityAlerts: true
    });

    const [isSaving, setIsSaving] = useState(false);
    const [saveSuccess, setSaveSuccess] = useState(false);
    const [is2FAModalOpen, setIs2FAModalOpen] = useState(false);
    const [qrCodeUrl, setQrCodeUrl] = useState("");
    const [tempSecret, setTempSecret] = useState("");
    const [verificationCode, setVerificationCode] = useState("");
    const [verificationError, setVerificationError] = useState("");
    const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

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
                securityAlerts: user.securityAlerts ?? true
            });
        }
    }, [user]);

    const generate2FA = async () => {
        if (!user) return;

        const secret = new OTPAuth.Secret({ size: 20 });
        const secretBase32 = secret.base32;
        setTempSecret(secretBase32);

        const totp = new OTPAuth.TOTP({
            issuer: "Procurify Enterprise",
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
            issuer: "Procurify Enterprise",
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

    const handleSave = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        setIsSaving(true);
        try {
            await updateProfile(formData);
            setSaveSuccess(true);
            setTimeout(() => setSaveSuccess(false), 3000);
        } catch (error) {
            alert("Failed to update profile.");
        } finally {
            setIsSaving(false);
        }
    };

    if (!user) return <div style={{ padding: '2rem', textAlign: 'center', color: '#6B7280' }}>Loading user data...</div>;

    return (
        <div className={styles.container}>
            {/* 2FA Enrollment Modal */}
            {is2FAModalOpen && (
                <div style={{
                    position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)',
                    zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center'
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
                    <button onClick={() => setActiveTab('PROFILE')} className={`${styles.navLink} ${activeTab === 'PROFILE' ? styles.navLinkActive : ''}`}>
                        <User size={18} className={styles.navIcon} /> Profile Details
                    </button>
                    <button onClick={() => setActiveTab('SECURITY')} className={`${styles.navLink} ${activeTab === 'SECURITY' ? styles.navLinkActive : ''}`}>
                        <Shield size={18} className={styles.navIcon} /> Security & Privacy
                    </button>
                    <button onClick={() => setActiveTab('NOTIFICATIONS')} className={`${styles.navLink} ${activeTab === 'NOTIFICATIONS' ? styles.navLinkActive : ''}`}>
                        <Bell size={18} className={styles.navIcon} /> Notifications
                    </button>

                    {(user.role === 'ADMIN' || user.role === 'SUPERUSER') && (
                        <>
                            <div className={styles.navSection}>Administrative</div>
                            <button onClick={() => setActiveTab('AUDIT')} className={`${styles.navLink} ${activeTab === 'AUDIT' ? styles.navLinkActive : ''}`}>
                                <ScrollText size={18} className={styles.navIcon} /> Security Audit Log
                            </button>
                            <button onClick={() => setActiveTab('HIERARCHY')} className={`${styles.navLink} ${activeTab === 'HIERARCHY' ? styles.navLinkActive : ''}`}>
                                <Network size={18} className={styles.navIcon} /> Organizational Hierarchy
                            </button>
                            <button onClick={() => setActiveTab('WORKFLOWS')} className={`${styles.navLink} ${activeTab === 'WORKFLOWS' ? styles.navLinkActive : ''}`}>
                                <GitMerge size={18} className={styles.navIcon} /> Workflow Designer
                            </button>
                            <button onClick={() => setActiveTab('TEAM')} className={`${styles.navLink} ${activeTab === 'TEAM' ? styles.navLinkActive : ''}`}>
                                <Users size={18} className={styles.navIcon} /> Team Management
                            </button>
                        </>
                    )}
                    <button onClick={() => setIsLogoutModalOpen(true)} className={`${styles.navLink} ${styles.navLinkDanger}`}>
                        <LogOut size={18} className={styles.navIcon} /> Sign Out
                    </button>
                </div>

                {/* Main Content Area */}
                <div className={styles.contentArea}>
                    <div className={styles.card}>
                        {activeTab === 'PROFILE' && (
                            <div>
                                <div className={styles.profileHeader}>
                                    <div className={styles.avatar}>
                                        {user.displayName?.[0] || 'U'}
                                    </div>
                                    <div>
                                        <h3 className={styles.profileName}>{user.displayName}</h3>
                                        <p className={styles.profileEmail}>{user.email}</p>
                                        <div className={styles.badge}>
                                            <CheckCircle2 size={14} /> VERIFIED ENTERPRISE ACCOUNT
                                        </div>
                                    </div>
                                </div>

                                <div className={styles.formGrid}>
                                    <div className={styles.formGroup}>
                                        <label className={styles.label}>Full Name</label>
                                        <input type="text" className={styles.input} value={formData.displayName} onChange={e => setFormData({ ...formData, displayName: e.target.value })} required />
                                    </div>
                                    <div className={styles.formGroup}>
                                        <label className={styles.label}>Email Address</label>
                                        <input type="email" className={styles.input} value={user.email} disabled />
                                    </div>
                                    <div className={styles.formGroup}>
                                        <label className={styles.label}>Job Title</label>
                                        <input type="text" className={styles.input} placeholder="e.g. Procurement Manager" value={formData.jobTitle} onChange={e => setFormData({ ...formData, jobTitle: e.target.value })} />
                                    </div>
                                    <div className={styles.formGroup}>
                                        <label className={styles.label}>Phone Number</label>
                                        <input type="tel" className={styles.input} placeholder="+1 (555) 000-0000" value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} />
                                    </div>
                                </div>

                                <div className={styles.formGroup} style={{ marginTop: '1.5rem' }}>
                                    <label className={styles.label}>Professional Bio</label>
                                    <textarea className={styles.textarea} placeholder="Describe your role and expertise..." value={formData.bio} onChange={e => setFormData({ ...formData, bio: e.target.value })} />
                                </div>
                            </div>
                        )}

                        {activeTab === 'SECURITY' && (
                            <div>
                                <h3 className={styles.sectionTitle}>Security Authentication</h3>

                                <div className={styles.securityCard}>
                                    <div>
                                        <h4 className={styles.securityHeader}>
                                            Two-Factor Authentication (2FA)
                                            <span className={`${styles.statusBadge} ${formData.twoFactorEnabled ? styles.statusProtected : styles.statusUnprotected}`}>
                                                {formData.twoFactorEnabled ? 'PROTECTED' : 'NOT ENABLED'}
                                            </span>
                                        </h4>
                                        <p className={styles.securityDesc}>
                                            Add an extra layer of security to your enterprise account.
                                        </p>
                                    </div>
                                    <div onClick={handle2FAToggle} className={`${styles.toggleSwitch} ${formData.twoFactorEnabled ? styles.toggleSwitchEnabled : styles.toggleSwitchDisabled}`}>
                                        <div className={`${styles.toggleKnob} ${formData.twoFactorEnabled ? styles.toggleKnobEnabled : styles.toggleKnobDisabled}`} />
                                    </div>
                                </div>

                                <h3 className={styles.sectionTitle}>Data Privacy</h3>
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
                                            <div className={styles.prefTitle}>Login History Tracking</div>
                                            <div className={styles.prefDesc}>Keep a secure log of all devices and locations used to access your account.</div>
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

                        {activeTab === 'TEAM' && <UserManagement />}
                        {activeTab === 'WORKFLOWS' && <WorkflowBuilder />}
                        {activeTab === 'AUDIT' && <AuditLogViewer />}
                        {activeTab === 'HIERARCHY' && <HierarchyManager />}

                        {!['TEAM', 'WORKFLOWS', 'AUDIT', 'HIERARCHY'].includes(activeTab) && (
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

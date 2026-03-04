"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import UserManagement from "@/components/admin/UserManagement";
import LogoutModal from "@/components/layout/LogoutModal";
import styles from "@/components/layout/Layout.module.css";
import * as OTPAuth from "otpauth";
import QRCode from "qrcode";

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

        // Generate a random 20-character secret
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
                setFormData({ ...formData, twoFactorEnabled: false, twoFactorSecret: "" });
                updateProfile({ ...formData, twoFactorEnabled: false, twoFactorSecret: "" });
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

    if (!user) return <div style={{ padding: '2rem' }}>Loading user data...</div>;

    return (
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
            {/* 2FA Enrollment Modal */}
            {is2FAModalOpen && (
                <div className={styles.modalBackdrop}>
                    <div className="card" style={{
                        maxWidth: '450px',
                        width: '100%',
                        padding: '2.5rem',
                        textAlign: 'center',
                        position: 'relative',
                        margin: 'auto'
                    }}>
                        <button
                            onClick={() => setIs2FAModalOpen(false)}
                            style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.2rem' }}
                        >
                            ✕
                        </button>

                        <div style={{
                            width: '64px',
                            height: '64px',
                            background: 'var(--success-soft)',
                            color: 'var(--success)',
                            borderRadius: '20px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '2rem',
                            margin: '0 auto 1.5rem auto'
                        }}>
                            📱
                        </div>

                        <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.75rem' }}>Set Up 2FA</h2>
                        <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem', fontSize: '0.9rem' }}>
                            Scan the QR code below with your Authenticator app (Google Authenticator, Authy, etc.) to secure your account.
                        </p>

                        <div style={{
                            width: '200px',
                            height: '200px',
                            background: 'white',
                            margin: '0 auto 1.5rem auto',
                            padding: '1rem',
                            border: '1px solid var(--border)',
                            borderRadius: '16px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}>
                            {qrCodeUrl ? (
                                <img src={qrCodeUrl} alt="2FA QR Code" style={{ width: '100%', height: '100%' }} />
                            ) : (
                                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Generating QR...</div>
                            )}
                        </div>

                        <div style={{ marginBottom: '1.5rem' }}>
                            <code style={{
                                background: 'var(--surface-hover)',
                                padding: '0.5rem 1rem',
                                borderRadius: '8px',
                                fontSize: '0.8rem',
                                color: 'var(--brand)',
                                fontWeight: 700
                            }}>
                                {tempSecret}
                            </code>
                        </div>

                        <div style={{ textAlign: 'left', marginBottom: '1.5rem' }}>
                            <label style={{ fontSize: '0.8rem', fontWeight: 700, display: 'block', marginBottom: '0.5rem' }}>Enter 6-Digit Code</label>
                            <input
                                type="text"
                                placeholder="000000"
                                maxLength={6}
                                value={verificationCode}
                                style={{
                                    textAlign: 'center',
                                    letterSpacing: '0.5rem',
                                    fontSize: '1.5rem',
                                    fontWeight: 800,
                                    border: verificationError ? '2px solid var(--error)' : '2px solid var(--border)',
                                    borderRadius: '12px'
                                }}
                                onChange={(e) => setVerificationCode(e.target.value)}
                            />
                            {verificationError && (
                                <p style={{ color: 'var(--error)', fontSize: '0.75rem', marginTop: '0.5rem', fontWeight: 600 }}>
                                    {verificationError}
                                </p>
                            )}
                        </div>

                        <button
                            className="btn btn-primary"
                            style={{ width: '100%', padding: '0.875rem' }}
                            onClick={verifyAndEnable2FA}
                            disabled={verificationCode.length < 6}
                        >
                            Verify & Enable
                        </button>
                    </div>
                </div>
            )}
            <div style={{ marginBottom: '2.5rem' }}>
                <h1 style={{ fontSize: '2.2rem', fontWeight: 800, marginBottom: '0.5rem' }}>Account Hub</h1>
                <p style={{ color: 'var(--text-secondary)' }}>Manage your professional identity, security protocols, and preferences.</p>
            </div>

            <div style={{ display: 'flex', gap: '2rem', alignItems: 'flex-start' }}>
                {/* Fixed Navigation Sidebar */}
                <div style={{ width: '240px', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <button
                        onClick={() => setActiveTab('PROFILE')}
                        className={`${styles.navLink} ${activeTab === 'PROFILE' ? styles.navLinkActive : ''}`}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', width: '100%' }}
                    >
                        <span className={styles.navIcon}>👤</span> Profile Details
                    </button>
                    <button
                        onClick={() => setActiveTab('SECURITY')}
                        className={`${styles.navLink} ${activeTab === 'SECURITY' ? styles.navLinkActive : ''}`}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', width: '100%' }}
                    >
                        <span className={styles.navIcon}>🛡️</span> Security & Privacy
                    </button>
                    <button
                        onClick={() => setActiveTab('NOTIFICATIONS')}
                        className={`${styles.navLink} ${activeTab === 'NOTIFICATIONS' ? styles.navLinkActive : ''}`}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', width: '100%' }}
                    >
                        <span className={styles.navIcon}>🔔</span> Notifications
                    </button>

                    {(user.role === 'ADMIN' || user.role === 'SUPERUSER') && (
                        <>
                            <div style={{ margin: '1.5rem 0 0.5rem 0', padding: '0 1rem', fontSize: '0.65rem', fontWeight: 800, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Administrative</div>
                            <button
                                onClick={() => setActiveTab('AUDIT')}
                                className={`${styles.navLink} ${activeTab === 'AUDIT' ? styles.navLinkActive : ''}`}
                                style={{ background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', width: '100%' }}
                            >
                                <span className={styles.navIcon}>📜</span> Security Audit Log
                            </button>
                            <button
                                onClick={() => setActiveTab('HIERARCHY')}
                                className={`${styles.navLink} ${activeTab === 'HIERARCHY' ? styles.navLinkActive : ''}`}
                                style={{ background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', width: '100%' }}
                            >
                                <span className={styles.navIcon}>🏢</span> Organizational Hierarchy
                            </button>
                            <button
                                onClick={() => setActiveTab('WORKFLOWS')}
                                className={`${styles.navLink} ${activeTab === 'WORKFLOWS' ? styles.navLinkActive : ''}`}
                                style={{ background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', width: '100%' }}
                            >
                                <span className={styles.navIcon}>⚡</span> Workflow Designer
                            </button>
                            <button
                                onClick={() => setActiveTab('TEAM')}
                                className={`${styles.navLink} ${activeTab === 'TEAM' ? styles.navLinkActive : ''}`}
                                style={{ background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', width: '100%' }}
                            >
                                <span className={styles.navIcon}>👥</span> Team Management
                            </button>
                        </>
                    )}
                    <div style={{ marginTop: 'auto', paddingTop: '2rem' }}>
                        <button
                            onClick={() => setIsLogoutModalOpen(true)}
                            className={styles.navLink}
                            style={{ background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', width: '100%', color: 'var(--error)' }}
                        >
                            <span className={styles.navIcon}>🚪</span> Sign Out
                        </button>
                    </div>
                </div>

                {/* Main Content Area */}
                <div style={{ flex: 1 }}>
                    <div className="card" style={{ padding: '2.5rem', borderRadius: '24px' }}>
                        {activeTab === 'PROFILE' && (
                            <div style={{ animation: 'fadeIn 0.3s ease-out' }}>
                                <div style={{ display: 'flex', gap: '2.5rem', marginBottom: '2.5rem', alignItems: 'center' }}>
                                    <div style={{
                                        width: '100px',
                                        height: '100px',
                                        borderRadius: '30px',
                                        background: 'linear-gradient(135deg, var(--brand), var(--brand-dark))',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontSize: '2.5rem',
                                        color: 'white',
                                        fontWeight: 800,
                                        boxShadow: '0 10px 30px rgba(232, 87, 42, 0.2)'
                                    }}>
                                        {user.displayName?.[0] || 'U'}
                                    </div>
                                    <div>
                                        <h3 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 800 }}>{user.displayName}</h3>
                                        <p style={{ margin: '0.25rem 0', color: 'var(--text-secondary)' }}>{user.email}</p>
                                        <div style={{
                                            display: 'inline-block',
                                            padding: '0.25rem 0.75rem',
                                            borderRadius: '20px',
                                            fontSize: '0.7rem',
                                            fontWeight: 800,
                                            backgroundColor: 'var(--success-soft)',
                                            color: 'var(--success)',
                                            marginTop: '0.5rem'
                                        }}>
                                            VERIFIED ENTERPRISE ACCOUNT
                                        </div>
                                    </div>
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                                    <div className="form-group">
                                        <label>Full Name</label>
                                        <input
                                            type="text"
                                            value={formData.displayName}
                                            onChange={e => setFormData({ ...formData, displayName: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Email Address</label>
                                        <input type="email" value={user.email} disabled style={{ backgroundColor: 'rgba(0,0,0,0.02)', cursor: 'not-allowed' }} />
                                    </div>
                                    <div className="form-group">
                                        <label>Job Title</label>
                                        <input
                                            type="text"
                                            placeholder="e.g. Procurement Manager"
                                            value={formData.jobTitle}
                                            onChange={e => setFormData({ ...formData, jobTitle: e.target.value })}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Phone Number</label>
                                        <input
                                            type="tel"
                                            placeholder="+1 (555) 000-0000"
                                            value={formData.phone}
                                            onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div className="form-group" style={{ marginTop: '1.5rem' }}>
                                    <label>Professional Bio</label>
                                    <textarea
                                        rows={4}
                                        placeholder="Describe your role and expertise..."
                                        value={formData.bio}
                                        onChange={e => setFormData({ ...formData, bio: e.target.value })}
                                    />
                                </div>
                            </div>
                        )}

                        {activeTab === 'SECURITY' && (
                            <div style={{ animation: 'fadeIn 0.3s ease-out' }}>
                                <h3 style={{ marginBottom: '1.5rem', fontSize: '1.25rem', fontWeight: 700 }}>Security Authentication</h3>

                                <div style={{
                                    padding: '1.5rem',
                                    borderRadius: '16px',
                                    border: '1px solid var(--border)',
                                    backgroundColor: 'rgba(0,0,0,0.02)',
                                    marginBottom: '2rem'
                                }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <div>
                                            <h4 style={{ margin: 0, fontWeight: 700 }}>
                                                Two-Factor Authentication (2FA)
                                                <span style={{
                                                    marginLeft: '0.75rem',
                                                    fontSize: '0.7rem',
                                                    color: formData.twoFactorEnabled ? 'var(--success)' : 'var(--text-secondary)',
                                                    background: formData.twoFactorEnabled ? 'var(--success-soft)' : 'var(--surface-hover)',
                                                    padding: '2px 8px',
                                                    borderRadius: '10px'
                                                }}>
                                                    {formData.twoFactorEnabled ? 'PROTECTED' : 'NOT ENABLED'}
                                                </span>
                                            </h4>
                                            <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                                                Add an extra layer of security to your enterprise account.
                                            </p>
                                        </div>
                                        <div
                                            onClick={handle2FAToggle}
                                            style={{
                                                width: '50px',
                                                height: '26px',
                                                borderRadius: '13px',
                                                backgroundColor: formData.twoFactorEnabled ? 'var(--success)' : 'var(--border)',
                                                position: 'relative',
                                                cursor: 'pointer',
                                                transition: 'all 0.3s'
                                            }}
                                        >
                                            <div style={{
                                                width: '20px',
                                                height: '20px',
                                                borderRadius: '50%',
                                                backgroundColor: 'white',
                                                position: 'absolute',
                                                top: '3px',
                                                left: formData.twoFactorEnabled ? '27px' : '3px',
                                                transition: 'all 0.3s'
                                            }} />
                                        </div>
                                    </div>
                                </div>

                                <h3 style={{ marginBottom: '1.5rem', fontSize: '1.25rem', fontWeight: 700 }}>Data Privacy</h3>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <div>
                                            <div style={{ fontWeight: 600 }}>Public Profile Visibility</div>
                                            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Allow other users in your organization to see your professional bio.</div>
                                        </div>
                                        <input type="checkbox" defaultChecked />
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <div>
                                            <div style={{ fontWeight: 600 }}>Login History Tracking</div>
                                            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Keep a secure log of all devices and locations used to access your account.</div>
                                        </div>
                                        <input type="checkbox" defaultChecked />
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'NOTIFICATIONS' && (
                            <div style={{ animation: 'fadeIn 0.3s ease-out' }}>
                                <h3 style={{ marginBottom: '1.5rem', fontSize: '1.25rem', fontWeight: 700 }}>Preference Center</h3>

                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                                        <input
                                            type="checkbox"
                                            style={{ marginTop: '0.25rem' }}
                                            checked={formData.securityAlerts}
                                            onChange={e => setFormData({ ...formData, securityAlerts: e.target.checked })}
                                        />
                                        <div>
                                            <div style={{ fontWeight: 700 }}>Critical Security Alerts</div>
                                            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Get notified immediately about password changes or unauthorized login attempts.</div>
                                        </div>
                                    </div>

                                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                                        <input
                                            type="checkbox"
                                            style={{ marginTop: '0.25rem' }}
                                            checked={formData.marketingEmails}
                                            onChange={e => setFormData({ ...formData, marketingEmails: e.target.checked })}
                                        />
                                        <div>
                                            <div style={{ fontWeight: 700 }}>Feature Updates & Product News</div>
                                            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Weekly digest of new enterprise features and spend management best practices.</div>
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
                            <div style={{ marginTop: '3rem', paddingTop: '2rem', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                                {saveSuccess && (
                                    <span style={{ color: 'var(--success)', alignSelf: 'center', fontWeight: 600, fontSize: '0.9rem' }}>
                                        ✓ Changes saved successfully
                                    </span>
                                )}
                                <button
                                    type="button"
                                    onClick={handleSave}
                                    className="btn btn-primary"
                                    disabled={isSaving}
                                    style={{ padding: '0.75rem 2.5rem' }}
                                >
                                    {isSaving ? 'Synchronizing...' : 'Save All Changes'}
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
            <LogoutModal
                isOpen={isLogoutModalOpen}
                onClose={() => setIsLogoutModalOpen(false)}
            />
        </div>
    );
}

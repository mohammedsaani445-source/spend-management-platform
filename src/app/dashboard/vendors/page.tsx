"use client";

import { useEffect, useState } from "react";
import { Vendor } from "@/types";
import { getVendors, addVendor } from "@/lib/vendors";
import { generatePortalLink } from "@/lib/portal";
import { useModal } from "@/context/ModalContext";
import { useAuth } from "@/context/AuthContext";
import VendorDetailModal from "@/components/vendors/VendorDetailModal";
import { useScrollLock } from "@/hooks/useScrollLock";
import Portal from "@/components/common/Portal";
import { X, Plus, Search, Filter, Mail, Phone, MapPin, Globe, CreditCard, ExternalLink, ShieldCheck, Building } from "lucide-react";

const VENDOR_CATEGORIES = ["General", "IT Services", "Office Supplies", "Logistics", "Marketing", "Other"];

function VendorAvatar({ name }: { name: string }) {
    return (
        <div style={{
            width: 36, height: 36, borderRadius: 8, flexShrink: 0,
            background: 'var(--brand-soft)', color: 'var(--brand)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontWeight: 700, fontSize: '0.8125rem'
        }}>
            {name.slice(0, 2).toUpperCase()}
        </div>
    );
}

function StatusPill({ status }: { status: string }) {
    const active = status === 'ACTIVE';
    return (
        <span style={{
            display: 'inline-flex', alignItems: 'center', padding: '2px 10px',
            borderRadius: 9999, fontSize: '0.75rem', fontWeight: 700,
            background: active ? 'var(--success-bg)' : 'var(--error-bg)',
            color: active ? 'var(--success)' : 'var(--error)'
        }}>{status}</span>
    );
}

function ComplianceBadge({ status }: { status?: string }) {
    if (!status) return <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--text-disabled)', display: 'inline-block' }} title="Not verified" />;
    const map: Record<string, { color: string; label: string }> = {
        COMPLIANT:     { color: 'var(--success)', label: 'Compliant' },
        NON_COMPLIANT: { color: 'var(--error)', label: 'Non-compliant' },
        EXPIRING:      { color: 'var(--warning)', label: 'Expiring soon' },
        PENDING:       { color: '#94a3b8', label: 'Pending' },
    };
    const { color, label } = map[status] || { color: '#94a3b8', label: status };
    return (
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.75rem', fontWeight: 600, color }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: color, flexShrink: 0, display: 'inline-block' }} />
            {label}
        </span>
    );
}

const defaultForm = {
    name: "", contactName: "", email: "", phone: "",
    address: "", taxId: "", category: "General",
    paymentMethod: "ACH" as "ACH" | "WIRE" | "STRIPE" | "PLUG",
    directPayEnabled: false
};

export default function VendorsPage() {
    const { user } = useAuth();
    const { showAlert, showError } = useModal();
    const [vendors, setVendors] = useState<Vendor[]>([]);
    const [loading, setLoading] = useState(true);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null);
    const [search, setSearch] = useState('');
    const [formData, setFormData] = useState(defaultForm);

    const [sendingPortalFor, setSendingPortalFor] = useState<string | null>(null);

    useScrollLock(isFormOpen);

    const fetchVendors = async () => {
        if (!user) return;
        setLoading(true);
        const data = await getVendors(user.tenantId);
        setVendors(data.sort((a, b) => a.name.localeCompare(b.name)));
        setLoading(false);
    };

    useEffect(() => { if (user) fetchVendors(); }, [user]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;
        try {
            await addVendor(user.tenantId, { ...formData, status: 'ACTIVE' });
            setIsFormOpen(false);
            setFormData(defaultForm);
            await showAlert("Success", "Vendor added successfully.");
            fetchVendors();
        } catch (error: any) {
            await showError("Error", `Error adding vendor: ${error.message || "Unknown error"}`);
        }
    };

    const handleSendPortalLink = async (vendor: Vendor) => {
        if (!user || !vendor.id) return;
        try {
            const link = await generatePortalLink(user.tenantId, vendor.id);
            await navigator.clipboard.writeText(link);
            await showAlert("Portal Link Copied", `Secure portal link for ${vendor.name} has been copied to your clipboard. It expires in 7 days.\n\n${link}`);
        } catch (error: any) {
            await showError("Error", `Failed to generate portal link: ${error.message}`);
        }
    };

    const filtered = vendors.filter(v =>
        v.name.toLowerCase().includes(search.toLowerCase()) ||
        v.email.toLowerCase().includes(search.toLowerCase()) ||
        (v.category || '').toLowerCase().includes(search.toLowerCase())
    );

    const activeCount = vendors.filter(v => v.status === 'ACTIVE').length;

    return (
        <div className="page-container">
            {/* Header */}
            <div className="page-header">
                <div>
                    <h1 className="page-title">Vendors</h1>
                    <p className="page-subtitle">Manage supplier relationships and performance</p>
                </div>
                <button className="btn btn-primary" onClick={() => setIsFormOpen(true)}>
                    + Add Vendor
                </button>
            </div>

            {/* Stats strip */}
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
                {[
                    { label: 'Total Vendors', value: vendors.length, color: 'var(--brand)', bg: 'var(--brand-soft)' },
                    { label: 'Active', value: activeCount, color: 'var(--success)', bg: 'var(--success-bg)' },
                    { label: 'Inactive', value: vendors.length - activeCount, color: 'var(--text-secondary)', bg: 'var(--surface-hover)' },
                ].map(s => (
                    <div key={s.label} style={{
                        background: 'white', border: '1px solid var(--border)', borderRadius: 10,
                        padding: '1rem 1.25rem', display: 'flex', alignItems: 'center', gap: '0.875rem',
                        borderTop: `4px solid ${s.color}`
                    }}>
                        <div style={{ width: 36, height: 36, background: s.bg, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', color: s.color, fontWeight: 700, fontSize: '1rem' }}>
                            {s.value}
                        </div>
                        <span style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', fontWeight: 500 }}>{s.label}</span>
                    </div>
                ))}
            </div>

            {/* Search */}
            <div style={{ position: 'relative', marginBottom: '1rem', maxWidth: 400 }}>
                <span style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center' }}>
                    <Search size={16} />
                </span>
                <input
                    value={search} onChange={e => setSearch(e.target.value)}
                    placeholder="Search vendors..."
                    className="form-input" style={{ paddingLeft: '2.25rem' }}
                />
            </div>

            {/* Table */}
            {loading ? (
                <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>Loading vendors...</div>
            ) : filtered.length === 0 ? (
                <div className="card">
                    <div className="empty-state">
                        <div className="empty-state-icon" style={{ background: 'var(--brand-soft)', color: 'var(--brand)' }}>
                            <Building size={40} />
                        </div>
                        <h3>{vendors.length === 0 ? 'No vendors yet' : 'No results found'}</h3>
                        <p>{vendors.length === 0 ? 'Add your first vendor to get started.' : 'Try adjusting your search.'}</p>
                        {vendors.length === 0 && <button className="btn btn-primary" onClick={() => setIsFormOpen(true)}>Add Vendor</button>}
                    </div>
                </div>
            ) : (
                <div className="table-wrapper">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Company</th>
                                <th>Contact</th>
                                <th>Email</th>
                                <th>Category</th>
                                <th>Payment</th>
                                <th>Compliance</th>
                                <th>Status</th>
                                <th></th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.map(vendor => (
                                <tr key={vendor.id} onClick={() => setSelectedVendor(vendor)} style={{ cursor: 'pointer' }}>
                                    <td>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                            <VendorAvatar name={vendor.name} />
                                            <span style={{ fontWeight: 600 }}>{vendor.name}</span>
                                        </div>
                                    </td>
                                    <td>{vendor.contactName}</td>
                                    <td style={{ color: 'var(--text-secondary)' }}>{vendor.email}</td>
                                    <td>
                                        <span style={{ fontSize: '0.8125rem', background: 'var(--surface-hover)', color: 'var(--text-secondary)', padding: '2px 8px', borderRadius: 6, fontWeight: 500 }}>
                                            {vendor.category || 'General'}
                                        </span>
                                    </td>
                                    <td style={{ color: 'var(--text-secondary)', fontSize: '0.8125rem' }}>{vendor.paymentMethod || 'ACH'}</td>
                                    <td><ComplianceBadge status={vendor.complianceStatus} /></td>
                                    <td><StatusPill status={vendor.status} /></td>
                                    <td>
                                        <button className="btn btn-ghost btn-sm" onClick={e => { e.stopPropagation(); setSelectedVendor(vendor); }}>
                                            View →
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Detail Modal */}
            {selectedVendor && (
                <VendorDetailModal
                    vendor={selectedVendor}
                    onClose={() => setSelectedVendor(null)}
                    onUpdate={() => fetchVendors()}
                    onEdit={v => {
                        setFormData({ name: v.name, contactName: v.contactName, email: v.email, phone: v.phone || "", address: v.address || "", taxId: v.taxId || "", category: v.category || "General", paymentMethod: v.paymentMethod || "ACH", directPayEnabled: v.directPayEnabled || false });
                        setSelectedVendor(null);
                        setIsFormOpen(true);
                    }}
                    onSendPortalLink={() => handleSendPortalLink(selectedVendor)}
                />
            )}

            {/* Add Modal */}
            {isFormOpen && (
                <Portal>
                    <div className="modal-backdrop" style={{ animation: "fadeIn 0.2s ease-out" }}>
                        <div className="modal" style={{ maxWidth: 540, width: "95%", maxHeight: '90vh', display: 'flex', flexDirection: 'column', animation: "slideUp 0.3s ease-out", padding: 0, overflow: 'hidden' }}>
                            <div className="modal-header" style={{ padding: "1.25rem 1.5rem", borderBottom: "1px solid var(--border)", background: "var(--surface-hover)", flexShrink: 0 }}>
                                <h2 className="modal-title" style={{ margin: 0, fontSize: "1.25rem" }}>Add New Vendor</h2>
                                <button onClick={() => setIsFormOpen(false)} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', transition: 'color 0.15s' }} onMouseEnter={e => e.currentTarget.style.color = 'var(--text-primary)'} onMouseLeave={e => e.currentTarget.style.color = 'var(--text-secondary)'}><X size={24} /></button>
                            </div>
                            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
                                <div className="modal-body" style={{ display: 'grid', gap: '1.25rem', padding: '1.5rem', overflowY: 'auto', flex: 1 }}>
                                    {[
                                        { label: 'Company Name *', key: 'name', type: 'text', required: true },
                                        { label: 'Contact Name *', key: 'contactName', type: 'text', required: true },
                                        { label: 'Email *', key: 'email', type: 'email', required: true },
                                        { label: 'Phone', key: 'phone', type: 'tel', required: false },
                                        { label: 'Address', key: 'address', type: 'text', required: false },
                                        { label: 'Tax ID', key: 'taxId', type: 'text', required: false },
                                    ].map(f => (
                                        <div key={f.key}>
                                            <label className="form-label" style={{ fontWeight: 700, fontSize: '0.85rem', marginBottom: '0.5rem', display: 'block' }}>{f.label}</label>
                                            <input
                                                required={f.required} type={f.type} className="form-input"
                                                style={{ borderRadius: '10px' }}
                                                value={(formData as any)[f.key]}
                                                onChange={e => setFormData({ ...formData, [f.key]: e.target.value })}
                                            />
                                        </div>
                                    ))}
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                        <div>
                                            <label className="form-label" style={{ fontWeight: 700, fontSize: '0.85rem', marginBottom: '0.5rem', display: 'block' }}>Category</label>
                                            <select className="form-select" style={{ borderRadius: '10px' }} value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })}>
                                                {VENDOR_CATEGORIES.map(c => <option key={c}>{c}</option>)}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="form-label" style={{ fontWeight: 700, fontSize: '0.85rem', marginBottom: '0.5rem', display: 'block' }}>Payment Method</label>
                                            <select className="form-select" style={{ borderRadius: '10px' }} value={formData.paymentMethod} onChange={e => setFormData({ ...formData, paymentMethod: e.target.value as any })}>
                                                <option value="ACH">ACH Transfer</option>
                                                <option value="WIRE">Wire Transfer</option>
                                                <option value="STRIPE">Stripe Connect</option>
                                                <option value="PLUG">Direct Pay Plug</option>
                                            </select>
                                        </div>
                                    </div>
                                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.9rem', cursor: 'pointer', background: 'var(--background)', padding: '0.75rem', borderRadius: '10px', transition: 'background 0.2s' }} onMouseEnter={e => e.currentTarget.style.background = 'var(--brand-soft)'} onMouseLeave={e => e.currentTarget.style.background = 'var(--background)'}>
                                        <input type="checkbox" style={{ width: 18, height: 18, accentColor: 'var(--brand)' }} checked={formData.directPayEnabled} onChange={e => setFormData({ ...formData, directPayEnabled: e.target.checked })} />
                                        <span style={{ fontWeight: 600 }}>Enable Direct Pay on Approval</span>
                                    </label>
                                </div>
                                <div className="modal-footer" style={{ padding: "1.25rem 1.5rem", borderTop: "1px solid var(--border)", background: "var(--surface-hover)", flexShrink: 0 }}>
                                    <button type="button" className="btn btn-secondary" onClick={() => setIsFormOpen(false)}>Cancel</button>
                                    <button type="submit" className="btn btn-primary" style={{ minWidth: '120px' }}>Save Vendor</button>
                                </div>
                            </form>
                        </div>
                    </div>
                </Portal>
            )}
        </div>
    );
}

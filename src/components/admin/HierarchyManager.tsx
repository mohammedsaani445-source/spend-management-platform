"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { Location, Department, AppUser } from "@/types";
import { getLocations, saveLocation, deleteLocation } from "@/lib/locations";
import { getDepartments, saveDepartment, deleteDepartment } from "@/lib/departments";
import { getAllUsers } from "@/lib/users";
import { useModal } from "@/context/ModalContext";
import {
    Building2, Users, MapPin, Plus,
    Pencil, Trash2, Save, X, Network,
    AlertCircle, ChevronRight, Clock
} from "lucide-react";
import styles from "@/app/dashboard/settings/Settings.module.css";

export default function HierarchyManager() {
    const { user } = useAuth();
    const { showConfirm, showError } = useModal();
    const [locations, setLocations] = useState<Location[]>([]);
    const [departments, setDepartments] = useState<Department[]>([]);
    const [users, setUsers] = useState<AppUser[]>([]);
    const [loading, setLoading] = useState(true);
    const [view, setView] = useState<'LIST' | 'LOCATION_EDIT' | 'DEPT_EDIT'>('LIST');

    const [editingLocation, setEditingLocation] = useState<Partial<Location> | null>(null);
    const [editingDept, setEditingDept] = useState<Partial<Department> | null>(null);

    const fetchData = async () => {
        if (!user) return;
        setLoading(true);
        try {
            const [locs, depts, allUsers] = await Promise.all([
                getLocations(user.tenantId),
                getDepartments(user.tenantId),
                getAllUsers(user.tenantId)
            ]);
            setLocations(locs);
            setDepartments(depts);
            setUsers(allUsers);
        } catch (e) {
            console.error("Error fetching hierarchy data:", e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [user]);

    const handleSaveLocation = async () => {
        if (!user || !editingLocation?.name) {
            showError("Validation Error", "Location name is required.");
            return;
        }
        try {
            await saveLocation(user.tenantId, editingLocation as any);
            setView('LIST');
            fetchData();
        } catch (e) {
            showError("Error", "Failed to save location.");
        }
    };

    const handleSaveDept = async () => {
        if (!user || !editingDept?.name || !editingDept?.locationId) {
            if (!editingDept?.name) showError("Validation Error", "Department name is required.");
            if (!editingDept?.locationId) showError("Validation Error", "Please select a location for this department.");
            return;
        }
        try {
            await saveDepartment(user.tenantId, editingDept as any);
            setView('LIST');
            fetchData();
        } catch (e) {
            showError("Error", "Failed to save department. Please check your connection and try again.");
        }
    };

    const handleDeleteLoc = async (id: string, name: string) => {
        if (!user) return;
        const confirmed = await showConfirm(
            "Delete Location",
            `Are you sure you want to delete ${name}? This will remove the location record and may affect associated departments.`
        );
        if (confirmed) {
            await deleteLocation(user.tenantId, id);
            fetchData();
        }
    };

    const handleDeleteDept = async (id: string, name: string) => {
        if (!user) return;
        const confirmed = await showConfirm(
            "Delete Department",
            `Are you sure you want to delete the ${name} department? This cannot be undone.`
        );
        if (confirmed) {
            await deleteDepartment(user.tenantId, id);
            fetchData();
        }
    };

    if (loading) return <div style={{ padding: '2.5rem', textAlign: 'center', color: '#6B7280' }}>Loading organizational data...</div>;

    return (
        <div style={{ animation: 'fadeIn 0.3s ease-out' }}>
            {view === 'LIST' && (
                <>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
                        <div>
                            <h3 className={styles.sectionTitle} style={{ marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <Network size={22} color="var(--brand)" /> Organizational Hierarchy
                            </h3>
                            <p className={styles.subtitle}>Manage physical locations and departmental structures.</p>
                        </div>
                        <div style={{ display: 'flex', gap: '1rem' }}>
                            <button
                                className={styles.secondaryButton}
                                onClick={() => {
                                    setEditingLocation({ name: "", isActive: true });
                                    setView('LOCATION_EDIT');
                                }}
                            >
                                <MapPin size={18} /> Add Location
                            </button>
                            <button
                                className={styles.primaryButton}
                                onClick={() => {
                                    setEditingDept({ name: "", locationId: locations[0]?.id || "", isActive: true });
                                    setView('DEPT_EDIT');
                                }}
                                disabled={locations.length === 0}
                            >
                                <Building2 size={18} /> Add Department
                            </button>
                        </div>
                    </div>

                    {locations.length === 0 && (
                        <div style={{
                            padding: '1.5rem', backgroundColor: '#EFF6FF', color: '#1E40AF',
                            borderRadius: '16px', display: 'flex', alignItems: 'center', gap: '1rem',
                            marginBottom: '2.5rem', border: '1px solid #BFDBFE'
                        }}>
                            <AlertCircle size={24} style={{ flexShrink: 0 }} />
                            <div>
                                <strong style={{ display: 'block', marginBottom: '0.25rem', fontSize: '1rem', fontWeight: 700 }}>Setup Required</strong>
                                <span style={{ fontSize: '0.9375rem', opacity: 0.9 }}>You must create at least one physical location before you can add departments.</span>
                            </div>
                        </div>
                    )}

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))', gap: '2.5rem' }}>
                        {/* Locations Column */}
                        <div className={styles.card} style={{ padding: '0', overflow: 'hidden', height: 'fit-content' }}>
                            <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border)', background: '#F8FAFC', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                    <div style={{ width: 32, height: 32, borderRadius: '8px', background: '#DBEAFE', color: '#2563EB', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <MapPin size={18} />
                                    </div>
                                    <div>
                                        <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 800 }}>Physical Locations</h4>
                                        <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>{locations.length} location{locations.length !== 1 ? 's' : ''}</div>
                                    </div>
                                </div>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                                {locations.length === 0 && (
                                    <div style={{ padding: '4rem 2rem', textAlign: 'center' }}>
                                        <div style={{ background: '#F3F4F6', width: '64px', height: '64px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem auto' }}>
                                            <MapPin size={32} color="#9CA3AF" />
                                        </div>
                                        <h4 style={{ fontWeight: 800, fontSize: '1.125rem', marginBottom: '0.5rem' }}>No locations defined</h4>
                                        <p className={styles.subtitle} style={{ margin: '0 auto' }}>
                                            Add your first office or physical location.
                                        </p>
                                    </div>
                                )}
                                {locations.map((loc, idx) => (
                                    <div key={loc.id} style={{
                                        padding: '1.5rem',
                                        borderBottom: idx === locations.length - 1 ? 'none' : '1px solid var(--border)',
                                        display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
                                        background: '#FFFFFF', transition: 'background-color 0.2s'
                                    }}>
                                        <div>
                                            <div style={{ fontWeight: 800, fontSize: '1.05rem', color: 'var(--text-primary)', marginBottom: '0.375rem' }}>{loc.name}</div>
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                                                {loc.address && (
                                                    <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'flex-start', gap: '0.375rem' }}>
                                                        <MapPin size={14} style={{ marginTop: '0.125rem', flexShrink: 0 }} />
                                                        <span>{loc.address}</span>
                                                    </div>
                                                )}
                                                {loc.timezone && (
                                                    <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                                                        <Clock size={14} />
                                                        <span>{loc.timezone}</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        <div style={{ display: 'flex', gap: '0.375rem' }}>
                                            <button
                                                onClick={() => { setEditingLocation(loc); setView('LOCATION_EDIT'); }}
                                                className={styles.iconButton}
                                                style={{ padding: '0.5rem', width: 'auto', height: 'auto', borderRadius: '8px' }}
                                                title="Edit Location"
                                            >
                                                <Pencil size={18} />
                                            </button>
                                            <button
                                                onClick={() => handleDeleteLoc(loc.id, loc.name)}
                                                className={styles.iconButton}
                                                style={{ padding: '0.5rem', width: 'auto', height: 'auto', borderRadius: '8px', color: '#EF4444' }}
                                                title="Delete  Location"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Departments Column */}
                        <div className={styles.card} style={{ padding: '0', overflow: 'hidden', height: 'fit-content' }}>
                            <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border)', background: '#F8FAFC', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                    <div style={{ width: 32, height: 32, borderRadius: '8px', background: '#E0E7FF', color: '#4F46E5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <Building2 size={18} />
                                    </div>
                                    <div>
                                        <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 800 }}>Departments</h4>
                                        <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>{departments.length} department{departments.length !== 1 ? 's' : ''}</div>
                                    </div>
                                </div>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                                {departments.length === 0 && (
                                    <div style={{ padding: '4rem 2rem', textAlign: 'center' }}>
                                        <div style={{ background: '#F3F4F6', width: '64px', height: '64px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem auto' }}>
                                            <Building2 size={32} color="#9CA3AF" />
                                        </div>
                                        <h4 style={{ fontWeight: 800, fontSize: '1.125rem', marginBottom: '0.5rem' }}>No departments defined</h4>
                                        <p className={styles.subtitle} style={{ margin: '0 auto' }}>
                                            {locations.length === 0 ? "Add a location first to create departments." : "Create your first department."}
                                        </p>
                                    </div>
                                )}
                                {departments.map((dept, idx) => {
                                    const locName = locations.find(l => l.id === dept.locationId)?.name || 'Unknown Location';
                                    const managerName = users.find(u => u.uid === dept.managerId)?.displayName || 'No Manager Assigned';

                                    return (
                                        <div key={dept.id} style={{
                                            padding: '1.5rem',
                                            borderBottom: idx === departments.length - 1 ? 'none' : '1px solid var(--border)',
                                            display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
                                            background: '#FFFFFF', transition: 'background-color 0.2s'
                                        }}>
                                            <div style={{ flex: 1, paddingRight: '1rem' }}>
                                                <div style={{ fontWeight: 800, fontSize: '1.05rem', color: 'var(--text-primary)', marginBottom: '0.375rem' }}>{dept.name}</div>
                                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
                                                    <div style={{ fontSize: '0.8125rem', display: 'flex', alignItems: 'center', gap: '0.375rem', color: 'var(--text-main)' }}>
                                                        <MapPin size={14} color="#9CA3AF" />
                                                        <span style={{ fontWeight: 600 }}>{locName}</span>
                                                    </div>
                                                    <div style={{ fontSize: '0.8125rem', display: 'flex', alignItems: 'center', gap: '0.375rem', color: 'var(--text-main)' }}>
                                                        <Users size={14} color="#9CA3AF" />
                                                        <span style={{ color: 'var(--text-secondary)' }}>Manager: </span>
                                                        <span style={{ fontWeight: 600 }}>{managerName}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div style={{ display: 'flex', gap: '0.375rem', flexShrink: 0 }}>
                                                <button
                                                    onClick={() => { setEditingDept(dept); setView('DEPT_EDIT'); }}
                                                    className={styles.iconButton}
                                                    style={{ padding: '0.5rem', width: 'auto', height: 'auto', borderRadius: '8px' }}
                                                    title="Edit Department"
                                                >
                                                    <Pencil size={18} />
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteDept(dept.id, dept.name)}
                                                    className={styles.iconButton}
                                                    style={{ padding: '0.5rem', width: 'auto', height: 'auto', borderRadius: '8px', color: '#EF4444' }}
                                                    title="Delete Department"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </>
            )}

            {view === 'LOCATION_EDIT' && (
                <div style={{ maxWidth: '600px', margin: '0 auto', animation: 'fadeIn 0.2s ease-out' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2rem' }}>
                        <button
                            onClick={() => setView('LIST')}
                            className={styles.iconButton}
                            title="Back to List"
                        >
                            <X size={20} />
                        </button>
                        <h4 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 800 }}>
                            {editingLocation?.id ? 'Edit Location' : 'Create New Location'}
                        </h4>
                    </div>

                    <div className={styles.card} style={{ padding: '2.5rem' }}>
                        <div className={styles.formGroup} style={{ marginBottom: '1.5rem' }}>
                            <label className={styles.label}>Location Name *</label>
                            <input
                                type="text"
                                className={styles.input}
                                value={editingLocation?.name || ""}
                                onChange={e => setEditingLocation({ ...editingLocation, name: e.target.value })}
                                placeholder="e.g. Headquarters, London Office"
                                autoFocus
                            />
                        </div>
                        <div className={styles.formGroup} style={{ marginBottom: '1.5rem' }}>
                            <label className={styles.label}>Physical Address (Optional)</label>
                            <input
                                type="text"
                                className={styles.input}
                                value={editingLocation?.address || ""}
                                onChange={e => setEditingLocation({ ...editingLocation, address: e.target.value })}
                                placeholder="e.g. 123 Business Rd, Suite 100"
                            />
                        </div>
                        <div className={styles.formGroup} style={{ marginBottom: '2.5rem' }}>
                            <label className={styles.label}>Timezone (Optional)</label>
                            <input
                                type="text"
                                className={styles.input}
                                value={editingLocation?.timezone || ""}
                                onChange={e => setEditingLocation({ ...editingLocation, timezone: e.target.value })}
                                placeholder="e.g. America/Toronto"
                            />
                        </div>

                        <div style={{ display: 'flex', gap: '1rem', paddingTop: '2rem', borderTop: '1px solid var(--border)', justifyContent: 'flex-end' }}>
                            <button className={styles.secondaryButton} onClick={() => setView('LIST')}>
                                Cancel
                            </button>
                            <button className={styles.primaryButton} onClick={handleSaveLocation} disabled={!editingLocation?.name}>
                                <Save size={18} /> {editingLocation?.id ? 'Save Changes' : 'Create Location'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {view === 'DEPT_EDIT' && (
                <div style={{ maxWidth: '600px', margin: '0 auto', animation: 'fadeIn 0.2s ease-out' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2rem' }}>
                        <button
                            onClick={() => setView('LIST')}
                            className={styles.iconButton}
                            title="Back to List"
                        >
                            <X size={20} />
                        </button>
                        <h4 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 800 }}>
                            {editingDept?.id ? 'Edit Department' : 'Create New Department'}
                        </h4>
                    </div>

                    <div className={styles.card} style={{ padding: '2.5rem' }}>
                        <div className={styles.formGroup} style={{ marginBottom: '1.5rem' }}>
                            <label className={styles.label}>Department Name *</label>
                            <input
                                type="text"
                                className={styles.input}
                                value={editingDept?.name || ""}
                                onChange={e => setEditingDept({ ...editingDept, name: e.target.value })}
                                placeholder="e.g. Engineering, Marketing, Finance"
                                autoFocus
                            />
                        </div>

                        <div className={styles.formGroup} style={{ marginBottom: '1.5rem' }}>
                            <label className={styles.label}>Physical Location *</label>
                            <select
                                className={styles.input}
                                value={editingDept?.locationId || ""}
                                onChange={e => setEditingDept({ ...editingDept, locationId: e.target.value })}
                            >
                                <option value="" disabled>Select a location...</option>
                                {locations.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
                            </select>
                        </div>

                        <div className={styles.formGroup} style={{ marginBottom: '2.5rem' }}>
                            <label className={styles.label}>Department Manager</label>
                            <select
                                className={styles.input}
                                value={editingDept?.managerId || ""}
                                onChange={e => setEditingDept({ ...editingDept, managerId: e.target.value })}
                            >
                                <option value="">No Manager Assigned</option>
                                {users.map(u => <option key={u.uid} value={u.uid}>{u.displayName || 'Standard User'} ({u.email})</option>)}
                            </select>
                            <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                                Managers automatically inherit approval rights for their department's requests.
                            </p>
                        </div>

                        <div style={{ display: 'flex', gap: '1rem', paddingTop: '2rem', borderTop: '1px solid var(--border)', justifyContent: 'flex-end' }}>
                            <button className={styles.secondaryButton} onClick={() => setView('LIST')}>
                                Cancel
                            </button>
                            <button
                                className={styles.primaryButton}
                                onClick={handleSaveDept}
                                disabled={!editingDept?.name || !editingDept?.locationId}
                            >
                                <Save size={18} /> {editingDept?.id ? 'Save Changes' : 'Create Department'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

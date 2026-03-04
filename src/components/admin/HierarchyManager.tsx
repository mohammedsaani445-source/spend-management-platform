"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { Location, Department, AppUser } from "@/types";
import { getLocations, saveLocation, deleteLocation } from "@/lib/locations";
import { getDepartments, saveDepartment, deleteDepartment } from "@/lib/departments";
import { getAllUsers } from "@/lib/users";
import { useModal } from "@/context/ModalContext";

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
        if (!user || !editingLocation?.name) return;
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

    const handleDeleteLoc = async (id: string) => {
        if (!user) return;
        const confirmed = await showConfirm("Delete Location", "Are you sure? This will remove the location record.");
        if (confirmed) {
            await deleteLocation(user.tenantId, id);
            fetchData();
        }
    };

    const handleDeleteDept = async (id: string) => {
        if (!user) return;
        const confirmed = await showConfirm("Delete Department", "Are you sure? This will remove the department record.");
        if (confirmed) {
            await deleteDepartment(user.tenantId, id);
            fetchData();
        }
    };

    if (loading) return <div>Loading organizational data...</div>;

    return (
        <div style={{ animation: 'fadeIn 0.3s ease-out' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <div>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0 }}>Organizational Hierarchy</h3>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Manage physical locations and departmental structures.</p>
                </div>
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                    <button
                        className="btn btn-sm"
                        onClick={() => {
                            setEditingLocation({ name: "", isActive: true });
                            setView('LOCATION_EDIT');
                        }}
                    >
                        + Add Location
                    </button>
                    <button
                        className="btn btn-sm btn-primary"
                        onClick={() => {
                            setEditingDept({ name: "", locationId: locations[0]?.id || "", isActive: true });
                            setView('DEPT_EDIT');
                        }}
                    >
                        + Add Department
                    </button>
                </div>
            </div>

            {locations.length === 0 && (
                <div className="alert alert-info" style={{ marginBottom: '1.5rem', borderRadius: '12px', border: 'none', background: 'var(--info-bg)', color: 'var(--info)', padding: '1rem', fontSize: '0.85rem' }}>
                    <strong>Note:</strong> You must create at least one physical location before you can add departments.
                </div>
            )}

            {view === 'LIST' ? (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                    {/* Locations Column */}
                    <div>
                        <div style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '1rem', letterSpacing: '0.05em' }}>
                            Physical Locations ({locations.length})
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            {locations.length === 0 && <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontStyle: 'italic' }}>No locations defined.</p>}
                            {locations.map(loc => (
                                <div key={loc.id} className="card" style={{ padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div>
                                        <div style={{ fontWeight: 700 }}>{loc.name}</div>
                                        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{loc.timezone || 'Default Timezone'}</div>
                                    </div>
                                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                                        <button className="btn btn-sm" style={{ padding: '0.25rem 0.5rem' }} onClick={() => { setEditingLocation(loc); setView('LOCATION_EDIT'); }}>✎</button>
                                        <button className="btn btn-sm" style={{ padding: '0.25rem 0.5rem', color: 'var(--error)' }} onClick={() => handleDeleteLoc(loc.id)}>✕</button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Departments Column */}
                    <div>
                        <div style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '1rem', letterSpacing: '0.05em' }}>
                            Departments ({departments.length})
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            {departments.length === 0 && <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontStyle: 'italic' }}>No departments defined.</p>}
                            {departments.map(dept => {
                                const locName = locations.find(l => l.id === dept.locationId)?.name || 'Unknown Location';
                                const managerName = users.find(u => u.uid === dept.managerId)?.displayName || 'No Manager';
                                return (
                                    <div key={dept.id} className="card" style={{ padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <div>
                                            <div style={{ fontWeight: 700 }}>{dept.name}</div>
                                            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                                                {locName} • Manager: {managerName}
                                            </div>
                                        </div>
                                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                                            <button className="btn btn-sm" style={{ padding: '0.25rem 0.5rem' }} onClick={() => { setEditingDept(dept); setView('DEPT_EDIT'); }}>✎</button>
                                            <button className="btn btn-sm" style={{ padding: '0.25rem 0.5rem', color: 'var(--error)' }} onClick={() => handleDeleteDept(dept.id)}>✕</button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            ) : view === 'LOCATION_EDIT' ? (
                <div className="card" style={{ padding: '2rem', maxWidth: '500px' }}>
                    <h4 style={{ marginBottom: '1.5rem' }}>{editingLocation?.id ? 'Edit Location' : 'New Location'}</h4>
                    <div className="form-group">
                        <label>Location Name</label>
                        <input
                            type="text"
                            value={editingLocation?.name || ""}
                            onChange={e => setEditingLocation({ ...editingLocation, name: e.target.value })}
                            placeholder="e.g. Head Office, London"
                        />
                    </div>
                    <div className="form-group">
                        <label>Address (Optional)</label>
                        <input
                            type="text"
                            value={editingLocation?.address || ""}
                            onChange={e => setEditingLocation({ ...editingLocation, address: e.target.value })}
                        />
                    </div>
                    <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
                        <button className="btn btn-primary" onClick={handleSaveLocation}>Save Location</button>
                        <button className="btn" onClick={() => setView('LIST')}>Cancel</button>
                    </div>
                </div>
            ) : (
                <div className="card" style={{ padding: '2rem', maxWidth: '500px' }}>
                    <h4 style={{ marginBottom: '1.5rem' }}>{editingDept?.id ? 'Edit Department' : 'New Department'}</h4>
                    <div className="form-group">
                        <label>Department Name</label>
                        <input
                            type="text"
                            value={editingDept?.name || ""}
                            onChange={e => setEditingDept({ ...editingDept, name: e.target.value })}
                            placeholder="e.g. Engineering, Marketing"
                        />
                    </div>
                    <div className="form-group">
                        <label>Location</label>
                        <select
                            value={editingDept?.locationId || ""}
                            onChange={e => setEditingDept({ ...editingDept, locationId: e.target.value })}
                        >
                            <option value="">Select Location...</option>
                            {locations.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
                        </select>
                    </div>
                    <div className="form-group">
                        <label>Department Manager</label>
                        <select
                            value={editingDept?.managerId || ""}
                            onChange={e => setEditingDept({ ...editingDept, managerId: e.target.value })}
                        >
                            <option value="">Select Manager...</option>
                            {users.map(u => <option key={u.uid} value={u.uid}>{u.displayName}</option>)}
                        </select>
                    </div>
                    <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
                        <button
                            className="btn btn-primary"
                            onClick={handleSaveDept}
                            disabled={!editingDept?.name || !editingDept?.locationId}
                        >
                            Save Department
                        </button>
                        <button className="btn" onClick={() => setView('LIST')}>Cancel</button>
                    </div>
                </div>
            )}
        </div>
    );
}

"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Notification } from "@/types";
import { subscribeToNotifications, markNotificationAsRead, markAllAsRead, clearNotifications } from "@/lib/notifications";
import { formatCurrency } from "@/lib/currencies";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function NotificationsPage() {
    const { user } = useAuth();
    const router = useRouter();
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [filter, setFilter] = useState<'ALL' | 'UNREAD'>('ALL');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) return;

        const targetId = user.uid;

        const unsubscribe = subscribeToNotifications(user.tenantId, user.uid, (data) => {
            setNotifications(data);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [user]);

    const filteredNotifications = filter === 'ALL'
        ? notifications
        : notifications.filter(n => !n.read);

    const getIcon = (type: Notification['type']) => {
        switch (type) {
            case 'APPROVAL_REQUEST': return '📝';
            case 'PO_ACKNOWLEDGED': return '✅';
            case 'PO_OPENED': return '👁️';
            case 'BUDGET_ALERT': return '⚠️';
            default: return '🔔';
        }
    };

    if (loading) return <div style={{ padding: '2rem' }}>Loading Notifications...</div>;

    return (
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <div>
                    <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '0.5rem' }}>Notification Center</h1>
                    <p style={{ color: 'var(--text-secondary)' }}>Manage your alerts and system communications.</p>
                </div>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <button
                        className="btn"
                        style={{ backgroundColor: 'white', border: '1px solid var(--border)' }}
                        onClick={() => markAllAsRead(user!.tenantId, user!.uid, notifications)}
                    >
                        Mark all as read
                    </button>
                    <button
                        className="btn btn-primary"
                        style={{ backgroundColor: 'var(--error)', borderColor: 'var(--error)' }}
                        onClick={() => clearNotifications(user!.tenantId, user!.uid, notifications)}
                    >
                        Clear history
                    </button>
                </div>
            </div>

            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                <div style={{
                    display: 'flex',
                    borderBottom: '1px solid var(--border)',
                    padding: '0 1.5rem'
                }}>
                    <button
                        onClick={() => setFilter('ALL')}
                        style={{
                            padding: '1.25rem 1.5rem',
                            background: 'none',
                            border: 'none',
                            borderBottom: filter === 'ALL' ? '2px solid var(--primary)' : '2px solid transparent',
                            color: filter === 'ALL' ? 'var(--primary)' : 'var(--text-secondary)',
                            fontWeight: 600,
                            cursor: 'pointer'
                        }}
                    >
                        All Updates ({notifications.length})
                    </button>
                    <button
                        onClick={() => setFilter('UNREAD')}
                        style={{
                            padding: '1.25rem 1.5rem',
                            background: 'none',
                            border: 'none',
                            borderBottom: filter === 'UNREAD' ? '2px solid var(--primary)' : '2px solid transparent',
                            color: filter === 'UNREAD' ? 'var(--primary)' : 'var(--text-secondary)',
                            fontWeight: 600,
                            cursor: 'pointer'
                        }}
                    >
                        Unread ({notifications.filter(n => !n.read).length})
                    </button>
                </div>

                <div style={{ minHeight: '400px' }}>
                    {filteredNotifications.length === 0 ? (
                        <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                            <div style={{ fontSize: '3rem', marginBottom: '1.5rem' }}>📭</div>
                            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.5rem' }}>
                                No notifications found
                            </h3>
                            <p>You have no {filter === 'UNREAD' ? 'unread' : ''} alerts at this time.</p>
                        </div>
                    ) : (
                        filteredNotifications.map(notif => (
                            <div
                                key={notif.id}
                                style={{
                                    padding: '1.5rem',
                                    borderBottom: '1px solid var(--border)',
                                    display: 'flex',
                                    gap: '1.5rem',
                                    backgroundColor: notif.read ? 'transparent' : 'rgba(4, 156, 99, 0.02)',
                                    cursor: 'pointer',
                                    transition: 'background 0.2s'
                                }}
                                onClick={() => {
                                    markNotificationAsRead(user!.tenantId, notif.id);
                                    if (notif.link) router.push(notif.link);
                                }}
                            >
                                <div style={{
                                    width: '48px',
                                    height: '48px',
                                    borderRadius: '12px',
                                    backgroundColor: 'var(--background)',
                                    border: '1px solid var(--border)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: '1.5rem'
                                }}>
                                    {getIcon(notif.type)}
                                </div>
                                <div style={{ flex: 1 }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                                        <h4 style={{ fontSize: '1rem', fontWeight: 700, margin: 0 }}>{notif.title}</h4>
                                        <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                                            {new Date(notif.createdAt).toLocaleDateString()} at {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    </div>
                                    <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', margin: '0 0 0.5rem 0', lineHeight: 1.5 }}>
                                        {notif.message}
                                    </p>
                                    {!notif.read && (
                                        <span style={{
                                            padding: '0.2rem 0.6rem',
                                            backgroundColor: 'var(--primary)',
                                            color: 'white',
                                            borderRadius: '12px',
                                            fontSize: '0.7rem',
                                            fontWeight: 700
                                        }}>
                                            NEW
                                        </span>
                                    )}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div >
    );
}

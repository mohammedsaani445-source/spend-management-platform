"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Notification } from "@/types";
import { subscribeToNotifications, markNotificationAsRead, markAllAsRead, clearNotifications } from "@/lib/notifications";
import { useRouter } from "next/navigation";
import { Bell, FileSignature, CheckCircle2, Eye, AlertTriangle, Trash2, CheckCheck, Inbox } from "lucide-react";
import styles from "./Notifications.module.css";

export default function NotificationsPage() {
    const { user } = useAuth();
    const router = useRouter();
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [filter, setFilter] = useState<'ALL' | 'UNREAD'>('ALL');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) return;
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
            case 'APPROVAL_REQUEST': return <FileSignature size={24} color="var(--brand)" />;
            case 'PO_ACKNOWLEDGED': return <CheckCircle2 size={24} color="var(--success, #10b981)" />;
            case 'PO_OPENED': return <Eye size={24} color="var(--info, #3b82f6)" />;
            case 'BUDGET_ALERT': return <AlertTriangle size={24} color="var(--warning, #f59e0b)" />;
            default: return <Bell size={24} color="#6B7280" />;
        }
    };

    if (loading) return <div style={{ padding: '2rem', textAlign: 'center', color: '#6B7280' }}>Loading Notification Center...</div>;

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <div>
                    <h1 className={styles.title}>Notification Center</h1>
                    <p className={styles.subtitle}>Manage your alerts, approvals, and system communications.</p>
                </div>
                <div className={styles.actions}>
                    <button
                        className={styles.secondaryButton}
                        onClick={() => markAllAsRead(user!.tenantId, user!.uid, notifications)}
                    >
                        <CheckCheck size={18} /> Mark all as read
                    </button>
                    <button
                        className={styles.dangerButton}
                        onClick={() => clearNotifications(user!.tenantId, user!.uid, notifications)}
                    >
                        <Trash2 size={18} /> Clear history
                    </button>
                </div>
            </div>

            <div className={styles.card}>
                <div className={styles.tabs}>
                    <button
                        onClick={() => setFilter('ALL')}
                        className={`${styles.tab} ${filter === 'ALL' ? styles.tabActive : ''}`}
                    >
                        All Updates <span style={{ opacity: 0.6, fontSize: '0.8rem', marginLeft: '4px' }}>{notifications.length}</span>
                    </button>
                    <button
                        onClick={() => setFilter('UNREAD')}
                        className={`${styles.tab} ${filter === 'UNREAD' ? styles.tabActive : ''}`}
                    >
                        Unread <span style={{ opacity: 0.6, fontSize: '0.8rem', marginLeft: '4px' }}>{notifications.filter(n => !n.read).length}</span>
                    </button>
                </div>

                <div className={styles.list}>
                    {filteredNotifications.length === 0 ? (
                        <div className={styles.emptyState}>
                            <div className={styles.emptyIconWrapper}>
                                {filter === 'UNREAD' ? <CheckCircle2 size={32} /> : <Inbox size={32} />}
                            </div>
                            <h3 className={styles.emptyTitle}>
                                You're all caught up!
                            </h3>
                            <p className={styles.emptyText}>You have no {filter === 'UNREAD' ? 'unread' : ''} alerts at this time.</p>
                        </div>
                    ) : (
                        filteredNotifications.map(notif => (
                            <div
                                key={notif.id}
                                className={`${styles.notificationItem} ${!notif.read ? styles.unread : ''}`}
                                onClick={() => {
                                    markNotificationAsRead(user!.tenantId, notif.id);
                                    if (notif.link) router.push(notif.link);
                                }}
                            >
                                <div className={styles.iconWrapper}>
                                    {getIcon(notif.type)}
                                </div>
                                <div className={styles.content}>
                                    <div className={styles.headerRow}>
                                        <h4 className={styles.itemTitle}>{notif.title}</h4>
                                        <span className={styles.itemTime}>
                                            {new Date(notif.createdAt).toLocaleDateString()} at {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    </div>
                                    <p className={styles.itemMessage}>
                                        {notif.message}
                                    </p>
                                    {!notif.read && (
                                        <span className={styles.badge}>New</span>
                                    )}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}

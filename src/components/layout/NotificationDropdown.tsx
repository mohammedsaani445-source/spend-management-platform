"use client";

import { useEffect, useState, useRef } from "react";
import { useAuth } from "@/context/AuthContext";
import { Notification } from "@/types";
import { subscribeToNotifications, markNotificationAsRead, markAllAsRead, clearNotifications } from "@/lib/notifications";
import styles from "./Layout.module.css";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Bell, FileSignature, CheckCircle2, Eye, AlertTriangle, Inbox } from "lucide-react";

export default function NotificationDropdown() {
    const { user } = useAuth();
    const router = useRouter();
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!user) return;

        // Subscribe to notifications specific to this user's UID and tenant
        const unsubscribe = subscribeToNotifications(user.tenantId, user.uid, (data) => {
            setNotifications(data);
        });

        return () => unsubscribe();
    }, [user]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const unreadCount = notifications.filter(n => !n.read).length;

    const getIcon = (type: Notification['type']) => {
        switch (type) {
            case 'APPROVAL_REQUEST': return <FileSignature size={18} color="var(--brand)" />;
            case 'PO_ACKNOWLEDGED': return <CheckCircle2 size={18} color="var(--success, #10b981)" />;
            case 'PO_OPENED': return <Eye size={18} color="var(--info, #3b82f6)" />;
            case 'BUDGET_ALERT': return <AlertTriangle size={18} color="var(--warning, #f59e0b)" />;
            default: return <Bell size={18} color="var(--text-secondary)" />;
        }
    };

    return (
        <div className={styles.notificationWrapper} ref={dropdownRef}>
            <button
                className={styles.actionButton}
                title="Notifications"
                onClick={() => setIsOpen(!isOpen)}
            >
                <Bell size={20} strokeWidth={1.5} />
                {unreadCount > 0 && <span className={styles.badge}>{unreadCount > 9 ? '9+' : unreadCount}</span>}
            </button>

            {isOpen && (
                <div className={styles.notificationDropdown}>
                    <div className={styles.notificationHeader}>
                        <h3>Notifications</h3>
                        <div className={styles.headerActions}>
                            <button onClick={() => markAllAsRead(user!.tenantId, user!.uid, notifications)}>Mark all as read</button>
                            <span className={styles.notificationSeparator}>•</span>
                            <button onClick={() => clearNotifications(user!.tenantId, user!.uid, notifications)}>Clear all</button>
                        </div>
                    </div>

                    <div className={styles.notificationList}>
                        {notifications.length === 0 ? (
                            <div className={styles.emptyNotifications}>
                                <div className={styles.emptyNotificationsIcon}>
                                    <CheckCircle2 size={24} strokeWidth={1.5} />
                                </div>
                                <p>You're all caught up!</p>
                            </div>
                        ) : (
                            notifications.map(notif => (
                                <div
                                    key={notif.id}
                                    className={`${styles.notificationItem} ${!notif.read ? styles.unread : ''}`}
                                    onClick={() => {
                                        markNotificationAsRead(user!.tenantId, notif.id);
                                        if (notif.link) router.push(notif.link);
                                        setIsOpen(false);
                                    }}
                                >
                                    <div className={styles.notifIcon}>{getIcon(notif.type)}</div>
                                    <div className={styles.notifContent}>
                                        <div className={styles.notifTitle}>{notif.title}</div>
                                        <div className={styles.notifMessage}>{notif.message}</div>
                                        <div className={styles.notifTime}>
                                            {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </div>
                                    </div>
                                    {!notif.read && <div className={styles.unreadDot} />}
                                </div>
                            ))
                        )}
                    </div>

                    <div className={styles.notificationFooter}>
                        <Link href="/dashboard/notifications" onClick={() => setIsOpen(false)}>
                            View all notifications →
                        </Link>
                    </div>
                </div>
            )}
        </div>
    );
}

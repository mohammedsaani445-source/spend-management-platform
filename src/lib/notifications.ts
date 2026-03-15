import { db, DB_PREFIX } from "./firebase";
import { ref, push, set, get, onValue, update, remove, query, orderByChild, equalTo } from "firebase/database";
import { Notification } from "@/types";

const getNotificationsRef = (tenantId: string) => ref(db, `${DB_PREFIX}/tenants/${tenantId}/notifications`);
const getNotificationRef = (tenantId: string, id: string) => ref(db, `${DB_PREFIX}/tenants/${tenantId}/notifications/${id}`);

export const createNotification = async (params: Omit<Notification, 'id' | 'createdAt' | 'read'>) => {
    try {
        const { tenantId } = params;
        const notificationsRef = getNotificationsRef(tenantId);
        const newNotificationRef = push(notificationsRef);

        const newNotification: Notification = {
            ...params,
            id: newNotificationRef.key!,
            read: false,
            createdAt: new Date().toISOString()
        };

        await set(newNotificationRef, newNotification);
        return newNotificationRef.key;
    } catch (error) {
        console.error("Error creating notification:", error);
        throw error;
    }
};

export const subscribeToNotifications = (tenantId: string, userId: string, callback: (notifications: Notification[]) => void) => {
    const notificationsRef = getNotificationsRef(tenantId);
    const userNotificationsQuery = query(
        notificationsRef,
        orderByChild('userId'),
        equalTo(userId)
    );

    return onValue(userNotificationsQuery, (snapshot) => {
        if (snapshot.exists()) {
            const data = snapshot.val();
            const notificationsList = Object.values(data) as Notification[];
            // Sort by descending date
            notificationsList.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
            callback(notificationsList);
        } else {
            callback([]);
        }
    });
};

export const markNotificationAsRead = async (tenantId: string, notificationId: string) => {
    try {
        const notificationRef = getNotificationRef(tenantId, notificationId);
        await update(notificationRef, { read: true });
    } catch (error) {
        console.error("Error marking notification as read:", error);
    }
};

export const markAllAsRead = async (tenantId: string, userId: string, notifications: Notification[]) => {
    try {
        const unread = notifications.filter(n => !n.read);
        const updates: any = {};
        unread.forEach(n => {
            updates[`${DB_PREFIX}/tenants/${tenantId}/notifications/${n.id}/read`] = true;
        });
        await update(ref(db), updates);
    } catch (error) {
        console.error("Error marking all notifications as read:", error);
    }
};

export const clearNotifications = async (tenantId: string, userId: string, notifications: Notification[]) => {
    try {
        const updates: any = {};
        notifications.forEach(n => {
            updates[`${DB_PREFIX}/tenants/${tenantId}/notifications/${n.id}`] = null;
        });
        await update(ref(db), updates);
    } catch (error) {
        console.error("Error clearing notifications:", error);
    }
};

/**
 * Notify a single user by userId.
 */
export const notifyUser = async (
    tenantId: string,
    userId: string,
    type: Notification['type'],
    title: string,
    message: string,
    link?: string
) => {
    return createNotification({ tenantId, userId, type, title, message, link });
};

/**
 * Notify all users with a specific role.
 * Queries the users collection to find matching role users, then creates a notification for each.
 */
export const notifyRole = async (
    tenantId: string,
    role: string,
    type: Notification['type'],
    title: string,
    message: string,
    link?: string
) => {
    try {
        const usersRef = ref(db, `${DB_PREFIX}/tenants/${tenantId}/users`);
        const usersSnap = await get(usersRef);
        if (!usersSnap.exists()) return;

        const users = usersSnap.val();
        const promises: Promise<any>[] = [];

        for (const [uid, user] of Object.entries(users) as [string, any][]) {
            if (user.role === role || role === 'ALL') {
                promises.push(createNotification({
                    tenantId,
                    userId: uid,
                    type,
                    title,
                    message,
                    link,
                }));
            }
        }

        await Promise.allSettled(promises);
    } catch (error) {
        console.error("[Notifications] Error notifying role:", error);
    }
};


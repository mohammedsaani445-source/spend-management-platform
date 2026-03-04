import { db, DB_PREFIX } from "./firebase";
import { ref, get, set, child, serverTimestamp } from "firebase/database";
import { AppUser } from "@/types";
import { User } from "firebase/auth";

export const createUserProfile = async (user: User) => {
    if (!user) return;

    const userRef = ref(db, `${DB_PREFIX}/users/${user.uid}`);
    const snapshot = await get(userRef);

    if (!snapshot.exists()) {
        const newUser: Omit<AppUser, 'createdAt'> & { createdAt: any } = {
            uid: user.uid,
            email: user.email || "",
            displayName: user.displayName || "User",
            photoURL: user.photoURL || "",
            role: 'REQUESTER',
            userType: 'PRO',
            tenantId: 'default-tenant',
            department: 'General',
            locationId: 'default',
            isActive: true,
            createdAt: serverTimestamp(),
        };

        try {
            await set(userRef, newUser);
        } catch (error) {
            console.error("Error creating user profile", error);
        }
    }
};

export const getUserProfile = async (uid: string): Promise<AppUser | null> => {
    const userRef = ref(db, `${DB_PREFIX}/users/${uid}`);
    const snapshot = await get(userRef);
    if (snapshot.exists()) {
        const data = snapshot.val();
        return {
            ...data,
            createdAt: data.createdAt ? new Date(data.createdAt) : new Date()
        } as AppUser;
    }
    return null;
};

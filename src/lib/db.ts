import { db, DB_PREFIX } from "./firebase";
import { ref, get, set, child, serverTimestamp } from "firebase/database";
import { AppUser } from "@/types";
import { User } from "firebase/auth";

export const createUserProfile = async (user: { uid: string, email: string | null, displayName: string | null, photoURL: string | null } | AppUser) => {
    if (!user) return;

    const userRef = ref(db, `${DB_PREFIX}/users/${user.uid}`);

    try {
        const snapshot = await get(userRef);

        if (!snapshot.exists()) {
            const newUser = {
                uid: user.uid,
                email: user.email || "",
                displayName: user.displayName || "User",
                photoURL: user.photoURL || "",
                role: 'STANDARD_REQUESTER',
                userType: 'PRO',
                department: 'General',
                locationId: 'default',
                isActive: true,
                createdAt: new Date().toISOString(),
            };

            await set(userRef, newUser);
        }
    } catch (error) {
        console.error("Error creating user profile", error);
    }
};

export const getUserProfile = async (uid: string): Promise<AppUser | null> => {
    const dbRef = ref(db);
    try {
        const snapshot = await get(ref(db, `${DB_PREFIX}/users/${uid}`));
        if (snapshot.exists()) {
            const data = snapshot.val();
            return {
                ...data,
                createdAt: new Date(data.createdAt || Date.now())
            } as AppUser;
        }
    } catch (error) {
        console.error("Error fetching user profile", error);
    }
    return null;
};

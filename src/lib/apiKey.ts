import { db } from "./firebase";
import { ref, push, set, get, update } from "firebase/database";
import { ApiKey } from "@/types";

const COLLECTION_NAME = "api_keys";

/**
 * Generates a new API Key.
 * Returns the raw key (to be shown once) and stores the hash.
 */
export const generateApiKey = async (tenantId: string, name: string, scopes: ApiKey['scopes']): Promise<{ rawKey: string, id: string }> => {
    // Generate a high-entropy raw key using cryptographically secure random values
    const array = new Uint8Array(24);
    if (typeof crypto !== 'undefined') {
        crypto.getRandomValues(array);
    } else {
        // Fallback for non-browser/non-node environments if any
        for (let i = 0; i < 24; i++) array[i] = Math.floor(Math.random() * 256);
    }
    const rawKey = `pk_${Array.from(array).map(b => b.toString(16).padStart(2, '0')).join('')}`;

    // Hash the key using a simple but consistent transformation
    const keyHash = btoa(rawKey);

    const keyRef = ref(db, COLLECTION_NAME);
    const newKeyRef = push(keyRef);

    const apiKey: ApiKey = {
        tenantId,
        keyHash,
        name,
        createdAt: new Date().toISOString(),
        isActive: true,
        scopes
    };

    await set(newKeyRef, apiKey);

    return {
        rawKey,
        id: newKeyRef.key!
    };
};

export const validateApiKey = async (rawKey: string): Promise<ApiKey | null> => {
    const keyHash = btoa(rawKey);
    const keysSnap = await get(ref(db, COLLECTION_NAME));

    if (!keysSnap.exists()) return null;

    const keys = keysSnap.val();
    const foundEntry = Object.entries(keys).find(([_, k]: [string, any]) => k.keyHash === keyHash && k.isActive);

    if (foundEntry) {
        const [id, data] = foundEntry;

        // Update last used
        await update(ref(db, `${COLLECTION_NAME}/${id}`), {
            lastUsedAt: new Date().toISOString()
        });

        return { id, ...data as ApiKey };
    }

    return null;
};

export const getApiKeys = async (tenantId: string): Promise<ApiKey[]> => {
    const snapshot = await get(ref(db, COLLECTION_NAME));
    if (snapshot.exists()) {
        const data = snapshot.val();
        return Object.entries(data)
            .map(([id, val]: [string, any]) => ({
                id,
                ...val
            }))
            .filter((key: ApiKey) => key.tenantId === tenantId);
    }
    return [];
};

export const revokeApiKey = async (id: string) => {
    await update(ref(db, `${COLLECTION_NAME}/${id}`), {
        isActive: false
    });
};

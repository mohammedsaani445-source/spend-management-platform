import { db, DB_PREFIX } from "./firebase";
import { ref, push, get, update, query, orderByKey, orderByChild, equalTo } from "firebase/database";
import { Asset, AppUser } from "@/types";
import { logAction } from "./audit";

const getAssetsRef = (tenantId: string) => ref(db, `${DB_PREFIX}/tenants/${tenantId}/assets`);
const getAssetRef = (tenantId: string, id: string) => ref(db, `${DB_PREFIX}/tenants/${tenantId}/assets/${id}`);

export const createAsset = async (asset: Asset, user: AppUser) => {
    try {
        const assetsRef = getAssetsRef(user.tenantId);
        const newAssetRef = push(assetsRef);
        const assetId = newAssetRef.key;

        const assetWithMeta = {
            ...asset,
            id: assetId,
            createdAt: new Date().toISOString()
        };

        await update(getAssetRef(user.tenantId, assetId!), assetWithMeta);

        await logAction({
            tenantId: user.tenantId,
            actorId: user.uid,
            actorName: user.displayName,
            action: 'CREATE',
            entityType: 'ASSET',
            entityId: assetId!,
            description: `Created asset: ${asset.name} (${asset.category})`
        });

        return assetId;
    } catch (error) {
        console.error("Error creating asset:", error);
        throw error;
    }
};

export const getAssets = async (tenantId: string, user?: AppUser): Promise<Asset[]> => {
    try {
        const assetsRef = getAssetsRef(tenantId);

        if (!user || user.role === 'ADMIN' || user.role === 'FINANCE') {
            const allQuery = query(assetsRef, orderByKey());
            const snapshot = await get(allQuery);
            if (snapshot.exists()) return Object.values(snapshot.val());
            return [];
        }

        const isolationQuery = query(assetsRef, orderByChild('ownerId'), equalTo(user.uid));
        const snapshot = await get(isolationQuery);
        if (snapshot.exists()) return Object.values(snapshot.val());
        return [];
    } catch (error) {
        console.error("Error fetching assets:", error);
        return [];
    }
};

export const updateAsset = async (tenantId: string, assetId: string, data: Partial<Asset>, user: AppUser) => {
    try {
        await update(getAssetRef(tenantId, assetId), data);

        await logAction({
            tenantId,
            actorId: user.uid,
            actorName: user.displayName,
            action: 'UPDATE',
            entityType: 'ASSET',
            entityId: assetId,
            description: `Updated asset ${assetId}: ${Object.keys(data).join(', ')}`,
            changes: Object.entries(data).map(([field, newValue]) => ({
                field,
                oldValue: 'N/A',
                newValue
            }))
        });
    } catch (error) {
        console.error("Error updating asset:", error);
        throw error;
    }
};

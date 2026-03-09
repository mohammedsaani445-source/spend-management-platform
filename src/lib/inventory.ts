import { db, DB_PREFIX } from "./firebase";
import { ref, push, set, get, update, query, orderByChild, equalTo, remove } from "firebase/database";
import { Warehouse, SKU, StockLevel, InventoryLog, Asset } from "@/types";

const getWarehousesRef = (tenantId: string) => ref(db, `${DB_PREFIX}/tenants/${tenantId}/warehouses`);
const getSkusRef = (tenantId: string) => ref(db, `${DB_PREFIX}/tenants/${tenantId}/skus`);
const getInventoryLogsRef = (tenantId: string) => ref(db, `${DB_PREFIX}/tenants/${tenantId}/inventory_logs`);
const getAssetsRef = (tenantId: string) => ref(db, `${DB_PREFIX}/tenants/${tenantId}/assets`);

/**
 * Records a stock movement and updates levels.
 */
export const logInventoryAction = async (tenantId: string, log: Omit<InventoryLog, 'id' | 'timestamp'>) => {
    try {
        const logsRef = getInventoryLogsRef(tenantId);
        const newLogRef = push(logsRef);
        const id = newLogRef.key;

        const finalLog = {
            ...log,
            id,
            timestamp: new Date().toISOString()
        };

        await set(newLogRef, finalLog);

        // Update Stock Levels
        const stockRef = ref(db, `${DB_PREFIX}/tenants/${tenantId}/stock_levels/${log.warehouseId}/${log.skuId}`);
        const snapshot = await get(stockRef);

        let currentQty = 0;
        if (snapshot.exists()) {
            currentQty = snapshot.val().quantity || 0;
        }

        await update(stockRef, {
            skuId: log.skuId,
            warehouseId: log.warehouseId,
            quantity: currentQty + log.quantity,
            lastUpdated: new Date().toISOString()
        });

        return id;
    } catch (error) {
        console.error("Error logging inventory action:", error);
        throw error;
    }
};

/**
 * Creates a new SKU in the catalog.
 */
export const createSKU = async (sku: Omit<SKU, 'id'>, user: { tenantId: string }): Promise<string | null> => {
    try {
        const skusRef = getSkusRef(user.tenantId);
        const newRef = push(skusRef);
        const id = newRef.key;
        await set(newRef, { ...sku, id });
        return id;
    } catch (error) {
        console.error("Error creating SKU:", error);
        throw error;
    }
};

/**
 * Updates an existing SKU in the catalog.
 */
export const updateSKU = async (tenantId: string, skuId: string, updates: Partial<SKU>): Promise<void> => {
    try {
        const itemRef = ref(db, `${DB_PREFIX}/tenants/${tenantId}/skus/${skuId}`);
        await update(itemRef, updates);
    } catch (error) {
        console.error("Error updating SKU:", error);
        throw error;
    }
};

/**
 * Deletes an SKU from the catalog.
 */
export const deleteSKU = async (tenantId: string, skuId: string): Promise<void> => {
    try {
        const itemRef = ref(db, `${DB_PREFIX}/tenants/${tenantId}/skus/${skuId}`);
        await remove(itemRef);
    } catch (error) {
        console.error("Error deleting SKU:", error);
        throw error;
    }
};

/**
 * Creates a new Warehouse.
 */
export const createWarehouse = async (warehouse: Omit<Warehouse, 'id'>, tenantId: string): Promise<string | null> => {
    try {
        const warehousesRef = getWarehousesRef(tenantId);
        const newRef = push(warehousesRef);
        const id = newRef.key;
        await set(newRef, { ...warehouse, id, createdAt: new Date().toISOString() });
        return id;
    } catch (error) {
        console.error("Error creating warehouse:", error);
        throw error;
    }
};
/**
 * Updates an existing warehouse.
 */
export const updateWarehouse = async (tenantId: string, warehouseId: string, updates: Partial<Warehouse>): Promise<void> => {
    try {
        const warehouseRef = ref(db, `${DB_PREFIX}/tenants/${tenantId}/warehouses/${warehouseId}`);
        await update(warehouseRef, updates);
    } catch (error) {
        console.error("Error updating warehouse:", error);
        throw error;
    }
};

/**
 * Deletes a warehouse.
 */
export const deleteWarehouse = async (tenantId: string, warehouseId: string): Promise<void> => {
    try {
        const warehouseRef = ref(db, `${DB_PREFIX}/tenants/${tenantId}/warehouses/${warehouseId}`);
        await remove(warehouseRef);
    } catch (error) {
        console.error("Error deleting warehouse:", error);
        throw error;
    }
};

/**
 * Manages Asset Lifecycle.
 */
export const updateAssetStatus = async (tenantId: string, assetId: string, status: Asset['status'], notes?: string) => {
    const assetRef = ref(db, `${DB_PREFIX}/tenants/${tenantId}/assets/${assetId}`);
    await update(assetRef, {
        status,
        notes: notes || "Status updated via lifecycle manager.",
        lastAuditDate: new Date().toISOString()
    });
};

/**
 * Fetches all warehouses.
 */
export const getWarehouses = async (tenantId: string): Promise<Warehouse[]> => {
    const snapshot = await get(getWarehousesRef(tenantId));
    if (snapshot.exists()) return Object.values(snapshot.val());
    return [];
};

/**
 * Adjusts stock level for a specific SKU in a warehouse.
 * Positive quantity = stock in, negative = stock out.
 */
export const adjustStock = async (
    tenantId: string,
    skuId: string,
    skuName: string,
    warehouseId: string,
    warehouseName: string,
    quantity: number,
    performedBy: string,
    notes?: string
): Promise<void> => {
    await logInventoryAction(tenantId, {
        skuId,
        skuName,
        warehouseId,
        warehouseName,
        action: 'ADJUSTMENT',
        quantity,
        performedBy,
        notes: notes || `Manual stock adjustment of ${quantity > 0 ? '+' : ''}${quantity} units.`
    });
};

/**
 * Fetches all SKUs for a tenant.
 */
export const getSKUs = async (tenantId: string): Promise<SKU[]> => {
    const snapshot = await get(getSkusRef(tenantId));
    if (snapshot.exists()) return Object.values(snapshot.val());
    return [];
};

/**
 * Fetches stock levels for a tenant across all warehouses.
 */
export const getStockLevels = async (tenantId: string): Promise<Record<string, Record<string, StockLevel>>> => {
    const stockRef = ref(db, `${DB_PREFIX}/tenants/${tenantId}/stock_levels`);
    const snapshot = await get(stockRef);
    if (snapshot.exists()) return snapshot.val();
    return {};
};

/**
 * Fetches inventory logs for a tenant.
 */
export const getInventoryLogs = async (tenantId: string): Promise<InventoryLog[]> => {
    const snapshot = await get(getInventoryLogsRef(tenantId));
    if (snapshot.exists()) return Object.values(snapshot.val());
    return [];
};

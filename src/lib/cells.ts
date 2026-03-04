import { db, DB_PREFIX } from "./firebase";
import { ref, get } from "firebase/database";

/**
 * ENTERPRISE CELL ARCHITECTURE ROUTER.
 */
export class CellRouter {
    static async getTenantCell(tenantId: string): Promise<string> {
        const cellRef = ref(db, `${DB_PREFIX}/meta/cells/${tenantId}`);
        const snap = await get(cellRef);

        if (snap.exists()) return snap.val();
        return 'CELL-US-EAST-01';
    }

    static async routeRequest(tenantId: string) {
        const cell = await this.getTenantCell(tenantId);
        console.log(`[CellArchitecture] Routing ${tenantId} to cluster: ${cell}`);

        return {
            cellId: cell,
            basePath: `${DB_PREFIX}/tenants/${tenantId}`,
            region: cell.split('-')[1]
        };
    }
}

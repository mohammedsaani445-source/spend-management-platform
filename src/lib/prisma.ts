// ═══════════════════════════════════════════════════════════════
// FILE: lib/prisma.ts
// Firebase RTDB Adapter — Provides a Prisma-like API on top of
// Firebase Realtime Database so the Workflow Engine files work
// without modification.
// ═══════════════════════════════════════════════════════════════
// Implementation: Uses Firebase Admin SDK for privileged server-side access.
// This allows API routes and crons to bypass security rules and manage
// workflow data across tenants.
// ═══════════════════════════════════════════════════════════════

import { DB_PREFIX } from "./firebase";
import { adminDb } from "./firebaseAdmin";

// ── Utility: generate a cuid-like ID ──────────────────────────
function cuid(): string {
  return adminDb.ref("_ids").push().key || `id_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

// ── Generic Firebase collection adapter ───────────────────────
function createModelAdapter(collectionPath: string) {
  // Helper to get the full path under a tenant
  const getCollectionRef = (tenantId?: string) => {
    if (tenantId) {
      return adminDb.ref(`${DB_PREFIX}/tenants/${tenantId}/workflow/${collectionPath}`);
    }
    return adminDb.ref(`${DB_PREFIX}/workflow/${collectionPath}`);
  };

  const getDocRef = (id: string, tenantId?: string) => {
    if (tenantId) {
      return adminDb.ref(`${DB_PREFIX}/tenants/${tenantId}/workflow/${collectionPath}/${id}`);
    }
    return adminDb.ref(`${DB_PREFIX}/workflow/${collectionPath}/${id}`);
  };

  return {
    async create({ data }: { data: any }) {
      const id = data.id || cuid();
      const now = new Date().toISOString();
      const record = {
        ...data,
        id,
        created_at: data.created_at || now,
        updated_at: data.updated_at || now,
      };

      // Handle nested creates (e.g., steps: { create: [...] })
      const nestedKeys = Object.keys(data).filter(
        k => data[k] && typeof data[k] === "object" && data[k].create
      );
      for (const key of nestedKeys) {
        const nestedItems = Array.isArray(data[key].create)
          ? data[key].create
          : [data[key].create];
        record[key] = nestedItems.map((item: any) => ({
          ...item,
          id: item.id || cuid(),
          [`${collectionPath.slice(0, -1)}_id`]: id,
        }));
        // Also store in sub-collection for direct queries
        const subPath = key === "steps" ? "approval_policy_steps" : key;
        for (const item of record[key]) {
          const subRef = adminDb.ref(
            `${DB_PREFIX}/tenants/${data.org_id}/workflow/${subPath}/${item.id}`
          );
          await subRef.set({ ...item, policy_id: id });
        }
      }

      const docRef = getDocRef(id, data.org_id);
      await docRef.set(record);

      // maintain a global index for fast lookups
      if (data.org_id) {
        const indexRef = adminDb.ref(`${DB_PREFIX}/workflow_index/${collectionPath}/${id}`);
        await indexRef.set({ tenant_id: data.org_id, id });
      }

      return record;
    },

    async createMany({ data }: { data: any[] }) {
      const results = [];
      for (const item of data) {
        const id = item.id || cuid();
        const record = { ...item, id };
        const docRef = adminDb.ref(`${DB_PREFIX}/workflow/${collectionPath}/${id}`);
        await docRef.set(record);
        results.push(record);
      }
      return { count: results.length };
    },

    async findUnique({ where, include }: { where: any; include?: any }) {
      const id = where.id;
      // Search index
      const globalRef = adminDb.ref(`${DB_PREFIX}/workflow_index/${collectionPath}/${id}`);
      const indexSnap = await globalRef.once("value");
      let tenantId: string | null = null;

      if (indexSnap.exists()) {
        tenantId = indexSnap.val().tenant_id;
      }

      if (tenantId) {
        const docRef = getDocRef(id, tenantId);
        const snap = await docRef.once("value");
        if (snap.exists()) {
          const record = snap.val();
          if (include) {
            await _populateIncludes(record, include, tenantId);
          }
          return record;
        }
      }

      return await _findAcrossTenants(collectionPath, "id", id, include);
    },

    async findMany({ where, include, orderBy, take }: {
      where?: any; include?: any; orderBy?: any; take?: number;
    } = {}) {
      const tenantId = where?.org_id;
      if (!tenantId) {
        console.warn(`[Prisma Adapter] findMany on ${collectionPath} without org_id`);
        return [];
      }

      const colRef = getCollectionRef(tenantId);
      const snap = await colRef.once("value");
      if (!snap.exists()) return [];

      let records = Object.values(snap.val()) as any[];

      if (where) {
        records = records.filter(r => _matchesWhere(r, where));
      }

      if (include) {
        for (const record of records) {
          await _populateIncludes(record, include, tenantId);
        }
      }

      if (orderBy) {
        const orderArr = Array.isArray(orderBy) ? orderBy : [orderBy];
        records.sort((a, b) => {
          for (const order of orderArr) {
            const key = Object.keys(order)[0];
            const dir = order[key] === "desc" ? -1 : 1;
            if (a[key] < b[key]) return -1 * dir;
            if (a[key] > b[key]) return 1 * dir;
          }
          return 0;
        });
      }

      if (take) {
        records = records.slice(0, take);
      }

      return records;
    },

    async update({ where, data }: { where: any; data: any }) {
      const id = where.id;
      const record = await this.findUnique({ where: { id } });
      if (!record) throw new Error(`${collectionPath} ${id} not found`);

      const updated = {
        ...record,
        ...data,
        updated_at: new Date().toISOString(),
      };

      const docRef = getDocRef(id, record.org_id);
      await docRef.set(updated);
      return updated;
    },

    async updateMany({ where, data }: { where: any; data: any }) {
      const records = await this.findMany({ where });
      let count = 0;
      for (const record of records) {
        await this.update({ where: { id: record.id }, data });
        count++;
      }
      return { count };
    },

    async delete({ where }: { where: any }) {
      const id = where.id;
      const record = await this.findUnique({ where: { id } });
      if (!record) throw new Error(`${collectionPath} ${id} not found`);

      const docRef = getDocRef(id, record.org_id);
      await docRef.remove();

      const indexRef = adminDb.ref(`${DB_PREFIX}/workflow_index/${collectionPath}/${id}`);
      await indexRef.remove();

      return record;
    },

    async deleteMany({ where }: { where: any }) {
      const records = await this.findMany({ where });
      for (const record of records) {
        await this.delete({ where: { id: record.id } });
      }
      return { count: records.length };
    },

    async count({ where }: { where?: any } = {}) {
      const records = await this.findMany({ where });
      return records.length;
    },
  };
}

// ── Where clause matcher ──────────────────────────────────────
function _matchesWhere(record: any, where: any): boolean {
  for (const [key, condition] of Object.entries(where)) {
    if (key === "OR") {
      const orConditions = condition as any[];
      const anyMatch = orConditions.some(orCond => _matchesWhere(record, orCond));
      if (!anyMatch) return false;
      continue;
    }
    if (key === "AND") {
      const andConditions = condition as any[];
      const allMatch = andConditions.every(andCond => _matchesWhere(record, andCond));
      if (!allMatch) return false;
      continue;
    }

    const value = record[key];

    if (condition === null || condition === undefined) {
      if (value !== condition) return false;
      continue;
    }

    if (typeof condition === "object" && !Array.isArray(condition)) {
      if ("lte" in condition && !(value <= condition.lte)) return false;
      if ("gte" in condition && !(value >= condition.gte)) return false;
      if ("lt" in condition && !(value < condition.lt)) return false;
      if ("gt" in condition && !(value > condition.gt)) return false;
      if ("in" in condition && !condition.in.includes(value)) return false;
      if ("not" in condition && value === condition.not) return false;
      if ("contains" in condition && !String(value).includes(condition.contains)) return false;
    } else {
      if (value !== condition) return false;
    }
  }
  return true;
}

// ── Include populator ─────────────────────────────────────────
async function _populateIncludes(record: any, include: any, tenantId: string) {
  for (const [key, config] of Object.entries(include)) {
    if (!config) continue;

    const relationMap: Record<string, { collection: string; foreignKey: string }> = {
      steps:         { collection: "approval_policy_steps", foreignKey: "policy_id" },
      requests:      { collection: "approval_requests",     foreignKey: "policy_id" },
      policy:        { collection: "approval_policies",     foreignKey: "id" },
      step_records:  { collection: "approval_step_records", foreignKey: "request_id" },
      notifications: { collection: "approval_notifications", foreignKey: "request_id" },
      request:       { collection: "approval_requests",     foreignKey: "id" },
    };

    const rel = relationMap[key];
    if (!rel) continue;

    if (key === "policy" && record.policy_id) {
      const parentRef = adminDb.ref(`${DB_PREFIX}/tenants/${tenantId}/workflow/${rel.collection}/${record.policy_id}`);
      const snap = await parentRef.once("value");
      record[key] = snap.exists() ? snap.val() : null;

      if (typeof config === "object" && (config as any).include && record[key]) {
        await _populateIncludes(record[key], (config as any).include, tenantId);
      }
      continue;
    }

    if (key === "request" && record.request_id) {
      const parentRef = adminDb.ref(`${DB_PREFIX}/tenants/${tenantId}/workflow/${rel.collection}/${record.request_id}`);
      const snap = await parentRef.once("value");
      record[key] = snap.exists() ? snap.val() : null;
      continue;
    }

    if (Array.isArray(record[key])) {
      const orderBy = typeof config === "object" && (config as any).orderBy;
      if (orderBy) {
        const sortKey = Object.keys(orderBy)[0];
        const dir = orderBy[sortKey] === "desc" ? -1 : 1;
        record[key].sort((a: any, b: any) => {
          if (a[sortKey] < b[sortKey]) return -1 * dir;
          if (a[sortKey] > b[sortKey]) return 1 * dir;
          return 0;
        });
      }
    } else {
      const subRef = adminDb.ref(`${DB_PREFIX}/tenants/${tenantId}/workflow/${rel.collection}`);
      const snap = await subRef.once("value");
      if (snap.exists()) {
        const all = Object.values(snap.val()) as any[];
        record[key] = all.filter(item => item[rel.foreignKey] === record.id);

        const orderBy = typeof config === "object" && (config as any).orderBy;
        if (orderBy) {
          const sortKey = Object.keys(orderBy)[0];
          const dir = orderBy[sortKey] === "desc" ? -1 : 1;
          record[key].sort((a: any, b: any) => {
            if (a[sortKey] < b[sortKey]) return -1 * dir;
            if (a[sortKey] > b[sortKey]) return 1 * dir;
            return 0;
          });
        }
      } else {
        record[key] = [];
      }
    }
  }
}

// ── Cross-tenant search (fallback) ───────────────────────────
async function _findAcrossTenants(
  collectionPath: string,
  field: string,
  value: any,
  include?: any
): Promise<any | null> {
  const tenantsRef = adminDb.ref(`${DB_PREFIX}/tenants`);
  const snap = await tenantsRef.once("value");
  if (!snap.exists()) return null;

  const tenants = snap.val();
  for (const tenantId of Object.keys(tenants)) {
    const colRef = adminDb.ref(`${DB_PREFIX}/tenants/${tenantId}/workflow/${collectionPath}/${value}`);
    const docSnap = await colRef.once("value");
    if (docSnap.exists()) {
      const record = docSnap.val();
      if (include) {
        await _populateIncludes(record, include, tenantId);
      }
      return record;
    }
  }
  return null;
}

// ── Build the prisma-like export ──────────────────────────────
export const prisma = {
  approvalPolicy:       createModelAdapter("approval_policies"),
  approvalPolicyStep:   createModelAdapter("approval_policy_steps"),
  approvalRequest:      createModelAdapter("approval_requests"),
  approvalStepRecord:   createModelAdapter("approval_step_records"),
  approvalNotification: createModelAdapter("approval_notifications"),
  auditLog:             createModelAdapter("audit_logs"),

  requisition:    _createEntityAdapter("requisitions"),
  purchaseOrder:  _createEntityAdapter("purchaseOrders"),
  invoice:        _createEntityAdapter("invoices"),
  payment:        _createEntityAdapter("payments"),
  contract:       _createEntityAdapter("contracts"),
  vendor:         _createEntityAdapter("vendors"),
  tender:         _createEntityAdapter("rfps"),
  asset:          _createEntityAdapter("assets"),
  budgetOverride: _createEntityAdapter("budgetAdjustments"),

  user: _createUserAdapter(),
};

// ── Entity adapter (for existing collections) ─────────────────
function _createEntityAdapter(collection: string) {
  return {
    async update({ where, data }: { where: { id: string }; data: any }) {
      const record = await _findEntityAcrossTenants(collection, where.id);
      if (!record) throw new Error(`${collection} ${where.id} not found`);

      const tenantId = record.tenantId || record.org_id;
      const entityRef = adminDb.ref(`${DB_PREFIX}/tenants/${tenantId}/${collection}/${where.id}`);
      
      const updated = { ...data, updatedAt: new Date().toISOString() };
      await entityRef.update(updated);
      
      return { ...record, ...updated };
    },

    async create({ data }: { data: any }) {
      const id = data.id || cuid();
      const tenantId = data.org_id || data.tenantId;
      const record = { ...data, id, createdAt: new Date().toISOString() };
      const entityRef = adminDb.ref(`${DB_PREFIX}/tenants/${tenantId}/${collection}/${id}`);
      await entityRef.set(record);
      return record;
    },
  };
}

// ── User adapter ──────────────────────────────────────────────
function _createUserAdapter() {
  return {
    async findUnique({ where }: { where: { id: string } }) {
      const tenantsRef = adminDb.ref(`${DB_PREFIX}/tenants`);
      const snap = await tenantsRef.once("value");
      if (!snap.exists()) return null;

      for (const tenantId of Object.keys(snap.val())) {
        const userRef = adminDb.ref(`${DB_PREFIX}/tenants/${tenantId}/users/${where.id}`);
        const userSnap = await userRef.once("value");
        if (userSnap.exists()) {
          const u = userSnap.val();
          return {
            id: u.uid || u.id,
            name: u.displayName || u.name,
            email: u.email,
            role: u.role,
            org_id: tenantId,
          };
        }
      }
      return null;
    },

    async findMany({ where }: { where: any }) {
      const tenantId = where.org_id;
      if (!tenantId) return [];

      const usersRef = adminDb.ref(`${DB_PREFIX}/tenants/${tenantId}/users`);
      const snap = await usersRef.once("value");
      if (!snap.exists()) return [];

      let users = Object.values(snap.val()) as any[];

      if (where.role) {
        users = users.filter(u => u.role === where.role);
      }

      if (where.status) {
        const statusLower = where.status.toLowerCase();
        users = users.filter(u => {
          const userStatus = (u.status || "active").toLowerCase();
          const isActive = u.isActive !== false;
          return statusLower === "active" ? (userStatus === "active" && isActive) : userStatus === statusLower;
        });
      }

      return users.map(u => ({
        id: u.uid || u.id,
        name: u.displayName || u.name,
        email: u.email,
        role: u.role,
      }));
    },

    async create({ data }: { data: any }) {
      const tenantId = data.orgId || data.org_id;
      if (!tenantId) throw new Error("orgId is required for user creation");
      const uid = data.uid || data.id;
      if (!uid) throw new Error("uid or id is required for user creation");

      const userRef = adminDb.ref(`${DB_PREFIX}/tenants/${tenantId}/users/${uid}`);
      await userRef.set({
        ...data,
        uid,
        orgId: tenantId,
        updatedAt: new Date().toISOString()
      });
      return data;
    },
  };
}

// ── Find entity across tenants ────────────────────────────────
async function _findEntityAcrossTenants(collection: string, id: string): Promise<any | null> {
  const tenantsRef = adminDb.ref(`${DB_PREFIX}/tenants`);
  const snap = await tenantsRef.once("value");
  if (!snap.exists()) return null;

  const tenants = snap.val();
  for (const tenantId of Object.keys(tenants)) {
    const entityRef = adminDb.ref(`${DB_PREFIX}/tenants/${tenantId}/${collection}/${id}`);
    const docSnap = await entityRef.once("value");
    if (docSnap.exists()) {
      return { ...docSnap.val(), tenantId };
    }
  }
  return null;
}

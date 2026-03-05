import { db, DB_PREFIX } from "./firebase";
import { ref, get, set, push, update, query, orderByChild, equalTo } from "firebase/database";
import { Workflow, WorkflowStep, WorkflowCondition } from "@/types";

const getWorkflowsRef = (tenantId: string) => ref(db, `${DB_PREFIX}/tenants/${tenantId}/workflows`);
const getWorkflowRef = (tenantId: string, id: string) => ref(db, `${DB_PREFIX}/tenants/${tenantId}/workflows/${id}`);

/**
 * Evaluates a single workflow condition against a data object.
 */
const evaluateCondition = (condition: WorkflowCondition, data: any): boolean => {
    const { field, operator, value } = condition;
    const fieldValue = data[field];

    switch (operator) {
        case 'GT': return fieldValue > value;
        case 'GTE': return fieldValue >= value;
        case 'LT': return fieldValue < value;
        case 'LTE': return fieldValue <= value;
        case 'EQ': return fieldValue === value;
        case 'IN': return Array.isArray(value) && value.includes(fieldValue);
        case 'CONTAINS': return typeof fieldValue === 'string' && fieldValue.includes(value);
        default: return false;
    }
};

/**
 * Evaluates which workflow should be used for a given entity.
 */
export const findApplicableWorkflow = async (tenantId: string, entityType: Workflow['entityType'], data: any): Promise<Workflow | null> => {
    try {
        const workflowsRef = getWorkflowsRef(tenantId);
        const q = query(workflowsRef, orderByChild('entityType'), equalTo(entityType));
        const snapshot = await get(q);

        if (!snapshot.exists()) return null;

        const workflows = Object.values(snapshot.val()) as Workflow[];

        // Filter active and sort by priority (descending)
        const sortedActive = workflows
            .filter(w => w.isActive)
            .sort((a, b) => (b.priority || 0) - (a.priority || 0));

        // In a more complex system, we'd check if the workflow itself has a global condition.
        // For now, we return the highest priority active workflow for that entity type.
        return sortedActive[0] || null;
    } catch (error) {
        console.error("Error finding workflow:", error);
        return null;
    }
};

/**
 * Determines the next step in a workflow based on the current state.
 */
export const getNextWorkflowStep = (workflow: Workflow, currentStepIndex: number, data: any): WorkflowStep | null => {
    for (let i = currentStepIndex + 1; i < workflow.steps.length; i++) {
        const step = workflow.steps[i];
        if (!step.condition || evaluateCondition(step.condition, data)) {
            return step;
        }
    }
    return null;
};

/**
 * Saves or updates a workflow.
 */
export const saveWorkflow = async (tenantId: string, workflow: Omit<Workflow, 'id'> & { id?: string }) => {
    const workflowsRef = getWorkflowsRef(tenantId);
    const id = workflow.id || push(workflowsRef).key;
    const finalWorkflow = { ...workflow, id, tenantId, createdAt: workflow.createdAt || new Date().toISOString() };

    await set(getWorkflowRef(tenantId, id!), finalWorkflow);
    return id;
};

/**
 * Fetches all workflows for a tenant.
 */
export const getWorkflows = async (tenantId: string): Promise<Workflow[]> => {
    const snapshot = await get(getWorkflowsRef(tenantId));
    if (snapshot.exists()) {
        return Object.values(snapshot.val());
    }
    return [];
};

/**
 * Deletes a workflow by ID.
 */
export const deleteWorkflow = async (tenantId: string, id: string): Promise<void> => {
    await set(getWorkflowRef(tenantId, id), null);
};

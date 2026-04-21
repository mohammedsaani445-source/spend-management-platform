import "server-only";
import { WorkflowEngine } from "./engine";
import { createInvoice as createBaseInvoice, updateInvoiceStatus } from "../invoices";
import { createRequisition as createBaseRequisition, updateRequisitionStatus } from "../requisitions";
import { createPOFromAwardedBid as createBasePO, updatePOStatus } from "../purchaseOrders";
import { createContract as createBaseContract, updateContract } from "../contracts";
import { AppUser, Invoice, Requisition, PurchaseOrder, Contract, Bid, Tender } from "@/types";

/**
 * Handles full Invoice creation + Workflow submission.
 * This is safe to use in API routes/Server Actions.
 */
export const submitInvoiceToWorkflow = async (tenantId: string, invoice: Omit<Invoice, 'id' | 'createdAt'>, actor: AppUser) => {
    // 1. Create the base record (without engine calls inside)
    const newId = await createBaseInvoice(tenantId, invoice);
    if (!newId) throw new Error("Failed to initialize invoice record.");

    // 2. Submit to Workflow
    const workflowResult = await WorkflowEngine.submit(
        {
            module:      "INVOICE",
            entityId:    newId!,
            entityRef:   invoice.invoiceNumber || newId!,
            entityTitle: `Invoice from ${invoice.vendorName}`,
            amount:      invoice.amount,
            currency:    invoice.currency || "GHS",
            department:  invoice.department || actor.department || "Finance",
            source:      "USER",
        },
        {
            userId:   actor.uid,
            userName: actor.displayName || actor.email,
            orgId:    tenantId,
            role:     actor.role || "finance",
        }
    );

    // 3. Update status based on engine result
    await updateInvoiceStatus(tenantId, newId!, workflowResult.status === 'AUTO_APPROVED' ? 'APPROVED' : 'PENDING');
    
    return { id: newId, workflow: workflowResult };
};

/**
 * Handles full Requisition creation + Workflow submission.
 */
export const submitRequisitionToWorkflow = async (requisition: Omit<Requisition, 'id' | 'createdAt'>) => {
    const tenantId = requisition.tenantId;

    // 1. Create base record
    const newReqId = await createBaseRequisition(requisition);
    if (!newReqId) throw new Error("Failed to initialize requisition record. Check budget limits.");

    // 2. Submit to Workflow
    const workflowResult = await WorkflowEngine.submit(
        {
            module:      "REQUISITION",
            entityId:    newReqId!,
            entityRef:   newReqId!,
            entityTitle: requisition.justification || (requisition as any).department || "Requisition",
            amount:      requisition.totalAmount,
            currency:    requisition.currency || "GHS",
            department:  requisition.department,
            source:      "USER",
        },
        {
            userId:   requisition.requesterId,
            userName: requisition.requesterName,
            orgId:    tenantId,
            role:     "requester",
        }
    );

    // 3. Sync status
    const status = workflowResult.status || 'PENDING';
    await updateRequisitionStatus(tenantId, newReqId!, status as any);

    return { id: newReqId, workflow: workflowResult };
};

/**
 * Handles PO creation (from Bid award) + Workflow submission.
 */
export const submitPurchaseOrderToWorkflow = async (tenantId: string, tender: Tender, bid: Bid, actor: AppUser) => {
    // 1. Create base PO
    const result = await createBasePO(tenantId, tender, bid, actor);
    const poId = result.id;
    if (!poId) throw new Error("Failed to initialize purchase order record.");

    // 2. Submit to Workflow
    const workflowResult = await WorkflowEngine.submit(
        {
            module:      "PURCHASE_ORDER",
            entityId:    poId!,
            entityRef:   result.poNumber || poId!,
            entityTitle: `PO for ${bid.vendorName} - ${tender.title}`,
            amount:      bid.amount,
            currency:    bid.currency || "GHS",
            department:  (tender as any).department || actor.department || "Procurement",
            source:      "USER",
        },
        {
            userId:   actor.uid,
            userName: actor.displayName || actor.email,
            orgId:    tenantId,
            role:     actor.role || "procurement",
        }
    );

    // 3. Sync status
    const status = workflowResult.status === 'AUTO_APPROVED' ? 'ISSUED' : 'PENDING';
    await updatePOStatus(tenantId, poId!, status as any);

    return { id: poId, workflow: workflowResult };
};

/**
 * Handles Contract creation + Workflow submission.
 */
export const submitContractToWorkflow = async (contract: Omit<Contract, 'id' | 'createdAt' | 'updatedAt'>, actor: AppUser) => {
    const tenantId = actor.tenantId!;

    // 1. Create base contract
    const contractId = await createBaseContract(contract, actor);

    // 2. Submit to Workflow
    const workflowResult = await WorkflowEngine.submit(
        {
            module:      "CONTRACT",
            entityId:    contractId!,
            entityRef:   (contract as any).contractNumber || contractId!,
            entityTitle: `${contract.type} Contract - ${contract.vendorName}`,
            amount:      contract.value || 0,
            currency:    contract.currency || "GHS",
            department:  (contract as any).department || actor.department || "Legal",
            source:      "USER",
        },
        {
            userId:   actor.uid,
            userName: actor.displayName || actor.email,
            orgId:    tenantId,
            role:     actor.role || "legal",
        }
    );

    // 3. Sync status
    const status = workflowResult.status === 'AUTO_APPROVED' ? 'ACTIVE' : 'PENDING';
    await updateContract(tenantId, contractId!, { status: status as any }, actor);

    return { id: contractId, workflow: workflowResult };
};

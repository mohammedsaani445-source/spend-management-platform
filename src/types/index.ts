export type UserRole =
    | 'STANDARD_REQUESTER'
    | 'AUTHORIZED_APPROVER'
    | 'PROCUREMENT_OFFICER'
    | 'OPERATIONS_RECEIVER'
    | 'ACCOUNTS_PAYABLE'
    | 'FINANCE_MANAGER'
    | 'FINANCE_SPECIALIST'
    | 'STRATEGIC_SOURCER'
    | 'DATA_ANALYST'
    | 'WORKSPACE_ADMIN'
    | 'PLATFORM_SUPERUSER'
    | 'ADMIN'; // Keep ADMIN for legacy compatibility if needed

export type UserType = 'BASIC' | 'PRO';

export interface DashboardEvent {
    id: string;
    type: 'REQUISITION' | 'ORDER' | 'INVOICE' | 'BUDGET';
    title: string;
    description: string;
    amount?: number;
    currency?: string;
    timestamp: Date;
    user: string;
    status: string;
}

export interface Notification {
    id: string;
    tenantId: string;
    userId: string;
    type: 'APPROVAL_REQUEST' | 'PO_ACKNOWLEDGED' | 'PO_OPENED' | 'BUDGET_ALERT' | 'SYSTEM' | 'PO_SHIPPED'
        | 'PAYMENT_PROCESSED' | 'PAYMENT_SCHEDULED' | 'CONTRACT_EXPIRING' | 'INVOICE_SUBMITTED'
        | 'APPROVAL_GRANTED' | 'APPROVAL_REJECTED' | 'PAYMENT_FAILED' | 'BILL_VOIDED';
    title: string;
    message: string;
    link?: string;
    read: boolean;
    createdAt: string;
}

export interface HelpArticle {
    id: string;
    title: string;
    content: string;
    category: 'GETTING_STARTED' | 'REQUISITIONS' | 'BUDGETS' | 'VENDORS' | 'POLICIES' | 'SECURITY' | 'ACCOUNTING' | 'COMPLIANCE';
}

export interface SupportTicket {
    id: string;
    userId: string;
    userName: string;
    userEmail: string;
    type: 'QUESTION' | 'BUG' | 'FEATURE_REQUEST';
    subject: string;
    description: string;
    status: 'OPEN' | 'IN_PROGRESS' | 'CLOSED';
    createdAt: string;
}

export interface AppUser {
    uid: string;
    tenantId: string;
    email: string;
    displayName: string;
    photoURL?: string;
    role: UserRole;
    userType: UserType;
    department: string;
    locationId?: string;
    jobTitle?: string;
    phone?: string;
    bio?: string;
    location?: string;
    twoFactorEnabled?: boolean;
    twoFactorSecret?: string;
    marketingEmails?: boolean;
    securityAlerts?: boolean;
    isActive?: boolean;
    createdAt: Date;
    managerId?: string; // Phase 26: Reporting Lines
    departmentId?: string;
}

export interface Location {
    id: string;
    tenantId: string;
    name: string;
    address?: string;
    timezone?: string;
    currency?: string;
    isActive: boolean;
    createdAt: string;
}

export interface Department {
    id: string;
    tenantId: string;
    name: string;
    locationId: string;
    parentDeptId?: string; // Support nested hierarchy
    managerId?: string;
    budgetCode?: string;
    isActive: boolean;
    createdAt: string;
}

export interface Vendor {
    id?: string;
    name: string;
    contactName: string;
    email: string;
    phone?: string;
    address?: string;
    taxId?: string;
    category: string;
    paymentTerms?: string;
    status: 'ACTIVE' | 'INACTIVE';
    createdAt: Date;
    paymentMethod?: 'ACH' | 'WIRE' | 'STRIPE' | 'PLUG'; // Phase 7
    directPayEnabled?: boolean; // Phase 7: Auto-pay on approval
    scorecard?: VendorScorecard; // Phase 59
    complianceStatus?: 'COMPLIANT' | 'NON_COMPLIANT' | 'EXPIRING' | 'PENDING'; // Phase 59
    documents?: VendorDocument[]; // Phase 59
}

export interface VendorScorecard {
    overallScore: number; // 0-100
    leadTimeScore: number; // Based on PO vs GR dates
    qualityScore: number;   // Based on GR quality status
    invoiceAccuracyScore: number; // Based on discrepancies
    totalOrders: number;
    lastUpdated: string;
}

export type VendorDocumentType = 'W9' | 'INSURANCE' | 'COMPLIANCE' | 'TAX_CERT' | 'OTHER';

export interface VendorDocument {
    id: string;
    vendorId: string;
    name: string;
    type: VendorDocumentType;
    url: string;
    status: 'ACTIVE' | 'EXPIRED' | 'PENDING';
    expiryDate?: string;
    uploadedAt: string;
    uploadedBy: string;
}

export type RequisitionStatus = 'DRAFT' | 'PENDING' | 'OVER_BUDGET' | 'APPROVED' | 'REJECTED' | 'FULFILLED' | 'CANCELED' | 'ORDERED';

export interface RequisitionItem {
    id: string;
    description: string;
    quantity: number;
    unitPrice: number;
    total: number;
    glCode?: string;
}

export interface Requisition {
    id?: string;
    tenantId: string;
    requesterId: string;
    requesterName: string;
    department: string;
    departmentId?: string;
    locationId?: string;
    vendorId?: string;
    vendorName?: string;
    items: RequisitionItem[];
    totalAmount: number;
    currency?: string;
    justification: string;
    status: RequisitionStatus;
    createdAt: Date;
    approverId?: string;
    approverName?: string;
    currentStepIndex?: number;
    workflowId?: string;
    approvalHistory?: ApprovalHistoryEntry[];
    complianceScore?: number;
    complianceFindings?: string[];
}

export interface ApprovalHistoryEntry {
    stepId: string;
    stepName: string;
    actorId: string;
    actorName: string;
    actorEmail: string;
    action: 'APPROVE' | 'REJECT' | 'REVISION_REQUESTED';
    comment?: string;
    timestamp: string;
}

export interface DeliveryLog {
    timestamp: string;
    action: 'SENT' | 'OPENED' | 'ACKNOWLEDGED' | 'SHIPPED';
    performedBy: string; // 'VENDOR' or 'USER_ID'
    details?: string;
}

export type POStatus = 'ISSUED' | 'SENT' | 'OPENED' | 'ACKNOWLEDGED' | 'RECEIVED' | 'BILLED' | 'CLOSED' | 'CANCELLED' | 'FULFILLED' | 'DISCREPANCY_FLAGGED' | 'SHIPPED' | 'DELIVERED';

export interface ShippingDetails {
    carrier: string;
    trackingNumber: string;
    shippedAt: string;
    estimatedDelivery?: string;
}

export interface PurchaseOrder {
    id?: string;
    tenantId: string;
    poNumber: string;
    requisitionId: string;
    vendorId: string;
    vendorName: string;
    vendorEmail?: string;
    items: RequisitionItem[];
    totalAmount: number;
    currency?: string;
    status: POStatus;
    issuedAt: Date;
    expectedDeliveryDate?: Date; // Phase 18: Intelligent Insights
    issuedBy: string;
    department: string;
    locationId?: string;
    receivedAt?: string;
    deliveryHistory?: DeliveryLog[];
    firstViewedAt?: string;
    lastViewedAt?: string;
    receiptIds?: string[];
    invoiceIds?: string[];
    isMatched?: boolean;
    discrepancyNote?: string;
    approvalHistory?: ApprovalHistoryEntry[];
    currentStepIndex?: number;
    workflowId?: string;
    issuedByName?: string;
    shippingAddress?: string;
    createdAt?: string;
    shippingDetails?: ShippingDetails;
}

export type InvoiceStatus = 'DRAFT' | 'PENDING' | 'PAID' | 'APPROVED' | 'REJECTED' | 'SUBMITTED';

export interface Invoice {
    id?: string;
    vendorId: string;
    vendorName: string;
    poId?: string;
    poNumber?: string;
    invoiceNumber: string;
    amount: number;
    currency?: string;
    issueDate: Date;
    dueDate: Date;
    status: InvoiceStatus;
    department: string;
    fileName?: string;
    fileUrl?: string;
    createdAt: Date;
    lines?: GoodsReceiptLine[]; // Phase 44: Line-item matching
    // AI Metadata
    confidence?: number;
    confidenceReasoning?: string;
    hasFraudAlert?: boolean;
    fraudCheckReason?: string;
    autoExtracted?: boolean;
}


export type BudgetEnforcementLevel = 'SOFT' | 'HARD';

export interface Budget {
    id?: string;
    department: string;
    amount: number;
    committedAmount?: number; // (Phase 58) Funds reserved via approved POs
    currency?: string;
    fiscalYear: string;
    enforcementLevel?: BudgetEnforcementLevel; // (Phase 58) SOFT (warn) vs HARD (block)
    entityId?: string; // Phase 2: Multi-entity
    entityName?: string;
    glCodes?: string[]; // Allowed GL codes for this budget
    createdAt?: Date; // Optional as it might be added on creation
    updatedAt?: string;
}

export interface BudgetUtilization {
    budget: number;
    committed: number;
    spent: number;
    remaining: number;
    utilizationPercent: number;
    currency: string;
    enforcementLevel: BudgetEnforcementLevel;
}

// Phase 58: Budget Adjustments
export type BudgetAdjustmentStatus = 'PENDING' | 'APPROVED' | 'REJECTED';
export type BudgetAdjustmentType = 'INCREASE' | 'TRANSFER';

export interface BudgetAdjustment {
    id?: string;
    tenantId: string;
    requesterId: string;
    requesterName: string;
    department: string;
    amount: number;
    currency: string;
    type: BudgetAdjustmentType;
    targetDepartment?: string; // For transfers
    reason: string;
    status: BudgetAdjustmentStatus;
    approverId?: string;
    approverName?: string;
    createdAt: string;
    processedAt?: string;
}

// Communication & Vendor Tracking Types
export type CommunicationType = 'EMAIL' | 'NOTE' | 'CALL' | 'MEETING';
export type VendorActionStatusType = 'PENDING_ACKNOWLEDGMENT' | 'ACKNOWLEDGED' | 'OVERDUE' | 'RESPONDED';

export interface CommunicationLog {
    id?: string;
    poId: string;
    vendorId?: string; // Phase 18: Link to vendor
    type: CommunicationType;
    subject: string;
    body: string;
    sentBy: string;
    sentByName: string;
    sentTo: string[];
    timestamp: Date;
    attachments?: string[];
    readReceipt?: Date;
    templateUsed?: string;
}

export interface VendorActionStatus {
    poId: string;
    status: VendorActionStatusType;
    lastContact?: Date;
    responseDeadline?: Date;
    escalationLevel: 0 | 1 | 2 | 3;
    daysSinceLastContact?: number;
}

// Phase 20: Enterprise Asset Management & Compliance
export type AssetStatus = 'IN_USE' | 'STORAGE' | 'MAINTENANCE' | 'DISPOSED' | 'LOST';
export type AssetCategory = 'HARDWARE' | 'SOFTWARE' | 'FURNITURE' | 'VEHICLE' | 'OTHER';

export interface Asset {
    id?: string;
    name: string;
    category: AssetCategory;
    status: AssetStatus;
    purchaseOrderId?: string;
    vendorId?: string;
    vendorName?: string;
    purchaseDate: Date;
    purchasePrice: number;
    currency?: string;
    serialNumber?: string;
    ownerId?: string;
    ownerName?: string;
    department: string;
    location?: string;
    notes?: string;
    lastAuditDate?: Date;
    createdAt: Date;
}

export type AuditAction = 
    | 'LOGIN' | 'LOGOUT' | 'PR_CREATED' | 'PR_APPROVED' | 'PR_REJECTED' 
    | 'PO_CREATED' | 'PO_SENT' | 'RECEIPT_CREATED' | 'INVOICE_UPLOADED'
    | 'MATCH_VERIFIED' | 'MATCH_DISCREPANCY' | 'PAYMENT_PROCESSED'
    | 'USER_CREATED' | 'USER_DISABLED' | 'TENDER_CREATED' | 'BID_SUBMITTED'
    | 'CREATE' | 'UPDATE' | 'DELETE' | 'APPROVE' | 'REJECT';

export type AuditEntityType = 
    | 'USER' | 'REQUISITION' | 'PURCHASE_ORDER' | 'RECEIPT' | 'INVOICE' 
    | 'PAYMENT' | 'TENDER' | 'BID' | 'WORKFLOW' | 'BUDGET' | 'VENDOR' | 'CONTRACT';

// --- Phase 45: Blind Bidding & Compliance ---

export interface Tender {
    id: string;
    title: string;
    description: string;
    status: 'OPEN' | 'CLOSED' | 'EVALUATING' | 'AWARDED';
    deadline: string;
    createdBy: string;
    currency: string;
    items: RequisitionItem[]; // Assuming RequisitionItem is suitable for PurchaseOrderItem
    budget?: number; // Phase 21: Added for strategic sourcing
    isSealed?: boolean; // Phase 45: Blind bidding
    awardedTo?: string; // Bid ID
    awardedAt?: string;
    poId?: string;
    poNumber?: string;
}

export interface Bid {
    id: string;
    tenderId: string;
    vendorId: string;
    vendorName: string;
    amount: number;
    currency: string;
    submittedAt: string;
    status: 'PENDING' | 'REJECTED' | 'ACCEPTED';
    isBlind: boolean; // For Phase 45 compliance
    notes?: string; // Phase 21: Bid notes/justification
    poId?: string;
    poNumber?: string;
}

export interface AuditLog {
    id?: string;
    timestamp: Date;
    actorId: string;
    actorName: string;
    action: AuditAction;
    entityType: AuditEntityType;
    entityId: string;
    description: string;
    changes?: {
        field: string;
        oldValue: any;
        newValue: any;
    }[];
    ipAddress?: string;
    userAgent?: string;
}

export interface AccrualReport {
    poId: string;
    poNumber: string;
    vendorName: string;
    department: string;
    totalAmount: number;
    receivedAmount: number;
    invoicedAmount: number;
    accrualValue: number; // receivedAmount - invoicedAmount
    currency: string;
    spendByDepartment?: Record<string, number>;
    spendByCategory?: Record<string, number>;
    forecastedSpend?: number[];
    anomaliesDetectedDeviceCount?: number;
    carbonFootprint?: {
        totalCo2e: number;
        byDepartment: Record<string, number>;
    };
}

// Phase 21: Strategic Sourcing (RFPs & Bidding)
export type RFPStatus = 'DRAFT' | 'OPEN' | 'UNDER_REVIEW' | 'AWARDED' | 'CANCELLED';

export interface RFP {
    id?: string;
    requisitionId: string;
    title: string;
    description: string;
    department: string;
    status: RFPStatus;
    deadline: Date;
    invitedVendors: string[]; // Vendor IDs
    items: {
        description: string;
        quantity: number;
        unit: string;
    }[];
    createdBy: string;
    createdAt: Date;
}

export type QuoteStatus = 'SUBMITTED' | 'SHORTLISTED' | 'ACCEPTED' | 'REJECTED';

export interface Quotation {
    id?: string;
    rfpId: string;
    vendorId: string;
    vendorName: string;
    status: QuoteStatus;
    totalAmount: number;
    currency: string;
    items: {
        description: string;
        quantity: number;
        unitPrice: number;
        totalPrice: number;
    }[];
    deliveryDate: Date;
    validUntil: Date;
    notes?: string;
    submittedAt: Date;
    attachmentUrl?: string; // For the actual bid document
}

// Phase 22: Contract Management Suite
export type ContractStatus = 'ACTIVE' | 'EXPIRING' | 'RENEGOTIATION' | 'EXPIRED' | 'TERMINATED';
export type ContractType = 'MSA' | 'SOW' | 'NDA' | 'DPA' | 'SERVICE_AGREEMENT' | 'OTHER';

export interface Contract {
    id?: string;
    vendorId: string;
    vendorName: string;
    title: string;
    type: ContractType;
    status: ContractStatus;
    startDate: Date;
    endDate: Date;
    value: number;
    currency: string;
    autoRenew: boolean;
    attachmentUrl?: string; // Link to PDF/Doc
    notes?: string;
    tags?: string[];
    createdAt: Date;
    updatedAt: Date;
}

// Phase 23: Inventory & Warehouse Management
export interface Warehouse {
    id?: string;
    name: string;
    address: string;
    managerId?: string;
    managerName?: string;
    status: 'ACTIVE' | 'INACTIVE';
    createdAt: Date;
}

export interface SKU {
    id?: string;
    code: string; // Barcode or Internal SKU
    name: string;
    description: string;
    category: string;
    unit: string; // e.g., 'EA', 'KG', 'PCS'
    minStockLevel: number; // Reorder point
    unitPrice?: number;
    currency?: string;
    co2e?: number; // Phase 7: kg of CO2e per unit
    imageUrl?: string;
}

export interface SpendAnalytics {
    totalSpend: number;
    spendByDepartment: Record<string, number>;
    spendByCategory: Record<string, number>;
    forecastedSpend: number[];
    carbonFootprint: {
        totalCo2e: number;
        byDepartment: Record<string, number>;
    };
}

export interface PaymentIntent {
    id: string;
    tenantId: string;
    entityId: string; // Invoice or PO
    entityType: 'INVOICE' | 'PO';
    amount: number;
    currency: string;
    status: 'PENDING' | 'PROCESSING' | 'SUCCEEDED' | 'FAILED';
    provider: 'STRIPE' | 'PLAID';
    providerId: string;
    createdAt: string;
}

export interface StockLevel {
    skuId: string;
    warehouseId: string;
    quantity: number;
    reserved: number; // For pending orders
    lastUpdated: Date;
}

export type InventoryLogAction = 'RECEIPT' | 'SHIPMENT' | 'TRANSFER' | 'ADJUSTMENT' | 'RESERVATION';

export interface InventoryLog {
    id?: string;
    skuId: string;
    skuName: string;
    warehouseId: string;
    warehouseName: string;
    action: InventoryLogAction;
    quantity: number; // Delta (+ or -)
    performedBy: string;
    timestamp: Date;
    referenceId?: string; // e.g., PO ID or Transfer ID
    notes?: string;
}

// Phase 24: Industry-Grade Vendor Portal
export interface VendorPortalProfile {
    vendorId: string;
    portalEnabled: boolean;
    magicLinkToken?: string;
    tokenExpiry?: Date;
    lastPortalAccess?: Date;
    allowSelfInvoicing: boolean;
    primaryContactEmail: string;
}

export interface PortalSession {
    token: string;
    vendorId: string;
    vendorName: string;
    expiresAt: Date;
    tenantId?: string;
}

// Phase 25: Enterprise Connectivity
export interface ApiKey {
    id?: string;
    tenantId: string;
    keyHash: string;
    name: string;
    createdAt: string;
    lastUsedAt?: string;
    isActive: boolean;
    scopes: ('REQUISITIONS_READ' | 'REQUISITIONS_WRITE' | 'PO_READ' | 'INVOICES_WRITE' | 'FULL_ADMIN')[];
}

// Phase 25: ERP Connectivity
export interface ErpConnectorConfig {
    id?: string;
    systemType: 'SAP' | 'NETSUITE' | 'ORACLE' | 'DYNAMICS' | 'GIFMIS' | 'SAGE' | 'TALLY' | 'CUSTOM';
    name: string;
    lastSyncAt?: string;
    status: 'CONNECTED' | 'DISCONNECTED' | 'ERROR';
    settings: Record<string, any>;
}

export interface ErpSyncLog {
    id?: string;
    timestamp: string;
    entityType: 'VENDOR' | 'PO' | 'INVOICE' | 'BUDGET';
    entityId: string;
    action: 'PUSH' | 'PULL';
    status: 'SUCCESS' | 'FAILURE';
    message: string;
    payload?: any;
}
// Phase 27: Enterprise Receipts & 3-Way Matching
export interface GoodsReceiptLine {
    itemIndex: number;         // maps back to PO line index
    description: string;
    orderedQty: number;
    receivedQty: number;       // qty received this receipt
    totalReceivedQty?: number; // cumulative received across receipts
    unitPrice: number;
    qualityStatus: 'PASSED' | 'FAILED' | 'PENDING';
    failureReason?: string;
    isPromoted?: boolean;      // Phase 68
    promotionId?: string;      // Phase 68: Asset ID or Stock Log ID
}

export interface ItemReceipt {
    id: string;
    poId: string;
    poNumber?: string;
    poVendorName?: string;
    poCurrency?: string;
    poTotal?: number;
    tenantId: string;
    receivedBy: string;
    receivedByName: string;
    warehouseId?: string;
    warehouseName?: string;
    lines: GoodsReceiptLine[];   // line-level detail (replaces old `items`)
    /** @deprecated use lines instead */
    items?: {
        skuId?: string;
        description: string;
        quantityReceived: number;
    }[];
    packingSlipUrl?: string;
    packingSlipName?: string;
    isAutoReceive: boolean;       // true for services/software
    overallQualityStatus: 'PASSED' | 'FAILED' | 'PARTIAL';
    notes?: string;
    createdAt: string;
}

// Payments / AP Module
export type BillStatus = 'UNPAID' | 'SCHEDULED' | 'PROCESSING' | 'PAID' | 'FAILED' | 'VOID';
export type PaymentMethod = 'ACH' | 'WIRE' | 'EFT' | 'CHECK' | 'CREDIT_CARD';

export interface Bill {
    id: string;           // same as invoiceId
    invoiceId: string;
    invoiceNumber: string;
    vendorId: string;
    vendorName: string;
    department: string;
    amount: number;
    currency: string;
    issueDate: Date;
    dueDate: Date;
    poNumber?: string;
    status: BillStatus;
    paymentMethod?: PaymentMethod;
    scheduledDate?: string;    // ISO date string if deferred
    paymentDate?: string;      // actual payment date
    paymentRef?: string;       // bank/ACH reference number
    paymentRunId?: string;     // if part of a grouped payment run
    createdAt: Date;
}

export interface PaymentRun {
    id: string;
    tenantId: string;
    billIds: string[];
    totalAmount: number;
    currency: string;
    paymentMethod: PaymentMethod;
    paymentDate: string;       // scheduled or actual
    status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
    referenceNumber: string;   // bank reference / batch ref
    createdBy: string;
    createdByName: string;
    createdAt: string;
    processedAt?: string;
    notes?: string;
}



// Phase 26: Advanced RBAC & Dynamic Workflows
export type PermissionAction = 'READ' | 'WRITE' | 'CREATE' | 'DELETE' | 'APPROVE' | 'ADMIN';
export type PermissionScope = AuditEntityType | 'ALL' | 'SYSTEM_SETTINGS' | 'ERP_SETTINGS';

export interface Permission {
    action: PermissionAction;
    scope: PermissionScope;
}

export interface CustomRole {
    id: string;
    tenantId: string;
    name: string;
    description: string;
    permissions: Permission[];
    isSystemRole: boolean;
    createdAt: string;
}

export type WorkflowConditionOperator = 'GT' | 'LT' | 'EQ' | 'GTE' | 'LTE' | 'IN' | 'CONTAINS';

export interface WorkflowCondition {
    field: string;
    operator: WorkflowConditionOperator;
    value: any;
}

export interface WorkflowStep {
    id: string;
    name: string;
    approverRole?: UserRole | string;
    approverId?: string;
    approverIds?: string[]; // For Approval Pools (multiple specific users)
    thresholdMin?: number;  // Threshold-based routing
    thresholdMax?: number;
    condition?: WorkflowCondition;
}

export interface Workflow {
    id: string;
    tenantId: string;
    name: string;
    entityType: 'REQUISITION' | 'PO' | 'INVOICE' | 'BUDGET';
    steps: WorkflowStep[];
    isActive: boolean;
    createdAt: string;
    priority: number; // For tie-breaking multiple applicable workflows
}

// Phase 28: Expense Management (Reimbursements & Out-of-pocket)
export type ExpenseStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'REIMBURSED' | 'PAID';

export interface Expense {
    id?: string;
    tenantId: string;
    userId: string;
    userName: string;
    vendorName: string;
    amount: number;
    currency: string;
    date: string;
    category: string;
    glCode?: string;
    status: ExpenseStatus;
    receiptUrl?: string;
    fileName?: string;
    notes?: string;
    confidence?: number;
    hasFraudAlert?: boolean;
    fraudReason?: string;
    createdAt: string;
    autoExtracted?: boolean;
}

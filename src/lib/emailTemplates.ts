import { PurchaseOrder } from "@/types";

export interface EmailTemplate {
    id: string;
    name: string;
    subject: string;
    body: string;
    category: 'standard' | 'urgent' | 'followup' | 'custom';
    description: string;
}

export const EMAIL_TEMPLATES: EmailTemplate[] = [
    {
        id: 'standard-po',
        name: 'Standard PO Notification',
        category: 'standard',
        description: 'Professional notification for new purchase orders',
        subject: 'Purchase Order {PO_NUMBER} - Action Required',
        body: `Dear {VENDOR_NAME} Team,

We are pleased to issue Purchase Order {PO_NUMBER} for your review and acknowledgment.

**Order Details:**
- PO Number: {PO_NUMBER}
- Total Amount: {TOTAL_AMOUNT}
- Expected Delivery: {DUE_DATE}

**Items Ordered:**
{ITEM_LIST}

**Next Steps:**
Please review the attached purchase order and confirm receipt by acknowledging this order within 2 business days. If you have any questions or concerns, please contact us immediately.

**Important:** This purchase order is subject to our standard terms and conditions. Please ensure all items are delivered by the specified date.

Thank you for your continued partnership.

Best regards,
{CONTACT_NAME}
{COMPANY_NAME}
Procurement Department`
    },
    {
        id: 'urgent-po',
        name: 'Urgent Request',
        category: 'urgent',
        description: 'High-priority notification requiring immediate attention',
        subject: '🔴 URGENT: Purchase Order {PO_NUMBER} - Immediate Attention Required',
        body: `URGENT ATTENTION REQUIRED

Dear {VENDOR_NAME} Team,

This is an URGENT purchase order that requires your immediate attention and acknowledgment.

**CRITICAL ORDER DETAILS:**
- PO Number: {PO_NUMBER}
- Total Amount: {TOTAL_AMOUNT}
- REQUIRED Delivery Date: {DUE_DATE}
- Priority Level: HIGH

**Items Ordered:**
{ITEM_LIST}

**IMMEDIATE ACTION REQUIRED:**
⚠️ Please acknowledge this purchase order within 24 hours
⚠️ Confirm delivery capability by {DUE_DATE}
⚠️ Contact us immediately if there are any concerns

This order is time-sensitive and critical to our operations. Your prompt response is essential.

For urgent inquiries, please contact:
{CONTACT_NAME}
{COMPANY_NAME}
Procurement Department

Thank you for your urgent attention to this matter.`
    },
    {
        id: 'followup-reminder',
        name: 'Follow-up Reminder',
        category: 'followup',
        description: 'Polite reminder for pending acknowledgments',
        subject: 'Reminder: Purchase Order {PO_NUMBER} Awaiting Acknowledgment',
        body: `Dear {VENDOR_NAME} Team,

This is a friendly reminder regarding Purchase Order {PO_NUMBER}, which was sent on {SENT_DATE} and is still awaiting your acknowledgment.

**Order Summary:**
- PO Number: {PO_NUMBER}
- Total Amount: {TOTAL_AMOUNT}
- Expected Delivery: {DUE_DATE}

**Items:**
{ITEM_LIST}

**Action Needed:**
We kindly request that you acknowledge receipt of this purchase order at your earliest convenience. If you have already processed this order, please disregard this reminder.

If there are any issues or questions regarding this order, please don't hesitate to reach out to us.

Thank you for your attention to this matter.

Best regards,
{CONTACT_NAME}
{COMPANY_NAME}
Procurement Department`
    },
    {
        id: 'custom-template',
        name: 'Custom Template',
        category: 'custom',
        description: 'Blank template for custom messages',
        subject: 'Purchase Order {PO_NUMBER}',
        body: `Dear {VENDOR_NAME} Team,

[Your custom message here]

**Order Details:**
- PO Number: {PO_NUMBER}
- Total Amount: {TOTAL_AMOUNT}

**Items:**
{ITEM_LIST}

Best regards,
{CONTACT_NAME}
{COMPANY_NAME}`
    }
];

// Variable replacement function
export const replaceEmailVariables = (
    template: string,
    po: PurchaseOrder,
    contactName: string = 'Procurement Team',
    companyName: string = 'Acme Corp Inc.',
    sentDate?: Date
): string => {
    const itemList = po.items
        .map((item, idx) => `${idx + 1}. ${item.description} - Qty: ${item.quantity} @ ${item.unitPrice} ${po.currency}`)
        .join('\n');

    const variables: Record<string, string> = {
        '{PO_NUMBER}': po.poNumber,
        '{VENDOR_NAME}': po.vendorName,
        '{TOTAL_AMOUNT}': `${po.totalAmount.toLocaleString()} ${po.currency}`,
        '{DUE_DATE}': 'To be confirmed', // Can be customized per PO
        '{ITEM_LIST}': itemList,
        '{CONTACT_NAME}': contactName,
        '{COMPANY_NAME}': companyName,
        '{SENT_DATE}': sentDate
            ? sentDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
            : new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
    };

    let result = template;
    Object.entries(variables).forEach(([key, value]) => {
        result = result.replace(new RegExp(key, 'g'), value);
    });

    return result;
};

// Get template by ID
export const getTemplateById = (id: string): EmailTemplate | undefined => {
    return EMAIL_TEMPLATES.find(t => t.id === id);
};

// Get templates by category
export const getTemplatesByCategory = (category: EmailTemplate['category']): EmailTemplate[] => {
    return EMAIL_TEMPLATES.filter(t => t.category === category);
};

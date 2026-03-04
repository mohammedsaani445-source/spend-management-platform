import { db } from "./firebase";
import { ref, push, set, onValue, update } from "firebase/database";
import { HelpArticle, SupportTicket } from "@/types";

const TICKETS_COLLECTION = "support_tickets";

export const HELP_ARTICLES: HelpArticle[] = [
    {
        id: '1',
        category: 'GETTING_STARTED',
        title: 'Platform Overview',
        content: 'Welcome to the Spend Management Platform. This guide covers the basics of navigating the dashboard, managing requisitions, and tracking purchase orders.'
    },
    {
        id: '2',
        category: 'REQUISITIONS',
        title: 'How to create a Requisition',
        content: 'To create a requisition, go to the "Purchase Requisitions" tab and click "New Requisition". Fill in the items, vendor, and justification before submitting for approval.'
    },
    {
        id: '3',
        category: 'BUDGETS',
        title: 'Understanding Budget Alerts',
        content: 'Budget alerts are triggered when a department spend exceeds 80% or 100% of its allocated fiscal year budget. These are visible in the Notification Center.'
    },
    {
        id: '4',
        category: 'VENDORS',
        title: 'Vendor Acknowledgment',
        content: 'When you send a PO to a vendor, they receive a secure link. Once they "Acknowledge" the order, a digital watermark is applied and your dashboard is updated in real-time.'
    },
    {
        id: '5',
        category: 'POLICIES',
        title: 'Approval Hierarchies',
        content: 'Requisitions are automatically routed to the correct manager based on total amount and department policies. Managers can approve or reject directly from their portal.'
    },
    {
        id: '6',
        category: 'SECURITY',
        title: 'Setting up Two-Factor Authentication (2FA)',
        content: 'Enhance your account security by enabling TOTP-based 2FA in your Security Settings. Scan the provided QR code with an app like Google Authenticator or Authy to receive secure login codes.'
    },
    {
        id: '7',
        category: 'ACCOUNTING',
        title: '3-Way Matching Process',
        content: 'SpendLogic automates 3-way matching by comparing Purchase Orders, Goods Receipts, and Invoices. Discrepancies outside of tolerance levels are flagged for manual review to prevent payment errors.'
    },
    {
        id: '8',
        category: 'COMPLIANCE',
        title: 'Audit Trail & Transparency',
        content: 'Every action in the system—from requisition creation to payment—is logged in a permanent audit trail. This ensures high-level financial transparency and facilitates external audits.'
    }
];

export const submitSupportTicket = async (ticket: Omit<SupportTicket, 'id' | 'createdAt' | 'status'>) => {
    try {
        const ticketsRef = ref(db, TICKETS_COLLECTION);
        const newTicketRef = push(ticketsRef);

        const newTicket: SupportTicket = {
            ...ticket,
            id: newTicketRef.key!,
            status: 'OPEN',
            createdAt: new Date().toISOString()
        };

        await set(newTicketRef, newTicket);
        return newTicketRef.key;
    } catch (error) {
        console.error("Error submitting support ticket:", error);
        throw error;
    }
};

export const subscribeToTickets = (callback: (tickets: SupportTicket[]) => void) => {
    const ticketsRef = ref(db, TICKETS_COLLECTION);

    return onValue(ticketsRef, (snapshot) => {
        if (snapshot.exists()) {
            const data = snapshot.val();
            const ticketsList = Object.values(data) as SupportTicket[];
            // Sort by descending date
            ticketsList.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
            callback(ticketsList);
        } else {
            callback([]);
        }
    });
};

export const subscribeToUserTickets = (userId: string, callback: (tickets: SupportTicket[]) => void) => {
    const ticketsRef = ref(db, TICKETS_COLLECTION);

    return onValue(ticketsRef, (snapshot) => {
        if (snapshot.exists()) {
            const data = snapshot.val();
            const ticketsList = Object.values(data) as SupportTicket[];
            const filtered = ticketsList.filter(t => t.userId === userId);
            // Sort by descending date
            filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
            callback(filtered);
        } else {
            callback([]);
        }
    });
};

export const updateTicketStatus = async (ticketId: string, status: SupportTicket['status']) => {
    try {
        const ticketRef = ref(db, `${TICKETS_COLLECTION}/${ticketId}`);
        await update(ticketRef, { status });
    } catch (error) {
        console.error("Error updating ticket status:", error);
    }
};

export const searchHelpArticles = (query: string): HelpArticle[] => {
    if (!query) return HELP_ARTICLES;
    const lowerQuery = query.toLowerCase();
    return HELP_ARTICLES.filter(article =>
        article.title.toLowerCase().includes(lowerQuery) ||
        article.content.toLowerCase().includes(lowerQuery)
    );
};

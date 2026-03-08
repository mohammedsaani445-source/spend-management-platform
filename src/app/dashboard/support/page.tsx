"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { subscribeToTickets, updateTicketStatus } from "@/lib/help";
import { SupportTicket } from "@/types";
import { useRouter } from "next/navigation";
import Loader from "@/components/common/Loader";

export default function SupportAdminPage() {
    const { user, loading: authLoading } = useAuth();
    const [tickets, setTickets] = useState<SupportTicket[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<SupportTicket['status'] | 'ALL'>('ALL');
    const router = useRouter();

    useEffect(() => {
        if (authLoading) return;
        if (!user || user.role !== 'ADMIN') {
            router.push('/dashboard');
            return;
        }

        const unsubscribe = subscribeToTickets((data) => {
            setTickets(data);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [user, authLoading, router]);

    const filteredTickets = filter === 'ALL'
        ? tickets
        : tickets.filter(t => t.status === filter);

    const getTypeIcon = (type: SupportTicket['type']) => {
        switch (type) {
            case 'BUG': return '🐛';
            case 'QUESTION': return '❓';
            case 'FEATURE_REQUEST': return '💡';
            default: return '✉️';
        }
    };

    const getStatusColor = (status: SupportTicket['status']) => {
        switch (status) {
            case 'OPEN': return 'var(--error)';
            case 'IN_PROGRESS': return 'var(--primary)';
            case 'CLOSED': return 'var(--text-secondary)';
            default: return 'var(--text-secondary)';
        }
    };

    if (loading) return (
        <div className="page-container">
            <Loader text="Loading Support Tickets..." />
        </div>
    );

    return (
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            <div style={{ marginBottom: '2rem' }}>
                <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '0.5rem' }}>Support Management</h1>
                <p style={{ color: 'var(--text-secondary)' }}>Review and manage user reports, bugs, and inquiries.</p>
            </div>

            <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
                <button
                    className={`btn ${filter === 'ALL' ? 'btn-primary' : ''}`}
                    style={{ backgroundColor: filter === 'ALL' ? '' : 'white', border: '1px solid var(--border)', color: filter === 'ALL' ? '' : 'var(--text-main)' }}
                    onClick={() => setFilter('ALL')}
                >
                    All Tickets
                </button>
                <button
                    className={`btn ${filter === 'OPEN' ? 'btn-primary' : ''}`}
                    style={{ backgroundColor: filter === 'OPEN' ? '' : 'white', border: '1px solid var(--border)', color: filter === 'OPEN' ? '' : 'var(--text-main)' }}
                    onClick={() => setFilter('OPEN')}
                >
                    Open
                </button>
                <button
                    className={`btn ${filter === 'IN_PROGRESS' ? 'btn-primary' : ''}`}
                    style={{ backgroundColor: filter === 'IN_PROGRESS' ? '' : 'white', border: '1px solid var(--border)', color: filter === 'IN_PROGRESS' ? '' : 'var(--text-main)' }}
                    onClick={() => setFilter('IN_PROGRESS')}
                >
                    In Progress
                </button>
            </div>

            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead style={{ backgroundColor: 'rgba(0,0,0,0.02)', borderBottom: '1px solid var(--border)' }}>
                        <tr>
                            <th style={{ padding: '1rem 1.5rem', textAlign: 'left', fontSize: '0.85rem' }}>Type & Subject</th>
                            <th style={{ padding: '1rem 1.5rem', textAlign: 'left', fontSize: '0.85rem' }}>User</th>
                            <th style={{ padding: '1rem 1.5rem', textAlign: 'left', fontSize: '0.85rem' }}>Status</th>
                            <th style={{ padding: '1rem 1.5rem', textAlign: 'left', fontSize: '0.85rem' }}>Created</th>
                            <th style={{ padding: '1rem 1.5rem', textAlign: 'right', fontSize: '0.85rem' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredTickets.length === 0 ? (
                            <tr>
                                <td colSpan={5} style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                                    No support tickets found.
                                </td>
                            </tr>
                        ) : (
                            filteredTickets.map(ticket => (
                                <tr key={ticket.id} style={{ borderBottom: '1px solid var(--border)' }}>
                                    <td style={{ padding: '1.25rem 1.5rem' }}>
                                        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                                            <span style={{ fontSize: '1.25rem' }}>{getTypeIcon(ticket.type)}</span>
                                            <div>
                                                <div style={{ fontWeight: 700 }}>{ticket.subject}</div>
                                                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                                                    {ticket.description.length > 60 ? ticket.description.substring(0, 60) + '...' : ticket.description}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td style={{ padding: '1.25rem 1.5rem' }}>
                                        <div style={{ fontWeight: 600 }}>{ticket.userName}</div>
                                        <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{ticket.userEmail}</div>
                                    </td>
                                    <td style={{ padding: '1.25rem 1.5rem' }}>
                                        <span style={{
                                            display: 'inline-block',
                                            padding: '0.25rem 0.75rem',
                                            borderRadius: '20px',
                                            fontSize: '0.75rem',
                                            fontWeight: 700,
                                            backgroundColor: `${getStatusColor(ticket.status)}15`,
                                            color: getStatusColor(ticket.status),
                                            border: `1px solid ${getStatusColor(ticket.status)}30`
                                        }}>
                                            {ticket.status}
                                        </span>
                                    </td>
                                    <td style={{ padding: '1.25rem 1.5rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                                        {new Date(ticket.createdAt).toLocaleDateString()}
                                    </td>
                                    <td style={{ padding: '1.25rem 1.5rem', textAlign: 'right' }}>
                                        <select
                                            style={{ padding: '0.4rem', borderRadius: '8px', border: '1px solid var(--border)', fontSize: '0.8rem' }}
                                            value={ticket.status}
                                            onChange={(e) => updateTicketStatus(ticket.id, e.target.value as any)}
                                        >
                                            <option value="OPEN">Open</option>
                                            <option value="IN_PROGRESS">In Progress</option>
                                            <option value="CLOSED">Closed</option>
                                        </select>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { subscribeToTickets, updateTicketStatus } from "@/lib/help";
import { SupportTicket } from "@/types";
import { useRouter } from "next/navigation";
import Loader from "@/components/common/Loader";
import {
    Search, Filter, Clock, CheckCircle,
    MessageSquare, AlertCircle, HelpCircle,
    Lightbulb, ChevronRight, MoreVertical
} from "lucide-react";

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

    const getStatusInfo = (status: SupportTicket['status']) => {
        switch (status) {
            case 'OPEN': return { color: '#EF4444', bg: '#FEF2F2', label: 'Critical' };
            case 'IN_PROGRESS': return { color: '#4F46E5', bg: '#EEF2FF', label: 'Processing' };
            case 'CLOSED': return { color: '#10B981', bg: '#ECFDF5', label: 'Resolved' };
            default: return { color: '#6B7280', bg: '#F3F4F6', label: 'Unknown' };
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
                    <thead style={{ backgroundColor: '#F9FAFB', borderBottom: '1px solid #E5E7EB' }}>
                        <tr>
                            <th style={{ padding: '1rem 1.5rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: 700, color: '#4B5563', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Inquiry Details</th>
                            <th style={{ padding: '1rem 1.5rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: 700, color: '#4B5563', textTransform: 'uppercase', letterSpacing: '0.05em' }}>End User</th>
                            <th style={{ padding: '1rem 1.5rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: 700, color: '#4B5563', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Current Status</th>
                            <th style={{ padding: '1rem 1.5rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: 700, color: '#4B5563', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Reported On</th>
                            <th style={{ padding: '1rem 1.5rem', textAlign: 'right', fontSize: '0.75rem', fontWeight: 700, color: '#4B5563', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredTickets.length === 0 ? (
                            <tr>
                                <td colSpan={5} style={{ padding: '6rem', textAlign: 'center' }}>
                                    <div style={{ color: '#9CA3AF', marginBottom: '1rem' }}><MessageSquare size={48} /></div>
                                    <h3 style={{ margin: 0, fontWeight: 800, color: '#111827' }}>No Support Queries</h3>
                                    <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.875rem', color: '#6B7280' }}>All clear! There are no tickets matching your current filter.</p>
                                </td>
                            </tr>
                        ) : (
                            filteredTickets.map(ticket => {
                                const status = getStatusInfo(ticket.status);
                                return (
                                    <tr key={ticket.id} style={{ borderBottom: '1px solid #F3F4F6', transition: 'background 0.2s' }}>
                                        <td style={{ padding: '1.5rem' }}>
                                            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                                                <div style={{
                                                    width: 40, height: 40, borderRadius: '10px',
                                                    background: ticket.type === 'BUG' ? '#FEF2F2' : ticket.type === 'FEATURE_REQUEST' ? '#EFF6FF' : '#FFFBEB',
                                                    color: ticket.type === 'BUG' ? '#EF4444' : ticket.type === 'FEATURE_REQUEST' ? '#3B82F6' : '#F59E0B',
                                                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                                                }}>
                                                    {ticket.type === 'BUG' ? <AlertCircle size={20} /> : ticket.type === 'FEATURE_REQUEST' ? <Lightbulb size={20} /> : <HelpCircle size={20} />}
                                                </div>
                                                <div>
                                                    <div style={{ fontWeight: 700, color: '#111827', fontSize: '0.9375rem' }}>{ticket.subject}</div>
                                                    <div style={{ fontSize: '0.8125rem', color: '#6B7280', marginTop: '0.125rem', maxWidth: '300px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                        {ticket.description}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td style={{ padding: '1.5rem' }}>
                                            <div style={{ fontWeight: 600, color: '#111827' }}>{ticket.userName}</div>
                                            <div style={{ fontSize: '0.8125rem', color: '#6B7280' }}>{ticket.userEmail}</div>
                                        </td>
                                        <td style={{ padding: '1.5rem' }}>
                                            <span style={{
                                                display: 'inline-flex',
                                                alignItems: 'center',
                                                gap: '0.375rem',
                                                padding: '0.375rem 0.75rem',
                                                borderRadius: '9999px',
                                                fontSize: '0.75rem',
                                                fontWeight: 700,
                                                backgroundColor: status.bg,
                                                color: status.color,
                                                border: `1px solid ${status.color}20`
                                            }}>
                                                <div style={{ width: 6, height: 6, borderRadius: '50%', background: status.color }} />
                                                {status.label}
                                            </span>
                                        </td>
                                        <td style={{ padding: '1.5rem', fontSize: '0.875rem', color: '#6B7280' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                <Clock size={14} />
                                                {new Date(ticket.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                            </div>
                                        </td>
                                        <td style={{ padding: '1.5rem', textAlign: 'right' }}>
                                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                                                <select
                                                    style={{
                                                        padding: '0.4rem 0.75rem', border: '1px solid #E5E7EB',
                                                        borderRadius: '8px', fontSize: '0.8125rem', fontWeight: 600,
                                                        background: 'white', cursor: 'pointer', outline: 'none'
                                                    }}
                                                    value={ticket.status}
                                                    onChange={(e) => updateTicketStatus(ticket.id, e.target.value as any)}
                                                >
                                                    <option value="OPEN">Mark Open</option>
                                                    <option value="IN_PROGRESS">Processing</option>
                                                    <option value="CLOSED">Resolved</option>
                                                </select>
                                                <button style={{ padding: '0.4rem', border: '1px solid #E5E7EB', borderRadius: '8px', background: 'white', color: '#6B7280' }}>
                                                    <MoreVertical size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

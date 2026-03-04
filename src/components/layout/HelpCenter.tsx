"use client";

import { useState, useRef, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { HELP_ARTICLES, searchHelpArticles, submitSupportTicket, subscribeToUserTickets } from "@/lib/help";
import { HelpArticle, SupportTicket } from "@/types";
import styles from "./Layout.module.css";

export default function HelpCenter() {
    const { user } = useAuth();
    const [isOpen, setIsOpen] = useState(false);
    const [view, setView] = useState<'HOME' | 'ARTICLES' | 'CONTACT' | 'ARTICLE_DETAIL' | 'MY_TICKETS'>('HOME');
    const [searchQuery, setSearchQuery] = useState("");
    const [filteredArticles, setFilteredArticles] = useState<HelpArticle[]>(HELP_ARTICLES);
    const [selectedArticle, setSelectedArticle] = useState<HelpArticle | null>(null);
    const [userTickets, setUserTickets] = useState<SupportTicket[]>([]);
    const [ticketForm, setTicketForm] = useState({ subject: "", type: "QUESTION" as any, description: "" });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitSuccess, setSubmitSuccess] = useState(false);

    const drawerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        setFilteredArticles(searchHelpArticles(searchQuery));
    }, [searchQuery]);

    useEffect(() => {
        const handleOpenEvent = () => {
            setIsOpen(true);
            setView('HOME');
        };
        window.addEventListener('open-help-center', handleOpenEvent);
        return () => window.removeEventListener('open-help-center', handleOpenEvent);
    }, []);

    useEffect(() => {
        if (user && isOpen && view === 'MY_TICKETS') {
            const unsubscribe = subscribeToUserTickets(user.uid, (tickets) => {
                setUserTickets(tickets);
            });
            return () => unsubscribe();
        }
    }, [user, isOpen, view]);



    const handleSubmitTicket = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;
        setIsSubmitting(true);
        try {
            await submitSupportTicket({
                userId: user.uid,
                userName: user.displayName,
                userEmail: user.email,
                ...ticketForm
            });
            setSubmitSuccess(true);
            setTicketForm({ subject: "", type: "QUESTION", description: "" });
            setTimeout(() => {
                setSubmitSuccess(false);
                setIsOpen(false);
            }, 3000);
        } catch (error) {
            alert("Failed to submit ticket. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <>
            {/* Backdrop */}
            {isOpen && <div className={styles.drawerBackdrop} onClick={() => setIsOpen(false)} />}

            {/* Help Drawer */}
            <div className={`${styles.helpDrawer} ${isOpen ? styles.helpDrawerOpen : ''}`} ref={drawerRef}>
                <div className={styles.drawerHeader} style={{ background: 'var(--surface)', border: 'none', padding: '1.5rem 2rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div style={{ fontSize: '1.5rem' }}>🤝</div>
                        <h2 style={{ fontSize: '1.25rem', fontWeight: 900, margin: 0 }}>Support Center</h2>
                    </div>
                    <button className={styles.closeButton} onClick={() => setIsOpen(false)} style={{ fontSize: '1.5rem' }}>✕</button>
                </div>

                <div className={styles.drawerContent} style={{ padding: 0 }}>
                    {view === 'HOME' && (
                        <div className={styles.helpHome}>
                            {/* Binance Style Hero Search */}
                            <div style={{
                                background: 'linear-gradient(180deg, var(--accent) 0%, var(--accent-hover) 100%)',
                                padding: '2.5rem 2rem',
                                textAlign: 'center',
                                color: 'white'
                            }}>
                                <h1 style={{ fontSize: '1.8rem', fontWeight: 900, marginBottom: '1.5rem' }}>How can we help?</h1>
                                <div style={{
                                    position: 'relative',
                                    maxWidth: '360px',
                                    margin: '0 auto'
                                }}>
                                    <input
                                        type="text"
                                        placeholder="Search for articles or topics..."
                                        value={searchQuery}
                                        style={{
                                            width: '100%',
                                            padding: '1rem 3rem 1rem 1.25rem',
                                            borderRadius: '12px',
                                            border: 'none',
                                            fontSize: '0.95rem',
                                            boxShadow: 'var(--shadow-md)',
                                            color: 'var(--text-main)',
                                            background: 'var(--surface)'
                                        }}
                                        onChange={(e) => {
                                            setSearchQuery(e.target.value);
                                            if (e.target.value) setView('ARTICLES');
                                        }}
                                    />
                                    <span style={{ position: 'absolute', right: '1.25rem', top: '50%', transform: 'translateY(-50%)', opacity: 0.5 }}>🔍</span>
                                </div>
                            </div>

                            {/* Icon Grid */}
                            <div style={{ padding: '2rem' }}>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '2rem' }}>
                                    {[
                                        { icon: '📚', label: 'Knowledge Base', view: 'ARTICLES' },
                                        { icon: '🎫', label: 'Submit Ticket', view: 'CONTACT' },
                                        { icon: '📋', label: 'My Requests', view: 'MY_TICKETS' },
                                        { icon: '🔒', label: 'Account Security', view: 'ARTICLES' },
                                        { icon: '⚡', label: 'Quick Tutorials', view: 'ARTICLES' }
                                    ].map((item, idx) => (
                                        <div
                                            key={idx}
                                            onClick={() => setView(item.view as any)}
                                            style={{
                                                padding: '1.25rem',
                                                borderRadius: '16px',
                                                border: '1px solid var(--border)',
                                                textAlign: 'center',
                                                cursor: 'pointer',
                                                transition: 'all 0.2s',
                                                background: 'var(--surface)'
                                            }}
                                            onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--accent)'}
                                            onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--border)'}
                                        >
                                            <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>{item.icon}</div>
                                            <div style={{ fontSize: '0.85rem', fontWeight: 700 }}>{item.label}</div>
                                        </div>
                                    ))}
                                </div>

                                {/* Trending Section */}
                                <div className={styles.recentArticles}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                                        <h4 style={{ fontSize: '0.9rem', fontWeight: 800 }}>Trending Topics</h4>
                                        <span style={{ fontSize: '0.75rem', color: 'var(--accent)', fontWeight: 700, cursor: 'pointer' }}>View All</span>
                                    </div>
                                    {HELP_ARTICLES.slice(0, 4).map(article => (
                                        <div key={article.id} className={styles.articleLink} onClick={() => {
                                            setSelectedArticle(article);
                                            setView('ARTICLE_DETAIL');
                                        }} style={{ padding: '0.875rem 0', borderBottom: '1px solid rgba(0,0,0,0.03)', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                            <span style={{ opacity: 0.3, fontSize: '0.7rem' }}>●</span>
                                            <span style={{ flex: 1 }}>{article.title}</span>
                                            <span style={{ opacity: 0.3 }}>›</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {(view === 'ARTICLES' || searchQuery) && (
                        <div className={styles.articleList} style={{ padding: '2rem' }}>
                            <button className={styles.backButton} onClick={() => {
                                setView('HOME');
                                setSearchQuery("");
                            }} style={{ marginBottom: '1.5rem', color: 'var(--accent)', fontWeight: 700 }}>← Back to Support</button>
                            <h3 style={{ fontSize: '1.25rem', fontWeight: 900, marginBottom: '1.5rem' }}>{searchQuery ? `Results for "${searchQuery}"` : 'Knowledge Base'}</h3>
                            {filteredArticles.length === 0 ? (
                                <div style={{ textAlign: 'center', padding: '3rem 1rem' }}>
                                    <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔦</div>
                                    <p style={{ color: 'var(--text-secondary)' }}>No articles found. Try different keywords.</p>
                                </div>
                            ) : (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                    {filteredArticles.map(article => (
                                        <div
                                            key={article.id}
                                            className={styles.articleItem}
                                            onClick={() => {
                                                setSelectedArticle(article);
                                                setView('ARTICLE_DETAIL');
                                            }}
                                            style={{
                                                padding: '1.25rem',
                                                borderRadius: '12px',
                                                border: '1px solid var(--border)',
                                                transition: 'all 0.2s',
                                                cursor: 'pointer'
                                            }}
                                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(0,0,0,0.02)'}
                                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                                        >
                                            <div style={{ fontSize: '0.7rem', color: 'var(--accent)', fontWeight: 800, marginBottom: '0.25rem' }}>{article.category.toUpperCase()}</div>
                                            <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>{article.title}</div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {view === 'ARTICLE_DETAIL' && selectedArticle && (
                        <div className={styles.articleDetail} style={{ padding: '2rem' }}>
                            <button className={styles.backButton} onClick={() => setView('ARTICLES')} style={{ color: 'var(--accent)', fontWeight: 700 }}>← Back</button>
                            <div style={{ marginTop: '2rem' }}>
                                <div style={{ fontSize: '0.75rem', color: 'var(--accent)', fontWeight: 800, letterSpacing: '0.05em' }}>{selectedArticle.category.toUpperCase()}</div>
                                <h1 style={{ fontSize: '1.75rem', fontWeight: 900, margin: '0.75rem 0 1.5rem 0', lineHeight: 1.2 }}>{selectedArticle.title}</h1>
                                <div style={{
                                    fontSize: '1rem',
                                    lineHeight: 1.6,
                                    color: 'var(--text-main)',
                                    background: 'var(--background)',
                                    padding: '1.5rem',
                                    borderRadius: '16px',
                                    border: '1px solid var(--border)'
                                }}>
                                    {selectedArticle.content}
                                </div>
                                <div style={{ marginTop: '2.5rem', padding: '1.5rem', borderRadius: '12px', background: 'rgba(0,0,0,0.02)', textAlign: 'center' }}>
                                    <p style={{ fontSize: '0.9rem', marginBottom: '1rem', fontWeight: 600 }}>Was this article helpful?</p>
                                    <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem' }}>
                                        <button className="btn" style={{ padding: '0.5rem 1.5rem', border: '1px solid var(--border)' }}>👍 Yes</button>
                                        <button className="btn" style={{ padding: '0.5rem 1.5rem', border: '1px solid var(--border)' }}>👎 No</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {view === 'CONTACT' && (
                        <div className={styles.contactSupport} style={{ padding: '2rem' }}>
                            <button className={styles.backButton} onClick={() => setView('HOME')} style={{ color: 'var(--accent)', fontWeight: 700 }}>← Back</button>
                            <h2 style={{ fontSize: '1.5rem', fontWeight: 900, margin: '1.5rem 0 0.5rem 0' }}>Submit Request</h2>
                            <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem', fontSize: '0.9rem' }}>
                                Our specialists typically respond within 12-24 hours.
                            </p>

                            {submitSuccess ? (
                                <div style={{ textAlign: 'center', padding: '3rem 1rem', background: 'rgba(4, 156, 99, 0.05)', borderRadius: '24px' }}>
                                    <div style={{ fontSize: '4rem', marginBottom: '1.5rem' }}>✅</div>
                                    <h3 style={{ fontWeight: 900, marginBottom: '0.5rem' }}>Ticket Received</h3>
                                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>We've assigned a specialist to your case.</p>
                                </div>
                            ) : (
                                <form className={styles.ticketForm} onSubmit={handleSubmitTicket} style={{ gap: '1.25rem', display: 'flex', flexDirection: 'column' }}>
                                    <div className="form-group">
                                        <label style={{ fontWeight: 700 }}>Subject</label>
                                        <input
                                            required
                                            style={{ borderRadius: '10px' }}
                                            placeholder="Briefly describe your issue"
                                            value={ticketForm.subject}
                                            onChange={e => setTicketForm({ ...ticketForm, subject: e.target.value })}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label style={{ fontWeight: 700 }}>Issue Category</label>
                                        <select
                                            style={{ borderRadius: '10px' }}
                                            value={ticketForm.type}
                                            onChange={e => setTicketForm({ ...ticketForm, type: e.target.value as any })}
                                        >
                                            <option value="QUESTION">Account Inquiry</option>
                                            <option value="BUG">Technical Issue</option>
                                            <option value="FEATURE_REQUEST">Feature Suggestion</option>
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label style={{ fontWeight: 700 }}>Detailed Description</label>
                                        <textarea
                                            required
                                            rows={4}
                                            style={{ borderRadius: '10px' }}
                                            placeholder="Provide as much detail as possible..."
                                            value={ticketForm.description}
                                            onChange={e => setTicketForm({ ...ticketForm, description: e.target.value })}
                                        />
                                    </div>
                                    <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '1rem', background: 'var(--accent)', border: 'none', color: 'white', fontWeight: 800 }} disabled={isSubmitting}>
                                        {isSubmitting ? 'Processing...' : 'Submit Request'}
                                    </button>
                                </form>
                            )}
                        </div>
                    )}

                    {view === 'MY_TICKETS' && (
                        <div style={{ padding: '2rem' }}>
                            <button className={styles.backButton} onClick={() => setView('HOME')} style={{ color: '#F0B90B', fontWeight: 700 }}>← Back</button>
                            <h2 style={{ fontSize: '1.5rem', fontWeight: 900, margin: '1.5rem 0 1.5rem 0' }}>{user ? 'My Requests' : 'Support Tickets'}</h2>

                            {!user ? (
                                <div style={{ textAlign: 'center', padding: '3rem 1rem' }}>
                                    <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔐</div>
                                    <p style={{ color: 'var(--text-secondary)' }}>Please sign in to view your support history and track active requests.</p>
                                </div>
                            ) : userTickets.length === 0 ? (
                                <div style={{ textAlign: 'center', padding: '3rem 1rem' }}>
                                    <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🎫</div>
                                    <p style={{ color: 'var(--text-secondary)' }}>You haven't submitted any tickets yet.</p>
                                    <button className="btn" onClick={() => setView('CONTACT')} style={{ marginTop: '1rem', color: 'var(--accent)', fontWeight: 700 }}>Submit Your First Ticket</button>
                                </div>
                            ) : (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                    {userTickets.map(ticket => (
                                        <div key={ticket.id} style={{
                                            padding: '1.25rem',
                                            borderRadius: '16px',
                                            border: '1px solid var(--border)',
                                            background: 'var(--surface)'
                                        }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                                                <div style={{ fontWeight: 800, fontSize: '0.95rem' }}>{ticket.subject}</div>
                                                <span style={{
                                                    fontSize: '0.65rem',
                                                    fontWeight: 900,
                                                    padding: '2px 8px',
                                                    borderRadius: '10px',
                                                    background: ticket.status === 'OPEN' ? 'rgba(4, 156, 99, 0.1)' : 'rgba(0,0,0,0.05)',
                                                    color: ticket.status === 'OPEN' ? '#049C63' : 'var(--text-secondary)'
                                                }}>
                                                    {ticket.status}
                                                </span>
                                            </div>
                                            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: '0 0 1rem 0' }}>{ticket.description.substring(0, 100)}...</p>
                                            <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', fontWeight: 500 }}>
                                                Submitted on {new Date(ticket.createdAt).toLocaleDateString()}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>

                <div className={styles.drawerFooter} style={{ textAlign: 'center', padding: '1rem' }}>
                    <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)' }}>
                        <span style={{ color: '#049C63' }}>●</span> System Status: All Systems Operational
                    </div>
                </div>
            </div>
        </>
    );
}

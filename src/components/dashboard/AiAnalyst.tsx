"use client";

import { useState, useRef, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { querySpendAnalyst } from "@/lib/ai_analyst";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface Message {
    role: "user" | "analyst";
    text: string;
}

const SUGGESTED_QUERIES = [
    "What was our IT spend last quarter?",
    "Show me anomalous vendor activity.",
    "Which budgets are nearing capacity?",
    "Identify duplicate invoice risks."
];

export default function AiAnalyst() {
    const { user } = useAuth();
    const [query, setQuery] = useState("");
    const [messages, setMessages] = useState<Message[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isLoading]);

    const handleQuery = async (e?: React.FormEvent, textQuery?: string) => {
        if (e) e.preventDefault();
        const q = textQuery || query;
        if (!q.trim() || !user || isLoading) return;

        setQuery("");
        setMessages(prev => [...prev, { role: "user", text: q }]);
        setIsLoading(true);

        try {
            const answer = await querySpendAnalyst(user.tenantId, q);
            setMessages(prev => [...prev, { role: "analyst", text: answer }]);
        } catch (error) {
            setMessages(prev => [...prev, { role: "analyst", text: "I'm sorry, I encountered an issue processing your request." }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="card" style={{ padding: '0', height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            {/* Header */}
            <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--surface-main)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{
                        fontSize: '1.25rem',
                        background: 'linear-gradient(135deg, var(--primary), var(--accent))',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        fontWeight: 800
                    }}>
                        ✨ SANI - Enterprise AI Analyst
                    </div>
                </div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--success)', display: 'inline-block' }}></span>
                    Online
                </div>
            </div>

            {/* Chat Area */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem', background: '#FAFAFA' }}>
                {messages.length === 0 ? (
                    <div style={{ margin: 'auto', textAlign: 'center', color: 'var(--text-secondary)', maxWidth: '400px' }}>
                        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🤖</div>
                        <h3 style={{ color: 'var(--text-main)', marginBottom: '0.5rem' }}>How can I help you optimize spend today?</h3>
                        <p style={{ fontSize: '0.9rem', marginBottom: '1.5rem' }}>I can analyze invoices, identify budget risks, and provide actionable procurement insights.</p>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            {SUGGESTED_QUERIES.map(sq => (
                                <button
                                    key={sq}
                                    onClick={() => handleQuery(undefined, sq)}
                                    className="hover-lift"
                                    style={{
                                        padding: '0.75rem 1rem',
                                        background: 'var(--surface-main)',
                                        border: '1px solid var(--border)',
                                        borderRadius: '8px',
                                        fontSize: '0.85rem',
                                        color: 'var(--primary)',
                                        cursor: 'pointer',
                                        textAlign: 'left',
                                        transition: 'all 0.2s ease'
                                    }}>
                                    &rarr; {sq}
                                </button>
                            ))}
                        </div>
                    </div>
                ) : (
                    messages.map((msg, idx) => (
                        <div key={idx} style={{
                            alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
                            maxWidth: '85%',
                            background: msg.role === 'user' ? 'var(--primary)' : 'var(--surface-main)',
                            color: msg.role === 'user' ? '#fff' : 'var(--text-main)',
                            padding: '1rem 1.25rem',
                            borderRadius: '12px',
                            borderBottomRightRadius: msg.role === 'user' ? 0 : '12px',
                            borderBottomLeftRadius: msg.role === 'analyst' ? 0 : '12px',
                            boxShadow: 'var(--shadow-sm)',
                            border: msg.role === 'analyst' ? '1px solid var(--border)' : 'none',
                        }}>
                            {msg.role === 'analyst' ? (
                                <div className="markdown-body" style={{ fontSize: '0.95rem', lineHeight: '1.6' }}>
                                    <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.text}</ReactMarkdown>
                                </div>
                            ) : (
                                <div style={{ fontSize: '0.95rem', lineHeight: '1.4' }}>{msg.text}</div>
                            )}
                        </div>
                    ))
                )}
                {isLoading && (
                    <div style={{ alignSelf: 'flex-start', background: 'var(--surface-main)', padding: '1rem', borderRadius: '12px', border: '1px solid var(--border)', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                        <span className="dot-pulse" style={{ width: 6, height: 6, background: 'var(--primary)', borderRadius: '50%', animation: 'pulse 1s infinite' }}></span>
                        <span className="dot-pulse" style={{ width: 6, height: 6, background: 'var(--primary)', borderRadius: '50%', animation: 'pulse 1s infinite', animationDelay: '0.2s' }}></span>
                        <span className="dot-pulse" style={{ width: 6, height: 6, background: 'var(--primary)', borderRadius: '50%', animation: 'pulse 1s infinite', animationDelay: '0.4s' }}></span>
                        <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginLeft: '0.5rem' }}>SANI is analyzing...</span>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Form */}
            <div style={{ padding: '1.25rem 1.5rem', background: 'var(--surface-main)', borderTop: '1px solid var(--border)' }}>
                <form onSubmit={(e) => handleQuery(e)} style={{ display: 'flex', gap: '0.75rem' }}>
                    <input
                        type="text"
                        placeholder="Ask SANI a question..."
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        style={{ flex: 1, padding: '0.75rem 1rem', borderRadius: '8px', border: '1px solid var(--border)', outline: 'none', fontSize: '0.95rem' }}
                        disabled={isLoading}
                    />
                    <button type="submit" className="btn btn-primary" disabled={isLoading || !query.trim()} style={{ padding: '0 1.5rem' }}>
                        Send
                    </button>
                </form>
            </div>
        </div>
    );
}

"use client";

import { useState, useRef, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { querySpendAnalyst } from "@/lib/ai_analyst";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { 
    Sparkles, 
    Send, 
    Trash2, 
    MessageSquare, 
    Brain, 
    Zap, 
    Command,
    Info,
    History,
    MoreHorizontal,
    Cpu
} from "lucide-react";

interface Message {
    role: "user" | "analyst";
    text: string;
    timestamp: number;
}

interface ChatSession {
    id: string;
    messages: Message[];
    title: string;
    lastUpdated: number;
}

const SUGGESTED_QUERIES = [
    "Are we having a low stock alert?",
    "Show me all pending POs.",
    "Which budgets are nearing capacity?",
    "What was our total ICT spend?"
];

const CONTEXT_CHIPS = [
    { label: "Vendors", status: "Mapped" },
    { label: "Budgets", status: "Real-time" },
    { label: "Invoices", status: "Indexed" },
    { label: "Contracts", status: "Monitored" }
];

export default function AiAnalyst() {
    const { user } = useAuth();
    const [query, setQuery] = useState("");
    const [messages, setMessages] = useState<Message[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const chatViewportRef = useRef<HTMLDivElement>(null);

    const [sessions, setSessions] = useState<ChatSession[]>([]);
    const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
    const [isHistoryOpen, setIsHistoryOpen] = useState(false);
    const [showClearConfirm, setShowClearConfirm] = useState(false);

    const scrollToBottom = () => {
        if (chatViewportRef.current) {
            chatViewportRef.current.scrollTop = chatViewportRef.current.scrollHeight;
        }
    };

    // Load session list on mount
    useEffect(() => {
        if (!user) return;
        const fetchSessions = async () => {
            try {
                const { ref, get, child } = await import("firebase/database");
                const { db, DB_PREFIX } = await import("@/lib/firebase");
                const sessRef = ref(db, `${DB_PREFIX}/tenants/${user.tenantId}/users/${user.uid}/ai_history`);
                const snap = await get(sessRef);
                if (snap.exists()) {
                    const data = snap.val();
                    const list = Object.values(data) as ChatSession[];
                    setSessions(list.sort((a, b) => b.lastUpdated - a.lastUpdated));
                }
            } catch (err) {
                console.error("Failed to load AI sessions:", err);
            }
        };
        fetchSessions();
    }, [user]);

    useEffect(() => {
        scrollToBottom();
    }, [messages, isLoading]);

    const handleNewChat = () => {
        setMessages([]);
        setCurrentSessionId(null);
        setIsHistoryOpen(false);
    };

    const loadSession = (session: ChatSession) => {
        setMessages(session.messages);
        setCurrentSessionId(session.id);
        setIsHistoryOpen(false);
    };

    const handleClearChat = async () => {
        setShowClearConfirm(false);
        
        if (currentSessionId && user) {
            try {
                const { ref, remove } = await import("firebase/database");
                const { db, DB_PREFIX } = await import("@/lib/firebase");
                await remove(ref(db, `${DB_PREFIX}/tenants/${user.tenantId}/users/${user.uid}/ai_history/${currentSessionId}`));
                setSessions(prev => prev.filter(s => s.id !== currentSessionId));
            } catch (err) {
                console.error("Failed to delete session:", err);
            }
        }
        
        setMessages([]);
        setCurrentSessionId(null);
    };

    const handleExport = () => {
        const content = messages.map(m => `[${m.role.toUpperCase()}] ${m.text}`).join('\n\n');
        const blob = new Blob([content], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `SANI_Intelligence_Log_${new Date().toISOString().slice(0, 10)}.txt`;
        link.click();
        URL.revokeObjectURL(url);
    };

    const handleQuery = async (e?: React.FormEvent, textQuery?: string) => {
        if (e) e.preventDefault();
        const q = textQuery || query;
        if (!q.trim() || !user || isLoading) return;

        setQuery("");
        const newMessage: Message = { role: "user", text: q, timestamp: Date.now() };
        const updatedMessages = [...messages, newMessage];
        setMessages(updatedMessages);
        setIsLoading(true);

        try {
            const response = await fetch("/api/analyst", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ tenantId: user.tenantId, query: q })
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || "API request failed");
            }
            
            const data = await response.json();
            const analystMessage: Message = { role: "analyst", text: data.answer, timestamp: Date.now() };
            const finalMessages = [...updatedMessages, analystMessage];
            setMessages(finalMessages);

            // Persist to Firebase
            const { ref, set } = await import("firebase/database");
            const { db, DB_PREFIX } = await import("@/lib/firebase");
            const sessionId = currentSessionId || `session_${Date.now()}`;
            if (!currentSessionId) setCurrentSessionId(sessionId);
            
            const session: ChatSession = {
                id: sessionId,
                messages: finalMessages,
                title: q.slice(0, 40) + (q.length > 40 ? '...' : ''),
                lastUpdated: Date.now()
            };

            await set(ref(db, `${DB_PREFIX}/tenants/${user.tenantId}/users/${user.uid}/ai_history/${sessionId}`), session);
            
            // Update local sessions list
            setSessions(prev => {
                const otherSessions = prev.filter(s => s.id !== sessionId);
                return [session, ...otherSessions];
            });

        } catch (error: any) {
            setMessages(prev => [...prev, { role: "analyst", text: `⚠️ Error: ${error.message}`, timestamp: Date.now() }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="premium-card" style={{ 
            padding: '0', 
            height: '650px', 
            display: 'flex', 
            flexDirection: 'column', 
            overflow: 'hidden',
            border: '1px solid var(--border)',
            borderRadius: '20px',
            boxShadow: 'var(--shadow-sm)',
            background: 'var(--surface)',
            position: 'relative'
        }}>
            {/* Header */}
            <div style={{ 
                padding: '1.25rem 1.75rem', 
                borderBottom: '1px solid var(--border)', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'space-between', 
                background: 'var(--surface-2)'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem' }}>
                    <div className="pulse-container" style={{ position: 'relative' }}>
                        <div style={{ 
                            width: '44px', height: '44px', borderRadius: '12px', 
                            background: 'linear-gradient(135deg, var(--brand), var(--brand-dark))', 
                            display: 'flex', alignItems: 'center', justifyContent: 'center', 
                            color: '#fff', boxShadow: '0 4px 12px rgba(232, 87, 42, 0.3)' 
                        }}>
                            <Cpu size={22} strokeWidth={2.5} />
                        </div>
                        <div style={{ position: 'absolute', bottom: '-2px', right: '-2px', width: '14px', height: '14px', borderRadius: '50%', background: 'var(--success)', border: '2px solid #fff' }}></div>
                    </div>
                    <div>
                        <div style={{ fontSize: '1.125rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.03em', lineHeight: '1.2' }}>SANI</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Strategic AI Network Intelligence</div>
                    </div>
                </div>
                <div style={{ display: 'flex', gap: '0.625rem' }}>
                    <button 
                        className="btn-icon" 
                        title="History" 
                        onClick={() => setIsHistoryOpen(!isHistoryOpen)}
                        style={{ 
                            width: '36px', height: '36px', borderRadius: '10px', 
                            border: `1px solid ${isHistoryOpen ? 'var(--brand)' : 'var(--border)'}`, 
                            background: isHistoryOpen ? 'var(--brand-soft)' : 'var(--surface)', 
                            color: isHistoryOpen ? 'var(--brand)' : 'var(--text-secondary)',
                            transition: 'all 0.2s ease'
                        }}
                    >
                        <History size={16} />
                    </button>
                    <button 
                        className="btn-icon" 
                        onClick={() => setShowClearConfirm(true)} 
                        title="Clear Chat" 
                        style={{ width: '36px', height: '36px', borderRadius: '10px', border: '1px solid var(--border)', background: 'var(--surface)', color: '#FF4842' }}
                    >
                        <Trash2 size={16} />
                    </button>
                    <button 
                        className="btn-icon" 
                        onClick={handleExport}
                        title="Export Log" 
                        style={{ width: '36px', height: '36px', borderRadius: '10px', border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--text-secondary)' }}
                    >
                        <MoreHorizontal size={16} />
                    </button>
                </div>
            </div>

            {/* Chat Area */}
            <div 
                ref={chatViewportRef}
                className="chat-viewport" 
                style={{ 
                flex: 1, 
                overflowY: 'auto', 
                padding: '1.75rem', 
                display: 'flex', 
                flexDirection: 'column', 
                gap: '1.5rem', 
                background: 'transparent',
                scrollBehavior: 'smooth'
            }}>
                {messages.length === 0 ? (
                    <div style={{ margin: 'auto', textAlign: 'center', maxWidth: '420px', animation: 'fadeIn 0.6s ease-out' }}>
                        <div style={{ 
                            width: '88px', 
                            height: '88px', 
                            borderRadius: '24px', 
                            background: 'var(--brand-soft)', 
                            boxShadow: 'var(--shadow-sm)', 
                            margin: '0 auto 1.75rem', 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'center', 
                            color: 'var(--brand)',
                            border: '1px solid var(--brand-xsoft)'
                        }}>
                            <Brain size={44} strokeWidth={1.5} />
                        </div>
                        <h2 style={{ fontSize: '1.875rem', fontWeight: 900, color: 'var(--text-primary)', marginBottom: '1rem', letterSpacing: '-0.04em' }}>
                            Precision Analytics
                        </h2>
                        <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6', marginBottom: '2.25rem', fontSize: '1rem', fontWeight: 500 }}>
                            I am SANI. I have processed your enterprise spend matrix and identified potential optimization vectors. How shall we refine your fiscal strategy today?
                        </p>

                        <div style={{ display: 'flex', justifyContent: 'center', gap: '0.75rem', marginBottom: '2.5rem', flexWrap: 'wrap' }}>
                            {CONTEXT_CHIPS.map(c => (
                                <div key={c.label} style={{ 
                                    padding: '6px 14px', 
                                    background: 'rgba(232, 87, 42, 0.05)', 
                                    border: '1px solid rgba(232, 87, 42, 0.1)', 
                                    borderRadius: '99px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px'
                                }}>
                                    <Zap size={10} fill="var(--brand)" color="var(--brand)" />
                                    <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--brand)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{c.label}: {c.status}</span>
                                </div>
                            ))}
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                            {SUGGESTED_QUERIES.map(sq => (
                                <button
                                    key={sq}
                                    onClick={() => handleQuery(undefined, sq)}
                                    className="suggested-query-btn"
                                    style={{
                                        padding: '1.25rem',
                                        background: '#fff',
                                        border: '1px solid var(--border)',
                                        borderRadius: '16px',
                                        fontSize: '0.875rem',
                                        color: 'var(--text-primary)',
                                        cursor: 'pointer',
                                        textAlign: 'left',
                                        fontWeight: 700,
                                        boxShadow: 'var(--shadow-sm)',
                                        transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        gap: '0.625rem'
                                    }}>
                                    <Sparkles size={16} color="var(--brand)" />
                                    {sq}
                                </button>
                            ))}
                        </div>
                    </div>
                ) : (
                    messages.map((msg, idx) => (
                        <div key={idx} style={{
                            alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
                            maxWidth: msg.role === 'analyst' ? '92%' : '80%',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '0.625rem',
                            animation: 'slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards'
                        }}>
                            <div style={{
                                background: msg.role === 'user' ? 'var(--text-primary)' : '#fff',
                                color: msg.role === 'user' ? '#fff' : 'var(--text-primary)',
                                padding: msg.role === 'analyst' ? '1.75rem 2.25rem' : '1rem 1.5rem',
                                borderRadius: msg.role === 'user' ? '20px 20px 4px 20px' : '4px 20px 20px 20px',
                                boxShadow: msg.role === 'analyst' ? 'var(--shadow-lg)' : 'var(--shadow-sm)',
                                border: msg.role === 'analyst' ? '1px solid var(--border)' : 'none',
                                position: 'relative'
                            }}>
                                {msg.role === 'analyst' && (
                                    <div style={{ 
                                        position: 'absolute', top: '1.25rem', left: '-0.875rem', 
                                        width: '30px', height: '30px', borderRadius: '8px', 
                                        background: 'linear-gradient(135deg, var(--brand), var(--brand-dark))', 
                                        display: 'flex', alignItems: 'center', justifyContent: 'center', 
                                        color: '#fff', boxShadow: '0 4px 12px rgba(232, 87, 42, 0.3)' 
                                    }}>
                                        <Cpu size={16} strokeWidth={2.5} />
                                    </div>
                                )}
                                {msg.role === 'analyst' ? (
                                    <div className="sani-response markdown-body" style={{ fontSize: '1rem', lineHeight: '1.75', color: 'var(--text-primary)' }}>
                                        <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.text}</ReactMarkdown>
                                    </div>
                                ) : (
                                    <div style={{ fontSize: '1.0625rem', fontWeight: 600 }}>{msg.text}</div>
                                )}
                            </div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start', margin: '0 0.75rem', fontWeight: 600 }}>
                                {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </div>
                        </div>
                    ))
                )}
                
                {/* Thinking State */}
                {isLoading && (
                    <div style={{ alignSelf: 'flex-start', display: 'flex', gap: '0.875rem', alignItems: 'flex-start', animation: 'fadeIn 0.3s ease-in' }}>
                        <div style={{ width: '30px', height: '30px', borderRadius: '8px', background: 'var(--surface-2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <div className="spin" style={{ color: 'var(--brand)' }}>
                                <Sparkles size={14} />
                            </div>
                        </div>
                        <div style={{ 
                            background: '#fff', padding: '1.25rem 1.75rem', 
                            borderRadius: '4px 20px 20px 20px', border: '1px solid var(--border)', 
                            boxShadow: 'var(--shadow-md)',
                            display: 'flex', alignItems: 'center', gap: '0.75rem'
                        }}>
                             <span style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--brand)' }}>
                                <div style={{ display: 'flex', gap: '4px' }}>
                                    {[1,2,3].map(i => (
                                        <div key={i} style={{ 
                                            width: '6px', height: '6px', borderRadius: '50%', 
                                            background: 'var(--brand)', 
                                            animation: 'bounce 1s infinite', 
                                            animationDelay: `${i * 0.2}s` 
                                        }} />
                                    ))}
                                </div>
                             </span>
                             <span style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-secondary)', letterSpacing: '0.02em' }}>SANI is synthesizing enterprise data...</span>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* History Sidebar Overlay */}
            {isHistoryOpen && (
                <div style={{
                    position: 'absolute',
                    top: '72px',
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'rgba(255, 255, 255, 0.95)',
                    backdropFilter: 'blur(10px)',
                    zIndex: 100,
                    padding: '1.5rem',
                    animation: 'fadeIn 0.2s ease-out',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '1rem'
                }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                        <h3 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-primary)' }}>Analysis History</h3>
                        <button 
                            onClick={handleNewChat}
                            style={{ 
                                padding: '6px 12px', 
                                background: 'var(--brand)', 
                                color: 'white', 
                                border: 'none', 
                                borderRadius: '8px', 
                                fontSize: '0.75rem', 
                                fontWeight: 700,
                                cursor: 'pointer'
                            }}
                        >
                            + New Chat
                        </button>
                    </div>
                    
                    <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        {sessions.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-disabled)' }}>
                                No archived sessions found.
                            </div>
                        ) : (
                            sessions.map(s => (
                                <button
                                    key={s.id}
                                    onClick={() => loadSession(s)}
                                    style={{
                                        width: '100%',
                                        padding: '1rem',
                                        background: currentSessionId === s.id ? 'var(--surface-2)' : 'white',
                                        border: `1px solid ${currentSessionId === s.id ? 'var(--brand)' : 'var(--border)'}`,
                                        borderRadius: '12px',
                                        textAlign: 'left',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s ease',
                                        display: 'flex',
                                        alignItems: 'flex-start',
                                        gap: '0.75rem'
                                    }}
                                >
                                    <MessageSquare size={16} style={{ marginTop: '2px', color: currentSessionId === s.id ? 'var(--brand)' : 'var(--text-secondary)' }} />
                                    <div>
                                        <div style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px' }}>{s.title}</div>
                                        <div style={{ fontSize: '0.7rem', color: 'var(--text-disabled)', fontWeight: 600 }}>
                                            {new Date(s.lastUpdated).toLocaleDateString()} at {new Date(s.lastUpdated).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </div>
                                    </div>
                                </button>
                            ))
                        )}
                    </div>
                    
                    <button 
                        onClick={() => setIsHistoryOpen(false)}
                        style={{ width: '100%', padding: '0.875rem', background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: '12px', fontWeight: 700, cursor: 'pointer' }}
                    >
                        Back to Chat
                    </button>
                </div>
            )}

            {/* Custom Clear Confirmation Dialog */}
            {showClearConfirm && (
                <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'rgba(0, 0, 0, 0.4)',
                    backdropFilter: 'blur(4px)',
                    zIndex: 200,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '1.5rem',
                    animation: 'fadeIn 0.2s ease-out'
                }}>
                    <div style={{
                        background: 'white',
                        padding: '2rem',
                        borderRadius: '24px',
                        width: '100%',
                        maxWidth: '380px',
                        textAlign: 'center',
                        boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
                        border: '1px solid var(--border)',
                        animation: 'slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
                    }}>
                        <div style={{
                            width: '64px',
                            height: '64px',
                            background: '#FFF1F0',
                            borderRadius: '16px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#FF4842',
                            margin: '0 auto 1.5rem'
                        }}>
                            <Trash2 size={32} />
                        </div>
                        <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.75rem' }}>Clear Conversation?</h3>
                        <p style={{ fontSize: '0.9375rem', color: 'var(--text-secondary)', lineHeight: '1.5', marginBottom: '2rem' }}>
                            Are you sure you want to clear this conversation? This action cannot be undone.
                        </p>
                        <div style={{ display: 'flex', gap: '0.75rem' }}>
                            <button 
                                onClick={() => setShowClearConfirm(false)}
                                style={{
                                    flex: 1,
                                    padding: '0.875rem',
                                    borderRadius: '12px',
                                    border: '1px solid var(--border)',
                                    background: 'var(--surface)',
                                    fontWeight: 700,
                                    cursor: 'pointer'
                                }}
                            >
                                Cancel
                            </button>
                            <button 
                                onClick={handleClearChat}
                                style={{
                                    flex: 1,
                                    padding: '0.875rem',
                                    borderRadius: '12px',
                                    border: 'none',
                                    background: '#FF4842',
                                    color: 'white',
                                    fontWeight: 700,
                                    cursor: 'pointer'
                                }}
                            >
                                Clear Chat
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Input Overlay */}
            <div style={{ 
                padding: '1.5rem 2rem', 
                background: 'var(--surface)', 
                borderTop: '1px solid var(--border)',
                backdropFilter: 'none'
            }}>
                <div style={{ position: 'relative', display: 'flex', gap: '1rem' }}>
                    <div style={{ flex: 1, position: 'relative' }}>
                        <input
                            type="text"
                            placeholder="Interrogate data or issue strategy command..."
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleQuery(undefined)}
                            style={{ 
                                width: '100%',
                                padding: '1.125rem 1.5rem', 
                                paddingRight: '4rem',
                                borderRadius: '16px', 
                                border: '1px solid var(--border)', 
                                outline: 'none', 
                                fontSize: '1.0625rem',
                                fontWeight: 500,
                                transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                                boxShadow: 'var(--shadow-inner)',
                                background: '#fff'
                            }}
                            className="focus-brand shadow-hover"
                            disabled={isLoading}
                        />
                        <div style={{ 
                            position: 'absolute', right: '1.25rem', top: '50%', transform: 'translateY(-50%)', 
                            color: 'var(--text-disabled)', fontSize: '0.75rem', fontWeight: 800,
                            display: 'flex', alignItems: 'center', gap: '4px',
                            background: 'var(--surface-2)', padding: '4px 8px', borderRadius: '6px', border: '1px solid var(--border)'
                        }}>
                            <Command size={10} />
                            <span>ENTER</span>
                        </div>
                    </div>
                    <button 
                        onClick={() => handleQuery(undefined)} 
                        disabled={isLoading || !query.trim()}
                        style={{ 
                            width: '56px',
                            height: '56px',
                            borderRadius: '16px', 
                            background: 'var(--text-primary)', 
                            color: '#fff', 
                            border: 'none', 
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                            opacity: isLoading || !query.trim() ? 0.4 : 1,
                            cursor: isLoading || !query.trim() ? 'default' : 'pointer',
                        }}
                        className="hover-lift active-scale"
                    >
                        <Send size={24} strokeWidth={2.5} />
                    </button>
                </div>
                <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                        <div className="badge badge-info" style={{ gap: '6px', padding: '4px 12px', fontSize: '0.7rem', textTransform: 'uppercase', fontStyle: 'italic' }}>
                            <Sparkles size={10} />
                            Powered by Gemini 3 Flash
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-disabled)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <Zap size={10} fill="currentColor" />
                            Secure Enterprise Context Enabled
                        </div>
                    </div>
                    <div style={{ cursor: 'pointer' }} title="AI Capabilities">
                        <Info size={16} color="var(--text-disabled)" />
                    </div>
                </div>
            </div>

            <style jsx>{`
                .focus-brand:focus {
                    border-color: var(--brand) !important;
                    box-shadow: 0 0 0 4px rgba(232, 87, 42, 0.1), var(--shadow-inner) !important;
                }
                
                .shadow-hover:hover {
                    box-shadow: var(--shadow-md), var(--shadow-inner);
                }

                .pulse-container {
                    animation: pulse 2.5s infinite ease-in-out;
                }
                
                .suggested-query-btn:hover {
                    border-color: var(--brand);
                    background: var(--brand-xsoft);
                    transform: translateY(-3px) scale(1.02);
                    box-shadow: var(--shadow-md);
                }
                
                .sani-response h1, .sani-response h2, .sani-response h3 {
                    margin-top: 2rem;
                    margin-bottom: 1.25rem;
                    font-weight: 800;
                    color: var(--text-primary);
                    letter-spacing: -0.03em;
                }
                
                .sani-response h1 { font-size: 1.375rem; border-bottom: 2px solid var(--border); padding-bottom: 0.75rem; }
                .sani-response h2 { font-size: 1.125rem; }
                
                .sani-response table {
                    width: 100%;
                    border-collapse: separate;
                    border-spacing: 0;
                    margin: 1.5rem 0;
                    font-size: 0.875rem;
                    border: 1px solid var(--border);
                    border-radius: 12px;
                    overflow: hidden;
                }
                
                .sani-response th {
                    text-align: left;
                    padding: 1rem;
                    background: var(--surface-2);
                    border-bottom: 2px solid var(--border);
                    color: var(--text-secondary);
                    font-weight: 800;
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                }
                
                .sani-response td {
                    padding: 1rem;
                    border-bottom: 1px solid var(--border);
                    background: white;
                }
                
                .sani-response tr:last-child td {
                    border-bottom: none;
                }
                
                .sani-response blockquote {
                    background: var(--brand-xsoft);
                    border-left: 4px solid var(--brand);
                    padding: 1.25rem 1.75rem;
                    color: var(--text-primary);
                    margin: 1.5rem 0;
                    font-style: italic;
                    border-radius: 0 12px 12px 0;
                    font-weight: 500;
                }

                .sani-response p {
                    margin-bottom: 1.25rem;
                }

                .sani-response ul, .sani-response ol {
                    margin-bottom: 1.5rem;
                    padding-left: 1.5rem;
                }

                .sani-response li {
                    margin-bottom: 0.5rem;
                }

                @keyframes pulse {
                    0% { transform: scale(1); filter: brightness(1); }
                    50% { transform: scale(1.02); filter: brightness(1.1); }
                    100% { transform: scale(1); filter: brightness(1); }
                }
            `}</style>
        </div>
    );
}

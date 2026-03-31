import React from 'react';
import { Users, UserPlus, ShieldCheck, Activity } from 'lucide-react';

interface StatCardsProps {
    totalUsers: number;
    pendingInvites: number;
    activeAdmins: number;
    activeSessions: number;
}

const StatCards: React.FC<StatCardsProps> = ({ totalUsers, pendingInvites, activeAdmins, activeSessions }) => {
    const stats = [
        { label: "Staff Directory", value: totalUsers, color: "#5C6AC4", bg: "#E8EAF6", icon: <Users size={22} /> },
        { label: "Pending Invites", value: pendingInvites, color: "#B76E00", bg: "#FFF7CD", icon: <UserPlus size={22} /> },
        { label: "Active Admins", value: activeAdmins, color: "#00AB55", bg: "#E9FBF0", icon: <ShieldCheck size={22} /> },
        { label: "Active Sessions", value: activeSessions, color: "#212B36", bg: "#F4F6F8", icon: <Activity size={22} /> },
    ];

    return (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "1rem" }}>
            {stats.map(s => (
                <div 
                    key={s.label} 
                    className="stat-card" 
                    style={{ background: "white", border: "1px solid #DFE3E8", borderRadius: 12, padding: "1.25rem", transition: "all 0.2s", cursor: "default" }} 
                    onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'} 
                    onMouseLeave={e => e.currentTarget.style.transform = 'none'}
                >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.75rem" }}>
                        <span style={{ fontSize: "0.75rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "#637381" }}>{s.label}</span>
                        <div style={{ width: 36, height: 36, background: s.bg, color: s.color, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center" }}>
                            {s.icon}
                        </div>
                    </div>
                    <div style={{ fontSize: "1.5rem", fontWeight: 800, color: s.color, letterSpacing: "-0.5px" }}>{s.value}</div>
                </div>
            ))}
        </div>
    );
};

export default StatCards;


import { motion } from 'framer-motion';
import { Shield, ChevronRight, Info, Eye, Table } from 'lucide-react';
import { ROLE_CONFIGS } from '@/lib/roles_config';
import { UserRole } from '@/types';
import { RoleIcon } from './RoleIcon';

interface RoleGridProps {
    onViewPermissions: (role: UserRole) => void;
    onViewMatrix: () => void;
}

const RoleGrid: React.FC<RoleGridProps> = ({ onViewPermissions, onViewMatrix }) => {
    // Filter out legacy roles
    const activeRoles = (Object.entries(ROLE_CONFIGS) as [UserRole, any][]).filter(([id, cfg]) => !cfg.label.startsWith('Legacy:'));

    return (
        <div style={{ paddingBottom: "5rem", display: "flex", flexDirection: "column", gap: "2rem" }}>
            {/* Table Matrix Call to Action */}
            <div style={{ 
                background: "white", 
                border: "1px solid #DFE3E8", 
                borderRadius: "1rem", 
                padding: "1.5rem 2rem", 
                display: "flex", 
                flexDirection: "row", 
                flexWrap: "wrap",
                alignItems: "center", 
                justifyContent: "space-between", 
                gap: "1.5rem",
                boxShadow: "0 1px 2px 0 rgba(145, 158, 171, 0.05)"
            }}>
                <div style={{ display: "flex", alignItems: "center", gap: "1.25rem", flex: 1, minWidth: "300px" }}>
                    <div style={{ 
                        width: 56, 
                        height: 56, 
                        borderRadius: "0.75rem", 
                        background: "#FFF5F3", 
                        display: "flex", 
                        alignItems: "center", 
                        justifyContent: "center", 
                        color: "#E8572A",
                        border: "1px solid rgba(232, 87, 42, 0.1)",
                        flexShrink: 0
                    }}>
                        <Table size={28} strokeWidth={2} />
                    </div>
                    <div>
                        <h3 style={{ fontSize: "1.125rem", fontWeight: 700, color: "#212B36", marginBottom: "0.25rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                            Permission Matrix <span style={{ color: "#919EAB", fontWeight: 500, fontSize: "0.875rem", padding: "0.125rem 0.375rem", background: "#F4F6F8", borderRadius: "0.25rem" }}>Console</span>
                        </h3>
                        <p style={{ color: "#637381", fontSize: "0.875rem", lineHeight: 1.5, maxWidth: "600px" }}>
                            Master analytical view of the 10-tier hierarchy. Contrast capabilities across every module in the Apex Procure ecosystem.
                        </p>
                    </div>
                </div>
                <button 
                    onClick={onViewMatrix}
                    className="btn btn-primary"
                    style={{ whiteSpace: "nowrap" }}
                >
                    <Eye size={16} />
                    Open Master Matrix
                </button>
            </div>

            {/* Role Cards Grid */}
            <div style={{ 
                display: "grid", 
                gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", 
                gap: "1.5rem" 
            }}>
                {activeRoles.map(([id, cfg], i) => {
                    const cleranceLevel = id === 'administrator' ? 10 : id.includes('mgr') ? 8 : id.includes('officer') ? 6 : id.includes('head') ? 7 : 2;
                    return (
                        <div 
                            key={id} 
                            style={{ 
                                background: "white", 
                                border: "1px solid #DFE3E8", 
                                borderRadius: "1rem", 
                                padding: "1.5rem", 
                                display: "flex", 
                                flexDirection: "column", 
                                boxShadow: "0 1px 2px 0 rgba(145, 158, 171, 0.05)",
                                position: "relative",
                                transition: "all 0.2s ease"
                            }}
                            className="hover:border-[#E8572A] hover:shadow-md group"
                        >
                            <div className="absolute top-0 inset-x-0 h-1 bg-[#E8572A] opacity-0 group-hover:opacity-100 transition-opacity rounded-t-[1rem]"></div>
                            
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1.5rem" }}>
                                <div 
                                    style={{ 
                                        width: 48, 
                                        height: 48, 
                                        borderRadius: "0.75rem", 
                                        display: "flex", 
                                        alignItems: "center", 
                                        justifyContent: "center", 
                                        fontSize: "1.25rem", 
                                        backgroundColor: `${cfg.color}15`, 
                                        color: cfg.color, 
                                        border: `1px solid ${cfg.color}30` 
                                    }}
                                >
                                    <RoleIcon roleId={id} size={24} />
                                </div>
                                
                                <div style={{ textAlign: "right" }}>
                                    <div style={{ fontSize: "0.625rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: "#919EAB", marginBottom: "0.375rem" }}>Clearance</div>
                                    <div style={{ display: "flex", gap: "0.25rem", justifyContent: "flex-end" }}>
                                        {[...Array(5)].map((_, j) => (
                                            <div 
                                                key={j}
                                                style={{
                                                    width: "0.625rem",
                                                    height: "0.375rem",
                                                    borderRadius: "9999px",
                                                    background: j < Math.ceil(cleranceLevel/2) ? "#E8572A" : "#F4F6F8"
                                                }}
                                            />
                                        ))}
                                    </div>
                                </div>
                            </div>
                            
                            <div style={{ flex: 1, marginBottom: "1.5rem" }}>
                                <h4 style={{ fontSize: "1rem", fontWeight: 700, color: "#212B36", marginBottom: "0.5rem" }}>
                                    {cfg.label}
                                </h4>
                                <span style={{ 
                                    display: "inline-block", 
                                    padding: "0.125rem 0.5rem", 
                                    background: "#F4F6F8", 
                                    border: "1px solid #DFE3E8", 
                                    borderRadius: "0.25rem", 
                                    fontFamily: "monospace", 
                                    fontSize: "0.625rem", 
                                    fontWeight: 700, 
                                    color: "#637381", 
                                    textTransform: "uppercase", 
                                    letterSpacing: "0.05em", 
                                    marginBottom: "1rem" 
                                }}>
                                    ID: {id}
                                </span>
                                <p style={{ color: "#637381", fontSize: "0.875rem", lineHeight: 1.5 }}>
                                    {cfg.description}
                                </p>
                            </div>

                            <button 
                                onClick={() => onViewPermissions(id as UserRole)}
                                style={{
                                    width: "100%",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "space-between",
                                    padding: "0.75rem 1rem",
                                    borderRadius: "0.5rem",
                                    background: "#F4F6F8",
                                    border: "1px solid transparent",
                                    color: "#637381",
                                    fontWeight: 600,
                                    marginTop: "auto",
                                    transition: "all 0.2s ease",
                                    cursor: "pointer",
                                    fontSize: "0.75rem",
                                    textTransform: "uppercase",
                                    letterSpacing: "0.05em"
                                }}
                                className="hover:bg-[#FFF5F3] hover:text-[#E8572A] hover:border-[#ffccba] group/btn"
                            >
                                <span>Analyze Matrix</span>
                                <ChevronRight size={16} className="transition-transform group-hover/btn:translate-x-1" />
                            </button>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default RoleGrid;


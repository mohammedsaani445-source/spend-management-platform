import React, { useState } from 'react';
import { X, Shield, Lock, ShieldCheck, ShieldAlert, Table, Activity, Cpu } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { ROLE_CONFIGS, MODULES } from '@/lib/roles_config';
import { UserRole } from '@/types';
import { RoleIcon } from './RoleIcon';
import Portal from '@/components/common/Portal';

interface PermissionMatrixModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const PermissionMatrixModal: React.FC<PermissionMatrixModalProps> = ({ isOpen, onClose }) => {
    const [hoveredRow, setHoveredRow] = useState<string | null>(null);
    const [hoveredCol, setHoveredCol] = useState<string | null>(null);

    // Filter out legacy roles for the matrix
    const activeRoles = Object.values(ROLE_CONFIGS).filter(r => !r.label.startsWith('Legacy:'));

    return (
        <Portal>
            <AnimatePresence>
                {isOpen && (
                    <div className="fixed inset-0 z-[100000] flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-[#0f172a]/80 backdrop-blur-sm"
                    />
                    
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                        className="bg-[var(--surface)] border border-[var(--border)] rounded-xl w-full max-w-7xl h-full max-h-[90vh] flex flex-col overflow-hidden shadow-2xl relative z-10"
                    >
                        {/* Header */}
                        <div className="p-6 border-b border-[var(--border)] flex flex-col md:flex-row items-center justify-between gap-6 bg-[var(--surface-2)]">
                            <div className="flex items-center gap-5">
                                <div className="w-14 h-14 rounded-xl bg-[var(--brand)]/10 flex items-center justify-center text-[var(--brand)] shadow-sm">
                                    <Table size={28} strokeWidth={2.5} />
                                </div>
                                <div>
                                    <h2 className="text-xl font-900 text-[var(--foreground)] tracking-tight">
                                        PERMISSION MATRIX
                                    </h2>
                                    <p className="text-[var(--muted-foreground)] font-medium mt-0.5 text-sm flex items-center gap-2">
                                        Comprehensive overview of role access across system modules.
                                    </p>
                                </div>
                            </div>

                            <button 
                                onClick={onClose}
                                className="w-10 h-10 flex items-center justify-center rounded-xl bg-[var(--surface)] border border-[var(--border)] hover:bg-[var(--surface-2)] transition-all shadow-sm text-[var(--foreground)]"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="flex-1 overflow-auto custom-scrollbar p-6 bg-[var(--surface)]">
                            <div className="table-wrapper rounded-xl border border-[var(--border)] bg-[var(--surface)] shadow-xl overflow-hidden">
                                <table className="data-table w-full text-sm text-left">
                                    <thead className="text-[10px] text-[var(--muted-foreground)] uppercase bg-[var(--surface-2)] border-b border-[var(--border)] sticky top-0 z-40">
                                        <tr>
                                            <th className="px-6 py-5 font-900 sticky left-0 z-50 bg-[var(--surface-2)] border-r border-[var(--border)] shadow-sm min-w-[200px]">
                                                MODULE \ ROLE
                                            </th>
                                            {activeRoles.map(role => (
                                                <th 
                                                    key={role.id} 
                                                    onMouseEnter={() => setHoveredCol(role.id)}
                                                    onMouseLeave={() => setHoveredCol(null)}
                                                    className={`px-4 py-5 text-center font-900 transition-colors
                                                        ${hoveredCol === role.id ? 'bg-[var(--brand)]/5' : ''}
                                                    `}
                                                    style={{ minWidth: '140px' }}
                                                >
                                                    <div className="flex flex-col items-center gap-2">
                                                        <div 
                                                            className="w-10 h-10 rounded-xl flex items-center justify-center text-lg shadow-sm border border-[var(--border)] bg-[var(--surface)]"
                                                            style={{ color: role.color }}
                                                        >
                                                            <RoleIcon roleId={role.id} size={20} />
                                                        </div>
                                                        <span className="tracking-widest text-[var(--foreground)]">{role.label}</span>
                                                    </div>
                                                </th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-[var(--border)]">
                                        {MODULES.map((module, idx) => (
                                            <tr 
                                                key={module} 
                                                onMouseEnter={() => setHoveredRow(module)}
                                                onMouseLeave={() => setHoveredRow(null)}
                                                className="hover:bg-[var(--surface-2)] transition-colors group"
                                            >
                                                <td className={`px-6 py-5 font-900 text-[11px] uppercase tracking-wider sticky left-0 z-30 bg-[var(--surface)] border-r border-[var(--border)] shadow-sm transition-colors ${
                                                    hoveredRow === module ? 'text-[var(--brand)] bg-[var(--surface-2)]' : 'text-[var(--foreground)]'
                                                }`}>
                                                    <div className="flex items-center gap-2">
                                                        {module}
                                                    </div>
                                                </td>
                                                {activeRoles.map(role => {
                                                    const level = role.permissions[module];
                                                    const isHovered = hoveredRow === module || hoveredCol === role.id;
                                                    return (
                                                        <td 
                                                            key={`${role.id}-${module}`} 
                                                            className={`px-4 py-3 text-center transition-colors ${
                                                                isHovered ? 'bg-[var(--brand)]/[0.02]' : ''
                                                            }`}
                                                        >
                                                            <div className="flex justify-center">
                                                                {level === 'FULL' ? (
                                                                    <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shadow-sm">
                                                                        <ShieldCheck size={18} className="text-emerald-600" />
                                                                    </div>
                                                                ) : level === 'LIMITED' ? (
                                                                    <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shadow-sm">
                                                                        <ShieldAlert size={18} className="text-amber-600" />
                                                                    </div>
                                                                ) : (
                                                                    <div className="w-9 h-9 flex items-center justify-center opacity-20">
                                                                        <span className="w-4 h-1 bg-[var(--foreground)] rounded-full" />
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </td>
                                                    );
                                                })}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Legend */}
                        <div className="p-6 border-t border-[var(--border)] bg-[var(--surface-2)] flex flex-col sm:flex-row items-center justify-between gap-6">
                            <div className="flex flex-wrap items-center justify-center gap-12">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shadow-sm">
                                        <ShieldCheck size={18} className="text-emerald-600" />
                                    </div>
                                    <div>
                                        <p className="text-xs font-900 text-[var(--foreground)] uppercase tracking-wider">Full Access</p>
                                        <p className="text-[10px] text-[var(--muted-foreground)] font-medium">Read & Write</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shadow-sm">
                                        <ShieldAlert size={18} className="text-amber-600" />
                                    </div>
                                    <div>
                                        <p className="text-xs font-900 text-[var(--foreground)] uppercase tracking-wider">Limited Access</p>
                                        <p className="text-[10px] text-[var(--muted-foreground)] font-medium">Read Only or Scoped</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 flex items-center justify-center grayscale opacity-30">
                                        <span className="w-5 h-1.5 bg-[var(--foreground)] rounded-full" />
                                    </div>
                                    <div>
                                        <p className="text-xs font-900 text-[var(--foreground)] uppercase tracking-wider">No Access</p>
                                        <p className="text-[10px] text-[var(--muted-foreground)] font-medium">Hidden</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
            </AnimatePresence>
        </Portal>
    );
};

export default PermissionMatrixModal;

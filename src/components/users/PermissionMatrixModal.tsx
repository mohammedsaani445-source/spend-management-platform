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
                    <div className="fixed inset-0 z-[100000] flex items-center justify-center p-4 md:p-8">
                    {/* Backdrop */}
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
                    />
                    
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                        className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl w-full max-w-7xl h-full max-h-[90vh] flex flex-col overflow-hidden shadow-2xl relative z-10"
                    >
                        {/* Header */}
                        <div className="p-6 md:p-8 border-b border-[var(--border)] flex flex-col md:flex-row items-start md:items-center justify-between gap-6 bg-slate-50/50">
                            <div className="flex items-center gap-6">
                                <div className="w-16 h-16 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shadow-sm">
                                    <Table size={32} strokeWidth={2} />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
                                        Permission Matrix
                                    </h2>
                                    <p className="text-slate-500 font-medium mt-1 text-sm flex items-center gap-2">
                                        <Shield size={14} className="text-slate-400" />
                                        Comprehensive overview of role access across system modules.
                                    </p>
                                </div>
                            </div>

                            <button 
                                onClick={onClose}
                                className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-slate-100 active:bg-slate-200 transition-colors text-slate-500"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="flex-1 overflow-auto custom-scrollbar p-6 bg-slate-50/30">
                            <div className="table-wrapper rounded-xl border border-[var(--border)] bg-[var(--surface)] shadow-sm overflow-hidden">
                                <table className="data-table w-full text-sm text-left">
                                    <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b border-[var(--border)] sticky top-0 z-40 shadow-sm">
                                        <tr>
                                            <th className="px-6 py-4 font-semibold sticky left-0 z-50 bg-slate-50 border-r border-[var(--border)] shadow-sm min-w-[200px]">
                                                Module \ Role
                                            </th>
                                            {activeRoles.map(role => (
                                                <th 
                                                    key={role.id} 
                                                    onMouseEnter={() => setHoveredCol(role.id)}
                                                    onMouseLeave={() => setHoveredCol(null)}
                                                    className={`px-4 py-4 text-center font-semibold transition-colors
                                                        ${hoveredCol === role.id ? 'bg-blue-50/50' : ''}
                                                    `}
                                                    style={{ minWidth: '140px' }}
                                                >
                                                    <div className="flex flex-col items-center gap-2">
                                                        <div 
                                                            className="w-8 h-8 rounded-lg flex items-center justify-center text-lg"
                                                            style={{ backgroundColor: `${role.color}15`, color: role.color }}
                                                        >
                                                            <RoleIcon roleId={role.id} size={16} />
                                                        </div>
                                                        <span className="text-[10px] tracking-wider text-slate-700">{role.label}</span>
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
                                                className="hover:bg-slate-50/80 transition-colors"
                                            >
                                                <td className={`px-6 py-4 font-medium sticky left-0 z-30 bg-[var(--surface)] border-r border-[var(--border)] shadow-sm transition-colors ${
                                                    hoveredRow === module ? 'text-blue-600 bg-blue-50/30' : 'text-slate-700'
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
                                                                isHovered ? 'bg-slate-50' : ''
                                                            }`}
                                                        >
                                                            <div className="flex justify-center">
                                                                {level === 'FULL' ? (
                                                                    <div className="w-8 h-8 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center">
                                                                        <ShieldCheck size={16} className="text-emerald-600" />
                                                                    </div>
                                                                ) : level === 'LIMITED' ? (
                                                                    <div className="w-8 h-8 rounded-full bg-amber-50 border border-amber-100 flex items-center justify-center">
                                                                        <ShieldAlert size={16} className="text-amber-600" />
                                                                    </div>
                                                                ) : (
                                                                    <div className="w-8 h-8 flex items-center justify-center opacity-30">
                                                                        <span className="w-2 h-0.5 bg-slate-300 rounded-full" />
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
                        <div className="p-6 border-t border-[var(--border)] bg-slate-50 flex flex-col sm:flex-row items-center justify-between gap-6">
                            <div className="flex flex-wrap items-center justify-center gap-8">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center">
                                        <ShieldCheck size={16} className="text-emerald-600" />
                                    </div>
                                    <div>
                                        <p className="text-xs font-semibold text-slate-700">Full Access</p>
                                        <p className="text-[10px] text-slate-500">Read & Write</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-amber-50 border border-amber-100 flex items-center justify-center">
                                        <ShieldAlert size={16} className="text-amber-600" />
                                    </div>
                                    <div>
                                        <p className="text-xs font-semibold text-slate-700">Limited Access</p>
                                        <p className="text-[10px] text-slate-500">Read Only or Scoped</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 flex items-center justify-center grayscale opacity-50">
                                        <span className="w-4 h-0.5 bg-slate-400 rounded-full" />
                                    </div>
                                    <div>
                                        <p className="text-xs font-semibold text-slate-700">No Access</p>
                                        <p className="text-[10px] text-slate-500">Hidden</p>
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

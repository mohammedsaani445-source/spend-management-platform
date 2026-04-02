import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Shield, Info, ShieldAlert, ShieldCheck, Lock, Activity } from 'lucide-react';
import { ROLE_CONFIGS, MODULES } from '@/lib/roles_config';
import { UserRole } from '@/types';
import { RoleIcon } from './RoleIcon';
import Portal from '@/components/common/Portal';

interface RoleDetailModalProps {
    roleId?: UserRole;
    isOpen: boolean;
    onClose: () => void;
}

const RoleDetailModal: React.FC<RoleDetailModalProps> = ({ roleId, isOpen, onClose }) => {
    if (!roleId) return null;

    const config = ROLE_CONFIGS[roleId];
    if (!config) return null;

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

                    {/* Modal Content */}
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="bg-[var(--surface)] border border-[var(--border)] rounded-xl w-full max-w-2xl overflow-hidden shadow-2xl relative group z-10 flex flex-col max-h-[90vh]"
                    >
                        {/* Header */}
                        <div className="p-6 border-b border-[var(--border)] flex items-center justify-between bg-[var(--surface-2)]">
                            <div className="flex items-center gap-5">
                                <div 
                                    className="w-12 h-12 rounded-xl flex items-center justify-center text-xl shadow-sm border bg-[var(--surface)]"
                                    style={{ 
                                        color: config.color, 
                                        borderColor: `${config.color}30`,
                                        boxShadow: `0 2px 10px -2px ${config.color}20`
                                    }}
                                >
                                    <RoleIcon roleId={roleId} size={24} />
                                </div>
                                <div>
                                    <h2 className="text-xl font-900 text-[var(--foreground)] tracking-tight uppercase">{config.label}</h2>
                                    <p className="text-[var(--muted-foreground)] font-medium mt-0.5 text-xs flex items-center gap-1.5 uppercase tracking-wider">
                                        Role Specification
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
                        <div className="flex-1 overflow-y-auto custom-scrollbar p-6 bg-[var(--surface)]">
                            {/* Role Description Card */}
                            <div className="mb-8">
                                <p className="text-[var(--foreground)] text-sm leading-relaxed font-semibold bg-[var(--surface-2)] border border-[var(--border)] shadow-sm p-6 rounded-xl border-l-[6px]" style={{ borderLeftColor: config.color }}>
                                    {config.description}
                                </p>
                            </div>

                            {/* Matrix */}
                            <div>
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 px-1">
                                    <h3 className="text-xs font-900 text-[var(--muted-foreground)] tracking-widest uppercase flex items-center gap-2">
                                        <div className="w-5 h-5 rounded-md bg-[var(--surface-2)] flex items-center justify-center border border-[var(--border)]">
                                            <Shield size={10} className="text-[var(--brand)]" />
                                        </div>
                                        Module Access Level
                                    </h3>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    {MODULES.map(module => {
                                        const level = config.permissions[module];
                                        const isFull = level === 'FULL';
                                        const isLimited = level === 'LIMITED';
                                        
                                        return (
                                            <div 
                                                key={module}
                                                className={`p-4 rounded-xl border flex items-center justify-between transition-all duration-300 group ${
                                                    isFull 
                                                        ? 'border-emerald-500/20 bg-emerald-500/[0.03] shadow-sm hover:shadow-md' 
                                                        : isLimited
                                                        ? 'border-amber-500/20 bg-amber-500/[0.03] shadow-sm hover:shadow-md'
                                                        : 'border-[var(--border)] opacity-60 grayscale'
                                                }`}
                                            >
                                                <div className="flex flex-col gap-1.5 text-left">
                                                    <span className={`text-[11px] font-900 uppercase tracking-widest ${
                                                        level ? 'text-[var(--foreground)]' : 'text-[var(--muted-foreground)]'
                                                    }`}>
                                                        {module}
                                                    </span>
                                                    <span className="text-[10px] font-semibold uppercase tracking-wider">
                                                        {isFull ? (
                                                            <span className="text-emerald-600">Full Access</span>
                                                        ) : isLimited ? (
                                                            <span className="text-amber-600">Restricted</span>
                                                        ) : (
                                                            <span className="text-[var(--muted-foreground)]">No Access</span>
                                                        )}
                                                    </span>
                                                </div>
                                                
                                                <div className={`flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center shadow-sm border transition-transform duration-300 group-hover:scale-110 ${
                                                    isFull ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600' : 
                                                    isLimited ? 'bg-amber-500/10 border-amber-500/20 text-amber-600' : 
                                                    'bg-[var(--surface-2)] border-[var(--border)] text-[var(--muted-foreground)]'
                                                }`}>
                                                    {isFull && <ShieldCheck className="w-5 h-5" />}
                                                    {isLimited && <ShieldAlert className="w-5 h-5" />}
                                                    {!level && <Lock className="w-5 h-5" />}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="px-6 py-5 border-t border-[var(--border)] bg-[var(--surface-2)] flex items-center justify-between">
                            <div className="flex items-center gap-3 text-[var(--muted-foreground)]">
                                <Activity size={16} className="text-emerald-500" />
                                <span className="text-[10px] font-900 uppercase tracking-widest pt-0.5">Policy Active</span>
                            </div>
                            <button 
                                onClick={onClose}
                                className="px-6 py-2 bg-[var(--brand)] hover:scale-[1.02] active:scale-[0.98] text-white text-xs font-900 uppercase tracking-widest rounded-xl transition-all shadow-lg shadow-[var(--brand)]/20"
                            >
                                CLOSE
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
            </AnimatePresence>
        </Portal>
    );
};

export default RoleDetailModal;

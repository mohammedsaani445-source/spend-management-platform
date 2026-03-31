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
                    <div className="fixed inset-0 z-[100000] flex items-center justify-center p-4 md:p-6">
                    {/* Backdrop */}
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
                    />

                    {/* Modal Content */}
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl relative group z-10 flex flex-col max-h-[90vh]"
                    >
                        {/* Header */}
                        <div className="p-6 md:p-8 border-b border-[var(--border)] flex items-start justify-between bg-gradient-to-br from-slate-50 relative overflow-hidden">
                            {/* Decorative background element */}
                            <div className="absolute top-0 right-0 w-64 h-64 bg-slate-200/40 rounded-full blur-[60px] opacity-50 -translate-y-1/2 translate-x-1/3 transition-all" />
                            
                            <div className="flex items-center gap-5 relative z-10">
                                <div 
                                    className="w-12 h-12 rounded-xl flex items-center justify-center text-xl shadow-sm border bg-white"
                                    style={{ 
                                        color: config.color, 
                                        borderColor: `${config.color}30`,
                                        boxShadow: `0 2px 10px -2px ${config.color}20`
                                    }}
                                >
                                    <RoleIcon roleId={roleId} size={24} />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-slate-800 tracking-tight">{config.label}</h2>
                                    <p className="text-slate-500 text-sm mt-0.5 flex items-center gap-1.5 focus:outline-none">
                                        <Shield size={14} className="opacity-60" />
                                        Role Specification
                                    </p>
                                </div>
                            </div>
                            <button 
                                onClick={onClose}
                                className="relative z-10 w-9 h-9 flex items-center justify-center hover:bg-slate-100 rounded-full transition-colors text-slate-400 hover:text-slate-600"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="flex-1 overflow-y-auto custom-scrollbar p-6 md:p-8 bg-slate-50/40">
                            {/* Role Description Card */}
                            <div className="mb-6">
                                <p className="text-slate-600 text-sm leading-relaxed font-medium bg-white border border-slate-200 shadow-sm p-4 rounded-xl border-l-4" style={{ borderLeftColor: config.color }}>
                                    {config.description}
                                </p>
                            </div>

                            {/* Matrix */}
                            <div>
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                                    <h3 className="text-sm font-bold text-slate-800 tracking-wide uppercase flex items-center gap-2">
                                        <div className="w-6 h-6 rounded bg-slate-200/50 flex items-center justify-center border border-slate-200">
                                            <Shield size={12} className="text-slate-600" />
                                        </div>
                                        Module Access Level
                                    </h3>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                                    {MODULES.map(module => {
                                        const level = config.permissions[module];
                                        const isFull = level === 'FULL';
                                        const isLimited = level === 'LIMITED';
                                        
                                        return (
                                            <div 
                                                key={module}
                                                className={`p-3 rounded-xl border flex items-center justify-between transition-all duration-200 bg-white ${
                                                    isFull 
                                                        ? 'border-emerald-200 shadow-[0_2px_10px_-4px_rgba(16,185,129,0.1)]' 
                                                        : isLimited
                                                        ? 'border-amber-200 shadow-[0_2px_10px_-4px_rgba(245,158,11,0.1)]'
                                                        : 'border-slate-200 opacity-70'
                                                }`}
                                            >
                                                <div className="flex flex-col gap-1 text-left">
                                                    <span className={`text-sm font-semibold tracking-tight ${
                                                        level ? 'text-slate-800' : 'text-slate-500'
                                                    }`}>
                                                        {module}
                                                    </span>
                                                    <span className="text-[11px] font-medium uppercase tracking-wider">
                                                        {isFull ? (
                                                            <span className="text-emerald-600">Full Access</span>
                                                        ) : isLimited ? (
                                                            <span className="text-amber-600">Restricted</span>
                                                        ) : (
                                                            <span className="text-slate-400">No Access</span>
                                                        )}
                                                    </span>
                                                </div>
                                                
                                                <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                                                    isFull ? 'bg-emerald-50 text-emerald-600' : 
                                                    isLimited ? 'bg-amber-50 text-amber-600' : 
                                                    'bg-slate-50 text-slate-400'
                                                }`}>
                                                    {isFull && <ShieldCheck className="w-4 h-4" />}
                                                    {isLimited && <ShieldAlert className="w-4 h-4" />}
                                                    {!level && <Lock className="w-4 h-4" />}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="px-6 py-4 border-t border-slate-200 bg-white flex items-center justify-between rounded-b-2xl">
                            <div className="flex items-center gap-2 text-slate-500">
                                <Activity size={14} className="text-emerald-500" />
                                <span className="text-xs font-medium uppercase tracking-wider pt-0.5">Policy Active</span>
                            </div>
                            <button 
                                onClick={onClose}
                                className="px-5 py-2 hover:bg-slate-100 text-slate-700 text-sm font-semibold rounded-lg transition-colors bg-white border border-slate-200 shadow-sm"
                            >
                                Close
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

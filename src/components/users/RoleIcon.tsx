import React from 'react';
import { Shield, Briefcase, Target, ClipboardList, Building, PenTool, Receipt, Search, Box, Monitor, User } from 'lucide-react';
import { UserRole } from '@/types';

interface RoleIconProps {
    roleId: string | UserRole;
    size?: number;
    strokeWidth?: number;
    className?: string;
}

export const RoleIcon: React.FC<RoleIconProps> = ({ roleId, size = 24, strokeWidth = 1.5, className }) => {
    switch (roleId) {
        case 'administrator':
            return <Shield size={size} strokeWidth={strokeWidth} className={className} />;
        case 'finance_mgr':
            return <Briefcase size={size} strokeWidth={strokeWidth} className={className} />;
        case 'proc_mgr':
            return <Target size={size} strokeWidth={strokeWidth} className={className} />;
        case 'proc_officer':
            return <ClipboardList size={size} strokeWidth={strokeWidth} className={className} />;
        case 'dept_head':
            return <Building size={size} strokeWidth={strokeWidth} className={className} />;
        case 'requester':
            return <PenTool size={size} strokeWidth={strokeWidth} className={className} />;
        case 'ap_officer':
            return <Receipt size={size} strokeWidth={strokeWidth} className={className} />;
        case 'auditor':
            return <Search size={size} strokeWidth={strokeWidth} className={className} />;
        case 'warehouse':
            return <Box size={size} strokeWidth={strokeWidth} className={className} />;
        case 'asset_mgr':
            return <Monitor size={size} strokeWidth={strokeWidth} className={className} />;
        default:
            return <User size={size} strokeWidth={strokeWidth} className={className} />;
    }
};

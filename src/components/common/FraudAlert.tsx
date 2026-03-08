import React from 'react';
import { AlertTriangle, AlertCircle, ShieldAlert } from 'lucide-react';

interface FraudAlertProps {
    severity: 'LOW' | 'MEDIUM' | 'HIGH';
    reason: string;
}

export const FraudAlert: React.FC<FraudAlertProps> = ({ severity, reason }) => {
    const styles = {
        HIGH: {
            bg: '#FFE7D9',
            border: '#FF4842',
            text: '#7A0C2E',
            icon: <ShieldAlert size={20} />
        },
        MEDIUM: {
            bg: '#FFF7CD',
            border: '#B78103',
            text: '#7A4F01',
            icon: <AlertTriangle size={20} />
        },
        LOW: {
            bg: '#F4F6F8',
            border: '#919EAB',
            text: '#212B36',
            icon: <AlertCircle size={20} />
        }
    };

    const style = styles[severity];

    return (
        <div style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: '12px',
            padding: '16px',
            backgroundColor: style.bg,
            borderLeft: `4px solid ${style.border}`,
            borderRadius: '8px',
            marginBottom: '16px'
        }}>
            <div style={{ color: style.border, marginTop: '2px' }}>
                {style.icon}
            </div>
            <div>
                <h4 style={{
                    margin: '0 0 4px 0',
                    fontSize: '14px',
                    fontWeight: 700,
                    color: style.text
                }}>
                    FRAUD PROTECTION ALERT: {severity} RISK
                </h4>
                <p style={{
                    margin: 0,
                    fontSize: '13px',
                    color: style.text,
                    opacity: 0.9,
                    lineHeight: 1.4
                }}>
                    {reason}
                </p>
            </div>
        </div>
    );
};

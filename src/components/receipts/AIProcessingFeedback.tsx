import React, { useEffect, useState } from 'react';
import { Loader2, Brain, Search, ShieldCheck, Database } from 'lucide-react';

interface AIProcessingFeedbackProps {
    status: 'UPLOADING' | 'EXTRACTING' | 'CATEGORIZING' | 'FRAUD_CHECK' | 'FINALIZING' | 'COMPLETED';
}

export const AIProcessingFeedback: React.FC<AIProcessingFeedbackProps> = ({ status }) => {
    const [progress, setProgress] = useState(0);

    const steps = [
        { id: 'UPLOADING', label: 'Uploading Receipt', icon: <Database size={18} /> },
        { id: 'EXTRACTING', label: 'AI OCR Extraction', icon: <Brain size={18} /> },
        { id: 'CATEGORIZING', label: 'Smart Categorization', icon: <Search size={18} /> },
        { id: 'FRAUD_CHECK', label: 'Fraud & Duplicate Scan', icon: <ShieldCheck size={18} /> },
        { id: 'FINALIZING', label: 'Finalizing Records', icon: <Loader2 size={18} className="animate-spin" /> }
    ];

    const currentStepIndex = steps.findIndex(s => s.id === status);

    useEffect(() => {
        if (status === 'COMPLETED') setProgress(100);
        else {
            const base = (currentStepIndex / steps.length) * 100;
            setProgress(base + 10);
        }
    }, [status, currentStepIndex]);

    return (
        <div style={{ padding: '24px', textAlign: 'center' }}>
            <div style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                backgroundColor: 'var(--brand-soft)',
                color: 'var(--brand)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px',
                animation: 'pulse 2s infinite ease-in-out'
            }}>
                <Brain size={32} />
            </div>

            <h3 style={{ margin: '0 0 8px 0', fontSize: '18px', fontWeight: 700 }}>
                {status === 'COMPLETED' ? 'Processing Complete!' : 'AI is analyzing your receipt...'}
            </h3>
            <p style={{ margin: '0 0 24px 0', color: '#637381', fontSize: '14px' }}>
                Gemini 1.5 Flash is extracting line items and checking for fraud.
            </p>

            <div style={{ maxWidth: '320px', margin: '0 auto' }}>
                {steps.map((step, index) => {
                    const isCompleted = index < currentStepIndex || status === 'COMPLETED';
                    const isActive = index === currentStepIndex && status !== 'COMPLETED';

                    return (
                        <div key={step.id} style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                            marginBottom: '12px',
                            opacity: isCompleted || isActive ? 1 : 0.4,
                            transition: 'opacity 0.3s'
                        }}>
                            <div style={{
                                color: isCompleted ? '#00AB55' : isActive ? 'var(--brand)' : '#919EAB',
                                display: 'flex'
                            }}>
                                {isCompleted ? <ShieldCheck size={18} /> : step.icon}
                            </div>
                            <span style={{
                                fontSize: '14px',
                                fontWeight: isActive ? 700 : 500,
                                color: isActive ? 'var(--brand)' : '#212B36'
                            }}>
                                {step.label}
                            </span>
                            {isActive && <Loader2 size={14} className="animate-spin" style={{ marginLeft: 'auto' }} />}
                        </div>
                    );
                })}
            </div>

            <div style={{
                marginTop: '32px',
                height: '6px',
                backgroundColor: '#F4F6F8',
                borderRadius: '3px',
                overflow: 'hidden'
            }}>
                <div style={{
                    height: '100%',
                    backgroundColor: '#00AB55',
                    width: `${progress}%`,
                    transition: 'width 0.5s ease-out'
                }} />
            </div>

            <style>{`
                @keyframes pulse {
                    0% { transform: scale(1); opacity: 1; }
                    50% { transform: scale(1.1); opacity: 0.8; }
                    100% { transform: scale(1); opacity: 1; }
                }
            `}</style>
        </div>
    );
};

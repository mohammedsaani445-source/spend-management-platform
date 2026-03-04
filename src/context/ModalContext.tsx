"use client";

import React, { createContext, useContext, useState, ReactNode } from 'react';

type ModalType = 'ALERT' | 'CONFIRM' | 'ERROR';

interface ModalContextType {
    showAlert: (title: string, message: string) => Promise<void>;
    showConfirm: (title: string, message: string) => Promise<boolean>;
    showError: (title: string, message: string) => Promise<void>;
}

const ModalContext = createContext<ModalContextType | undefined>(undefined);

export function ModalProvider({ children }: { children: ReactNode }) {
    const [isOpen, setIsOpen] = useState(false);
    const [type, setType] = useState<ModalType>('ALERT');
    const [title, setTitle] = useState('');
    const [message, setMessage] = useState('');

    // Promise resolvers
    const [resolvePromise, setResolvePromise] = useState<((value: any) => void) | null>(null);

    const showAlert = (title: string, message: string): Promise<void> => {
        return new Promise((resolve) => {
            setTitle(title);
            setMessage(message);
            setType('ALERT');
            setIsOpen(true);
            setResolvePromise(() => resolve);
        });
    };

    const showError = (title: string, message: string): Promise<void> => {
        return new Promise((resolve) => {
            setTitle(title);
            setMessage(message);
            setType('ERROR');
            setIsOpen(true);
            setResolvePromise(() => resolve);
        });
    };

    const showConfirm = (title: string, message: string): Promise<boolean> => {
        return new Promise((resolve) => {
            setTitle(title);
            setMessage(message);
            setType('CONFIRM');
            setIsOpen(true);
            setResolvePromise(() => resolve);
        });
    };

    const handleConfirm = () => {
        setIsOpen(false);
        if (resolvePromise) {
            resolvePromise(true); // For confirm, true
            // For alert/error, just resolves void, which is fine
        }
    };

    const handleCancel = () => {
        setIsOpen(false);
        if (resolvePromise) {
            resolvePromise(false); // For confirm, false
        }
    };

    return (
        <ModalContext.Provider value={{ showAlert, showConfirm, showError }}>
            {children}

            {/* Modal UI */}
            {isOpen && (
                <div style={{
                    position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999
                }}>
                    <div className="card" style={{
                        width: '400px', maxWidth: '90%', textAlign: 'center', padding: '2rem',
                        animation: 'fadeIn 0.2s ease-out'
                    }}>
                        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>
                            {type === 'ERROR' ? '⛔' : type === 'CONFIRM' ? '❓' : 'ℹ️'}
                        </div>

                        <h3 style={{
                            fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1rem',
                            color: type === 'ERROR' ? 'var(--error)' : 'var(--text-primary)'
                        }}>
                            {title}
                        </h3>

                        <p style={{ marginBottom: '2rem', lineHeight: '1.5', color: 'var(--text-secondary)' }}>
                            {message}
                        </p>

                        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                            {type === 'CONFIRM' && (
                                <button className="btn" onClick={handleCancel} style={{ minWidth: '100px' }}>
                                    Cancel
                                </button>
                            )}
                            <button
                                className="btn btn-primary"
                                onClick={handleConfirm}
                                style={{
                                    minWidth: '100px',
                                    backgroundColor: type === 'ERROR' ? 'var(--error)' : 'var(--primary)'
                                }}
                            >
                                {type === 'CONFIRM' ? 'Confirm' : 'OK'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </ModalContext.Provider>
    );
}

export function useModal() {
    const context = useContext(ModalContext);
    if (context === undefined) {
        throw new Error('useModal must be used within a ModalProvider');
    }
    return context;
}

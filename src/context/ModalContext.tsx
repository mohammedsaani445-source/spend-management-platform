"use client";

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { useScrollLock } from '@/hooks/useScrollLock';

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

    useScrollLock(isOpen);

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
                <div className="modal-backdrop">
                    <div className="modal" style={{ width: '400px', maxWidth: '90%', textAlign: 'center', padding: '2rem' }}>
                        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>
                            {type === 'ERROR' ? '⛔' : type === 'CONFIRM' ? '❓' : 'ℹ️'}
                        </div>

                        <h2 className="modal-title" style={{
                            fontSize: '1.25rem', fontWeight: 900, marginBottom: '1rem',
                            color: type === 'ERROR' ? '#991b1b' : 'var(--text-main)',
                            border: 'none', padding: 0
                        }}>
                            {title}
                        </h2>

                        <p style={{ marginBottom: '2rem', lineHeight: '1.5', color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
                            {message}
                        </p>

                        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                            {type === 'CONFIRM' && (
                                <button className="btn" onClick={handleCancel} style={{ minWidth: '120px' }}>
                                    Cancel
                                </button>
                            )}
                            <button
                                className="btn btn-primary"
                                onClick={handleConfirm}
                                style={{
                                    minWidth: '120px',
                                    backgroundColor: type === 'ERROR' ? '#991b1b' : 'var(--brand)',
                                    border: 'none'
                                }}
                            >
                                {type === 'CONFIRM' ? 'Confirm Action' : 'I Understand'}
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

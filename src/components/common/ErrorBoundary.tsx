"use client";

import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
    children: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false,
        error: null
    };

    public static getDerivedStateFromError(error: Error): State {
        // Update state so the next render will show the fallback UI.
        return { hasError: true, error };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error("Uncaught error:", error, errorInfo);
        // Here you would typically log to Sentry or similar service
    }

    public handleReset = () => {
        this.setState({ hasError: false, error: null });
        window.location.href = '/dashboard';
    };

    public render() {
        if (this.state.hasError) {
            return (
                <div style={{
                    height: '100vh',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '2rem',
                    backgroundColor: '#f8fafc'
                }}>
                    <div style={{
                        maxWidth: '500px',
                        width: '100%',
                        backgroundColor: 'white',
                        padding: '2.5rem',
                        borderRadius: '16px',
                        boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)',
                        textAlign: 'center'
                    }}>
                        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⚠️</div>
                        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#0f172a', marginBottom: '1rem' }}>
                            Something went wrong
                        </h2>
                        <p style={{ color: '#64748b', marginBottom: '2rem', lineHeight: 1.6 }}>
                            An unexpected error occurred in the Spend Management Command Center.
                            Our team has been notified.
                        </p>
                        <div style={{
                            backgroundColor: '#f1f5f9',
                            padding: '1rem',
                            borderRadius: '8px',
                            marginBottom: '2rem',
                            textAlign: 'left',
                            fontSize: '0.875rem',
                            fontFamily: 'monospace',
                            color: '#e11d48',
                            overflowX: 'auto'
                        }}>
                            {this.state.error?.message || "Internal Application Error"}
                        </div>
                        <button
                            onClick={this.handleReset}
                            className="btn btn-primary"
                            style={{ width: '100%' }}
                        >
                            Reset Application State
                        </button>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;

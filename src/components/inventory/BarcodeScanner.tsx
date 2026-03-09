"use client";

import { useEffect, useRef, useState } from "react";
import { Html5Qrcode, Html5QrcodeSupportedFormats } from "html5-qrcode";
import { X, Camera, RefreshCcw, AlertTriangle } from "lucide-react";

interface BarcodeScannerProps {
    onScan: (decodedText: string) => void;
    onClose: () => void;
}

export default function BarcodeScanner({ onScan, onClose }: BarcodeScannerProps) {
    const readerRef = useRef<Html5Qrcode | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isStarted, setIsStarted] = useState(false);
    const [isPermissionsLoading, setIsPermissionsLoading] = useState(true);

    const SCANNER_ID = "barcode-scanner-viewport";

    useEffect(() => {
        const startScanner = async () => {
            try {
                setIsPermissionsLoading(true);
                const html5QrCode = new Html5Qrcode(SCANNER_ID);
                readerRef.current = html5QrCode;

                const config = {
                    fps: 10,
                    qrbox: { width: 250, height: 150 },
                    aspectRatio: 1.0,
                };

                // Utility for beep feedback
                const playBeep = () => {
                    try {
                        const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
                        const oscillator = audioCtx.createOscillator();
                        const gainNode = audioCtx.createGain();

                        oscillator.connect(gainNode);
                        gainNode.connect(audioCtx.destination);

                        oscillator.type = "sine";
                        oscillator.frequency.setValueAtTime(800, audioCtx.currentTime); // 800Hz beep
                        gainNode.gain.setValueAtTime(0, audioCtx.currentTime);
                        gainNode.gain.linearRampToValueAtTime(0.1, audioCtx.currentTime + 0.01);
                        gainNode.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.1);

                        oscillator.start(audioCtx.currentTime);
                        oscillator.stop(audioCtx.currentTime + 0.1);
                    } catch (e) {
                        console.warn("Audio feedback failed:", e);
                    }
                };

                // Prefer back camera ("environment")
                await html5QrCode.start(
                    { facingMode: "environment" },
                    config,
                    async (decodedText) => {
                        playBeep();
                        await stopScanner();
                        onScan(decodedText);
                    },
                    (errorMessage) => {
                        // Suppress frequent console spam of "No QR code found"
                    }
                );

                setIsStarted(true);
                setError(null);
            } catch (err: any) {
                console.error("Scanner Error:", err);
                if (err.name === "NotAllowedError") {
                    setError("Camera access denied. Please enable permissions in your browser settings.");
                } else if (err.name === "NotFoundError") {
                    setError("No camera found on this device.");
                } else {
                    setError("Failed to start scanner. Ensure your browser supports camera access.");
                }
            } finally {
                setIsPermissionsLoading(false);
            }
        };

        // Delay slightly to ensure DOM element is ready
        const timeout = setTimeout(startScanner, 100);
        return () => {
            clearTimeout(timeout);
            stopScanner();
        };
    }, []);

    const stopScanner = async () => {
        if (readerRef.current && readerRef.current.isScanning) {
            try {
                await readerRef.current.stop();
                readerRef.current.clear();
            } catch (err) {
                console.error("Stop Error:", err);
            }
        }
        setIsStarted(false);
    };

    return (
        <div style={{
            position: 'relative',
            width: '100%',
            aspectRatio: '1',
            background: '#000',
            borderRadius: '12px',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            border: '2px solid #E2E8F0'
        }}>
            <div id={SCANNER_ID} style={{ width: '100%', height: '100%' }}></div>

            {!isStarted && !error && !isPermissionsLoading && (
                <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.6)', color: 'white', zIndex: 5 }}>
                    <RefreshCcw size={32} className="animate-spin" />
                    <p style={{ marginTop: '0.5rem', fontSize: '0.8rem' }}>Initializing Camera...</p>
                </div>
            )}

            {isPermissionsLoading && (
                <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'rgba(15, 23, 42, 0.9)', color: 'white', zIndex: 5 }}>
                    <Camera size={40} style={{ marginBottom: '1rem', opacity: 0.5 }} />
                    <p style={{ fontWeight: 600 }}>Requesting Permissions...</p>
                </div>
            )}

            {error && (
                <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem', textAlign: 'center', color: 'white', background: 'rgba(157, 23, 77, 0.9)', zIndex: 10 }}>
                    <AlertTriangle size={48} style={{ marginBottom: '1rem' }} />
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '0.5rem' }}>Scanner Error</h3>
                    <p style={{ fontSize: '0.875rem', opacity: 0.9 }}>{error}</p>
                    <button
                        onClick={onClose}
                        style={{ marginTop: '1.5rem', background: 'white', color: '#9d174d', padding: '0.5rem 1.5rem', borderRadius: '8px', fontWeight: 700 }}
                    >
                        Go Back
                    </button>
                </div>
            )}

            {/* Viewfinder Reticle Overlay */}
            {isStarted && (
                <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', border: '50px solid rgba(0,0,0,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div style={{ width: '200px', height: '120px', border: '2px solid #22c55e', borderRadius: '8px', boxShadow: '0 0 0 9999px rgba(0,0,0,0.4)', position: 'relative' }}>
                        {/* Scanning Line Animation */}
                        <div style={{
                            position: 'absolute',
                            left: 0,
                            right: 0,
                            height: '2px',
                            background: 'rgba(34, 197, 94, 0.8)',
                            boxShadow: '0 0 10px #22c55e',
                            top: '10%',
                            animation: 'scanLine 2s infinite linear'
                        }}></div>
                    </div>
                </div>
            )}

            <style jsx>{`
                @keyframes scanLine {
                    0% { top: 10%; }
                    50% { top: 90%; }
                    100% { top: 10%; }
                }
                #barcode-scanner-viewport video {
                    width: 100% !important;
                    height: 100% !important;
                    object-fit: cover !important;
                }
            `}</style>
        </div>
    );
}

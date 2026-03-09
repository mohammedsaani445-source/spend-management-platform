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

    const triggerHaptic = () => {
        if ("vibrate" in navigator) {
            navigator.vibrate(100); // 100ms vibration
        }
    };

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

    useEffect(() => {
        const startScanner = async () => {
            try {
                setIsPermissionsLoading(true);

                // Optimized formats for industry grade scanning
                const formats = [
                    Html5QrcodeSupportedFormats.CODE_128,
                    Html5QrcodeSupportedFormats.CODE_39,
                    Html5QrcodeSupportedFormats.EAN_13,
                    Html5QrcodeSupportedFormats.EAN_8,
                    Html5QrcodeSupportedFormats.UPC_A,
                    Html5QrcodeSupportedFormats.UPC_E,
                    Html5QrcodeSupportedFormats.QR_CODE,
                    Html5QrcodeSupportedFormats.DATA_MATRIX,
                    Html5QrcodeSupportedFormats.ITF
                ];

                const html5QrCode = new Html5Qrcode(SCANNER_ID, {
                    verbose: false,
                    formatsToSupport: formats
                });
                readerRef.current = html5QrCode;

                // High-performance config
                const config = {
                    fps: 20, // Doubled FPS for faster detection
                    qrbox: (viewfinderWidth: number, viewfinderHeight: number) => {
                        // Dynamic box for better 1D barcode alignment
                        const width = viewfinderWidth * 0.8;
                        const height = viewfinderHeight * 0.4;
                        return { width, height };
                    },
                    aspectRatio: 1.0,
                    disableFlip: true // Speed up by not flipping
                };

                await html5QrCode.start(
                    { facingMode: "environment" },
                    config,
                    async (decodedText) => {
                        playBeep();
                        triggerHaptic();
                        await stopScanner();
                        onScan(decodedText);
                    },
                    (errorMessage) => {
                        // Silent during scan
                    }
                );

                setIsStarted(true);
                setError(null);
            } catch (err: any) {
                console.error("Scanner Error:", err);
                if (err.name === "NotAllowedError") {
                    setError("Camera access denied. Please enable permissions.");
                } else if (err.name === "NotFoundError") {
                    setError("No camera found on this device.");
                } else {
                    setError("Failed to start scanner. Retrying...");
                }
            } finally {
                setIsPermissionsLoading(false);
            }
        };

        const timeout = setTimeout(startScanner, 300);
        return () => {
            clearTimeout(timeout);
            stopScanner();
        };
    }, []);

    return (
        <div style={{
            position: 'relative',
            width: '100%',
            aspectRatio: '0.8',
            background: '#000',
            borderRadius: '16px',
            overflow: 'hidden',
            border: '2px solid var(--border)',
            boxShadow: 'var(--shadow-lg)'
        }}>
            <div id={SCANNER_ID} style={{ width: '100%', height: '100%' }}></div>

            {!isStarted && !error && !isPermissionsLoading && (
                <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'rgba(15, 23, 42, 0.9)', color: 'white', zIndex: 5 }}>
                    <RefreshCcw size={32} className="animate-spin" />
                    <p style={{ marginTop: '0.5rem', fontSize: '0.9rem', fontWeight: 600 }}>Active Logistics Engine...</p>
                </div>
            )}

            {isPermissionsLoading && (
                <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'rgba(15, 23, 42, 0.9)', color: 'white', zIndex: 5 }}>
                    <Camera size={40} style={{ marginBottom: '1rem', opacity: 0.5 }} />
                    <p style={{ fontWeight: 600 }}>Booting Optics...</p>
                </div>
            )}

            {error && (
                <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem', textAlign: 'center', color: 'white', background: 'rgba(183, 33, 54, 0.95)', zIndex: 10 }}>
                    <AlertTriangle size={48} style={{ marginBottom: '1rem' }} />
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '0.5rem' }}>Lens Failure</h3>
                    <p style={{ fontSize: '0.875rem', opacity: 0.9 }}>{error}</p>
                    <button
                        onClick={onClose}
                        style={{ marginTop: '1.5rem', background: 'white', color: 'var(--error)', padding: '0.75rem 2rem', borderRadius: '12px', fontWeight: 700, border: 'none' }}
                    >
                        Return to Hub
                    </button>
                </div>
            )}

            {/* Viewfinder Reticle */}
            {isStarted && (
                <>
                    <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', background: 'radial-gradient(circle, transparent 70%, rgba(0,0,0,0.6) 100%)' }}></div>
                    <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '80%', height: '40%', border: '2px solid rgba(255,255,255,0.2)', borderRadius: '12px', pointerEvents: 'none' }}>
                        <div style={{ position: 'absolute', top: '-2px', left: '-2px', width: '20px', height: '20px', borderLeft: '4px solid var(--brand)', borderTop: '4px solid var(--brand)', borderTopLeftRadius: '12px' }}></div>
                        <div style={{ position: 'absolute', top: '-2px', right: '-2px', width: '20px', height: '20px', borderRight: '4px solid var(--brand)', borderTop: '4px solid var(--brand)', borderTopRightRadius: '12px' }}></div>
                        <div style={{ position: 'absolute', bottom: '-2px', left: '-2px', width: '20px', height: '20px', borderLeft: '4px solid var(--brand)', borderBottom: '4px solid var(--brand)', borderBottomLeftRadius: '12px' }}></div>
                        <div style={{ position: 'absolute', bottom: '-2px', right: '-2px', width: '20px', height: '20px', borderRight: '4px solid var(--brand)', borderBottom: '4px solid var(--brand)', borderBottomRightRadius: '12px' }}></div>

                        {/* Laser Line */}
                        <div style={{
                            position: 'absolute',
                            left: '5%',
                            right: '5%',
                            height: '2px',
                            background: 'var(--brand)',
                            boxShadow: '0 0 15px var(--brand)',
                            top: '50%',
                            opacity: 0.8,
                            animation: 'laserPulse 1.5s infinite ease-in-out'
                        }}></div>
                    </div>
                </>
            )}

            <style jsx>{`
                @keyframes laserPulse {
                    0% { top: 15%; opacity: 0.3; }
                    50% { top: 85%; opacity: 1; }
                    100% { top: 15%; opacity: 0.3; }
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

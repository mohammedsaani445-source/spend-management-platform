"use client";

import { useState, useRef } from "react";
import Loader from "@/components/common/Loader";
import { CloudUpload, FileCheck, AlertCircle, X, ShieldCheck, Zap, Sparkles, Binary } from "lucide-react";

interface InvoiceUploadProps {
    onUploadComplete: (url: string, fileName: string, aiData?: any) => void;
    currentFileName?: string;
}

export default function InvoiceUpload({ onUploadComplete, currentFileName }: InvoiceUploadProps) {
    const [dragActive, setDragActive] = useState(false);
    const [uploadStage, setUploadStage] = useState<'IDLE' | 'UPLOADING' | 'ANALYZING' | 'SUCCESS' | 'ERROR'>('IDLE');
    const [fileName, setFileName] = useState(currentFileName || "");
    const [errorMsg, setErrorMsg] = useState("");
    const inputRef = useRef<HTMLInputElement>(null);

    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    const processFile = async (file: File) => {
        setUploadStage('UPLOADING');
        setErrorMsg("");
        
        try {
            // 1. Prepare Base64 for OCR
            console.log("[Invoice-Upload] Phase 1: Preparing base64...");
            const base64 = await new Promise<string>((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = () => {
                    if (!reader.result) return reject(new Error("Failed to read file: Empty result"));
                    const data = (reader.result as string).split(',')[1];
                    resolve(data);
                };
                reader.onerror = () => reject(new Error("FileReader error occurred."));
                reader.readAsDataURL(file);
            });

            // 2. Centralized Server-Side Processing (Upload + AI OCR)
            setUploadStage('UPLOADING');
            console.log("[Invoice-Upload] Phase 2: Transmitting document for secure server-side processing...");

            const response = await fetch('/api/ocr', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    base64Data: base64,
                    fileName: file.name,
                    mimeType: file.type
                })
            });

            if (!response.ok) {
                const errData = await response.json().catch(() => ({ error: "Internal Server Error" }));
                throw new Error(errData.error || `Processing failed with status ${response.status}`);
            }

            const data = await response.json();
            console.log("[Invoice-Upload] Phase 3: Server processing complete. Structured data received.");

            setFileName(file.name);
            setUploadStage('SUCCESS');

            // data.url is provided by the server after it safely uploads the file
            onUploadComplete(data.url, file.name, data);

        } catch (error: any) {
            console.error("[Invoice-Upload] CRITICAL ERROR:", error);
            setUploadStage('ERROR');
            setErrorMsg(error.message || "The AI processing encountered an error.");
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            processFile(e.dataTransfer.files[0]);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        e.preventDefault();
        if (e.target.files && e.target.files[0]) {
            processFile(e.target.files[0]);
        }
    };

    const onButtonClick = () => {
        if (uploadStage === 'IDLE' || uploadStage === 'SUCCESS' || uploadStage === 'ERROR') {
            inputRef.current?.click();
        }
    };

    const handleReset = (e?: React.MouseEvent) => {
        e?.stopPropagation();
        setFileName("");
        setUploadStage('IDLE');
        setErrorMsg("");
        if (inputRef.current) inputRef.current.value = "";
    };

    return (
        <div
            style={{
                width: '100%',
                height: '240px',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '24px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexDirection: 'column',
                background: dragActive 
                    ? 'rgba(56, 189, 248, 0.08)' 
                    : 'rgba(255, 255, 255, 0.03)',
                backdropFilter: 'blur(12px)',
                transition: 'all 0.4s cubic-bezier(0.23, 1, 0.32, 1)',
                cursor: (uploadStage === 'UPLOADING' || uploadStage === 'ANALYZING') ? 'wait' : 'pointer',
                position: 'relative',
                overflow: 'hidden',
                boxShadow: dragActive 
                    ? '0 0 40px rgba(56, 189, 248, 0.15), inset 0 0 20px rgba(56, 189, 248, 0.05)' 
                    : '0 10px 30px -10px rgba(0, 0, 0, 0.5)',
            }}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={onButtonClick}
        >
            {/* Animated background accent */}
            {dragActive && (
                <div style={{
                    position: 'absolute',
                    top: '-50%',
                    left: '-50%',
                    width: '200%',
                    height: '200%',
                    background: 'radial-gradient(circle, rgba(56, 189, 248, 0.1) 0%, transparent 70%)',
                    animation: 'spin 10s linear infinite',
                    pointerEvents: 'none'
                }} />
            )}

            <input
                ref={inputRef}
                type="file"
                style={{ display: 'none' }}
                accept=".pdf,image/*"
                onChange={handleChange}
                disabled={uploadStage === 'UPLOADING' || uploadStage === 'ANALYZING'}
            />

            {(uploadStage === 'UPLOADING' || uploadStage === 'ANALYZING') ? (
                <div style={{ textAlign: 'center', position: 'relative', zIndex: 1 }}>
                    <div style={{ marginBottom: '1.5rem' }}>
                        <div style={{ 
                            width: '80px', height: '80px', borderRadius: '50%', border: '2px solid rgba(255,255,255,0.05)',
                            borderTopColor: 'var(--brand)', animation: 'spin 1s linear infinite', margin: '0 auto'
                        }} />
                    </div>
                    <div style={{ fontWeight: 700, fontSize: '1.1rem', color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '1px' }}>
                        {uploadStage === 'UPLOADING' ? "Securing Document..." : "AI Intelligence Parsing..."}
                    </div>
                    <div style={{ marginTop: '0.75rem', display: 'flex', alignItems: 'center', gap: '8px', color: 'rgba(255,255,255,0.5)', fontSize: '0.75rem', justifyContent: 'center' }}>
                         <Binary size={14} className="pulse" /> 
                         {uploadStage === 'UPLOADING' ? "Encrypting & Storing Data..." : "Neural Network Mapping..."}
                    </div>
                </div>
            ) : (uploadStage === 'SUCCESS' || fileName || currentFileName) ? (
                <div style={{ textAlign: 'center', padding: '1.5rem', animation: 'fadeInScale 0.5s ease-out', position: 'relative', zIndex: 1 }}>
                    <div style={{
                        width: '64px', height: '64px', background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', color: 'white',
                        borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem',
                        boxShadow: '0 10px 20px -5px rgba(16, 185, 129, 0.4)'
                    }}>
                        <FileCheck size={32} />
                    </div>
                    <div style={{ fontWeight: 800, fontSize: '1.1rem', color: 'var(--text-primary)', marginBottom: '0.5rem', maxWidth: '350px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {fileName || currentFileName}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', color: '#10b981', justifyContent: 'center', fontWeight: 700, background: 'rgba(16, 185, 129, 0.1)', padding: '6px 12px', borderRadius: '30px' }}>
                        <Sparkles size={14} /> Extraction Complete
                    </div>
                    <button
                        onClick={handleReset}
                        style={{
                            marginTop: '1.5rem',
                            padding: '10px 24px',
                            borderRadius: '12px',
                            border: '1px solid rgba(255, 255, 255, 0.05)',
                            background: 'rgba(255, 255, 255, 0.03)',
                            fontSize: '0.8rem',
                            fontWeight: 700,
                            color: 'rgba(255,255,255,0.7)',
                            cursor: 'pointer',
                            transition: 'all 0.2s'
                        }}
                    >
                        Replace Document
                    </button>
                </div>
            ) : uploadStage === 'ERROR' ? (
                <div style={{ textAlign: 'center', padding: '1.5rem', animation: 'shake 0.4s ease-in-out' }}>
                    <div style={{
                        width: '60px', height: '60px', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444',
                        borderRadius: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem'
                    }}>
                        <AlertCircle size={32} />
                    </div>
                    <div style={{ fontWeight: 800, color: 'var(--text-primary)' }}>Parsing Error</div>
                    <div style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.5)', marginTop: '0.5rem', maxWidth: '250px' }}>{errorMsg}</div>
                    <button 
                        style={{ 
                            marginTop: '1.5rem', 
                            padding: '8px 20px', 
                            borderRadius: '10px', 
                            background: '#ef4444', 
                            color: 'white', 
                            border: 'none', 
                            fontWeight: 600,
                            cursor: 'pointer'
                        }} 
                        onClick={handleReset}
                    >
                        Try Again
                    </button>
                </div>
            ) : (
                <div style={{ textAlign: 'center', padding: '2rem' }}>
                    <div style={{
                        width: '72px', height: '72px', background: 'linear-gradient(135deg, var(--brand) 0%, #0284c7 100%)', color: 'white',
                        borderRadius: '22px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem',
                        boxShadow: '0 15px 25px -10px rgba(56, 189, 248, 0.4)',
                        transition: 'transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
                    }} className="upload-icon-container">
                        <CloudUpload size={38} />
                    </div>
                    <div style={{ fontWeight: 800, fontSize: '1.2rem', color: 'var(--text-primary)', marginBottom: '0.5rem' }}>Upload Business Invoice</div>
                    <div style={{ fontSize: '0.95rem', color: 'rgba(255,255,255,0.4)' }}>
                        Drag files here or <span style={{ color: 'var(--brand)', fontWeight: 700 }}>Browse</span>
                    </div>
                    <div style={{ 
                        fontSize: '0.7rem', 
                        marginTop: '1.5rem', 
                        padding: '6px 14px',
                        background: 'rgba(255,255,255,0.03)',
                        borderRadius: '30px',
                        border: '1px solid rgba(255,255,255,0.05)',
                        color: 'rgba(255,255,255,0.3)',
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '6px', 
                        justifyContent: 'center' 
                    }}>
                        <ShieldCheck size={12} /> Military-Grade Encryption Active
                    </div>
                </div>
            )}

            <style jsx>{`
                @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
                @keyframes pulse { 0% { opacity: 0.4; } 50% { opacity: 1; } 100% { opacity: 0.4; } }
                @keyframes fadeInScale { from { opacity: 0; transform: scale(0.9); } to { opacity: 1; transform: scale(1); } }
                @keyframes shake {
                    0%, 100% { transform: translateX(0); }
                    25% { transform: translateX(-5px); }
                    75% { transform: translateX(5px); }
                }
                .pulse { animation: pulse 2s infinite; }
                .upload-icon-container {
                    animation: float 4s ease-in-out infinite;
                }
                @keyframes float {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-8px); }
                }
            `}</style>
        </div>
    );
}

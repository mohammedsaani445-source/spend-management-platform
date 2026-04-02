"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ShieldCheck, 
  ArrowRight, 
  Clock, 
  CheckCircle2, 
  Lock, 
  KeyRound, 
  Mail,
  Zap,
  TrendingUp,
  UserCheck
} from "lucide-react";
import styles from "./Join.module.css";

// --- Types ---
type Stage = 0 | 1 | 2 | 3 | 4;

interface InviteData {
  id: string;
  email: string;
  role: string;
  organization: string;
  expiresIn: string;
}

// --- Mock Data ---
const MOCK_INVITE: InviteData = {
  id: "inv_99281",
  email: "alex.chen@enterprise.io",
  role: "Procurement Manager",
  organization: "Global Logistics Corp",
  expiresIn: "48 hours",
};

export default function JoinPage() {
  const [stage, setStage] = useState<Stage>(0);
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [redirectProgress, setRedirectProgress] = useState(0);
  
  // Stages: 0:Loading, 1:Welcome, 2:Code, 3:Password, 4:Success

  useEffect(() => {
    // Stage 0 -> 1 Transition (1.5s Loader)
    const timer = setTimeout(() => {
      setStage(1);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    // Redirect Countdown for Success Stage
    if (stage === 4) {
      const interval = setInterval(() => {
        setRedirectProgress(prev => {
          if (prev >= 100) {
            clearInterval(interval);
            // window.location.href = "/dashboard";
            return 100;
          }
          return prev + 2; // ~5 seconds total
        });
      }, 100);
      return () => clearInterval(interval);
    }
  }, [stage]);

  // Stage Handlers
  const handleNext = () => setStage((prev) => (prev + 1) as Stage);
  
  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) value = value[0];
    if (!/^[0-9A-Z]?$/.test(value.toUpperCase())) return;

    const newOtp = [...otp];
    newOtp[index] = value.toUpperCase();
    setOtp(newOtp);

    // Auto-advance
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`);
      prevInput?.focus();
    }
  };

  return (
    <main className={styles.join_container}>
      {/* Background Decorations */}
      <div className={styles.top_glow} />
      {[...Array(22)].map((_, i) => (
        <div 
          key={i} 
          className={styles.particle} 
          style={{
            top: `${Math.random() * 100}%`,
            left: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 5}s`,
            animationDuration: `${5 + Math.random() * 10}s`
          }} 
        />
      ))}

      {/* Header */}
      <header className={styles.header}>
        <motion.div 
          className={styles.logo_icon}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
        >
          <ShieldCheck size={28} color="white" strokeWidth={2.5} />
        </motion.div>
        <AnimatePresence mode="wait">
          {stage > 0 && stage < 4 && (
            <motion.div 
              key="badge"
              className={styles.invite_badge}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
            >
              Secure Invitation
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Main Card */}
      <AnimatePresence mode="wait">
        {stage === 0 && <StageLoading key="s0" />}
        {stage === 1 && <StageWelcome key="s1" data={MOCK_INVITE} onNext={handleNext} />}
        {stage === 2 && (
          <StageVerify 
            key="s2" 
            otp={otp} 
            onChange={handleOtpChange} 
            onKeyDown={handleOtpKeyDown} 
            onNext={handleNext} 
          />
        )}
        {stage === 3 && (
          <StagePassword 
            key="s3" 
            password={password} 
            confirm={confirmPassword}
            setPassword={setPassword}
            setConfirm={setConfirmPassword}
            onNext={handleNext} 
          />
        )}
        {stage === 4 && <StageSuccess key="s4" progress={redirectProgress} />}
      </AnimatePresence>

      {/* Footer */}
      <footer className={styles.footer}>
        <p className={styles.footer_text}>&copy; 2026 Apex Procure • Forensic Spend Management</p>
        <div className={styles.footer_links}>
          <a href="#" className={styles.footer_link}>Security Whitepaper</a>
          <a href="#" className={styles.footer_link}>Privacy Policy</a>
          <a href="#" className={styles.footer_link}>Terms of Service</a>
        </div>
      </footer>
    </main>
  );
}

// --- Stages ---

function StageLoading() {
  return (
    <motion.div 
      className={styles.activation_card}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 1.05 }}
      style={{ justifyContent: 'center', minHeight: '300px' }}
    >
      <div className="flex flex-col items-center gap-6">
        <div className="relative">
          <motion.div 
            className="w-16 h-16 border-4 border-[#F3F4F6] border-t-[#1A1A1A] rounded-full"
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
          />
        </div>
        <div>
          <h2 className={styles.card_title}>Validating Token</h2>
          <p className={styles.card_subtitle}>Securing end-to-end encrypted handshake...</p>
        </div>
      </div>
    </motion.div>
  );
}

function StageWelcome({ data, onNext }: { data: InviteData, onNext: () => void }) {
  return (
    <motion.div 
      className={styles.activation_card}
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
    >
      <div>
        <h2 className={styles.card_title}>Welcome, {data.email.split('@')[0]}</h2>
        <p className={styles.card_subtitle}>
          You have been invited to join <strong>{data.organization}</strong> as a core team member.
        </p>
      </div>

      <div className={styles.role_card}>
        <div className={styles.role_icon_box}>
          <UserCheck size={24} />
        </div>
        <div className={styles.role_info}>
          <span className={styles.role_label}>Assigned Role</span>
          <span className={styles.role_value}>{data.role}</span>
        </div>
      </div>

      <div className={styles.expiry_warning}>
        <Clock size={16} />
        This invitation expires in {data.expiresIn}
      </div>

      <button className={styles.primary_button} onClick={onNext}>
        Begin Activation <ArrowRight size={18} />
      </button>
    </motion.div>
  );
}

function StageVerify({ otp, onChange, onKeyDown, onNext }: any) {
  const isComplete = otp.every((v: string) => v !== "");
  
  return (
    <motion.div 
      className={styles.activation_card}
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
    >
      <div>
        <h2 className={styles.card_title}>Access Code</h2>
        <p className={styles.card_subtitle}>
          Enter the 6-digit forensic code shared by your administrator.
        </p>
      </div>

      <div className={styles.code_input_group}>
        <span className={styles.prefix_label}>IDENTIFIER: AP-</span>
        <div className={styles.otp_container}>
          {otp.map((val: string, i: number) => {
            const isActive = i === otp.filter(Boolean).length || (i === 5 && isComplete);
            return (
              <div key={i} className={`${styles.otp_box} ${isActive ? styles.otp_box_active : ''}`}>
                <input
                  id={`otp-${i}`}
                  type="text"
                  maxLength={1}
                  value={val}
                  onChange={(e) => onChange(i, e.target.value)}
                  onKeyDown={(e) => onKeyDown(i, e)}
                  autoFocus={i === 0}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-text"
                  inputMode="numeric"
                />
                {val}
                {isActive && !val && <div className={styles.cursor_blink} />}
              </div>
            );
          })}
        </div>
      </div>

      <button 
        className={styles.primary_button} 
        disabled={!isComplete} 
        onClick={onNext}
      >
        Verify Identity <Lock size={18} />
      </button>

      <p className="text-[13px] color-[#888888]">
        System ID: <code className="bg-[#F3F4F6] px-2 py-0.5 rounded">#AP-X-901-Z</code>
      </p>
    </motion.div>
  );
}

function StagePassword({ password, confirm, setPassword, setConfirm, onNext }: any) {
  const [showReqs, setShowReqs] = useState(false);
  
  const rules = [
    { label: "8+ characters", valid: password.length >= 8 },
    { label: "1 number", valid: /[0-9]/.test(password) },
    { label: "1 special char", valid: /[^A-Za-z0-9]/.test(password) },
    { label: "Matches", valid: password === confirm && password.length > 0 },
  ];

  const strength = rules.filter(r => r.valid).length;
  const isReady = rules.every(r => r.valid);

  return (
    <motion.div 
      className={styles.activation_card}
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
    >
      <div>
        <h2 className={styles.card_title}>Secure Account</h2>
        <p className={styles.card_subtitle}>Set a high-entropy password to protect your procurement vault.</p>
      </div>

      <div className={styles.password_form}>
        <div className={styles.input_field_wrapper}>
          <label className={styles.field_label}>New Password</label>
          <input 
            type="password" 
            className={styles.text_input} 
            placeholder="••••••••"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              setShowReqs(true);
            }}
          />
        </div>

        <div className={styles.strength_meter_container}>
          <div className={styles.meter_bars}>
            <div className={`${styles.meter_bar} ${strength >= 1 ? styles.meter_bar_weak : ''}`} />
            <div className={`${styles.meter_bar} ${strength >= 2 ? styles.meter_bar_fair : ''}`} />
            <div className={`${styles.meter_bar} ${strength >= 3 ? styles.meter_bar_good : ''}`} />
            <div className={`${styles.meter_bar} ${strength >= 4 ? styles.meter_bar_strong : ''}`} />
          </div>
          <div className={styles.requirement_pills}>
            {rules.map((rule, i) => (
              <div 
                key={i} 
                className={`${styles.req_pill} ${rule.valid ? styles.req_pill_valid : ''}`}
              >
                {rule.valid && <CheckCircle2 size={10} />} {rule.label}
              </div>
            ))}
          </div>
        </div>

        <div className={styles.input_field_wrapper}>
          <label className={styles.field_label}>Confirm Password</label>
          <input 
            type="password" 
            className={styles.text_input} 
            placeholder="••••••••"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
          />
        </div>
      </div>

      <button 
        className={styles.primary_button} 
        disabled={!isReady}
        onClick={onNext}
      >
        Complete Setup <KeyRound size={18} />
      </button>
    </motion.div>
  );
}

function StageSuccess({ progress }: { progress: number }) {
  return (
    <motion.div 
      className={styles.activation_card}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
    >
      <div className={styles.success_icon_container}>
        <motion.div 
          className={styles.checkmark_circle}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 15 }}
        >
          <svg className="w-10 h-10 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <motion.path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={3} 
              d="M5 13l4 4L19 7" 
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
            />
          </svg>
        </motion.div>
      </div>

      <div>
        <h2 className={styles.card_title}>Setup Complete</h2>
        <p className={styles.card_subtitle}>
          Your workstation has been provisioned and synced with the procurement network.
        </p>
      </div>

      <div className="bg-[#F9F9F9] p-4 rounded-xl flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-emerald-100 text-emerald-700 rounded-lg flex items-center justify-center">
            <TrendingUp size={20} />
          </div>
          <div className="text-left">
            <p className="text-[11px] text-gray-500 uppercase font-bold tracking-wider">Access Tier</p>
            <p className="text-sm font-semibold">Priority Advanced</p>
          </div>
        </div>
        <CheckCircle2 size={18} className="text-emerald-500" />
      </div>

      <div>
        <div className="flex justify-between text-[12px] text-gray-500 mb-2">
          <span>Redirecting to Dashboard</span>
          <span>{Math.round(progress)}%</span>
        </div>
        <div className={styles.redirect_bar}>
          <div className={styles.redirect_progress} style={{ width: `${progress}%` }} />
        </div>
      </div>
    </motion.div>
  );
}

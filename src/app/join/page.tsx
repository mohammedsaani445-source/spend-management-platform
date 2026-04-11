"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ShieldCheck, 
  ArrowRight, 
  Check, 
  Lock, 
  KeyRound, 
  Zap,
  Layout,
  MessageSquare,
  Globe,
  Loader2,
  CheckCircle2
} from "lucide-react";
import styles from "./Join.module.css";

// --- Types ---
type Stage = 0 | 1 | 2 | 3 | 4;

interface RoleConfig {
  name: string;
  icon: string;
  colorClass: string;
  markClass: string;
}

const ROLES: Record<string, RoleConfig> = {
  "Procurement Manager": {
    name: "Procurement Manager",
    icon: "📦",
    colorClass: styles.role_indigo,
    markClass: styles.role_mark_indigo,
  },
  "Finance Lead": {
    name: "Finance Lead",
    icon: "💰",
    colorClass: styles.role_emerald,
    markClass: styles.role_mark_emerald,
  },
  "Department Head": {
    name: "Department Head",
    icon: "🏢",
    colorClass: styles.role_blue,
    markClass: styles.role_mark_blue,
  }
};

export default function JoinPage() {
  const [stage, setStage] = useState<Stage>(0);
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);

  // Stage 0 -> 1 Transition
  useEffect(() => {
    if (stage === 0) {
      const timer = setTimeout(() => setStage(1), 1500);
      return () => clearTimeout(timer);
    }
  }, [stage]);

  // Handle Success Progress
  useEffect(() => {
    if (stage === 4) {
      const interval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 100) {
            clearInterval(interval);
            return 100;
          }
          return prev + 2;
        });
      }, 100);
      return () => clearInterval(interval);
    }
  }, [stage]);

  const handleNext = () => setStage((prev) => (prev + 1) as Stage);

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) value = value[value.length - 1];
    if (!/^[0-9]?$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 5) {
      document.getElementById(`otp-${index + 1}`)?.focus();
    }
  };

  const currentRole = ROLES["Procurement Manager"]; // Mocked for demo as per spec

  return (
    <main className={styles.join_container}>
      <div className={styles.top_glow} />
      
      {/* Background Particles */}
      {[...Array(15)].map((_, i) => (
        <div 
          key={i} 
          className={styles.particle} 
          style={{
            top: `${Math.random() * 80}%`,
            left: `${Math.random() * 100}%`,
            opacity: Math.random() * 0.5,
          }} 
        />
      ))}

      {/* Header */}
      <div className={styles.header_wrapper}>
        <div className={styles.logo_brand}>
          <div className={styles.logo_mark}>AP</div>
          <span className={styles.brand_name}>Apex Procure</span>
        </div>
        <div className={styles.secure_badge}>
          <ShieldCheck size={14} />
          Secure Connection
        </div>
      </div>

      {/* Card Container */}
      <AnimatePresence mode="wait">
        <motion.div 
          key={stage}
          className={styles.activation_card}
          initial={{ opacity: 0, y: 10, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, scale: 1.02, y: -10 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        >
          {stage === 0 && <StageLoading />}
          {stage === 1 && <StageWelcome role={currentRole} onNext={handleNext} />}
          {stage === 2 && <StageIdentity otp={otp} onOtpChange={handleOtpChange} onNext={handleNext} />}
          {stage === 3 && (
            <StageVault 
              password={password} 
              setPassword={setPassword} 
              confirm={confirmPassword} 
              setConfirm={setConfirmPassword} 
              onNext={handleNext} 
            />
          )}
          {stage === 4 && <StageCelebration progress={progress} />}
        </motion.div>
      </AnimatePresence>

      {/* Footer */}
      <footer className={styles.footer}>
        <p className={styles.footer_text}>&copy; 2026 Apex Procure • Forensic Spend Management</p>
      </footer>
    </main>
  );
}

// --- Stages ---

function StageLoading() {
  return (
    <div className="flex flex-col items-center justify-center py-12 gap-8">
      <div className="relative">
        <div className={styles.logo_mark} style={{ width: 64, height: 64, fontSize: 24 }}>AP</div>
        <motion.div 
          className="absolute -inset-2 border-2 border-[#1A1A1A] rounded-2xl"
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
        />
      </div>
      <div className="text-center">
        <h2 className={styles.card_title} style={{ fontSize: 24 }}>Handshake...</h2>
        <p className={styles.card_subtitle}>Validating your secure invite link.</p>
      </div>
    </div>
  );
}

function StageWelcome({ role, onNext }: { role: RoleConfig, onNext: () => void }) {
  return (
    <>
      <div className={styles.progress_header}>
        <div className={`${styles.step_dot} ${styles.step_dot_active}`} />
        <div className={styles.step_dot} />
        <div className={styles.step_dot} />
      </div>

      <div className="space-y-2">
        <div className={styles.invited_from}>
          <div className={styles.invited_logo}>AP</div>
          Invited from APEX Global
        </div>
        <h2 className={styles.card_title}>Hey Kwame,<br />welcome aboard.</h2>
        <p className={styles.card_subtitle}>You've been provisioned with advanced procurement access. Let's get you set up.</p>
      </div>

      <div className={`${styles.role_card} ${role.colorClass}`}>
        <div className={`${styles.role_mark} ${role.markClass}`}>
          {role.icon}
        </div>
        <div className={styles.role_meta}>
          <span className={styles.role_label}>Assigned Role</span>
          <span className={styles.role_name}>{role.name}</span>
        </div>
      </div>

      <div className="space-y-4">
        <p className={styles.text_label}>What you'll need</p>
        <div className={styles.need_list}>
          <div className={styles.need_item}>
            <div className={styles.item_check}><Check size={12} /></div>
            Access Code from Admin
          </div>
          <div className={styles.need_item}>
            <div className={styles.item_check}><Check size={12} /></div>
            Company Auth Details
          </div>
        </div>
      </div>

      <button className={styles.primary_btn} onClick={onNext}>
        Start Activation <ArrowRight size={18} />
      </button>
    </>
  );
}

function StageIdentity({ otp, onOtpChange, onNext }: any) {
  const isComplete = otp.every((v: string) => v !== "");

  return (
    <>
      <div className={styles.progress_header}>
        <div className={styles.step_dot} />
        <div className={`${styles.step_dot} ${styles.step_dot_active}`} />
        <div className={styles.step_dot} />
      </div>

      <div className="space-y-2">
        <h2 className={styles.card_title}>Confirm Identity</h2>
        <p className={styles.card_subtitle}>Enter the 6-digit access code sent to your registered company device.</p>
      </div>

      <div className="space-y-4">
        <div className={styles.code_prefix}>AP-</div>
        <div className={styles.otp_grid}>
          {otp.map((val: string, i: number) => (
            <input 
              key={i}
              id={`otp-${i}`}
              type="text"
              maxLength={1}
              value={val}
              className={styles.otp_input}
              onChange={(e) => onOtpChange(i, e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Backspace" && !otp[i] && i > 0) {
                  document.getElementById(`otp-${i - 1}`)?.focus();
                }
              }}
              autoFocus={i === 0 && !otp[0]}
            />
          ))}
        </div>
      </div>

      <button className={styles.primary_btn} disabled={!isComplete} onClick={onNext}>
        Verify Access <Lock size={18} />
      </button>

      <p className="text-[13px] text-gray-400 font-medium text-center">
        Didn't receive a code? <button className="text-[#1A1A1A] font-bold underline">Contact Admin</button>
      </p>
    </>
  );
}

function StageVault({ password, setPassword, confirm, setConfirm, onNext }: any) {
  const requirements = [
    { label: "8+ characters", valid: password.length >= 8 },
    { label: "At least 1 number", valid: /[0-9]/.test(password) },
    { label: "1 special character", valid: /[^A-Za-z0-9]/.test(password) },
    { label: "Passwords match", valid: password === confirm && password.length > 0 },
  ];

  const strength = requirements.filter(r => r.valid).length;

  return (
    <>
      <div className={styles.progress_header}>
        <div className={styles.step_dot} />
        <div className={styles.step_dot} />
        <div className={`${styles.step_dot} ${styles.step_dot_active}`} />
      </div>

      <div className="space-y-2">
        <h2 className={styles.card_title}>Secure Your Vault</h2>
        <p className={styles.card_subtitle}>Create a high-entropy password to protect your procurement station.</p>
      </div>

      <div className="space-y-6">
        <div className={styles.input_group}>
          <div className={styles.label_row}>
            <span className={styles.text_label}>Enter Password</span>
            <span className="text-[10px] font-bold text-gray-400 uppercase">Secure Hub</span>
          </div>
          <input 
            type="password"
            className={styles.input_field}
            placeholder="••••••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <div className={styles.strength_meter}>
          <div className={`${styles.meter_seg} ${strength >= 1 ? styles.meter_seg_weak : ''}`} />
          <div className={`${styles.meter_seg} ${strength >= 2 ? styles.meter_seg_medium : ''}`} />
          <div className={`${styles.meter_seg} ${strength >= 3 ? styles.meter_seg_good : ''}`} />
          <div className={`${styles.meter_seg} ${strength >= 4 ? styles.meter_seg_strong : ''}`} />
        </div>

        <div className={styles.req_grid}>
          {requirements.map((req, i) => (
            <div key={i} className={styles.req_item}>
              <div className={`${styles.req_check} ${req.valid ? styles.req_check_valid : ''}`}>
                <Check size={10} />
              </div>
              {req.label}
            </div>
          ))}
        </div>

        <div className={styles.input_group}>
          <span className={styles.text_label}>Confirm Password</span>
          <input 
            type="password"
            className={styles.input_field}
            placeholder="••••••••••••"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
          />
        </div>
      </div>

      <button 
        className={styles.primary_btn} 
        disabled={strength < 4}
        onClick={onNext}
      >
        Complete Setup <KeyRound size={18} />
      </button>
    </>
  );
}

function StageCelebration({ progress }: { progress: number }) {
  return (
    <div className="space-y-8 text-center pt-4">
      <div className={styles.success_circle}>
        <Check size={40} strokeWidth={3} />
      </div>

      <div className="space-y-2">
        <h2 className={styles.card_title}>Welcome to the Hub.</h2>
        <p className={styles.card_subtitle}>Your workstation is provisioned. You now have full access to APEX Procure.</p>
      </div>

      <div className={styles.access_grid}>
        <div className={styles.access_item}>
          <div className={styles.access_icon_box}><Zap size={16} /></div>
          <span className={styles.access_title}>Instant Approval</span>
          <p className={styles.access_desc}>Route and approve requisitions in real-time.</p>
        </div>
        <div className={styles.access_item}>
          <div className={styles.access_icon_box}><Globe size={16} /></div>
          <span className={styles.access_title}>Global Sourcing</span>
          <p className={styles.access_desc}>Access the worldwide vendor network.</p>
        </div>
        <div className={styles.access_item}>
          <div className={styles.access_icon_box}><Layout size={16} /></div>
          <span className={styles.access_title}>Spent IQ</span>
          <p className={styles.access_desc}>AI-driven forensic spend analytics.</p>
        </div>
        <div className={styles.access_item}>
          <div className={styles.access_icon_box}><MessageSquare size={16} /></div>
          <span className={styles.access_title}>Team Collab</span>
          <p className={styles.access_desc}>Integrated stakeholder comms hub.</p>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex justify-between items-end">
          <span className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Entering Dashboard</span>
          <span className="text-sm font-bold">{Math.round(progress)}%</span>
        </div>
        <div className="h-2 w-full bg-[#F0F0F0] rounded-full overflow-hidden">
          <motion.div 
            className="h-full bg-[#1A1A1A]" 
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  );
}

"use client";

import React, { useState, useEffect, useRef, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
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
  UserCheck,
  Building2,
  Fingerprint,
  Loader2,
  Shield
} from "lucide-react";
import { auth, db, DB_PREFIX } from '@/lib/firebase';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { ref, get, update } from 'firebase/database';
import styles from "./Activate.module.css";

// --- Types ---
type Stage = 0 | 1 | 2 | 3 | 4;

interface InviteData {
  id: string;
  email: string;
  role: string;
  name: string;
  organization: string;
  expiresIn: string;
  tenantId: string;
  inviteId: string;
}

function ActivateContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get('token');

  const [stage, setStage] = useState<Stage>(0);
  const [activeToken, setActiveToken] = useState<string | null>(null);
  const [invitation, setInvitation] = useState<InviteData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [redirectProgress, setRedirectProgress] = useState(0);
  const [isMounted, setIsMounted] = useState(false);
  
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // 1. Initial Fetch (Stage 0)
  useEffect(() => {
    let activeToken = token;
    if (!activeToken) {
      const stored = sessionStorage.getItem('apex_pending_invite');
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          activeToken = parsed.token;
        } catch (e) { console.error(e); }
      }
    }

    if (!activeToken) {
      setError("Invalid or missing activation token.");
      return;
    }

    setActiveToken(activeToken as string);
    fetchInvitation(activeToken as string);
  }, [token]);

  const fetchInvitation = async (invitationToken: string) => {
    try {
      const tokenRef = ref(db, `${DB_PREFIX}/inviteTokens/${invitationToken}`);
      const tokenSnap = await get(tokenRef);

      if (!tokenSnap.exists()) {
        setError("Invitation not found or has expired.");
        return;
      }

      const { tenantId, inviteId } = tokenSnap.val();
      const invRef = ref(db, `${DB_PREFIX}/tenants/${tenantId}/invites/${inviteId}`);
      const invSnap = await get(invRef);

      if (!invSnap.exists()) {
        setError("Invitation data is missing.");
        return;
      }

      const data = invSnap.val();
      if (data.used) {
        setError("This invitation has already been used.");
        return;
      }

      if (new Date(data.expires_at) < new Date()) {
        setError("This invitation has expired.");
        return;
      }

      setInvitation({
        id: inviteId,
        email: data.invited_email,
        name: data.invited_name,
        role: data.role || "Member",
        organization: "Apex Enterprise", // In real scenario, fetch tenant name
        expiresIn: "48 hours",
        tenantId,
        inviteId
      });

      // Show loader for at least 1s for "Forensic" Feel
      setTimeout(() => setStage(1), 1000);

    } catch (err: any) {
      console.error(err);
      setError("System error. Please try again later.");
    }
  };

  // 2. Finalize Account (Stage 3 -> 4)
  const finalizeActivation = async () => {
    if (!invitation) return;
    setLoading(true);
    setError(null);

    try {
      const { tenantId, inviteId, email, name, role } = invitation;
      
      // 1. Create Auth
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      await updateProfile(user, { displayName: name });

      // 2. Finalize via Server-Side API (Admin SDK) to bypass Security Rules
      const response = await fetch('/api/v1/invites/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          uid: user.uid,
          email: user.email,
          token: activeToken, 
          displayName: name
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to sync account with tenant.');
      }

      setStage(4);
      startRedirectTimer();
    } catch (err: any) {
      setError(err.message || "Failed to create account.");
      setLoading(false);
    }
  };

  const startRedirectTimer = () => {
    const interval = setInterval(() => {
      setRedirectProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          router.push('/dashboard');
          return 100;
        }
        return prev + 2;
      });
    }, 100);
  };

  // Stage Handlers
  const handleNext = () => setStage((prev) => (prev + 1) as Stage);
  
  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) value = value[0];
    if (!/^[0-9A-Z]?$/.test(value.toUpperCase())) return;

    const newOtp = [...otp];
    newOtp[index] = value.toUpperCase();
    setOtp(newOtp);

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

  if (error) {
    return (
      <div className={styles.join_container}>
        <div className={styles.activation_card}>
          <div className="w-16 h-16 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto">
            <Shield size={32} />
          </div>
          <h2 className={styles.card_title}>Activation Error</h2>
          <p className={styles.card_subtitle}>{error}</p>
          <button className={styles.primary_button} onClick={() => router.push('/login')}>
            Return to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <main className={styles.join_container}>
      <div className={styles.top_glow} />
      {isMounted && [...Array(22)].map((_, i) => (
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

      <header className={styles.header}>
        <motion.div className={styles.logo_icon} initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
          <ShieldCheck size={28} color="white" strokeWidth={2.5} />
        </motion.div>
        {stage > 0 && stage < 4 && (
          <div className={styles.invite_badge}>Secure Activation</div>
        )}
      </header>

      <AnimatePresence mode="wait">
        {stage === 0 && <StageLoading key="s0" />}
        {stage === 1 && invitation && <StageWelcome key="s1" data={invitation} onNext={handleNext} />}
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
            onNext={finalizeActivation} 
            loading={loading}
          />
        )}
        {stage === 4 && <StageSuccess key="s4" progress={redirectProgress} />}
      </AnimatePresence>

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
      exit={{ opacity: 0 }}
      style={{ justifyContent: 'center', minHeight: '300px' }}
    >
      <div className="flex flex-col items-center gap-6">
        <Loader2 className="h-10 w-10 animate-spin text-[#1A1A1A]" />
        <div>
          <h2 className={styles.card_title}>Validating Account</h2>
          <p className={styles.card_subtitle}>Securing forensic procurement vault...</p>
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
        <h2 className={styles.card_title}>Welcome, {data.name.split(' ')[0]}</h2>
        <p className={styles.card_subtitle}>
          You have been invited to join <strong>{data.organization}</strong>.
        </p>
      </div>

      <div className={styles.role_card}>
        <div className={styles.role_icon_box}><UserCheck size={24} /></div>
        <div className={styles.role_info}>
          <span className={styles.role_label}>Assigned Role</span>
          <span className={styles.role_value}>{data.role}</span>
        </div>
      </div>

      <div className={styles.expiry_warning}><Clock size={16} />Expires in {data.expiresIn}</div>

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
        <h2 className={styles.card_title}>Access Identity</h2>
        <p className={styles.card_subtitle}>Confirm your activation with the 6-digit code shared by admin.</p>
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
                />
                {val}
                {isActive && !val && <div className={styles.cursor_blink} />}
              </div>
            );
          })}
        </div>
      </div>
      <button className={styles.primary_button} disabled={!isComplete} onClick={onNext}>
        Verify Identity <Lock size={18} />
      </button>
    </motion.div>
  );
}

function StagePassword({ password, confirm, setPassword, setConfirm, onNext, loading }: any) {
  const rules = [
    { label: "8+ characters", valid: password.length >= 8 },
    { label: "1 number", valid: /[0-9]/.test(password) },
    { label: "1 special char", valid: /[^A-Za-z0-9]/.test(password) },
    { label: "Matches", valid: password === confirm && password.length > 0 },
  ];
  const strength = rules.filter(r => r.valid).length;
  const isReady = rules.every(r => r.valid);

  return (
    <motion.div className={styles.activation_card} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
      <div>
        <h2 className={styles.card_title}>Secure Account</h2>
        <p className={styles.card_subtitle}>Set a high-entropy password to protect your vault.</p>
      </div>
      <div className={styles.password_form}>
        <div className={styles.input_field_wrapper}>
          <label className={styles.field_label}>New Password</label>
          <input type="password" className={styles.text_input} value={password} onChange={(e) => setPassword(e.target.value)} />
        </div>
        <div className={styles.strength_meter_container}>
          <div className={styles.meter_bars}>
            {[1,2,3,4].map(i => <div key={i} className={`${styles.meter_bar} ${strength >= i ? [styles.meter_bar_weak, styles.meter_bar_fair, styles.meter_bar_good, styles.meter_bar_strong][i-1] : ''}`} />)}
          </div>
          <div className={styles.requirement_pills}>
            {rules.map((rule, i) => <div key={i} className={`${styles.req_pill} ${rule.valid ? styles.req_pill_valid : ''}`}>{rule.valid && <CheckCircle2 size={10} />} {rule.label}</div>)}
          </div>
        </div>
        <div className={styles.input_field_wrapper}>
          <label className={styles.field_label}>Confirm Password</label>
          <input type="password" className={styles.text_input} value={confirm} onChange={(e) => setConfirm(e.target.value)} />
        </div>
      </div>
      <button className={styles.primary_button} disabled={!isReady || loading} onClick={onNext}>
        {loading ? <Loader2 className="animate-spin" /> : <>Complete Setup <KeyRound size={18} /></>}
      </button>
    </motion.div>
  );
}

function StageSuccess({ progress }: { progress: number }) {
  return (
    <motion.div className={styles.activation_card} initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
      <div className={styles.success_icon_container}>
        <div className={styles.checkmark_circle}>
          <svg className="w-10 h-10 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <motion.path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.5 }} />
          </svg>
        </div>
      </div>
      <div>
        <h2 className={styles.card_title}>Redemption Complete</h2>
        <p className={styles.card_subtitle}>Your enterprise credentials have been verified and synced.</p>
      </div>
      <div className="bg-[#F9F9F9] p-4 rounded-xl flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-emerald-100 text-emerald-700 rounded-lg flex items-center justify-center"><TrendingUp size={20} /></div>
          <div className="text-left"><p className="text-[10px] text-gray-500 uppercase font-bold">Access Tier</p><p className="text-sm font-semibold">Forensic Level 1</p></div>
        </div>
        <CheckCircle2 size={18} className="text-emerald-500" />
      </div>
      <div className={styles.redirect_bar}>
        <div className={styles.redirect_progress} style={{ width: `${progress}%` }} />
      </div>
    </motion.div>
  );
}

export default function Page() {
  return (
    <Suspense fallback={<div className="h-screen flex items-center justify-center bg-[#F7F6F3]"><Loader2 className="animate-spin text-gray-400" /></div>}>
      <ActivateContent />
    </Suspense>
  );
}

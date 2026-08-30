import React, { useState, useCallback } from 'react';
import { useApp } from '../../context/AppContext';
import { formatAuthError } from '../../lib/firebase';
import {
  X,
  Eye,
  EyeOff,
  Zap,
  Radio,
  User,
  Lock,
  Mail,
  ArrowRight,
  Loader2,
  AlertCircle,
  ShieldCheck,
} from 'lucide-react';

type AuthTab = 'signin' | 'signup';

export function AuthModal() {
  const {
    authModalOpen,
    closeAuthModal,
    loginWithEmail,
    registerWithEmail,
    loginWithGoogle,
    demoLogin,
  } = useApp();

  const [activeTab, setActiveTab] = useState<AuthTab>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [callsign, setCallsign] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const resetForm = useCallback(() => {
    setEmail('');
    setPassword('');
    setCallsign('');
    setErrorMessage(null);
    setLoading(false);
    setGoogleLoading(false);
  }, []);

  const handleClose = useCallback(() => {
    resetForm();
    closeAuthModal();
  }, [resetForm, closeAuthModal]);

  const handleDemo = useCallback(() => {
    setLoading(true);
    setErrorMessage(null);
    setTimeout(() => {
      setLoading(false);
      demoLogin();
    }, 400);
  }, [demoLogin]);

  const handleGoogleSignIn = useCallback(async () => {
    setGoogleLoading(true);
    setErrorMessage(null);
    try {
      await loginWithGoogle();
    } catch (err: unknown) {
      setErrorMessage(formatAuthError(err));
    } finally {
      setGoogleLoading(false);
    }
  }, [loginWithGoogle]);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setErrorMessage(null);

      if (!email.trim() || !password) {
        setErrorMessage('Please provide both email and FIA credential passkey.');
        return;
      }

      setLoading(true);
      try {
        if (activeTab === 'signin') {
          await loginWithEmail(email, password);
        } else {
          if (password.length < 6) {
            setErrorMessage('Passkey must be at least 6 characters.');
            setLoading(false);
            return;
          }
          await registerWithEmail(email, password, callsign);
        }
      } catch (err: unknown) {
        setErrorMessage(formatAuthError(err));
      } finally {
        setLoading(false);
      }
    },
    [email, password, callsign, activeTab, loginWithEmail, registerWithEmail]
  );

  if (!authModalOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-carbon-base/80 backdrop-blur-md transition-opacity"
        onClick={handleClose}
      />

      {/* Modal Card */}
      <div className="relative w-full max-w-md glass-panel rounded-2xl overflow-hidden shadow-2xl border border-carbon-border animate-in">
        {/* Top telemetry gradient accent line */}
        <div className="h-[3px] bg-gradient-to-r from-kinetic-cyan via-overtake-amber to-harvest-emerald" />

        {/* Close button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/60 transition-all z-10"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header */}
        <div className="px-8 pt-7 pb-4">
          <div className="flex items-center gap-2 mb-1.5">
            <Radio className="w-4 h-4 text-kinetic-cyan animate-pulse" />
            <span className="font-mono text-xs tracking-widest text-kinetic-cyan uppercase font-bold">
              Firebase Security Gate
            </span>
          </div>
          <h2 className="font-mono text-xl font-bold text-white tracking-wide">
            {activeTab === 'signin' ? 'Telemetry Access' : 'New Engineer Registration'}
          </h2>
          <p className="font-mono text-xs text-slate-400 mt-1">
            {activeTab === 'signin'
              ? 'Authenticate to unlock live telemetry and tyre degradation analytics.'
              : 'Provision pit-wall access credentials linked to your team.'}
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="px-8 mb-4">
          <div className="flex bg-carbon-base/90 rounded-lg p-1 border border-carbon-border">
            <button
              type="button"
              onClick={() => {
                setActiveTab('signin');
                setErrorMessage(null);
              }}
              className={`flex-1 py-2 font-mono text-xs font-bold tracking-wider rounded-md transition-all ${
                activeTab === 'signin'
                  ? 'bg-kinetic-cyan/15 text-kinetic-cyan border border-kinetic-cyan/40 shadow-sm shadow-kinetic-cyan/10'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              SIGN IN
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveTab('signup');
                setErrorMessage(null);
              }}
              className={`flex-1 py-2 font-mono text-xs font-bold tracking-wider rounded-md transition-all ${
                activeTab === 'signup'
                  ? 'bg-overtake-amber/15 text-overtake-amber border border-overtake-amber/40 shadow-sm shadow-overtake-amber/10'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              REGISTER
            </button>
          </div>
        </div>

        {/* Error Notification Banner */}
        {errorMessage && (
          <div className="mx-8 mb-4 p-3 rounded-lg bg-red-950/40 border border-red-500/40 flex items-start gap-2.5 text-xs text-red-300 font-mono">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-8 pb-5 space-y-3.5">
          {/* Optional Call-sign on registration */}
          {activeTab === 'signup' && (
            <div>
              <label className="block font-mono text-[10px] tracking-widest text-slate-400 uppercase mb-1.5">
                Engineer Call-Sign / Driver (Optional)
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  value={callsign}
                  onChange={(e) => setCallsign(e.target.value)}
                  placeholder="e.g. NORRIS @ MCLAREN"
                  className="w-full pl-10 pr-4 py-2.5 glass-input rounded-lg font-mono text-xs text-white placeholder-slate-600 focus:outline-none focus:border-overtake-amber/60 focus:ring-1 focus:ring-overtake-amber/30 transition-all"
                />
              </div>
            </div>
          )}

          {/* Email */}
          <div>
            <label className="block font-mono text-[10px] tracking-widest text-slate-400 uppercase mb-1.5">
              Engineer Official Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="engineer@pitwall.f1"
                className="w-full pl-10 pr-4 py-2.5 glass-input rounded-lg font-mono text-xs text-white placeholder-slate-600 focus:outline-none focus:border-kinetic-cyan/60 focus:ring-1 focus:ring-kinetic-cyan/30 transition-all"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block font-mono text-[10px] tracking-widest text-slate-400 uppercase mb-1.5">
              FIA Security Passkey (Min. 6 chars)
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full pl-10 pr-10 py-2.5 glass-input rounded-lg font-mono text-xs text-white placeholder-slate-600 focus:outline-none focus:border-kinetic-cyan/60 focus:ring-1 focus:ring-kinetic-cyan/30 transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Submit Email Button */}
          <button
            type="submit"
            disabled={loading || googleLoading || !email.trim() || !password}
            className={`w-full py-3 font-mono text-xs font-bold tracking-wider rounded-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed ${
              activeTab === 'signin'
                ? 'bg-kinetic-cyan text-carbon-base hover:bg-white hover:shadow-lg hover:shadow-kinetic-cyan/25'
                : 'bg-overtake-amber text-carbon-base hover:bg-amber-300 hover:shadow-lg hover:shadow-overtake-amber/25'
            }`}
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                {activeTab === 'signin' ? 'AUTHENTICATE ACCESS' : 'CREATE PIT-WALL ACCOUNT'}
                <ArrowRight className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </form>

        {/* Divider */}
        <div className="px-8 mb-4">
          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-carbon-border" />
            <span className="font-mono text-[10px] text-slate-500 tracking-wider">
              OR CONNECT WITH
            </span>
            <div className="flex-1 h-px bg-carbon-border" />
          </div>
        </div>

        {/* Google SSO & Demo Bypass */}
        <div className="px-8 pb-7 space-y-3">
          {/* Google Sign In */}
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={loading || googleLoading}
            className="w-full py-2.5 px-4 font-mono text-xs font-semibold text-slate-200 bg-carbon-card hover:bg-slate-800/80 border border-carbon-border hover:border-slate-600 rounded-lg transition-all flex items-center justify-center gap-3 disabled:opacity-50"
          >
            {googleLoading ? (
              <Loader2 className="w-4 h-4 animate-spin text-kinetic-cyan" />
            ) : (
              <>
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.36 24 12 24z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.16 0 9.94 0 12s.45 3.84 1.25 5.42l4.03-3.15z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.36 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                  />
                </svg>
                <span>Continue with Google</span>
              </>
            )}
          </button>

          {/* Demo Guest Evaluation */}
          <button
            type="button"
            onClick={handleDemo}
            disabled={loading || googleLoading}
            className="w-full py-2.5 px-4 font-mono text-xs font-semibold text-overtake-amber border border-overtake-amber/40 hover:bg-overtake-amber/10 hover:border-overtake-amber/70 rounded-lg transition-all flex items-center justify-center gap-2 group"
          >
            <Zap className="w-3.5 h-3.5 group-hover:animate-pulse" />
            <span>Launch Instant Guest Demo</span>
          </button>

          <div className="flex items-center justify-center gap-1.5 pt-1 text-slate-500 text-[10px] font-mono">
            <ShieldCheck className="w-3.5 h-3.5 text-harvest-emerald" />
            <span>Secured via Firebase Authentication</span>
          </div>
        </div>
      </div>
    </div>
  );
}

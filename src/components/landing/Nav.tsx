import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import useUserActivity from '../../hooks/useUserActivity';
import { useApp } from '../../context/AppContext';
import { formatAuthError } from '../../lib/firebase';
import {
  Radio,
  Lock,
  Mail,
  User,
  Eye,
  EyeOff,
  ArrowRight,
  Loader2,
  Play,
  Layers,
  Activity,
  Cpu,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
} from 'lucide-react';

type AuthTab = 'signin' | 'signup';

export default function Nav() {
  const { openAuthModal, loginWithEmail, registerWithEmail, loginWithGoogle, demoLogin } = useApp();
  const [open, setOpen] = useState<boolean>(false);
  const [mouseHover, setMouseHover] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<AuthTab>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [callsign, setCallsign] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const activeUser = useUserActivity();

  const handleDemo = useCallback(() => {
    setLoading(true);
    setOpen(false);
    setTimeout(() => {
      setLoading(false);
      demoLogin();
    }, 400);
  }, [demoLogin]);

  const handleGoogle = useCallback(async () => {
    setGoogleLoading(true);
    setErrorMessage(null);
    try {
      await loginWithGoogle();
      setOpen(false);
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
        setErrorMessage('Please enter email and security passkey.');
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
        setOpen(false);
      } catch (err: unknown) {
        setErrorMessage(formatAuthError(err));
      } finally {
        setLoading(false);
      }
    },
    [email, password, callsign, activeTab, loginWithEmail, registerWithEmail]
  );

  const handleNavClick = (link: string) => {
    setOpen(false);
    const element = document.querySelector(link);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div>
      {/* Floating Bottom Pill Dock */}
      <div
        onMouseEnter={() => setMouseHover(true)}
        onMouseLeave={() => setMouseHover(false)}
        onClick={() => setOpen(!open)}
        className={`fixed bottom-4 left-1/2 -translate-x-1/2 z-[995] h-13 w-[92%] max-w-sm sm:max-w-md md:max-w-xl rounded-2xl bg-black/90 backdrop-blur-xl border border-neutral-800 text-white px-4 flex items-center ${
          open ? 'justify-end z-[1005]' : 'justify-between z-[995]'
        } cursor-pointer shadow-[0_10px_30px_rgba(0,0,0,0.6)] transition-all`}
      >
        <div className={`${open ? 'hidden' : 'flex'} items-center gap-3.5`}>
          {/* Animated Icons */}
          <div className="relative overflow-hidden flex items-center justify-center w-5 h-5">
            <motion.img
              src="/scisor.svg"
              alt="scisor"
              className="absolute w-4 h-4 invert"
              initial={{ y: -20, rotate: 0 }}
              animate={
                mouseHover
                  ? { y: 0, rotate: 360, transition: { duration: 0.3 } }
                  : { y: -20, rotate: 0 }
              }
            />
            <motion.img
              src="/grab.svg"
              alt="grab"
              className="absolute w-4 h-4 invert"
              initial={{ y: 0, rotate: 0 }}
              animate={
                mouseHover
                  ? { y: 20, rotate: 360, transition: { duration: 0.3 } }
                  : { y: 0, rotate: 0 }
              }
            />
          </div>

          <div className="flex flex-col">
            <span className="font-mono text-xs font-bold text-cyan-400 tracking-wider">
              APEXSHIFT PIT-WALL
            </span>
            <span className="text-[10px] text-neutral-400 font-mono tracking-tight">
              {activeUser} ENGINEERS ACTIVE
            </span>
          </div>
        </div>

        {/* Action button in pill */}
        <div className="flex items-center gap-2">
          {!open && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                openAuthModal();
              }}
              className="px-3 py-1.5 bg-cyan-400 hover:bg-cyan-300 text-black rounded-xl font-mono text-xs font-bold tracking-wider uppercase transition-all shadow-md"
            >
              SIGN IN
            </button>
          )}

          {/* Hamburger / Plus Toggle */}
          <div className="relative w-5 h-5 flex items-center justify-center">
            <div className="h-0.5 w-full bg-white rounded transform -translate-y-1/2" />
            <div
              className={`absolute top-1/2 left-1/2 h-0.5 w-full bg-white rounded transform -translate-x-1/2 -translate-y-1/2 transition-transform duration-300 ${
                open ? 'rotate-0' : 'rotate-90'
              }`}
            />
          </div>
        </div>
      </div>

      {/* Expandable Navigation & Full Authentication Drawer */}
      <AnimatePresence>
        {open && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
              className="fixed inset-0 z-[980] bg-black/60 backdrop-blur-sm"
            />

            <motion.div
              initial={{ y: '100%', opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: '100%', opacity: 0 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="fixed bottom-0 left-1/2 -translate-x-1/2 z-[1000] w-full max-w-2xl rounded-t-3xl bg-neutral-950/98 backdrop-blur-2xl border-t border-x border-neutral-800 text-white flex flex-col p-6 sm:p-8 max-h-[88vh] overflow-y-auto shadow-[0_-20px_50px_rgba(0,0,0,0.8)]"
            >
              {/* Top Handle / Accent */}
              <div className="w-12 h-1 bg-neutral-800 rounded-full mx-auto mb-4" />

              {/* Drawer Header */}
              <div className="flex items-center justify-between pb-4 border-b border-neutral-800/80">
                <div>
                  <div className="flex items-center gap-2">
                    <Radio className="w-4 h-4 text-cyan-400 animate-pulse" />
                    <span className="font-mono text-xs tracking-widest text-cyan-400 uppercase font-semibold">
                      Firebase Authentication Portal
                    </span>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-bold text-white mt-0.5">
                    Live Pit Wall & Telemetry
                  </h2>
                </div>

                {/* Instant 1-Click Demo Launcher */}
                <button
                  onClick={handleDemo}
                  disabled={loading || googleLoading}
                  className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-400 to-cyan-500 hover:from-cyan-300 hover:to-cyan-400 text-black rounded-xl font-mono text-xs font-bold tracking-wider uppercase transition-all shadow-[0_0_20px_rgba(6,182,212,0.4)] hover:scale-105"
                >
                  <Play className="w-3.5 h-3.5 fill-black" />
                  <span>INSTANT DEMO</span>
                </button>
              </div>

              {/* Section Jump Links */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 my-4">
                {[
                  { title: 'Overview', link: '#hero', icon: Activity },
                  { title: 'Mission', link: '#about', icon: Cpu },
                  { title: 'Metrics', link: '#achievements', icon: Layers },
                  { title: 'Pillars', link: '#pillars', icon: CheckCircle2 },
                ].map((sec, i) => {
                  const Icon = sec.icon;
                  return (
                    <button
                      key={i}
                      type="button"
                      onClick={() => handleNavClick(sec.link)}
                      className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-neutral-900/60 hover:bg-neutral-800 border border-neutral-800/80 text-xs font-mono text-neutral-300 hover:text-cyan-400 transition-all"
                    >
                      <Icon className="w-3 h-3" />
                      <span>{sec.title}</span>
                    </button>
                  );
                })}
              </div>

              {/* Error Banner */}
              {errorMessage && (
                <div className="mb-4 p-3 rounded-lg bg-red-950/50 border border-red-500/40 flex items-start gap-2 text-xs text-red-300 font-mono">
                  <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Tab Switcher (SIGN IN / REGISTER) */}
              <div className="flex bg-neutral-900 rounded-xl p-1 mb-4 border border-neutral-800">
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('signin');
                    setErrorMessage(null);
                  }}
                  className={`flex-1 py-2 font-mono text-xs font-bold tracking-wider rounded-lg transition-all ${
                    activeTab === 'signin'
                      ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 shadow-sm'
                      : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  ENGINEER SIGN IN
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('signup');
                    setErrorMessage(null);
                  }}
                  className={`flex-1 py-2 font-mono text-xs font-bold tracking-wider rounded-lg transition-all ${
                    activeTab === 'signup'
                      ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40 shadow-sm'
                      : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  NEW REGISTRATION
                </button>
              </div>

              {/* Main Auth Form */}
              <form onSubmit={handleSubmit} className="space-y-3">
                {activeTab === 'signup' && (
                  <div>
                    <label className="block font-mono text-[10px] tracking-widest text-neutral-400 uppercase mb-1">
                      Engineer Call-Sign / Driver (Optional)
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
                      <input
                        type="text"
                        value={callsign}
                        onChange={(e) => setCallsign(e.target.value)}
                        placeholder="e.g. NORRIS @ MCLAREN"
                        className="w-full pl-10 pr-4 py-2.5 bg-neutral-900/90 border border-neutral-800 rounded-xl font-mono text-xs text-white placeholder-neutral-600 focus:outline-none focus:border-amber-400/60 transition-all"
                      />
                    </div>
                  </div>
                )}

                {/* Email Input */}
                <div>
                  <label className="block font-mono text-[10px] tracking-widest text-neutral-400 uppercase mb-1">
                    Official Email
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="engineer@pitwall.f1"
                      className="w-full pl-10 pr-4 py-2.5 bg-neutral-900/90 border border-neutral-800 rounded-xl font-mono text-xs text-white placeholder-neutral-600 focus:outline-none focus:border-cyan-400/60 focus:ring-1 focus:ring-cyan-400/40 transition-all"
                    />
                  </div>
                </div>

                {/* Password Input */}
                <div>
                  <label className="block font-mono text-[10px] tracking-widest text-neutral-400 uppercase mb-1">
                    FIA Security Passkey (Min. 6 chars)
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className="w-full pl-10 pr-10 py-2.5 bg-neutral-900/90 border border-neutral-800 rounded-xl font-mono text-xs text-white placeholder-neutral-600 focus:outline-none focus:border-cyan-400/60 focus:ring-1 focus:ring-cyan-400/40 transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-300 transition-colors"
                    >
                      {showPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading || googleLoading || !email.trim() || !password}
                  className={`w-full py-3 mt-2 font-mono text-xs font-bold tracking-wider rounded-xl transition-all flex items-center justify-center gap-2 uppercase shadow-md cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed ${
                    activeTab === 'signin'
                      ? 'text-black bg-cyan-400 hover:bg-cyan-300 shadow-cyan-400/20'
                      : 'text-black bg-amber-400 hover:bg-amber-300 shadow-amber-400/20'
                  }`}
                >
                  {loading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      {activeTab === 'signin'
                        ? 'AUTHENTICATE & ENTER PIT WALL'
                        : 'REGISTER ENGINEER CREDENTIAL'}
                      <ArrowRight className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              </form>

              {/* Google Sign-in Alternative */}
              <div className="mt-3.5 pt-3 border-t border-neutral-800/80 space-y-2">
                <button
                  type="button"
                  onClick={handleGoogle}
                  disabled={loading || googleLoading}
                  className="w-full py-2 px-3 bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 rounded-xl text-xs font-mono text-neutral-200 flex items-center justify-center gap-2.5 transition-all"
                >
                  {googleLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin text-cyan-400" />
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
                      <span>Sign in with Google</span>
                    </>
                  )}
                </button>
              </div>

              {/* Bottom Footer Info */}
              <div className="mt-4 pt-3 border-t border-neutral-800/80 flex items-center justify-between text-[10px] font-mono text-neutral-500">
                <div className="flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-emerald-400" />
                  <span>FIREBASE AUTH READY</span>
                </div>
                <span className="text-cyan-400 font-semibold">60Hz SAMPLING RATE</span>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

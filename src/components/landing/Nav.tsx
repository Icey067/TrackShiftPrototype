import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import useUserActivity from '../../hooks/useUserActivity';
import { useApp } from '../../context/AppContext';
import {
  Radio,
  User,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  Loader2,
  Zap,
  Play,
  Layers,
  Activity,
  Cpu,
  CheckCircle2,
} from 'lucide-react';

type AuthTab = 'signin' | 'signup';

export default function Nav() {
  const { login, demoLogin } = useApp();
  const [open, setOpen] = useState<boolean>(false);
  const [mouseHover, setMouseHover] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<AuthTab>('signin');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const activeUser = useUserActivity();

  const handleDemo = useCallback(() => {
    setLoading(true);
    setOpen(false);
    setTimeout(() => {
      setLoading(false);
      demoLogin();
    }, 400);
  }, [demoLogin]);

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (!username.trim()) return;
      setLoading(true);
      setOpen(false);
      setTimeout(() => {
        setLoading(false);
        login(username.trim());
      }, 400);
    },
    [username, login]
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
              alt=""
              animate={!activeUser && !mouseHover ? { y: '100%' } : { y: 0 }}
              transition={{ duration: 0.4, ease: 'easeInOut' }}
              className="absolute bottom-full left-0 invert"
            />
            <motion.img
              src="/arrow-up.svg"
              alt=""
              animate={mouseHover && activeUser ? { y: '100%' } : { y: 0 }}
              transition={{ duration: 0.4, ease: 'easeInOut' }}
              className="absolute bottom-full left-0 scale-125 invert"
            />
            <motion.img
              src="/logo.svg"
              alt=""
              animate={!mouseHover && activeUser ? { y: 0 } : { y: '130%' }}
              transition={{ duration: 0.4, ease: 'easeInOut' }}
              className="size-4.5 invert"
            />
          </div>

          {/* Animated Text Section */}
          <div className="relative w-[180px] sm:w-[260px] md:w-[320px] overflow-hidden h-6 font-mono text-xs sm:text-sm font-semibold tracking-wide">
            <motion.div
              animate={!mouseHover && activeUser ? { y: 0 } : { y: '-100%' }}
              transition={{ duration: 0.4, ease: 'easeInOut' }}
              className="text-slate-200 flex items-center gap-2"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
              <span>TrackShift // Telemetry</span>
            </motion.div>

            <motion.div
              animate={mouseHover && activeUser ? { y: 0 } : { y: '100%' }}
              transition={{ duration: 0.4, ease: 'easeInOut' }}
              className="absolute top-0 left-0 text-cyan-400"
            >
              Open Pit Wall Menu & Auth →
            </motion.div>

            <motion.div
              animate={!activeUser ? { y: 0 } : { y: '100%' }}
              transition={{ duration: 0.4, ease: 'easeInOut' }}
              className="absolute top-0 left-0 text-amber-400"
            >
              Telemetry Stream Standby
            </motion.div>
          </div>
        </div>

        {/* Right Toggle Section */}
        <div className="flex items-center gap-3">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setOpen(!open);
            }}
            className={`${
              open ? 'hidden' : 'block'
            } bg-neutral-200 hover:bg-white text-black px-3 py-1 rounded-xl text-xs font-mono font-bold tracking-wider uppercase transition-all`}
          >
            {open ? 'CLOSE' : 'MENU'}
          </button>
          <div className="relative w-6 h-6 cursor-pointer">
            <div
              className={`absolute top-1/2 left-0 h-0.5 w-full bg-white rounded transition-transform duration-300 ${
                open ? '-rotate-90 scale-x-0' : 'rotate-0 scale-x-100'
              }`}
            />
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
              className="fixed bottom-0 left-1/2 -translate-x-1/2 z-[1000] w-full max-w-2xl rounded-t-3xl bg-neutral-950/98 backdrop-blur-2xl border-t border-x border-neutral-800 text-white flex flex-col p-6 sm:p-8 max-h-[85vh] overflow-y-auto shadow-[0_-20px_50px_rgba(0,0,0,0.8)]"
            >
              {/* Top Handle / Accent */}
              <div className="w-12 h-1 bg-neutral-800 rounded-full mx-auto mb-4" />

              {/* Drawer Header */}
              <div className="flex items-center justify-between pb-4 border-b border-neutral-800/80">
                <div>
                  <div className="flex items-center gap-2">
                    <Radio className="w-4 h-4 text-cyan-400" />
                    <span className="font-mono text-xs tracking-widest text-cyan-400 uppercase font-semibold">
                      TrackShift Access Portal
                    </span>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-bold text-white mt-0.5">
                    Live Pit Wall & Telemetry
                  </h2>
                </div>

                {/* Instant 1-Click Demo Launcher */}
                <button
                  onClick={handleDemo}
                  disabled={loading}
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
                      onClick={() => handleNavClick(sec.link)}
                      className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-neutral-900/60 hover:bg-neutral-800 border border-neutral-800/80 text-xs font-mono text-neutral-300 hover:text-cyan-400 transition-all"
                    >
                      <Icon className="w-3 h-3" />
                      <span>{sec.title}</span>
                    </button>
                  );
                })}
              </div>

              {/* Tab Switcher (SIGN IN / REGISTER) */}
              <div className="flex bg-neutral-900 rounded-xl p-1 mb-4 border border-neutral-800">
                <button
                  onClick={() => setActiveTab('signin')}
                  className={`flex-1 py-2 font-mono text-xs font-bold tracking-wider rounded-lg transition-all ${
                    activeTab === 'signin'
                      ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 shadow-sm'
                      : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  ENGINEER SIGN IN
                </button>
                <button
                  onClick={() => setActiveTab('signup')}
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
              <form onSubmit={handleSubmit} className="space-y-3.5">
                {/* Username Input */}
                <div>
                  <label className="block font-mono text-[10px] tracking-widest text-neutral-400 uppercase mb-1">
                    Team / Engineer Call-Sign
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="e.g. VERSTAPPEN @ RED BULL"
                      className="w-full pl-10 pr-4 py-2.5 bg-neutral-900/90 border border-neutral-800 rounded-xl font-mono text-sm text-white placeholder-neutral-600 focus:outline-none focus:border-cyan-400/60 focus:ring-1 focus:ring-cyan-400/40 transition-all"
                    />
                  </div>
                </div>

                {/* Password Input */}
                <div>
                  <label className="block font-mono text-[10px] tracking-widest text-neutral-400 uppercase mb-1">
                    FIA Credential Passkey
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter security passkey"
                      className="w-full pl-10 pr-10 py-2.5 bg-neutral-900/90 border border-neutral-800 rounded-xl font-mono text-sm text-white placeholder-neutral-600 focus:outline-none focus:border-cyan-400/60 focus:ring-1 focus:ring-cyan-400/40 transition-all"
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
                  disabled={loading || !username.trim()}
                  className="w-full py-3 mt-2 font-mono text-xs font-bold tracking-wider text-black bg-cyan-400 hover:bg-cyan-300 rounded-xl transition-all hover:shadow-lg hover:shadow-cyan-400/25 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 uppercase shadow-md"
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

              {/* Bottom Footer Info */}
              <div className="mt-4 pt-3 border-t border-neutral-800/80 flex items-center justify-between text-[10px] font-mono text-neutral-500">
                <span>FIA REGULATIONS 2026 COMPLIANT</span>
                <span className="text-cyan-400 font-semibold">60Hz SAMPLING RATE</span>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

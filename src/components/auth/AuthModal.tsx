import React, { useState, useCallback } from 'react';
import { useApp } from '../../context/AppContext';
import {
  X,
  Eye,
  EyeOff,
  Zap,
  Radio,
  User,
  Lock,
  ArrowRight,
  Loader2,
  CheckCircle2,
} from 'lucide-react';

type AuthTab = 'signin' | 'signup';

export function AuthModal() {
  const { authModalOpen, closeAuthModal, login, demoLogin } = useApp();
  const [activeTab, setActiveTab] = useState<AuthTab>('signin');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleDemo = useCallback(() => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      demoLogin();
    }, 600);
  }, [demoLogin]);

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (!username.trim()) return;
      setLoading(true);
      setTimeout(() => {
        setLoading(false);
        login(username.trim());
      }, 600);
    },
    [username, login]
  );

  if (!authModalOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-carbon-base/80 backdrop-blur-sm"
        onClick={closeAuthModal}
      />

      {/* Modal */}
      <div className="relative w-full max-w-md mx-4 glass-panel rounded-2xl overflow-hidden animate-in">
        {/* Top accent line */}
        <div className="h-[2px] bg-gradient-to-r from-kinetic-cyan via-overtake-amber to-harvest-emerald" />

        {/* Close button */}
        <button
          onClick={closeAuthModal}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-500 hover:text-white hover:bg-slate-800/50 transition-all z-10"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header */}
        <div className="px-8 pt-7 pb-4">
          <div className="flex items-center gap-2 mb-1">
            <Radio className="w-4 h-4 text-kinetic-cyan" />
            <span className="font-mono text-xs tracking-widest text-kinetic-cyan uppercase">
              Authentication
            </span>
          </div>
          <h2 className="font-mono text-xl font-bold text-white tracking-wide">
            {activeTab === 'signin' ? 'Telemetry Access' : 'New Engineer Registration'}
          </h2>
        </div>

        {/* Tab Switcher */}
        <div className="px-8 mb-5">
          <div className="flex bg-carbon-base rounded-lg p-1">
            <button
              onClick={() => setActiveTab('signin')}
              className={`flex-1 py-2 font-mono text-xs font-bold tracking-wider rounded-md transition-all ${
                activeTab === 'signin'
                  ? 'bg-kinetic-cyan/10 text-kinetic-cyan border border-kinetic-cyan/30'
                  : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              SIGN IN
            </button>
            <button
              onClick={() => setActiveTab('signup')}
              className={`flex-1 py-2 font-mono text-xs font-bold tracking-wider rounded-md transition-all ${
                activeTab === 'signup'
                  ? 'bg-overtake-amber/10 text-overtake-amber border border-overtake-amber/30'
                  : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              SIGN UP
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-8 pb-6 space-y-4">
          {/* Username */}
          <div>
            <label className="block font-mono text-[10px] tracking-widest text-slate-500 uppercase mb-1.5">
              Team / Engineer Call-Sign
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600" />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="e.g. VERSTAPPEN @ RED BULL"
                className="w-full pl-10 pr-4 py-2.5 glass-input rounded-lg font-mono text-sm text-white placeholder-slate-600 focus:outline-none focus:border-kinetic-cyan/50 focus:shadow-lg focus:shadow-kinetic-cyan/10 transition-all"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block font-mono text-[10px] tracking-widest text-slate-500 uppercase mb-1.5">
              FIA Credential Passkey
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter passkey"
                className="w-full pl-10 pr-10 py-2.5 glass-input rounded-lg font-mono text-sm text-white placeholder-slate-600 focus:outline-none focus:border-kinetic-cyan/50 focus:shadow-lg focus:shadow-kinetic-cyan/10 transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-600 hover:text-slate-400 transition-colors"
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading || !username.trim()}
            className="w-full py-3 font-mono text-xs font-bold tracking-wider text-carbon-base bg-kinetic-cyan rounded-lg transition-all hover:shadow-lg hover:shadow-kinetic-cyan/25 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                {activeTab === 'signin' ? 'AUTHENTICATE' : 'REGISTER ENGINEER'}
                <ArrowRight className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </form>

        {/* Divider */}
        <div className="px-8 mb-5">
          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-slate-800" />
            <span className="font-mono text-[10px] text-slate-600 tracking-wider">
              OR
            </span>
            <div className="flex-1 h-px bg-slate-800" />
          </div>
        </div>

        {/* Demo bypass */}
        <div className="px-8 pb-8">
          <button
            onClick={handleDemo}
            disabled={loading}
            className="w-full py-3.5 font-mono text-xs font-bold tracking-wider text-overtake-amber border border-overtake-amber/40 rounded-lg hover:bg-overtake-amber/10 hover:border-overtake-amber/60 transition-all flex items-center justify-center gap-2 group"
          >
            <Zap className="w-4 h-4 group-hover:animate-pulse" />
            LAUNCH INSTANT DEMO ACCESS
          </button>
          <p className="mt-3 text-center font-mono text-[10px] text-slate-600">
            Bypass authentication — full telemetry access for judges & evaluators
          </p>
        </div>
      </div>
    </div>
  );
}

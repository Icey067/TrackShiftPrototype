import React, { useState, useEffect } from 'react';
import { X, Copy, Check, FileCode, Terminal, Sparkles, Cpu } from 'lucide-react';

interface PythonCodeViewerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PythonCodeViewer: React.FC<PythonCodeViewerProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'main' | 'state'>('main');
  const [copied, setCopied] = useState(false);
  const [files, setFiles] = useState<{ 'main.py': string; 'state_manager.py': string }>({
    'main.py': '',
    'state_manager.py': '',
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen) {
      fetch('/api/python-source')
        .then((res) => res.json())
        .then((data) => {
          setFiles(data);
          setLoading(false);
        })
        .catch(() => {
          setLoading(false);
        });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const currentCode = activeTab === 'main' ? files['main.py'] : files['state_manager.py'];

  const handleCopy = () => {
    if (!currentCode) return;
    navigator.clipboard.writeText(currentCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <div className="glass-card w-full max-w-5xl h-[85vh] rounded-lg border border-slate-700 flex flex-col shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/60">
          <div>
            <h2 className="text-base font-bold text-white font-mono uppercase tracking-wider">
              Python 3.11+ FastAPI &amp; NumPy Telemetry Service
            </h2>
            <p className="text-xs text-slate-400 font-mono">
              Production source code for the F1 Noise Cancellation Engine
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-mono text-slate-300 transition active:scale-95"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy Code'}</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-400 hover:text-slate-200 transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center justify-between px-6 py-2.5 border-b border-slate-800 bg-slate-950/50">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('main')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded text-xs font-mono font-semibold transition ${
                activeTab === 'main'
                  ? 'bg-slate-800 text-cyan-400 border border-slate-700 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <FileCode className="w-3.5 h-3.5 text-cyan-400" />
              <span>backend/main.py</span>
            </button>
            <button
              onClick={() => setActiveTab('state')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded text-xs font-mono font-semibold transition ${
                activeTab === 'state'
                  ? 'bg-slate-800 text-cyan-400 border border-slate-700 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <FileCode className="w-3.5 h-3.5 text-cyan-400" />
              <span>backend/state_manager.py</span>
            </button>
          </div>

          <div className="hidden sm:flex items-center gap-3 text-[11px] font-mono text-slate-400">
            <span className="flex items-center gap-1 text-emerald-400">
              <Terminal className="w-3.5 h-3.5" />
              <span>FastAPI WebSockets</span>
            </span>
            <span>•</span>
            <span className="text-cyan-400">NumPy Vectorized</span>
            <span>•</span>
            <span className="text-amber-400">Redis State Hash</span>
          </div>
        </div>

        {/* Code Content Area */}
        <div className="flex-1 overflow-auto p-6 bg-slate-950 font-mono text-xs text-slate-300 leading-relaxed select-text">
          {loading ? (
            <div className="flex items-center justify-center h-full text-slate-500">
              <Sparkles className="w-6 h-6 text-cyan-400 animate-spin mr-2" />
              <span>Loading backend source code...</span>
            </div>
          ) : (
            <pre className="whitespace-pre overflow-x-auto text-slate-300">
              <code>{currentCode || '# Code loaded from /backend/'}</code>
            </pre>
          )}
        </div>
      </div>
    </div>
  );
};

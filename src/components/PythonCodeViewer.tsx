import React, { useState, useEffect } from 'react';
import { X, Copy, Check, FileCode, Terminal, Sparkles, Cpu } from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';

interface PythonCodeViewerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PythonCodeViewer: React.FC<PythonCodeViewerProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'physics' | 'fetcher' | 'parser' | 'main'>('physics');
  const [copied, setCopied] = useState(false);
  const [files, setFiles] = useState<Record<string, string>>({
    'physics_engine.py': '',
    'f1_fetcher.py': '',
    'file_parser.py': '',
    'main.py': '',
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

  const getActiveCode = () => {
    switch (activeTab) {
      case 'physics':
        return files['physics_engine.py'] || '# Vectorized NumPy Physics Engine';
      case 'fetcher':
        return files['f1_fetcher.py'] || '# FastF1 & OpenF1 Session Ingestion Fetcher';
      case 'parser':
        return files['file_parser.py'] || '# Universal CSV / JSON File Parser';
      case 'main':
        return files['main.py'] || '# FastAPI Server';
      default:
        return '';
    }
  };

  const currentCode = getActiveCode();

  const handleCopy = () => {
    if (!currentCode) return;
    navigator.clipboard.writeText(currentCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="w-full max-w-5xl h-[85vh] rounded-xl border border-zinc-800 bg-zinc-950 flex flex-col shadow-2xl overflow-hidden font-sans text-zinc-100">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800 bg-zinc-900/60">
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <Badge variant="outline" className="text-[10px] text-sky-400">
                NUMPY &amp; FASTF1 ENGINE
              </Badge>
              <span className="text-xs text-zinc-500 font-mono">Python 3.14+ Production Engine</span>
            </div>
            <h2 className="text-base font-semibold text-zinc-100 font-mono tracking-tight">
              TrackShift Mathematics &amp; Ingestion Architecture
            </h2>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleCopy}
              className="h-7 text-xs font-mono gap-1.5 border-zinc-800 text-zinc-300"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy Code'}</span>
            </Button>

            <button
              onClick={onClose}
              className="p-1 rounded-md text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center justify-between px-6 py-2 border-b border-zinc-800 bg-zinc-950">
          <div className="flex items-center gap-1.5">
            {[
              { id: 'physics', label: 'physics_engine.py', tag: 'NumPy Math' },
              { id: 'fetcher', label: 'f1_fetcher.py', tag: 'FastF1 & OpenF1' },
              { id: 'parser', label: 'file_parser.py', tag: 'CSV Parser' },
              { id: 'main', label: 'main.py', tag: 'FastAPI WS' },
            ].map((t) => (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id as any)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono transition cursor-pointer ${
                  activeTab === t.id
                    ? 'bg-zinc-800 text-zinc-100 font-semibold border border-zinc-700 shadow-xs'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <FileCode className="w-3.5 h-3.5 text-sky-400" />
                <span>{t.label}</span>
              </button>
            ))}
          </div>

          <div className="hidden sm:flex items-center gap-3 text-[11px] font-mono text-zinc-500">
            <span className="flex items-center gap-1 text-emerald-400">
              <Terminal className="w-3.5 h-3.5" />
              <span>Vectorized NumPy</span>
            </span>
            <span>•</span>
            <span className="text-sky-400">Disk Cached</span>
          </div>
        </div>

        {/* Code Content Area */}
        <div className="flex-1 overflow-auto p-6 bg-zinc-950 font-mono text-xs text-zinc-300 leading-relaxed select-text">
          {loading ? (
            <div className="flex items-center justify-center h-full text-zinc-500">
              <Sparkles className="w-6 h-6 text-sky-400 animate-spin mr-2" />
              <span>Loading engine source code...</span>
            </div>
          ) : (
            <pre className="whitespace-pre overflow-x-auto text-zinc-300">
              <code>{currentCode}</code>
            </pre>
          )}
        </div>
      </div>
    </div>
  );
};

import React, { useState, useRef, useEffect } from 'react';
import { Download, FileSpreadsheet, FileCode, Check, ChevronDown } from 'lucide-react';
import { Button } from '../ui/button';

interface ExportLogsButtonProps {
  label?: string;
  onExport: (format: 'csv' | 'json') => void;
  variant?: 'outline' | 'default' | 'ghost' | 'secondary';
  size?: 'sm' | 'default' | 'icon';
  className?: string;
  countLabel?: string;
  disabled?: boolean;
}

export const ExportLogsButton: React.FC<ExportLogsButtonProps> = ({
  label = 'Export Logs',
  onExport,
  variant = 'outline',
  size = 'sm',
  className = '',
  countLabel,
  disabled = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [downloadedFormat, setDownloadedFormat] = useState<'csv' | 'json' | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const handleExport = (format: 'csv' | 'json', e: React.MouseEvent) => {
    e.stopPropagation();
    onExport(format);
    setDownloadedFormat(format);
    setTimeout(() => {
      setDownloadedFormat(null);
      setIsOpen(false);
    }, 800);
  };

  return (
    <div className="relative inline-block" ref={menuRef}>
      <Button
        variant={variant}
        size={size}
        disabled={disabled}
        onClick={() => setIsOpen(!isOpen)}
        className={`h-7 text-xs font-mono gap-1.5 border-zinc-800 text-zinc-300 hover:text-zinc-100 hover:border-zinc-700 bg-zinc-900/60 ${className}`}
      >
        <Download className="w-3.5 h-3.5 text-emerald-400" />
        <span>{label}</span>
        {countLabel && (
          <span className="text-[10px] px-1 rounded bg-zinc-800 text-zinc-400 font-mono">
            {countLabel}
          </span>
        )}
        <ChevronDown className={`w-3 h-3 text-zinc-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </Button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-1.5 w-48 rounded-xl bg-zinc-900 border border-zinc-800 p-1.5 shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-150">
          <div className="px-2 py-1 text-[10px] font-mono font-semibold tracking-wider text-zinc-500 uppercase">
            Select Export Format
          </div>

          <button
            onClick={(e) => handleExport('csv', e)}
            className="w-full flex items-center justify-between px-2.5 py-1.5 text-xs font-mono text-zinc-200 hover:bg-zinc-800/80 rounded-lg transition-colors text-left"
          >
            <div className="flex items-center gap-2">
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
              <span>CSV Spreadsheet</span>
            </div>
            {downloadedFormat === 'csv' ? (
              <Check className="w-3.5 h-3.5 text-emerald-400 animate-in fade-in" />
            ) : (
              <span className="text-[10px] text-zinc-500 font-mono">.csv</span>
            )}
          </button>

          <button
            onClick={(e) => handleExport('json', e)}
            className="w-full flex items-center justify-between px-2.5 py-1.5 text-xs font-mono text-zinc-200 hover:bg-zinc-800/80 rounded-lg transition-colors text-left"
          >
            <div className="flex items-center gap-2">
              <FileCode className="w-3.5 h-3.5 text-cyan-400" />
              <span>JSON Telemetry</span>
            </div>
            {downloadedFormat === 'json' ? (
              <Check className="w-3.5 h-3.5 text-cyan-400 animate-in fade-in" />
            ) : (
              <span className="text-[10px] text-zinc-500 font-mono">.json</span>
            )}
          </button>
        </div>
      )}
    </div>
  );
};

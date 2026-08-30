import React, { useState, useRef } from 'react';
import { IngestedSessionData } from '../../types';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { X, UploadCloud, FileText, CheckCircle2, AlertCircle, RefreshCw, Play, Zap, FileSpreadsheet } from 'lucide-react';

interface FileUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectForReplay: (session: IngestedSessionData) => void;
  onSelectForBatchAnalysis: (session: IngestedSessionData) => void;
}

export const FileUploadModal: React.FC<FileUploadModalProps> = ({
  isOpen,
  onClose,
  onSelectForReplay,
  onSelectForBatchAnalysis,
}) => {
  const [dragActive, setDragActive] = useState<boolean>(false);
  const [parsedData, setParsedData] = useState<IngestedSessionData | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string>('');

  const inputRef = useRef<HTMLInputElement | null>(null);

  if (!isOpen) return null;

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleProcessFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleProcessFile(e.target.files[0]);
    }
  };

  const handleProcessFile = async (file: File) => {
    setLoading(true);
    setError(null);
    setParsedData(null);
    setFileName(file.name);

    try {
      const text = await file.text();
      const res = await fetch('/api/upload/parse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: text,
          filename: file.name,
        }),
      });

      if (!res.ok) {
        const errJson = await res.json();
        throw new Error(errJson.error || 'Failed to parse telemetry file.');
      }

      const data: IngestedSessionData = await res.json();
      setParsedData(data);
    } catch (err: any) {
      setError(err.message || 'Error processing uploaded file.');
    } finally {
      setLoading(false);
    }
  };

  const handleLoadSample = async (samplePath: string, name: string) => {
    setLoading(true);
    setError(null);
    setFileName(name);

    try {
      const resp = await fetch(samplePath);
      if (!resp.ok) throw new Error(`Failed to load sample ${name}`);
      const text = await resp.text();

      const parseResp = await fetch('/api/upload/parse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: text,
          filename: name,
        }),
      });

      if (!parseResp.ok) throw new Error('Failed to parse sample file');
      const data: IngestedSessionData = await parseResp.json();
      setParsedData(data);
    } catch (err: any) {
      setError(err.message || 'Error loading sample dataset.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="relative w-full max-w-xl bg-zinc-950 border border-zinc-800 rounded-xl shadow-2xl p-6 flex flex-col gap-5 text-zinc-100 font-sans">
        {/* Header */}
        <div className="flex items-start justify-between pb-3 border-b border-zinc-800">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Badge variant="outline" className="text-[10px] text-sky-400 border-sky-500/30">
                UNIVERSAL FILE PARSER
              </Badge>
              <span className="text-xs text-zinc-500 font-mono">CSV / JSON / Parquet</span>
            </div>
            <h2 className="text-lg font-semibold tracking-tight text-zinc-100">
              Custom Telemetry File Ingestion
            </h2>
            <p className="text-xs font-mono text-zinc-400 mt-0.5">
              Upload timing sheets, vehicle dyno logs, or race stint records
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-md text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900 transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {error && (
          <div className="p-3 rounded-lg bg-rose-950/40 border border-rose-800 text-rose-300 text-xs font-mono flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{error}</span>
          </div>
        )}

        {/* Drag and drop zone */}
        <input
          ref={inputRef}
          type="file"
          accept=".csv,.json,.txt,.parquet"
          onChange={handleFileChange}
          className="hidden"
        />

        <div
          onDragEnter={handleDrag}
          onDragOver={handleDrag}
          onDragLeave={handleDrag}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
          className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-2.5 ${
            dragActive
              ? 'border-sky-500 bg-sky-950/20'
              : 'border-zinc-800 bg-zinc-900/40 hover:border-zinc-700 hover:bg-zinc-900/60'
          }`}
        >
          <div className="p-3 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-300">
            {loading ? (
              <RefreshCw className="w-6 h-6 animate-spin text-sky-400" />
            ) : (
              <UploadCloud className="w-6 h-6 text-zinc-400" />
            )}
          </div>

          <div>
            <p className="text-xs font-mono font-semibold text-zinc-200">
              Drag &amp; drop your telemetry file here, or <span className="text-sky-400 underline">browse</span>
            </p>
            <p className="text-[11px] font-mono text-zinc-500 mt-1">
              Supports CSV, JSON, Parquet (Auto-detects lap, times, compound, sectors)
            </p>
          </div>
        </div>

        {/* 1-Click Sample Test Datasets */}
        <div className="flex flex-col gap-2 font-mono">
          <span className="text-[11px] text-zinc-400 uppercase font-semibold">
            Or test with 1-click curated F1 datasets:
          </span>
          <div className="grid grid-cols-2 gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleLoadSample('/samples/2024_silverstone_norris_medium.csv', '2024_silverstone_norris_medium.csv')}
              className="h-10 text-xs font-mono border-zinc-800 text-zinc-300 hover:text-zinc-100 flex items-center justify-start gap-2 px-3"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <div className="text-left truncate">
                <span className="block font-semibold truncate">Silverstone • Norris</span>
                <span className="text-[10px] text-zinc-500 block">27 Laps • Medium C3</span>
              </div>
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => handleLoadSample('/samples/2024_monza_leclerc_hard.csv', '2024_monza_leclerc_hard.csv')}
              className="h-10 text-xs font-mono border-zinc-800 text-zinc-300 hover:text-zinc-100 flex items-center justify-start gap-2 px-3"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-zinc-300 shrink-0" />
              <div className="text-left truncate">
                <span className="block font-semibold truncate">Monza • Leclerc (1-Stop)</span>
                <span className="text-[10px] text-zinc-500 block">30 Laps • Hard C2</span>
              </div>
            </Button>
          </div>
        </div>

        {/* Parsed File Summary */}
        {parsedData && (
          <div className="p-3.5 rounded-lg bg-zinc-900/80 border border-zinc-800 font-mono text-xs flex items-center justify-between animate-in fade-in">
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <div>
                <span className="text-zinc-200 font-semibold block">{parsedData.title}</span>
                <span className="text-[11px] text-zinc-400">
                  {parsedData.total_laps} Laps parsed • Compound: <strong className="text-amber-400">{parsedData.compound}</strong>
                </span>
              </div>
            </div>
            <Badge variant="success" className="text-[10px]">PARSED</Badge>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-end gap-2.5 pt-2 border-t border-zinc-800">
          <Button
            variant="outline"
            size="sm"
            onClick={onClose}
            className="w-full sm:w-auto text-xs font-mono border-zinc-800 text-zinc-400"
          >
            Cancel
          </Button>

          <Button
            variant="secondary"
            size="sm"
            disabled={!parsedData || loading}
            onClick={() => {
              if (parsedData) {
                onSelectForBatchAnalysis(parsedData);
                onClose();
              }
            }}
            className="w-full sm:w-auto text-xs font-mono gap-1.5 font-semibold text-zinc-200"
          >
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <span>Instant Batch Analytics</span>
          </Button>

          <Button
            variant="default"
            size="sm"
            disabled={!parsedData || loading}
            onClick={() => {
              if (parsedData) {
                onSelectForReplay(parsedData);
                onClose();
              }
            }}
            className="w-full sm:w-auto text-xs font-mono gap-1.5 font-semibold bg-zinc-100 text-zinc-950 hover:bg-white"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>Stream Live Replay</span>
          </Button>
        </div>
      </div>
    </div>
  );
};

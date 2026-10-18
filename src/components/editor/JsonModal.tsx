import { useState, useEffect } from 'react';
import { useStore } from '../../store/useStore';
import { X, Copy, Download, Upload, Check, AlertCircle } from 'lucide-react';

interface JsonModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function JsonModal({ isOpen, onClose }: JsonModalProps) {
  const { exportDefinitionJSON, importDefinitionJSON } = useStore();
  const [jsonText, setJsonText] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);
  const [importStatus, setImportStatus] = useState<{ success: boolean; message: string } | null>(null);

  useEffect(() => {
    if (isOpen) {
      setJsonText(exportDefinitionJSON());
      setImportStatus(null);
      setCopied(false);
    }
  }, [isOpen, exportDefinitionJSON]);

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(jsonText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([jsonText], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'automaton-definition.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = () => {
    const res = importDefinitionJSON(jsonText);
    if (res.success) {
      setImportStatus({ success: true, message: 'Automaton imported successfully!' });
      setTimeout(() => {
        onClose();
      }, 1000);
    } else {
      setImportStatus({ success: false, message: res.error || 'Failed to import configuration.' });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
      <div className="flex flex-col w-full max-w-xl max-h-[85vh] rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)] shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--border-color)] bg-[var(--bg-dark)]/50">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-bold text-[var(--accent)]">{'{ }'}</span>
            <h3 className="text-sm font-semibold text-[var(--text-primary)]">
              Automaton JSON Configuration
            </h3>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-dark)] transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 flex-1 flex flex-col gap-3 overflow-hidden">
          <p className="text-xs text-[var(--text-secondary)]">
            Export the current 5-tuple machine configuration, or paste a custom JSON definition to import:
          </p>

          <textarea
            value={jsonText}
            onChange={(e) => {
              setJsonText(e.target.value);
              setImportStatus(null);
            }}
            rows={12}
            className="w-full flex-1 rounded-xl border border-[var(--border-color)] bg-[var(--bg-dark)] p-3 font-mono text-xs text-[var(--text-primary)] focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)] resize-none"
          />

          {importStatus && (
            <div
              className={`flex items-center gap-2 p-2.5 rounded-lg text-xs ${
                importStatus.success
                  ? 'bg-[var(--success)]/10 text-[var(--success)] border border-[var(--success)]/30'
                  : 'bg-[var(--danger)]/10 text-[var(--danger)] border border-[var(--danger)]/30'
              }`}
            >
              {importStatus.success ? (
                <Check className="h-4 w-4 shrink-0" />
              ) : (
                <AlertCircle className="h-4 w-4 shrink-0" />
              )}
              <span>{importStatus.message}</span>
            </div>
          )}
        </div>

        {/* Footer actions */}
        <div className="flex items-center justify-between px-5 py-3.5 border-t border-[var(--border-color)] bg-[var(--bg-dark)]/50">
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 rounded-lg border border-[var(--border-color)] bg-[var(--bg-card)] px-3 py-1.5 text-xs font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-all"
            >
              {copied ? (
                <>
                  <Check className="h-3.5 w-3.5 text-[var(--success)]" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5" />
                  Copy
                </>
              )}
            </button>
            <button
              onClick={handleDownload}
              className="flex items-center gap-1.5 rounded-lg border border-[var(--border-color)] bg-[var(--bg-card)] px-3 py-1.5 text-xs font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-all"
            >
              <Download className="h-3.5 w-3.5" />
              Download .json
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="rounded-lg px-3 py-1.5 text-xs font-medium text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleImport}
              className="flex items-center gap-1.5 rounded-lg bg-[var(--primary)] px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-[var(--primary-dark)] transition-all"
            >
              <Upload className="h-3.5 w-3.5" />
              Import
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

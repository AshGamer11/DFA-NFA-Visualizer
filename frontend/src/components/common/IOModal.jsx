import React, { useState, useEffect } from 'react';
import { validateAutomaton } from '../../engine/AutomatonValidator';

export default function IOModal({
  isOpen,
  onClose,
  automaton,
  onImportAutomaton,
}) {
  const [jsonText, setJsonText] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [copyFeedback, setCopyFeedback] = useState(false);

  useEffect(() => {
    if (automaton && isOpen) {
      setJsonText(JSON.stringify(automaton, null, 2));
      setErrorMsg('');
      setCopyFeedback(false);
    }
  }, [automaton, isOpen]);

  if (!isOpen) return null;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(jsonText);
      setCopyFeedback(true);
      setTimeout(() => setCopyFeedback(false), 2000);
    } catch {
      setErrorMsg('Failed to copy to clipboard.');
    }
  };

  const handleDownload = () => {
    try {
      const blob = new Blob([jsonText], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${automaton.id || 'automaton'}.json`;
      link.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      setErrorMsg(`Download error: ${err.message}`);
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result;
        setJsonText(text);
        setErrorMsg('');
      } catch (err) {
        setErrorMsg(`File reading failed: ${err.message}`);
      }
    };
    reader.readAsText(file);
  };

  const handleApplyImport = () => {
    try {
      const parsed = JSON.parse(jsonText);
      const validation = validateAutomaton(parsed);
      if (!validation.isValid) {
        setErrorMsg(`Invalid automaton format:\n${validation.errors.join('\n')}`);
        return;
      }
      onImportAutomaton(parsed);
      onClose();
    } catch (err) {
      setErrorMsg(`JSON Parse Error: ${err.message}`);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-container" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Import / Export Automaton JSON</h3>
          <button
            type="button"
            className="btn-close-modal"
            onClick={onClose}
            aria-label="Close modal"
          >
            ✕
          </button>
        </div>

        <div className="modal-body">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
              Edit JSON directly or load a file:
            </span>
            <div style={{ display: 'flex', gap: '8px' }}>
              <label className="btn-preset" style={{ cursor: 'pointer', padding: '4px 10px' }}>
                📁 Upload File
                <input
                  type="file"
                  accept=".json,application/json"
                  onChange={handleFileUpload}
                  style={{ display: 'none' }}
                />
              </label>
              <button
                type="button"
                className="btn-preset"
                onClick={handleCopy}
                style={{ padding: '4px 10px' }}
              >
                {copyFeedback ? '✓ Copied!' : '📋 Copy JSON'}
              </button>
              <button
                type="button"
                className="btn-preset"
                onClick={handleDownload}
                style={{ padding: '4px 10px' }}
              >
                💾 Download
              </button>
            </div>
          </div>

          <textarea
            value={jsonText}
            onChange={(e) => {
              setJsonText(e.target.value);
              setErrorMsg('');
            }}
            rows={14}
            style={{
              width: '100%',
              boxSizing: 'border-box',
              fontFamily: 'Fira Code, monospace',
              fontSize: '0.82rem',
              padding: '12px',
              borderRadius: '8px',
              backgroundColor: 'var(--bg-input)',
              color: 'var(--text-primary)',
              border: '1px solid var(--border-color)',
              lineHeight: 1.5,
              resize: 'vertical',
            }}
          />

          {errorMsg && (
            <div
              style={{
                color: '#ef4444',
                background: 'rgba(239, 68, 68, 0.1)',
                padding: '8px 12px',
                borderRadius: '6px',
                fontSize: '0.8rem',
                whiteSpace: 'pre-line',
              }}
            >
              {errorMsg}
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '6px' }}>
            <button
              type="button"
              className="btn-preset"
              onClick={onClose}
              style={{ padding: '8px 16px' }}
            >
              Cancel
            </button>
            <button
              type="button"
              className="btn-primary-sm"
              onClick={handleApplyImport}
              style={{ padding: '8px 18px' }}
            >
              Apply JSON to Workspace
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

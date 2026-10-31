import React, { useEffect } from 'react';
import './ExampleLoader.css';
import StatusBadge from '../common/StatusBadge';
import { EXAMPLE_AUTOMATA } from '../../engine/examples';

export default function ExampleLoader({ isOpen, onClose, onLoadExample }) {
  // Close modal on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-container" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Standard Automata Library (Examples)</h3>
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
          <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            Select any formal machine below to load its states, alphabet, transition diagram, and pre-configured test strings into the workspace.
          </p>

          <div className="examples-grid">
            {EXAMPLE_AUTOMATA.map((ex) => (
              <div key={ex.id} className="example-card">
                <div className="example-card-header">
                  <div className="example-title-area">
                    <span className="example-name">{ex.name}</span>
                    <StatusBadge status={ex.type} label={ex.type} size="small" />
                  </div>
                  <button
                    type="button"
                    className="btn-primary-sm"
                    onClick={() => {
                      onLoadExample(ex);
                      onClose();
                    }}
                  >
                    Load Model
                  </button>
                </div>

                <div className="example-desc">{ex.description}</div>

                <div className="example-meta-row">
                  <span>Q = &#123;{ex.states.join(', ')}&#125;</span>
                  <span>&Sigma; = &#123;{ex.alphabet.join(', ')}&#125;</span>
                  <span>q₀ = {ex.startState}</span>
                  <span>F = &#123;{ex.acceptStates.join(', ')}&#125;</span>
                </div>

                {ex.sampleStrings && (
                  <div className="example-samples">
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                      Test cases:
                    </span>
                    {ex.sampleStrings.map((sample, idx) => (
                      <span
                        key={idx}
                        className={`sample-tag ${sample.expected ? 'acc' : 'rej'}`}
                        title={sample.label}
                      >
                        "{sample.string === '' ? 'ε' : sample.string}" (
                        {sample.expected ? 'Accept' : 'Reject'})
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

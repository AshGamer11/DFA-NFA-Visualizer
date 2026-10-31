import React, { useState } from 'react';
import { AUTOMATON_TYPES, EPSILON } from '../../utils/constants';

export default function AlphabetEditor({
  alphabet,
  automatonType,
  onAddSymbol,
  onRemoveSymbol,
  onSetAlphabet,
}) {
  const [newSymbol, setNewSymbol] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleAddSymbol = (e) => {
    e.preventDefault();
    const sym = newSymbol.trim();
    if (!sym) {
      setErrorMsg('Symbol cannot be empty');
      return;
    }
    if (sym === EPSILON || sym.toLowerCase() === 'e' || sym === 'λ') {
      setErrorMsg(`"${sym}" is reserved for epsilon transitions (handled separately).`);
      return;
    }
    if (alphabet.includes(sym)) {
      setErrorMsg(`Symbol "${sym}" is already in alphabet Σ`);
      return;
    }
    setErrorMsg('');
    onAddSymbol(sym);
    setNewSymbol('');
  };

  const setPresetBinary = () => {
    onSetAlphabet(['0', '1']);
  };

  const setPresetLetters = () => {
    onSetAlphabet(['a', 'b']);
  };

  return (
    <div className="editor-subpanel">
      <div className="subpanel-header">
        <h4>Input Alphabet &Sigma; ({alphabet.length})</h4>
        <div className="quick-presets">
          <span style={{ fontSize: '0.75rem', opacity: 0.7 }}>Presets:</span>
          <button type="button" className="btn-preset" onClick={setPresetBinary}>
            &#123;0, 1&#125;
          </button>
          <button type="button" className="btn-preset" onClick={setPresetLetters}>
            &#123;a, b&#125;
          </button>
        </div>
      </div>

      <form className="add-item-form" onSubmit={handleAddSymbol}>
        <input
          type="text"
          className="editor-input"
          placeholder="Symbol (e.g. 0, 1, a)"
          value={newSymbol}
          onChange={(e) => {
            setNewSymbol(e.target.value);
            if (errorMsg) setErrorMsg('');
          }}
          maxLength={4}
        />
        <button type="submit" className="btn-primary-sm">
          Add Symbol
        </button>
      </form>

      {errorMsg && <div className="form-error-msg">{errorMsg}</div>}

      <div className="alphabet-chips-list">
        {alphabet.map((sym) => (
          <div key={sym} className="symbol-chip">
            <span className="symbol-char">{sym}</span>
            <button
              type="button"
              className="btn-icon-delete-chip"
              onClick={() => onRemoveSymbol(sym)}
              title={`Remove symbol ${sym}`}
            >
              ✕
            </button>
          </div>
        ))}

        {automatonType === AUTOMATON_TYPES.NFA && (
          <div className="symbol-chip epsilon-chip" title="Epsilon (ε) empty transition is available in NFA mode">
            <span className="symbol-char">{EPSILON}</span>
            <span className="epsilon-badge">&epsilon;-move</span>
          </div>
        )}
      </div>
    </div>
  );
}

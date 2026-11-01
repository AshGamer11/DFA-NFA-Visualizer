import React, { useState } from 'react';
import { AUTOMATON_TYPES, EPSILON } from '../../utils/constants';

export default function TransitionEditor({
  states,
  alphabet,
  transitions,
  automatonType,
  onAddTransition,
  onRemoveTransition,
}) {
  const [fromState, setFromState] = useState(states[0] || '');
  const [symbol, setSymbol] = useState(alphabet[0] || '');
  const [toState, setToState] = useState(states[0] || '');
  const [errorMsg, setErrorMsg] = useState('');

  // Determine available symbols for selection: only ε-NFA mode permits epsilon moves
  const availableSymbols = automatonType === AUTOMATON_TYPES.ENFA
    ? [...alphabet, EPSILON]
    : alphabet;

  const handleAdd = (e) => {
    e.preventDefault();
    if (!fromState || !symbol || !toState) {
      setErrorMsg('Please select From-State, Symbol, and To-State.');
      return;
    }

    // For DFA: check if transition from 'fromState' on 'symbol' already exists
    if (automatonType === AUTOMATON_TYPES.DFA) {
      const existing = transitions.find(
        (t) => t.from === fromState && t.symbol === symbol
      );
      if (existing) {
        if (existing.to === toState) {
          setErrorMsg(`Transition δ(${fromState}, '${symbol}') → ${toState} already exists.`);
          return;
        } else {
          setErrorMsg(
            `DFA Determinism Conflict: δ(${fromState}, '${symbol}') already transitions to "${existing.to}". Delete it first or switch to NFA.`
          );
          return;
        }
      }
    } else {
      // For NFA: check exact duplicate
      const duplicate = transitions.some(
        (t) => t.from === fromState && t.symbol === symbol && t.to === toState
      );
      if (duplicate) {
        setErrorMsg('This exact transition already exists.');
        return;
      }
    }

    setErrorMsg('');
    onAddTransition({ from: fromState, symbol, to: toState });
  };

  return (
    <div className="editor-subpanel">
      <div className="subpanel-header">
        <h4>Transitions &delta; ({transitions.length})</h4>
      </div>

      {states.length === 0 || alphabet.length === 0 ? (
        <div className="empty-hint-box">
          Add at least one state and alphabet symbol before creating transitions.
        </div>
      ) : (
        <form className="add-transition-grid" onSubmit={handleAdd}>
          <div className="form-field">
            <label className="field-label">From State</label>
            <select
              className="editor-select"
              value={fromState}
              onChange={(e) => {
                setFromState(e.target.value);
                setErrorMsg('');
              }}
            >
              {states.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          <div className="form-field">
            <label className="field-label">Input Symbol</label>
            <select
              className="editor-select"
              value={symbol}
              onChange={(e) => {
                setSymbol(e.target.value);
                setErrorMsg('');
              }}
            >
              {availableSymbols.map((sym) => (
                <option key={sym} value={sym}>
                  {sym === EPSILON ? 'ε (epsilon)' : sym}
                </option>
              ))}
            </select>
          </div>

          <div className="form-field">
            <label className="field-label">To State</label>
            <select
              className="editor-select"
              value={toState}
              onChange={(e) => {
                setToState(e.target.value);
                setErrorMsg('');
              }}
            >
              {states.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          <div className="form-field form-field-button">
            <label className="field-label">&nbsp;</label>
            <button type="submit" className="btn-primary-sm btn-full">
              + Add Transition
            </button>
          </div>
        </form>
      )}

      {errorMsg && <div className="form-error-msg">{errorMsg}</div>}

      <div className="transitions-list-container">
        {transitions.length === 0 ? (
          <div className="no-items-text">No transitions defined yet.</div>
        ) : (
          <div className="transitions-table-wrapper">
            <table className="mini-transitions-table">
              <thead>
                <tr>
                  <th>From</th>
                  <th>Symbol</th>
                  <th>To</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {transitions.map((t, idx) => (
                  <tr key={`${t.from}-${t.symbol}-${t.to}-${idx}`}>
                    <td>
                      <span className="state-badge">{t.from}</span>
                    </td>
                    <td>
                      <span className="symbol-cell-badge">
                        {t.symbol === EPSILON ? 'ε' : t.symbol}
                      </span>
                    </td>
                    <td>
                      <span className="state-badge">{t.to}</span>
                    </td>
                    <td>
                      <button
                        type="button"
                        className="btn-icon-delete"
                        onClick={() => onRemoveTransition(idx)}
                        title="Delete transition"
                      >
                        ✕
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

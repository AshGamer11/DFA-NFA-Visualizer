import React from 'react';
import './TheoryCard.css';
import { AUTOMATON_TYPES } from '../../utils/constants';

export default function TheoryCard({ automaton }) {
  const { type, states, alphabet, startState, acceptStates, name, description } = automaton;

  const getTypeFormula = () => {
    switch (type) {
      case AUTOMATON_TYPES.DFA:
        return {
          title: 'Deterministic Finite Automaton (DFA)',
          rule: 'δ : Q × Σ → Q',
          desc: 'For every state q and input symbol a, there is exactly one next state δ(q, a). No ε-transitions.',
        };
      case AUTOMATON_TYPES.NFA:
        return {
          title: 'Non-Deterministic Finite Automaton (NFA)',
          rule: 'δ : Q × Σ → 𝒫(Q)',
          desc: 'A state can transition to zero, one, or multiple states on a symbol. No ε-moves permitted.',
        };
      case AUTOMATON_TYPES.ENFA:
      default:
        return {
          title: 'ε-NFA (NFA with ε-moves)',
          rule: 'δ : Q × (Σ ∪ {ε}) → 𝒫(Q)',
          desc: 'Allows spontaneous state transitions without consuming input symbols, evaluated via ε-closure.',
        };
    }
  };

  const typeInfo = getTypeFormula();

  return (
    <div className="sidebar-card theory-card">
      <div className="card-header">
        <div className="header-title">
          <span className="header-icon">📖</span>
          <div>
            <h3>Theory &amp; Formal 5-Tuple</h3>
            <span className="card-sub">{typeInfo.title}</span>
          </div>
        </div>
      </div>

      <div className="theory-body">
        {/* Formal Tuple Notation */}
        <div className="formal-formula-pill">
          <code>M = &lang; Q, &Sigma;, &delta;, q₀, F &rang;</code>
        </div>

        {/* 5-tuple breakdown table */}
        <div className="tuple-breakdown">
          <div className="tuple-row">
            <span className="tuple-symbol">Q</span>
            <div className="tuple-content">
              <strong>States ({states.length}):</strong>
              <code className="tuple-set">&#123; {states.join(', ')} &#125;</code>
            </div>
          </div>

          <div className="tuple-row">
            <span className="tuple-symbol">&Sigma;</span>
            <div className="tuple-content">
              <strong>Alphabet ({alphabet.length}):</strong>
              <code className="tuple-set">&#123; {alphabet.join(', ')} &#125;</code>
            </div>
          </div>

          <div className="tuple-row">
            <span className="tuple-symbol">q₀</span>
            <div className="tuple-content">
              <strong>Initial State:</strong>
              <code className="tuple-val">{startState || '—'}</code>
            </div>
          </div>

          <div className="tuple-row">
            <span className="tuple-symbol">F</span>
            <div className="tuple-content">
              <strong>Accept States ({acceptStates.length}):</strong>
              <code className="tuple-set">
                {acceptStates.length > 0 ? `\u007B ${acceptStates.join(', ')} \u007D` : '\u2205 (None)'}
              </code>
            </div>
          </div>

          <div className="tuple-row">
            <span className="tuple-symbol">&delta;</span>
            <div className="tuple-content">
              <strong>Transition Rule:</strong>
              <code className="tuple-rule">{typeInfo.rule}</code>
              <span className="tuple-explanation">{typeInfo.desc}</span>
            </div>
          </div>
        </div>

        {/* Current Automaton Context */}
        {name && (
          <div className="automaton-context-box">
            <span className="context-label">Current Language L(M):</span>
            <p className="context-desc">{description || name}</p>
          </div>
        )}
      </div>
    </div>
  );
}

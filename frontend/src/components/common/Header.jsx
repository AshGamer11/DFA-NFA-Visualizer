import React from 'react';
import './Header.css';
import { AUTOMATON_TYPES } from '../../utils/constants';

export default function Header({
  automatonType,
  onTypeChange,
  backendOnline,
  theme,
  onToggleTheme,
  onOpenExamples,
  onOpenIOModal,
  onResetAutomaton,
}) {
  return (
    <header className="app-header">
      <div className="header-left">
        <div className="brand-icon">δ</div>
        <div className="brand-text">
          <h1>
            Automata Visualizer
            <span style={{ fontSize: '0.8rem', opacity: 0.7, fontWeight: 400 }}>
              (M = &lang;Q, &Sigma;, &delta;, q₀, F&rang;)
            </span>
          </h1>
          <span className="course-tag">CSET302: Automata Theory &amp; Formal Languages</span>
        </div>
      </div>

      <div className="header-center">
        <div className="type-toggle-group" title="Switch automaton machine type">
          <button
            type="button"
            className={`type-btn ${automatonType === AUTOMATON_TYPES.DFA ? 'active' : ''}`}
            onClick={() => onTypeChange(AUTOMATON_TYPES.DFA)}
          >
            DFA
          </button>
          <button
            type="button"
            className={`type-btn ${automatonType === AUTOMATON_TYPES.NFA ? 'active' : ''}`}
            onClick={() => onTypeChange(AUTOMATON_TYPES.NFA)}
          >
            NFA (with &epsilon;)
          </button>
        </div>
      </div>

      <div className="header-right">
        <div
          className="backend-indicator"
          title={
            backendOnline
              ? 'Connected to Spring Boot API (/api)'
              : 'Spring Boot offline. Running standalone client-side engine'
          }
        >
          <span className={`backend-dot ${backendOnline ? 'online' : 'offline'}`} />
          <span>{backendOnline ? 'Spring Boot Online' : 'Standalone (Client Engine)'}</span>
        </div>

        <button
          type="button"
          className="header-action-btn"
          onClick={onOpenExamples}
          title="Load pre-built standard automata examples"
        >
          <span>📚</span> Examples
        </button>

        <button
          type="button"
          className="header-action-btn"
          onClick={onOpenIOModal}
          title="Import or Export Automaton JSON"
        >
          <span>⇄</span> JSON
        </button>

        <button
          type="button"
          className="header-action-btn"
          onClick={onResetAutomaton}
          title="Clear and reset automaton"
        >
          <span>↺</span> Clear
        </button>

        <button
          type="button"
          className="theme-toggle-btn"
          onClick={onToggleTheme}
          title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
          aria-label="Toggle theme"
        >
          {theme === 'dark' ? '☀️' : '🌙'}
        </button>
      </div>
    </header>
  );
}

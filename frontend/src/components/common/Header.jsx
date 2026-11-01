import React, { useState } from 'react';
import './Header.css';
import { AUTOMATON_TYPES } from '../../utils/constants';
import HelpModal from './HelpModal';

export default function Header({
  automatonType,
  onTypeChange,
  backendOnline,
  theme,
  onToggleTheme,
  onOpenExamples,
  onOpenIOModal,
  onResetAutomaton,
  onCheckBackend,
}) {
  const [isHelpOpen, setIsHelpOpen] = useState(false);

  return (
    <>
      <header className="app-header">
        <div className="header-left">
          <div className="brand-logo">
            <span className="brand-glyph">&delta;</span>
            <div className="brand-glow" />
          </div>
          <div className="brand-text">
            <div className="title-row">
              <h1>Automata Visualizer</h1>
              <span className="formal-tag">M = &lang;Q, &Sigma;, &delta;, q₀, F&rang;</span>
            </div>
            <span className="course-tag">CSET302: Automata Theory &amp; Computability &bull; Topic 7</span>
          </div>
        </div>

        <div className="header-center">
          <div className="type-toggle-group" title="Select Automaton Model">
            <button
              type="button"
              className={`type-btn ${automatonType === AUTOMATON_TYPES.DFA ? 'active' : ''}`}
              onClick={() => onTypeChange(AUTOMATON_TYPES.DFA)}
              title="Deterministic Finite Automaton (unique transition per state-symbol)"
            >
              <span className="type-badge-dot" />
              DFA
            </button>
            <button
              type="button"
              className={`type-btn ${automatonType === AUTOMATON_TYPES.NFA ? 'active' : ''}`}
              onClick={() => onTypeChange(AUTOMATON_TYPES.NFA)}
              title="Non-Deterministic Finite Automaton WITHOUT ε-moves"
            >
              <span className="type-badge-dot" />
              NFA (No &epsilon;)
            </button>
            <button
              type="button"
              className={`type-btn ${automatonType === AUTOMATON_TYPES.ENFA ? 'active' : ''}`}
              onClick={() => onTypeChange(AUTOMATON_TYPES.ENFA)}
              title="NFA WITH ε-moves (supports spontaneous epsilon transitions and closures)"
            >
              <span className="type-badge-dot" />
              &epsilon;-NFA
            </button>
          </div>
        </div>

        <div className="header-right">
          {/* Engine / Backend Connection Indicator */}
          <div
            className={`backend-pill ${backendOnline ? 'online' : 'offline'}`}
            title={
              backendOnline
                ? 'Spring Boot REST API (port 8080) is connected and verifying simulations.'
                : 'Spring Boot is offline. Operating with high-performance browser simulation engine. Start Spring Boot on port 8080 to connect backend.'
            }
            onClick={onCheckBackend}
            style={{ cursor: onCheckBackend ? 'pointer' : 'default' }}
          >
            <span className="radar-ping-wrapper">
              <span className={`radar-ping ${backendOnline ? 'ping-green' : 'ping-yellow'}`} />
              <span className={`radar-core ${backendOnline ? 'core-green' : 'core-yellow'}`} />
            </span>
            <span className="backend-pill-label">
              {backendOnline ? 'Spring Boot Online' : 'Client Engine (Local)'}
            </span>
          </div>

          <button
            type="button"
            className="header-action-btn"
            onClick={() => setIsHelpOpen(true)}
            title="View formal theory and simulator instructions"
          >
            <span>📖</span> Theory &amp; Guide
          </button>

          <button
            type="button"
            className="header-action-btn"
            onClick={onOpenExamples}
            title="Load standard pre-built DFA & NFA automata"
          >
            <span>📚</span> Examples
          </button>

          <button
            type="button"
            className="header-action-btn"
            onClick={onOpenIOModal}
            title="Import or Export Automaton in JSON format"
          >
            <span>⇄</span> JSON
          </button>

          <button
            type="button"
            className="header-action-btn btn-danger-hover"
            onClick={onResetAutomaton}
            title="Clear current automaton and start clean"
          >
            <span>↺</span> Reset
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

      <HelpModal isOpen={isHelpOpen} onClose={() => setIsHelpOpen(false)} />
    </>
  );
}

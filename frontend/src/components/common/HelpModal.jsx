import React from 'react';
import './HelpModal.css';

export default function HelpModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="help-modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title-group">
            <h3>📖 CSET302: Automata Theory &amp; Visualizer Guide</h3>
            <span className="modal-subtitle">Topic 7: DFA / NFA String Processing Visualizer</span>
          </div>
          <button type="button" className="modal-close-btn" onClick={onClose}>
            &times;
          </button>
        </div>

        <div className="modal-body help-content">
          <section className="help-section">
            <h4>1. Mathematical 5-Tuple Specification</h4>
            <p>A Finite Automaton is formally defined as a 5-tuple:</p>
            <div className="formal-box">
              <code>M = &lang; Q, &Sigma;, &delta;, q₀, F &rang;</code>
            </div>
            <ul className="help-list">
              <li><strong>Q</strong>: Finite, non-empty set of states.</li>
              <li><strong>&Sigma;</strong>: Finite input alphabet (symbols like <code>0, 1</code> or <code>a, b</code>).</li>
              <li>
                <strong>&delta;</strong>: State transition function:
                <br />• <em>DFA</em>: &delta; : Q &times; &Sigma; &rarr; Q (exactly one next state per symbol).
                <br />• <em>NFA</em>: &delta; : Q &times; (&Sigma; &cup; &#123;&epsilon;&#125;) &rarr; &Pscr;(Q) (set of next states, parallel branches allowed).
              </li>
              <li><strong>q₀</strong>: Initial / start state (q₀ &isin; Q).</li>
              <li><strong>F</strong>: Set of accepting / final states (F &sube; Q), rendered as concentric double-circles.</li>
            </ul>
          </section>

          <section className="help-section">
            <h4>2. How String Simulation Works</h4>
            <div className="algorithm-steps">
              <div className="algo-step">
                <span className="step-num">1</span>
                <div>
                  <strong>Initialization (Step 0):</strong> The automaton begins at start state <code>q₀</code> (along with its &epsilon;-closure for NFA).
                </div>
              </div>
              <div className="algo-step">
                <span className="step-num">2</span>
                <div>
                  <strong>Symbol Consumption:</strong> The read head moves symbol-by-symbol across the input tape, highlighting the active state and transition.
                </div>
              </div>
              <div className="algo-step">
                <span className="step-num">3</span>
                <div>
                  <strong>Verdict:</strong> Upon reading the entire string:
                  <br />• <strong>ACCEPTED</strong> if the final state is in <code>F</code> (or any active branch ends in <code>F</code> for NFA).
                  <br />• <strong>REJECTED</strong> if halted in a non-accept state or if stuck in an undefined trap transition.
                </div>
              </div>
            </div>
          </section>

          <section className="help-section">
            <h4>3. Architectural Overview (Topic 7 Deliverables)</h4>
            <div className="arch-grid">
              <div className="arch-item">
                <span className="arch-badge">Frontend</span>
                <strong>React 18 + Cytoscape.js</strong>
                <p>Interactive graph rendering, tape read-head animation, transition matrix, and batch testing.</p>
              </div>
              <div className="arch-item">
                <span className="arch-badge">Backend</span>
                <strong>Spring Boot 3.4 (Java 23)</strong>
                <p>Formal automata validation algorithms, step tracing engine, REST APIs, and Swagger OpenAPI docs.</p>
              </div>
              <div className="arch-item">
                <span className="arch-badge">Database</span>
                <strong>MongoDB 8.2</strong>
                <p>Stores user-defined automata definitions, transitions, and test histories.</p>
              </div>
            </div>
          </section>

          <section className="help-section">
            <h4>4. Quick Keyboard &amp; Control Shortcuts</h4>
            <div className="shortcuts-row">
              <span className="kbd-pill"><kbd>Enter</kbd> Run input string</span>
              <span className="kbd-pill"><kbd>▶ / ⏸</kbd> Play / Pause animation</span>
              <span className="kbd-pill"><kbd>⏭</kbd> Step Forward</span>
              <span className="kbd-pill"><kbd>⏮</kbd> Step Backward</span>
              <span className="kbd-pill"><kbd>⏹</kbd> Reset</span>
            </div>
          </section>
        </div>

        <div className="modal-footer">
          <button type="button" className="btn-primary" onClick={onClose}>
            Got it, Let's Explore!
          </button>
        </div>
      </div>
    </div>
  );
}

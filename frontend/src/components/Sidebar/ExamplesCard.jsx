import React, { useState } from 'react';
import './ExamplesCard.css';
import { EXAMPLE_AUTOMATA } from '../../engine/examples';
import { AUTOMATON_TYPES } from '../../utils/constants';

export default function ExamplesCard({ activeAutomatonId, onLoadExample }) {
  const [filter, setFilter] = useState('ALL');

  const filteredExamples = EXAMPLE_AUTOMATA.filter((ex) => {
    if (filter === 'ALL') return true;
    if (filter === 'DFA') return ex.type === AUTOMATON_TYPES.DFA;
    if (filter === 'NFA') return ex.type === AUTOMATON_TYPES.NFA;
    if (filter === 'ENFA') return ex.type === AUTOMATON_TYPES.ENFA;
    return true;
  });

  return (
    <div className="sidebar-card examples-card">
      <div className="card-header">
        <div className="header-title">
          <span className="header-icon">📚</span>
          <div>
            <h3>Pre-Built Examples</h3>
            <span className="card-sub">Standard textbook automata library</span>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="examples-filter-bar">
        <button
          type="button"
          className={`filter-btn ${filter === 'ALL' ? 'active' : ''}`}
          onClick={() => setFilter('ALL')}
        >
          All ({EXAMPLE_AUTOMATA.length})
        </button>
        <button
          type="button"
          className={`filter-btn ${filter === 'DFA' ? 'active' : ''}`}
          onClick={() => setFilter('DFA')}
        >
          DFA (7)
        </button>
        <button
          type="button"
          className={`filter-btn ${filter === 'NFA' ? 'active' : ''}`}
          onClick={() => setFilter('NFA')}
        >
          NFA (7)
        </button>
        <button
          type="button"
          className={`filter-btn ${filter === 'ENFA' ? 'active' : ''}`}
          onClick={() => setFilter('ENFA')}
        >
          &epsilon;-NFA (7)
        </button>
      </div>

      <div className="examples-list-scroll">
        {filteredExamples.map((ex) => {
          const isCurrent = activeAutomatonId === ex.id;
          return (
            <div
              key={ex.id}
              className={`example-mini-card ${isCurrent ? 'selected' : ''}`}
              onClick={() => onLoadExample(ex)}
            >
              <div className="example-mini-top">
                <span className={`type-tag tag-${ex.type.toLowerCase().replace(/[^a-z]/g, '')}`}>
                  {ex.type}
                </span>
                <span className="example-states-count">
                  {ex.states.length} states &bull; |&Sigma;| = {ex.alphabet.length}
                </span>
              </div>
              <h4 className="example-mini-name">{ex.name}</h4>
              <p className="example-mini-desc">{ex.description}</p>

              {ex.sampleStrings && ex.sampleStrings.length > 0 && (
                <div className="example-mini-samples">
                  <span className="samples-label">Test strings:</span>
                  <div className="mini-chips">
                    {ex.sampleStrings.slice(0, 3).map((sample, idx) => (
                      <span
                        key={idx}
                        className={`mini-chip ${sample.expected ? 'chip-accept' : 'chip-reject'}`}
                        title={sample.label}
                      >
                        {sample.string === '' ? 'ε' : sample.string}
                        {sample.expected ? ' ✓' : ' ✕'}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

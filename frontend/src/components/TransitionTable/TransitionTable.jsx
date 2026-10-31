import React from 'react';
import './TransitionTable.css';
import { AUTOMATON_TYPES, EPSILON } from '../../utils/constants';

export default function TransitionTable({
  automaton,
  activeStates = [],
  activeTransitions = [],
}) {
  const { states = [], alphabet = [], startState, acceptStates = [], transitions = [], type } = automaton;

  // For NFA, also include epsilon column
  const tableColumns = type === AUTOMATON_TYPES.NFA
    ? [...alphabet, EPSILON]
    : alphabet;

  // Build map: (state, symbol) -> array of next states
  const deltaMap = new Map();
  transitions.forEach((t) => {
    const key = `${t.from}::${t.symbol}`;
    if (!deltaMap.has(key)) {
      deltaMap.set(key, []);
    }
    const arr = deltaMap.get(key);
    if (!arr.includes(t.to)) {
      arr.push(t.to);
    }
  });

  return (
    <div className="transition-table-panel">
      <div className="table-header-row">
        <h4 className="table-title">
          <span>Formal Transition Table</span>
          <span className="formal-label">(&delta; : Q &times; &Sigma; &rarr; P(Q))</span>
        </h4>
        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
          <span>&rarr; Start state</span> &nbsp;|&nbsp; <span>* Accept state</span>
        </div>
      </div>

      <div className="table-body-container">
        {states.length === 0 || tableColumns.length === 0 ? (
          <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '16px' }}>
            Define states and alphabet symbols to render transition table.
          </div>
        ) : (
          <table className="formal-delta-table">
            <thead>
              <tr>
                <th className="corner-header">&delta;</th>
                {tableColumns.map((col) => (
                  <th key={col}>
                    {col === EPSILON ? 'ε' : col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {states.map((state) => {
                const isStart = state === startState;
                const isAccept = acceptStates.includes(state);
                const isRowActive = activeStates.includes(state);

                let indicator = '';
                let indicatorClass = '';
                if (isStart && isAccept) {
                  indicator = '→*';
                  indicatorClass = 'both';
                } else if (isStart) {
                  indicator = '→';
                  indicatorClass = 'start';
                } else if (isAccept) {
                  indicator = '*';
                  indicatorClass = 'accept';
                }

                return (
                  <tr key={state} className={isRowActive ? 'row-active' : ''}>
                    <td className="state-row-header">
                      <span className={`state-indicator ${indicatorClass}`}>
                        {indicator}
                      </span>
                      <span style={{ fontWeight: isRowActive ? 700 : 600 }}>{state}</span>
                    </td>

                    {tableColumns.map((sym) => {
                      const key = `${state}::${sym}`;
                      const destinations = deltaMap.get(key) || [];

                      // Check if this cell is actively being traversed
                      const isCellTraversing = activeTransitions.some(
                        (t) => t.from === state && t.symbol === sym
                      );

                      let cellContent;
                      if (type === AUTOMATON_TYPES.DFA) {
                        cellContent = destinations.length > 0 ? (
                          destinations[0]
                        ) : (
                          <span className="empty-cell-text">—</span>
                        );
                      } else {
                        // NFA
                        cellContent = destinations.length > 0 ? (
                          `{ ${destinations.join(', ')} }`
                        ) : (
                          <span className="empty-cell-text">&empty;</span>
                        );
                      }

                      return (
                        <td
                          key={sym}
                          className={`delta-cell ${isCellTraversing ? 'active-cell' : ''}`}
                          title={`δ(${state}, '${sym}')`}
                        >
                          {cellContent}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

import React, { useState } from 'react';
import { AUTOMATON_TYPES, SIMULATION_STATUS } from '../../utils/constants';

export default function ComputationPath({
  steps = [],
  currentStepIndex = 0,
  onSelectStep,
  automatonType = AUTOMATON_TYPES.DFA,
  treeNodes = [],
}) {
  const [viewMode, setViewMode] = useState('trace'); // 'trace' or 'branches'

  return (
    <div className="computation-path-container">
      <div className="computation-path-header">
        <h4>Computation Trace</h4>
        {automatonType === AUTOMATON_TYPES.NFA && treeNodes && treeNodes.length > 0 && (
          <div className="view-mode-toggle">
            <button
              type="button"
              className={`mode-btn ${viewMode === 'trace' ? 'active' : ''}`}
              onClick={() => setViewMode('trace')}
            >
              Trace Table
            </button>
            <button
              type="button"
              className={`mode-btn ${viewMode === 'branches' ? 'active' : ''}`}
              onClick={() => setViewMode('branches')}
            >
              NFA Tree ({treeNodes.length})
            </button>
          </div>
        )}
      </div>

      {steps.length === 0 ? (
        <div className="trace-empty">
          Run or step through a string simulation to view computation path.
        </div>
      ) : viewMode === 'trace' ? (
        <div className="trace-table-wrapper">
          <table className="trace-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Current State</th>
                <th>Read</th>
                <th>Next State</th>
                <th>Remaining</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {steps.map((step, idx) => {
                const isSelected = idx === currentStepIndex;
                const activeStateDisplay = step.activeStates
                  ? step.activeStates.length > 1
                    ? `{ ${step.activeStates.join(', ')} }`
                    : step.activeStates[0] || '∅'
                  : '—';

                const nextStateDisplay = step.nextStates
                  ? Array.isArray(step.nextStates)
                    ? step.nextStates.length > 0
                      ? `{ ${step.nextStates.join(', ')} }`
                      : '∅'
                    : step.nextState || '∅'
                  : step.nextState || '—';

                return (
                  <tr
                    key={idx}
                    className={`trace-row ${isSelected ? 'active-step-row' : ''}`}
                    onClick={() => onSelectStep(idx)}
                    title="Click to jump simulation to this step"
                  >
                    <td>
                      <span className="step-num-pill">{step.stepIndex}</span>
                    </td>
                    <td>
                      <span className="step-state">
                        {step.currentState || (step.currentStates ? `{${step.currentStates.join(', ')}}` : '—')}
                      </span>
                    </td>
                    <td>
                      <span className="step-symbol">
                        {step.symbolRead ? `'${step.symbolRead}'` : 'ε'}
                      </span>
                    </td>
                    <td>
                      <span className="step-next-state">
                        {nextStateDisplay}
                      </span>
                    </td>
                    <td>
                      <span className="step-remaining">
                        {step.remainingInput === '' ? 'ε' : step.remainingInput}
                      </span>
                    </td>
                    <td>
                      <span
                        className={`trace-status-pill ${
                          step.status === SIMULATION_STATUS.ACCEPTED
                            ? 'acc'
                            : step.status === SIMULATION_STATUS.REJECTED
                            ? 'rej'
                            : 'run'
                        }`}
                      >
                        {step.status}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        /* NFA Branch Tree View */
        <div className="nfa-tree-container">
          <div className="tree-helper-text">
            All parallel computation threads explored by the non-deterministic automaton:
          </div>
          <div className="tree-nodes-list">
            {treeNodes.map((node) => (
              <div
                key={node.id}
                className={`tree-branch-node ${node.isAccepting ? 'accept-branch' : ''}`}
                style={{ marginLeft: `${node.depth * 22}px` }}
              >
                <span className="branch-arrow">↳</span>
                <span className="branch-symbol">[{node.symbolRead}]</span>
                <span className="branch-state">{node.state}</span>
                {node.isAccepting && (
                  <span className="accept-branch-tag">✓ ACCEPT</span>
                )}
                <span className="branch-depth">depth: {node.depth}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

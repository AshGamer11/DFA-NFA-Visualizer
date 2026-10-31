import React from 'react';

/**
 * Visualizes the input tape, read head pointer, current state(s), and step description.
 */
export default function StepDisplay({
  inputString = '',
  currentStepIndex = 0,
  currentStepData = null,
  totalSteps = 0,
}) {
  const chars = inputString ? inputString.split('') : [];
  // currentStepIndex corresponds to the step:
  // Step 0 is before any symbol is read (activeCharIndex = -1)
  // Step 1 read chars[0], Step 2 read chars[1], etc.
  const activeCharIndex = currentStepIndex - 1;

  const activeStates = currentStepData ? currentStepData.activeStates || [] : [];
  const symbolRead = currentStepData ? currentStepData.symbolRead : null;
  const description = currentStepData ? currentStepData.description : 'Ready to simulate.';
  const remainingInput = currentStepData ? currentStepData.remainingInput : inputString;

  return (
    <div className="step-display-container">
      {/* Tape Visualization */}
      <div className="tape-section">
        <div className="tape-header">
          <span className="section-label">Input Tape (Reading Head):</span>
          <span className="remaining-indicator">
            Remaining: <strong>{remainingInput === '' ? 'ε (empty)' : remainingInput}</strong>
          </span>
        </div>

        <div className="tape-wrapper">
          {chars.length === 0 ? (
            <div className="tape-empty-cell">&epsilon; (Empty String)</div>
          ) : (
            <div className="tape-cells">
              {chars.map((char, idx) => {
                const isCurrent = idx === activeCharIndex;
                const isConsumed = idx < activeCharIndex;
                return (
                  <div
                    key={idx}
                    className={`tape-cell ${isCurrent ? 'current' : ''} ${isConsumed ? 'consumed' : ''}`}
                  >
                    {isCurrent && <div className="read-head-pointer">▼</div>}
                    <span className="cell-symbol">{char}</span>
                    <span className="cell-index">{idx}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* State & Transition Info Cards */}
      <div className="step-info-grid">
        <div className="info-card">
          <span className="info-title">Current State(s)</span>
          <div className="info-value state-value">
            {activeStates.length === 0 ? (
              <span className="empty-state">∅ (Dead)</span>
            ) : activeStates.length === 1 ? (
              <span className="single-state">{activeStates[0]}</span>
            ) : (
              <span className="multi-state">&#123; {activeStates.join(', ')} &#125;</span>
            )}
          </div>
        </div>

        <div className="info-card">
          <span className="info-title">Symbol Read</span>
          <div className="info-value symbol-value">
            {symbolRead ? `'${symbolRead}'` : '— (Start)'}
          </div>
        </div>

        <div className="info-card">
          <span className="info-title">Step Progress</span>
          <div className="info-value progress-value">
            {currentStepIndex} / {totalSteps > 0 ? totalSteps - 1 : 0}
          </div>
        </div>
      </div>

      {/* Action / Step Description */}
      <div className="step-description-box">
        <span className="desc-icon">ℹ</span>
        <span className="desc-text">{description}</span>
      </div>
    </div>
  );
}

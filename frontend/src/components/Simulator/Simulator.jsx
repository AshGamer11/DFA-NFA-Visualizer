import React, { useState, useEffect, useRef, useCallback } from 'react';
import './Simulator.css';
import StepDisplay from './StepDisplay';
import ComputationPath from './ComputationPath';
import StatusBadge from '../common/StatusBadge';
import { AUTOMATON_TYPES, SIMULATION_STATUS, DEFAULT_SPEED_MS } from '../../utils/constants';
import { simulateDFA, simulateDFABatch } from '../../engine/DFASimulator';
import { simulateNFA, simulateNFABatch } from '../../engine/NFASimulator';
import { apiSimulateDFA, apiSimulateNFA } from '../../services/api';

export default function Simulator({
  automaton,
  onSimulationUpdate,
  sampleStrings = [],
  backendOnline = false,
}) {
  const [inputString, setInputString] = useState('');
  const [simulationResult, setSimulationResult] = useState(null);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speedMs, setSpeedMs] = useState(DEFAULT_SPEED_MS);
  const [showBatch, setShowBatch] = useState(false);
  const [batchInput, setBatchInput] = useState('');
  const [batchResults, setBatchResults] = useState(null);
  const [hasSimulated, setHasSimulated] = useState(false);

  const timerRef = useRef(null);

  // Initialize or re-run simulation whenever automaton or input string changes
  const runSimulation = useCallback(
    (strToSimulate, autoPlay = false) => {
      const text = strToSimulate !== undefined ? strToSimulate : inputString;

      // Calculate rich client steps so graph, tape, and trace tables can animate seamlessly
      const result = automaton.type === AUTOMATON_TYPES.DFA
        ? simulateDFA(automaton, text)
        : simulateNFA(automaton, text);

      // Asynchronously verify with Spring Boot if online
      if (backendOnline) {
        const apiCall = automaton.type === AUTOMATON_TYPES.DFA ? apiSimulateDFA : apiSimulateNFA;
        apiCall(automaton, text).catch(() => {});
      }

      setSimulationResult(result);
      setCurrentStepIndex(0);

      // Report initial step 0 to graph
      if (result && result.steps && result.steps[0]) {
        const step0 = result.steps[0];
        onSimulationUpdate({
          activeStates: step0.activeStates || [],
          activeTransitions: step0.activeTransitions || [],
          status: step0.status,
          currentStepIndex: 0,
        });
      }

      if (autoPlay && result && result.steps && result.steps.length > 1) {
        setIsPlaying(true);
      } else {
        setIsPlaying(false);
      }
    },
    [automaton, inputString, backendOnline, onSimulationUpdate]
  );

  const handleRun = (overrideStr) => {
    const text = overrideStr !== undefined ? overrideStr : inputString;
    setHasSimulated(true);
    runSimulation(text, true);
  };

  // Whenever automaton changes, reset and recalculate simulation
  useEffect(() => {
    setHasSimulated(false);
    runSimulation(inputString);
  }, [automaton]);

  // Handle Play / Auto-advance timer
  useEffect(() => {
    if (!isPlaying) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    if (!simulationResult || !simulationResult.steps) return;

    timerRef.current = setInterval(() => {
      setCurrentStepIndex((prevIdx) => {
        const nextIdx = prevIdx + 1;
        if (nextIdx >= simulationResult.steps.length) {
          // Reached end of simulation
          setIsPlaying(false);
          clearInterval(timerRef.current);
          return prevIdx;
        }
        return nextIdx;
      });
    }, speedMs);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying, simulationResult, speedMs]);

  // Broadcast step updates to graph whenever currentStepIndex changes
  useEffect(() => {
    if (!simulationResult || !simulationResult.steps) return;

    const currentStep = simulationResult.steps[currentStepIndex];
    if (currentStep) {
      onSimulationUpdate({
        activeStates: currentStep.activeStates || [],
        activeTransitions: currentStep.activeTransitions || [],
        status: currentStep.status,
        currentStepIndex,
      });
    }
  }, [currentStepIndex, simulationResult, onSimulationUpdate]);

  // Handlers for controls
  const handlePlayToggle = () => {
    if (!simulationResult) return;

    // If currently at the end, restart from step 0
    if (currentStepIndex >= simulationResult.steps.length - 1) {
      setCurrentStepIndex(0);
      setIsPlaying(true);
    } else {
      setIsPlaying(!isPlaying);
    }
  };

  const handleStepForward = () => {
    setIsPlaying(false);
    if (!simulationResult) return;
    setHasSimulated(true);
    if (currentStepIndex < simulationResult.steps.length - 1) {
      setCurrentStepIndex((prev) => prev + 1);
    }
  };

  const handleStepBackward = () => {
    setIsPlaying(false);
    if (currentStepIndex > 0) {
      setCurrentStepIndex((prev) => prev - 1);
    }
  };

  const handleReset = () => {
    setIsPlaying(false);
    setCurrentStepIndex(0);
    setHasSimulated(false);
  };

  const handleInputChange = (e) => {
    const val = e.target.value;
    setInputString(val);
    runSimulation(val);
  };

  const handleSelectSample = (sampleText) => {
    setInputString(sampleText);
    handleRun(sampleText);
  };

  const handleJumpToStep = (stepIdx) => {
    setIsPlaying(false);
    setCurrentStepIndex(stepIdx);
  };

  // Run Batch Testing
  const handleRunBatch = () => {
    const lines = batchInput
      .split('\n')
      .map((s) => s.trim())
      .filter((s, idx, arr) => s !== '' || idx === 0);

    const results = automaton.type === AUTOMATON_TYPES.DFA
      ? simulateDFABatch(automaton, lines)
      : simulateNFABatch(automaton, lines);

    setBatchResults(results);
  };

  // Active step details
  const currentStep = simulationResult?.steps?.[currentStepIndex] || null;
  const isAtFinalStep = simulationResult && currentStepIndex === simulationResult.steps.length - 1;
  const finalStatus = simulationResult
    ? simulationResult.accepted
      ? SIMULATION_STATUS.ACCEPTED
      : SIMULATION_STATUS.REJECTED
    : SIMULATION_STATUS.IDLE;

  return (
    <div className="simulator-panel">
      <div className="simulator-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <h3>String Processor</h3>
          <StatusBadge
            status={
              isAtFinalStep
                ? finalStatus
                : isPlaying
                ? SIMULATION_STATUS.RUNNING
                : SIMULATION_STATUS.PAUSED
            }
            label={
              isAtFinalStep
                ? simulationResult?.accepted
                  ? 'ACCEPTED'
                  : 'REJECTED'
                : isPlaying
                ? 'RUNNING'
                : 'STEPPING'
            }
            size="small"
          />
        </div>

        <button
          type="button"
          className="btn-text-action"
          onClick={() => setShowBatch(!showBatch)}
        >
          {showBatch ? 'Hide Batch' : 'Batch Testing'}
        </button>
      </div>

      <div className="simulator-body">
        {/* String input and suggestions */}
        <div className="input-string-group">
          <div className="input-label-row">
            <label className="input-label">Test Input String w &isin; &Sigma;*</label>
            {sampleStrings && sampleStrings.length > 0 && (
              <div className="sample-strings-chips">
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Try:</span>
                {sampleStrings.slice(0, 4).map((sample, idx) => (
                  <button
                    key={idx}
                    type="button"
                    className="sample-chip"
                    onClick={() => handleSelectSample(sample.string)}
                    title={sample.label}
                  >
                    "{sample.string === '' ? 'ε' : sample.string}"
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="input-row">
            <input
              type="text"
              className="string-input"
              placeholder="Enter string (e.g. 1001, leave empty for ε)"
              value={inputString}
              onChange={handleInputChange}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleRun();
                }
              }}
            />
            <button
              type="button"
              className="btn-primary-sm"
              onClick={() => handleRun()}
              title="Run and animate simulation"
            >
              Run
            </button>
          </div>
        </div>

        {/* Playback Controls */}
        <div className="controls-bar">
          <div className="playback-buttons">
            <button
              type="button"
              className="ctrl-btn"
              onClick={handleReset}
              title="Reset to initial state (Step 0)"
              disabled={currentStepIndex === 0}
            >
              ⏹
            </button>
            <button
              type="button"
              className="ctrl-btn"
              onClick={handleStepBackward}
              title="Step Backward"
              disabled={currentStepIndex === 0}
            >
              ⏮
            </button>
            <button
              type="button"
              className="ctrl-btn play-btn"
              onClick={handlePlayToggle}
              title={isPlaying ? 'Pause' : 'Play / Auto Advance'}
            >
              {isPlaying ? '⏸' : '▶'}
            </button>
            <button
              type="button"
              className="ctrl-btn"
              onClick={handleStepForward}
              title="Step Forward"
              disabled={!simulationResult || currentStepIndex >= simulationResult.steps.length - 1}
            >
              ⏭
            </button>
          </div>

          <div className="speed-control">
            <span>Speed:</span>
            <input
              type="range"
              className="speed-slider"
              min={200}
              max={1800}
              step={100}
              value={2000 - speedMs}
              onChange={(e) => setSpeedMs(2000 - Number(e.target.value))}
              title="Adjust step animation speed"
            />
            <span>{((2000 - speedMs) / 500).toFixed(1)}x</span>
          </div>
        </div>

        {/* Step details and tape visualization */}
        <StepDisplay
          inputString={inputString}
          currentStepIndex={currentStepIndex}
          currentStepData={currentStep}
          totalSteps={simulationResult?.steps?.length || 0}
        />

        {/* Result banner if finished; otherwise friendly ready prompt */}
        {hasSimulated && isAtFinalStep && simulationResult ? (
          <div
            className={`result-banner ${
              simulationResult.accepted ? 'accepted' : 'rejected'
            }`}
          >
            <span className="result-icon">
              {simulationResult.accepted ? '✓' : '✗'}
            </span>
            <div className="result-content">
              <span className="result-title">
                {simulationResult.accepted
                  ? 'STRING ACCEPTED'
                  : 'STRING REJECTED'}
              </span>
              <span className="result-reason">{simulationResult.reason}</span>
            </div>
          </div>
        ) : (
          <div className="ready-banner">
            <span className="ready-icon">ℹ</span>
            <span>
              Ready to simulate: Enter a test string and click <strong>Run</strong> (or press <strong>Enter</strong>) to begin.
            </span>
          </div>
        )}

        {/* Computation trace */}
        <ComputationPath
          steps={simulationResult?.steps || []}
          currentStepIndex={currentStepIndex}
          onSelectStep={handleJumpToStep}
          automatonType={automaton.type}
          treeNodes={simulationResult?.treeNodes || []}
        />

        {/* Batch testing drawer */}
        {showBatch && (
          <div className="batch-section">
            <div className="batch-title-row">
              <h4>Batch String Tester</h4>
              <button
                type="button"
                className="btn-primary-sm"
                onClick={handleRunBatch}
              >
                Test All
              </button>
            </div>
            <div className="batch-input-area">
              <textarea
                className="batch-textarea"
                placeholder="Enter one string per line..."
                value={batchInput}
                onChange={(e) => setBatchInput(e.target.value)}
                rows={3}
              />
            </div>

            {batchResults && (
              <table className="batch-results-table">
                <thead>
                  <tr>
                    <th>Input</th>
                    <th>Result</th>
                    <th>Final State</th>
                  </tr>
                </thead>
                <tbody>
                  {batchResults.map((res, i) => (
                    <tr key={i}>
                      <td>
                        <code>"{res.input === '' ? 'ε' : res.input}"</code>
                      </td>
                      <td>
                        <StatusBadge
                          status={res.accepted ? 'ACCEPTED' : 'REJECTED'}
                          label={res.accepted ? 'ACCEPT' : 'REJECT'}
                          size="small"
                        />
                      </td>
                      <td>
                        <code>
                          {res.finalState ||
                            (res.finalStates ? `{${res.finalStates.join(',')}}` : '—')}
                        </code>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

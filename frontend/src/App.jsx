import React, { useState, useEffect, useCallback } from 'react';
import './App.css';
import Header from './components/common/Header';
import AutomatonEditor from './components/AutomatonEditor/AutomatonEditor';
import AutomatonGraph from './components/AutomatonGraph/AutomatonGraph';
import Simulator from './components/Simulator/Simulator';
import TransitionTable from './components/TransitionTable/TransitionTable';
import ExampleLoader from './components/ExampleLoader/ExampleLoader';
import IOModal from './components/common/IOModal';
import { INITIAL_DFA, AUTOMATON_TYPES, SIMULATION_STATUS } from './utils/constants';
import { validateAutomaton } from './engine/AutomatonValidator';
import { checkBackendHealth } from './services/api';

export default function App() {
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('dfa_theme') || 'dark';
  });

  const [automaton, setAutomaton] = useState(INITIAL_DFA);
  const [validation, setValidation] = useState(() => validateAutomaton(INITIAL_DFA));
  const [backendOnline, setBackendOnline] = useState(false);

  // Simulation broadcast states
  const [simulationState, setSimulationState] = useState({
    activeStates: [INITIAL_DFA.startState],
    activeTransitions: [],
    status: SIMULATION_STATUS.IDLE,
    currentStepIndex: 0,
  });

  // Modals
  const [isExampleModalOpen, setIsExampleModalOpen] = useState(false);
  const [isIOModalOpen, setIsIOModalOpen] = useState(false);
  const [toast, setToast] = useState(null);

  // Apply theme to document element
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('dfa_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  const showToast = (message, type = 'info') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // Check backend health on mount and periodically
  useEffect(() => {
    let mounted = true;
    const verifyBackend = async () => {
      const res = await checkBackendHealth();
      if (mounted) {
        setBackendOnline(res.isOnline);
      }
    };
    verifyBackend();
    const interval = setInterval(verifyBackend, 15000);
    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []);

  // Update validation whenever automaton changes
  const handleAutomatonChange = useCallback((newAutomaton) => {
    setAutomaton(newAutomaton);
    const valid = validateAutomaton(newAutomaton);
    setValidation(valid);
  }, []);

  // Handle machine type switch (DFA <-> NFA)
  const handleTypeChange = (newType) => {
    if (newType === automaton.type) return;

    const updated = {
      ...automaton,
      type: newType,
      id: `${newType.toLowerCase()}_custom_${Date.now()}`,
    };
    handleAutomatonChange(updated);
    showToast(`Switched machine mode to ${newType}.`, 'info');
  };

  // Load example
  const handleLoadExample = (example) => {
    handleAutomatonChange(example);
    showToast(`Loaded example: "${example.name}"`, 'success');
  };

  // Reset automaton
  const handleResetAutomaton = () => {
    const emptyAutomaton = {
      id: `automaton_${Date.now()}`,
      name: 'New Custom Automaton',
      type: automaton.type,
      states: ['q0'],
      alphabet: ['0', '1'],
      startState: 'q0',
      acceptStates: [],
      transitions: [],
    };
    handleAutomatonChange(emptyAutomaton);
    showToast('Reset automaton workspace.', 'info');
  };

  // Simulation updates from Simulator component
  const handleSimulationUpdate = useCallback((update) => {
    setSimulationState((prev) => ({
      ...prev,
      ...update,
    }));
  }, []);

  return (
    <div className="app-layout">
      <Header
        automatonType={automaton.type}
        onTypeChange={handleTypeChange}
        backendOnline={backendOnline}
        theme={theme}
        onToggleTheme={toggleTheme}
        onOpenExamples={() => setIsExampleModalOpen(true)}
        onOpenIOModal={() => setIsIOModalOpen(true)}
        onResetAutomaton={handleResetAutomaton}
      />

      <main className="main-workspace">
        {/* Left Column: Automaton Specification Editor */}
        <section className="panel-editor-col">
          <AutomatonEditor
            automaton={automaton}
            onChange={handleAutomatonChange}
            validation={validation}
          />
        </section>

        {/* Center Column: Cytoscape Graph Visualization & Formal Table */}
        <section className="panel-center-col">
          <div className="graph-wrapper-card">
            <AutomatonGraph
              automaton={automaton}
              activeStates={simulationState.activeStates}
              activeTransitions={simulationState.activeTransitions}
              simulationStatus={simulationState.status}
              theme={theme}
            />
          </div>

          <TransitionTable
            automaton={automaton}
            activeStates={simulationState.activeStates}
            activeTransitions={simulationState.activeTransitions}
          />
        </section>

        {/* Right Column: String Processor & Computation Trace */}
        <section className="panel-simulator-col">
          <Simulator
            automaton={automaton}
            onSimulationUpdate={handleSimulationUpdate}
            sampleStrings={automaton.sampleStrings || []}
            backendOnline={backendOnline}
          />
        </section>
      </main>

      {/* Example Loader Modal */}
      <ExampleLoader
        isOpen={isExampleModalOpen}
        onClose={() => setIsExampleModalOpen(false)}
        onLoadExample={handleLoadExample}
      />

      {/* JSON Import/Export Modal */}
      <IOModal
        isOpen={isIOModalOpen}
        onClose={() => setIsIOModalOpen(false)}
        automaton={automaton}
        onImportAutomaton={(imported) => {
          handleAutomatonChange(imported);
          showToast(`Successfully imported ${imported.type || 'automaton'}.`, 'success');
        }}
      />

      {/* Toast Feedback */}
      {toast && (
        <div className={`toast-notification ${toast.type}`}>
          <span>{toast.type === 'success' ? '✓' : 'ℹ'}</span>
          <span>{toast.message}</span>
        </div>
      )}
    </div>
  );
}

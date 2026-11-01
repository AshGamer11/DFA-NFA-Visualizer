import React, { useState, useEffect, useCallback } from 'react';
import './App.css';
import Header from './components/common/Header';
import AutomatonEditor from './components/AutomatonEditor/AutomatonEditor';
import AutomatonGraph from './components/AutomatonGraph/AutomatonGraph';
import Simulator from './components/Simulator/Simulator';
import TransitionTable from './components/TransitionTable/TransitionTable';
import ExampleLoader from './components/ExampleLoader/ExampleLoader';
import IOModal from './components/common/IOModal';
import TheoryCard from './components/Sidebar/TheoryCard';
import ExamplesCard from './components/Sidebar/ExamplesCard';
import { INITIAL_DFA, AUTOMATON_TYPES, SIMULATION_STATUS } from './utils/constants';
import { validateAutomaton, isEpsilon } from './engine/AutomatonValidator';
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

  // Handle machine type switch (DFA <-> NFA without ε <-> ε-NFA)
  const handleTypeChange = (newType) => {
    if (newType === automaton.type) return;

    let updatedTransitions = automaton.transitions || [];
    // If switching away from ε-NFA to DFA or NFA (without ε), filter out ε-transitions
    if (newType !== AUTOMATON_TYPES.ENFA) {
      updatedTransitions = updatedTransitions.filter((t) => !isEpsilon(t.symbol));
    }

    const updated = {
      ...automaton,
      type: newType,
      transitions: updatedTransitions,
      id: `${newType.toLowerCase().replace(/[^a-z0-9]/g, '')}_custom_${Date.now()}`,
    };
    handleAutomatonChange(updated);
    showToast(`Switched model to ${newType}.`, 'info');
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

  const handleManualBackendCheck = async () => {
    showToast('Checking Spring Boot connection...', 'info');
    const res = await checkBackendHealth();
    setBackendOnline(res.isOnline);
    if (res.isOnline) {
      showToast('Connected to Spring Boot backend (/api)!', 'success');
    } else {
      showToast('Spring Boot is offline. Operating in standalone client mode.', 'info');
    }
  };

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
        onCheckBackend={handleManualBackendCheck}
      />

      <main className="main-workspace">
        {/* Left Column: Specification Editor (UP), Examples, Theory (DOWN) */}
        <aside className="panel-left-sidebar">
          {/* 1. Specification & Transition Editor Card (UP) */}
          <AutomatonEditor
            automaton={automaton}
            onChange={handleAutomatonChange}
            validation={validation}
          />

          {/* 2. Pre-Built Examples Card */}
          <ExamplesCard
            activeAutomatonId={automaton.id}
            onLoadExample={handleLoadExample}
          />

          {/* 3. Formal Theory & 5-Tuple Card (DOWN) */}
          <TheoryCard automaton={automaton} />
        </aside>

        {/* Right / Main Content: Graph Hero, Simulator Studio, Transition Matrix */}
        <div className="panel-main-content">
          {/* Section 1: Hero State Diagram Canvas */}
          <div className="graph-wrapper-card">
            <AutomatonGraph
              automaton={automaton}
              activeStates={simulationState.activeStates}
              activeTransitions={simulationState.activeTransitions}
              simulationStatus={simulationState.status}
              theme={theme}
            />
          </div>

          {/* Section 2: Interactive String Simulation Studio */}
          <Simulator
            automaton={automaton}
            onSimulationUpdate={handleSimulationUpdate}
            sampleStrings={automaton.sampleStrings || []}
            backendOnline={backendOnline}
          />

          {/* Section 3: Formal Transition Matrix (δ) */}
          <TransitionTable
            automaton={automaton}
            activeStates={simulationState.activeStates}
            activeTransitions={simulationState.activeTransitions}
          />
        </div>
      </main>

      {/* Example Loader Modal (Quick Fullscreen Modal also available) */}
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

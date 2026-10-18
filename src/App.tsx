import { useState } from 'react';
import { Header } from './components/layout/Header';
import { AutomatonGraph } from './components/visualization/AutomatonGraph';
import { InputTape } from './components/visualization/InputTape';
import { StringInput } from './components/simulation/StringInput';
import { SimulationControls } from './components/simulation/SimulationControls';
import { TraceTable } from './components/simulation/TraceTable';
import { ResultBanner } from './components/simulation/ResultBanner';
import { TransitionTable } from './components/editor/TransitionTable';
import { ComputationTree } from './components/visualization/ComputationTree';
import { BatchTester } from './components/simulation/BatchTester';
import { JsonModal } from './components/editor/JsonModal';
import { useStore } from './store/useStore';
import { Layers, FileCode, ListChecks, BookOpen } from 'lucide-react';

export default function App() {
  const { definition, activeTab, setActiveTab, simulationResult } = useStore();
  const [isJsonModalOpen, setIsJsonModalOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[var(--bg-dark)] text-[var(--text-primary)] flex flex-col font-sans">
      {/* Top Navigation */}
      <Header onOpenJsonModal={() => setIsJsonModalOpen(true)} />

      {/* Main Content Workspace */}
      <main className="flex-1 p-4 lg:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 max-w-[1800px] w-full mx-auto">
        {/* Left Column: Visualization Canvas & Playback (7 cols) */}
        <section className="lg:col-span-7 flex flex-col gap-4">
          {/* Automaton Graph Card */}
          <div className="flex-1 min-h-[460px] rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)] shadow-xl relative overflow-hidden flex flex-col">
            <div className="px-5 py-3.5 border-b border-[var(--border-color)] flex items-center justify-between bg-[var(--bg-card)]/80 backdrop-blur-md z-10">
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-[var(--primary)] animate-pulse" />
                <h2 className="text-sm font-semibold tracking-wide">
                  State Diagram ({definition.type})
                </h2>
              </div>
              <div className="flex items-center gap-3 text-xs text-[var(--text-secondary)]">
                <span>States: <strong className="text-[var(--text-primary)] font-mono">{definition.states.length}</strong></span>
                <span>Alphabet: <strong className="text-[var(--text-primary)] font-mono">{`{${definition.alphabet.join(', ')}}`}</strong></span>
                <span className="rounded bg-[var(--bg-dark)] px-2 py-0.5 border border-[var(--border-color)]">
                  Start: <strong className="text-[var(--accent)] font-mono">{definition.startState}</strong>
                </span>
              </div>
            </div>

            {/* Cytoscape Graph Canvas */}
            <div className="flex-1 relative w-full h-[380px] lg:h-full">
              <AutomatonGraph />
            </div>
          </div>

          {/* Input Tape & Read Head */}
          <InputTape />

          {/* Playback Controls & Result Banner */}
          {simulationResult && (
            <div className="flex flex-col gap-3">
              <div className="rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)] p-4 shadow-md">
                <SimulationControls />
              </div>
              <ResultBanner />
            </div>
          )}
        </section>

        {/* Right Column: String Input, Editor, Trace & Tree (5 cols) */}
        <section className="lg:col-span-5 flex flex-col gap-4">
          {/* String Input Card */}
          <div className="rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)] p-5 shadow-lg">
            <StringInput />
          </div>

          {/* Tabbed Panel */}
          <div className="flex-1 flex flex-col rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)] shadow-lg overflow-hidden">
            {/* Tab Headers */}
            <div className="flex border-b border-[var(--border-color)] bg-[var(--bg-dark)]/50 p-1.5 gap-1">
              <button
                onClick={() => setActiveTab('editor')}
                className={`flex-1 flex items-center justify-center gap-1.5 rounded-xl py-2 px-2 text-xs font-semibold transition-all ${
                  activeTab === 'editor'
                    ? 'bg-[var(--bg-card)] text-[var(--text-primary)] shadow border border-[var(--border-color)]'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                }`}
              >
                <Layers className="h-3.5 w-3.5 text-[var(--primary-light)]" />
                <span>Transition Table</span>
              </button>

              <button
                onClick={() => setActiveTab('trace')}
                className={`flex-1 flex items-center justify-center gap-1.5 rounded-xl py-2 px-2 text-xs font-semibold transition-all ${
                  activeTab === 'trace'
                    ? 'bg-[var(--bg-card)] text-[var(--text-primary)] shadow border border-[var(--border-color)]'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                }`}
              >
                <FileCode className="h-3.5 w-3.5 text-[var(--accent)]" />
                <span>Trace</span>
                {simulationResult && (
                  <span className="ml-0.5 rounded-full bg-[var(--primary)] px-1.5 py-0.2 text-[10px] text-white">
                    {simulationResult.steps.length}
                  </span>
                )}
              </button>

              <button
                onClick={() => setActiveTab('batch')}
                className={`flex-1 flex items-center justify-center gap-1.5 rounded-xl py-2 px-2 text-xs font-semibold transition-all ${
                  activeTab === 'batch'
                    ? 'bg-[var(--bg-card)] text-[var(--text-primary)] shadow border border-[var(--border-color)]'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                }`}
              >
                <ListChecks className="h-3.5 w-3.5 text-[var(--success)]" />
                <span>Batch Test</span>
              </button>
            </div>

            {/* Tab Content */}
            <div className="p-5 flex-1 overflow-y-auto max-h-[500px]">
              {activeTab === 'editor' ? (
                <TransitionTable />
              ) : activeTab === 'trace' ? (
                <TraceTable />
              ) : (
                <BatchTester />
              )}
            </div>
          </div>

          {/* Computation Tree for NFA */}
          {definition.type === 'NFA' && (
            <ComputationTree />
          )}

          {/* Formal Automaton Specification Card */}
          <div className="rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)]/60 p-4 text-xs text-[var(--text-secondary)]">
            <div className="flex items-center gap-2 font-semibold text-[var(--text-primary)] mb-2">
              <BookOpen className="h-3.5 w-3.5 text-[var(--primary-light)]" />
              Formal 5-Tuple Specification: M = (Q, Σ, δ, q₀, F)
            </div>
            <div className="grid grid-cols-2 gap-2 font-mono text-[11px]">
              <div><strong className="text-[var(--text-primary)]">Q</strong> = {`{${definition.states.join(', ')}}`}</div>
              <div><strong className="text-[var(--text-primary)]">Σ</strong> = {`{${definition.alphabet.join(', ')}}`}</div>
              <div><strong className="text-[var(--text-primary)]">q₀</strong> = {definition.startState}</div>
              <div><strong className="text-[var(--text-primary)]">F</strong> = {`{${definition.acceptStates.join(', ')}}`}</div>
            </div>
          </div>
        </section>
      </main>

      {/* JSON Import/Export Modal */}
      <JsonModal isOpen={isJsonModalOpen} onClose={() => setIsJsonModalOpen(false)} />

      {/* Footer */}
      <footer className="border-t border-[var(--border-color)] bg-[var(--bg-card)] px-6 py-2.5 text-center text-xs text-[var(--text-muted)]">
        CSET302 Automata Theory & Computability • Topic 7: DFA/NFA String Processing Visualizer • Milestone M1 & M2
      </footer>
    </div>
  );
}

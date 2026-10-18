import { Workflow, ChevronDown, Code } from 'lucide-react';
import { useStore } from '../../store/useStore';
import { PRESET_AUTOMATA } from '../../core/presets';
import { useState } from 'react';

interface HeaderProps {
  onOpenJsonModal?: () => void;
}

export function Header({ onOpenJsonModal }: HeaderProps) {
  const { definition, setAutomatonType, loadPreset } = useStore();
  const [presetOpen, setPresetOpen] = useState(false);

  return (
    <header className="border-b border-[var(--border-color)] bg-[var(--bg-card)] px-6 py-3">
      <div className="flex items-center justify-between">
        {/* Logo & Title */}
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--primary)]">
            <Workflow className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-[var(--text-primary)]">
              DFA/NFA String Processing Visualizer
            </h1>
            <p className="text-xs text-[var(--text-muted)]">
              CSET302 — Automata Theory & Computability
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {/* DFA ↔ NFA Toggle */}
          <div className="flex items-center gap-2 rounded-lg bg-[var(--bg-dark)] p-1">
            <button
              onClick={() => setAutomatonType('DFA')}
              className={`rounded-md px-4 py-1.5 text-sm font-semibold transition-all ${
                definition.type === 'DFA'
                  ? 'bg-[var(--primary)] text-white shadow-lg'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              DFA
            </button>
            <button
              onClick={() => setAutomatonType('NFA')}
              className={`rounded-md px-4 py-1.5 text-sm font-semibold transition-all ${
                definition.type === 'NFA'
                  ? 'bg-[var(--primary)] text-white shadow-lg'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              NFA
            </button>
          </div>

          {/* Preset Selector */}
          <div className="relative">
            <button
              onClick={() => setPresetOpen(!presetOpen)}
              className="flex items-center gap-2 rounded-lg border border-[var(--border-color)] bg-[var(--bg-dark)] px-4 py-2 text-sm text-[var(--text-secondary)] hover:border-[var(--primary)] hover:text-[var(--text-primary)] transition-all"
            >
              Load Example
              <ChevronDown className="h-4 w-4" />
            </button>

            {/* JSON Modal Trigger */}
            {onOpenJsonModal && (
              <button
                onClick={onOpenJsonModal}
                className="flex items-center gap-1.5 rounded-lg border border-[var(--border-color)] bg-[var(--bg-dark)] px-3 py-2 text-xs font-medium text-[var(--text-secondary)] hover:border-[var(--accent)] hover:text-[var(--text-primary)] transition-all ml-2"
                title="Import or Export Automaton JSON"
              >
                <Code className="h-3.5 w-3.5 text-[var(--accent)]" />
                <span>JSON</span>
              </button>
            )}
            {presetOpen && (
              <div className="absolute right-0 top-full z-50 mt-2 w-80 rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)] shadow-2xl">
                {PRESET_AUTOMATA.map((preset, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      loadPreset(i);
                      setPresetOpen(false);
                    }}
                    className="block w-full px-4 py-3 text-left hover:bg-[var(--bg-card-hover)] transition-colors first:rounded-t-xl last:rounded-b-xl"
                  >
                    <div className="text-sm font-medium text-[var(--text-primary)]">
                      {preset.name}
                    </div>
                    <div className="text-xs text-[var(--text-muted)] mt-0.5">
                      {preset.description}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

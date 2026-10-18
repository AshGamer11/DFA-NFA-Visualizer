import { Play, AlertCircle } from 'lucide-react';
import { useStore } from '../../store/useStore';
import { PRESET_AUTOMATA } from '../../core/presets';

export function StringInput() {
  const {
    inputString,
    setInputString,
    runSimulation,
    validationErrors,
    definition,
  } = useStore();

  // Find matching preset to show quick test buttons
  const matchingPreset = PRESET_AUTOMATA.find(
    (p) =>
      p.definition.type === definition.type &&
      p.definition.states.length === definition.states.length &&
      p.definition.startState === definition.startState
  );

  const errors = validationErrors.filter((e) => e.type === 'error');

  return (
    <div className="animate-slide-up">
      <h3 className="mb-2 text-sm font-semibold text-[var(--text-primary)]">
        Input String
      </h3>

      <div className="flex gap-2">
        <div className="relative flex-1">
          <input
            value={inputString}
            onChange={(e) => setInputString(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && runSimulation()}
            placeholder='Enter string (e.g. "aab") or leave empty for ε'
            className="w-full rounded-lg border border-[var(--border-color)] bg-[var(--bg-dark)] px-4 py-2.5 font-mono text-sm text-[var(--text-primary)] outline-none focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)] transition-all"
          />
          {inputString === '' && (
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[var(--text-muted)]">
              ε (empty)
            </span>
          )}
        </div>
        <button
          onClick={runSimulation}
          className="flex items-center gap-2 rounded-lg bg-[var(--primary)] px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-[var(--primary)]/25 hover:bg-[var(--primary-dark)] hover:shadow-[var(--primary)]/40 transition-all active:scale-95"
        >
          <Play className="h-4 w-4" fill="currentColor" />
          Simulate
        </button>
      </div>

      {/* Quick test strings */}
      {matchingPreset && (
        <div className="mt-2 flex flex-wrap gap-1.5">
          <span className="text-xs text-[var(--text-muted)] py-1">Quick tests:</span>
          {matchingPreset.testStrings.map((t, i) => (
            <button
              key={i}
              onClick={() => setInputString(t.input)}
              className={`rounded-md px-2.5 py-1 text-xs font-mono transition-all border ${
                inputString === t.input
                  ? 'border-[var(--primary)] bg-[var(--primary)]/10 text-[var(--primary-light)]'
                  : 'border-[var(--border-color)] text-[var(--text-secondary)] hover:border-[var(--text-muted)]'
              }`}
            >
              {t.input === '' ? 'ε' : `"${t.input}"`}
              <span
                className={`ml-1 ${t.expected ? 'text-[var(--success)]' : 'text-[var(--danger)]'}`}
              >
                {t.expected ? '✓' : '✗'}
              </span>
            </button>
          ))}
        </div>
      )}

      {/* Validation Errors */}
      {errors.length > 0 && (
        <div className="mt-2 space-y-1">
          {errors.map((err, i) => (
            <div
              key={i}
              className="flex items-start gap-2 rounded-lg bg-[var(--danger)]/10 border border-[var(--danger)]/20 px-3 py-2"
            >
              <AlertCircle className="h-4 w-4 text-[var(--danger)] mt-0.5 shrink-0" />
              <span className="text-xs text-[var(--danger)]">{err.message}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

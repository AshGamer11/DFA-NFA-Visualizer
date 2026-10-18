import { useStore } from '../../store/useStore';
import { ChevronDown } from 'lucide-react';

export function InputTape() {
  const { inputString, currentStepIndex, simulationResult } = useStore();

  const chars = inputString.length === 0 ? ['ε'] : inputString.split('');
  // Step 0 corresponds to start state before consuming symbols
  // Step i (1 <= i <= inputString.length) consumed symbol at i - 1
  // Currently active symbol being read is at currentStepIndex (when step < length)
  const isSimulationActive = simulationResult !== null && currentStepIndex >= 0;
  const isFinished = simulationResult !== null && currentStepIndex >= simulationResult.steps.length - 1;

  return (
    <div className="rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)] p-4 shadow-sm animate-slide-up">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">
            Input Tape
          </span>
          {inputString.length === 0 && (
            <span className="text-xs text-[var(--text-muted)] italic">(Empty String / ε)</span>
          )}
        </div>
        <div className="text-xs text-[var(--text-secondary)] font-mono">
          Head Position: <span className="text-[var(--primary-light)] font-bold">{Math.max(0, currentStepIndex)}</span>
          {simulationResult ? ` / ${simulationResult.steps.length - 1}` : ''}
        </div>
      </div>

      {/* Tape track */}
      <div className="relative overflow-x-auto py-3">
        <div className="flex items-center gap-1.5 min-w-max pb-1">
          {/* Start delimiter */}
          <div className="flex h-11 w-8 items-center justify-center rounded-md border border-dashed border-[var(--border-color)] bg-[var(--bg-dark)]/50 font-mono text-xs text-[var(--text-muted)]">
            ⊢
          </div>

          {chars.map((char, idx) => {
            // In simulation:
            // currentStepIndex == 0: pointing to first symbol idx 0
            // currentStepIndex == idx + 1: currently processed symbol idx
            // currentStepIndex > idx + 1: already consumed
            // currentStepIndex < idx + 1: upcoming
            const isProcessed = isSimulationActive && currentStepIndex > idx + 1;
            const isCurrent = isSimulationActive && (
              currentStepIndex === 0 ? idx === 0 : currentStepIndex === idx + 1
            );

            return (
              <div key={idx} className="relative flex flex-col items-center">
                {/* Pointer Arrow */}
                {isSimulationActive && isCurrent && !isFinished && (
                  <div className="absolute -top-3 text-[var(--accent)] animate-bounce">
                    <ChevronDown className="h-4 w-4" />
                  </div>
                )}

                <div
                  className={`flex h-11 w-11 items-center justify-center rounded-lg border-2 font-mono text-base font-bold transition-all ${
                    isCurrent && isSimulationActive
                      ? 'border-[var(--accent)] bg-[var(--accent)]/20 text-[var(--text-primary)] shadow-lg shadow-[var(--accent)]/20 scale-105'
                      : isProcessed
                        ? 'border-[var(--border-color)] bg-[var(--bg-dark)]/70 text-[var(--text-muted)] line-through'
                        : 'border-[var(--border-color)] bg-[var(--bg-dark)] text-[var(--text-primary)]'
                  }`}
                >
                  {char}
                </div>

                {/* Index label */}
                <span className="mt-1 text-[10px] font-mono text-[var(--text-muted)]">
                  {idx}
                </span>
              </div>
            );
          })}

          {/* End marker */}
          <div className="flex h-11 w-8 items-center justify-center rounded-md border border-dashed border-[var(--border-color)] bg-[var(--bg-dark)]/50 font-mono text-xs text-[var(--text-muted)]">
            ⊣
          </div>
        </div>
      </div>
    </div>
  );
}

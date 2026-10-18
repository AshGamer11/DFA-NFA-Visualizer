import { useEffect, useRef } from 'react';
import { useStore } from '../../store/useStore';

export function TraceTable() {
  const { simulationResult, currentStepIndex } = useStore();
  const activeRowRef = useRef<HTMLTableRowElement>(null);

  // Auto-scroll to current step
  useEffect(() => {
    if (activeRowRef.current) {
      activeRowRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
      });
    }
  }, [currentStepIndex]);

  if (!simulationResult) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-[var(--text-muted)]">
        <p className="text-sm">Run a simulation to see the computation trace</p>
      </div>
    );
  }

  return (
    <div className="animate-slide-up">
      <h3 className="mb-3 text-sm font-semibold text-[var(--text-primary)]">
        Computation Trace
      </h3>
      <div className="max-h-64 overflow-y-auto rounded-lg border border-[var(--border-color)]">
        <table className="w-full text-xs">
          <thead className="sticky top-0 z-10">
            <tr className="bg-[var(--bg-dark)]">
              <th className="px-3 py-2 text-left font-medium text-[var(--text-muted)] uppercase">
                Step
              </th>
              <th className="px-3 py-2 text-left font-medium text-[var(--text-muted)] uppercase">
                Current State(s)
              </th>
              <th className="px-3 py-2 text-center font-medium text-[var(--text-muted)] uppercase">
                Read
              </th>
              <th className="px-3 py-2 text-left font-medium text-[var(--text-muted)] uppercase">
                Next State(s)
              </th>
            </tr>
          </thead>
          <tbody>
            {simulationResult.steps.map((step, i) => {
              const isCurrent = i === currentStepIndex;
              const isPast = i < currentStepIndex;

              return (
                <tr
                  key={i}
                  ref={isCurrent ? activeRowRef : undefined}
                  className={`border-t border-[var(--border-color)] transition-all ${
                    isCurrent
                      ? 'bg-[var(--primary)]/15 border-l-2 border-l-[var(--primary)]'
                      : isPast
                        ? 'opacity-60'
                        : 'opacity-40'
                  }`}
                >
                  <td className="px-3 py-2 font-mono">
                    <span
                      className={`inline-flex h-5 w-5 items-center justify-center rounded-full text-[10px] ${
                        isCurrent
                          ? 'bg-[var(--primary)] text-white'
                          : 'bg-[var(--bg-dark)] text-[var(--text-muted)]'
                      }`}
                    >
                      {step.stepNumber}
                    </span>
                  </td>
                  <td className="px-3 py-2 font-mono">
                    <span className="text-[var(--text-primary)]">
                      {step.currentStates.length > 0
                        ? `{${step.currentStates.join(', ')}}`
                        : '∅'}
                    </span>
                  </td>
                  <td className="px-3 py-2 text-center">
                    {step.symbolRead !== null ? (
                      <span className="inline-flex h-6 w-6 items-center justify-center rounded bg-[var(--accent)]/20 font-mono font-semibold text-[var(--accent)]">
                        {step.symbolRead}
                      </span>
                    ) : (
                      <span className="text-[var(--text-muted)]">—</span>
                    )}
                  </td>
                  <td className="px-3 py-2 font-mono">
                    <span
                      className={
                        step.isAccepting
                          ? 'text-[var(--success)] font-semibold'
                          : step.nextStates.length === 0
                            ? 'text-[var(--danger)]'
                            : 'text-[var(--text-primary)]'
                      }
                    >
                      {step.nextStates.length > 0
                        ? `{${step.nextStates.join(', ')}}`
                        : '∅ (dead)'}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

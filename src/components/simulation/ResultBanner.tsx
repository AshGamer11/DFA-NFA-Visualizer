import { useStore } from '../../store/useStore';
import { CheckCircle2, XCircle } from 'lucide-react';

export function ResultBanner() {
  const { simulationResult, currentStepIndex } = useStore();

  if (!simulationResult) return null;

  const isComplete =
    currentStepIndex >= simulationResult.steps.length - 1;

  if (!isComplete) return null;

  const { accepted, path } = simulationResult;

  // Build path string from the first (or only) computation path
  const pathStr = path[0]
    ?.map((state, i) => {
      const step = simulationResult.steps[i + 1];
      const symbol = step?.symbolRead;
      if (i === 0) return state;
      return symbol ? ` →${symbol}→ ${state}` : ` → ${state}`;
    })
    .join('');

  return (
    <div
      className={`animate-slide-up rounded-xl border-2 p-4 ${
        accepted
          ? 'border-[var(--success)]/30 bg-[var(--success)]/5'
          : 'border-[var(--danger)]/30 bg-[var(--danger)]/5'
      }`}
    >
      <div className="flex items-center gap-3">
        {accepted ? (
          <CheckCircle2 className="h-8 w-8 text-[var(--success)]" />
        ) : (
          <XCircle className="h-8 w-8 text-[var(--danger)]" />
        )}
        <div>
          <h3
            className={`text-lg font-bold ${
              accepted ? 'text-[var(--success)]' : 'text-[var(--danger)]'
            }`}
          >
            {accepted ? '✅ ACCEPTED' : '❌ REJECTED'}
          </h3>
          <p className="text-xs text-[var(--text-secondary)] mt-1">
            String{' '}
            {accepted
              ? 'is accepted by the automaton'
              : 'is not accepted — final state is not an accept state'}
          </p>
        </div>
      </div>

      {/* Computation Path */}
      {pathStr && (
        <div className="mt-3 rounded-lg bg-[var(--bg-dark)] p-3">
          <span className="text-xs font-medium text-[var(--text-muted)]">
            Computation Path:
          </span>
          <div className="mt-1 font-mono text-xs text-[var(--text-primary)] break-all leading-relaxed">
            {pathStr}
          </div>
        </div>
      )}
    </div>
  );
}

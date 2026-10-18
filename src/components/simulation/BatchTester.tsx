import { useState } from 'react';
import { useStore } from '../../store/useStore';
import { Play, Sparkles, CheckCircle2, XCircle, ArrowRight, AlertTriangle } from 'lucide-react';
import { PRESET_AUTOMATA } from '../../core/presets';

export function BatchTester() {
  const { definition, batchTestResults, runBatchTests, setInputString, runSimulation } = useStore();
  const [inputLines, setInputLines] = useState<string>('ab\naab\nba\nabb\n');

  const matchingPreset = PRESET_AUTOMATA.find(
    (p) =>
      p.definition.type === definition.type &&
      p.definition.startState === definition.startState &&
      p.definition.states.length === definition.states.length
  );

  const handleLoadPresetCases = () => {
    if (matchingPreset && matchingPreset.testStrings.length > 0) {
      setInputLines(matchingPreset.testStrings.map((t) => t.input).join('\n'));
    } else {
      setInputLines(['a', 'b', 'ab', 'ba', 'aab', 'abb', 'bba', ''].join('\n'));
    }
  };

  const handleRunBatch = () => {
    const cleaned = inputLines.split('\n').map((s) => s.trim());
    runBatchTests(cleaned);
  };

  const handleTraceString = (str: string) => {
    setInputString(str);
    runSimulation();
  };

  const acceptedCount = batchTestResults?.filter((r) => r.accepted).length ?? 0;
  const rejectedCount = (batchTestResults?.length ?? 0) - acceptedCount;

  return (
    <div className="flex flex-col gap-4 animate-fade-in">
      {/* Header & Controls */}
      <div className="flex flex-col gap-2">
        <label className="text-xs font-semibold text-[var(--text-secondary)]">
          Input Strings to Test (One per line, empty line = ε):
        </label>
        <textarea
          value={inputLines}
          onChange={(e) => setInputLines(e.target.value)}
          rows={3}
          placeholder="e.g.&#10;ab&#10;aab&#10;ba"
          className="w-full rounded-xl border border-[var(--border-color)] bg-[var(--bg-dark)] px-3 py-2 font-mono text-xs text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
        />

        <div className="flex items-center gap-2 mt-1">
          <button
            onClick={handleRunBatch}
            className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[var(--primary)] to-[var(--accent)] py-2 px-3 text-xs font-semibold text-white shadow-md shadow-[var(--primary)]/20 transition-all hover:brightness-110 active:scale-95"
          >
            <Play className="h-3.5 w-3.5 fill-current" />
            Evaluate Batch
          </button>
          <button
            onClick={handleLoadPresetCases}
            className="flex items-center gap-1.5 rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)] py-2 px-3 text-xs font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--primary-light)] transition-all"
            title="Load preset test strings"
          >
            <Sparkles className="h-3.5 w-3.5 text-[var(--accent)]" />
            Load Presets
          </button>
        </div>
      </div>

      {/* Results Summary */}
      {batchTestResults && (
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between rounded-xl bg-[var(--bg-dark)] p-3 border border-[var(--border-color)]">
            <span className="text-xs text-[var(--text-secondary)] font-medium">
              Total Tested: <strong>{batchTestResults.length}</strong>
            </span>
            <div className="flex items-center gap-3 text-xs">
              <span className="flex items-center gap-1 text-[var(--success)] font-semibold">
                <CheckCircle2 className="h-3.5 w-3.5" /> {acceptedCount} Accepted
              </span>
              <span className="flex items-center gap-1 text-[var(--danger)] font-semibold">
                <XCircle className="h-3.5 w-3.5" /> {rejectedCount} Rejected
              </span>
            </div>
          </div>

          {/* Results Table */}
          <div className="rounded-xl border border-[var(--border-color)] overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-[var(--bg-dark)]/80 text-[var(--text-muted)] uppercase tracking-wider font-semibold border-b border-[var(--border-color)]">
                <tr>
                  <th className="py-2.5 px-3">String</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3">Steps</th>
                  <th className="py-2.5 px-3">Witness Path</th>
                  <th className="py-2.5 px-3 text-right">Trace</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-color)] bg-[var(--bg-card)]">
                {batchTestResults.map((res, i) => (
                  <tr key={i} className="hover:bg-[var(--bg-dark)]/40 transition-colors">
                    <td className="py-2 px-3 font-mono font-bold text-[var(--text-primary)]">
                      {res.input === '' ? (
                        <span className="rounded bg-[var(--bg-dark)] px-1.5 py-0.5 text-[var(--text-muted)] italic font-normal">
                          ε (empty)
                        </span>
                      ) : (
                        `"${res.input}"`
                      )}
                    </td>
                    <td className="py-2 px-3">
                      {res.error ? (
                        <span className="inline-flex items-center gap-1 rounded-md bg-[var(--danger)]/15 px-2 py-0.5 text-[11px] font-semibold text-[var(--danger)]">
                          <AlertTriangle className="h-3 w-3" /> Error
                        </span>
                      ) : res.accepted ? (
                        <span className="inline-flex items-center gap-1 rounded-md bg-[var(--success)]/15 px-2 py-0.5 text-[11px] font-semibold text-[var(--success)]">
                          <CheckCircle2 className="h-3 w-3" /> Accepted
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-md bg-[var(--danger)]/15 px-2 py-0.5 text-[11px] font-semibold text-[var(--danger)]">
                          <XCircle className="h-3 w-3" /> Rejected
                        </span>
                      )}
                    </td>
                    <td className="py-2 px-3 font-mono text-[var(--text-secondary)]">
                      {res.stepsCount}
                    </td>
                    <td className="py-2 px-3 font-mono text-[11px] text-[var(--text-secondary)] max-w-[180px] truncate" title={res.path}>
                      {res.error ? res.error : res.path || '—'}
                    </td>
                    <td className="py-2 px-3 text-right">
                      <button
                        onClick={() => handleTraceString(res.input)}
                        className="inline-flex items-center gap-1 text-[11px] font-medium text-[var(--accent)] hover:text-[var(--primary-light)] hover:underline"
                        title="Simulate step-by-step in visualizer"
                      >
                        Visual Trace <ArrowRight className="h-3 w-3" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

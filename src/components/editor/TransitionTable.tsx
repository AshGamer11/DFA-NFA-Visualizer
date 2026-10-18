import { useState } from 'react';
import { Plus, Trash2, Star, ArrowRight } from 'lucide-react';
import { useStore } from '../../store/useStore';
import { EPSILON, transitionKey } from '../../core/types';

export function TransitionTable() {
  const {
    definition,
    addState,
    removeState,
    toggleAcceptState,
    setStartState,
    setTransition,
    addAlphabetSymbol,
    removeAlphabetSymbol,
  } = useStore();

  const [newStateName, setNewStateName] = useState('');
  const [newSymbol, setNewSymbol] = useState('');
  const [editingCell, setEditingCell] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');

  const symbols = definition.type === 'NFA'
    ? [...definition.alphabet, EPSILON]
    : definition.alphabet;

  const handleAddState = () => {
    const name = newStateName.trim();
    if (name) {
      addState(name);
      setNewStateName('');
    }
  };

  const handleAddSymbol = () => {
    const sym = newSymbol.trim();
    if (sym && sym.length === 1 && sym !== EPSILON) {
      addAlphabetSymbol(sym);
      setNewSymbol('');
    }
  };

  const handleCellClick = (state: string, symbol: string) => {
    const key = transitionKey(state, symbol);
    const current = definition.transitions.get(key) || [];
    setEditingCell(key);
    setEditValue(current.join(', '));
  };

  const handleCellSave = (state: string, symbol: string) => {
    const targets = editValue
      .split(',')
      .map((s) => s.trim())
      .filter((s) => s.length > 0);
    setTransition(state, symbol, targets);
    setEditingCell(null);
  };

  return (
    <div className="animate-slide-up">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-[var(--text-primary)]">
          Transition Table (δ)
        </h3>
        <span className="rounded-full bg-[var(--primary)]/20 px-2 py-0.5 text-xs text-[var(--primary-light)]">
          {definition.type}
        </span>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-lg border border-[var(--border-color)]">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-[var(--bg-dark)]">
              <th className="px-3 py-2 text-left text-xs font-medium text-[var(--text-muted)] uppercase">
                δ
              </th>
              {symbols.map((sym) => (
                <th
                  key={sym}
                  className="px-3 py-2 text-center text-xs font-medium text-[var(--text-muted)] uppercase"
                >
                  <div className="flex items-center justify-center gap-1">
                    {sym}
                    {sym !== EPSILON && (
                      <button
                        onClick={() => removeAlphabetSymbol(sym)}
                        className="text-[var(--text-muted)] hover:text-[var(--danger)] opacity-0 group-hover:opacity-100 transition-opacity"
                        title={`Remove symbol ${sym}`}
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {definition.states.map((state) => (
              <tr
                key={state}
                className="border-t border-[var(--border-color)] hover:bg-[var(--bg-card-hover)] transition-colors group"
              >
                <td className="px-3 py-2">
                  <div className="flex items-center gap-2">
                    {/* Start state indicator */}
                    <button
                      onClick={() => setStartState(state)}
                      className={`transition-colors ${
                        definition.startState === state
                          ? 'text-[var(--accent)]'
                          : 'text-[var(--text-muted)] hover:text-[var(--accent)]'
                      }`}
                      title="Set as start state"
                    >
                      <ArrowRight className="h-3.5 w-3.5" />
                    </button>

                    {/* Accept state toggle */}
                    <button
                      onClick={() => toggleAcceptState(state)}
                      className={`transition-colors ${
                        definition.acceptStates.includes(state)
                          ? 'text-[var(--warning)]'
                          : 'text-[var(--text-muted)] hover:text-[var(--warning)]'
                      }`}
                      title="Toggle accept state"
                    >
                      <Star
                        className="h-3.5 w-3.5"
                        fill={
                          definition.acceptStates.includes(state)
                            ? 'currentColor'
                            : 'none'
                        }
                      />
                    </button>

                    <span className="font-mono font-medium text-[var(--text-primary)]">
                      {definition.startState === state && '→ '}
                      {definition.acceptStates.includes(state) && '*'}
                      {state}
                    </span>

                    <button
                      onClick={() => removeState(state)}
                      className="ml-auto text-[var(--text-muted)] hover:text-[var(--danger)] opacity-0 group-hover:opacity-100 transition-all"
                      title="Remove state"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </td>

                {symbols.map((sym) => {
                  const key = transitionKey(state, sym);
                  const targets = definition.transitions.get(key) || [];
                  const isEditing = editingCell === key;

                  return (
                    <td key={sym} className="px-3 py-2 text-center">
                      {isEditing ? (
                        <input
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          onBlur={() => handleCellSave(state, sym)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleCellSave(state, sym);
                            if (e.key === 'Escape') setEditingCell(null);
                          }}
                          autoFocus
                          className="w-full rounded border border-[var(--primary)] bg-[var(--bg-dark)] px-2 py-1 text-center text-xs text-[var(--text-primary)] outline-none"
                          placeholder="q0, q1"
                        />
                      ) : (
                        <button
                          onClick={() => handleCellClick(state, sym)}
                          className="w-full rounded px-2 py-1 text-xs font-mono hover:bg-[var(--bg-dark)] transition-colors min-h-[28px]"
                        >
                          {targets.length > 0 ? (
                            <span className="text-[var(--text-primary)]">
                              {definition.type === 'DFA'
                                ? targets[0]
                                : `{${targets.join(', ')}}`}
                            </span>
                          ) : (
                            <span className="text-[var(--text-muted)]">—</span>
                          )}
                        </button>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add State / Symbol */}
      <div className="mt-3 flex gap-2">
        <div className="flex flex-1 gap-1">
          <input
            value={newStateName}
            onChange={(e) => setNewStateName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAddState()}
            placeholder="New state (e.g. q3)"
            className="flex-1 rounded-lg border border-[var(--border-color)] bg-[var(--bg-dark)] px-3 py-1.5 text-xs text-[var(--text-primary)] outline-none focus:border-[var(--primary)] transition-colors"
          />
          <button
            onClick={handleAddState}
            className="rounded-lg bg-[var(--primary)] px-3 py-1.5 text-xs font-medium text-white hover:bg-[var(--primary-dark)] transition-colors"
          >
            <Plus className="h-3.5 w-3.5" />
          </button>
        </div>
        <div className="flex gap-1">
          <input
            value={newSymbol}
            onChange={(e) => setNewSymbol(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAddSymbol()}
            placeholder="Symbol"
            maxLength={1}
            className="w-16 rounded-lg border border-[var(--border-color)] bg-[var(--bg-dark)] px-3 py-1.5 text-xs text-center text-[var(--text-primary)] outline-none focus:border-[var(--primary)] transition-colors"
          />
          <button
            onClick={handleAddSymbol}
            className="rounded-lg bg-[var(--accent)] px-3 py-1.5 text-xs font-medium text-white hover:opacity-90 transition-colors"
          >
            <Plus className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      <p className="mt-2 text-xs text-[var(--text-muted)]">
        Click any cell to edit transitions. For NFA, enter comma-separated states (e.g. q0, q1).
      </p>
    </div>
  );
}

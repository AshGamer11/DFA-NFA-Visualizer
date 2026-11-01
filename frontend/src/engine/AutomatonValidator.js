import { AUTOMATON_TYPES, EPSILON, EPSILON_VARIANTS } from '../utils/constants';

/**
 * Checks if a symbol represents an epsilon (empty string) transition.
 */
export const isEpsilon = (symbol) => {
  if (!symbol) return false;
  return EPSILON_VARIANTS.includes(symbol.trim());
};

/**
 * Normalizes an epsilon symbol to the canonical 'ε'.
 */
export const normalizeSymbol = (symbol) => {
  if (isEpsilon(symbol)) return EPSILON;
  return symbol.trim();
};

/**
 * Validates an automaton definition.
 * Returns { isValid: boolean, errors: string[], warnings: string[] }
 */
export const validateAutomaton = (automaton) => {
  const errors = [];
  const warnings = [];

  if (!automaton) {
    return { isValid: false, errors: ['Automaton object is missing.'], warnings: [] };
  }

  const { type, states, alphabet, startState, acceptStates, transitions } = automaton;

  // 1. Automaton type
  if (![AUTOMATON_TYPES.DFA, AUTOMATON_TYPES.NFA, AUTOMATON_TYPES.ENFA].includes(type)) {
    errors.push(`Invalid automaton type "${type}". Must be DFA, NFA, or ε-NFA.`);
  }

  // 2. States validation
  if (!Array.isArray(states) || states.length === 0) {
    errors.push('Automaton must have at least one state.');
  } else {
    const stateSet = new Set(states);
    if (stateSet.size !== states.length) {
      errors.push('State names must be unique.');
    }
    states.forEach((s) => {
      if (!s || typeof s !== 'string' || s.trim().length === 0) {
        errors.push('All state names must be non-empty strings.');
      }
    });
  }

  const validStates = new Set(states || []);

  // 3. Start state validation
  if (!startState || typeof startState !== 'string') {
    errors.push('A valid start state must be specified.');
  } else if (!validStates.has(startState)) {
    errors.push(`Start state "${startState}" is not in the states set.`);
  }

  // 4. Accept states validation
  if (!Array.isArray(acceptStates)) {
    errors.push('Accept states must be an array.');
  } else {
    acceptStates.forEach((acc) => {
      if (!validStates.has(acc)) {
        errors.push(`Accept state "${acc}" is not defined in the states set.`);
      }
    });
    if (acceptStates.length === 0) {
      warnings.push('No accept states defined. The automaton will reject all inputs.');
    }
  }

  // 5. Alphabet validation
  if (!Array.isArray(alphabet) || alphabet.length === 0) {
    errors.push('Alphabet must contain at least one symbol.');
  } else {
    const alphabetSet = new Set();
    alphabet.forEach((sym) => {
      if (!sym || typeof sym !== 'string') {
        errors.push('Alphabet symbols must be non-empty strings.');
      } else if (isEpsilon(sym)) {
        errors.push(`Epsilon (${sym}) cannot be an alphabet symbol. It is reserved for NFA transitions.`);
      } else {
        if (alphabetSet.has(sym)) {
          errors.push(`Duplicate symbol "${sym}" in alphabet.`);
        }
        alphabetSet.add(sym);
      }
    });
  }

  const validAlphabet = new Set(alphabet || []);

  // 6. Transitions validation
  if (!Array.isArray(transitions)) {
    errors.push('Transitions must be an array.');
  } else {
    const dfaTransitionMap = new Map();

    transitions.forEach((t, idx) => {
      const { from, symbol, to } = t;
      const normSym = normalizeSymbol(symbol);

      if (!validStates.has(from)) {
        errors.push(`Transition #${idx + 1}: "from" state "${from}" is not in states.`);
      }

      if (!validStates.has(to)) {
        errors.push(`Transition #${idx + 1}: "to" state "${to}" is not in states.`);
      }

      const symIsEps = isEpsilon(symbol);

      if (type === AUTOMATON_TYPES.DFA) {
        if (symIsEps) {
          errors.push(`Transition #${idx + 1}: DFA cannot have epsilon (${symbol}) transitions.`);
        } else if (!validAlphabet.has(symbol)) {
          errors.push(`Transition #${idx + 1}: Symbol "${symbol}" is not in alphabet.`);
        }

        // DFA Determinism check: only one transition for (from, symbol)
        const key = `${from}::${symbol}`;
        if (dfaTransitionMap.has(key)) {
          const existingTo = dfaTransitionMap.get(key);
          if (existingTo !== to) {
            errors.push(
              `DFA Non-Determinism: State "${from}" already has a transition on "${symbol}" to "${existingTo}". Cannot also transition to "${to}".`
            );
          }
        } else {
          dfaTransitionMap.set(key, to);
        }
      } else if (type === AUTOMATON_TYPES.NFA) {
        // NFA without ε-moves: No epsilon transitions allowed
        if (symIsEps) {
          errors.push(
            `Transition #${idx + 1}: NFA (without ε-moves) cannot have epsilon (${symbol}) transitions. Switch to ε-NFA mode to allow epsilon transitions.`
          );
        } else if (!validAlphabet.has(symbol)) {
          errors.push(`Transition #${idx + 1}: Symbol "${symbol}" is not in alphabet.`);
        }
      } else {
        // ε-NFA (with ε-moves allowed)
        if (!symIsEps && !validAlphabet.has(symbol)) {
          errors.push(`Transition #${idx + 1}: Symbol "${symbol}" is not in alphabet or epsilon.`);
        }
      }
    });

    // DFA Completeness check (Warning)
    if (type === AUTOMATON_TYPES.DFA && errors.length === 0) {
      states.forEach((state) => {
        alphabet.forEach((sym) => {
          const key = `${state}::${sym}`;
          if (!dfaTransitionMap.has(key)) {
            warnings.push(`DFA is incomplete: δ(${state}, '${sym}') is undefined (implicit trap/reject).`);
          }
        });
      });
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
};

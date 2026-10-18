/**
 * Validates an automaton definition for correctness and completeness.
 */
import {
  type AutomatonDefinition,
  type ValidationError,
  EPSILON,
  parseTransitionKey,
  transitionKey,
} from './types';

/**
 * Validates the given automaton definition and returns any errors or warnings.
 * @param def - The automaton definition to validate
 * @returns Array of validation errors/warnings (empty = valid)
 */
export function validateAutomaton(def: AutomatonDefinition): ValidationError[] {
  const errors: ValidationError[] = [];

  // Check states is non-empty
  if (def.states.length === 0) {
    errors.push({ type: 'error', message: 'Automaton must have at least one state.' });
  }

  // Check alphabet is non-empty
  if (def.alphabet.length === 0) {
    errors.push({ type: 'error', message: 'Alphabet must contain at least one symbol.' });
  }

  // Check start state is in states
  if (!def.states.includes(def.startState)) {
    errors.push({
      type: 'error',
      message: `Start state "${def.startState}" is not in the set of states.`,
    });
  }

  // Check all accept states are in states
  for (const acceptState of def.acceptStates) {
    if (!def.states.includes(acceptState)) {
      errors.push({
        type: 'error',
        message: `Accept state "${acceptState}" is not in the set of states.`,
      });
    }
  }

  // Check all transitions reference valid states and symbols
  for (const [key, targets] of def.transitions.entries()) {
    const [fromState, symbol] = parseTransitionKey(key);

    // Check source state is valid
    if (!def.states.includes(fromState)) {
      errors.push({
        type: 'error',
        message: `Transition from unknown state "${fromState}" on symbol "${symbol}".`,
      });
    }

    // Check symbol is valid (must be in alphabet or ε for NFA)
    if (symbol !== EPSILON && !def.alphabet.includes(symbol)) {
      errors.push({
        type: 'error',
        message: `Transition from "${fromState}" uses unknown symbol "${symbol}".`,
      });
    }

    // Check ε-transitions only in NFA
    if (symbol === EPSILON && def.type === 'DFA') {
      errors.push({
        type: 'error',
        message: `DFA cannot have ε-transitions (found on state "${fromState}").`,
      });
    }

    // Check target states are valid
    for (const target of targets) {
      if (!def.states.includes(target)) {
        errors.push({
          type: 'error',
          message: `Transition δ(${fromState}, ${symbol}) references unknown state "${target}".`,
        });
      }
    }

    // For DFA, each transition should have exactly one target
    if (def.type === 'DFA' && symbol !== EPSILON && targets.length > 1) {
      errors.push({
        type: 'error',
        message: `DFA transition δ(${fromState}, ${symbol}) has ${targets.length} targets (must have exactly 1).`,
      });
    }
  }

  // For DFA, check completeness: every state × symbol pair should have a transition
  if (def.type === 'DFA') {
    for (const state of def.states) {
      for (const symbol of def.alphabet) {
        const key = transitionKey(state, symbol);
        const targets = def.transitions.get(key);
        if (!targets || targets.length === 0) {
          errors.push({
            type: 'warning',
            message: `DFA is incomplete: no transition defined for δ(${state}, ${symbol}).`,
          });
        }
      }
    }
  }

  // Check for accept states warning
  if (def.acceptStates.length === 0) {
    errors.push({
      type: 'warning',
      message: 'No accept states defined — no string will be accepted.',
    });
  }

  return errors;
}

/**
 * Check if an automaton definition has any blocking errors (not just warnings).
 */
export function hasErrors(errors: ValidationError[]): boolean {
  return errors.some((e) => e.type === 'error');
}

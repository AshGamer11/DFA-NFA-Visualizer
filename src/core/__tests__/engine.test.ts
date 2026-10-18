import { describe, it, expect } from 'vitest';
import { simulateDFA } from '../dfa-simulator';
import { simulateNFA, buildComputationTree } from '../nfa-simulator';
import { computeEpsilonClosure } from '../epsilon-closure';
import { validateAutomaton } from '../validator';
import { PRESET_AUTOMATA } from '../presets';
import { transitionKey, EPSILON, type AutomatonDefinition } from '../types';

describe('DFA Simulator', () => {
  const dfaEndsInAb = PRESET_AUTOMATA[0].definition;

  it('accepts string "ab"', () => {
    const result = simulateDFA(dfaEndsInAb, 'ab');
    expect(result.accepted).toBe(true);
    expect(result.steps.length).toBe(3); // step 0, 1, 2
    expect(result.steps[2].nextStates).toEqual(['q2']);
  });

  it('accepts string "aab"', () => {
    const result = simulateDFA(dfaEndsInAb, 'aab');
    expect(result.accepted).toBe(true);
  });

  it('rejects string "ba"', () => {
    const result = simulateDFA(dfaEndsInAb, 'ba');
    expect(result.accepted).toBe(false);
  });

  it('rejects empty string when start state is not an accept state', () => {
    const result = simulateDFA(dfaEndsInAb, '');
    expect(result.accepted).toBe(false);
  });

  it('throws error on symbol not in alphabet', () => {
    expect(() => simulateDFA(dfaEndsInAb, 'abc')).toThrow(/Invalid symbol/);
  });

  // Manually validated example from Project Plan:
  // Substring "abb" on "aabb"
  const dfaContainsAbb = PRESET_AUTOMATA[2].definition;
  it('correctly simulates manually solved example "aabb" on DFA for substring "abb"', () => {
    const result = simulateDFA(dfaContainsAbb, 'aabb');
    expect(result.accepted).toBe(true);
    expect(result.path[0]).toEqual(['q0', 'q1', 'q1', 'q2', 'q3']);
  });
});

describe('Epsilon-Closure', () => {
  it('computes basic epsilon closure correctly', () => {
    const transitions = new Map<string, string[]>([
      [transitionKey('q0', EPSILON), ['q1']],
      [transitionKey('q1', EPSILON), ['q2']],
    ]);
    const closure = computeEpsilonClosure(['q0'], transitions);
    expect(closure).toEqual(['q0', 'q1', 'q2']);
  });

  it('handles cyclic epsilon transitions without infinite loops', () => {
    const transitions = new Map<string, string[]>([
      [transitionKey('q0', EPSILON), ['q1']],
      [transitionKey('q1', EPSILON), ['q0']],
    ]);
    const closure = computeEpsilonClosure(['q0'], transitions);
    expect(closure).toEqual(['q0', 'q1']);
  });
});

describe('NFA Simulator', () => {
  const nfaEndsInAb = PRESET_AUTOMATA[3].definition;

  it('accepts "ab" via nondeterministic branching', () => {
    const result = simulateNFA(nfaEndsInAb, 'ab');
    expect(result.accepted).toBe(true);
  });

  it('accepts "aab"', () => {
    const result = simulateNFA(nfaEndsInAb, 'aab');
    expect(result.accepted).toBe(true);
  });

  it('rejects "ba"', () => {
    const result = simulateNFA(nfaEndsInAb, 'ba');
    expect(result.accepted).toBe(false);
  });

  it('simulates epsilon-NFA properly for a*b*c*', () => {
    const epsNfa = PRESET_AUTOMATA[5].definition;
    expect(simulateNFA(epsNfa, '').accepted).toBe(true);
    expect(simulateNFA(epsNfa, 'abc').accepted).toBe(true);
    expect(simulateNFA(epsNfa, 'aaa').accepted).toBe(true);
    expect(simulateNFA(epsNfa, 'ba').accepted).toBe(false);
  });

  it('builds computation tree properly', () => {
    const tree = buildComputationTree(nfaEndsInAb, 'ab');
    expect(tree.state).toBe('q0');
    expect(tree.children.length).toBeGreaterThan(0);
  });
});

describe('Automaton Validator', () => {
  it('reports error when start state is not in Q', () => {
    const invalidDef: AutomatonDefinition = {
      type: 'DFA',
      states: ['q0', 'q1'],
      alphabet: ['a', 'b'],
      transitions: new Map(),
      startState: 'q99',
      acceptStates: ['q1'],
    };
    const errors = validateAutomaton(invalidDef);
    expect(errors.some((e) => e.message.includes('q99'))).toBe(true);
  });

  it('reports warning for incomplete DFA', () => {
    const incompleteDFA: AutomatonDefinition = {
      type: 'DFA',
      states: ['q0'],
      alphabet: ['a', 'b'],
      transitions: new Map([[transitionKey('q0', 'a'), ['q0']]]),
      startState: 'q0',
      acceptStates: ['q0'],
    };
    const errors = validateAutomaton(incompleteDFA);
    expect(errors.some((e) => e.type === 'warning' && e.message.includes('incomplete'))).toBe(true);
  });
});

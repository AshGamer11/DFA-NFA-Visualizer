/**
 * Preset automata for demonstration and testing.
 * Each preset includes a definition and test strings with expected results.
 */
import { type PresetAutomaton, transitionKey, EPSILON } from './types';

export const PRESET_AUTOMATA: PresetAutomaton[] = [
  // ─── DFA Presets ──────────────────────────────────────────────
  {
    name: 'DFA: Strings ending in "ab"',
    description: 'Accepts all strings over {a,b} that end with the substring "ab".',
    definition: {
      type: 'DFA',
      states: ['q0', 'q1', 'q2'],
      alphabet: ['a', 'b'],
      transitions: new Map([
        [transitionKey('q0', 'a'), ['q1']],
        [transitionKey('q0', 'b'), ['q0']],
        [transitionKey('q1', 'a'), ['q1']],
        [transitionKey('q1', 'b'), ['q2']],
        [transitionKey('q2', 'a'), ['q1']],
        [transitionKey('q2', 'b'), ['q0']],
      ]),
      startState: 'q0',
      acceptStates: ['q2'],
    },
    testStrings: [
      { input: 'ab', expected: true },
      { input: 'aab', expected: true },
      { input: 'bab', expected: true },
      { input: 'ba', expected: false },
      { input: '', expected: false },
      { input: 'abb', expected: false },
    ],
  },
  {
    name: 'DFA: Even number of a\'s',
    description: 'Accepts strings over {a,b} containing an even number of a\'s (including zero).',
    definition: {
      type: 'DFA',
      states: ['q0', 'q1'],
      alphabet: ['a', 'b'],
      transitions: new Map([
        [transitionKey('q0', 'a'), ['q1']],
        [transitionKey('q0', 'b'), ['q0']],
        [transitionKey('q1', 'a'), ['q0']],
        [transitionKey('q1', 'b'), ['q1']],
      ]),
      startState: 'q0',
      acceptStates: ['q0'],
    },
    testStrings: [
      { input: '', expected: true },
      { input: 'aa', expected: true },
      { input: 'bb', expected: true },
      { input: 'a', expected: false },
      { input: 'aab', expected: false },
      { input: 'baba', expected: true },
    ],
  },
  {
    name: 'DFA: Contains substring "abb"',
    description: 'Accepts all strings over {a,b} that contain "abb" as a substring.',
    definition: {
      type: 'DFA',
      states: ['q0', 'q1', 'q2', 'q3'],
      alphabet: ['a', 'b'],
      transitions: new Map([
        [transitionKey('q0', 'a'), ['q1']],
        [transitionKey('q0', 'b'), ['q0']],
        [transitionKey('q1', 'a'), ['q1']],
        [transitionKey('q1', 'b'), ['q2']],
        [transitionKey('q2', 'a'), ['q1']],
        [transitionKey('q2', 'b'), ['q3']],
        [transitionKey('q3', 'a'), ['q3']],
        [transitionKey('q3', 'b'), ['q3']],
      ]),
      startState: 'q0',
      acceptStates: ['q3'],
    },
    testStrings: [
      { input: 'abb', expected: true },
      { input: 'aabb', expected: true },
      { input: 'abba', expected: true },
      { input: 'ab', expected: false },
      { input: 'bba', expected: false },
      { input: '', expected: false },
    ],
  },

  // ─── NFA Presets ──────────────────────────────────────────────
  {
    name: 'NFA: Strings ending in "ab"',
    description: 'NFA that nondeterministically guesses when the last "ab" begins.',
    definition: {
      type: 'NFA',
      states: ['q0', 'q1', 'q2'],
      alphabet: ['a', 'b'],
      transitions: new Map([
        [transitionKey('q0', 'a'), ['q0', 'q1']],
        [transitionKey('q0', 'b'), ['q0']],
        [transitionKey('q1', 'b'), ['q2']],
      ]),
      startState: 'q0',
      acceptStates: ['q2'],
    },
    testStrings: [
      { input: 'ab', expected: true },
      { input: 'aab', expected: true },
      { input: 'ba', expected: false },
      { input: 'a', expected: false },
      { input: 'bab', expected: true },
    ],
  },
  {
    name: 'NFA: Contains "aa" or "bb"',
    description: 'Accepts strings containing two consecutive identical symbols.',
    definition: {
      type: 'NFA',
      states: ['q0', 'q1', 'q2', 'q3', 'q4'],
      alphabet: ['a', 'b'],
      transitions: new Map([
        [transitionKey('q0', 'a'), ['q0', 'q1']],
        [transitionKey('q0', 'b'), ['q0', 'q3']],
        [transitionKey('q1', 'a'), ['q2']],
        [transitionKey('q3', 'b'), ['q4']],
        [transitionKey('q2', 'a'), ['q2']],
        [transitionKey('q2', 'b'), ['q2']],
        [transitionKey('q4', 'a'), ['q4']],
        [transitionKey('q4', 'b'), ['q4']],
      ]),
      startState: 'q0',
      acceptStates: ['q2', 'q4'],
    },
    testStrings: [
      { input: 'aa', expected: true },
      { input: 'bb', expected: true },
      { input: 'aab', expected: true },
      { input: 'ab', expected: false },
      { input: 'aba', expected: false },
      { input: 'abba', expected: true },
    ],
  },

  // ─── ε-NFA Preset ────────────────────────────────────────────
  {
    name: 'ε-NFA: a*b*c*',
    description: 'Accepts strings of the form aⁱbʲcᵏ using ε-transitions between phases.',
    definition: {
      type: 'NFA',
      states: ['q0', 'q1', 'q2'],
      alphabet: ['a', 'b', 'c'],
      transitions: new Map([
        [transitionKey('q0', 'a'), ['q0']],
        [transitionKey('q0', EPSILON), ['q1']],
        [transitionKey('q1', 'b'), ['q1']],
        [transitionKey('q1', EPSILON), ['q2']],
        [transitionKey('q2', 'c'), ['q2']],
      ]),
      startState: 'q0',
      acceptStates: ['q2'],
    },
    testStrings: [
      { input: '', expected: true },
      { input: 'abc', expected: true },
      { input: 'aaa', expected: true },
      { input: 'bc', expected: true },
      { input: 'ccc', expected: true },
      { input: 'ba', expected: false },
      { input: 'ca', expected: false },
    ],
  },
];

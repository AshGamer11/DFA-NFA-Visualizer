export const EPSILON = 'ε';
export const EPSILON_VARIANTS = ['ε', 'e', 'E', 'lambda', 'λ'];

export const AUTOMATON_TYPES = {
  DFA: 'DFA',
  NFA: 'NFA', // NFA without ε-moves
  ENFA: 'ε-NFA', // NFA with ε-moves
};

export const SIMULATION_STATUS = {
  IDLE: 'IDLE',
  RUNNING: 'RUNNING',
  PAUSED: 'PAUSED',
  ACCEPTED: 'ACCEPTED',
  REJECTED: 'REJECTED',
};

export const DEFAULT_SPEED_MS = 800; // milliseconds per step
export const MIN_SPEED_MS = 200;
export const MAX_SPEED_MS = 2000;

export const INITIAL_DFA = {
  id: 'dfa_ends_01',
  name: 'Strings ending with "01"',
  type: AUTOMATON_TYPES.DFA,
  states: ['q0', 'q1', 'q2'],
  alphabet: ['0', '1'],
  startState: 'q0',
  acceptStates: ['q2'],
  transitions: [
    { from: 'q0', symbol: '0', to: 'q1' },
    { from: 'q0', symbol: '1', to: 'q0' },
    { from: 'q1', symbol: '0', to: 'q1' },
    { from: 'q1', symbol: '1', to: 'q2' },
    { from: 'q2', symbol: '0', to: 'q1' },
    { from: 'q2', symbol: '1', to: 'q0' },
  ],
};

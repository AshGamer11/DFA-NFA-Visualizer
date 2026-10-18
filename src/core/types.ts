/**
 * Core type definitions for the DFA/NFA String Processing Visualizer.
 * All automaton models, simulation types, and helper utilities.
 */

/** The type of automaton */
export type AutomatonType = 'DFA' | 'NFA';

/** A state name (e.g., "q0", "q1") */
export type State = string;

/** An input symbol (single character) */
export type Symbol = string;

/**
 * Generates a canonical transition map key from a state and symbol.
 * @param state - The source state
 * @param symbol - The input symbol or 'ε' for epsilon transitions
 * @returns A string key in the format "state,symbol"
 */
export function transitionKey(state: State, symbol: string): string {
  return `${state},${symbol}`;
}

/**
 * Parses a transition key back into its components.
 * @param key - A transition key in the format "state,symbol"
 * @returns Tuple of [state, symbol]
 */
export function parseTransitionKey(key: string): [State, string] {
  const lastComma = key.lastIndexOf(',');
  return [key.substring(0, lastComma), key.substring(lastComma + 1)];
}

/** The epsilon symbol constant */
export const EPSILON = 'ε';

/**
 * Complete definition of a finite automaton (DFA or NFA).
 * Transitions always store arrays of target states for uniformity.
 * For DFA, each array should have exactly one element.
 */
export interface AutomatonDefinition {
  /** Whether this is a DFA or NFA */
  type: AutomatonType;
  /** Set of states Q */
  states: State[];
  /** Input alphabet Σ */
  alphabet: Symbol[];
  /** Transition function δ — key is "state,symbol", value is array of target states */
  transitions: Map<string, State[]>;
  /** Start state q₀ */
  startState: State;
  /** Set of accept/final states F */
  acceptStates: State[];
}

/**
 * A single step in the simulation trace.
 */
export interface SimulationStep {
  /** Step number (0 = initial, 1 = first symbol read, etc.) */
  stepNumber: number;
  /** Current active state(s) before reading the symbol */
  currentStates: State[];
  /** The symbol read at this step (null for the initial step) */
  symbolRead: string | null;
  /** State(s) after the transition */
  nextStates: State[];
  /** Whether any of the next states are accepting */
  isAccepting: boolean;
}

/**
 * Complete result of a simulation run.
 */
export interface SimulationResult {
  /** Ordered list of simulation steps */
  steps: SimulationStep[];
  /** Whether the input string was accepted */
  accepted: boolean;
  /** The computation path(s) — each inner array is a sequence of states */
  path: State[][];
}

/**
 * A node in the NFA computation tree.
 */
export interface ComputationBranch {
  /** The state at this node */
  state: State;
  /** The symbol that was read to reach this node (null for root) */
  symbol: string | null;
  /** Parent branch (null for root) */
  parent: ComputationBranch | null;
  /** Whether this state is an accepting state (relevant at leaves) */
  isAccepting: boolean;
  /** Whether this branch is dead (no further transitions possible) */
  isDead: boolean;
  /** Child branches */
  children: ComputationBranch[];
}

/**
 * A validation error or warning for an automaton definition.
 */
export interface ValidationError {
  /** Severity level */
  type: 'error' | 'warning';
  /** Human-readable error message */
  message: string;
}

/**
 * A preset automaton with test cases for demonstration.
 */
export interface PresetAutomaton {
  /** Display name */
  name: string;
  /** Short description of what language it accepts */
  description: string;
  /** The automaton definition */
  definition: AutomatonDefinition;
  /** Test strings with expected acceptance results */
  testStrings: { input: string; expected: boolean }[];
}

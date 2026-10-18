/**
 * Step Generator — unified entry point for running simulations.
 * Dispatches to the appropriate simulator based on automaton type.
 */
import { type AutomatonDefinition, type SimulationResult } from './types';
import { simulateDFA } from './dfa-simulator';
import { simulateNFA } from './nfa-simulator';

/**
 * Generate simulation steps for the given automaton and input string.
 * Automatically dispatches to DFA or NFA simulator based on definition.type.
 *
 * @param definition - The automaton definition
 * @param input - The input string to process
 * @returns SimulationResult with complete trace
 */
export function generateSteps(
  definition: AutomatonDefinition,
  input: string
): SimulationResult {
  if (definition.type === 'DFA') {
    return simulateDFA(definition, input);
  } else {
    return simulateNFA(definition, input);
  }
}

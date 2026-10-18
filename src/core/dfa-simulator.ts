/**
 * DFA Simulator — processes a string through a DFA step-by-step.
 * Produces a complete trace of states visited at each step.
 */
import {
  type AutomatonDefinition,
  type SimulationResult,
  type SimulationStep,
  type State,
  transitionKey,
} from './types';

/**
 * Simulates a DFA on the given input string.
 *
 * @param definition - A valid DFA definition
 * @param input - The input string to process
 * @returns SimulationResult with step-by-step trace and accept/reject verdict
 * @throws Error if an invalid symbol is encountered or no transition exists
 *
 * Algorithm:
 *   1. current ← q₀
 *   2. For each symbol wᵢ in w:
 *      a. next ← δ(current, wᵢ)
 *      b. Record step (current, wᵢ, next)
 *      c. current ← next
 *   3. Accept iff current ∈ F
 */
export function simulateDFA(
  definition: AutomatonDefinition,
  input: string
): SimulationResult {
  const { startState, acceptStates, transitions } = definition;
  const steps: SimulationStep[] = [];
  const path: State[] = [startState];
  let current: State = startState;

  // Initial step (step 0) — shows starting configuration
  steps.push({
    stepNumber: 0,
    currentStates: [current],
    symbolRead: null,
    nextStates: [current],
    isAccepting: acceptStates.includes(current),
  });

  // Process each symbol in the input string
  for (let i = 0; i < input.length; i++) {
    const symbol = input[i];

    // Validate symbol against alphabet
    if (!definition.alphabet.includes(symbol)) {
      throw new Error(
        `Invalid symbol "${symbol}" at position ${i}. Expected one of: ${definition.alphabet.join(', ')}`
      );
    }

    // Look up the transition
    const key = transitionKey(current, symbol);
    const targets = transitions.get(key);

    if (!targets || targets.length === 0) {
      // DFA has no transition — string is rejected (dead state)
      steps.push({
        stepNumber: i + 1,
        currentStates: [current],
        symbolRead: symbol,
        nextStates: [],
        isAccepting: false,
      });

      return {
        steps,
        accepted: false,
        path: [path],
      };
    }

    const nextState = targets[0]; // DFA has exactly one target
    steps.push({
      stepNumber: i + 1,
      currentStates: [current],
      symbolRead: symbol,
      nextStates: [nextState],
      isAccepting: acceptStates.includes(nextState),
    });

    current = nextState;
    path.push(current);
  }

  // Check if final state is accepting
  const accepted = acceptStates.includes(current);

  return {
    steps,
    accepted,
    path: [path],
  };
}

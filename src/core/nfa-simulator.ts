/**
 * NFA Simulator — processes a string through an NFA step-by-step.
 * Handles nondeterminism by tracking all possible state sets,
 * and supports ε-transitions via ε-closure.
 */
import {
  type AutomatonDefinition,
  type SimulationResult,
  type SimulationStep,
  type ComputationBranch,
  type State,
  transitionKey,
} from './types';
import { computeEpsilonClosure } from './epsilon-closure';

/**
 * Simulates an NFA on the given input string.
 *
 * Algorithm:
 *   1. currentStates ← ε-CLOSURE({q₀})
 *   2. For each symbol wᵢ in w:
 *      a. nextStates ← ∅
 *      b. For each q ∈ currentStates: nextStates ← nextStates ∪ δ(q, wᵢ)
 *      c. nextStates ← ε-CLOSURE(nextStates)
 *      d. currentStates ← nextStates
 *   3. Accept iff currentStates ∩ F ≠ ∅
 *
 * @param definition - A valid NFA definition
 * @param input - The input string to process
 * @returns SimulationResult with step-by-step trace
 */
export function simulateNFA(
  definition: AutomatonDefinition,
  input: string
): SimulationResult {
  const { startState, acceptStates, transitions } = definition;
  const steps: SimulationStep[] = [];

  // Start with ε-closure of the start state
  let currentStates = computeEpsilonClosure([startState], transitions);

  // Initial step (step 0)
  steps.push({
    stepNumber: 0,
    currentStates: [...currentStates],
    symbolRead: null,
    nextStates: [...currentStates],
    isAccepting: currentStates.some((s) => acceptStates.includes(s)),
  });

  // Track all state sets for the path
  const allStateSets: State[][] = [[...currentStates]];

  // Process each symbol
  for (let i = 0; i < input.length; i++) {
    const symbol = input[i];

    // Validate symbol against alphabet
    if (!definition.alphabet.includes(symbol)) {
      throw new Error(
        `Invalid symbol "${symbol}" at position ${i}. Expected one of: ${definition.alphabet.join(', ')}`
      );
    }

    // Compute next states: union of δ(q, symbol) for all q in currentStates
    const rawNextStates = new Set<State>();
    for (const state of currentStates) {
      const key = transitionKey(state, symbol);
      const targets = transitions.get(key);
      if (targets) {
        for (const t of targets) {
          rawNextStates.add(t);
        }
      }
    }

    // Apply ε-closure to the result
    const nextStates = computeEpsilonClosure(
      Array.from(rawNextStates),
      transitions
    );

    steps.push({
      stepNumber: i + 1,
      currentStates: [...currentStates],
      symbolRead: symbol,
      nextStates: [...nextStates],
      isAccepting: nextStates.some((s) => acceptStates.includes(s)),
    });

    currentStates = nextStates;
    allStateSets.push([...currentStates]);

    // If all branches died, we can still continue to show all steps
    if (currentStates.length === 0) {
      // Fill remaining steps with empty states
      for (let j = i + 1; j < input.length; j++) {
        steps.push({
          stepNumber: j + 1,
          currentStates: [],
          symbolRead: input[j],
          nextStates: [],
          isAccepting: false,
        });
      }
      break;
    }
  }

  const accepted = currentStates.some((s) => acceptStates.includes(s));

  return {
    steps,
    accepted,
    path: allStateSets,
  };
}

/**
 * Builds a computation tree for NFA execution showing all branches.
 *
 * @param definition - A valid NFA definition
 * @param input - The input string to process
 * @returns Root node of the computation tree
 */
export function buildComputationTree(
  definition: AutomatonDefinition,
  input: string
): ComputationBranch {
  const { startState, acceptStates, transitions } = definition;

  // Create root node
  const root: ComputationBranch = {
    state: startState,
    symbol: null,
    parent: null,
    isAccepting: acceptStates.includes(startState),
    isDead: false,
    children: [],
  };

  // Get ε-closure roots
  const epsilonStates = computeEpsilonClosure([startState], transitions);
  const epsilonRoots: ComputationBranch[] = [];

  for (const s of epsilonStates) {
    if (s !== startState) {
      const child: ComputationBranch = {
        state: s,
        symbol: 'ε',
        parent: root,
        isAccepting: acceptStates.includes(s),
        isDead: false,
        children: [],
      };
      root.children.push(child);
      epsilonRoots.push(child);
    }
  }

  // Current level of leaves to expand
  let currentLeaves: ComputationBranch[] = [root, ...epsilonRoots];

  // Process each symbol
  for (let i = 0; i < input.length; i++) {
    const symbol = input[i];
    const nextLeaves: ComputationBranch[] = [];

    for (const leaf of currentLeaves) {
      const key = transitionKey(leaf.state, symbol);
      const targets = transitions.get(key) || [];

      if (targets.length === 0 && i < input.length) {
        // This branch is dead if there are more symbols to process
        leaf.isDead = true;
        continue;
      }

      for (const target of targets) {
        const child: ComputationBranch = {
          state: target,
          symbol,
          parent: leaf,
          isAccepting: acceptStates.includes(target),
          isDead: false,
          children: [],
        };
        leaf.children.push(child);
        nextLeaves.push(child);

        // Also add ε-closure children
        const ecStates = computeEpsilonClosure([target], transitions);
        for (const ecState of ecStates) {
          if (ecState !== target) {
            const ecChild: ComputationBranch = {
              state: ecState,
              symbol: 'ε',
              parent: child,
              isAccepting: acceptStates.includes(ecState),
              isDead: false,
              children: [],
            };
            child.children.push(ecChild);
            nextLeaves.push(ecChild);
          }
        }
      }
    }

    currentLeaves = nextLeaves;
  }

  // Mark final leaves based on whether they're accepting
  for (const leaf of currentLeaves) {
    if (!acceptStates.includes(leaf.state)) {
      leaf.isDead = true;
    }
  }

  return root;
}

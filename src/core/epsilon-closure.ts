/**
 * Computes the ε-closure of a set of NFA states.
 * The ε-closure of a set S is the set of all states reachable from any
 * state in S by following zero or more ε-transitions.
 */
import { type State, EPSILON, transitionKey } from './types';

/**
 * Compute the ε-closure of a set of states.
 * Uses a stack-based DFS to find all states reachable via ε-transitions.
 *
 * @param states - Initial set of states
 * @param transitions - The NFA transition map
 * @returns Sorted array of all states in the ε-closure
 *
 * @example
 * // If δ(q0, ε) = {q1} and δ(q1, ε) = {q2}
 * // then computeEpsilonClosure(['q0'], transitions) = ['q0', 'q1', 'q2']
 */
export function computeEpsilonClosure(
  states: State[],
  transitions: Map<string, State[]>
): State[] {
  const closure = new Set<State>(states);
  const stack = [...states];

  while (stack.length > 0) {
    const current = stack.pop()!;
    const key = transitionKey(current, EPSILON);
    const epsilonTargets = transitions.get(key);

    if (epsilonTargets) {
      for (const target of epsilonTargets) {
        if (!closure.has(target)) {
          closure.add(target);
          stack.push(target);
        }
      }
    }
  }

  return Array.from(closure).sort();
}

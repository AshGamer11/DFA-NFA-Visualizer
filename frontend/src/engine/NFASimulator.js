import { SIMULATION_STATUS, EPSILON } from '../utils/constants';
import { isEpsilon } from './AutomatonValidator';

/**
 * Computes the ε-closure for a single state or set of states.
 * Returns { closure: Set<string>, epsilonTransitionsTaken: Array<{from, symbol, to}> }
 */
export const computeEpsilonClosure = (initialStates, transitions) => {
  const statesArray = Array.isArray(initialStates)
    ? initialStates
    : Array.from(initialStates);

  const closure = new Set(statesArray);
  const queue = [...statesArray];
  const epsilonTransitionsTaken = [];

  // Filter epsilon transitions once
  const epsTransitions = transitions.filter((t) => isEpsilon(t.symbol));

  while (queue.length > 0) {
    const currentState = queue.shift();

    epsTransitions.forEach((t) => {
      if (t.from === currentState) {
        epsilonTransitionsTaken.push({ from: t.from, symbol: EPSILON, to: t.to });
        if (!closure.has(t.to)) {
          closure.add(t.to);
          queue.push(t.to);
        }
      }
    });
  }

  return {
    closure,
    epsilonTransitionsTaken,
  };
};

/**
 * Simulates an NFA step-by-step for a given input string.
 * Supports epsilon transitions, parallel state tracking, and branch path reconstruction.
 *
 * @param {Object} automaton - The NFA definition
 * @param {string} inputString - The input string to simulate
 * @returns {Object} Simulation results including steps, computation tree, accepted boolean, and paths
 */
export const simulateNFA = (automaton, inputString = '') => {
  const { startState, acceptStates, transitions, alphabet } = automaton;
  const chars = inputString.split('');
  const steps = [];
  const acceptSet = new Set(acceptStates || []);
  const alphabetSet = new Set(alphabet || []);

  // Computation tree nodes: { id, state, parentId, symbolRead, depth, isAccepting }
  let nextNodeId = 1;
  const treeNodes = [];

  // Initial step 0: compute ε-closure of start state
  const initialClosureResult = computeEpsilonClosure([startState], transitions);
  const initialStates = Array.from(initialClosureResult.closure);

  // Initialize tree roots
  const rootNodeMap = new Map(); // state -> nodeId
  initialStates.forEach((state) => {
    const id = `node-${nextNodeId++}`;
    const isDirectStart = state === startState;
    treeNodes.push({
      id,
      state,
      parentId: null,
      symbolRead: isDirectStart ? 'START' : EPSILON,
      depth: 0,
      isAccepting: acceptSet.has(state),
    });
    rootNodeMap.set(state, id);
  });

  const initialHasAccept = initialStates.some((s) => acceptSet.has(s));

  steps.push({
    stepIndex: 0,
    currentStates: [startState],
    symbolRead: null,
    nextStates: initialStates,
    remainingInput: inputString,
    activeStates: initialStates,
    activeTransitions: initialClosureResult.epsilonTransitionsTaken,
    status: SIMULATION_STATUS.IDLE,
    description: initialStates.length > 1
      ? `Simulation ready at start state ${startState} with ε-closure: {${initialStates.join(', ')}}.`
      : `Simulation ready at start state ${startState}.`,
  });

  // Empty string check
  if (chars.length === 0) {
    const isAccepted = initialHasAccept;
    return {
      accepted: isAccepted,
      reason: isAccepted
        ? `Empty string accepted: ε-closure of start state contains accept state (${initialStates.filter((s) => acceptSet.has(s)).join(', ')}).`
        : `Empty string rejected: ε-closure {${initialStates.join(', ')}} contains no accept states.`,
      finalStates: initialStates,
      steps,
      totalSteps: steps.length,
      treeNodes,
    };
  }

  let currentActiveStates = initialStates;
  let currentParentNodeMap = rootNodeMap;

  // Process each character
  for (let i = 0; i < chars.length; i++) {
    const symbol = chars[i];
    const remainingInput = chars.slice(i + 1).join('');
    const nextParentNodeMap = new Map();
    const transitionsTaken = [];
    const targetStatesRaw = new Set();

    if (!alphabetSet.has(symbol)) {
      // Invalid symbol
      steps.push({
        stepIndex: steps.length,
        currentStates: currentActiveStates,
        symbolRead: symbol,
        nextStates: [],
        remainingInput,
        activeStates: [],
        activeTransitions: [],
        status: SIMULATION_STATUS.REJECTED,
        description: `Rejected: Symbol '${symbol}' is not in alphabet Σ.`,
      });

      return {
        accepted: false,
        reason: `Input contains symbol '${symbol}' which is not in alphabet Σ = {${alphabet.join(', ')}}.`,
        finalStates: [],
        steps,
        totalSteps: steps.length,
        treeNodes,
      };
    }

    // Step 1: Follow all direct transitions on 'symbol' from every active state
    currentActiveStates.forEach((fromState) => {
      const parentNodeId = currentParentNodeMap.get(fromState);

      transitions.forEach((t) => {
        if (t.from === fromState && t.symbol === symbol) {
          transitionsTaken.push({ from: t.from, symbol: t.symbol, to: t.to });
          targetStatesRaw.add(t.to);

          const childNodeId = `node-${nextNodeId++}`;
          treeNodes.push({
            id: childNodeId,
            state: t.to,
            parentId: parentNodeId,
            symbolRead: symbol,
            depth: i + 1,
            isAccepting: acceptSet.has(t.to),
          });
          nextParentNodeMap.set(t.to, childNodeId);
        }
      });
    });

    // Step 2: Compute ε-closure of all reached states
    const closureResult = computeEpsilonClosure(Array.from(targetStatesRaw), transitions);
    closureResult.epsilonTransitionsTaken.forEach((epsTrans) => {
      transitionsTaken.push(epsTrans);
      if (!nextParentNodeMap.has(epsTrans.to)) {
        const parentId = nextParentNodeMap.get(epsTrans.from) || null;
        const epsNodeId = `node-${nextNodeId++}`;
        treeNodes.push({
          id: epsNodeId,
          state: epsTrans.to,
          parentId,
          symbolRead: EPSILON,
          depth: i + 1,
          isAccepting: acceptSet.has(epsTrans.to),
        });
        nextParentNodeMap.set(epsTrans.to, epsNodeId);
      }
    });

    const nextStatesArray = Array.from(closureResult.closure);
    const isLastSymbol = i === chars.length - 1;
    const hasAccepting = nextStatesArray.some((s) => acceptSet.has(s));

    let stepStatus = SIMULATION_STATUS.RUNNING;
    let stepDesc = `Read '${symbol}': moved to {${nextStatesArray.length > 0 ? nextStatesArray.join(', ') : '∅'}}`;

    if (nextStatesArray.length === 0) {
      stepStatus = SIMULATION_STATUS.REJECTED;
      stepDesc += ' (All computation branches terminated).';
    } else if (isLastSymbol) {
      stepStatus = hasAccepting ? SIMULATION_STATUS.ACCEPTED : SIMULATION_STATUS.REJECTED;
      stepDesc += hasAccepting
        ? ` containing accept state(s) {${nextStatesArray.filter((s) => acceptSet.has(s)).join(', ')}}.`
        : ' containing no accept states.';
    }

    steps.push({
      stepIndex: steps.length,
      currentStates: currentActiveStates,
      symbolRead: symbol,
      nextStates: nextStatesArray,
      remainingInput,
      activeStates: nextStatesArray,
      activeTransitions: transitionsTaken,
      status: stepStatus,
      description: stepDesc,
    });

    if (nextStatesArray.length === 0) {
      return {
        accepted: false,
        reason: `All computation branches halted at step ${i + 1} upon reading '${symbol}'.`,
        finalStates: [],
        steps,
        totalSteps: steps.length,
        treeNodes,
      };
    }

    currentActiveStates = nextStatesArray;
    currentParentNodeMap = nextParentNodeMap;
  }

  const finalAcceptedStates = currentActiveStates.filter((s) => acceptSet.has(s));
  const isAccepted = finalAcceptedStates.length > 0;

  return {
    accepted: isAccepted,
    reason: isAccepted
      ? `Input consumed. Active states {${currentActiveStates.join(', ')}} include accept state(s): {${finalAcceptedStates.join(', ')}}.`
      : `Input consumed. None of the final active states {${currentActiveStates.join(', ')}} are accept states.`,
    finalStates: currentActiveStates,
    acceptedStates: finalAcceptedStates,
    steps,
    totalSteps: steps.length,
    treeNodes,
  };
};

/**
 * Runs batch simulation of multiple test strings on an NFA.
 */
export const simulateNFABatch = (automaton, testStrings) => {
  return testStrings.map((str) => {
    const result = simulateNFA(automaton, str);
    return {
      input: str,
      accepted: result.accepted,
      finalStates: result.finalStates,
      reason: result.reason,
      totalSteps: result.totalSteps,
    };
  });
};

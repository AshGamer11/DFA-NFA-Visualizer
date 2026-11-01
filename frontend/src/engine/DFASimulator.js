import { SIMULATION_STATUS } from '../utils/constants';

/**
 * Simulates a DFA step-by-step for a given input string.
 *
 * @param {Object} automaton - The DFA definition
 * @param {string} inputString - The input string to simulate
 * @returns {Object} Simulation results including steps, accepted boolean, and description
 */
export const simulateDFA = (automaton, inputString = '') => {
  const { startState, acceptStates, transitions, alphabet } = automaton;
  const chars = inputString.split('');
  const steps = [];

  // Build fast transition lookup: map[from][symbol] -> to
  const transitionMap = new Map();
  transitions.forEach((t) => {
    const key = `${t.from}::${t.symbol}`;
    transitionMap.set(key, t.to);
  });

  const acceptSet = new Set(acceptStates || []);
  const alphabetSet = new Set(alphabet || []);

  let currentState = startState;
  const path = [currentState];

  // Initial step 0: Before reading any input
  steps.push({
    stepIndex: 0,
    currentState: currentState,
    symbolRead: null,
    nextState: null,
    remainingInput: inputString,
    activeStates: [currentState],
    activeTransitions: [],
    status: SIMULATION_STATUS.IDLE,
    description: `Simulation ready at start state ${currentState}.`,
  });

  // Handle empty string
  if (chars.length === 0) {
    const isAccepted = acceptSet.has(currentState);
    return {
      accepted: isAccepted,
      reason: isAccepted
        ? `Empty string accepted: Start state ${currentState} is an accept state.`
        : `Empty string rejected: Start state ${currentState} is not an accept state.`,
      finalState: currentState,
      path,
      steps,
      totalSteps: steps.length,
    };
  }

  // Iterate over each character in input string
  for (let i = 0; i < chars.length; i++) {
    const symbol = chars[i];
    const remainingInput = chars.slice(i + 1).join('');
    const transKey = `${currentState}::${symbol}`;

    if (!alphabetSet.has(symbol)) {
      // Symbol not in alphabet
      steps.push({
        stepIndex: steps.length,
        currentState,
        symbolRead: symbol,
        nextState: null,
        remainingInput,
        activeStates: [currentState],
        activeTransitions: [],
        status: SIMULATION_STATUS.REJECTED,
        description: `Rejected: Symbol '${symbol}' is not in alphabet Σ.`,
      });

      return {
        accepted: false,
        reason: `Input contains symbol '${symbol}' which is not in alphabet Σ = {${alphabet.join(', ')}}.`,
        finalState: currentState,
        path,
        steps,
        totalSteps: steps.length,
      };
    }

    if (!transitionMap.has(transKey)) {
      // No transition defined for this state and symbol (trap / dead end)
      steps.push({
        stepIndex: steps.length,
        currentState,
        symbolRead: symbol,
        nextState: null,
        remainingInput,
        activeStates: [currentState],
        activeTransitions: [],
        status: SIMULATION_STATUS.REJECTED,
        description: `Stuck at state ${currentState}: No transition defined for symbol '${symbol}'.`,
      });

      return {
        accepted: false,
        reason: `DFA reached a dead end at state "${currentState}" with no transition on '${symbol}'.`,
        finalState: currentState,
        path,
        steps,
        totalSteps: steps.length,
      };
    }

    const nextState = transitionMap.get(transKey);
    path.push(nextState);

    const isLastSymbol = i === chars.length - 1;
    let stepStatus = SIMULATION_STATUS.RUNNING;
    let stepDesc = `Read '${symbol}': δ(${currentState}, '${symbol}') → ${nextState}.`;

    if (isLastSymbol) {
      if (acceptSet.has(nextState)) {
        stepStatus = SIMULATION_STATUS.ACCEPTED;
        stepDesc += ` Final state ${nextState} is an ACCEPT state.`;
      } else {
        stepStatus = SIMULATION_STATUS.REJECTED;
        stepDesc += ` Final state ${nextState} is NOT an accept state.`;
      }
    }

    steps.push({
      stepIndex: steps.length,
      currentState,
      symbolRead: symbol,
      nextState,
      remainingInput,
      activeStates: [nextState],
      activeTransitions: [{ from: currentState, symbol, to: nextState }],
      status: stepStatus,
      description: stepDesc,
    });

    currentState = nextState;
  }

  const isAccepted = acceptSet.has(currentState);
  return {
    accepted: isAccepted,
    reason: isAccepted
      ? `Input consumed completely. Ended in accept state "${currentState}".`
      : `Input consumed completely. Ended in non-accept state "${currentState}".`,
    finalState: currentState,
    path,
    steps,
    totalSteps: steps.length,
  };
};

/**
 * Runs batch simulation of multiple test strings on a DFA.
 */
export const simulateDFABatch = (automaton, testStrings) => {
  return testStrings.map((str) => {
    const result = simulateDFA(automaton, str);
    return {
      input: str,
      accepted: result.accepted,
      finalState: result.finalState,
      reason: result.reason,
      totalSteps: result.totalSteps,
    };
  });
};

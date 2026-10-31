package com.visualizer.automata.service;

import com.visualizer.automata.model.Automaton;
import com.visualizer.automata.model.ComputationPath;
import com.visualizer.automata.model.SimulationResult;
import com.visualizer.automata.model.SimulationStep;
import com.visualizer.automata.model.Transition;
import org.springframework.stereotype.Service;

import java.util.*;

/**
 * Service providing step-by-step execution and branching tree simulation of
 * Nondeterministic Finite Automata (NFA), with full support for epsilon (λ/ε) transitions.
 *
 * Implements:
 * 1. Active state-set tracking with epsilon-closure expansion at each step.
 * 2. Tree-of-possibilities computation path exploration, recording every non-deterministic branch.
 * 3. Overall acceptance determination based on formal language theory criteria.
 */
@Service
public class NFASimulatorService {

    private static final int MAX_EXPLORED_PATHS = 150;

    /**
     * Simulates the processing of an input string on the given NFA.
     *
     * @param automaton   the NFA automaton definition
     * @param inputString the input string to be evaluated
     * @return SimulationResult containing aggregate step-by-step traces, final state set, and all branching paths
     */
    public SimulationResult simulate(Automaton automaton, String inputString) {
        long startTime = System.currentTimeMillis();

        if (inputString == null) {
            inputString = "";
        }

        // Build transitions lookup maps
        // symbolTransitions: fromState -> (symbol -> Set<toStates>)
        Map<String, Map<String, Set<String>>> symbolTransitions = new HashMap<>();
        // epsilonTransitions: fromState -> Set<toStates>
        Map<String, Set<String>> epsilonTransitions = new HashMap<>();
        buildTransitionTables(automaton, symbolTransitions, epsilonTransitions);

        Set<String> acceptStates = automaton.getAcceptStates() != null
                ? automaton.getAcceptStates()
                : Collections.emptySet();

        String startState = automaton.getStartState();

        // 1. Initial State Set with Epsilon-Closure
        Set<String> currentActiveStates = computeEpsilonClosure(Collections.singleton(startState), epsilonTransitions);

        List<SimulationStep> steps = new ArrayList<>();

        if (inputString.isEmpty()) {
            // Empty string input (epsilon)
            boolean accepted = currentActiveStates.stream().anyMatch(acceptStates::contains);
            Set<String> acceptedStatesInSet = new HashSet<>(currentActiveStates);
            acceptedStatesInSet.retainAll(acceptStates);

            SimulationStep initialStep = new SimulationStep(
                    1,
                    Collections.singleton(startState),
                    "ε",
                    currentActiveStates,
                    "",
                    String.format("Initial epsilon-closure from start state '%s': %s", startState, currentActiveStates)
            );
            steps.add(initialStep);

            String summary = String.format(
                    "Empty string processed. Active states after epsilon-closure: %s. %s",
                    currentActiveStates,
                    accepted ? "Reached accept state(s) " + acceptedStatesInSet + " (ACCEPTED)." : "No accept state reached (REJECTED)."
            );

            List<ComputationPath> paths = exploreComputationPaths(
                    automaton, inputString, symbolTransitions, epsilonTransitions, acceptStates
            );

            SimulationResult result = new SimulationResult();
            result.setAutomatonId(automaton.getId());
            result.setAutomatonName(automaton.getName());
            result.setAutomatonType(automaton.getType());
            result.setInputString(inputString);
            result.setAccepted(accepted);
            result.setFinalStates(currentActiveStates);
            result.setSteps(steps);
            result.setComputationPaths(paths);
            result.setExecutionSummary(summary);
            result.setExecutionTimeMs(System.currentTimeMillis() - startTime);
            return result;
        }

        // Record initial state before consuming symbols if epsilon transitions expanded start state
        if (!currentActiveStates.equals(Collections.singleton(startState))) {
            steps.add(new SimulationStep(
                    0,
                    Collections.singleton(startState),
                    "ε",
                    currentActiveStates,
                    inputString,
                    String.format("Initial state '%s' expanded via epsilon-closure to: %s", startState, currentActiveStates)
            ));
        }

        // 2. Process each input symbol step-by-step
        for (int i = 0; i < inputString.length(); i++) {
            String symbol = String.valueOf(inputString.charAt(i));
            String remaining = inputString.substring(i + 1);
            int stepNumber = i + 1;

            Set<String> directNextStates = new LinkedHashSet<>();
            for (String state : currentActiveStates) {
                Map<String, Set<String>> stateMap = symbolTransitions.getOrDefault(state, Collections.emptyMap());
                Set<String> targets = stateMap.getOrDefault(symbol, Collections.emptySet());
                directNextStates.addAll(targets);
            }

            // Apply epsilon-closure to all destination states
            Set<String> nextActiveStates = computeEpsilonClosure(directNextStates, epsilonTransitions);

            String description;
            if (nextActiveStates.isEmpty()) {
                description = String.format(
                        "Reading '%s': No transitions from active states %s. Active states set becomes empty (DEAD END).",
                        symbol, currentActiveStates
                );
            } else if (nextActiveStates.equals(directNextStates)) {
                description = String.format(
                        "Reading '%s': Active states %s transitioned to %s.",
                        symbol, currentActiveStates, nextActiveStates
                );
            } else {
                description = String.format(
                        "Reading '%s': Active states %s transitioned directly to %s, and with ε-closure expanded to %s.",
                        symbol, currentActiveStates, directNextStates, nextActiveStates
                );
            }

            SimulationStep step = new SimulationStep(
                    stepNumber,
                    new LinkedHashSet<>(currentActiveStates),
                    symbol,
                    new LinkedHashSet<>(nextActiveStates),
                    remaining,
                    description
            );
            steps.add(step);

            currentActiveStates = nextActiveStates;

            if (currentActiveStates.isEmpty()) {
                // If active states set is empty, remaining characters cannot be processed
                break;
            }
        }

        // 3. Acceptance evaluation
        boolean accepted = currentActiveStates.stream().anyMatch(acceptStates::contains);
        Set<String> reachedAcceptStates = new HashSet<>(currentActiveStates);
        reachedAcceptStates.retainAll(acceptStates);

        String executionSummary;
        if (accepted) {
            executionSummary = String.format(
                    "String ACCEPTED! Final active states: %s, including accept state(s): %s.",
                    currentActiveStates, reachedAcceptStates
            );
        } else {
            executionSummary = String.format(
                    "String REJECTED. Final active states: %s. None of these are in accept states: %s.",
                    currentActiveStates, acceptStates
            );
        }

        // 4. Explore all individual branching computation paths
        List<ComputationPath> paths = exploreComputationPaths(
                automaton, inputString, symbolTransitions, epsilonTransitions, acceptStates
        );

        SimulationResult result = new SimulationResult();
        result.setAutomatonId(automaton.getId());
        result.setAutomatonName(automaton.getName());
        result.setAutomatonType(automaton.getType());
        result.setInputString(inputString);
        result.setAccepted(accepted);
        result.setFinalStates(currentActiveStates);
        result.setSteps(steps);
        result.setComputationPaths(paths);
        result.setExecutionSummary(executionSummary);
        result.setExecutionTimeMs(System.currentTimeMillis() - startTime);

        return result;
    }

    /**
     * Computes the epsilon-closure of a given set of states.
     * ε-closure(S) = states reachable from S via zero or more epsilon transitions.
     */
    public Set<String> computeEpsilonClosure(Set<String> initialStates, Map<String, Set<String>> epsilonTransitions) {
        Set<String> closure = new LinkedHashSet<>(initialStates);
        Queue<String> queue = new ArrayDeque<>(initialStates);

        while (!queue.isEmpty()) {
            String current = queue.poll();
            Set<String> epsTargets = epsilonTransitions.getOrDefault(current, Collections.emptySet());
            for (String target : epsTargets) {
                if (target != null && closure.add(target)) {
                    queue.add(target);
                }
            }
        }
        return closure;
    }

    /**
     * Explores individual computation paths through DFS search to produce the tree of possibilities.
     */
    private List<ComputationPath> exploreComputationPaths(
            Automaton automaton,
            String inputString,
            Map<String, Map<String, Set<String>>> symbolTransitions,
            Map<String, Set<String>> epsilonTransitions,
            Set<String> acceptStates) {

        List<ComputationPath> paths = new ArrayList<>();
        String startState = automaton.getStartState();

        // Path node configuration for DFS:
        // (currentState, inputIndex, stateHistory, symbolHistory, visitedConfigInBranch)
        class PathState {
            final String state;
            final int inputIndex;
            final List<String> historyStates;
            final List<String> historySymbols;
            final Set<String> visitedInBranch; // "state@index" to prevent epsilon cycles

            PathState(String state, int inputIndex, List<String> historyStates,
                      List<String> historySymbols, Set<String> visitedInBranch) {
                this.state = state;
                this.inputIndex = inputIndex;
                this.historyStates = new ArrayList<>(historyStates);
                this.historySymbols = new ArrayList<>(historySymbols);
                this.visitedInBranch = new HashSet<>(visitedInBranch);
                this.visitedInBranch.add(state + "@" + inputIndex);
            }
        }

        Deque<PathState> stack = new ArrayDeque<>();
        List<String> initStates = Collections.singletonList(startState);
        List<String> initSymbols = Collections.emptyList();
        stack.push(new PathState(startState, 0, initStates, initSymbols, Collections.emptySet()));

        int pathCounter = 1;

        while (!stack.isEmpty() && paths.size() < MAX_EXPLORED_PATHS) {
            PathState curr = stack.pop();
            boolean hasBranch = false;

            // 1. Check epsilon transitions (do not consume symbol)
            Set<String> epsTargets = epsilonTransitions.getOrDefault(curr.state, Collections.emptySet());
            for (String epsNext : epsTargets) {
                String key = epsNext + "@" + curr.inputIndex;
                if (!curr.visitedInBranch.contains(key)) {
                    List<String> nextStates = new ArrayList<>(curr.historyStates);
                    nextStates.add(epsNext);
                    List<String> nextSymbols = new ArrayList<>(curr.historySymbols);
                    nextSymbols.add("ε");

                    stack.push(new PathState(epsNext, curr.inputIndex, nextStates, nextSymbols, curr.visitedInBranch));
                    hasBranch = true;
                }
            }

            // 2. Check symbol transition (consumes next symbol)
            if (curr.inputIndex < inputString.length()) {
                String nextSym = String.valueOf(inputString.charAt(curr.inputIndex));
                Map<String, Set<String>> symMap = symbolTransitions.getOrDefault(curr.state, Collections.emptyMap());
                Set<String> symTargets = symMap.getOrDefault(nextSym, Collections.emptySet());

                for (String symNext : symTargets) {
                    List<String> nextStates = new ArrayList<>(curr.historyStates);
                    nextStates.add(symNext);
                    List<String> nextSymbols = new ArrayList<>(curr.historySymbols);
                    nextSymbols.add(nextSym);

                    stack.push(new PathState(symNext, curr.inputIndex + 1, nextStates, nextSymbols, Collections.emptySet()));
                    hasBranch = true;
                }
            }

            // If no further transitions are possible, this path terminates
            if (!hasBranch) {
                boolean inputExhausted = (curr.inputIndex == inputString.length());
                boolean accepted = inputExhausted && acceptStates.contains(curr.state);
                String status;
                if (accepted) {
                    status = "ACCEPTED";
                } else if (inputExhausted) {
                    status = "REJECTED";
                } else {
                    status = "STUCK";
                }

                ComputationPath path = new ComputationPath();
                path.setPathId(pathCounter++);
                path.setStates(curr.historyStates);
                path.setSymbols(curr.historySymbols);
                path.setFinalState(curr.state);
                path.setAccepted(accepted);
                path.setStatus(status);
                path.setTrace(buildTrace(curr.historyStates, curr.historySymbols, status));

                paths.add(path);
            }
        }

        return paths;
    }

    private void buildTransitionTables(
            Automaton automaton,
            Map<String, Map<String, Set<String>>> symbolTransitions,
            Map<String, Set<String>> epsilonTransitions) {

        if (automaton.getTransitions() == null) {
            return;
        }

        for (Transition t : automaton.getTransitions()) {
            if (t.getFromState() == null || t.getToStates() == null || t.getToStates().isEmpty()) {
                continue;
            }

            String from = t.getFromState().trim();
            Set<String> targets = new HashSet<>();
            for (String to : t.getToStates()) {
                if (to != null && !to.trim().isEmpty()) {
                    targets.add(to.trim());
                }
            }

            if (t.isEpsilon()) {
                epsilonTransitions.computeIfAbsent(from, k -> new LinkedHashSet<>()).addAll(targets);
            } else {
                String sym = t.getSymbol().trim();
                symbolTransitions.computeIfAbsent(from, k -> new HashMap<>())
                        .computeIfAbsent(sym, k -> new LinkedHashSet<>())
                        .addAll(targets);
            }
        }
    }

    private String buildTrace(List<String> states, List<String> symbols, String status) {
        if (states == null || states.isEmpty()) {
            return "[" + status + "]";
        }
        StringBuilder sb = new StringBuilder();
        sb.append(states.get(0));
        for (int i = 0; i < symbols.size(); i++) {
            sb.append(" --(").append(symbols.get(i)).append(")--> ");
            if (i + 1 < states.size()) {
                sb.append(states.get(i + 1));
            }
        }
        sb.append(" [").append(status).append("]");
        return sb.toString();
    }
}

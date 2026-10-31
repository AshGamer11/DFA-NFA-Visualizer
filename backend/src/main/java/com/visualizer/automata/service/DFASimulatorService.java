package com.visualizer.automata.service;

import com.visualizer.automata.model.Automaton;
import com.visualizer.automata.model.ComputationPath;
import com.visualizer.automata.model.SimulationResult;
import com.visualizer.automata.model.SimulationStep;
import com.visualizer.automata.model.Transition;
import org.springframework.stereotype.Service;

import java.util.*;

/**
 * Service providing step-by-step execution and simulation of Deterministic Finite Automata (DFA).
 * Computes deterministic transitions, traces state changes, records remaining inputs,
 * and determines formal string acceptance or rejection.
 */
@Service
public class DFASimulatorService {

    /**
     * Simulates the processing of an input string on the given DFA.
     *
     * @param automaton   the DFA automaton definition
     * @param inputString the input string to be evaluated
     * @return SimulationResult containing step-by-step traces, final state, and acceptance status
     */
    public SimulationResult simulate(Automaton automaton, String inputString) {
        long startTime = System.currentTimeMillis();

        if (inputString == null) {
            inputString = "";
        }

        // Build deterministic transition lookup map: fromState -> (symbol -> toState)
        Map<String, Map<String, String>> transitionTable = buildTransitionTable(automaton);
        Set<String> acceptStates = automaton.getAcceptStates() != null
                ? automaton.getAcceptStates()
                : Collections.emptySet();

        String currentState = automaton.getStartState();
        List<SimulationStep> steps = new ArrayList<>();
        List<String> pathStates = new ArrayList<>();
        List<String> pathSymbols = new ArrayList<>();
        pathStates.add(currentState);

        boolean accepted = false;
        boolean stuck = false;
        String executionSummary;

        if (inputString.isEmpty()) {
            // Processing empty string (epsilon / λ)
            accepted = acceptStates.contains(currentState);
            executionSummary = String.format(
                    "Empty string processed. Automaton remains in start state '%s'. %s",
                    currentState,
                    accepted ? "Start state is an accept state (ACCEPTED)." : "Start state is not an accept state (REJECTED)."
            );
        } else {
            for (int i = 0; i < inputString.length(); i++) {
                String symbol = String.valueOf(inputString.charAt(i));
                String remaining = inputString.substring(i + 1);
                int stepNumber = i + 1;

                Map<String, String> stateTransitions = transitionTable.getOrDefault(currentState, Collections.emptyMap());
                String nextState = stateTransitions.get(symbol);

                if (nextState == null) {
                    // No transition exists for this symbol from currentState (stuck / dead end)
                    SimulationStep step = new SimulationStep(
                            stepNumber,
                            Collections.singleton(currentState),
                            symbol,
                            Collections.emptySet(),
                            remaining,
                            String.format("No transition from state '%s' on symbol '%s'. Automaton halts.", currentState, symbol)
                    );
                    steps.add(step);
                    stuck = true;
                    break;
                }

                // Valid deterministic transition
                SimulationStep step = new SimulationStep(
                        stepNumber,
                        Collections.singleton(currentState),
                        symbol,
                        Collections.singleton(nextState),
                        remaining,
                        String.format("Read symbol '%s': transitioned from '%s' to '%s'.", symbol, currentState, nextState)
                );
                steps.add(step);

                pathSymbols.add(symbol);
                pathStates.add(nextState);
                currentState = nextState;
            }

            if (stuck) {
                accepted = false;
                executionSummary = String.format(
                        "String rejected: Automaton became stuck at state '%s' with no transition for next symbol.",
                        currentState
                );
            } else {
                accepted = acceptStates.contains(currentState);
                executionSummary = String.format(
                        "String processed completely. Final state is '%s'. %s",
                        currentState,
                        accepted ? "State is an ACCEPT state (ACCEPTED)." : "State is NOT an accept state (REJECTED)."
                );
            }
        }

        // Build the unique computation path for DFA
        ComputationPath path = new ComputationPath();
        path.setPathId(1);
        path.setStates(pathStates);
        path.setSymbols(pathSymbols);
        path.setSteps(steps);
        path.setFinalState(stuck ? null : currentState);
        path.setAccepted(accepted);
        path.setStatus(stuck ? "STUCK" : (accepted ? "ACCEPTED" : "REJECTED"));
        path.setTrace(buildTraceString(pathStates, pathSymbols, path.getStatus()));

        SimulationResult result = new SimulationResult();
        result.setAutomatonId(automaton.getId());
        result.setAutomatonName(automaton.getName());
        result.setAutomatonType(automaton.getType());
        result.setInputString(inputString);
        result.setAccepted(accepted);
        result.setFinalStates(stuck ? Collections.emptySet() : Collections.singleton(currentState));
        result.setSteps(steps);
        result.setComputationPaths(Collections.singletonList(path));
        result.setExecutionSummary(executionSummary);
        result.setExecutionTimeMs(System.currentTimeMillis() - startTime);

        return result;
    }

    private Map<String, Map<String, String>> buildTransitionTable(Automaton automaton) {
        Map<String, Map<String, String>> map = new HashMap<>();
        if (automaton.getTransitions() == null) {
            return map;
        }

        for (Transition t : automaton.getTransitions()) {
            if (t.getFromState() != null && t.getSymbol() != null && !t.getToStates().isEmpty()) {
                map.computeIfAbsent(t.getFromState().trim(), k -> new HashMap<>());
                // DFA: single destination state
                String dest = t.getToStates().iterator().next().trim();
                map.get(t.getFromState().trim()).put(t.getSymbol().trim(), dest);
            }
        }
        return map;
    }

    private String buildTraceString(List<String> states, List<String> symbols, String status) {
        if (states.isEmpty()) {
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

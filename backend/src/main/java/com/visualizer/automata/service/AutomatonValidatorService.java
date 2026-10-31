package com.visualizer.automata.service;

import com.visualizer.automata.model.Automaton;
import com.visualizer.automata.model.AutomatonType;
import com.visualizer.automata.model.Transition;
import com.visualizer.automata.model.ValidationResult;
import org.springframework.stereotype.Service;

import java.util.*;

/**
 * Service responsible for validating the mathematical and structural integrity
 * of Finite Automata (DFA and NFA).
 *
 * Checks include:
 * - Non-empty states set
 * - Non-empty alphabet
 * - Start state membership in states
 * - Accept states subset of states
 * - Validity of states referenced in transitions
 * - Validity of symbols referenced in transitions against the alphabet
 * - DFA determinism: no epsilon transitions, at most one destination state per (state, symbol)
 * - DFA completeness checks (warns if state transitions are missing)
 */
@Service
public class AutomatonValidatorService {

    /**
     * Validates the given automaton.
     *
     * @param automaton the automaton to validate
     * @return ValidationResult containing valid status, error messages, and warnings
     */
    public ValidationResult validate(Automaton automaton) {
        ValidationResult result = new ValidationResult();

        if (automaton == null) {
            result.addError("Automaton definition cannot be null.");
            return result;
        }

        // 1. Validate Automaton Type
        if (automaton.getType() == null) {
            result.addError("Automaton type must be specified (DFA or NFA).");
        }

        // 2. Validate States Set
        Set<String> states = automaton.getStates();
        if (states == null || states.isEmpty()) {
            result.addError("Automaton states set (Q) cannot be empty.");
            states = Collections.emptySet();
        }

        // 3. Validate Alphabet Set
        Set<String> alphabet = automaton.getAlphabet();
        if (alphabet == null || alphabet.isEmpty()) {
            result.addError("Automaton alphabet (Σ) cannot be empty.");
            alphabet = Collections.emptySet();
        } else {
            for (String sym : alphabet) {
                if (sym == null || sym.trim().isEmpty()) {
                    result.addError("Alphabet cannot contain empty or null symbols.");
                } else if (isEpsilon(sym)) {
                    result.addError("Alphabet symbol '" + sym + "' is reserved for epsilon and cannot be part of the input alphabet.");
                }
            }
        }

        // 4. Validate Start State
        String startState = automaton.getStartState();
        if (startState == null || startState.trim().isEmpty()) {
            result.addError("Start state (q0) must be specified.");
        } else if (!states.contains(startState.trim())) {
            result.addError("Start state '" + startState + "' is not present in the states set " + states + ".");
        }

        // 5. Validate Accept States
        Set<String> acceptStates = automaton.getAcceptStates();
        if (acceptStates != null) {
            for (String acceptState : acceptStates) {
                if (acceptState != null && !states.contains(acceptState.trim())) {
                    result.addError("Accept state '" + acceptState + "' is not present in the states set " + states + ".");
                }
            }
        }

        // 6. Validate Transitions
        List<Transition> transitions = automaton.getTransitions();
        if (transitions == null) {
            transitions = Collections.emptyList();
        }

        // For DFA: check no duplicate (fromState, symbol) mappings
        Map<String, Map<String, Set<String>>> dfaTransitionMap = new HashMap<>();

        for (int i = 0; i < transitions.size(); i++) {
            Transition t = transitions.get(i);
            String prefix = "Transition #" + (i + 1) + ": ";

            if (t == null) {
                result.addError(prefix + "Transition entry cannot be null.");
                continue;
            }

            String from = t.getFromState();
            if (from == null || from.trim().isEmpty()) {
                result.addError(prefix + "'fromState' is blank.");
            } else if (!states.contains(from.trim())) {
                result.addError(prefix + "Source state '" + from + "' is not defined in the states set " + states + ".");
            }

            String symbol = t.getSymbol();
            boolean isEps = t.isEpsilon();

            if (automaton.getType() == AutomatonType.DFA) {
                if (isEps) {
                    result.addError(prefix + "DFA does not allow epsilon (λ/ε) transitions from state '" + from + "'.");
                } else if (!alphabet.contains(symbol)) {
                    result.addError(prefix + "Symbol '" + symbol + "' is not in the alphabet " + alphabet + ".");
                }

                if (t.getToStates() != null && t.getToStates().size() > 1) {
                    result.addError(prefix + "DFA transition from state '" + from + "' on symbol '" + symbol +
                            "' has multiple destination states " + t.getToStates() + ". A DFA must have at most 1 destination state per transition.");
                }
            } else {
                // NFA validation
                if (!isEps && !alphabet.contains(symbol)) {
                    result.addError(prefix + "Symbol '" + symbol + "' is neither in the alphabet " + alphabet + " nor an epsilon transition.");
                }
            }

            Set<String> toStates = t.getToStates();
            if (toStates == null || toStates.isEmpty()) {
                result.addWarning(prefix + "Transition from '" + from + "' on symbol '" + symbol + "' has no destination states.");
            } else {
                for (String to : toStates) {
                    if (to != null && !states.contains(to.trim())) {
                        result.addError(prefix + "Destination state '" + to + "' is not defined in the states set " + states + ".");
                    }
                }
            }

            // Track DFA transitions to detect duplicate transitions for same (state, symbol)
            if (automaton.getType() == AutomatonType.DFA && from != null && symbol != null && !isEps) {
                dfaTransitionMap.computeIfAbsent(from.trim(), k -> new HashMap<>());
                Map<String, Set<String>> symMap = dfaTransitionMap.get(from.trim());
                if (symMap.containsKey(symbol.trim())) {
                    result.addError("DFA has duplicate/conflicting transitions from state '" + from + "' on symbol '" + symbol + "'.");
                } else {
                    symMap.put(symbol.trim(), toStates);
                }
            }
        }

        // 7. Check DFA Completeness (Warnings if implicit trap/dead states)
        if (automaton.getType() == AutomatonType.DFA && result.getErrors().isEmpty()) {
            for (String state : states) {
                Map<String, Set<String>> symMap = dfaTransitionMap.getOrDefault(state, Collections.emptyMap());
                for (String sym : alphabet) {
                    if (!symMap.containsKey(sym) || symMap.get(sym).isEmpty()) {
                        result.addWarning("State '" + state + "' has no transition defined for alphabet symbol '" + sym +
                                "'. (Processed as implicit rejection/trap).");
                    }
                }
            }
        }

        return result;
    }

    private boolean isEpsilon(String symbol) {
        if (symbol == null || symbol.trim().isEmpty()) {
            return true;
        }
        String s = symbol.trim();
        return s.equals("ε") || s.equalsIgnoreCase("epsilon") || s.equals("λ") || s.equalsIgnoreCase("lambda");
    }
}

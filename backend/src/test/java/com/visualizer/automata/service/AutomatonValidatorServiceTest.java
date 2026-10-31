package com.visualizer.automata.service;

import com.visualizer.automata.model.Automaton;
import com.visualizer.automata.model.AutomatonType;
import com.visualizer.automata.model.Transition;
import com.visualizer.automata.model.ValidationResult;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.util.*;

import static org.junit.jupiter.api.Assertions.*;

@DisplayName("Automaton Validator Service Tests")
class AutomatonValidatorServiceTest {

    private AutomatonValidatorService validatorService;

    @BeforeEach
    void setUp() {
        validatorService = new AutomatonValidatorService();
    }

    @Test
    @DisplayName("Valid DFA passes validation")
    void testValidDfa() {
        Automaton dfa = new Automaton();
        dfa.setName("Valid DFA");
        dfa.setType(AutomatonType.DFA);
        dfa.setStates(new HashSet<>(Arrays.asList("q0", "q1")));
        dfa.setAlphabet(new HashSet<>(Arrays.asList("0", "1")));
        dfa.setStartState("q0");
        dfa.setAcceptStates(new HashSet<>(Collections.singletonList("q1")));
        dfa.setTransitions(Arrays.asList(
                new Transition("q0", "0", "q0"),
                new Transition("q0", "1", "q1"),
                new Transition("q1", "0", "q0"),
                new Transition("q1", "1", "q1")
        ));

        ValidationResult result = validatorService.validate(dfa);
        assertTrue(result.isValid());
        assertTrue(result.getErrors().isEmpty());
    }

    @Test
    @DisplayName("DFA with epsilon transition fails validation")
    void testDfaWithEpsilonFails() {
        Automaton dfa = new Automaton();
        dfa.setType(AutomatonType.DFA);
        dfa.setStates(new HashSet<>(Arrays.asList("q0", "q1")));
        dfa.setAlphabet(new HashSet<>(Collections.singletonList("a")));
        dfa.setStartState("q0");
        dfa.setAcceptStates(new HashSet<>(Collections.singletonList("q1")));
        dfa.setTransitions(Collections.singletonList(
                new Transition("q0", "ε", "q1")
        ));

        ValidationResult result = validatorService.validate(dfa);
        assertFalse(result.isValid());
        assertTrue(result.getErrors().stream().anyMatch(e -> e.contains("does not allow epsilon")));
    }

    @Test
    @DisplayName("DFA with multiple target states for same symbol fails validation")
    void testDfaWithMultipleTargetStatesFails() {
        Automaton dfa = new Automaton();
        dfa.setType(AutomatonType.DFA);
        dfa.setStates(new HashSet<>(Arrays.asList("q0", "q1", "q2")));
        dfa.setAlphabet(new HashSet<>(Collections.singletonList("0")));
        dfa.setStartState("q0");
        dfa.setTransitions(Collections.singletonList(
                new Transition("q0", "0", new HashSet<>(Arrays.asList("q1", "q2")))
        ));

        ValidationResult result = validatorService.validate(dfa);
        assertFalse(result.isValid());
        assertTrue(result.getErrors().stream().anyMatch(e -> e.contains("multiple destination states")));
    }

    @Test
    @DisplayName("Automaton with invalid start state fails validation")
    void testInvalidStartState() {
        Automaton dfa = new Automaton();
        dfa.setType(AutomatonType.DFA);
        dfa.setStates(new HashSet<>(Arrays.asList("q0", "q1")));
        dfa.setAlphabet(new HashSet<>(Collections.singletonList("0")));
        dfa.setStartState("unknown_state");

        ValidationResult result = validatorService.validate(dfa);
        assertFalse(result.isValid());
        assertTrue(result.getErrors().stream().anyMatch(e -> e.contains("Start state 'unknown_state' is not present")));
    }

    @Test
    @DisplayName("Automaton with accept state not in states fails validation")
    void testInvalidAcceptState() {
        Automaton dfa = new Automaton();
        dfa.setType(AutomatonType.DFA);
        dfa.setStates(new HashSet<>(Arrays.asList("q0", "q1")));
        dfa.setAlphabet(new HashSet<>(Collections.singletonList("0")));
        dfa.setStartState("q0");
        dfa.setAcceptStates(new HashSet<>(Collections.singletonList("ghost_state")));

        ValidationResult result = validatorService.validate(dfa);
        assertFalse(result.isValid());
        assertTrue(result.getErrors().stream().anyMatch(e -> e.contains("ghost_state")));
    }

    @Test
    @DisplayName("Valid NFA with epsilon transition passes validation")
    void testValidNfaWithEpsilon() {
        Automaton nfa = new Automaton();
        nfa.setType(AutomatonType.NFA);
        nfa.setStates(new HashSet<>(Arrays.asList("q0", "q1", "q2")));
        nfa.setAlphabet(new HashSet<>(Arrays.asList("a", "b")));
        nfa.setStartState("q0");
        nfa.setAcceptStates(new HashSet<>(Collections.singletonList("q2")));
        nfa.setTransitions(Arrays.asList(
                new Transition("q0", "ε", new HashSet<>(Arrays.asList("q1", "q2"))),
                new Transition("q1", "a", Collections.singleton("q2"))
        ));

        ValidationResult result = validatorService.validate(nfa);
        assertTrue(result.isValid());
        assertTrue(result.getErrors().isEmpty());
    }
}

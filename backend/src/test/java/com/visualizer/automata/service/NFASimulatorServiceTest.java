package com.visualizer.automata.service;

import com.visualizer.automata.model.Automaton;
import com.visualizer.automata.model.AutomatonType;
import com.visualizer.automata.model.ComputationPath;
import com.visualizer.automata.model.SimulationResult;
import com.visualizer.automata.model.SimulationStep;
import com.visualizer.automata.model.Transition;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.util.*;

import static org.junit.jupiter.api.Assertions.*;

@DisplayName("NFA Simulator Service Tests")
class NFASimulatorServiceTest {

    private NFASimulatorService nfaSimulatorService;

    @BeforeEach
    void setUp() {
        nfaSimulatorService = new NFASimulatorService();
    }

    private Automaton createNfaSubstring101() {
        Automaton nfa = new Automaton();
        nfa.setName("Contains 101");
        nfa.setType(AutomatonType.NFA);
        nfa.setStates(new LinkedHashSet<>(Arrays.asList("q0", "q1", "q2", "q3")));
        nfa.setAlphabet(new LinkedHashSet<>(Arrays.asList("0", "1")));
        nfa.setStartState("q0");
        nfa.setAcceptStates(new LinkedHashSet<>(Collections.singletonList("q3")));
        nfa.setTransitions(Arrays.asList(
                new Transition("q0", "0", Collections.singleton("q0")),
                new Transition("q0", "1", new LinkedHashSet<>(Arrays.asList("q0", "q1"))),
                new Transition("q1", "0", Collections.singleton("q2")),
                new Transition("q2", "1", Collections.singleton("q3")),
                new Transition("q3", "0", Collections.singleton("q3")),
                new Transition("q3", "1", Collections.singleton("q3"))
        ));
        return nfa;
    }

    private Automaton createNfaEpsilonStartsAOrEndsB() {
        Automaton nfa = new Automaton();
        nfa.setName("Starts with a or ends with b");
        nfa.setType(AutomatonType.NFA);
        nfa.setStates(new LinkedHashSet<>(Arrays.asList("q_start", "q_starts_a", "q_accept_a", "q_ends_b", "q_accept_b")));
        nfa.setAlphabet(new LinkedHashSet<>(Arrays.asList("a", "b")));
        nfa.setStartState("q_start");
        nfa.setAcceptStates(new LinkedHashSet<>(Arrays.asList("q_accept_a", "q_accept_b")));
        nfa.setTransitions(Arrays.asList(
                new Transition("q_start", "ε", new LinkedHashSet<>(Arrays.asList("q_starts_a", "q_ends_b"))),
                new Transition("q_starts_a", "a", Collections.singleton("q_accept_a")),
                new Transition("q_accept_a", "a", Collections.singleton("q_accept_a")),
                new Transition("q_accept_a", "b", Collections.singleton("q_accept_a")),
                new Transition("q_ends_b", "a", Collections.singleton("q_ends_b")),
                new Transition("q_ends_b", "b", new LinkedHashSet<>(Arrays.asList("q_ends_b", "q_accept_b")))
        ));
        return nfa;
    }

    @Test
    @DisplayName("NFA Substring '101' - accepts strings containing 101")
    void testNfaSubstring101_Acceptance() {
        Automaton nfa = createNfaSubstring101();

        String[] accepted = {"101", "0101", "1010", "0010100", "11101", "101101"};
        for (String input : accepted) {
            SimulationResult result = nfaSimulatorService.simulate(nfa, input);
            assertTrue(result.isAccepted(), "Input '" + input + "' containing 101 should be accepted");
            assertTrue(result.getFinalStates().contains("q3"));

            // Verify that at least one computation path accepted
            boolean hasAcceptedPath = result.getComputationPaths().stream().anyMatch(ComputationPath::isAccepted);
            assertTrue(hasAcceptedPath, "At least one computation path must be accepted for input: " + input);
        }
    }

    @Test
    @DisplayName("NFA Substring '101' - rejects strings not containing 101")
    void testNfaSubstring101_Rejection() {
        Automaton nfa = createNfaSubstring101();

        String[] rejected = {"", "0", "1", "00", "10", "11", "1001", "0110", "11000", "00000"};
        for (String input : rejected) {
            SimulationResult result = nfaSimulatorService.simulate(nfa, input);
            assertFalse(result.isAccepted(), "Input '" + input + "' without 101 should be rejected");
            assertFalse(result.getFinalStates().contains("q3"));
            assertTrue(result.getComputationPaths().stream().noneMatch(ComputationPath::isAccepted));
        }
    }

    @Test
    @DisplayName("NFA Epsilon - accepts strings starting with 'a' or ending with 'b'")
    void testNfaEpsilonStartsAOrEndsB_Acceptance() {
        Automaton nfa = createNfaEpsilonStartsAOrEndsB();

        // Starts with 'a': "a", "ab", "aa", "aba"
        // Ends with 'b': "b", "bb", "aab", "baab"
        String[] accepted = {"a", "ab", "aa", "aba", "b", "bb", "aab", "baab", "bab"};
        for (String input : accepted) {
            SimulationResult result = nfaSimulatorService.simulate(nfa, input);
            assertTrue(result.isAccepted(), "Input '" + input + "' should be accepted by NFA with epsilon transitions");
            boolean hasAcceptedPath = result.getComputationPaths().stream().anyMatch(ComputationPath::isAccepted);
            assertTrue(hasAcceptedPath, "At least one computation path must accept for input: " + input);
        }
    }

    @Test
    @DisplayName("NFA Epsilon - rejects strings neither starting with 'a' nor ending with 'b'")
    void testNfaEpsilonStartsAOrEndsB_Rejection() {
        Automaton nfa = createNfaEpsilonStartsAOrEndsB();

        // Neither starts with 'a' nor ends with 'b': "ba", "bba", "bababa", ""
        String[] rejected = {"", "ba", "bba", "bababa", "bbba"};
        for (String input : rejected) {
            SimulationResult result = nfaSimulatorService.simulate(nfa, input);
            assertFalse(result.isAccepted(), "Input '" + input + "' should be rejected by NFA with epsilon transitions");
            assertTrue(result.getComputationPaths().stream().noneMatch(ComputationPath::isAccepted));
        }
    }

    @Test
    @DisplayName("Epsilon-Closure calculation - tests transitive closure and cycle handling")
    void testEpsilonClosure() {
        Map<String, Set<String>> epsTransitions = new HashMap<>();
        // q0 -ε-> q1, q1 -ε-> q2, q2 -ε-> q0 (cycle)
        epsTransitions.put("q0", Collections.singleton("q1"));
        epsTransitions.put("q1", Collections.singleton("q2"));
        epsTransitions.put("q2", Collections.singleton("q0"));

        Set<String> closure = nfaSimulatorService.computeEpsilonClosure(
                Collections.singleton("q0"), epsTransitions
        );

        assertEquals(new HashSet<>(Arrays.asList("q0", "q1", "q2")), closure);
    }

    @Test
    @DisplayName("NFA Step-by-step trace - tracks active state subsets at each step")
    void testNfaStepByStepTrace() {
        Automaton nfa = createNfaSubstring101();
        SimulationResult result = nfaSimulatorService.simulate(nfa, "101");

        List<SimulationStep> steps = result.getSteps();
        assertEquals(3, steps.size());

        // Step 1: reading '1' from {q0} -> {q0, q1}
        SimulationStep step1 = steps.get(0);
        assertEquals(1, step1.getStepNumber());
        assertEquals("1", step1.getSymbol());
        assertEquals(new HashSet<>(Arrays.asList("q0", "q1")), step1.getNextStates());

        // Step 2: reading '0' from {q0, q1} -> {q0, q2}
        SimulationStep step2 = steps.get(1);
        assertEquals(2, step2.getStepNumber());
        assertEquals("0", step2.getSymbol());
        assertEquals(new HashSet<>(Arrays.asList("q0", "q2")), step2.getNextStates());

        // Step 3: reading '1' from {q0, q2} -> {q0, q1, q3}
        SimulationStep step3 = steps.get(2);
        assertEquals(3, step3.getStepNumber());
        assertEquals("1", step3.getSymbol());
        assertEquals(new HashSet<>(Arrays.asList("q0", "q1", "q3")), step3.getNextStates());

        assertTrue(result.isAccepted());
    }
}

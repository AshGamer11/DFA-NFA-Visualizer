package com.visualizer.automata.service;

import com.visualizer.automata.model.Automaton;
import com.visualizer.automata.model.AutomatonType;
import com.visualizer.automata.model.SimulationResult;
import com.visualizer.automata.model.SimulationStep;
import com.visualizer.automata.model.Transition;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.util.*;

import static org.junit.jupiter.api.Assertions.*;

@DisplayName("DFA Simulator Service Tests")
class DFASimulatorServiceTest {

    private DFASimulatorService dfaSimulatorService;

    @BeforeEach
    void setUp() {
        dfaSimulatorService = new DFASimulatorService();
    }

    private Automaton createDfaEndingIn01() {
        Automaton dfa = new Automaton();
        dfa.setName("Ends in 01");
        dfa.setType(AutomatonType.DFA);
        dfa.setStates(new LinkedHashSet<>(Arrays.asList("q0", "q1", "q2")));
        dfa.setAlphabet(new LinkedHashSet<>(Arrays.asList("0", "1")));
        dfa.setStartState("q0");
        dfa.setAcceptStates(new LinkedHashSet<>(Collections.singletonList("q2")));
        dfa.setTransitions(Arrays.asList(
                new Transition("q0", "0", "q1"),
                new Transition("q0", "1", "q0"),
                new Transition("q1", "0", "q1"),
                new Transition("q1", "1", "q2"),
                new Transition("q2", "0", "q1"),
                new Transition("q2", "1", "q0")
        ));
        return dfa;
    }

    private Automaton createDfaEven0s() {
        Automaton dfa = new Automaton();
        dfa.setName("Even 0s");
        dfa.setType(AutomatonType.DFA);
        dfa.setStates(new LinkedHashSet<>(Arrays.asList("q_even", "q_odd")));
        dfa.setAlphabet(new LinkedHashSet<>(Arrays.asList("0", "1")));
        dfa.setStartState("q_even");
        dfa.setAcceptStates(new LinkedHashSet<>(Collections.singletonList("q_even")));
        dfa.setTransitions(Arrays.asList(
                new Transition("q_even", "0", "q_odd"),
                new Transition("q_even", "1", "q_even"),
                new Transition("q_odd", "0", "q_even"),
                new Transition("q_odd", "1", "q_odd")
        ));
        return dfa;
    }

    @Test
    @DisplayName("DFA Ending in '01' - accepts valid strings ending in 01")
    void testDfaEndingIn01_Acceptance() {
        Automaton dfa = createDfaEndingIn01();

        String[] acceptedInputs = {"01", "101", "001", "1001", "000101", "11101"};
        for (String input : acceptedInputs) {
            SimulationResult result = dfaSimulatorService.simulate(dfa, input);
            assertTrue(result.isAccepted(), "Input '" + input + "' should be accepted by DFA ending in 01");
            assertEquals(Collections.singleton("q2"), result.getFinalStates());
            assertEquals(input.length(), result.getSteps().size());
        }
    }

    @Test
    @DisplayName("DFA Ending in '01' - rejects invalid strings not ending in 01")
    void testDfaEndingIn01_Rejection() {
        Automaton dfa = createDfaEndingIn01();

        String[] rejectedInputs = {"", "0", "1", "00", "10", "11", "010", "1010", "000", "011"};
        for (String input : rejectedInputs) {
            SimulationResult result = dfaSimulatorService.simulate(dfa, input);
            assertFalse(result.isAccepted(), "Input '" + input + "' should be rejected by DFA ending in 01");
            assertNotEquals(Collections.singleton("q2"), result.getFinalStates());
        }
    }

    @Test
    @DisplayName("DFA Even 0s - correctly accepts strings with even number of 0s")
    void testDfaEven0s_Acceptance() {
        Automaton dfa = createDfaEven0s();

        String[] acceptedInputs = {"", "1", "11", "00", "100", "010", "001", "10101", "010100"};
        for (String input : acceptedInputs) {
            SimulationResult result = dfaSimulatorService.simulate(dfa, input);
            assertTrue(result.isAccepted(), "Input '" + input + "' with even 0s should be accepted");
            assertEquals(Collections.singleton("q_even"), result.getFinalStates());
        }
    }

    @Test
    @DisplayName("DFA Even 0s - correctly rejects strings with odd number of 0s")
    void testDfaEven0s_Rejection() {
        Automaton dfa = createDfaEven0s();

        String[] rejectedInputs = {"0", "01", "10", "110", "000", "10100", "01111"};
        for (String input : rejectedInputs) {
            SimulationResult result = dfaSimulatorService.simulate(dfa, input);
            assertFalse(result.isAccepted(), "Input '" + input + "' with odd 0s should be rejected");
            assertEquals(Collections.singleton("q_odd"), result.getFinalStates());
        }
    }

    @Test
    @DisplayName("DFA Step-by-step verification - checks each intermediate transition and remaining input")
    void testDfaTraceStepByStep() {
        Automaton dfa = createDfaEndingIn01();
        SimulationResult result = dfaSimulatorService.simulate(dfa, "01");

        List<SimulationStep> steps = result.getSteps();
        assertEquals(2, steps.size());

        // Step 1: reading '0'
        SimulationStep step1 = steps.get(0);
        assertEquals(1, step1.getStepNumber());
        assertEquals(Collections.singleton("q0"), step1.getCurrentStates());
        assertEquals("0", step1.getSymbol());
        assertEquals(Collections.singleton("q1"), step1.getNextStates());
        assertEquals("1", step1.getRemainingInput());

        // Step 2: reading '1'
        SimulationStep step2 = steps.get(1);
        assertEquals(2, step2.getStepNumber());
        assertEquals(Collections.singleton("q1"), step2.getCurrentStates());
        assertEquals("1", step2.getSymbol());
        assertEquals(Collections.singleton("q2"), step2.getNextStates());
        assertEquals("", step2.getRemainingInput());

        // Computation Path verification
        assertNotNull(result.getComputationPaths());
        assertEquals(1, result.getComputationPaths().size());
        assertEquals("ACCEPTED", result.getComputationPaths().get(0).getStatus());
        assertEquals(Arrays.asList("q0", "q1", "q2"), result.getComputationPaths().get(0).getStates());
    }

    @Test
    @DisplayName("DFA Incomplete transition table - halts and rejects on missing transition")
    void testDfaMissingTransitionHalts() {
        Automaton dfa = new Automaton();
        dfa.setName("Incomplete DFA");
        dfa.setType(AutomatonType.DFA);
        dfa.setStates(new LinkedHashSet<>(Arrays.asList("A", "B")));
        dfa.setAlphabet(new LinkedHashSet<>(Arrays.asList("0", "1")));
        dfa.setStartState("A");
        dfa.setAcceptStates(new LinkedHashSet<>(Collections.singletonList("B")));
        // Only transition is from A on '0' -> B; no transition on '1'
        dfa.setTransitions(Collections.singletonList(
                new Transition("A", "0", "B")
        ));

        // When reading "1", A has no transition for '1'
        SimulationResult result = dfaSimulatorService.simulate(dfa, "1");
        assertFalse(result.isAccepted());
        assertEquals(1, result.getSteps().size());
        assertTrue(result.getFinalStates().isEmpty());
        assertEquals("STUCK", result.getComputationPaths().get(0).getStatus());
    }
}

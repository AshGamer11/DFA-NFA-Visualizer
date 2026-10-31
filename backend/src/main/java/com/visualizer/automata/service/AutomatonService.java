package com.visualizer.automata.service;

import com.visualizer.automata.exception.AutomatonNotFoundException;
import com.visualizer.automata.exception.InvalidAutomatonException;
import com.visualizer.automata.model.*;
import com.visualizer.automata.repository.AutomatonRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.*;

/**
 * Service managing automaton entities, persistence in MongoDB, validation orchestration,
 * simulation dispatching (DFA vs NFA), and built-in example automata.
 */
@Service
public class AutomatonService {

    private final AutomatonRepository automatonRepository;
    private final AutomatonValidatorService validatorService;
    private final DFASimulatorService dfaSimulatorService;
    private final NFASimulatorService nfaSimulatorService;

    public AutomatonService(
            AutomatonRepository automatonRepository,
            AutomatonValidatorService validatorService,
            DFASimulatorService dfaSimulatorService,
            NFASimulatorService nfaSimulatorService) {
        this.automatonRepository = automatonRepository;
        this.validatorService = validatorService;
        this.dfaSimulatorService = dfaSimulatorService;
        this.nfaSimulatorService = nfaSimulatorService;
    }

    /**
     * Saves a new or updated automaton to MongoDB after full validation.
     */
    public Automaton saveAutomaton(Automaton automaton) {
        ValidationResult validation = validatorService.validate(automaton);
        if (!validation.isValid()) {
            throw new InvalidAutomatonException("Automaton validation failed", validation.getErrors());
        }

        if (automaton.getCreatedAt() == null) {
            automaton.setCreatedAt(LocalDateTime.now());
        }
        automaton.setUpdatedAt(LocalDateTime.now());

        return automatonRepository.save(automaton);
    }

    /**
     * Retrieves all saved automata from MongoDB.
     */
    public List<Automaton> getAllAutomata() {
        return automatonRepository.findAll();
    }

    /**
     * Retrieves an automaton by its MongoDB ID.
     */
    public Automaton getAutomatonById(String id) {
        return automatonRepository.findById(id)
                .orElseThrow(() -> new AutomatonNotFoundException(id));
    }

    /**
     * Deletes an automaton by ID.
     */
    public void deleteAutomaton(String id) {
        if (!automatonRepository.existsById(id)) {
            throw new AutomatonNotFoundException(id);
        }
        automatonRepository.deleteById(id);
    }

    /**
     * Validates an automaton definition without saving.
     */
    public ValidationResult validateAutomaton(Automaton automaton) {
        return validatorService.validate(automaton);
    }

    /**
     * Simulates an input string on an automaton (retrieved by ID or provided inline).
     */
    public SimulationResult simulate(SimulationRequest request) {
        Automaton automaton = resolveAutomaton(request.getAutomatonId(), request.getAutomaton());

        ValidationResult validation = validatorService.validate(automaton);
        if (!validation.isValid()) {
            throw new InvalidAutomatonException("Cannot simulate invalid automaton", validation.getErrors());
        }

        String input = request.getInputString() != null ? request.getInputString() : "";

        if (automaton.getType() == AutomatonType.DFA) {
            return dfaSimulatorService.simulate(automaton, input);
        } else {
            return nfaSimulatorService.simulate(automaton, input);
        }
    }

    /**
     * Simulates multiple input strings against an automaton in a single batch.
     */
    public BatchSimulationResult simulateBatch(BatchSimulationRequest request) {
        Automaton automaton = resolveAutomaton(request.getAutomatonId(), request.getAutomaton());

        ValidationResult validation = validatorService.validate(automaton);
        if (!validation.isValid()) {
            throw new InvalidAutomatonException("Cannot simulate batch on invalid automaton", validation.getErrors());
        }

        List<SimulationResult> results = new ArrayList<>();
        List<String> inputs = request.getInputs() != null ? request.getInputs() : Collections.emptyList();

        for (String input : inputs) {
            SimulationResult res;
            if (automaton.getType() == AutomatonType.DFA) {
                res = dfaSimulatorService.simulate(automaton, input);
            } else {
                res = nfaSimulatorService.simulate(automaton, input);
            }
            results.add(res);
        }

        return new BatchSimulationResult(automaton.getId(), automaton.getName(), automaton.getType(), results);
    }

    /**
     * Resolves the automaton entity from either ID lookup or inline definition.
     */
    private Automaton resolveAutomaton(String automatonId, Automaton inlineAutomaton) {
        if (automatonId != null && !automatonId.trim().isEmpty()) {
            return getAutomatonById(automatonId.trim());
        }
        if (inlineAutomaton != null) {
            return inlineAutomaton;
        }
        throw new IllegalArgumentException("Either 'automatonId' or an inline 'automaton' object must be provided.");
    }

    /**
     * Returns the 4 standard pre-built example automata for educational demonstration:
     * 1. DFA: strings ending in '01' over {0,1}
     * 2. DFA: strings with an even number of 0s over {0,1}
     * 3. NFA: strings containing substring '101' over {0,1}
     * 4. NFA: strings starting with 'a' or ending with 'b' (with epsilon transitions) over {a,b}
     */
    public List<Automaton> getExampleAutomata() {
        List<Automaton> examples = new ArrayList<>();

        // 1. DFA: Strings ending in '01'
        Automaton dfaEnding01 = new Automaton();
        dfaEnding01.setId("example-dfa-ending-01");
        dfaEnding01.setName("DFA: Ending in '01'");
        dfaEnding01.setDescription("Accepts all binary strings over alphabet {0, 1} that end in the sequence '01'.");
        dfaEnding01.setType(AutomatonType.DFA);
        dfaEnding01.setStates(new LinkedHashSet<>(Arrays.asList("q0", "q1", "q2")));
        dfaEnding01.setAlphabet(new LinkedHashSet<>(Arrays.asList("0", "1")));
        dfaEnding01.setStartState("q0");
        dfaEnding01.setAcceptStates(new LinkedHashSet<>(Collections.singletonList("q2")));
        dfaEnding01.setTransitions(Arrays.asList(
                new Transition("q0", "0", Collections.singleton("q1")),
                new Transition("q0", "1", Collections.singleton("q0")),
                new Transition("q1", "0", Collections.singleton("q1")),
                new Transition("q1", "1", Collections.singleton("q2")),
                new Transition("q2", "0", Collections.singleton("q1")),
                new Transition("q2", "1", Collections.singleton("q0"))
        ));
        examples.add(dfaEnding01);

        // 2. DFA: Even number of 0s
        Automaton dfaEven0s = new Automaton();
        dfaEven0s.setId("example-dfa-even-zeros");
        dfaEven0s.setName("DFA: Even Number of 0s");
        dfaEven0s.setDescription("Accepts all binary strings over alphabet {0, 1} containing an even count of '0's (including zero '0's).");
        dfaEven0s.setType(AutomatonType.DFA);
        dfaEven0s.setStates(new LinkedHashSet<>(Arrays.asList("q_even", "q_odd")));
        dfaEven0s.setAlphabet(new LinkedHashSet<>(Arrays.asList("0", "1")));
        dfaEven0s.setStartState("q_even");
        dfaEven0s.setAcceptStates(new LinkedHashSet<>(Collections.singletonList("q_even")));
        dfaEven0s.setTransitions(Arrays.asList(
                new Transition("q_even", "0", Collections.singleton("q_odd")),
                new Transition("q_even", "1", Collections.singleton("q_even")),
                new Transition("q_odd", "0", Collections.singleton("q_even")),
                new Transition("q_odd", "1", Collections.singleton("q_odd"))
        ));
        examples.add(dfaEven0s);

        // 3. NFA: Substring '101'
        Automaton nfaSub101 = new Automaton();
        nfaSub101.setId("example-nfa-substring-101");
        nfaSub101.setName("NFA: Contains Substring '101'");
        nfaSub101.setDescription("Accepts binary strings over {0, 1} that contain '101' as a contiguous substring.");
        nfaSub101.setType(AutomatonType.NFA);
        nfaSub101.setStates(new LinkedHashSet<>(Arrays.asList("q0", "q1", "q2", "q3")));
        nfaSub101.setAlphabet(new LinkedHashSet<>(Arrays.asList("0", "1")));
        nfaSub101.setStartState("q0");
        nfaSub101.setAcceptStates(new LinkedHashSet<>(Collections.singletonList("q3")));
        nfaSub101.setTransitions(Arrays.asList(
                new Transition("q0", "0", Collections.singleton("q0")),
                new Transition("q0", "1", new LinkedHashSet<>(Arrays.asList("q0", "q1"))),
                new Transition("q1", "0", Collections.singleton("q2")),
                new Transition("q2", "1", Collections.singleton("q3")),
                new Transition("q3", "0", Collections.singleton("q3")),
                new Transition("q3", "1", Collections.singleton("q3"))
        ));
        examples.add(nfaSub101);

        // 4. NFA with Epsilon Transitions: Starts with 'a' or ends with 'b'
        Automaton nfaEpsilon = new Automaton();
        nfaEpsilon.setId("example-nfa-epsilon-a-or-b");
        nfaEpsilon.setName("NFA (with ε): Starts with 'a' or Ends with 'b'");
        nfaEpsilon.setDescription("NFA with epsilon-transitions over alphabet {a, b} accepting strings starting with 'a' OR ending with 'b'.");
        nfaEpsilon.setType(AutomatonType.NFA);
        nfaEpsilon.setStates(new LinkedHashSet<>(Arrays.asList("q_start", "q_starts_a", "q_accept_a", "q_ends_b", "q_accept_b")));
        nfaEpsilon.setAlphabet(new LinkedHashSet<>(Arrays.asList("a", "b")));
        nfaEpsilon.setStartState("q_start");
        nfaEpsilon.setAcceptStates(new LinkedHashSet<>(Arrays.asList("q_accept_a", "q_accept_b")));
        nfaEpsilon.setTransitions(Arrays.asList(
                new Transition("q_start", "ε", new LinkedHashSet<>(Arrays.asList("q_starts_a", "q_ends_b"))),
                new Transition("q_starts_a", "a", Collections.singleton("q_accept_a")),
                new Transition("q_accept_a", "a", Collections.singleton("q_accept_a")),
                new Transition("q_accept_a", "b", Collections.singleton("q_accept_a")),
                new Transition("q_ends_b", "a", Collections.singleton("q_ends_b")),
                new Transition("q_ends_b", "b", new LinkedHashSet<>(Arrays.asList("q_ends_b", "q_accept_b")))
        ));
        examples.add(nfaEpsilon);

        return examples;
    }
}

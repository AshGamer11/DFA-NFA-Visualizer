package com.visualizer.automata.model;

import jakarta.validation.Valid;
import java.util.ArrayList;
import java.util.List;

/**
 * Request payload for simulating multiple strings against an automaton.
 */
public class BatchSimulationRequest {

    private String automatonId;

    @Valid
    private Automaton automaton;

    private List<String> inputs = new ArrayList<>();

    public BatchSimulationRequest() {
    }

    public BatchSimulationRequest(String automatonId, List<String> inputs) {
        this.automatonId = automatonId;
        this.inputs = inputs != null ? new ArrayList<>(inputs) : new ArrayList<>();
    }

    public BatchSimulationRequest(Automaton automaton, List<String> inputs) {
        this.automaton = automaton;
        this.inputs = inputs != null ? new ArrayList<>(inputs) : new ArrayList<>();
    }

    public String getAutomatonId() {
        return automatonId;
    }

    public void setAutomatonId(String automatonId) {
        this.automatonId = automatonId;
    }

    public Automaton getAutomaton() {
        return automaton;
    }

    public void setAutomaton(Automaton automaton) {
        this.automaton = automaton;
    }

    public List<String> getInputs() {
        return inputs;
    }

    public void setInputs(List<String> inputs) {
        this.inputs = inputs != null ? new ArrayList<>(inputs) : new ArrayList<>();
    }
}

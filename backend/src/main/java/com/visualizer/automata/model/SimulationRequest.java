package com.visualizer.automata.model;

import jakarta.validation.Valid;

/**
 * Request payload for string simulation.
 * The client can provide an existing automaton ID or supply a full inline automaton definition.
 */
public class SimulationRequest {

    private String automatonId;

    @Valid
    private Automaton automaton;

    /**
     * The input string to process. Can be empty string "" (representing epsilon).
     */
    private String inputString = "";

    public SimulationRequest() {
    }

    public SimulationRequest(String automatonId, String inputString) {
        this.automatonId = automatonId;
        this.inputString = inputString != null ? inputString : "";
    }

    public SimulationRequest(Automaton automaton, String inputString) {
        this.automaton = automaton;
        this.inputString = inputString != null ? inputString : "";
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

    public String getInputString() {
        return inputString != null ? inputString : "";
    }

    public void setInputString(String inputString) {
        this.inputString = inputString != null ? inputString : "";
    }

    @Override
    public String toString() {
        return "SimulationRequest{" +
                "automatonId='" + automatonId + '\'' +
                ", hasInlineAutomaton=" + (automaton != null) +
                ", inputString='" + inputString + '\'' +
                '}';
    }
}

package com.visualizer.automata.model;

import java.util.ArrayList;
import java.util.List;

/**
 * Represents a single non-deterministic computation branch/path through an NFA (or unique DFA path).
 * Shows the full sequence of states, consumed symbols, and the acceptance status of this path.
 */
public class ComputationPath {

    private int pathId;
    private List<String> states = new ArrayList<>();
    private List<String> symbols = new ArrayList<>();
    private List<SimulationStep> steps = new ArrayList<>();
    private String finalState;
    private boolean accepted;
    private String status; // ACCEPTED, REJECTED, STUCK
    private String trace;

    public ComputationPath() {
    }

    public ComputationPath(int pathId, List<String> states, List<String> symbols,
                           List<SimulationStep> steps, String finalState, boolean accepted,
                           String status, String trace) {
        this.pathId = pathId;
        this.states = states != null ? new ArrayList<>(states) : new ArrayList<>();
        this.symbols = symbols != null ? new ArrayList<>(symbols) : new ArrayList<>();
        this.steps = steps != null ? new ArrayList<>(steps) : new ArrayList<>();
        this.finalState = finalState;
        this.accepted = accepted;
        this.status = status;
        this.trace = trace;
    }

    public int getPathId() {
        return pathId;
    }

    public void setPathId(int pathId) {
        this.pathId = pathId;
    }

    public List<String> getStates() {
        return states;
    }

    public void setStates(List<String> states) {
        this.states = states != null ? new ArrayList<>(states) : new ArrayList<>();
    }

    public List<String> getSymbols() {
        return symbols;
    }

    public void setSymbols(List<String> symbols) {
        this.symbols = symbols != null ? new ArrayList<>(symbols) : new ArrayList<>();
    }

    public List<SimulationStep> getSteps() {
        return steps;
    }

    public void setSteps(List<SimulationStep> steps) {
        this.steps = steps != null ? new ArrayList<>(steps) : new ArrayList<>();
    }

    public String getFinalState() {
        return finalState;
    }

    public void setFinalState(String finalState) {
        this.finalState = finalState;
    }

    public boolean isAccepted() {
        return accepted;
    }

    public void setAccepted(boolean accepted) {
        this.accepted = accepted;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getTrace() {
        return trace;
    }

    public void setTrace(String trace) {
        this.trace = trace;
    }

    @Override
    public String toString() {
        return "ComputationPath{" +
                "pathId=" + pathId +
                ", states=" + states +
                ", finalState='" + finalState + '\'' +
                ", accepted=" + accepted +
                ", status='" + status + '\'' +
                '}';
    }
}

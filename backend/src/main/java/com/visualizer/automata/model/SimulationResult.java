package com.visualizer.automata.model;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

/**
 * Result of a DFA or NFA string simulation run.
 * Contains whether the string was accepted, the active states at termination,
 * the step-by-step trace, and all individual computation paths explored.
 */
public class SimulationResult {

    private String automatonId;
    private String automatonName;
    private AutomatonType automatonType;
    private String inputString;
    private boolean accepted;
    private Set<String> finalStates = new HashSet<>();
    private List<SimulationStep> steps = new ArrayList<>();
    private List<ComputationPath> computationPaths = new ArrayList<>();
    private String executionSummary;
    private long executionTimeMs;

    public SimulationResult() {
    }

    public SimulationResult(String automatonId, String automatonName, AutomatonType automatonType,
                            String inputString, boolean accepted, Set<String> finalStates,
                            List<SimulationStep> steps, List<ComputationPath> computationPaths,
                            String executionSummary) {
        this.automatonId = automatonId;
        this.automatonName = automatonName;
        this.automatonType = automatonType;
        this.inputString = inputString;
        this.accepted = accepted;
        this.finalStates = finalStates != null ? new HashSet<>(finalStates) : new HashSet<>();
        this.steps = steps != null ? new ArrayList<>(steps) : new ArrayList<>();
        this.computationPaths = computationPaths != null ? new ArrayList<>(computationPaths) : new ArrayList<>();
        this.executionSummary = executionSummary;
    }

    public String getAutomatonId() {
        return automatonId;
    }

    public void setAutomatonId(String automatonId) {
        this.automatonId = automatonId;
    }

    public String getAutomatonName() {
        return automatonName;
    }

    public void setAutomatonName(String automatonName) {
        this.automatonName = automatonName;
    }

    public AutomatonType getAutomatonType() {
        return automatonType;
    }

    public void setAutomatonType(AutomatonType automatonType) {
        this.automatonType = automatonType;
    }

    public String getInputString() {
        return inputString;
    }

    public void setInputString(String inputString) {
        this.inputString = inputString;
    }

    public boolean isAccepted() {
        return accepted;
    }

    public void setAccepted(boolean accepted) {
        this.accepted = accepted;
    }

    public Set<String> getFinalStates() {
        return finalStates;
    }

    public void setFinalStates(Set<String> finalStates) {
        this.finalStates = finalStates != null ? new HashSet<>(finalStates) : new HashSet<>();
    }

    public List<SimulationStep> getSteps() {
        return steps;
    }

    public void setSteps(List<SimulationStep> steps) {
        this.steps = steps != null ? new ArrayList<>(steps) : new ArrayList<>();
    }

    public List<ComputationPath> getComputationPaths() {
        return computationPaths;
    }

    public void setComputationPaths(List<ComputationPath> computationPaths) {
        this.computationPaths = computationPaths != null ? new ArrayList<>(computationPaths) : new ArrayList<>();
    }

    public String getExecutionSummary() {
        return executionSummary;
    }

    public void setExecutionSummary(String executionSummary) {
        this.executionSummary = executionSummary;
    }

    public long getExecutionTimeMs() {
        return executionTimeMs;
    }

    public void setExecutionTimeMs(long executionTimeMs) {
        this.executionTimeMs = executionTimeMs;
    }

    @Override
    public String toString() {
        return "SimulationResult{" +
                "inputString='" + inputString + '\'' +
                ", accepted=" + accepted +
                ", finalStates=" + finalStates +
                ", totalSteps=" + (steps != null ? steps.size() : 0) +
                ", pathsCount=" + (computationPaths != null ? computationPaths.size() : 0) +
                '}';
    }
}

package com.visualizer.automata.model;

import java.util.Collections;
import java.util.HashSet;
import java.util.Set;

/**
 * Represents a single step in the step-by-step simulation of string processing.
 */
public class SimulationStep {

    private int stepNumber;
    private Set<String> currentStates = new HashSet<>();
    private String symbol;
    private Set<String> nextStates = new HashSet<>();
    private String remainingInput;
    private String description;
    private boolean epsilonStep;

    public SimulationStep() {
    }

    public SimulationStep(int stepNumber, Set<String> currentStates, String symbol,
                          Set<String> nextStates, String remainingInput, String description) {
        this.stepNumber = stepNumber;
        this.currentStates = currentStates != null ? new HashSet<>(currentStates) : new HashSet<>();
        this.symbol = symbol;
        this.nextStates = nextStates != null ? new HashSet<>(nextStates) : new HashSet<>();
        this.remainingInput = remainingInput;
        this.description = description;
        this.epsilonStep = (symbol == null || symbol.isEmpty() || symbol.equals("ε") || symbol.equalsIgnoreCase("epsilon"));
    }

    public int getStepNumber() {
        return stepNumber;
    }

    public void setStepNumber(int stepNumber) {
        this.stepNumber = stepNumber;
    }

    public Set<String> getCurrentStates() {
        return currentStates != null ? currentStates : Collections.emptySet();
    }

    public void setCurrentStates(Set<String> currentStates) {
        this.currentStates = currentStates != null ? new HashSet<>(currentStates) : new HashSet<>();
    }

    public String getSymbol() {
        return symbol;
    }

    public void setSymbol(String symbol) {
        this.symbol = symbol;
    }

    public Set<String> getNextStates() {
        return nextStates != null ? nextStates : Collections.emptySet();
    }

    public void setNextStates(Set<String> nextStates) {
        this.nextStates = nextStates != null ? new HashSet<>(nextStates) : new HashSet<>();
    }

    public String getRemainingInput() {
        return remainingInput;
    }

    public void setRemainingInput(String remainingInput) {
        this.remainingInput = remainingInput;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public boolean isEpsilonStep() {
        return epsilonStep;
    }

    public void setEpsilonStep(boolean epsilonStep) {
        this.epsilonStep = epsilonStep;
    }

    @Override
    public String toString() {
        return "SimulationStep{" +
                "stepNumber=" + stepNumber +
                ", currentStates=" + currentStates +
                ", symbol='" + symbol + '\'' +
                ", nextStates=" + nextStates +
                ", remainingInput='" + remainingInput + '\'' +
                ", description='" + description + '\'' +
                '}';
    }
}

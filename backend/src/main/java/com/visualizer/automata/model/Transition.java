package com.visualizer.automata.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.NotBlank;
import java.util.Collections;
import java.util.HashSet;
import java.util.Objects;
import java.util.Set;

/**
 * Represents a transition between states in a finite automaton.
 * For DFA: toStates typically contains exactly one target state.
 * For NFA: toStates can contain zero, one, or multiple target states.
 * Symbol can be an alphabet symbol or epsilon ("", "ε", "epsilon", "λ").
 */
public class Transition {

    @NotBlank(message = "fromState must not be blank")
    private String fromState;

    private String symbol;

    private Set<String> toStates = new HashSet<>();

    public Transition() {
    }

    public Transition(String fromState, String symbol, Set<String> toStates) {
        this.fromState = fromState;
        this.symbol = symbol;
        if (toStates != null) {
            this.toStates = new HashSet<>(toStates);
        }
    }

    public Transition(String fromState, String symbol, String singleToState) {
        this.fromState = fromState;
        this.symbol = symbol;
        this.toStates = new HashSet<>();
        if (singleToState != null && !singleToState.trim().isEmpty()) {
            this.toStates.add(singleToState.trim());
        }
    }

    public String getFromState() {
        return fromState;
    }

    public void setFromState(String fromState) {
        this.fromState = fromState != null ? fromState.trim() : null;
    }

    public String getSymbol() {
        return symbol;
    }

    public void setSymbol(String symbol) {
        this.symbol = symbol != null ? symbol.trim() : "";
    }

    public Set<String> getToStates() {
        return toStates != null ? toStates : Collections.emptySet();
    }

    public void setToStates(Set<String> toStates) {
        this.toStates = toStates != null ? new HashSet<>(toStates) : new HashSet<>();
    }

    /**
     * Helper for DFA or clients providing a single 'toState'.
     */
    @JsonProperty("toState")
    public String getToState() {
        if (toStates != null && !toStates.isEmpty()) {
            return toStates.iterator().next();
        }
        return null;
    }

    @JsonProperty("toState")
    public void setToState(String toState) {
        if (toState != null && !toState.trim().isEmpty()) {
            if (this.toStates == null) {
                this.toStates = new HashSet<>();
            }
            this.toStates.add(toState.trim());
        }
    }

    /**
     * Checks if this transition is an epsilon (lambda) transition.
     */
    @JsonIgnore
    public boolean isEpsilon() {
        if (symbol == null || symbol.trim().isEmpty()) {
            return true;
        }
        String s = symbol.trim();
        return s.equals("ε") || s.equalsIgnoreCase("epsilon") || s.equals("λ") || s.equalsIgnoreCase("lambda");
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        Transition that = (Transition) o;
        return Objects.equals(fromState, that.fromState) &&
                Objects.equals(symbol, that.symbol) &&
                Objects.equals(toStates, that.toStates);
    }

    @Override
    public int hashCode() {
        return Objects.hash(fromState, symbol, toStates);
    }

    @Override
    public String toString() {
        return "Transition{" +
                "fromState='" + fromState + '\'' +
                ", symbol='" + symbol + '\'' +
                ", toStates=" + toStates +
                '}';
    }
}

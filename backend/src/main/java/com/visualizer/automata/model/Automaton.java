package com.visualizer.automata.model;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

/**
 * MongoDB document entity representing a Finite Automaton (DFA or NFA).
 * Consists of the 5-tuple: (Q, Σ, δ, q0, F)
 * - Q: states
 * - Σ: alphabet
 * - δ: transitions
 * - q0: startState
 * - F: acceptStates
 */
@Document(collection = "automata")
public class Automaton {

    @Id
    private String id;

    private String name;

    private String description;

    @NotNull(message = "Automaton type is required (DFA or NFA)")
    private AutomatonType type;

    @NotEmpty(message = "States set cannot be empty")
    private Set<String> states = new HashSet<>();

    @NotEmpty(message = "Alphabet cannot be empty")
    private Set<String> alphabet = new HashSet<>();

    private List<Transition> transitions = new ArrayList<>();

    @NotBlank(message = "Start state cannot be blank")
    private String startState;

    private Set<String> acceptStates = new HashSet<>();

    @CreatedDate
    private LocalDateTime createdAt;

    @LastModifiedDate
    private LocalDateTime updatedAt;

    public Automaton() {
    }

    public Automaton(String id, String name, String description, AutomatonType type,
                     Set<String> states, Set<String> alphabet,
                     List<Transition> transitions, String startState, Set<String> acceptStates) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.type = type;
        this.states = states != null ? new HashSet<>(states) : new HashSet<>();
        this.alphabet = alphabet != null ? new HashSet<>(alphabet) : new HashSet<>();
        this.transitions = transitions != null ? new ArrayList<>(transitions) : new ArrayList<>();
        this.startState = startState;
        this.acceptStates = acceptStates != null ? new HashSet<>(acceptStates) : new HashSet<>();
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public AutomatonType getType() {
        return type;
    }

    public void setType(AutomatonType type) {
        this.type = type;
    }

    public Set<String> getStates() {
        return states;
    }

    public void setStates(Set<String> states) {
        this.states = states != null ? new HashSet<>(states) : new HashSet<>();
    }

    public Set<String> getAlphabet() {
        return alphabet;
    }

    public void setAlphabet(Set<String> alphabet) {
        this.alphabet = alphabet != null ? new HashSet<>(alphabet) : new HashSet<>();
    }

    public List<Transition> getTransitions() {
        return transitions;
    }

    public void setTransitions(List<Transition> transitions) {
        this.transitions = transitions != null ? new ArrayList<>(transitions) : new ArrayList<>();
    }

    public String getStartState() {
        return startState;
    }

    public void setStartState(String startState) {
        this.startState = startState != null ? startState.trim() : null;
    }

    public Set<String> getAcceptStates() {
        return acceptStates;
    }

    public void setAcceptStates(Set<String> acceptStates) {
        this.acceptStates = acceptStates != null ? new HashSet<>(acceptStates) : new HashSet<>();
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }

    @Override
    public String toString() {
        return "Automaton{" +
                "id='" + id + '\'' +
                ", name='" + name + '\'' +
                ", type=" + type +
                ", states=" + states +
                ", alphabet=" + alphabet +
                ", startState='" + startState + '\'' +
                ", acceptStates=" + acceptStates +
                '}';
    }
}

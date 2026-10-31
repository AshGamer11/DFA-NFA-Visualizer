package com.visualizer.automata.exception;

/**
 * Exception thrown when an automaton with a requested ID is not found.
 */
public class AutomatonNotFoundException extends RuntimeException {

    public AutomatonNotFoundException(String id) {
        super("Automaton not found with id: " + id);
    }
}

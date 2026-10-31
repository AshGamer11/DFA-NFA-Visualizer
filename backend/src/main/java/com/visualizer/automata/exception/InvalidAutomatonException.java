package com.visualizer.automata.exception;

import java.util.ArrayList;
import java.util.List;

/**
 * Exception thrown when an automaton definition fails validation checks.
 */
public class InvalidAutomatonException extends RuntimeException {

    private final List<String> errors;

    public InvalidAutomatonException(String message) {
        super(message);
        this.errors = new ArrayList<>();
        this.errors.add(message);
    }

    public InvalidAutomatonException(String message, List<String> errors) {
        super(message);
        this.errors = errors != null ? new ArrayList<>(errors) : new ArrayList<>();
    }

    public List<String> getErrors() {
        return errors;
    }
}

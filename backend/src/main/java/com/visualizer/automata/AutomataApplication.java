package com.visualizer.automata;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * Main entry point for the Automata Visualizer Spring Boot application.
 * Provides REST APIs for DFA/NFA simulation, validation, and storage.
 */
@SpringBootApplication
public class AutomataApplication {

    public static void main(String[] args) {
        SpringApplication.run(AutomataApplication.class, args);
    }
}

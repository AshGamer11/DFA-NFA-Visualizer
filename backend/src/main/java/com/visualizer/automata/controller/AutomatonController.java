package com.visualizer.automata.controller;

import com.visualizer.automata.model.Automaton;
import com.visualizer.automata.model.ValidationResult;
import com.visualizer.automata.service.AutomatonService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Controller for automaton definitions, CRUD management, validation,
 * and retrieval of pre-built educational example automata.
 */
@RestController
@Tag(name = "Automata", description = "APIs for Automaton storage, retrieval, validation, and pre-built examples")
public class AutomatonController {

    private final AutomatonService automatonService;

    public AutomatonController(AutomatonService automatonService) {
        this.automatonService = automatonService;
    }

    @PostMapping("/api/automata")
    @Operation(summary = "Save a new or updated automaton to MongoDB")
    public ResponseEntity<Automaton> saveAutomaton(@Valid @RequestBody Automaton automaton) {
        Automaton saved = automatonService.saveAutomaton(automaton);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    @GetMapping("/api/automata")
    @Operation(summary = "Retrieve all saved automata definitions")
    public ResponseEntity<List<Automaton>> getAllAutomata() {
        return ResponseEntity.ok(automatonService.getAllAutomata());
    }

    @GetMapping("/api/automata/{id}")
    @Operation(summary = "Get an automaton by its MongoDB ID")
    public ResponseEntity<Automaton> getAutomatonById(@PathVariable String id) {
        return ResponseEntity.ok(automatonService.getAutomatonById(id));
    }

    @DeleteMapping("/api/automata/{id}")
    @Operation(summary = "Delete an automaton by ID")
    public ResponseEntity<Void> deleteAutomaton(@PathVariable String id) {
        automatonService.deleteAutomaton(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/api/automata/validate")
    @Operation(summary = "Validate an automaton definition without saving it")
    public ResponseEntity<ValidationResult> validateAutomaton(@RequestBody Automaton automaton) {
        ValidationResult result = automatonService.validateAutomaton(automaton);
        return ResponseEntity.ok(result);
    }

    @GetMapping("/api/examples")
    @Operation(summary = "Get pre-built educational example DFA and NFA automata")
    public ResponseEntity<List<Automaton>> getExamples() {
        return ResponseEntity.ok(automatonService.getExampleAutomata());
    }
}

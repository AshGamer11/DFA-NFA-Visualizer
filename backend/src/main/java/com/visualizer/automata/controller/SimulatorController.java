package com.visualizer.automata.controller;

import com.visualizer.automata.model.BatchSimulationRequest;
import com.visualizer.automata.model.BatchSimulationResult;
import com.visualizer.automata.model.SimulationRequest;
import com.visualizer.automata.model.SimulationResult;
import com.visualizer.automata.service.AutomatonService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Controller for running single-string or batch-string step-by-step simulations
 * on DFA and NFA automata.
 */
@RestController
@RequestMapping("/api/simulate")
@Tag(name = "Simulation", description = "APIs for step-by-step and batch string simulation on DFA and NFA automata")
public class SimulatorController {

    private final AutomatonService automatonService;

    public SimulatorController(AutomatonService automatonService) {
        this.automatonService = automatonService;
    }

    @PostMapping
    @Operation(summary = "Simulate step-by-step string processing on a DFA or NFA")
    public ResponseEntity<SimulationResult> simulate(@Valid @RequestBody SimulationRequest request) {
        SimulationResult result = automatonService.simulate(request);
        return ResponseEntity.ok(result);
    }

    @PostMapping("/batch")
    @Operation(summary = "Simulate multiple input strings against an automaton in a single batch")
    public ResponseEntity<BatchSimulationResult> simulateBatch(@Valid @RequestBody BatchSimulationRequest request) {
        BatchSimulationResult result = automatonService.simulateBatch(request);
        return ResponseEntity.ok(result);
    }
}

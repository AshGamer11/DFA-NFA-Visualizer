package com.visualizer.automata.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.LinkedHashMap;
import java.util.Map;

/**
 * Root controller handling requests to http://localhost:8080/
 * Provides system status and links to Swagger UI and API endpoints.
 */
@RestController
@Tag(name = "Root", description = "Root server information and entry point")
public class RootController {

    @GetMapping("/")
    @Operation(summary = "Root API status and directory of services")
    public ResponseEntity<Map<String, Object>> root() {
        Map<String, Object> response = new LinkedHashMap<>();
        response.put("service", "Theory of Computation: DFA / NFA / ε-NFA Visualizer Backend");
        response.put("status", "UP");
        response.put("version", "1.0.0");
        response.put("frontendUrl", "http://localhost:3000");
        response.put("swaggerDocs", "http://localhost:8080/swagger-ui.html");
        response.put("openApiSpec", "http://localhost:8080/v3/api-docs");

        Map<String, String> endpoints = new LinkedHashMap<>();
        endpoints.put("health", "GET /api/health");
        endpoints.put("prebuiltExamples", "GET /api/examples");
        endpoints.put("listAutomata", "GET /api/automata");
        endpoints.put("saveAutomaton", "POST /api/automata");
        endpoints.put("validateAutomaton", "POST /api/automata/validate");
        endpoints.put("singleSimulation", "POST /api/simulate");
        endpoints.put("batchSimulation", "POST /api/simulate/batch");
        response.put("availableEndpoints", endpoints);

        return ResponseEntity.ok(response);
    }
}

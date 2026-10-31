# DFA/NFA String Processing Visualizer - Backend

Spring Boot 3.2+ backend service for simulating, visualizing, validating, and persisting Deterministic Finite Automata (DFA) and Nondeterministic Finite Automata (NFA) with full epsilon (λ/ε) transition support.

Built for **CSET302 - Automata Theory**.

---

## 🛠 Tech Stack
- **Framework:** Spring Boot 3.2.5 (Java 17)
- **Database:** MongoDB
- **Build Tool:** Apache Maven
- **API Documentation:** Springdoc OpenAPI 2.5.0 (Swagger UI)
- **Testing:** JUnit 5, AssertJ, Mockito

---

## 📁 Project Structure

```
backend/
├── pom.xml
├── README.md
├── src/main/java/com/visualizer/automata/
│   ├── AutomataApplication.java             # Spring Boot Application entrypoint
│   ├── config/
│   │   ├── CorsConfig.java                  # CORS configuration (all origins allowed for dev)
│   │   └── MongoConfig.java                 # MongoDB repository & auditing configuration
│   ├── model/
│   │   ├── AutomatonType.java               # DFA or NFA enum
│   │   ├── Automaton.java                   # MongoDB document (5-tuple: Q, Σ, δ, q0, F)
│   │   ├── Transition.java                  # State transition (fromState, symbol, toStates)
│   │   ├── SimulationRequest.java           # Request payload (by ID or inline automaton + input string)
│   │   ├── SimulationResult.java            # Detailed simulation outcome, steps, active states, paths
│   │   ├── SimulationStep.java              # Step trace (stepNumber, currentStates, symbol, nextStates, remainingInput)
│   │   ├── ComputationPath.java             # Branching execution tree path for NFA/DFA
│   │   ├── BatchSimulationRequest.java      # Batch simulation request
│   │   ├── BatchSimulationResult.java       # Batch simulation outcome
│   │   └── ValidationResult.java            # Mathematical validation outcome (valid, errors, warnings)
│   ├── repository/
│   │   └── AutomatonRepository.java         # Spring Data MongoDB repository
│   ├── service/
│   │   ├── DFASimulatorService.java         # Deterministic string simulation engine
│   │   ├── NFASimulatorService.java         # Non-deterministic simulation engine with ε-closure & branch trees
│   │   ├── AutomatonValidatorService.java   # Automata integrity & formal rule validator
│   │   └── AutomatonService.java            # Business logic & pre-built example automata provider
│   ├── controller/
│   │   ├── AutomatonController.java         # CRUD, validation, and educational examples endpoints
│   │   └── SimulatorController.java         # Single-string and batch simulation endpoints
│   └── exception/
│       ├── AutomatonNotFoundException.java  # 404 handler
│       ├── InvalidAutomatonException.java   # 400 validation error handler
│       ├── ErrorResponse.java               # Unified API error response payload
│       └── GlobalExceptionHandler.java      # RestControllerAdvice
├── src/main/resources/
│   └── application.properties               # MongoDB uri, port 8080, and Swagger configs
└── src/test/java/com/visualizer/automata/
    └── service/
        ├── DFASimulatorServiceTest.java     # Unit tests for DFA simulation & edge cases
        ├── NFASimulatorServiceTest.java     # Unit tests for NFA simulation & epsilon-closure
        └── AutomatonValidatorServiceTest.java # Automata definition validation tests
```

---

## 🚀 Running the Backend

### Prerequisites
- JDK 17+ installed (`java -version`)
- Maven 3.8+ installed (`mvn -v`)
- MongoDB running on `mongodb://localhost:27017`

### Build and Test
```bash
mvn clean test
```

### Run Application
```bash
mvn spring-boot:run
```

Once started:
- API Base URL: `http://localhost:8080`
- Swagger UI Documentation: `http://localhost:8080/swagger-ui.html`
- OpenAPI JSON Spec: `http://localhost:8080/api-docs`

---

## 📡 REST API Reference

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/automata` | Save a new automaton definition to MongoDB (auto-validated) |
| `GET` | `/api/automata` | List all saved automata |
| `GET` | `/api/automata/{id}` | Get automaton by ID |
| `DELETE` | `/api/automata/{id}` | Delete automaton by ID |
| `POST` | `/api/automata/validate` | Validate an automaton definition without saving |
| `POST` | `/api/simulate` | Simulate string processing step-by-step (by ID or inline) |
| `POST` | `/api/simulate/batch` | Simulate multiple strings against an automaton |
| `GET` | `/api/examples` | Get 4 pre-built educational automata examples |

---

## 💡 Pre-Built Example Automata

The backend ships with 4 pre-configured educational automata available at `GET /api/examples`:
1. **DFA: Ending in '01'** (Alphabet: `{0, 1}`)
2. **DFA: Even number of 0s** (Alphabet: `{0, 1}`)
3. **NFA: Contains substring '101'** (Alphabet: `{0, 1}`)
4. **NFA (with ε): Starts with 'a' or ends with 'b'** (Alphabet: `{a, b}`)

---

## 🧪 Algorithms Implemented

### 1. DFA Deterministic Simulation
- Begins at `startState`.
- Iterates over each symbol in input string.
- Follows deterministic transition $\delta(q, a) = q'$.
- Records intermediate step state, symbol consumed, remaining input, and transition description.
- Rejection occurs immediately if no valid transition exists (stuck).
- Accepts if and only if final state is in `acceptStates`.

### 2. NFA Simulation with Epsilon-Closure & Computation Tree
- Calculates initial active state set via $\epsilon\text{-closure}(\{startState\})$.
- For each symbol $a$, computes $\bigcup_{s \in Active} \delta(s, a)$, followed by an $\epsilon$-closure expansion.
- Explores all non-deterministic branches using Depth-First Search (DFS) with loop detection on $\epsilon$-cycles.
- Returns both the step-by-step active state progression and full individual computation paths showing the tree of possibilities.
- Accepts if any active state in the final set belongs to `acceptStates`.

### 3. Formal Automaton Validation
- States set $Q$ non-empty.
- Alphabet $\Sigma$ non-empty and does not contain reserved epsilon symbol.
- Start state $q_0 \in Q$.
- Accept states $F \subseteq Q$.
- All transition sources and destinations belong to $Q$.
- All transition symbols belong to $\Sigma$ (or $\epsilon$ for NFA).
- For DFA: No $\epsilon$-transitions allowed, and at most 1 destination state per $(q, a)$ pair. Warnings issued for incomplete transition tables.

# Backend: DFA / NFA / ε-NFA Simulation & Persistence Service

High-performance enterprise backend service built with **Spring Boot 3.4.0** and **Java 23** for validating, executing step-by-step simulations, and persisting finite automata definitions in **MongoDB 8.2**. Developed for **CSET302: Automata Theory and Computability** (Topic 7).

> **Project Documentation Reference:**
> - Full Architecture & Java Project Specs: [`docs/proposal.md`](file:///c:/Users/subhash%20chauhan/OneDrive/Documents/DFA-NFA-Visualizer/docs/proposal.md)
> - BFS $\epsilon$-Closure & Simulation Logic: [`docs/algorithms.md`](file:///c:/Users/subhash%20chauhan/OneDrive/Documents/DFA-NFA-Visualizer/docs/algorithms.md)

---

## 🛠 Tech Stack

- **Framework:** Spring Boot 3.4.0
- **Runtime:** Java 23 (JDK 23)
- **Database:** MongoDB Community Server 8.2 (`mongodb://localhost:27017/automata_visualizer`)
- **API Documentation:** SpringDoc OpenAPI 3 / Swagger UI (`/swagger-ui.html`)
- **Build Tool:** Apache Maven 3.9+
- **Testing:** JUnit 5, AssertJ, Mockito

---

## 📁 Architecture & Directory Structure

```
backend/
├── pom.xml                                      # Maven dependencies (Spring Boot 3.4, Java 23, MongoDB)
├── README.md                                    # Backend documentation
├── src/main/java/com/visualizer/automata/
│   ├── AutomataApplication.java                 # Spring Boot application bootstrap entry point
│   ├── config/
│   │   ├── CorsConfig.java                      # Cross-Origin Resource Sharing (CORS) rules
│   │   └── MongoConfig.java                     # Spring Data MongoDB client configuration
│   ├── controller/
│   │   ├── RootController.java                  # Handles GET / (API status directory & Swagger links)
│   │   ├── AutomatonController.java             # CRUD, health probe (/api/health), & pre-built examples
│   │   └── SimulatorController.java             # Single-string & batch simulation endpoints
│   ├── model/
│   │   ├── Automaton.java                       # MongoDB document representing 5-tuple (Q, Σ, δ, q0, F)
│   │   ├── AutomatonType.java                   # Model Enum (DFA, NFA)
│   │   ├── Transition.java                      # Transition triple (fromState, symbol, toStates)
│   │   ├── SimulationRequest.java               # Payload containing input string & automaton
│   │   ├── SimulationResult.java                # Output containing trace steps, paths & acceptance
│   │   ├── SimulationStep.java                  # Discrete state snapshot (stepIndex, activeStates, symbol)
│   │   ├── BatchSimulationRequest.java          # Batch test inputs array
│   │   ├── BatchSimulationResult.java           # Batch verification summary with pass/fail counts
│   │   └── ValidationResult.java                # Mathematical consistency result (errors, warnings)
│   ├── repository/
│   │   └── AutomatonRepository.java             # Spring Data MongoDB document repository
│   ├── service/
│   │   ├── DFASimulatorService.java             # Deterministic simulation engine
│   │   ├── NFASimulatorService.java             # Non-deterministic BFS ε-closure & multi-branch engine
│   │   ├── AutomatonValidatorService.java       # Formal 5-tuple syntax and alphabet validator
│   │   └── AutomatonService.java                # Business logic facade & pre-built example provider
│   └── exception/
│       ├── GlobalExceptionHandler.java          # Centralized error handler returning clean JSON responses
│       ├── AutomatonNotFoundException.java      # 404 handler
│       └── InvalidAutomatonException.java       # 400 validation error handler
└── src/main/resources/
    └── application.properties                   # Port 8080 & MongoDB connection string
```

---

## 🚀 Running the Backend

### Prerequisites
- Java 23 JDK installed (`java -version`)
- MongoDB running on port 27017 (`mongod`)
- Apache Maven 3.8+ installed (`mvn -version`)

### Build and Run
```bash
cd backend
mvn clean compile
mvn spring-boot:run
```

Once running:
- **API Root Directory:** [http://localhost:8080/](http://localhost:8080/)
- **Swagger UI Interactive Docs:** [http://localhost:8080/swagger-ui.html](http://localhost:8080/swagger-ui.html)
- **OpenAPI 3 JSON Spec:** [http://localhost:8080/v3/api-docs](http://localhost:8080/v3/api-docs)
- **Health Check Endpoint:** [http://localhost:8080/api/health](http://localhost:8080/api/health)

---

## 📡 REST API Reference

| Method | Endpoint | Description |
|:---|:---|:---|
| `GET` | `/` | Root server info, version, and links to documentation |
| `GET` | `/api/health` | Health check endpoint returning `{ "status": "UP", "service": "automata-visualizer" }` |
| `GET` | `/api/examples` | Returns pre-built educational example automata |
| `GET` | `/api/automata` | Lists all user-saved automata definitions from MongoDB |
| `POST` | `/api/automata` | Validates and saves an automaton definition to MongoDB |
| `GET` | `/api/automata/{id}` | Retrieves a specific automaton by its MongoDB ID |
| `DELETE` | `/api/automata/{id}` | Deletes an automaton definition by ID |
| `POST` | `/api/automata/validate` | Validates a 5-tuple definition without persisting to MongoDB |
| `POST` | `/api/simulate` | Simulates step-by-step string execution on an automaton |
| `POST` | `/api/simulate/batch` | Simulates a batch of strings and returns execution results |

---

## 🔍 Database Notes & Troubleshooting

### Understanding Port 27017 (MongoDB Wire Protocol)
> **Important Note:** A common beginner question is: *"Why do I get `ERR_CONNECTION_RESET` when I visit `http://localhost:27017/automata_visualizer` in Chrome?"*
> 
> **The Reason:** Web browsers communicate via **HTTP** (Hypertext Transfer Protocol). MongoDB does **NOT** run an HTTP web server on port 27017; it uses MongoDB's private, binary **TCP wire protocol** (`mongod`). When Chrome sends an HTTP `GET` request to port 27017, MongoDB detects an invalid non-binary handshake and immediately closes the socket (`ERR_CONNECTION_RESET`). This is the expected and correct behavior.

### How to Inspect the Database Properly:
1. **Via MongoDB Compass (GUI):**
   - Open MongoDB Compass.
   - Enter connection string: `mongodb://localhost:27017`
   - Click **Connect** $\to$ Select database `automata_visualizer` $\to$ Collection `automata_definitions`.
2. **Via MongoDB Shell (`mongosh`):**
   ```bash
   mongosh "mongodb://localhost:27017/automata_visualizer"
   db.automata_definitions.find().pretty()
   ```
3. **Via Spring Boot REST API:**
   - Query [http://localhost:8080/api/automata](http://localhost:8080/api/automata) in your browser or curl to view all saved automata formatted as clean JSON.

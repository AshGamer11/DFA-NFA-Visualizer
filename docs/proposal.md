# Project Proposal & Technical Specification
## Topic 7: DFA / NFA / ε-NFA String Processing Visualizer

**Course:** CSET302 — Automata Theory and Computability  
**Project Topic:** Topic 7 — Automata Simulator & String Processing Visualizer  
**Documentation:** `docs/proposal.md`  
**Target Submission:** Milestone M1 (5 Marks) & Milestone M2 (9 Marks)

---

## 1. Executive Summary & Objectives

In theoretical computer science, Finite Automata are abstract models used to recognize Regular Languages. While textbook mathematical definitions ($M = \langle Q, \Sigma, \delta, q_0, F \rangle$) are clean, students frequently struggle to visualize:
- How characters are consumed one-by-one across discrete time steps.
- How an NFA concurrently splits into parallel computational branches.
- How spontaneous $\epsilon$-transitions expand active states without consuming input.

**Project Goal:** Build a full-stack, responsive, web-based pedagogical simulator that lets users define, visualize, test, and step-through Deterministic Finite Automata (DFA), Non-Deterministic Finite Automata without $\epsilon$-moves (NFA), and $\epsilon$-NFA machines with real-time graph highlighting and physical tape animation.

---

## 2. Architecture & Technology Stack

The project follows a decoupled **3-Tier Architecture** with a dual-engine simulation guarantee:

```
┌─────────────────────────────────────────────────────────────┐
│                 Presentation Layer (Port 3000)              │
│  React 18 SPA + Vite + Cytoscape.js + Lucide Icons          │
│  (Includes In-Browser Standalone Fallback Simulation Engine)│
└──────────────────────────────┬──────────────────────────────┘
                               │ REST HTTP (Proxy: /api)
┌──────────────────────────────▼──────────────────────────────┐
│                 Application Layer (Port 8080)               │
│  Spring Boot 3.4.0 + Java 23 + SpringDoc OpenAPI 3          │
│  (Controllers, BFS ε-Closure Service, Automaton Validator)  │
└──────────────────────────────┬──────────────────────────────┘
                               │ Binary TCP Protocol
┌──────────────────────────────▼──────────────────────────────┐
│                 Database Layer (Port 27017)                 │
│  MongoDB Community Server 8.2 (Database: automata_visualizer)│
└─────────────────────────────────────────────────────────────┘
```

| Layer | Component | Version / Library | Purpose |
|:---|:---|:---|:---|
| **Frontend** | React SPA | React 18.2 + Vite | Reactive, modular component architecture |
| **Graphing** | Force-Directed Graph | Cytoscape.js 3.28 | Draggable, zoomable canvas with layout physics |
| **Backend** | REST API Server | Spring Boot 3.4.0 (Java 23) | High-performance simulation, validation, API routing |
| **Database** | NoSQL Document Store | MongoDB 8.2 | Persistent storage of 5-tuple machine definitions |
| **API Docs** | Interactive Explorer | SpringDoc OpenAPI 3 / Swagger | Live testing of endpoints at `/swagger-ui.html` |
| **Styling** | Modern Theme Engine | Vanilla CSS with CSS Variables | High-contrast dark and light theme palettes |

---

## 3. Full Features List

1. **Unified 3-Model Switcher:**
   - Dedicated modes for **DFA**, **NFA (without $\epsilon$)**, and **$\epsilon$-NFA**.
   - Model-specific validation: DFA enforces single transitions per symbol; NFA without $\epsilon$ disables $\epsilon$ transitions; $\epsilon$-NFA enables spontaneous moves.
2. **Interactive Graph Studio:**
   - Force-directed physics layout with node drag, canvas pan, zoom, fit-to-view, and reset buttons.
   - Node styling: Start state (blue badge), Accept states (double border), Active states (glowing amber halo).
   - Multi-symbol transition edges (`0, 1`) and curved bidirectional paths.
3. **Physical Tape Reader:**
   - Visual tape strip with an animated bouncing read pointer.
   - Real-time cell color coding: **Green** (consumed), **Amber** (current symbol), **Slate** (pending).
4. **Step-by-Step Playback Controls:**
   - Play, Pause, Step Forward, Step Backward, Reset, and a variable speed slider ($0.25\times$ to $4.0\times$).
5. **Dynamic Transition Table ($\delta$ Matrix):**
   - Formal mathematical layout with `→` start and `*` accept indicators.
   - Live row and column intersection highlighting matching active simulation steps.
6. **NFA Execution Branch Tree:**
   - Renders concurrent computational threads and flags accepting paths vs dead ends.
7. **Curated 21 Textbook Examples Library:**
   - 7 pre-built machines per model covering standard exam and textbook problems.
8. **Batch Testing Suite:**
   - Run multiple strings simultaneously with summary pass/fail statistics.
9. **Zero-Downtime Dual Engine:**
   - Runs on the Spring Boot backend when online; automatically falls back to the client-side JavaScript engine if the backend is unreachable.

---

## 4. UI Wireframe & Styling Direction

### Layout Wireframe (2-Column Responsive Workspace)
```
┌────────────────────────────────────────────────────────────────────────────┐
│ HEADER: Topic 7 Visualizer | Model Badge | Backend Status (Online/Offline) │
├──────────────────────────────┬─────────────────────────────────────────────┤
│ LEFT SIDEBAR (540px)         │ RIGHT MAIN WORKSPACE                        │
│                              │                                             │
│ ┌──────────────────────────┐ │ ┌─────────────────────────────────────────┐ │
│ │ 1. Automaton Editor (UP) │ │ │ Cytoscape Force-Directed Graph Canvas   │ │
│ │  - 3-Way Switcher        │ │ │  - Start Badge, Double Rings, Halo Node │ │
│ │  - States, Alphabet      │ │ │  - Floating Zoom & Center Controls      │ │
│ │  - Transitions Grid      │ │ └─────────────────────────────────────────┘ │
│ └──────────────────────────┘ │                                             │
│ ┌──────────────────────────┐ │ ┌─────────────────────────────────────────┐ │
│ │ 2. Textbook Examples     │ │ │ Physical Tape Reader + Bouncing Head    │ │
│ │  - 7 DFA, 7 NFA, 7 ε-NFA │ │ │ [Tape: 1 | 0 | 0 | 1 ]                  │ │
│ └──────────────────────────┘ │ │ Play | Pause | Step | Speed Slider      │ │
│ ┌──────────────────────────┐ │ └─────────────────────────────────────────┘ │
│ │ 3. Theory Card (DOWN)    │ │                                             │
│ │  - Formal 5-Tuple Specs  │ │ ┌───────────────────┐ ┌───────────────────┐ │
│ └──────────────────────────┘ │ │ Transition Table  │ │ NFA Branch Tree   │ │
│                              │ └───────────────────┘ └───────────────────┘ │
└──────────────────────────────┴─────────────────────────────────────────────┘
```

### Styling Direction
- **Primary Palette:** Deep Slate background (`#0f172a`), Dark Navy cards (`#1e293b`), Crisp White text (`#f8fafc`).
- **Semantic Accents:**
  - Start State / Information: **Primary Blue** (`#3b82f6`)
  - Accept State / Success: **Emerald Green** (`#10b981`)
  - Active Step / Tape Head: **Vibrant Amber** (`#f59e0b`)
  - Rejected / Error: **Crimson Red** (`#ef4444`)
- **Card Spacing:** Left sidebar widened to 540px; graph container set to 460px height to prevent vertical congestion.

---

## 5. Java Backend Project Structure

```
backend/
├── pom.xml                                      # Maven dependencies (Spring Boot 3.4.0, Java 23)
├── src/main/java/com/visualizer/automata/
│   ├── AutomataApplication.java                 # Entry point
│   ├── config/
│   │   ├── CorsConfig.java                      # CORS policies for frontend
│   │   └── MongoConfig.java                     # MongoDB connection setup
│   ├── controller/
│   │   ├── RootController.java                  # GET / (API directory & Swagger links)
│   │   ├── AutomatonController.java             # CRUD, health probe, pre-built examples
│   │   └── SimulatorController.java             # Step-by-step & batch simulation
│   ├── model/
│   │   ├── Automaton.java                       # 5-tuple MongoDB document
│   │   ├── AutomatonType.java                   # Enum: DFA, NFA
│   │   ├── Transition.java                      # fromState, symbol, toStates
│   │   ├── SimulationRequest.java               # Payload with input string & machine
│   │   ├── SimulationResult.java                # Steps, active states, accepted boolean
│   │   └── SimulationStep.java                  # Discrete step snapshot
│   ├── repository/
│   │   └── AutomatonRepository.java             # Spring Data MongoDB interface
│   ├── service/
│   │   ├── DFASimulatorService.java             # Deterministic simulation engine
│   │   ├── NFASimulatorService.java             # BFS ε-closure & NFA simulation
│   │   ├── AutomatonValidatorService.java       # Formal 5-tuple syntax validator
│   │   └── AutomatonService.java                # Business logic facade
│   └── exception/
│       └── GlobalExceptionHandler.java          # Centralized error handler
└── src/main/resources/
    └── application.properties                   # Port 8080 & MongoDB URI
```

---

## 6. JSON Data Model & Schema

Each automaton is represented as a formal 5-tuple in JSON format:

```json
{
  "name": "DFA: Strings ending with 01",
  "description": "Recognizes binary strings ending with 01 over alphabet {0, 1}",
  "type": "DFA",
  "states": ["q0", "q1", "q2"],
  "alphabet": ["0", "1"],
  "startState": "q0",
  "acceptStates": ["q2"],
  "transitions": [
    { "fromState": "q0", "symbol": "0", "toStates": ["q1"] },
    { "fromState": "q0", "symbol": "1", "toStates": ["q0"] },
    { "fromState": "q1", "symbol": "0", "toStates": ["q1"] },
    { "fromState": "q1", "symbol": "1", "toStates": ["q2"] },
    { "fromState": "q2", "symbol": "0", "toStates": ["q1"] },
    { "fromState": "q2", "symbol": "1", "toStates": ["q0"] }
  ]
}
```

---

## 7. Algorithms Summary

Detailed theoretical pseudocode and complexity analysis are documented in [`docs/algorithms.md`](file:///c:/Users/subhash%20chauhan/OneDrive/Documents/DFA-NFA-Visualizer/docs/algorithms.md).

- **DFA Engine:** Single pointer traversal. Evaluates $q \leftarrow \delta(q, a)$ in $O(|w|)$ time. Flags trap states immediately.
- **NFA Engine:** Subset construction on the fly. Maintains concurrent active state sets $S \leftarrow \bigcup_{p \in S} \delta(p, a)$.
- **$\epsilon$-NFA Engine:** Breadth-First Search (BFS) $\text{ECLOSE}(S)$ computation using visited sets to prevent infinite $\epsilon$-loops.

---

## 8. Step-by-Step Visualization Strategy

1. **Tape Reader Animation:** The current symbol is highlighted in amber, preceded by consumed symbols (green), while a bouncing index head points directly to the active tape cell.
2. **Graph Highlighting:** Cytoscape nodes matching the current active state(s) dynamically receive an animated amber pulsing glow.
3. **Synchronized $\delta$ Matrix:** The active state row and the current input symbol column illuminate at their intersection in the transition table.
4. **Branch Tree:** In NFA mode, a visual execution tree renders parallel thread paths, showing living branches, terminated branches, and accepting terminal nodes.
5. **Evaluation Banner:** At the end of the tape, the simulator displays a clear `ACCEPTED` (green) or `REJECTED` (red) card with an explicit mathematical explanation.

---

## 9. Testing & Quality Assurance Strategy

The verification suite incorporates 20 comprehensive test cases (100% pass rate):

| Suite | Scope | Cases | Expected Result |
|:---|:---|:---|:---|
| **DFA Suite** | TC01 – TC08 | Ending in 01, Even 0s & Even 1s, Modulo 3, Empty string on start | 100% Match |
| **NFA Suite** | TC09 – TC14 | Substring `010`, Ending with `11`, Matching start/end, 3rd from right | 100% Match |
| **$\epsilon$-NFA Suite** | TC15 – TC20 | Union $(01)^* \cup (10)^*$, Starting 0 ending 1, Concatenation $a^*b^*$ | 100% Match |

- **Unit Testing:** JUnit 5 test classes verify backend simulation services and $\epsilon$-closure BFS logic.
- **Engine Parity:** Client engine and backend REST API are tested against identical inputs to guarantee identical outputs.

---

## 10. Edge Cases Handled

1. **Infinite $\epsilon$-Loops:** Handled via visited sets in BFS traversal, preventing recursion stack overflows.
2. **Empty String ($\epsilon$):** Evaluated immediately at step 0 without tape consumption.
3. **Implicit Trap States:** Unspecified transitions are caught gracefully without application crash.
4. **Dead NFA Branches:** Pruned cleanly from the active set while preserving living parallel paths.
5. **MongoDB Protocol Separation:** Port 27017 runs binary TCP wire protocol; browser requests to root port 8080 cleanly redirect to API documentation.

---

## 11. Live Demonstration Strategy (Presentation Protocol)

During the final presentation, the team will demonstrate:
1. **Model Switcher:** Toggle between DFA, NFA, and $\epsilon$-NFA to show dynamic UI adjustments.
2. **Load Example:** Select a pre-built example from the 21-machine library (e.g., Modulo 3 DFA or Union $\epsilon$-NFA).
3. **Interactive Step Run:** Input string `1001` $\to$ click **Step** repeatedly $\to$ observe synchronized tape head, glowing graph nodes, and highlighted table cells.
4. **NFA Multi-Branching:** Run string `0101` on $\epsilon$-NFA $\to$ show multiple concurrent glowing states and the execution branch tree.
5. **Database & Fault Tolerance:** Demonstrate MongoDB persistence via Compass, then simulate with backend disconnected to showcase seamless client-engine fallback.

---

## 12. 5-Member Team Task Division

| Team Member | Role & Work Area | Primary Responsibilities |
|:---|:---|:---|
| **Member 1** | **Team Lead & Theoretical Architect** | Formulated 5-tuple formal mathematical models; defined extended transition functions ($\hat{\delta}$); authored competitive tools analysis; coordinated M1/M2 deliverables. |
| **Member 2** | **Frontend Lead & Graph Engineer** | Designed React 18 single-page architecture; integrated Cytoscape.js force-directed canvas with interactive controls, node badges, and SVG transition arrows. |
| **Member 3** | **Simulation Studio & UI Specialist** | Built physical tape visualizer with animated bouncing read head; implemented step playback controls; developed dynamic transition matrix and NFA branch tree. |
| **Member 4** | **Backend & Simulation Core Developer** | Engineered Spring Boot 3.4 REST APIs with Java 23; implemented BFS $\epsilon$-closure engine; built OpenAPI/Swagger documentation and client fallback engine. |
| **Member 5** | **Database Engineer & QA Lead** | Configured MongoDB 8.2 database integration; curated the 21 pre-built textbook examples library; designed and verified the 20 comprehensive test cases. |

---

## 13. Development Phases & Milestones

- **Phase 1: Milestone M1 (Design & Modeling - 5 Marks)**
  - Problem definition and formal 5-tuple theoretical modeling.
  - Feasibility study and competitive analysis (JFLAP, Automaton Simulator).
  - Algorithmic logic and pseudocode design.
  - UI wireframes and architecture layout design.
- **Phase 2: Milestone M2 (Implementation & Full-Stack System - 9 Marks)**
  - Cytoscape.js interactive graph integration.
  - Physical tape reader and synchronized matrix highlighting.
  - Spring Boot 3.4 REST simulation service and MongoDB persistence.
  - 20 verification test cases and 21 pre-built textbook examples.
- **Phase 3: Delivery & Evaluation Polish**
  - High-readability 16:9 widescreen PowerPoint deck (`FINAL_SUBMISSION_PRESENTATION_M1_M2_v2.pptx`).
  - Comprehensive documentation in `docs/` (`algorithms.md` & `proposal.md`).

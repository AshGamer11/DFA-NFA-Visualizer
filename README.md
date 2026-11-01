# DFA / NFA / ε-NFA String Processing Visualizer

[![Course](https://img.shields.io/badge/Course-CSET302%20Automata%20Theory-blue.svg)](https://github.com/)
[![Topic](https://img.shields.io/badge/Project-Topic%207%20Automata%20Visualizer-brightgreen.svg)](https://github.com/)
[![Frontend](https://img.shields.io/badge/Frontend-React%2018%20%7C%20Vite%20%7C%20Cytoscape.js-61dafb.svg)](http://localhost:3000)
[![Backend](https://img.shields.io/badge/Backend-Spring%20Boot%203.4%20%7C%20Java%2023-6db33f.svg)](http://localhost:8080)
[![Database](https://img.shields.io/badge/Database-MongoDB%208.2-47a248.svg)](http://localhost:27017)
[![Documentation](https://img.shields.io/badge/Docs-Algorithms%20%26%20Proposal-purple.svg)](#-project-documentation-docs)

An interactive, high-performance web-based simulator and visualizer for theoretical computer science. Designed to bridge the gap between abstract mathematical definitions ($M = \langle Q, \Sigma, \delta, q_0, F \rangle$) and dynamic execution by animating step-by-step string processing, tape consumption, and non-deterministic branching paths.

---

## 📚 Project Documentation (`docs/`)

Comprehensive project documentation is available in the [`docs/`](file:///c:/Users/subhash%20chauhan/OneDrive/Documents/DFA-NFA-Visualizer/docs) directory:

| Document | Description | Direct Link |
|:---|:---|:---|
| **`algorithms.md`** | Core simulation algorithms for DFA, NFA, and $\epsilon$-NFA with BFS $\epsilon$-closure ($\text{ECLOSE}$) logic, complexity analysis, and safeguards for tricky cases ($\epsilon$-cycles, dead branches, trap states). | [View `algorithms.md`](file:///c:/Users/subhash%20chauhan/OneDrive/Documents/DFA-NFA-Visualizer/docs/algorithms.md) |
| **`proposal.md`** | Full technical proposal covering system architecture, UI wireframes, Java backend structure, JSON schema, testing strategy, live demo protocol, 5-member team division, and development phases. | [View `proposal.md`](file:///c:/Users/subhash%20chauhan/OneDrive/Documents/DFA-NFA-Visualizer/docs/proposal.md) |

---

## 🌟 Key Features

### 1. Unified 3-Model Switcher
- **DFA (Deterministic Finite Automaton):** Strict determinism ($\delta : Q \times \Sigma \to Q$), completeness validation, and single-path execution.
- **NFA without $\epsilon$-Moves:** Non-deterministic subset branching ($\delta : Q \times \Sigma \to \mathcal{P}(Q)$), with strictly disabled empty moves.
- **$\epsilon$-NFA (Spontaneous Transitions):** Spontaneous state transitions ($\delta : Q \times (\Sigma \cup \{\epsilon\}) \to \mathcal{P}(Q)$) with full breadth-first search $\text{ECLOSE}(S)$ expansion.

### 2. Interactive Graph Studio (Cytoscape.js)
- Draggable, force-directed canvas with auto-fit, zoom, pan, and center controls.
- Color-coded badges: **Blue** entry pointer for start state $q_0$, **Double-bordered emerald ring** for accepting states $F$, and an **Animated amber halo** for active simulation states.
- Support for self-loops, curved bidirectional arrows, and multi-symbol transition edges (`0, 1`).
- Balanced 460px container / 400px canvas height preventing UI vertical congestion.

### 3. Physical Tape Reader & Animation Engine
- Visual physical tape with an animated, bouncing index read head.
- Step-by-step playback controls: **Play / Pause**, **Step Forward**, **Step Backward**, **Reset**, and an adjustable speed slider ($0.25\times$ to $4.0\times$).
- Tape cells color-coded in real time: Green (consumed), Amber (current read head), Slate (pending).

### 4. Dynamic Transition Table & Branch Tree
- Mathematical $\delta(Q, \Sigma)$ matrix with formal row prefixes (`→` start, `*` accept, `→*` both).
- Live cell highlighting synchronized with the tape reader and graph state.
- Visual Execution Branch Tree showing parallel non-deterministic computation threads, clearly highlighting accepting paths.

### 5. Curated 21 Textbook Examples
- **7 DFA Examples:** Ends with `01`, Even 0s & Even 1s, Divisible by 3 (Modulo-3), Exactly two `'a'`s, Starts with `0` ends with `1`, Alternating parity, Decimal substring `42`.
- **7 NFA (No $\epsilon$) Examples:** Substring `010`, Ends with `11`, Starts & ends with same symbol, 3rd symbol from right is `1`, Separated `1`s, Substring `ab|ba`, Modulo shortcut.
- **7 $\epsilon$-NFA Examples:** Union language $(01)^* \cup (10)^*$, Optional prefix $(+\mid -)$, Concatenation $a^*b^*$, Regular expression $(a+b)^*abb$, Multi-pattern match, Alternating loop return, Empty move jump.

### 6. Dual-Engine Fault Tolerance
- **Backend Mode:** Connected to high-performance Spring Boot 3.4 REST APIs backed by MongoDB persistence.
- **Standalone Client Mode:** Automatic seamless fallback to client-side in-browser simulation if backend is offline, guaranteeing 100% uptime for classroom presentations.

---

## 🛠 System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                 React 18 Single Page App (Port 3000)        │
│  ┌───────────────────────┐   ┌───────────────────────────┐  │
│  │ 5-Tuple JSON/Form     │   │ Interactive Cytoscape.js  │  │
│  │ Automaton Editor      │   │ Force-Directed Graph      │  │
│  └───────────────────────┘   └───────────────────────────┘  │
│  ┌───────────────────────┐   ┌───────────────────────────┐  │
│  │ Physical Tape Reader  │   │ Dynamic Transition Matrix │  │
│  │ & Bouncing Read Head  │   │ & NFA Execution Tree      │  │
│  └───────────────────────┘   └───────────────────────────┘  │
│  ┌───────────────────────────────────────────────────────┐  │
│  │ Client-Side Fallback Engine (Zero Downtime Guarantee) │  │
│  └───────────────────────────────────────────────────────┘  │
└──────────────────────────────┬──────────────────────────────┘
                               │ REST HTTP (Proxy: /api)
┌──────────────────────────────▼──────────────────────────────┐
│             Spring Boot 3.4.0 Backend (Port 8080)            │
│  ┌───────────────────────┐   ┌───────────────────────────┐  │
│  │ Root & Health API     │   │ Simulation & Validation   │  │
│  │ (/ & /api/health)     │   │ Service (Java 23)         │  │
│  └───────────────────────┘   └───────────────────────────┘  │
│  ┌───────────────────────┐   ┌───────────────────────────┐  │
│  │ Automaton Controller  │   │ OpenAPI 3 / Swagger UI    │  │
│  │ (/api/automata)       │   │ (/swagger-ui.html)        │  │
│  └───────────────────────┘   └───────────────────────────┘  │
└──────────────────────────────┬──────────────────────────────┘
                               │ Binary TCP Protocol
┌──────────────────────────────▼──────────────────────────────┐
│             MongoDB Community Server 8.2 (Port 27017)       │
│  Database: automata_visualizer | Collection: automata       │
└─────────────────────────────────────────────────────────────┘
```

---

## 📁 Repository Directory Structure

```
DFA-NFA-Visualizer/
├── docs/                                        # Project Documentation
│   ├── algorithms.md                            # Detailed algorithms & tricky cases
│   └── proposal.md                              # Complete proposal & team specifications
├── frontend/                                    # React 18 Single-Page Application (Vite)
│   ├── src/
│   │   ├── components/                          # UI components (Editor, Graph, Simulator)
│   │   ├── engine/                              # Client-side DFA/NFA/ε-NFA simulation engine
│   │   ├── services/                            # Axios API client with offline fallback
│   │   └── utils/                               # Theme definitions, Cytoscape styles
│   └── package.json
├── backend/                                     # Spring Boot 3.4 REST API (Java 23)
│   ├── src/main/java/com/visualizer/automata/   # Controllers, Models, Services, Repositories
│   ├── src/main/resources/                      # application.properties (Port 8080, Mongo URI)
│   └── pom.xml
├── FINAL_SUBMISSION_PRESENTATION_M1_M2_v2.pptx  # 12-Slide Final PowerPoint Presentation
└── README.md                                    # Main Project README
```

---

## 🚀 Quick Start Guide

### 1. Frontend Setup (React 18 + Vite)
```bash
cd frontend
npm install
npm run dev
```
- **Application URL:** [http://localhost:3000](http://localhost:3000)

### 2. Backend Setup (Spring Boot 3.4 + Java 23)
```bash
cd backend
mvn spring-boot:run
```
*(Or use your system Maven wrapper/executable)*

- **Root API Status:** [http://localhost:8080/](http://localhost:8080/)
- **Swagger UI Documentation:** [http://localhost:8080/swagger-ui.html](http://localhost:8080/swagger-ui.html)
- **Health Check Probe:** [http://localhost:8080/api/health](http://localhost:8080/api/health)

### 3. Database Access (MongoDB 8.2)
> **Note for Beginners:** MongoDB listens on TCP port `27017` using a binary database wire protocol, **not HTTP**. Visiting `http://localhost:27017` in Google Chrome will show `ERR_CONNECTION_RESET` because web browsers speak HTTP, not MongoDB protocol.
- To view the database, open **MongoDB Compass** and connect to: `mongodb://localhost:27017`
- Or via terminal using **mongosh**:
  ```bash
  mongosh "mongodb://localhost:27017/automata_visualizer"
  db.automata.find().pretty()
  ```

---

## 📡 REST API Directory

| Method | Endpoint | Description |
|:---|:---|:---|
| `GET` | `/` | Root server status and API directory |
| `GET` | `/api/health` | Health check endpoint returning `{ status: "UP" }` |
| `GET` | `/api/examples` | Retrieves pre-built educational automata library |
| `GET` | `/api/automata` | Lists all user-saved automata definitions from MongoDB |
| `POST` | `/api/automata` | Validates and saves an automaton definition |
| `GET` | `/api/automata/{id}` | Fetches an automaton definition by MongoDB ID |
| `DELETE` | `/api/automata/{id}` | Deletes an automaton definition by ID |
| `POST` | `/api/automata/validate` | Validates a 5-tuple without saving to database |
| `POST` | `/api/simulate` | Simulates step-by-step string processing |
| `POST` | `/api/simulate/batch` | Batch tests an array of strings with summary stats |

---

## 🧪 Verification & Test Suite

The system includes a verification suite of **20 rigorous test cases** across all 3 automata categories with a **100% Pass Rate**:

- **TC01–TC08 (DFA):** Verification of binary ending patterns, parity counters, modulo arithmetic, exact symbol frequencies, and epsilon transitions on start states.
- **TC09–TC14 (NFA without $\epsilon$):** Non-deterministic search for substrings (`010`), ending sequences (`11`), symmetric start/end conditions, and 3rd-symbol-from-right checks.
- **TC15–TC20 ($\epsilon$-NFA):** Union operations $(01)^* \cup (10)^*$, spontaneous transitions bridging disjoint subgraphs, and regular expression order enforcement.

---

## 👥 5-Member Team Project Governance

| Member | Work Area | Key Responsibilities |
|:---|:---|:---|
| **Member 1** | **Theoretical Architect & Team Lead** | Formal 5-tuple specifications, extended transition proofs, competitive analysis, M1/M2 milestone coordination. |
| **Member 2** | **Frontend Lead & Graph Engineer** | React 18 SPA architecture, Cytoscape force-directed graph canvas, node badge styling, curved SVG edges. |
| **Member 3** | **Simulation Studio & UI Specialist** | Physical tape visualizer with bouncing read head, playback controls, dynamic transition matrix highlighting, NFA branch tree. |
| **Member 4** | **Backend & Simulation Core** | Spring Boot 3.4 REST APIs (Java 23), BFS $\epsilon$-closure engine, RootController, Swagger docs, client fallback engine. |
| **Member 5** | **Database & Verification Lead** | MongoDB 8.2 integration, 21 pre-built textbook examples library, 20 test cases verification suite, QA testing. |

---

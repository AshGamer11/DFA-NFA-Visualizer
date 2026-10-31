# DFA/NFA String Processing Visualizer

**CSET302 - Automata Theory and Computability | Topic 7**

An interactive web-based simulator that animates state transitions and computation paths for Deterministic and Non-deterministic Finite Automata, showing acceptance or rejection of input strings with step-by-step visualization.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + Vite + Cytoscape.js |
| Backend | Spring Boot 3.2 + Java 17 |
| Database | MongoDB |
| API | REST (JSON) |

## Quick Start

### Frontend (standalone — no backend needed)

```bash
cd frontend
npm install
npm run dev
```

Open http://localhost:5173 in your browser.

### Backend (optional — for persistence)

Prerequisites: Java 17+, Maven 3.8+, MongoDB running on port 27017

```bash
cd backend
mvn spring-boot:run
```

API available at http://localhost:8080. Swagger UI at http://localhost:8080/swagger-ui.html.

## Features

- **DFA Simulation** — Deterministic step-by-step string processing
- **NFA Simulation** — Parallel computation paths with ε-closure
- **Interactive Graph** — Cytoscape.js visualization with animated transitions
- **Visual Tape Reader** — Bouncing read head showing current symbol
- **Computation Trace** — Step-by-step table of state transitions
- **Transition Table** — Formal δ matrix with live highlighting
- **Batch Testing** — Test multiple strings at once
- **6 Pre-built Examples** — Ready-to-use DFA and NFA automata
- **Import/Export** — JSON format for saving and sharing automata
- **Dark/Light Theme** — Toggle between visual modes

## Architecture

```
┌──────────────────────────────────────┐
│          React.js Frontend           │
│  ┌────────────┐  ┌────────────────┐  │
│  │  Automaton  │  │  Cytoscape.js  │  │
│  │   Editor    │  │  Graph View    │  │
│  └────────────┘  └────────────────┘  │
│  ┌────────────────────────────────┐  │
│  │  Step-by-Step Animation Panel  │  │
│  └────────────────────────────────┘  │
│  ┌────────────────────────────────┐  │
│  │  Client-Side Simulation Engine │  │
│  └────────────────────────────────┘  │
└───────────────┬──────────────────────┘
                │ REST API (optional)
┌───────────────▼──────────────────────┐
│        Spring Boot Backend           │
│  ┌─────────────┐ ┌───────────────┐   │
│  │ DFA/NFA     │ │ Automaton     │   │
│  │ Simulators  │ │ Validator     │   │
│  └─────────────┘ └───────────────┘   │
└───────────────┬──────────────────────┘
                │
┌───────────────▼──────────────────────┐
│            MongoDB                   │
└──────────────────────────────────────┘
```

## Project Structure

```
DFA-NFA-Visualizer/
├── frontend/          # React + Vite application
│   ├── src/
│   │   ├── components/    # UI components
│   │   ├── engine/        # Client-side DFA/NFA algorithms
│   │   ├── services/      # Backend API integration
│   │   └── utils/         # Graph styles, constants
│   └── package.json
├── backend/           # Spring Boot REST API
│   ├── src/main/java/com/visualizer/automata/
│   │   ├── controller/    # REST endpoints
│   │   ├── service/       # Algorithm implementations
│   │   ├── model/         # Data models
│   │   └── repository/    # MongoDB repository
│   └── pom.xml
└── README.md
```

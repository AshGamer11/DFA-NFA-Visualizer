# DFA / NFA Visualizer & String Processing Simulator

An interactive single-page application built with **React 18**, **Vite**, and **Cytoscape.js** for visualizing Deterministic Finite Automata (DFA) and Non-Deterministic Finite Automata (NFA with $\epsilon$-transitions). Developed for **CSET302: Automata Theory and Formal Languages**.

## Key Features

1. **Dual Automaton Support**:
   - **DFA**: Strict determinism verification ($\delta: Q \times \Sigma \to Q$), trap state detection, completeness checks.
   - **NFA**: Non-deterministic branching, $\epsilon$-closure computation, Thomson-style $\epsilon$-moves, parallel path exploration.

2. **Interactive Graph Visualization (Cytoscape.js)**:
   - Dynamic layout algorithms: **CoSE** (force-directed spring embedding), **Dagre** (hierarchical left-to-right DAG), and **Circle**.
   - Start state entry arrow, double-bordered accept states.
   - Self-loops and multi-symbol edge labels (`0, 1`).
   - Real-time simulation animations: glowing current state nodes and illuminated transition edges.
   - Zoom, Pan, Fit-to-screen, and Center controls with responsive canvas auto-resizing.

3. **Step-by-Step String Processor**:
   - **Interactive Tape Visualizer**: Read head pointer tracking each character consumed, remaining suffix, and current state.
   - **Playback Controls**: Auto-play, Pause, Step Forward, Step Backward, Reset, and adjustable speed slider (0.25x – 4x).
   - **Result Banner**: Clear `ACCEPTED` (emerald) or `REJECTED` (crimson) badge with mathematical explanation.
   - **Batch Tester**: Test multiple strings simultaneously with instant pass/fail validation.

4. **Computation Path & NFA Tree Display**:
   - Interactive computation trace table ($Step$, $Current\ State$, $Symbol\ Read$, $Next\ State$, $Remaining$, $Status$).
   - Click any step in the trace table to immediately jump the graph and tape to that point in time.
   - NFA Tree View displaying all parallel exploration branches and marking accepting paths.

5. **Formal Transition Table ($\delta$)**:
   - Mathematical $\delta(Q, \Sigma)$ grid with formal row indicators (`→` for start, `*` for accept, `→*` for both).
   - Active row and active cell highlighting during animation.

6. **Pre-Built Automata Examples**:
   - **DFA**: Strings ending in `"01"` over $\{0, 1\}$
   - **DFA**: Strings with an even number of zeros over $\{0, 1\}$
   - **DFA**: Binary numbers divisible by 3 (Modulo 3 counter)
   - **NFA**: Strings containing substring `"101"`
   - **NFA with $\epsilon$**: Strings starting with `'a'` OR ending with `'b'`
   - **NFA with $\epsilon$**: Regular expression $(a|b)^*abb$ (Thomson construction)
   - Includes one-click test case chips for quick verification.

7. **JSON Import / Export**:
   - Copy JSON to clipboard, download as `.json` file, or upload any saved automaton.
   - Formal schema validator checks structure, determinism, and completeness before loading.

8. **Dual-Mode Execution (Standalone + Backend API)**:
   - **Standalone Mode**: Full client-side simulation engine (zero server dependency required).
   - **Spring Boot Integration**: Seamlessly connects to backend at `http://localhost:8080/api` via Vite proxy, with automatic fallback when offline.

---

## Installation & Running

### Prerequisites
- Node.js (v18 or higher recommended)
- npm or yarn

### Quick Start
```bash
# Navigate to the frontend directory
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

The application will launch at `http://localhost:3000`.

### Build for Production
```bash
npm run build
```
Production assets will be generated in `frontend/dist`.

---

## Architecture

```
frontend/
├── index.html
├── package.json
├── vite.config.js
└── src/
    ├── main.jsx
    ├── App.jsx
    ├── App.css
    ├── index.css
    ├── components/
    │   ├── AutomatonEditor/       # States, Alphabet, Transitions, Formal Tuple
    │   ├── AutomatonGraph/        # Cytoscape.js canvas and layout engine
    │   ├── Simulator/             # Tape visualizer, controls, trace table, batch tester
    │   ├── TransitionTable/       # Formal δ delta matrix
    │   ├── ExampleLoader/         # Pre-built standard automata library
    │   └── common/                # Header, StatusBadge, IOModal
    ├── engine/
    │   ├── DFASimulator.js        # Deterministic simulation algorithm
    │   ├── NFASimulator.js        # Epsilon-closure & parallel branching algorithm
    │   ├── AutomatonValidator.js  # 5-tuple consistency & determinism checks
    │   └── examples.js            # Standard library data
    ├── services/
    │   └── api.js                 # Axios API service layer with auto-fallback
    └── utils/
        ├── constants.js           # Epsilon, Machine types, Status enums
        └── graphStyles.js         # Cytoscape stylesheet (dark/light themes)
```

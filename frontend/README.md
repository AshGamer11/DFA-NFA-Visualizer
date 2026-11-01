# Frontend: DFA / NFA / ε-NFA Interactive Visualizer

An interactive Single-Page Application (SPA) built with **React 18**, **Vite**, and **Cytoscape.js** for simulating and exploring finite automata. Developed for **CSET302: Automata Theory and Computability** (Topic 7).

> **Project Documentation Reference:**
> - UI Wireframe & Styling Specs: [`docs/proposal.md`](file:///c:/Users/subhash%20chauhan/OneDrive/Documents/DFA-NFA-Visualizer/docs/proposal.md)
> - Simulation Engine & Tricky Cases: [`docs/algorithms.md`](file:///c:/Users/subhash%20chauhan/OneDrive/Documents/DFA-NFA-Visualizer/docs/algorithms.md)

---

## 🚀 Key Features & Capabilities

### 1. 3-Way Model Selector
- **DFA (Deterministic Finite Automaton):** Enforces strict determinism ($\delta : Q \times \Sigma \to Q$), single transition per symbol, and flags missing or non-deterministic transitions.
- **NFA without $\epsilon$-Moves:** Allows multiple concurrent branches ($\delta : Q \times \Sigma \to \mathcal{P}(Q)$) while strictly disabling empty string ($\epsilon$) jumps.
- **$\epsilon$-NFA:** Supports spontaneous $\epsilon$-transitions, computing $\epsilon$-closures ($\text{ECLOSE}(S)$) dynamically at each step.

### 2. High-Performance Graph Studio (Cytoscape.js)
- **Force-Directed Graph (CoSE layout):** Physics-simulated node positioning with interactive drag, zoom, and pan controls.
- **Visual Node States:**
  - **Start State:** Highlighted with a primary blue border and directional entry badge.
  - **Accept State:** Rendered with formal double concentric borders.
  - **Active State(s):** Rendered with an animated glowing amber halo indicating current computation threads.
- **Edge Routing:** Self-loops, curved bidirectional arrows, and multi-symbol transition labels (`0, 1`).
- **Optimal Canvas Sizing:** Balanced 460px container / 400px canvas height designed for widescreen viewing without pushing simulator controls out of view.

### 3. Step-by-Step Simulation Studio
- **Physical Tape Visualizer:**
  - Displays input symbols on animated tape cells.
  - Bouncing indicator pointer shows the exact position of the read head.
  - Real-time cell styling: **Emerald** for consumed symbols, **Amber** for current read position, and **Muted Slate** for pending symbols.
- **Playback Controls:** Play, Pause, Step Forward, Step Backward, and Reset with a variable animation speed slider ($0.25\times$ to $4.0\times$).
- **Result Banner:** Clear, unambiguous `ACCEPTED` (green) or `REJECTED` (red) status indicator with full mathematical reasoning.
- **NFA Execution Tree:** Visual branching tree rendering all parallel computational paths for non-deterministic automata.

### 4. Synchronized Transition Matrix ($\delta$)
- Dynamically rendered table based on the active 5-tuple.
- Formal TOC row prefixes: `→` (Start), `*` (Accept), `→*` (Start & Accept).
- Live synchronized highlighting: active states highlight the corresponding row, and the consumed symbol highlights the active column.

### 5. 21 Pre-Built Textbook Examples Library
Quickly load standard automata across 3 tabs (7 per model):
- **7 DFA Examples:** Ends with `01`, Even 0s and Even 1s, Modulo-3 Divisibility, Exactly 2 `'a'`s, Starts 0 ends 1, Alternating parity, Decimal substring `42`.
- **7 NFA (No $\epsilon$) Examples:** Substring `010`, Ends with `11`, Matching start and end symbols, 3rd symbol from end is `1`, Separated `1`s, `ab` or `ba` search, Modulo shortcut.
- **7 $\epsilon$-NFA Examples:** Union $(01)^* \cup (10)^*$, Starting 0 ending 1 bridge, Concatenation $a^*b^*$, Regular expression $(a+b)^*abb$, Multi-pattern match, Parity loop return, Empty move jump.

### 6. Dual-Engine Architecture & Fault Tolerance
- **REST API Connection:** Queries Spring Boot backend at `http://localhost:8080/api/simulate` and `/api/examples`.
- **Zero-Downtime Fallback:** Automatically falls back to the in-browser JavaScript engine (`engine/DFASimulator.js` & `engine/NFASimulator.js`) if the backend is unavailable or offline, ensuring reliable presentations.
- **Real-Time Health Status:** Header displays a connection status badge (`Online (Backend Engine)` vs `Standalone (Client Engine)`).

---

## 📁 Directory Structure

```
frontend/
├── index.html                  # HTML entry point
├── package.json                # React 18, Cytoscape, Lucide icons dependencies
├── vite.config.js              # Vite configuration (Port 3000, /api proxy to 8080)
├── src/
│   ├── main.jsx                # Application bootstrap
│   ├── App.jsx                 # Master application component & layout state
│   ├── App.css                 # 2-column widescreen layout (540px left sidebar)
│   ├── index.css               # Global typography, CSS variables & themes
│   ├── components/
│   │   ├── AutomatonEditor/    # 5-tuple editor with 3-way model selector
│   │   ├── AutomatonGraph/     # Cytoscape force-directed graph canvas
│   │   ├── Simulator/          # Tape visualizer, controls, trace table & batch runner
│   │   ├── TransitionTable/    # Formal δ transition matrix with active highlighting
│   │   ├── ExampleLoader/      # 21 Pre-built textbook examples library
│   │   ├── Theory/             # Theoretical 5-tuple specification card
│   │   └── common/             # Header, HelpModal, Toast notifications
│   ├── engine/
│   │   ├── DFASimulator.js     # Client-side deterministic simulation algorithm
│   │   ├── NFASimulator.js     # Client-side BFS ε-closure & NFA simulation
│   │   └── examples.js         # Library of 21 textbook automata definitions
│   └── services/
│       └── api.js              # Axios REST client with fallback to local engine
```

---

## 🛠 Local Setup & Running

### Prerequisites
- Node.js (version 18 or higher)
- npm or yarn

### Installation
```bash
cd frontend
npm install
```

### Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build for Production
```bash
npm run build
```
Production assets are output to `frontend/dist/`.

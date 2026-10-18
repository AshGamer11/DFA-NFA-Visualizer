# ⚡ DFA / NFA String Processing Visualizer

> **Course**: CSET302 — Automata Theory and Computability  
> **Topic 7**: DFA/NFA String Processing Visualizer  
> **Milestones**: M1 (Design & Specification) & M2 (Implementation & Demonstration)

An interactive, high-fidelity web simulator that visualizes state transitions, tape head consumption, and computation paths for **Deterministic Finite Automata (DFA)** and **Non-deterministic Finite Automata (NFA)** with $\varepsilon$-transitions.

---

## 🌟 Key Features

1. **Dual Representation**:
   - Interactive, draggable directed state transition graph (powered by Cytoscape.js).
   - Real-time editable transition matrix ($\delta$).
2. **Animation Engine**:
   - Active state illumination (glow effects for regular and accepting states).
   - Traversed transition edge pulse animations.
   - Synchronized tape head scanning across symbols with empty string ($\varepsilon$) support.
3. **Full Non-determinism Support**:
   - Parallel subset construction execution for NFAs.
   - Recursive depth-first $\varepsilon$-closure calculation.
   - Hierarchical **NFA Computation Tree** showing all branching paths, dead paths, and accepting leaves.
4. **Step-by-Step Playback Controls**:
   - Play, Pause, Step Forward, Step Backward, Reset.
   - Variable playback speed slider (100ms – 2000ms per transition).
5. **Trace Log & Validation**:
   - Auto-scrolling tabular trace of each intermediate step.
   - Automated consistency validation (completeness checks, unreachable warnings, symbol verification).
   - Clear Accept / Reject banner with the full computation path.
6. **Curated Presets**:
   - 6 pre-configured classic automata (DFA ending in "ab", even $a$'s, substring "abb", NFA branchers, and $\varepsilon$-NFA $a^*b^*c^*$) with one-click test cases.

---

## 🛠️ Tech Stack

- **Framework**: React 19 + TypeScript
- **Bundler**: Vite 8
- **Styling**: Tailwind CSS v4 + Dark Theme UI tokens
- **Graph Visualization**: Cytoscape.js
- **State Management**: Zustand
- **Icons**: Lucide React
- **Unit Testing**: Vitest

---

## 🚀 Getting Started

### 1. Installation
Clone the repository and install all dependencies:
```bash
npm install
```

### 2. Run the Development Server
```bash
npm run dev
```
Open your browser at `http://localhost:5173/`.

### 3. Run Automated Tests
```bash
npm test
```
Runs 15 test cases verifying DFA step execution, NFA subset expansion, cyclic $\varepsilon$-closure handling, and validation logic.

### 4. Build for Production
```bash
npm run build
```

---

## 📂 Project Directory Structure

```
DFA-NFA-Visualizer/
├── docs/
│   └── M1_SPECIFICATION.md           # Formal problem statement, 5-tuple, pseudocode, manual trace
├── src/
│   ├── core/                          # Pure Automata Theory logic (No UI dependencies)
│   │   ├── types.ts                   # 5-tuple definitions, step interfaces, tree types
│   │   ├── validator.ts               # Completeness, valid symbols & states verification
│   │   ├── epsilon-closure.ts         # DFS-based ε-closure computation
│   │   ├── dfa-simulator.ts           # Deterministic string processing engine
│   │   ├── nfa-simulator.ts           # Non-deterministic string & tree generator
│   │   ├── step-generator.ts          # Unified simulation dispatcher
│   │   ├── presets.ts                 # 6 built-in automata with test suites
│   │   └── __tests__/
│   │       └── engine.test.ts         # Automated unit test suite (Vitest)
│   ├── components/
│   │   ├── layout/
│   │   │   └── Header.tsx             # Navigation, DFA/NFA mode switch, preset selector
│   │   ├── editor/
│   │   │   └── TransitionTable.tsx    # Live editable transition matrix (add/remove states/symbols)
│   │   ├── simulation/
│   │   │   ├── StringInput.tsx        # Input field with quick test buttons & error alerts
│   │   │   ├── SimulationControls.tsx # Play, Pause, Step Forward/Back, Speed slider
│   │   │   ├── TraceTable.tsx         # Step log with current step highlighting
│   │   │   └── ResultBanner.tsx       # Accepted/Rejected verdict + witness path
│   │   └── visualization/
│   │       ├── AutomatonGraph.tsx     # Cytoscape.js interactive directed canvas
│   │       ├── InputTape.tsx          # Animated tape cells with bouncing read head
│   │       └── ComputationTree.tsx    # NFA branching visual tree
│   ├── store/
│   │   └── useStore.ts                # Zustand global reactive store
│   ├── lib/
│   │   └── utils.ts                   # Class name merger utilities
│   ├── App.tsx                        # Master layout & formal 5-tuple summary card
│   ├── index.css                      # Global design system & theme tokens
│   └── main.tsx                       # React application root
├── package.json
└── vite.config.ts
```

---

## 📊 Manually Validated Test Case (Included in Project)

- **Language**: Strings over $\{a, b\}$ containing substring `"abb"`.
- **Automaton**:
  - $Q = \{q_0, q_1, q_2, q_3\}$, $\Sigma = \{a, b\}$, $q_0 = \text{start}$, $F = \{q_3\}$.
  - $\delta(q_0, a) = q_1, \delta(q_0, b) = q_0$
  - $\delta(q_1, a) = q_1, \delta(q_1, b) = q_2$
  - $\delta(q_2, a) = q_1, \delta(q_2, b) = q_3$
  - $\delta(q_3, a) = q_3, \delta(q_3, b) = q_3$
- **Input**: `"aabb"`
- **Trace**:
  1. Step 0: $q_0$ (Tape: `aabb`)
  2. Step 1: Read `'a'` $\to q_1$ (Tape: `abb`)
  3. Step 2: Read `'a'` $\to q_1$ (Tape: `bb`)
  4. Step 3: Read `'b'` $\to q_2$ (Tape: `b`)
  5. Step 4: Read `'b'` $\to q_3 \in F$ (Tape: $\varepsilon$)
- **Result**: **ACCEPTED** (Verified both manually and in test suite).

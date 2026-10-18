# CSET302: Automata Theory & Computability
# Topic 7: DFA/NFA String Processing Visualizer
## Presentation Slide Deck Structure (10 Slides)

> **Format**: Ready for PowerPoint, Google Slides, or Markdown Presentation Tools (Marp / Slidev).

---

### Slide 1: Title Slide
- **Title**: DFA & NFA String Processing Visualizer
- **Subtitle**: Real-time State Computation Paths, $\varepsilon$-Closure Analysis & Interactive Graph Simulation
- **Course**: CSET302 — Automata Theory & Computability (2026)
- **Topic**: Topic Pool #7
- **Team Members / Presenter**: Subhash Chauhan & Team
- **Stack**: React 19, TypeScript, Cytoscape.js, Tailwind CSS v4, Zustand

---

### Slide 2: Problem Statement & Motivation
- **The Challenge**:
  - Automata theory textbook diagrams are static and abstract.
  - Tracking concurrent non-deterministic state subsets on paper is error-prone.
  - Spontaneous $\varepsilon$-transitions and cyclic closures cause common misconceptions.
- **Project Objective**:
  - Build an interactive, zero-install web simulator that animates state transitions and tape head movement step-by-step.
  - Provide multi-threaded NFA computation trees and instantaneous batch verification.

---

### Slide 3: Theoretical Formulation (Formal 5-Tuple)
- **Finite Automaton Specification**:
  $$M = (Q, \Sigma, \delta, q_0, F)$$
  - $Q$: Finite set of states $\{q_0, q_1, \dots\}$
  - $\Sigma$: Finite alphabet $\{a, b\}$
  - $q_0 \in Q$: Start state
  - $F \subseteq Q$: Final / Accepting states
- **DFA vs NFA Transition Mechanics**:
  - **DFA**: $\delta: Q \times \Sigma \to Q$ (Deterministic, exactly one next state)
  - **NFA**: $\delta: Q \times (\Sigma \cup \{\varepsilon\}) \to \mathcal{P}(Q)$ (Power set, parallel branches)
- **Language Acceptance**:
  - $w \in L(M) \iff \hat{\delta}(q_0, w) \cap F \neq \emptyset$

---

### Slide 4: System Architecture & Data Flow
- **3-Tier Decoupled Design**:
  ```
  [User Interface Layer]
    ├── Interactive Cytoscape Canvas (Directed Graph + Glow/Pulse)
    ├── Linear Tape Controller with Animated Head
    └── Tabbed Inspector (Transition Table, Trace Log, Batch Suite)
             ↕ (Zustand Global State Store)
  [Core Mathematical Engine]
    ├── Epsilon-Closure DFS Resolver (Cycle-safe Set tracking)
    ├── DFA Single-Path Simulator
    ├── NFA Branching & Computation Tree Builder
    └── 5-Tuple Consistency & Completeness Validator
  ```
- **Key Design Decision**: Mathematical core has zero DOM/React dependencies, enabling fast, isolated unit testing.

---

### Slide 5: Core Algorithms & Pseudocode
- **$\varepsilon$-Closure via Depth-First Search**:
  - Stack traversal with visited `Set` prevention: Time complexity $\mathcal{O}(|Q| + |E_\varepsilon|)$.
  - Handles cyclic structures without infinite loops.
- **NFA Parallel Step Computation**:
  - Initial configuration: $S_0 = \text{E-CLOSE}(\{q_0\})$.
  - Step recurrence: $S_{i+1} = \text{E-CLOSE}\left( \bigcup_{q \in S_i} \delta(q, c_i) \right)$.
  - Early termination if $S_{i+1} = \emptyset$ (all branches died).

---

### Slide 6: Key Features & Engineering Highlights
1. **Interactive State Diagram**:
   - Draggable nodes, double-circle accept rings, initial state arrow.
   - Active node illumination and directed edge pulses during simulation.
   - Canvas toolbar: Zoom In, Zoom Out, Fit to View, Reset Layout, **Export as High-Res PNG**.
2. **Synchronized Linear Tape**:
   - Visual cells with unconsumed scanning head, character strikethrough, and empty string ($\varepsilon$) handling.
3. **NFA Computation Tree**:
   - Hierarchical breakdown of all execution forks with green (accepting) and red (dead) leaves.
4. **JSON Portability**:
   - Export machine specifications or import custom configurations with clipboard copy and download.

---

### Slide 7: Manually Solved Validation Example
- **Language**: $L = \{ w \in \{a, b\}^* \mid w \text{ contains substring } "abb" \}$
- **Machine**: $Q = \{q_0, q_1, q_2, q_3\}$, start $= q_0$, $F = \{q_3\}$.
- **Candidate String**: $w = \text{"aabb"}$
- **Trace Walkthrough**:
  - Step 0: Initial state $q_0$, unconsumed: `aabb`
  - Step 1: Read `'a'` $\to q_1$, unconsumed: `abb`
  - Step 2: Read `'a'` $\to q_1$, unconsumed: `bb`
  - Step 3: Read `'b'` $\to q_2$, unconsumed: `b`
  - Step 4: Read `'b'` $\to \mathbf{q_3 \in F}$, unconsumed: $\varepsilon$
- **Verdict**: **ACCEPTED** (Automated simulator trace matches manual calculation 100%).

---

### Slide 8: Demonstration & Batch Verification Suite
- **Multi-String Validation Table**:
  - Test dozens of candidate strings in a single click.
  - Instant classification into Accepted vs Rejected with step counts and witness paths.
  - **1-Click Visual Trace**: Click any row to automatically load that string into the animated visualizer.
- **Pre-Configured Presets**:
  - Preset 1: DFA ending in "ab"
  - Preset 2: DFA with even count of "a"s
  - Preset 3: DFA containing substring "abb"
  - Preset 4: NFA ending in "ab"
  - Preset 5: NFA with "aa" or "bb"
  - Preset 6: $\varepsilon$-NFA for regular expression $a^*b^*c^*$

---

### Slide 9: Automated Testing & Verification Gates
- **15 Automated Unit Tests in Vitest (100% Pass Rate)**:
  - Normal Cases: Substring recognition, prefix/suffix patterns.
  - Edge Cases: Empty string ($\varepsilon$) on DFA and $\varepsilon$-NFA.
  - Error Cases: Symbols outside alphabet $\Sigma$, incomplete DFA detection.
  - Algorithmic Rigour: Cyclic $\varepsilon$-closure loops ($q_0 \to q_1 \to q_0$).
- **Build Quality**:
  - Zero TypeScript errors (`tsc -b`), strict type safety, zero ESLint warnings.

---

### Slide 10: Conclusion & Individual Accountability
- **Summary**:
  - Fully functional, highly pedagogical visualizer meeting and exceeding CSET302 Milestone M1 and M2 criteria.
  - Open-source, production-ready bundle deployable to Vercel/GitHub Pages in seconds.
- **Learning Outcomes**:
  - Deep mastery of subset construction, $\varepsilon$-closure graph traversals, extended transition functions, and reactive state synchronization.
- **Thank You! Questions & Discussion**.

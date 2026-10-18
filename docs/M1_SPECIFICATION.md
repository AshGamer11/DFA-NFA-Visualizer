# CSET302: Automata Theory & Computability
## Topic 7 — DFA/NFA String Processing Visualizer
### Milestone M1: Problem Analysis & Project Design Specification

---

## 1. Problem Definition & Automata Specification

### 1.1 Problem Statement
The evaluation of formal regular languages is governed by finite automata. While the mathematical foundations of Deterministic Finite Automata (DFA) and Non-deterministic Finite Automata (NFA) are rigorously defined, students and practitioners often face conceptual difficulties tracking simultaneous state sets, handling spontaneous $\varepsilon$-transitions, and debugging edge cases.

This project delivers an interactive, high-fidelity **DFA/NFA String Processing Visualizer** designed to:
- Render state transition graphs dynamically.
- Process input strings in animated, step-by-step increments.
- Highlight active states, traversed transitions, and tape head positions in real time.
- Simulate parallel non-deterministic branching and computation paths for NFAs.
- Compute and visualize $\varepsilon$-closures explicitly.
- Render complete computation trees and tabular execution traces with formal acceptance/rejection verdicts.

### 1.2 Formal Mathematical Model
A Finite Automaton is formally specified as a 5-tuple:
$$M = (Q, \Sigma, \delta, q_0, F)$$

Where:
1. $Q$ is a non-empty, finite set of states: $\{q_0, q_1, \dots, q_{k-1}\}$.
2. $\Sigma$ is a non-empty, finite alphabet of input symbols (e.g., $\{a, b\}$ or $\{0, 1\}$).
3. $\delta$ is the state transition function:
   - **For DFA**:
     $$\delta: Q \times \Sigma \to Q$$
     *(Every state must have exactly one deterministic target for each alphabet symbol).*
   - **For NFA (including $\varepsilon$-NFA)**:
     $$\delta: Q \times (\Sigma \cup \{\varepsilon\}) \to \mathcal{P}(Q)$$
     *(Transitions may lead to zero, one, or multiple target states, or proceed without consuming input via $\varepsilon$).*
4. $q_0 \in Q$ is the uniquely designated initial / start state.
5. $F \subseteq Q$ is the set of final / accepting states.

#### Extended Transition Function $\hat{\delta}$ & Language Acceptance:
- **For DFA**, given string $w = w_1 w_2 \dots w_n \in \Sigma^*$:
  $$\hat{\delta}(q, \varepsilon) = q$$
  $$\hat{\delta}(q, xa) = \delta(\hat{\delta}(q, x), a) \quad \text{for } x \in \Sigma^*, a \in \Sigma$$
  A string $w$ is **Accepted** if and only if:
  $$\hat{\delta}(q_0, w) \in F$$
  Otherwise, $w$ is **Rejected**.

- **For NFA with $\varepsilon$-transitions**:
  Let $\text{E-CLOSE}(S)$ denote the $\varepsilon$-closure of state set $S \subseteq Q$.
  $$\hat{\delta}(q_0, \varepsilon) = \text{E-CLOSE}(\{q_0\})$$
  $$\hat{\delta}(q_0, xa) = \text{E-CLOSE}\left( \bigcup_{q \in \hat{\delta}(q_0, x)} \delta(q, a) \right)$$
  A string $w$ is **Accepted** if and only if:
  $$\hat{\delta}(q_0, w) \cap F \neq \emptyset$$

### 1.3 System Inputs & Outputs
- **Inputs**:
  - Automaton mode: DFA or NFA (including $\varepsilon$-NFA).
  - States $Q$, Alphabet $\Sigma$, Initial state $q_0$, Accept states $F$.
  - Transition matrix / table $\delta$.
  - Candidate input string $w \in \Sigma^*$ (or $\varepsilon$).
- **Outputs**:
  - Interactive Cytoscape directed state graph.
  - Animated read head on linear input tape ($w$).
  - Tabular step-by-step computation log: $\text{Step } i \to \text{Current } S \to \text{Read } a \to \text{Next } S'$.
  - Full NFA computation tree with marked branches (active, dead, accepted).
  - Explicit verdict: `ACCEPTED` (with witness path) or `REJECTED`.

---

## 2. Existing Tools & Feasibility Analysis

| Tool | Features | Fundamental Limitations | Our Approach & Innovation |
| :--- | :--- | :--- | :--- |
| **JFLAP** (Java Desktop) | Broad support for automata & grammars. | Requires legacy Java runtime; dated UI; no animated tape head; cumbersome manual step controls; desktop-only. | Zero-install web client (Vite + React 19 + TypeScript); modern dark aesthetic; responsive layout. |
| **Stanford Automata Tool** | Web-based DFA/NFA canvas. | Lacks dynamic edge traversal pulse; cannot render NFA computation trees; limited preset library. | Real-time Cytoscape.js rendering with edge pulse, node glow, and tree decomposition. |
| **FSM Simulator (Ivan Zuzak)** | Regular expression to FSM generator. | Text-centric; lacks interactive transition table editing and multi-branch visual debugging. | Bi-directional synchronization: graphical diagram + live editable transition table. |

### Technical Feasibility:
- **Client-Side Portability**: Pure browser execution requires zero backend servers, zero database latency, and zero hosting costs.
- **Rendering Performance**: Cytoscape.js handles directed multigraphs with self-loops up to 100+ nodes at 60 FPS.
- **Type Safety**: TypeScript enforces compile-time verification of transitions, preventing runtime null pointers.

---

## 3. Simulator Architecture & Methodology

### 3.1 Three-Tier System Architecture
```
┌─────────────────────────────────────────────────────────────────┐
│                     PRESENTATION LAYER (UI)                     │
│  - Header & Presets     - Cytoscape Graph Canvas                │
│  - Transition Table     - Input Tape with Animated Head         │
│  - Trace Table View     - Playback Bar (Play, Pause, Step)      │
│  - Result Banner        - NFA Computation Tree Viewer           │
└────────────────────────────────┬────────────────────────────────┘
                                 │ React State / Zustand
┌────────────────────────────────▼────────────────────────────────┐
│                       STATE STORE LAYER                         │
│  - useStore: Automaton definition, simulation trace, tape head  │
│  - Synchronizer: Bi-directional sync between Graph & Table      │
└────────────────────────────────┬────────────────────────────────┘
                                 │ Pure Function Calls
┌────────────────────────────────▼────────────────────────────────┐
│                    CORE AUTOMATA ENGINE                         │
│  - Validator Module: Checks 5-tuple consistency & completeness  │
│  - Epsilon-Closure DFS: Resolves spontaneous transitions        │
│  - DFA Simulator: Deterministic state sequence builder          │
│  - NFA Simulator: Parallel subset branch & tree constructor     │
└─────────────────────────────────────────────────────────────────┘
```

### 3.2 Input-Processing-Output (IPO) Workflow
```
[User Input: Machine Specification & String w]
                     │
                     ▼
             [Input Validator]
           /                  \
   [Fatal Errors?]      [Warnings / Valid]
         │                      │
   Display Alerts               ▼
                        [Simulation Engine]
                     /                      \
            If DFA                         If NFA
               │                              │
     Compute single-state             Compute ε-closure &
     transition chain                 parallel state subsets
               \                              /
                ▼                            ▼
            [Step Generator: SimulationStep[] & ComputationTree]
                                │
                                ▼
         [Visualization & Animation Controller (Step Index i)]
             ├── Highlight Active Node(s) in Graph
             ├── Flash Traversed Directed Edge(s)
             ├── Advance Tape Head Pointer
             ├── Highlight Active Row in Trace Table
             └── Render Accept / Reject Verdict
```

---

## 4. Algorithm Selection & Pseudocode

### 4.1 DFA Step-by-Step Simulation Algorithm
```
ALGORITHM Simulate-DFA(M, w):
  INPUT:  DFA M = (Q, Σ, δ, q0, F), string w = c1 c2 ... cn
  OUTPUT: SimulationResult { steps, accepted, path }

  1. current ← q0
  2. path ← [q0]
  3. steps ← []
  4. Record step 0: (step: 0, current: [q0], read: null, next: [q0])
  
  5. FOR i FROM 1 TO n DO:
       c ← w[i]
       IF c ∉ Σ THEN:
         THROW Error("Invalid symbol: " + c)
       
       nextState ← δ(current, c)
       IF nextState is NULL THEN:
         Record step i: (step: i, current: [current], read: c, next: [])
         RETURN { steps, accepted: FALSE, path }
       
       Record step i: (step: i, current: [current], read: c, next: [nextState])
       current ← nextState
       path.append(current)
     END FOR

  6. isAccepted ← (current ∈ F)
  7. RETURN { steps, accepted: isAccepted, path: [path] }
```

### 4.2 NFA with $\varepsilon$-Transitions Simulation Algorithm
```
ALGORITHM Simulate-NFA(M, w):
  INPUT:  NFA M = (Q, Σ, δ, q0, F), string w = c1 c2 ... cn
  OUTPUT: SimulationResult { steps, accepted, path }

  1. currentStates ← EPSILON-CLOSURE({q0}, M.transitions)
  2. Record step 0: (step: 0, current: currentStates, read: null, next: currentStates)
  3. allStateSets ← [currentStates]

  4. FOR i FROM 1 TO n DO:
       c ← w[i]
       IF c ∉ Σ THEN:
         THROW Error("Invalid symbol: " + c)

       rawNext ← ∅
       FOR EACH state q IN currentStates DO:
         rawNext ← rawNext ∪ δ(q, c)
       END FOR

       nextStates ← EPSILON-CLOSURE(rawNext, M.transitions)
       Record step i: (step: i, current: currentStates, read: c, next: nextStates)
       currentStates ← nextStates
       allStateSets.append(currentStates)

       IF currentStates == ∅ THEN:
         // All non-deterministic paths died
         BREAK
       END IF
     END FOR

  5. isAccepted ← (currentStates ∩ F ≠ ∅)
  6. RETURN { steps, accepted: isAccepted, path: allStateSets }
```

### 4.3 $\varepsilon$-Closure Algorithm (DFS Stack Traversal)
```
SUBROUTINE EPSILON-CLOSURE(states, transitions):
  INPUT:  states S ⊆ Q, transitions δ
  OUTPUT: S_closure ⊆ Q

  1. closure ← Set(states)
  2. stack ← Array(states)

  3. WHILE stack is NOT EMPTY DO:
       q ← stack.pop()
       targets ← transitions.get(q, 'ε')
       IF targets is NOT NULL THEN:
         FOR EACH target IN targets DO:
           IF target ∉ closure THEN:
             closure.add(target)
             stack.push(target)
           END IF
         END FOR
       END IF
     END WHILE

  4. RETURN Sort(closure)
```

---

## 5. Manually Validated Example

### 5.1 Problem Statement
- **Language**: $L = \{ w \in \{a, b\}^* \mid w \text{ contains the substring } "abb" \}$
- **Input String**: $w = \text{"aabb"}$
- **Alphabet**: $\Sigma = \{a, b\}$
- **States**: $Q = \{q_0, q_1, q_2, q_3\}$
- **Initial State**: $q_0$
- **Accept States**: $F = \{q_3\}$

### 5.2 Transition Table $\delta$
| State | on $a$ | on $b$ | Meaning |
| :---: | :---: | :---: | :--- |
| $\to q_0$ | $q_1$ | $q_0$ | Initial state / no match in progress |
| $q_1$ | $q_1$ | $q_2$ | Matched prefix "a" |
| $q_2$ | $q_1$ | $q_3$ | Matched prefix "ab" |
| $*q_3$ | $q_3$ | $q_3$ | Matched full pattern "abb" (trap/accept state) |

### 5.3 Step-by-Step Manual Trace
| Step | Tape Head | Unconsumed Tape | Current State | Symbol Read | $\delta(\text{State}, \text{Symbol})$ | Next State | Next $\in F$? |
| :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| **0** | $0$ | `aabb` | $q_0$ | — | Start | $q_0$ | No |
| **1** | $1$ | `abb` | $q_0$ | **a** | $\delta(q_0, a)$ | $q_1$ | No |
| **2** | $2$ | `bb` | $q_1$ | **a** | $\delta(q_1, a)$ | $q_1$ | No |
| **3** | $3$ | `b` | $q_1$ | **b** | $\delta(q_1, b)$ | $q_2$ | No |
| **4** | $4$ | $\varepsilon$ | $q_2$ | **b** | $\delta(q_2, b)$ | **$q_3$** | **Yes ($q_3 \in F$)** |

### 5.4 Conclusion & Verification
- Final State reached: $q_3 \in F$.
- Output Verdict: **ACCEPTED**.
- State Path Sequence: $q_0 \xrightarrow{a} q_1 \xrightarrow{a} q_1 \xrightarrow{b} q_2 \xrightarrow{b} q_3$.
- **Validation**: Matches the automated output of our `simulateDFA` test suite identically.

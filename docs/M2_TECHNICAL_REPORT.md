# CSET302: Automata Theory & Computability
# Topic 7: DFA/NFA String Processing Visualizer
## Final Technical Report (Milestone M2 Deliverable)

---

## Abstract
Finite Automata constitute the foundational computational model for recognizing regular languages in theoretical computer science. However, the pedagogical understanding of deterministic and non-deterministic state transitions, spontaneous $\varepsilon$-transitions, and power-set state branchings is often hindered by static textbook representations. 

This project presents a web-based, zero-installation **DFA/NFA String Processing Visualizer** developed with React 19, TypeScript, and Cytoscape.js. The simulator enables dynamic definition of 5-tuple finite automata $M = (Q, \Sigma, \delta, q_0, F)$, real-time interactive graph rendering with state illumination and transition pulse animations, animated tape head movement with empty-string ($\varepsilon$) handling, full non-deterministic branch computation with $\varepsilon$-closure resolution, hierarchical computation tree extraction, and automated batch verification. The core engine is mathematically decoupled from the presentation layer and validated through an automated suite of 15 unit tests.

---

## 1. Introduction & Theoretical Foundations

### 1.1 Deterministic Finite Automata (DFA)
A DFA is formally defined as a 5-tuple:
$$M = (Q, \Sigma, \delta, q_0, F)$$
where:
- $Q$ is a finite set of states.
- $\Sigma$ is a finite alphabet of input symbols.
- $\delta: Q \times \Sigma \to Q$ is the deterministic state transition function.
- $q_0 \in Q$ is the initial state.
- $F \subseteq Q$ is the set of final or accepting states.

The extended transition function $\hat{\delta}: Q \times \Sigma^* \to Q$ is defined inductively:
$$\hat{\delta}(q, \varepsilon) = q$$
$$\hat{\delta}(q, xa) = \delta(\hat{\delta}(q, x), a) \quad \text{for } x \in \Sigma^*, a \in \Sigma$$
Language accepted by $M$:
$$L(M) = \{ w \in \Sigma^* \mid \hat{\delta}(q_0, w) \in F \}$$

### 1.2 Non-deterministic Finite Automata with $\varepsilon$-Transitions ($\varepsilon$-NFA)
An $\varepsilon$-NFA allows transitions on empty strings and multiple concurrent targets:
$$\delta: Q \times (\Sigma \cup \{\varepsilon\}) \to \mathcal{P}(Q)$$

The $\varepsilon$-closure of a state set $S \subseteq Q$, denoted $\text{E-CLOSE}(S)$, is the set of all states reachable from any $s \in S$ via zero or more $\varepsilon$-transitions.

Extended transition function for $\varepsilon$-NFA:
$$\hat{\delta}(q_0, \varepsilon) = \text{E-CLOSE}(\{q_0\})$$
$$\hat{\delta}(q_0, xa) = \text{E-CLOSE}\left( \bigcup_{q \in \hat{\delta}(q_0, x)} \delta(q, a) \right)$$
Language accepted:
$$L(M) = \{ w \in \Sigma^* \mid \hat{\delta}(q_0, w) \cap F \neq \emptyset \}$$

---

## 2. System Architecture & Engineering Design

### 2.1 Layered Architecture
The system adopts a strictly decoupled 3-tier architecture:

1. **Core Computation Engine (`src/core/`)**:
   - `types.ts`: Formal tuple types, simulation steps, and tree structures.
   - `validator.ts`: Validates completeness, missing states, and unknown alphabet symbols.
   - `epsilon-closure.ts`: Stack-based DFS resolution of spontaneous transitions with cycle prevention.
   - `dfa-simulator.ts`: Single-path deterministic simulation tracking state trace and unconsumed tape.
   - `nfa-simulator.ts`: Parallel state subset tracking, computation branch recording, and hierarchical tree construction.
   - `step-generator.ts`: Facade dispatching input strings to the appropriate simulator.

2. **Centralized Reactive State Store (`src/store/useStore.ts`)**:
   - Built on Zustand for state updates without React context re-render overhead.
   - Manages machine definition, active step index, playback state, and batch verification caches.

3. **Presentation & Interaction Layer (`src/components/`)**:
   - `AutomatonGraph.tsx`: Cytoscape.js directed multigraph canvas with floating CAD toolbar (zoom in, zoom out, fit, circle layout).
   - `InputTape.tsx`: Visual linear tape with pointer arrow, head position counter, and character line-through on consumption.
   - `SimulationControls.tsx`: Playback toolbar with Play/Pause toggle, variable speed slider (100ms–2000ms), and Step Forward/Backward controls.
   - `TraceTable.tsx`: Tabular trace with active row illumination and auto-scroll.
   - `ComputationTree.tsx`: Recursive branch renderer showing accepting vs dead branches.
   - `BatchTester.tsx`: Bulk verification table with one-click trace loading.
   - `JsonModal.tsx`: Machine serialization, clipboard copy, and custom JSON import.

---

## 3. Algorithm Implementations

### 3.1 $\varepsilon$-Closure via Depth-First Search
```typescript
function computeEpsilonClosure(
  states: State[],
  transitions: Map<string, State[]>
): State[] {
  const closure = new Set<State>(states);
  const stack = [...states];

  while (stack.length > 0) {
    const current = stack.pop()!;
    const epsKey = transitionKey(current, EPSILON);
    const epsTargets = transitions.get(epsKey) || [];

    for (const target of epsTargets) {
      if (!closure.has(target)) {
        closure.add(target);
        stack.push(target);
      }
    }
  }

  return Array.from(closure).sort();
}
```
**Time Complexity**: $\mathcal{O}(|Q| + |E_\varepsilon|)$ where $E_\varepsilon$ is the number of $\varepsilon$-transitions. Cycle prevention is guaranteed by the `closure` set guard.

### 3.2 NFA Parallel Branch Simulation
At each step $i$, given active state subset $S_i$ and character $c \in \Sigma$:
$$S_{i+1} = \text{E-CLOSE}\left( \bigcup_{q \in S_i} \delta(q, c) \right)$$
If $S_{i+1} = \emptyset$, the computation terminates early as all branches have entered dead configurations. Acceptance is checked as:
$$\text{Accepted} = (S_{|w|} \cap F \neq \emptyset)$$

---

## 4. Testing, Validation & Verification

### 4.1 Automated Test Suite Summary (15/15 Pass)
All algorithms are verified via automated Vitest test cases:

| Test ID | Machine Type | Language / Pattern | Test String | Expected Verdict | Actual | Result |
| :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| **TC-01** | DFA | Strings ending in `"ab"` | `"ab"` | ACCEPTED | ACCEPTED | PASS |
| **TC-02** | DFA | Strings ending in `"ab"` | `"aab"` | ACCEPTED | ACCEPTED | PASS |
| **TC-03** | DFA | Strings ending in `"ab"` | `"ba"` | REJECTED | REJECTED | PASS |
| **TC-04** | DFA | Strings ending in `"ab"` | `""` ($\varepsilon$) | REJECTED | REJECTED | PASS |
| **TC-05** | DFA | Strings ending in `"ab"` | `"abc"` | Invalid Symbol Error | Thrown | PASS |
| **TC-06** | DFA | Contains substring `"abb"` | `"aabb"` | ACCEPTED ($q_0 \to q_1 \to q_1 \to q_2 \to q_3$) | ACCEPTED | PASS |
| **TC-07** | $\varepsilon$-Closure | Linear chain ($q_0 \xrightarrow{\varepsilon} q_1 \xrightarrow{\varepsilon} q_2$) | $\{q_0\}$ | $\{q_0, q_1, q_2\}$ | $\{q_0, q_1, q_2\}$ | PASS |
| **TC-08** | $\varepsilon$-Closure | Cyclic loop ($q_0 \xrightarrow{\varepsilon} q_1 \xrightarrow{\varepsilon} q_0$) | $\{q_0\}$ | $\{q_0, q_1\}$ | $\{q_0, q_1\}$ | PASS |
| **TC-09** | NFA | Strings ending in `"ab"` | `"ab"` | ACCEPTED | ACCEPTED | PASS |
| **TC-10** | NFA | Strings ending in `"ab"` | `"aab"` | ACCEPTED | ACCEPTED | PASS |
| **TC-11** | NFA | Strings ending in `"ab"` | `"ba"` | REJECTED | REJECTED | PASS |
| **TC-12** | $\varepsilon$-NFA | $a^*b^*c^*$ | `""` ($\varepsilon$) | ACCEPTED | ACCEPTED | PASS |
| **TC-13** | $\varepsilon$-NFA | $a^*b^*c^*$ | `"abc"` | ACCEPTED | ACCEPTED | PASS |
| **TC-14** | $\varepsilon$-NFA | $a^*b^*c^*$ | `"ba"` | REJECTED | REJECTED | PASS |
| **TC-15** | Validator | Incomplete DFA | Missing transitions | Warning flagged | Flagged | PASS |

---

## 5. User Interface & Interactive Workflow

The application interface consists of four coordinated view panels:
1. **Interactive Cytoscape State Canvas**:
   - Double-bordered circles for final states $F$.
   - Cyan directed arrow for start state $q_0$.
   - Dynamic node background transition: `#334155` $\to$ `#6366f1` (regular active) or `#10b981` (accepting active).
   - Animated edge pulse for active transitions.
   - Interactive toolbar: Zoom In, Zoom Out, Fit to View, Reset Circle Layout.
2. **Synchronized Tape Controller**:
   - Bouncing pointer arrow indicating current character being consumed.
   - Strikethrough effect on processed characters.
   - Head index counter ($i / |w|$).
3. **Tabbed Inspector Panel**:
   - **Transition Table**: Editable matrix to insert/remove states, alphabet symbols, and transitions.
   - **Trace Log**: Tabular breakdown of each step with unconsumed tape and next states.
   - **Batch Tester**: Multi-string testing suite with live statistics and 1-click step-by-step trace loading.
4. **NFA Computation Tree**:
   - Displays all execution branches hierarchically with colour-coded leaves (Green for accepted, Red for dead/rejected).

---

## 6. Conclusion
The **DFA/NFA String Processing Visualizer** fulfills and exceeds all requirements set forth in the CSET302 curriculum for Topic 7. By pairing formal Automata Theory algorithms with reactive visualization, the simulator provides an educational and technical resource for studying regular language recognition and state computation paths.

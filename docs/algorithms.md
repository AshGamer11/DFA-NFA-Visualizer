# Core Automata Algorithms & Tricky Edge Cases

**Course:** CSET302 — Automata Theory and Computability  
**Topic:** Topic 7 — DFA / NFA / ε-NFA String Processing Visualizer  
**Documentation:** `docs/algorithms.md`

---

## 1. Overview of the Simulation Engines

In theoretical computer science, a Finite Automaton processes an input string $w = a_1 a_2 \dots a_n$ over a finite alphabet $\Sigma$ through discrete state transitions. This project implements three distinct simulation engines:

1. **Deterministic Finite Automaton (DFA):** Exactly one deterministic path from the start state $q_0$.
2. **Non-Deterministic Finite Automaton (NFA without $\epsilon$):** Multiple concurrent branches explored simultaneously as state subsets.
3. **$\epsilon$-NFA (with Spontaneous Moves):** Non-deterministic exploration enhanced by breadth-first $\epsilon$-closure ($\text{ECLOSE}$) expansion.

Both the **Java 23 Spring Boot backend** and the **React client-side fallback engine** implement identical algorithmic logic to guarantee 100% execution consistency.

---

## 2. Algorithm 1: Deterministic Finite Automaton (DFA)

### 2.1 Theoretical Formulation
A DFA is a 5-tuple $M = \langle Q, \Sigma, \delta, q_0, F \rangle$ where:
$$\delta : Q \times \Sigma \to Q$$
For every state $q \in Q$ and symbol $a \in \Sigma$, there is exactly one designated destination state.

### 2.2 DFA Simulation Pseudocode
```text
Algorithm: SimulateDFA
Input:  Automaton M = <Q, Σ, δ, q0, F>, Input string w
Output: SimulationResult { accepted: Boolean, steps: List, finalState: State }

1.  curr_state ← M.q0
2.  steps ← EmptyList()
3.  Record initial step 0: (index=0, symbol=null, current=curr_state)
4.
5.  for i = 1 to length(w) do:
6.      symbol ← w[i]
7.      
8.      // Check if symbol belongs to alphabet
9.      if symbol ∉ M.Σ then:
10.         return REJECT ("Symbol not in alphabet Σ", steps)
11.     
12.     // Look up transition
13.     next_state ← δ(curr_state, symbol)
14.     
15.     if next_state is NULL or UNDEFINED then:
16.         Record step i: (index=i, symbol=symbol, current=TrapState, status="TRAP")
17.         return REJECT ("No valid transition defined (Trap State)", steps)
18.     
19.     curr_state ← next_state
20.     Record step i: (index=i, symbol=symbol, current=curr_state, status="ACTIVE")
21. end for
22.
23. is_accepted ← (curr_state ∈ M.F)
24. return { accepted: is_accepted, steps: steps, finalState: curr_state }
```

### 2.3 Complexity
- **Time Complexity:** $O(|w|)$ — Exactly one state transition evaluated per input symbol.
- **Space Complexity:** $O(1)$ auxiliary memory (plus $O(|w|)$ to store the step-by-step playback history).

### 2.4 Tricky Cases & Safeguards for DFA
1. **Empty String Input ($\epsilon$ or `""`):**
   - *Challenge:* Loop does not execute.
   - *Safeguard:* The algorithm immediately checks if start state $q_0 \in F$. If $q_0$ is an accept state, $\epsilon$ is accepted; otherwise, rejected.
2. **Missing Transitions / Implicit Trap States:**
   - *Challenge:* If the transition table omits $\delta(q_1, '1')$, a naive simulator crashes with a null pointer exception.
   - *Safeguard:* Caught explicitly at line 15, immediately recording a transition to a "Dead/Trap State" and rejecting the string cleanly.
3. **Alphabet Mismatch:**
   - *Challenge:* User inputs `'2'` for an automaton over $\Sigma = \{0, 1\}$.
   - *Safeguard:* Pre-simulation validation flags invalid characters immediately.

---

## 3. Algorithm 2: NFA without $\epsilon$-Moves

### 3.1 Theoretical Formulation
An NFA without $\epsilon$-moves allows a state to transition to zero, one, or multiple states:
$$\delta : Q \times \Sigma \to \mathcal{P}(Q)$$
Execution represents a tree of concurrent computational threads.

### 3.2 NFA Simulation Pseudocode
```text
Algorithm: SimulateNFA
Input:  Automaton M = <Q, Σ, δ, q0, F>, Input string w
Output: SimulationResult { accepted: Boolean, steps: List, activeStates: Set }

1.  active_states ← { M.q0 }
2.  steps ← EmptyList()
3.  Record step 0: (index=0, active=active_states)
4.
5.  for i = 1 to length(w) do:
6.      symbol ← w[i]
7.      next_active ← EmptySet()
8.      
9.      for each state q in active_states do:
10.         destinations ← δ(q, symbol)     // returns Set of states
11.         next_active ← next_active ∪ destinations
12.     end for
13.     
14.     if next_active is EMPTY then:
15.         Record step i: (index=i, active=∅, status="ALL_BRANCHES_DEAD")
16.         return REJECT ("All computational branches died", steps)
17.     
18.     active_states ← next_active
19.     Record step i: (index=i, symbol=symbol, active=active_states)
20. end for
21.
22. // Acceptance requires at least ONE surviving active branch to be in F
23. is_accepted ← (active_states ∩ M.F ≠ ∅)
24. return { accepted: is_accepted, steps: steps, finalActive: active_states }
```

### 3.3 Complexity
- **Time Complexity:** $O(|w| \cdot |Q|)$ per string run in practice.
- **Space Complexity:** $O(|Q|)$ space to maintain the current active state subset.

### 3.4 Tricky Cases & Safeguards for NFA
1. **Dead Branches (Subset Pruning):**
   - *Challenge:* Some branches reach states with no outgoing transition for the current symbol.
   - *Safeguard:* Individual dead branches simply drop out of the `next_active` set. As long as at least one branch survives, computation continues.
2. **Branch State Deduplication:**
   - *Challenge:* If state $q_0$ branches to $q_1$ and state $q_2$ also branches to $q_1$, storing lists would cause exponential duplicate state tracking.
   - *Safeguard:* Set data structures (`HashSet` in Java, `Set` in JavaScript) ensure state uniqueness at each step.
3. **Acceptance Condition Difference:**
   - *Challenge:* Unlike a DFA where the final single state must be in $F$, an NFA accepts if **any** active branch terminates in $F$, even if 95% of branches died or ended in non-accepting states.

---

## 4. Algorithm 3: $\epsilon$-NFA with Spontaneous Moves & $\epsilon$-Closure

### 4.1 Theoretical Formulation
An $\epsilon$-NFA allows transitions labeled $\epsilon$ (or $\lambda$), which occur spontaneously without reading any tape symbol:
$$\delta : Q \times (\Sigma \cup \{\epsilon\}) \to \mathcal{P}(Q)$$

### 4.2 The $\epsilon$-Closure Algorithm ($\text{ECLOSE}$)
For any state set $S \subseteq Q$, $\text{ECLOSE}(S)$ is the set of states reachable by following zero or more $\epsilon$-transitions.

```text
Algorithm: ComputeEpsilonClosure
Input:  Automaton M, Set of States S
Output: Set of States ECLOSE(S)

1.  closure ← CopySet(S)           // Every state is reachable from itself via 0 moves
2.  queue ← Queue(S)               // BFS traversal queue
3.  visited ← CopySet(S)           // Prevents infinite loops
4.
5.  while queue is NOT empty do:
6.      curr ← queue.dequeue()
7.      epsilon_targets ← δ(curr, 'ε') ∪ δ(curr, 'λ')
8.      
9.      for each target in epsilon_targets do:
10.         if target ∉ visited then:
11.             visited.add(target)
12.             closure.add(target)
13.             queue.enqueue(target)
14.         end if
15.     end for
16. end while
17.
18. return closure
```

### 4.3 Full $\epsilon$-NFA String Simulation Pseudocode
```text
Algorithm: SimulateEpsilonNFA
Input:  Automaton M = <Q, Σ, δ, q0, F>, Input string w
Output: SimulationResult

1.  // Step 0 MUST include the ε-closure of the start state!
2.  active_states ← ComputeEpsilonClosure(M, { M.q0 })
3.  Record step 0: (index=0, symbol=null, active=active_states)
4.
5.  for i = 1 to length(w) do:
6.      symbol ← w[i]
7.      direct_moves ← EmptySet()
8.      
9.      // Step A: Follow symbol transitions
10.     for each state q in active_states do:
11.         direct_moves ← direct_moves ∪ δ(q, symbol)
12.     end for
13.     
14.     if direct_moves is EMPTY then:
15.         Record step i: (index=i, symbol=symbol, active=∅, status="REJECTED")
16.         return REJECT ("No valid transitions on symbol", steps)
17.     
18.     // Step B: Follow spontaneous ε-transitions from all target states
19.     active_states ← ComputeEpsilonClosure(M, direct_moves)
20.     Record step i: (index=i, symbol=symbol, active=active_states)
21. end for
22.
23. is_accepted ← (active_states ∩ M.F ≠ ∅)
24. return { accepted: is_accepted, steps: steps, finalActive: active_states }
```

### 4.4 Tricky Cases & Safeguards for $\epsilon$-NFA
1. **Infinite $\epsilon$-Cycles (Cycle Trapping):**
   - *Challenge:* Consider a loop: $q_0 \xrightarrow{\epsilon} q_1 \xrightarrow{\epsilon} q_2 \xrightarrow{\epsilon} q_0$. A naive recursive depth-first function will crash with `StackOverflowError`.
   - *Safeguard:* The `visited` set in Algorithm 4.2 guarantees every state is queued at most once, running in safe $O(|Q| + |E_\epsilon|)$ time regardless of cyclical $\epsilon$-transitions.
2. **Missing Initial $\epsilon$-Closure:**
   - *Challenge:* Beginners often assume step 0 only has $\{q_0\}$. But if $q_0 \xrightarrow{\epsilon} q_1$ and $q_1 \in F$, then the empty string `""` must be accepted!
   - *Safeguard:* Step 0 initializes directly with $\text{ECLOSE}(\{q_0\})$.
3. **Chained Moves ($\epsilon \to \text{symbol} \to \epsilon$):**
   - *Challenge:* Transitions can occur before and after reading a symbol.
   - *Safeguard:* At step $i$, active states are already $\epsilon$-closed from the previous step. We read symbol $a$, collect direct targets, and immediately run $\text{ECLOSE}$ on the target set before step $i+1$.

---

## 5. Summary Table: Engine Comparison

| Property | DFA Simulator | NFA Simulator (No $\epsilon$) | $\epsilon$-NFA Simulator |
|:---|:---|:---|:---|
| **State Storage** | Single State: `String` | State Subset: `Set<String>` | $\epsilon$-Closed Subset: `Set<String>` |
| **Step 0 State** | $q_0$ | $\{q_0\}$ | $\text{ECLOSE}(\{q_0\})$ |
| **Transition Lookup** | $\delta(q, a) \to q_{next}$ | $\bigcup_{q \in S} \delta(q, a)$ | $\text{ECLOSE}\left(\bigcup_{q \in S} \delta(q, a)\right)$ |
| **Acceptance Test** | $q_{final} \in F$ | $S_{final} \cap F \neq \emptyset$ | $S_{final} \cap F \neq \emptyset$ |
| **Primary Edge Case** | Missing transitions (trap states) | Dead branches pruning | Cyclic $\epsilon$-loops & initial closure |

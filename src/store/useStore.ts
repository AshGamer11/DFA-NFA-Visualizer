import { create } from 'zustand';
import type {
  AutomatonDefinition,
  SimulationResult,
  SimulationStep,
  ComputationBranch,
  AutomatonType,
  State,
  ValidationError,
} from '../core/types';
import { transitionKey } from '../core/types';
import { generateSteps } from '../core/step-generator';
import { buildComputationTree } from '../core/nfa-simulator';
import { validateAutomaton } from '../core/validator';
import { PRESET_AUTOMATA } from '../core/presets';

interface AppState {
  // Automaton definition
  definition: AutomatonDefinition;
  // Simulation
  inputString: string;
  simulationResult: SimulationResult | null;
  computationTree: ComputationBranch | null;
  currentStepIndex: number;
  isPlaying: boolean;
  playbackSpeed: number;
  // Validation
  validationErrors: ValidationError[];
  // UI
  activeTab: 'editor' | 'trace' | 'batch';
  batchTestResults: Array<{
    input: string;
    accepted: boolean;
    stepsCount: number;
    path: string;
    error?: string;
  }> | null;

  // Actions
  setDefinition: (def: AutomatonDefinition) => void;
  setAutomatonType: (type: AutomatonType) => void;
  addState: (state: State) => void;
  removeState: (state: State) => void;
  toggleAcceptState: (state: State) => void;
  setStartState: (state: State) => void;
  setTransition: (from: State, symbol: string, to: State[]) => void;
  removeTransition: (from: State, symbol: string) => void;
  addAlphabetSymbol: (symbol: string) => void;
  removeAlphabetSymbol: (symbol: string) => void;
  setInputString: (input: string) => void;
  runSimulation: () => void;
  runBatchTests: (testStrings: string[]) => void;
  exportDefinitionJSON: () => string;
  importDefinitionJSON: (jsonStr: string) => { success: boolean; error?: string };
  stepForward: () => void;
  stepBackward: () => void;
  play: () => void;
  pause: () => void;
  reset: () => void;
  setPlaybackSpeed: (speed: number) => void;
  loadPreset: (index: number) => void;
  setActiveTab: (tab: 'editor' | 'trace' | 'batch') => void;
  validate: () => ValidationError[];
  getCurrentStep: () => SimulationStep | null;
}

const defaultDefinition: AutomatonDefinition = PRESET_AUTOMATA[0].definition;

export const useStore = create<AppState>((set, get) => ({
  definition: { ...defaultDefinition, transitions: new Map(defaultDefinition.transitions) },
  inputString: PRESET_AUTOMATA[0].testStrings[0]?.input || '',
  simulationResult: null,
  computationTree: null,
  currentStepIndex: -1,
  isPlaying: false,
  playbackSpeed: 800,
  validationErrors: [],
  activeTab: 'editor',
  batchTestResults: null,

  setDefinition: (def) =>
    set({ definition: def, simulationResult: null, currentStepIndex: -1 }),

  setAutomatonType: (type) =>
    set((state) => ({
      definition: { ...state.definition, type },
      simulationResult: null,
      currentStepIndex: -1,
    })),

  addState: (stateName) =>
    set((s) => {
      if (s.definition.states.includes(stateName)) return s;
      return {
        definition: {
          ...s.definition,
          states: [...s.definition.states, stateName],
        },
        simulationResult: null,
        currentStepIndex: -1,
      };
    }),

  removeState: (stateName) =>
    set((s) => {
      const newStates = s.definition.states.filter((st) => st !== stateName);
      const newAccept = s.definition.acceptStates.filter((st) => st !== stateName);
      const newTransitions = new Map(s.definition.transitions);
      for (const [key, value] of newTransitions.entries()) {
        if (key.startsWith(stateName + ',')) {
          newTransitions.delete(key);
        } else {
          const filtered = (value as State[]).filter((st) => st !== stateName);
          if (filtered.length === 0) newTransitions.delete(key);
          else newTransitions.set(key, filtered);
        }
      }
      return {
        definition: {
          ...s.definition,
          states: newStates,
          acceptStates: newAccept,
          startState:
            s.definition.startState === stateName
              ? newStates[0] || ''
              : s.definition.startState,
          transitions: newTransitions,
        },
        simulationResult: null,
        currentStepIndex: -1,
      };
    }),

  toggleAcceptState: (stateName) =>
    set((s) => {
      const isAccept = s.definition.acceptStates.includes(stateName);
      return {
        definition: {
          ...s.definition,
          acceptStates: isAccept
            ? s.definition.acceptStates.filter((st) => st !== stateName)
            : [...s.definition.acceptStates, stateName],
        },
        simulationResult: null,
        currentStepIndex: -1,
      };
    }),

  setStartState: (stateName) =>
    set((s) => ({
      definition: { ...s.definition, startState: stateName },
      simulationResult: null,
      currentStepIndex: -1,
    })),

  setTransition: (from, symbol, to) =>
    set((s) => {
      const newTransitions = new Map(s.definition.transitions);
      const key = transitionKey(from, symbol);
      if (to.length === 0) newTransitions.delete(key);
      else newTransitions.set(key, to);
      return {
        definition: { ...s.definition, transitions: newTransitions },
        simulationResult: null,
        currentStepIndex: -1,
      };
    }),

  removeTransition: (from, symbol) =>
    set((s) => {
      const newTransitions = new Map(s.definition.transitions);
      newTransitions.delete(transitionKey(from, symbol));
      return {
        definition: { ...s.definition, transitions: newTransitions },
        simulationResult: null,
        currentStepIndex: -1,
      };
    }),

  addAlphabetSymbol: (symbol) =>
    set((s) => {
      if (s.definition.alphabet.includes(symbol)) return s;
      return {
        definition: {
          ...s.definition,
          alphabet: [...s.definition.alphabet, symbol],
        },
        simulationResult: null,
        currentStepIndex: -1,
      };
    }),

  removeAlphabetSymbol: (symbol) =>
    set((s) => {
      const newTransitions = new Map(s.definition.transitions);
      for (const key of newTransitions.keys()) {
        if (key.endsWith(',' + symbol)) newTransitions.delete(key);
      }
      return {
        definition: {
          ...s.definition,
          alphabet: s.definition.alphabet.filter((sym) => sym !== symbol),
          transitions: newTransitions,
        },
        simulationResult: null,
        currentStepIndex: -1,
      };
    }),

  setInputString: (input) =>
    set({
      inputString: input,
      simulationResult: null,
      currentStepIndex: -1,
      isPlaying: false,
    }),

  runSimulation: () => {
    const state = get();
    const errors = validateAutomaton(state.definition);
    if (errors.some((e) => e.type === 'error')) {
      set({ validationErrors: errors, simulationResult: null });
      return;
    }
    try {
      const result = generateSteps(state.definition, state.inputString);
      let tree: ComputationBranch | null = null;
      if (state.definition.type === 'NFA') {
        tree = buildComputationTree(state.definition, state.inputString);
      }
      set({
        simulationResult: result,
        computationTree: tree,
        currentStepIndex: 0,
        validationErrors: errors,
        isPlaying: false,
        activeTab: 'trace',
      });
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : String(e);
      set({
        validationErrors: [{ type: 'error', message }],
        simulationResult: null,
      });
    }
  },

  runBatchTests: (testStrings) => {
    const state = get();
    const results = testStrings.map((input) => {
      try {
        const res = generateSteps(state.definition, input);
        const pathStr = res.path[0]?.join(' → ') || '';
        return {
          input,
          accepted: res.accepted,
          stepsCount: res.steps.length,
          path: pathStr,
        };
      } catch (err: unknown) {
        return {
          input,
          accepted: false,
          stepsCount: 0,
          path: 'N/A',
          error: err instanceof Error ? err.message : String(err),
        };
      }
    });
    set({ batchTestResults: results, activeTab: 'batch' });
  },

  exportDefinitionJSON: () => {
    const def = get().definition;
    const serializable = {
      type: def.type,
      states: def.states,
      alphabet: def.alphabet,
      startState: def.startState,
      acceptStates: def.acceptStates,
      transitions: Object.fromEntries(def.transitions),
    };
    return JSON.stringify(serializable, null, 2);
  },

  importDefinitionJSON: (jsonStr: string) => {
    try {
      const data = JSON.parse(jsonStr);
      if (!data.type || !Array.isArray(data.states) || !Array.isArray(data.alphabet) || !data.startState) {
        return { success: false, error: 'Invalid JSON: missing required automaton fields (type, states, alphabet, startState)' };
      }
      const transitionsMap = new Map<string, string[]>();
      if (data.transitions && typeof data.transitions === 'object') {
        for (const [key, val] of Object.entries(data.transitions)) {
          if (Array.isArray(val)) {
            transitionsMap.set(key, val as string[]);
          }
        }
      }
      const newDef: AutomatonDefinition = {
        type: data.type,
        states: data.states,
        alphabet: data.alphabet,
        startState: data.startState,
        acceptStates: Array.isArray(data.acceptStates) ? data.acceptStates : [],
        transitions: transitionsMap,
      };
      const errors = validateAutomaton(newDef);
      if (errors.some((e) => e.type === 'error')) {
        return { success: false, error: errors.map((e) => e.message).join('; ') };
      }
      set({
        definition: newDef,
        simulationResult: null,
        computationTree: null,
        currentStepIndex: -1,
        validationErrors: errors,
      });
      return { success: true };
    } catch (err: unknown) {
      return { success: false, error: err instanceof Error ? err.message : 'Invalid JSON format' };
    }
  },

  stepForward: () =>
    set((s) => {
      if (!s.simulationResult) return s;
      const maxStep = s.simulationResult.steps.length - 1;
      if (s.currentStepIndex >= maxStep) return { isPlaying: false };
      return { currentStepIndex: s.currentStepIndex + 1 };
    }),

  stepBackward: () =>
    set((s) => {
      if (!s.simulationResult || s.currentStepIndex <= 0) return s;
      return { currentStepIndex: s.currentStepIndex - 1 };
    }),

  play: () => set({ isPlaying: true }),
  pause: () => set({ isPlaying: false }),

  reset: () =>
    set({
      simulationResult: null,
      computationTree: null,
      currentStepIndex: -1,
      isPlaying: false,
    }),

  setPlaybackSpeed: (speed) => set({ playbackSpeed: speed }),

  loadPreset: (index) => {
    const preset = PRESET_AUTOMATA[index];
    if (!preset) return;
    set({
      definition: {
        ...preset.definition,
        transitions: new Map(preset.definition.transitions),
      },
      inputString: preset.testStrings[0]?.input || '',
      simulationResult: null,
      computationTree: null,
      currentStepIndex: -1,
      isPlaying: false,
      validationErrors: [],
      activeTab: 'editor',
    });
  },

  setActiveTab: (tab) => set({ activeTab: tab }),

  validate: () => {
    const errors = validateAutomaton(get().definition);
    set({ validationErrors: errors });
    return errors;
  },

  getCurrentStep: () => {
    const { simulationResult, currentStepIndex } = get();
    if (!simulationResult || currentStepIndex < 0) return null;
    return simulationResult.steps[currentStepIndex] || null;
  },
}));

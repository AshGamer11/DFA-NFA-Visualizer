import axios from 'axios';
import { simulateDFA } from '../engine/DFASimulator';
import { simulateNFA } from '../engine/NFASimulator';
import { validateAutomaton as clientValidate } from '../engine/AutomatonValidator';
import { EXAMPLE_AUTOMATA } from '../engine/examples';

const apiClient = axios.create({
  baseURL: '/api',
  timeout: 3000,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Checks if the Spring Boot backend is reachable.
 */
export const checkBackendHealth = async () => {
  try {
    const response = await apiClient.get('/examples');
    if (Array.isArray(response.data) && response.data.length > 0) {
      return { isOnline: true, data: response.data };
    }
  } catch (err) {
    // try /health as fallback
  }

  try {
    const response = await apiClient.get('/health');
    return { isOnline: response.data?.status === 'UP', data: response.data };
  } catch {
    return { isOnline: false, error: 'Backend unreachable' };
  }
};

/**
 * Simulates DFA execution: tries Spring Boot backend, falls back to client simulation.
 */
export const apiSimulateDFA = async (automaton, inputString) => {
  try {
    const response = await apiClient.post('/simulate', {
      automaton,
      inputString,
    });
    return {
      success: true,
      fromBackend: true,
      result: response.data,
    };
  } catch (error) {
    // Fallback to client-side engine
    console.info('Backend request failed or offline; using client-side DFA simulation engine.', error.message);
    const result = simulateDFA(automaton, inputString);
    return {
      success: true,
      fromBackend: false,
      result,
    };
  }
};

/**
 * Simulates NFA execution: tries Spring Boot backend, falls back to client simulation.
 */
export const apiSimulateNFA = async (automaton, inputString) => {
  try {
    const response = await apiClient.post('/simulate', {
      automaton,
      inputString,
    });
    return {
      success: true,
      fromBackend: true,
      result: response.data,
    };
  } catch (error) {
    // Fallback to client-side engine
    console.info('Backend request failed or offline; using client-side NFA simulation engine.', error.message);
    const result = simulateNFA(automaton, inputString);
    return {
      success: true,
      fromBackend: false,
      result,
    };
  }
};

/**
 * Validates automaton via backend or client-side engine.
 */
export const apiValidateAutomaton = async (automaton) => {
  try {
    const response = await apiClient.post('/automata/validate', automaton);
    return {
      fromBackend: true,
      validation: response.data,
    };
  } catch {
    return {
      fromBackend: false,
      validation: clientValidate(automaton),
    };
  }
};

/**
 * Fetches examples: from backend if available, otherwise built-in examples.
 */
export const apiGetExamples = async () => {
  try {
    const response = await apiClient.get('/examples');
    return {
      fromBackend: true,
      examples: response.data,
    };
  } catch {
    return {
      fromBackend: false,
      examples: EXAMPLE_AUTOMATA,
    };
  }
};

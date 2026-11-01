import React, { useState } from 'react';
import './AutomatonEditor.css';
import StateEditor from './StateEditor';
import AlphabetEditor from './AlphabetEditor';
import TransitionEditor from './TransitionEditor';
import { AUTOMATON_TYPES, EPSILON } from '../../utils/constants';

export default function AutomatonEditor({
  automaton,
  onChange,
  validation,
}) {
  const [activeTab, setActiveTab] = useState('states');

  const { type, states, alphabet, startState, acceptStates, transitions } = automaton;

  // Handlers for state modifications
  const handleAddState = (name) => {
    const updatedStates = [...states, name];
    const newStartState = startState || name;
    onChange({
      ...automaton,
      states: updatedStates,
      startState: newStartState,
    });
  };

  const handleRemoveState = (name) => {
    const updatedStates = states.filter((s) => s !== name);
    const updatedAccept = acceptStates.filter((s) => s !== name);
    const newStartState = startState === name ? (updatedStates[0] || '') : startState;
    const updatedTransitions = transitions.filter(
      (t) => t.from !== name && t.to !== name
    );

    onChange({
      ...automaton,
      states: updatedStates,
      startState: newStartState,
      acceptStates: updatedAccept,
      transitions: updatedTransitions,
    });
  };

  const handleSetStartState = (name) => {
    onChange({
      ...automaton,
      startState: name,
    });
  };

  const handleToggleAcceptState = (name) => {
    const updatedAccept = acceptStates.includes(name)
      ? acceptStates.filter((s) => s !== name)
      : [...acceptStates, name];
    onChange({
      ...automaton,
      acceptStates: updatedAccept,
    });
  };

  // Handlers for alphabet modifications
  const handleAddSymbol = (sym) => {
    onChange({
      ...automaton,
      alphabet: [...alphabet, sym],
    });
  };

  const handleRemoveSymbol = (sym) => {
    const updatedAlphabet = alphabet.filter((s) => s !== sym);
    const updatedTransitions = transitions.filter((t) => t.symbol !== sym);
    onChange({
      ...automaton,
      alphabet: updatedAlphabet,
      transitions: updatedTransitions,
    });
  };

  const handleSetAlphabet = (newAlphabet) => {
    const validSyms = new Set(newAlphabet);
    const updatedTransitions = transitions.filter(
      (t) => validSyms.has(t.symbol) || (type === AUTOMATON_TYPES.ENFA && t.symbol === EPSILON)
    );
    onChange({
      ...automaton,
      alphabet: newAlphabet,
      transitions: updatedTransitions,
    });
  };

  // Handlers for transitions
  const handleAddTransition = (transition) => {
    onChange({
      ...automaton,
      transitions: [...transitions, transition],
    });
  };

  const handleRemoveTransition = (index) => {
    const updated = transitions.filter((_, i) => i !== index);
    onChange({
      ...automaton,
      transitions: updated,
    });
  };

  return (
    <div className="automaton-editor">
      <div className="editor-header">
        <div className="editor-header-title">
          <h3>Automaton Specification</h3>
        </div>
        <div className="editor-header-badges">
          {validation.isValid ? (
            <span className="validation-pill valid">
              ✓ Valid {type}
            </span>
          ) : (
            <span className="validation-pill invalid">
              ⚠ Invalid {type}
            </span>
          )}
        </div>
      </div>

      {!validation.isValid && validation.errors && validation.errors.length > 0 && (
        <div className="validation-banner">
          {validation.errors.map((err, i) => (
            <div key={i}>• {err}</div>
          ))}
        </div>
      )}

      {validation.warnings && validation.warnings.length > 0 && (
        <div className="validation-warning-banner">
          {validation.warnings.map((warn, i) => (
            <div key={i}>⚠️ {warn}</div>
          ))}
        </div>
      )}

      <div className="editor-tabs">
        <button
          type="button"
          className={`editor-tab-btn ${activeTab === 'states' ? 'active' : ''}`}
          onClick={() => setActiveTab('states')}
        >
          States Q ({states.length})
        </button>
        <button
          type="button"
          className={`editor-tab-btn ${activeTab === 'alphabet' ? 'active' : ''}`}
          onClick={() => setActiveTab('alphabet')}
        >
          Alphabet &Sigma; ({alphabet.length})
        </button>
        <button
          type="button"
          className={`editor-tab-btn ${activeTab === 'transitions' ? 'active' : ''}`}
          onClick={() => setActiveTab('transitions')}
        >
          Transitions &delta; ({transitions.length})
        </button>
        <button
          type="button"
          className={`editor-tab-btn ${activeTab === 'formal' ? 'active' : ''}`}
          onClick={() => setActiveTab('formal')}
        >
          Formal Tuple
        </button>
      </div>

      <div className="editor-content-body">
        {activeTab === 'states' && (
          <StateEditor
            states={states}
            startState={startState}
            acceptStates={acceptStates}
            onAddState={handleAddState}
            onRemoveState={handleRemoveState}
            onSetStartState={handleSetStartState}
            onToggleAcceptState={handleToggleAcceptState}
          />
        )}

        {activeTab === 'alphabet' && (
          <AlphabetEditor
            alphabet={alphabet}
            automatonType={type}
            onAddSymbol={handleAddSymbol}
            onRemoveSymbol={handleRemoveSymbol}
            onSetAlphabet={handleSetAlphabet}
          />
        )}

        {activeTab === 'transitions' && (
          <TransitionEditor
            states={states}
            alphabet={alphabet}
            transitions={transitions}
            automatonType={type}
            onAddTransition={handleAddTransition}
            onRemoveTransition={handleRemoveTransition}
          />
        )}

        {activeTab === 'formal' && (
          <div className="formal-definition-card">
            <div className="formal-tuple-line">
              M = (Q, &Sigma;, &delta;, q₀, F)
            </div>
            <div className="formal-item">
              <strong>Machine Type:</strong> <span>{type}</span>
            </div>
            <div className="formal-item">
              <strong>States Q:</strong> <span>&#123; {states.join(', ')} &#125;</span>
            </div>
            <div className="formal-item">
              <strong>Alphabet &Sigma;:</strong> <span>&#123; {alphabet.join(', ')} &#125;</span>
            </div>
            <div className="formal-item">
              <strong>Start State q₀:</strong> <span>{startState || '∅'}</span>
            </div>
            <div className="formal-item">
              <strong>Accept States F:</strong>{' '}
              <span>&#123; {acceptStates.join(', ') || '∅'} &#125;</span>
            </div>
            <div className="formal-item">
              <strong>Transition Count |&delta;|:</strong>{' '}
              <span>{transitions.length} transitions</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

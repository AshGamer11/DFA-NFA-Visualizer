import React, { useState } from 'react';

export default function StateEditor({
  states,
  startState,
  acceptStates,
  onAddState,
  onRemoveState,
  onSetStartState,
  onToggleAcceptState,
}) {
  const [newStateName, setNewStateName] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleAddState = (e) => {
    e.preventDefault();
    const name = newStateName.trim();
    if (!name) {
      setErrorMsg('State name cannot be empty');
      return;
    }
    if (states.includes(name)) {
      setErrorMsg(`State "${name}" already exists`);
      return;
    }
    setErrorMsg('');
    onAddState(name);
    setNewStateName('');
  };

  const handleAutoAddNext = () => {
    // Generate next available qN
    let index = states.length;
    while (states.includes(`q${index}`)) {
      index++;
    }
    onAddState(`q${index}`);
  };

  return (
    <div className="editor-subpanel">
      <div className="subpanel-header">
        <h4>States Set Q ({states.length})</h4>
        <button
          type="button"
          className="btn-text-action"
          onClick={handleAutoAddNext}
          title="Quickly add next state qN"
        >
          + Quick Add (q{states.length})
        </button>
      </div>

      <form className="add-item-form" onSubmit={handleAddState}>
        <input
          type="text"
          className="editor-input"
          placeholder="State name (e.g. q0, A, S)"
          value={newStateName}
          onChange={(e) => {
            setNewStateName(e.target.value);
            if (errorMsg) setErrorMsg('');
          }}
          maxLength={12}
        />
        <button type="submit" className="btn-primary-sm">
          Add State
        </button>
      </form>

      {errorMsg && <div className="form-error-msg">{errorMsg}</div>}

      <div className="states-grid-list">
        {states.map((state) => {
          const isStart = state === startState;
          const isAccept = acceptStates.includes(state);

          return (
            <div
              key={state}
              className={`state-card ${isStart ? 'is-start' : ''} ${isAccept ? 'is-accept' : ''}`}
            >
              <div className="state-card-header">
                <span className="state-name-tag">{state}</span>
                <button
                  type="button"
                  className="btn-icon-delete"
                  onClick={() => onRemoveState(state)}
                  title={`Delete state ${state}`}
                  aria-label={`Delete ${state}`}
                >
                  ✕
                </button>
              </div>

              <div className="state-card-controls">
                <label className="state-control-label">
                  <input
                    type="radio"
                    name="startStateRadio"
                    checked={isStart}
                    onChange={() => onSetStartState(state)}
                  />
                  <span>Start (q₀)</span>
                </label>

                <label className="state-control-label">
                  <input
                    type="checkbox"
                    checked={isAccept}
                    onChange={() => onToggleAcceptState(state)}
                  />
                  <span>Accept (F)</span>
                </label>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

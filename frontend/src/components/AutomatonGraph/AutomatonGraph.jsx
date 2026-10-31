import React, { useEffect, useRef, useState, useCallback } from 'react';
import cytoscape from 'cytoscape';
import dagre from 'cytoscape-dagre';
import './AutomatonGraph.css';
import { getGraphStyles } from '../../utils/graphStyles';
import { SIMULATION_STATUS } from '../../utils/constants';

// Register dagre layout plugin safely once
try {
  cytoscape.use(dagre);
} catch {
  // Already registered or in reload
}

export default function AutomatonGraph({
  automaton,
  activeStates = [],
  activeTransitions = [],
  simulationStatus = SIMULATION_STATUS.IDLE,
  theme = 'dark',
}) {
  const containerRef = useRef(null);
  const cyRef = useRef(null);
  const [layoutName, setLayoutName] = useState('cose');

  const { states = [], startState, acceptStates = [], transitions = [] } = automaton || {};

  // Construct elements for Cytoscape
  const buildElements = useCallback(() => {
    const elements = [];

    if (!states || states.length === 0) return elements;

    // 1. Add state nodes
    states.forEach((state) => {
      elements.push({
        group: 'nodes',
        data: {
          id: state,
          label: state,
          isStart: state === startState,
          isAccept: acceptStates.includes(state),
        },
      });
    });

    // 2. Add start arrow node and edge
    if (startState && states.includes(startState)) {
      elements.push({
        group: 'nodes',
        data: {
          id: '__start_entry__',
          type: 'start_arrow',
        },
      });

      elements.push({
        group: 'edges',
        data: {
          id: '__start_edge__',
          source: '__start_entry__',
          target: startState,
          type: 'start_edge',
        },
      });
    }

    // 3. Group transitions between same source and target
    const edgeMap = new Map();

    transitions.forEach((t) => {
      if (!states.includes(t.from) || !states.includes(t.to)) return;

      const key = `${t.from}-->${t.to}`;
      if (!edgeMap.has(key)) {
        edgeMap.set(key, {
          from: t.from,
          to: t.to,
          symbols: [t.symbol],
        });
      } else {
        const item = edgeMap.get(key);
        if (!item.symbols.includes(t.symbol)) {
          item.symbols.push(t.symbol);
        }
      }
    });

    edgeMap.forEach((edgeData, key) => {
      elements.push({
        group: 'edges',
        data: {
          id: `edge-${key}`,
          source: edgeData.from,
          target: edgeData.to,
          label: edgeData.symbols.join(', '),
          symbols: edgeData.symbols,
          isLoop: edgeData.from === edgeData.to,
        },
      });
    });

    return elements;
  }, [states, startState, acceptStates, transitions]);

  // Compute layout config based on chosen layout
  const getLayoutConfig = useCallback(
    (name) => {
      if (name === 'dagre') {
        return {
          name: 'dagre',
          rankDir: 'LR',
          nodeSep: 60,
          rankSep: 90,
          padding: 50,
          animate: true,
          animationDuration: 350,
        };
      }
      if (name === 'circle') {
        return {
          name: 'circle',
          padding: 50,
          animate: true,
          animationDuration: 350,
        };
      }
      // Default: 'cose'
      return {
        name: 'cose',
        animate: true,
        animationDuration: 350,
        randomize: false,
        componentSpacing: 100,
        nodeRepulsion: 650000,
        idealEdgeLength: 110,
        edgeElasticity: 0.45,
        nestingFactor: 1.2,
        padding: 50,
      };
    },
    []
  );

  // Initialize Cytoscape instance
  useEffect(() => {
    if (!containerRef.current) return;

    const isDark = theme === 'dark';
    const cy = cytoscape({
      container: containerRef.current,
      style: getGraphStyles(isDark),
      elements: buildElements(),
      layout: getLayoutConfig(layoutName),
      userZoomingEnabled: true,
      userPanningEnabled: true,
      boxSelectionEnabled: false,
      wheelSensitivity: 0.25,
      minZoom: 0.3,
      maxZoom: 3,
    });

    cyRef.current = cy;

    return () => {
      cy.destroy();
      cyRef.current = null;
    };
  }, [theme]); // re-init when theme changes

  // Update elements when automaton changes
  useEffect(() => {
    const cy = cyRef.current;
    if (!cy) return;

    cy.elements().remove();
    cy.add(buildElements());

    // Position ghost start arrow node slightly to the left of start state
    const startNode = cy.$id(startState);
    const startGhost = cy.$id('__start_entry__');
    if (startNode.length > 0 && startGhost.length > 0) {
      const pos = startNode.position();
      startGhost.position({ x: pos.x - 70, y: pos.y });
    }

    const layout = cy.layout(getLayoutConfig(layoutName));
    layout.run();
  }, [automaton, buildElements, getLayoutConfig, layoutName, startState]);

  // Update dynamic highlights (active states and active transitions)
  useEffect(() => {
    const cy = cyRef.current;
    if (!cy) return;

    // Reset state node classes
    cy.nodes().forEach((node) => {
      node.removeClass('active');
      node.removeClass('accepted-state');
      node.removeClass('rejected-state');
    });

    // Reset edge classes
    cy.edges().forEach((edge) => {
      edge.removeClass('active-edge');
    });

    // Highlight active states
    if (activeStates && activeStates.length > 0) {
      activeStates.forEach((stateName) => {
        const node = cy.$id(stateName);
        if (node.length > 0) {
          if (simulationStatus === SIMULATION_STATUS.ACCEPTED) {
            node.addClass('accepted-state');
          } else if (simulationStatus === SIMULATION_STATUS.REJECTED) {
            node.addClass('rejected-state');
          } else {
            node.addClass('active');
          }
        }
      });
    }

    // Highlight active transitions
    if (activeTransitions && activeTransitions.length > 0) {
      activeTransitions.forEach((t) => {
        const edgeId = `edge-${t.from}-->${t.to}`;
        const edge = cy.$id(edgeId);
        if (edge.length > 0) {
          edge.addClass('active-edge');
        }
      });
    }
  }, [activeStates, activeTransitions, simulationStatus]);

  // Resize handler
  useEffect(() => {
    if (!containerRef.current) return;

    const ro = new ResizeObserver(() => {
      if (cyRef.current) {
        cyRef.current.resize();
      }
    });

    ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, []);

  // Controls
  const handleZoomIn = () => {
    if (cyRef.current) cyRef.current.zoom(cyRef.current.zoom() * 1.25);
  };

  const handleZoomOut = () => {
    if (cyRef.current) cyRef.current.zoom(cyRef.current.zoom() / 1.25);
  };

  const handleFit = () => {
    if (cyRef.current) cyRef.current.fit(undefined, 40);
  };

  const handleCenter = () => {
    if (cyRef.current) cyRef.current.center();
  };

  const handleLayoutChange = (name) => {
    setLayoutName(name);
    if (cyRef.current) {
      const layout = cyRef.current.layout(getLayoutConfig(name));
      layout.run();
    }
  };

  return (
    <div className="graph-container">
      <div className="graph-top-bar">
        <div className="graph-title">
          <span>State Transition Graph</span>
        </div>

        <div className="graph-legend">
          <div className="legend-item">
            <span className="legend-circle start" />
            <span>Start</span>
          </div>
          <div className="legend-item">
            <span className="legend-circle accept" />
            <span>Accept</span>
          </div>
          <div className="legend-item">
            <span className="legend-circle active" />
            <span>Current</span>
          </div>
        </div>
      </div>

      <div className="layout-selector">
        <button
          type="button"
          className={`layout-btn ${layoutName === 'cose' ? 'active' : ''}`}
          onClick={() => handleLayoutChange('cose')}
          title="Force-directed spring layout"
        >
          CoSE
        </button>
        <button
          type="button"
          className={`layout-btn ${layoutName === 'dagre' ? 'active' : ''}`}
          onClick={() => handleLayoutChange('dagre')}
          title="Hierarchical Left-to-Right layout"
        >
          Dagre
        </button>
        <button
          type="button"
          className={`layout-btn ${layoutName === 'circle' ? 'active' : ''}`}
          onClick={() => handleLayoutChange('circle')}
          title="Circular layout"
        >
          Circle
        </button>
      </div>

      <div ref={containerRef} className="cytoscape-canvas" />

      {states.length === 0 && (
        <div className="empty-graph-overlay">
          <span style={{ fontSize: '2rem' }}>⭕</span>
          <p>No states defined. Add states to visualize the automaton.</p>
        </div>
      )}

      <div className="graph-floating-controls">
        <button
          type="button"
          className="graph-btn"
          onClick={handleZoomIn}
          title="Zoom In"
        >
          +
        </button>
        <button
          type="button"
          className="graph-btn"
          onClick={handleZoomOut}
          title="Zoom Out"
        >
          &minus;
        </button>
        <button
          type="button"
          className="graph-btn"
          onClick={handleFit}
          title="Fit Graph to Screen"
        >
          ⛶
        </button>
        <button
          type="button"
          className="graph-btn"
          onClick={handleCenter}
          title="Center Graph"
        >
          ⊙
        </button>
      </div>
    </div>
  );
}

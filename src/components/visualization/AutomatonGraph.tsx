import { useEffect, useRef, useCallback } from 'react';
import cytoscape, { type Core } from 'cytoscape';
import { useStore } from '../../store/useStore';
import { parseTransitionKey } from '../../core/types';
import { ZoomIn, ZoomOut, Maximize2, RotateCcw } from 'lucide-react';

export function AutomatonGraph() {
  const containerRef = useRef<HTMLDivElement>(null);
  const cyRef = useRef<Core | null>(null);
  const { definition, simulationResult, currentStepIndex } = useStore();

  // Build cytoscape elements from definition
  const buildElements = useCallback(() => {
    const elements: cytoscape.ElementDefinition[] = [];

    // Add a dummy node for the start arrow
    elements.push({
      data: { id: '__start__', label: '' },
      classes: 'start-arrow-source',
    });

    // Add state nodes
    for (const state of definition.states) {
      const isAccepting = definition.acceptStates.includes(state);
      const isStart = definition.startState === state;
      elements.push({
        data: {
          id: state,
          label: state,
        },
        classes: [
          isAccepting ? 'accept-state' : 'normal-state',
          isStart ? 'start-state' : '',
        ]
          .filter(Boolean)
          .join(' '),
      });
    }

    // Add start arrow edge
    elements.push({
      data: {
        id: '__start_edge__',
        source: '__start__',
        target: definition.startState,
        label: '',
      },
      classes: 'start-edge',
    });

    // Collect edges: group by (source, target) to merge labels
    const edgeMap = new Map<string, string[]>();
    for (const [key, targets] of definition.transitions.entries()) {
      const [fromState, symbol] = parseTransitionKey(key);
      for (const target of targets) {
        const edgeId = `${fromState}->${target}`;
        if (!edgeMap.has(edgeId)) edgeMap.set(edgeId, []);
        edgeMap.get(edgeId)!.push(symbol);
      }
    }

    // Add edges
    for (const [edgeId, symbols] of edgeMap.entries()) {
      const [source, target] = edgeId.split('->');
      elements.push({
        data: {
          id: `edge-${edgeId}`,
          source,
          target,
          label: symbols.join(', '),
        },
      });
    }

    return elements;
  }, [definition]);

  // Initialize and update Cytoscape
  useEffect(() => {
    if (!containerRef.current) return;

    // Destroy previous instance
    if (cyRef.current) {
      cyRef.current.destroy();
    }

    const elements = buildElements();

    cyRef.current = cytoscape({
      container: containerRef.current,
      elements,
      style: [
        {
          selector: 'node',
          style: {
            label: 'data(label)',
            'text-valign': 'center',
            'text-halign': 'center',
            'font-size': '14px',
            'font-weight': 'bold' as const,
            'font-family': 'monospace',
            color: '#f1f5f9',
            'background-color': '#334155',
            'border-width': 2,
            'border-color': '#64748b',
            width: 50,
            height: 50,
            'text-outline-width': 0,
          } as cytoscape.Css.Node,
        },
        {
          selector: 'node.accept-state',
          style: {
            'border-width': 4,
            'border-color': '#f59e0b',
            'border-style': 'double' as const,
          } as cytoscape.Css.Node,
        },
        {
          selector: 'node.active',
          style: {
            'background-color': '#6366f1',
            'border-color': '#818cf8',
            'border-width': 3,
          } as cytoscape.Css.Node,
        },
        {
          selector: 'node.active.accept-state',
          style: {
            'background-color': '#10b981',
            'border-color': '#34d399',
          } as cytoscape.Css.Node,
        },
        {
          selector: '.start-arrow-source',
          style: {
            width: 1,
            height: 1,
            'background-opacity': 0,
            'border-width': 0,
            label: '',
          } as cytoscape.Css.Node,
        },
        {
          selector: 'edge',
          style: {
            width: 2,
            'line-color': '#475569',
            'target-arrow-color': '#475569',
            'target-arrow-shape': 'triangle',
            'curve-style': 'bezier',
            label: 'data(label)',
            'font-size': '12px',
            'font-family': 'monospace',
            'font-weight': 'bold' as const,
            color: '#94a3b8',
            'text-background-color': '#1e293b',
            'text-background-opacity': 0.9,
            'text-background-padding': '4px',
            'arrow-scale': 1.2,
          } as cytoscape.Css.Edge,
        },
        {
          selector: 'edge.active-edge',
          style: {
            width: 3,
            'line-color': '#6366f1',
            'target-arrow-color': '#6366f1',
            color: '#f1f5f9',
          } as cytoscape.Css.Edge,
        },
        {
          selector: 'edge.start-edge',
          style: {
            width: 2,
            'line-color': '#06b6d4',
            'target-arrow-color': '#06b6d4',
          } as cytoscape.Css.Edge,
        },
        {
          selector: ':loop',
          style: {
            'curve-style': 'bezier',
            'control-point-step-size': 60,
          } as cytoscape.Css.Edge,
        },
      ],
      layout: {
        name: 'circle',
        padding: 60,
        startAngle: (3 / 2) * Math.PI,
      },
      userZoomingEnabled: true,
      userPanningEnabled: true,
      boxSelectionEnabled: false,
    });

    // Position start arrow source near start state
    const startNode = cyRef.current.getElementById(definition.startState);
    const startDummy = cyRef.current.getElementById('__start__');
    if (startNode.length && startDummy.length) {
      const pos = startNode.position();
      startDummy.position({ x: pos.x - 80, y: pos.y });
    }

    return () => {
      if (cyRef.current) {
        cyRef.current.destroy();
        cyRef.current = null;
      }
    };
  }, [definition, buildElements]);

  // Update highlights based on current step
  useEffect(() => {
    const cy = cyRef.current;
    if (!cy) return;

    // Clear all highlights
    cy.nodes().removeClass('active');
    cy.edges().removeClass('active-edge');

    if (!simulationResult || currentStepIndex < 0) return;

    const step = simulationResult.steps[currentStepIndex];
    if (!step) return;

    // Highlight current/next states
    const activeStates = currentStepIndex === 0
      ? step.currentStates
      : step.nextStates;

    for (const state of activeStates) {
      cy.getElementById(state).addClass('active');
    }

    // Highlight the traversed edge
    if (step.symbolRead && step.currentStates.length > 0) {
      for (const fromState of step.currentStates) {
        for (const toState of step.nextStates) {
          const edgeId = `edge-${fromState}->${toState}`;
          cy.getElementById(edgeId).addClass('active-edge');
        }
      }
    }
  }, [currentStepIndex, simulationResult]);

  const handleZoomIn = () => {
    if (cyRef.current) {
      cyRef.current.zoom({
        level: cyRef.current.zoom() * 1.25,
        renderedPosition: { x: cyRef.current.width() / 2, y: cyRef.current.height() / 2 },
      });
    }
  };

  const handleZoomOut = () => {
    if (cyRef.current) {
      cyRef.current.zoom({
        level: cyRef.current.zoom() * 0.8,
        renderedPosition: { x: cyRef.current.width() / 2, y: cyRef.current.height() / 2 },
      });
    }
  };

  const handleFit = () => {
    cyRef.current?.fit(undefined, 40);
  };

  const handleResetLayout = () => {
    if (!cyRef.current) return;
    const layout = cyRef.current.layout({
      name: 'circle',
      padding: 60,
      startAngle: (3 / 2) * Math.PI,
    });
    layout.run();
  };

  return (
    <div className="relative h-full w-full min-h-[300px]">
      <div ref={containerRef} className="cy-container" />

      {/* Floating Canvas Toolbar */}
      <div className="absolute top-3 right-3 flex items-center gap-1 rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)]/90 p-1 shadow-lg backdrop-blur-md">
        <button
          onClick={handleZoomIn}
          title="Zoom In"
          className="rounded-lg p-1.5 text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-dark)] transition-colors"
        >
          <ZoomIn className="h-4 w-4" />
        </button>
        <button
          onClick={handleZoomOut}
          title="Zoom Out"
          className="rounded-lg p-1.5 text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-dark)] transition-colors"
        >
          <ZoomOut className="h-4 w-4" />
        </button>
        <button
          onClick={handleFit}
          title="Fit Canvas"
          className="rounded-lg p-1.5 text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-dark)] transition-colors"
        >
          <Maximize2 className="h-4 w-4" />
        </button>
        <div className="h-4 w-px bg-[var(--border-color)] mx-0.5" />
        <button
          onClick={handleResetLayout}
          title="Reset Layout"
          className="rounded-lg p-1.5 text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-dark)] transition-colors"
        >
          <RotateCcw className="h-4 w-4" />
        </button>
      </div>

      {/* Legend */}
      <div className="absolute bottom-3 left-3 flex gap-3 rounded-lg bg-[var(--bg-card)]/90 px-3 py-2 text-xs backdrop-blur-sm border border-[var(--border-color)]">
        <div className="flex items-center gap-1.5">
          <div className="h-3 w-3 rounded-full border-2 border-[#64748b] bg-[#334155]" />
          <span className="text-[var(--text-muted)]">State</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="h-3 w-3 rounded-full border-2 border-[#f59e0b] bg-[#334155]" style={{ borderStyle: 'double', borderWidth: 3 }} />
          <span className="text-[var(--text-muted)]">Accept</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="h-3 w-3 rounded-full bg-[#6366f1]" />
          <span className="text-[var(--text-muted)]">Active</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="h-0.5 w-3 bg-[#06b6d4]" />
          <span className="text-[var(--text-muted)]">Start</span>
        </div>
      </div>
    </div>
  );
}

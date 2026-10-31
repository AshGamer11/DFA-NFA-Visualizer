/**
 * Cytoscape.js Stylesheet for DFA/NFA Automata Graph
 */

export const getGraphStyles = (isDark = true) => [
  // Base State Node
  {
    selector: 'node[type != "start_arrow"]',
    style: {
      label: 'data(label)',
      'text-valign': 'center',
      'text-halign': 'center',
      width: 54,
      height: 54,
      'font-family': 'Fira Code, monospace',
      'font-size': '15px',
      'font-weight': 600,
      color: isDark ? '#f8fafc' : '#0f172a',
      'background-color': isDark ? '#1e293b' : '#ffffff',
      'border-width': 2.5,
      'border-color': isDark ? '#64748b' : '#94a3b8',
      'transition-property': 'background-color, border-color, width, height, border-width, shadow-blur',
      'transition-duration': '0.25s',
      'z-index': 10,
    },
  },

  // Start State
  {
    selector: 'node[?isStart]',
    style: {
      'border-color': '#3b82f6',
      'border-width': 3,
    },
  },

  // Accept State (Double border simulation)
  {
    selector: 'node[?isAccept]',
    style: {
      'border-style': 'double',
      'border-width': 6,
      'border-color': '#10b981',
    },
  },

  // Start + Accept State
  {
    selector: 'node[?isStart][?isAccept]',
    style: {
      'border-style': 'double',
      'border-width': 6,
      'border-color': '#10b981',
    },
  },

  // Active / Current State during simulation
  {
    selector: 'node.active',
    style: {
      'background-color': isDark ? '#312e81' : '#dbeafe',
      'border-color': '#f59e0b',
      'border-width': 4.5,
      color: isDark ? '#fef08a' : '#1e3a8a',
      'font-weight': 700,
      width: 60,
      height: 60,
      'shadow-blur': 25,
      'shadow-color': 'rgba(245, 158, 11, 0.75)',
      'shadow-opacity': 0.9,
      'z-index': 99,
    },
  },

  // Accepted End State
  {
    selector: 'node.accepted-state',
    style: {
      'background-color': isDark ? '#064e3b' : '#dcfce7',
      'border-color': '#22c55e',
      'border-width': 6,
      color: '#ffffff',
      'shadow-blur': 30,
      'shadow-color': 'rgba(34, 197, 94, 0.85)',
      'shadow-opacity': 1,
      'z-index': 100,
    },
  },

  // Rejected End State
  {
    selector: 'node.rejected-state',
    style: {
      'background-color': isDark ? '#7f1d1d' : '#fee2e2',
      'border-color': '#ef4444',
      'border-width': 5,
      'shadow-blur': 25,
      'shadow-color': 'rgba(239, 68, 68, 0.75)',
      'shadow-opacity': 0.9,
      'z-index': 100,
    },
  },

  // Ghost Start Arrow Node (Phantom node to draw the initial arrow)
  {
    selector: 'node[type = "start_arrow"]',
    style: {
      width: 1,
      height: 1,
      opacity: 0,
      'background-opacity': 0,
      'border-opacity': 0,
      events: 'no',
    },
  },

  // Directed Transitions (Edges)
  {
    selector: 'edge[type != "start_edge"]',
    style: {
      label: 'data(label)',
      'curve-style': 'bezier',
      'control-point-step-size': 45,
      'target-arrow-shape': 'triangle',
      'arrow-scale': 1.3,
      'line-color': isDark ? '#64748b' : '#94a3b8',
      'target-arrow-color': isDark ? '#64748b' : '#94a3b8',
      width: 2.2,
      'font-family': 'Fira Code, monospace',
      'font-size': '13px',
      'font-weight': 600,
      color: isDark ? '#e2e8f0' : '#1e293b',
      'text-background-opacity': 1,
      'text-background-color': isDark ? '#0f172a' : '#ffffff',
      'text-background-padding': '3px',
      'text-background-shape': 'roundrectangle',
      'text-border-opacity': 0.7,
      'text-border-width': 1,
      'text-border-color': isDark ? '#334155' : '#cbd5e1',
      'text-margin-y': -8,
      'transition-property': 'line-color, target-arrow-color, width, shadow-blur',
      'transition-duration': '0.2s',
      'z-index': 5,
    },
  },

  // Self Loops
  {
    selector: 'edge[?isLoop]',
    style: {
      'curve-style': 'bezier',
      'loop-direction': '-45deg',
      'loop-sweep': '-90deg',
      'control-point-step-size': 50,
    },
  },

  // Phantom Start Arrow Edge
  {
    selector: 'edge[type = "start_edge"]',
    style: {
      label: 'start',
      'curve-style': 'straight',
      'target-arrow-shape': 'triangle',
      'arrow-scale': 1.2,
      'line-color': '#3b82f6',
      'target-arrow-color': '#3b82f6',
      width: 2.5,
      'font-family': 'Inter, sans-serif',
      'font-size': '11px',
      'font-weight': 600,
      color: '#3b82f6',
      'text-background-opacity': 0,
      'line-style': 'dashed',
      events: 'no',
    },
  },

  // Active / Traversed Edge during simulation
  {
    selector: 'edge.active-edge',
    style: {
      'line-color': '#f59e0b',
      'target-arrow-color': '#f59e0b',
      width: 4.5,
      'font-weight': 700,
      'shadow-blur': 15,
      'shadow-color': 'rgba(245, 158, 11, 0.8)',
      'shadow-opacity': 1,
      'z-index': 90,
    },
  },

  // Highlighted path edge
  {
    selector: 'edge.path-edge',
    style: {
      'line-color': '#10b981',
      'target-arrow-color': '#10b981',
      width: 3.5,
      'z-index': 80,
    },
  },
];

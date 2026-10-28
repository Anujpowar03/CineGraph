/** Visual identity for each node type - shared by the graph, legend and panel. */
export const NODE_STYLES = {
  movie: { label: 'Movie', color: '#8b5cf6', shape: 'round-rectangle', size: 30 },
  genre: { label: 'Genre', color: '#2dd4bf', shape: 'hexagon', size: 28 },
  actor: { label: 'Actor', color: '#fbbf24', shape: 'ellipse', size: 22 },
  director: { label: 'Director', color: '#fb7185', shape: 'diamond', size: 28 },
  user: { label: 'User', color: '#38bdf8', shape: 'ellipse', size: 26 },
};

export const EDGE_LABELS = {
  IN_GENRE: 'Movie belongs to genre',
  ACTED_IN: 'Actor appeared in movie',
  DIRECTED: 'Director made movie',
  LIKED: 'User liked movie',
  RATED: 'User rated movie (1-5)',
  WATCHED: 'User watched movie',
  PREFERS: 'User prefers genre',
};

export const cytoscapeStylesheet = [
  {
    selector: 'node',
    style: {
      label: 'data(label)',
      'font-family': 'Inter, system-ui, sans-serif',
      'font-size': 9,
      color: '#cbd5e1',
      'text-valign': 'bottom',
      'text-margin-y': 5,
      'text-wrap': 'ellipsis',
      'text-max-width': 90,
      'text-outline-color': '#080b14',
      'text-outline-width': 2,
      'border-width': 2,
      'border-color': '#080b14',
      'transition-property': 'opacity, border-color, border-width',
      'transition-duration': 150,
    },
  },
  ...Object.entries(NODE_STYLES).map(([type, s]) => ({
    selector: `node[type = "${type}"]`,
    style: { 'background-color': s.color, shape: s.shape, width: s.size, height: s.size },
  })),
  { selector: 'node.center', style: { width: 46, height: 46, 'font-size': 11, 'font-weight': 600, color: '#ffffff', 'border-color': '#ffffff', 'border-width': 3 } },
  { selector: 'node[?isViewer]', style: { 'border-color': '#ffffff', 'border-width': 3 } },
  { selector: 'node:selected', style: { 'border-color': '#f8fafc', 'border-width': 4, 'overlay-opacity': 0 } },
  {
    selector: 'edge',
    style: {
      width: 1.2,
      'line-color': 'rgba(148,163,184,0.32)',
      'target-arrow-color': 'rgba(148,163,184,0.45)',
      'target-arrow-shape': 'triangle',
      'arrow-scale': 0.65,
      'curve-style': 'bezier',
      label: 'data(label)',
      'font-size': 7,
      color: '#94a3b8',
      'text-rotation': 'autorotate',
      'text-opacity': 0,
      'text-background-color': '#080b14',
      'text-background-opacity': 0.8,
      'text-background-padding': 1,
    },
  },
  { selector: 'edge[label = "LIKED"]', style: { 'line-color': 'rgba(251,113,133,0.45)', 'target-arrow-color': 'rgba(251,113,133,0.6)' } },
  { selector: 'edge[label = "RATED"]', style: { 'line-style': 'dashed' } },
  { selector: '.faded', style: { opacity: 0.12 } },
  { selector: 'edge.highlighted', style: { width: 2, 'line-color': '#a78bfa', 'target-arrow-color': '#a78bfa', 'text-opacity': 1, color: '#e2e8f0' } },
  { selector: 'node.highlighted', style: { opacity: 1 } },
];

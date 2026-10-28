import cytoscape from 'cytoscape';
import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';
import { cytoscapeStylesheet } from './graphStyles.js';

const LAYOUT = {
  name: 'cose',
  animate: true,
  animationDuration: 500,
  randomize: false,
  nodeRepulsion: () => 9000,
  idealEdgeLength: () => 90,
  gravity: 0.35,
  padding: 30,
  fit: true,
};

/**
 * Thin React wrapper around Cytoscape.js.
 * - `elements` ({ nodes, edges }) is merged into the graph incrementally, so
 *   expanding a node adds neighbours without rebuilding everything.
 * - Tapping a node highlights its neighbourhood and calls onSelect.
 * - Double-tapping a node calls onExpand.
 * Parent components control it through the ref (fit, zoom, relayout).
 */
const GraphExplorer = forwardRef(function GraphExplorer({ elements, centerId, onSelect, onExpand }, ref) {
  const containerRef = useRef(null);
  const cyRef = useRef(null);
  const handlers = useRef({ onSelect, onExpand });
  handlers.current = { onSelect, onExpand };

  // Create the Cytoscape instance once.
  useEffect(() => {
    const cy = cytoscape({
      container: containerRef.current,
      style: cytoscapeStylesheet,
      minZoom: 0.2,
      maxZoom: 3,
      boxSelectionEnabled: false,
    });
    cyRef.current = cy;

    const clearHighlight = () => cy.elements().removeClass('faded highlighted');
    const highlight = (node) => {
      clearHighlight();
      const hood = node.closedNeighborhood();
      cy.elements().not(hood).addClass('faded');
      hood.addClass('highlighted');
    };
    const describe = (node) => {
      const neighbours = node.neighborhood('node').map((n) => n.data());
      return { ...node.data(), degree: node.degree(), neighbours };
    };

    cy.on('tap', 'node', (evt) => {
      highlight(evt.target);
      handlers.current.onSelect?.(describe(evt.target));
    });
    cy.on('dbltap', 'node', (evt) => handlers.current.onExpand?.(evt.target.data()));
    cy.on('tap', (evt) => {
      if (evt.target === cy) {
        clearHighlight();
        handlers.current.onSelect?.(null);
      }
    });

    const resize = new ResizeObserver(() => cy.resize());
    resize.observe(containerRef.current);
    return () => {
      resize.disconnect();
      cy.destroy();
    };
  }, []);

  // Merge new elements; remove ones that disappeared (e.g. after a reset).
  useEffect(() => {
    const cy = cyRef.current;
    if (!cy) return;
    const wanted = new Set([...elements.nodes, ...elements.edges].map((e) => e.data.id));
    const stale = cy.elements().filter((e) => !wanted.has(e.id()));
    const anchor = centerId && cy.getElementById(centerId).nonempty() ? cy.getElementById(centerId).position() : { x: 0, y: 0 };

    const newNodes = elements.nodes.filter((n) => cy.getElementById(n.data.id).empty());
    const newEdges = elements.edges.filter((e) => cy.getElementById(e.data.id).empty());
    if (stale.empty() && newNodes.length === 0 && newEdges.length === 0) return;

    cy.batch(() => {
      stale.remove();
      // Start new nodes near the node they were expanded from.
      cy.add(newNodes.map((n) => ({ ...n, position: { x: anchor.x + (Math.random() - 0.5) * 80, y: anchor.y + (Math.random() - 0.5) * 80 } })));
      cy.add(newEdges);
      cy.nodes().removeClass('center');
      if (centerId) cy.getElementById(centerId).addClass('center');
    });
    cy.layout(LAYOUT).run();
  }, [elements, centerId]);

  useImperativeHandle(ref, () => ({
    fit: () => cyRef.current?.animate({ fit: { padding: 30 }, duration: 300 }),
    zoomBy: (factor) => {
      const cy = cyRef.current;
      if (!cy) return;
      cy.animate({ zoom: { level: cy.zoom() * factor, renderedPosition: { x: cy.width() / 2, y: cy.height() / 2 } }, duration: 200 });
    },
    relayout: () => cyRef.current?.layout({ ...LAYOUT, randomize: true }).run(),
    clearSelection: () => {
      cyRef.current?.elements().removeClass('faded highlighted').unselect();
    },
    focus: (id) => {
      const cy = cyRef.current;
      const node = cy?.getElementById(id);
      if (node?.nonempty()) {
        node.emit('tap');
        cy.animate({ center: { eles: node }, duration: 300 });
      }
    },
  }));

  return (
    <div
      ref={containerRef}
      className="h-full w-full"
      role="application"
      aria-label="Interactive movie graph. Click a node to see details; double-click to expand its connections."
    />
  );
});

export default GraphExplorer;

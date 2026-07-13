import { useEffect, useRef, useState, useCallback } from 'react';
import * as d3 from 'd3';
import MapToolbar from '../MapControls/MapToolbar';
import { AddZoneModal, AddRoadModal, DeleteConfirmModal } from '../Modal/Modal';
import { Maximize2 } from 'lucide-react';
import './CityMap.css';

const NODE_COLORS = {
  hospital: 'var(--node-hospital)',
  fire:     'var(--node-fire)',
  police:   'var(--node-police)',
  airport:  'var(--node-airport)',
  zone:     'var(--node-zone)'
};

const NODE_ICONS = {
  hospital: '🏥',
  fire:     '🚒',
  police:   '🚓',
  airport:  '✈️',
  zone:     '🏘️'
};

export default function CityMap({
  nodes, edges,
  highlightedEdges = [],
  highlightedNodes = [],
  blockedEdges = [],
  mstEdges = [],
  onNodeClick,
  onEdgeClick,
  onNodeDragEnd,
  onAddNode,
  onAddEdge,
  onRemoveNode,
  onRemoveEdge,
  onClearAll,
  readOnly = false
}) {
  const svgRef  = useRef();
  const zoomRef = useRef();

  const [mode, setMode] = useState('drag');
  const [edgeStartNode, setEdgeStartNode] = useState(null);
  const [cursorPos,     setCursorPos]     = useState({ x: 0, y: 0 });

  // ── Modal state ──────────────────────────────────────────────────
  // Add Zone
  const [addZoneOpen,   setAddZoneOpen]   = useState(false);
  const [clickCoords,   setClickCoords]   = useState({ x: 0, y: 0 });

  // Add Road
  const [addRoadOpen,   setAddRoadOpen]   = useState(false);
  const [pendingEdge,   setPendingEdge]   = useState(null); // { u, v }

  // Delete confirm
  const [deleteOpen,    setDeleteOpen]    = useState(false);
  const [deleteTarget,  setDeleteTarget]  = useState(null); // { kind:'node'|'edge', ... }

  // ── Fit to view ──────────────────────────────────────────────────
  const fitToView = useCallback(() => {
    if (!svgRef.current || nodes.length === 0) return;
    const svg    = d3.select(svgRef.current);
    const width  = svgRef.current.clientWidth;
    const height = svgRef.current.clientHeight;
    const xs = nodes.map(n => n.x);
    const ys = nodes.map(n => n.y);
    const minX = Math.min(...xs), maxX = Math.max(...xs);
    const minY = Math.min(...ys), maxY = Math.max(...ys);
    const graphW = maxX - minX || 1;
    const graphH = maxY - minY || 1;
    const padding = 80;
    const scale = Math.min(
      (width  - padding * 2) / graphW,
      (height - padding * 2) / graphH,
      1.2
    );
    const tx = width  / 2 - scale * (minX + graphW / 2);
    const ty = height / 2 - scale * (minY + graphH / 2);
    if (zoomRef.current) {
      svg.transition().duration(500).call(
        zoomRef.current.transform,
        d3.zoomIdentity.translate(tx, ty).scale(scale)
      );
    }
  }, [nodes]);

  // ── D3 render ────────────────────────────────────────────────────
  useEffect(() => {
    if (!svgRef.current) return;
    const svg = d3.select(svgRef.current);
    svg.selectAll('.map-content').remove();

    const width  = svgRef.current.clientWidth;
    const height = svgRef.current.clientHeight;
    const g      = svg.append('g').attr('class', 'map-content');

    // Zoom
    const zoom = d3.zoom()
      .scaleExtent([0.2, 4])
      .on('zoom', (event) => g.attr('transform', event.transform));

    zoomRef.current = zoom;

    if (mode === 'drag') {
      svg.call(zoom);
      const currentZoom = svg.node().__zoom;
      if (!currentZoom || (currentZoom.k === 1 && currentZoom.x === 0 && currentZoom.y === 0)) {
        if (nodes.length > 0) {
          const xs = nodes.map(n => n.x);
          const ys = nodes.map(n => n.y);
          const minX = Math.min(...xs), maxX = Math.max(...xs);
          const minY = Math.min(...ys), maxY = Math.max(...ys);
          const graphW = maxX - minX || 1, graphH = maxY - minY || 1;
          const padding = 80;
          const scale = Math.min(
            (width  - padding * 2) / graphW,
            (height - padding * 2) / graphH,
            1.2
          );
          svg.call(zoom.transform, d3.zoomIdentity
            .translate(width / 2 - scale * (minX + graphW / 2), height / 2 - scale * (minY + graphH / 2))
            .scale(scale)
          );
        } else {
          svg.call(zoom.transform, d3.zoomIdentity.translate(width / 2, height / 2));
        }
      } else {
        // Restore the visual transform if already zoomed
        g.attr('transform', currentZoom);
      }
    } else {
      svg.on('.zoom', null);
      // Even in non-drag mode, we need to keep the visual transform!
      const currentZoom = svg.node().__zoom;
      if (currentZoom) {
        g.attr('transform', currentZoom);
      }
    }

    // SVG click → add node (opens modal instead of directly adding)
    svg.on('click', (event) => {
      if (mode === 'add_node') {
        const coords = d3.pointer(event, g.node());
        setClickCoords({ x: coords[0], y: coords[1] });
        setAddZoneOpen(true);
      } else if (mode === 'add_edge' && edgeStartNode) {
        setEdgeStartNode(null); // cancel edge on background click
      }
    });

    // Mouse move → rubber-band edge line
    svg.on('mousemove', (event) => {
      if (mode === 'add_edge' && edgeStartNode) {
        const coords = d3.pointer(event, g.node());
        setCursorPos({ x: coords[0], y: coords[1] });
      }
    });

    // Defs
    const defs   = g.append('defs');
    const filter = defs.append('filter').attr('id', 'glow');
    filter.append('feGaussianBlur').attr('stdDeviation', '4').attr('result', 'coloredBlur');
    const feMerge = filter.append('feMerge');
    feMerge.append('feMergeNode').attr('in', 'coloredBlur');
    feMerge.append('feMergeNode').attr('in', 'SourceGraphic');

    // Temp edge while drawing
    if (mode === 'add_edge' && edgeStartNode) {
      const startObj = nodes.find(n => n.id === edgeStartNode);
      if (startObj) {
        g.append('line')
          .attr('x1', startObj.x).attr('y1', startObj.y)
          .attr('x2', cursorPos.x).attr('y2', cursorPos.y)
          .attr('stroke', 'var(--accent-cyan)')
          .attr('stroke-width', 2.5)
          .attr('stroke-dasharray', '6,4')
          .attr('class', 'temp-edge');
      }
    }

    // ── Edges ──────────────────────────────────────────────────────
    const edgeGroups = g.selectAll('.edge-group')
      .data(edges)
      .enter().append('g')
      .attr('class', 'edge-group')
      .on('click', (event, d) => {
        event.stopPropagation();
        if (mode === 'delete') {
          const fromNode = nodes.find(n => n.id === d.u);
          const toNode   = nodes.find(n => n.id === d.v);
          setDeleteTarget({
            kind: 'edge',
            u: d.u, v: d.v,
            fromLabel: fromNode?.label || d.u,
            toLabel:   toNode?.label   || d.v,
          });
          setDeleteOpen(true);
        } else if (onEdgeClick) {
          onEdgeClick(d);
        }
      });

    // Outer dotted orange line for traffic
    edgeGroups.append('line')
      .attr('class', 'traffic-outline')
      .attr('x1', d => nodes.find(n => n.id === d.u)?.x || 0)
      .attr('y1', d => nodes.find(n => n.id === d.u)?.y || 0)
      .attr('x2', d => nodes.find(n => n.id === d.v)?.x || 0)
      .attr('y2', d => nodes.find(n => n.id === d.v)?.y || 0)
      .attr('stroke', d => (d.w > d.originalW) ? 'var(--accent-orange)' : 'none')
      .attr('stroke-width', 8)
      .attr('stroke-dasharray', '4,4');

    edgeGroups.append('line')
      .attr('class', 'edge-line')
      .attr('x1', d => nodes.find(n => n.id === d.u)?.x || 0)
      .attr('y1', d => nodes.find(n => n.id === d.u)?.y || 0)
      .attr('x2', d => nodes.find(n => n.id === d.v)?.x || 0)
      .attr('y2', d => nodes.find(n => n.id === d.v)?.y || 0)
      .attr('stroke', d => {
        const isBlocked = blockedEdges.some(b => (b.u === d.u && b.v === d.v) || (b.u === d.v && b.v === d.u)) || d.blocked;
        if (isBlocked) return 'var(--accent-red)';
        const isMst = mstEdges.some(m => (m.u === d.u && m.v === d.v) || (m.u === d.v && m.v === d.u));
        if (isMst) return 'var(--accent-green)';
        const isHighlight = highlightedEdges.some(h => (h.u === d.u && h.v === d.v) || (h.u === d.v && h.v === d.u));
        if (isHighlight) return '#007bff'; // Blue line for the fast route
        return 'rgba(0, 207, 255, 0.3)';
      })
      .attr('stroke-width', d => {
        const isHighlight = highlightedEdges.some(h => (h.u === d.u && h.v === d.v) || (h.u === d.v && h.v === d.u));
        const isMst       = mstEdges.some(m => (m.u === d.u && m.v === d.v) || (m.u === d.v && m.v === d.u));
        return (isHighlight || isMst) ? 4 : 2;
      })
      .attr('stroke-dasharray', d => {
        const isBlocked = blockedEdges.some(b => (b.u === d.u && b.v === d.v) || (b.u === d.v && b.v === d.u)) || d.blocked;
        return isBlocked ? '5,5' : 'none';
      });

    edgeGroups.append('rect')
      .attr('x',      d => { const u = nodes.find(n => n.id === d.u); const v = nodes.find(n => n.id === d.v); return u && v ? (u.x + v.x) / 2 - 12 : 0; })
      .attr('y',      d => { const u = nodes.find(n => n.id === d.u); const v = nodes.find(n => n.id === d.v); return u && v ? (u.y + v.y) / 2 - 12 : 0; })
      .attr('width',  24).attr('height', 24)
      .attr('fill',   'rgba(10, 11, 15, 0.95)').attr('rx', 4)
      .attr('stroke', 'rgba(0, 207, 255, 0.35)');

    edgeGroups.append('text')
      .attr('class', 'edge-label')
      .attr('x', d => { const u = nodes.find(n => n.id === d.u); const v = nodes.find(n => n.id === d.v); return u && v ? (u.x + v.x) / 2 : 0; })
      .attr('y', d => { const u = nodes.find(n => n.id === d.u); const v = nodes.find(n => n.id === d.v); return u && v ? (u.y + v.y) / 2 : 0; })
      .text(d => d.w)
      .attr('text-anchor', 'middle').attr('dominant-baseline', 'central')
      .attr('fill', d => {
        if (d.w > d.originalW) return 'var(--accent-red)';
        return d.w > 30 ? 'var(--accent-orange)' : 'var(--neon-blue)';
      })
      .attr('font-size', '12px')
      .attr('font-weight', d => d.w > d.originalW ? 'bold' : '600')
      .attr('font-family', 'var(--font-mono)');

    // ── Nodes ──────────────────────────────────────────────────────
    const nodeGroups = g.selectAll('.node-group')
      .data(nodes)
      .enter().append('g')
      .attr('class', 'node-group')
      .attr('transform', d => `translate(${d.x},${d.y})`)
      .on('click', (event, d) => {
        event.stopPropagation();

        if (mode === 'delete') {
          // Show confirmation modal
          setDeleteTarget({ kind: 'node', id: d.id, label: d.label });
          setDeleteOpen(true);

        } else if (mode === 'add_edge') {
          if (!edgeStartNode) {
            setEdgeStartNode(d.id);
            setCursorPos({ x: d.x, y: d.y });
          } else {
            if (edgeStartNode !== d.id) {
              setPendingEdge({ u: edgeStartNode, v: d.id });
              setAddRoadOpen(true);
            }
            setEdgeStartNode(null);
          }

        } else if (onNodeClick) {
          onNodeClick(d);
        }
      });

    if (mode === 'drag') {
      const drag = d3.drag()
        .on('start', function() { d3.select(this).raise(); })
        .on('drag', function(event, d) {
          d.x = event.x; d.y = event.y;
          d3.select(this).attr('transform', `translate(${d.x},${d.y})`);
          g.selectAll('.edge-line')
            .filter(e => e.u === d.id || e.v === d.id)
            .attr('x1', e => nodes.find(n => n.id === e.u).x)
            .attr('y1', e => nodes.find(n => n.id === e.u).y)
            .attr('x2', e => nodes.find(n => n.id === e.v).x)
            .attr('y2', e => nodes.find(n => n.id === e.v).y);
          g.selectAll('.edge-group rect')
            .filter(e => e.u === d.id || e.v === d.id)
            .attr('x', e => (nodes.find(n => n.id === e.u).x + nodes.find(n => n.id === e.v).x) / 2 - 12)
            .attr('y', e => (nodes.find(n => n.id === e.u).y + nodes.find(n => n.id === e.v).y) / 2 - 12);
          g.selectAll('.edge-label')
            .filter(e => e.u === d.id || e.v === d.id)
            .attr('x', e => (nodes.find(n => n.id === e.u).x + nodes.find(n => n.id === e.v).x) / 2)
            .attr('y', e => (nodes.find(n => n.id === e.u).y + nodes.find(n => n.id === e.v).y) / 2);
        })
        .on('end', function(event, d) {
          if (onNodeDragEnd) onNodeDragEnd(d.id, d.x, d.y);
        });
      nodeGroups.call(drag);
    } else {
      nodeGroups.on('.drag', null);
    }

    nodeGroups.append('circle')
      .attr('r', 24)
      .attr('fill', d => NODE_COLORS[d.type] || NODE_COLORS.zone)
      .attr('fill-opacity', 0.15)
      .attr('stroke', d => {
        if (edgeStartNode === d.id) return 'var(--accent-cyan)';
        return NODE_COLORS[d.type] || NODE_COLORS.zone;
      })
      .attr('stroke-width', d => edgeStartNode === d.id ? 4 : 2)
      .attr('filter', d => highlightedNodes.includes(d.id) || edgeStartNode === d.id ? 'url(#glow)' : null);

    nodeGroups.append('text')
      .text(d => NODE_ICONS[d.type] || NODE_ICONS.zone)
      .attr('text-anchor', 'middle').attr('dominant-baseline', 'central')
      .attr('font-size', '20px').attr('y', 2);

    nodeGroups.append('rect')
      .attr('x', -40).attr('y', 28).attr('width', 80).attr('height', 20)
      .attr('fill', 'var(--bg-primary)').attr('fill-opacity', 0.8).attr('rx', 4);

    nodeGroups.append('text')
      .text(d => d.label.split(' ')[0] + ' ' + (d.label.split(' ')[1] || ''))
      .attr('text-anchor', 'middle').attr('y', 42)
      .attr('fill', 'var(--text-primary)')
      .attr('font-size', '12px').attr('font-weight', '500');

  }, [nodes, edges, highlightedEdges, highlightedNodes, blockedEdges, mstEdges,
      mode, edgeStartNode, cursorPos,
      onNodeClick, onEdgeClick, onNodeDragEnd, onAddNode, onRemoveNode, onRemoveEdge]);

  // ── Modal handlers ───────────────────────────────────────────────
  const handleZoneSubmit = ({ type, label, x, y }) => {
    if (onAddNode) onAddNode({ x, y, type, label });
    setAddZoneOpen(false);
  };

  const handleRoadSubmit = (weight) => {
    if (pendingEdge && onAddEdge) onAddEdge(pendingEdge.u, pendingEdge.v, weight);
    setAddRoadOpen(false);
    setPendingEdge(null);
  };

  const handleDeleteConfirm = () => {
    if (!deleteTarget) return;
    if (deleteTarget.kind === 'node' && onRemoveNode) onRemoveNode(deleteTarget.id);
    if (deleteTarget.kind === 'edge' && onRemoveEdge) onRemoveEdge(deleteTarget.u, deleteTarget.v);
    setDeleteOpen(false);
    setDeleteTarget(null);
  };

  // Build fromNode / toNode objects for AddRoadModal
  const fromNode = pendingEdge ? (() => {
    const n = nodes.find(n => n.id === pendingEdge.u);
    return n ? { label: n.label, icon: NODE_ICONS[n.type] || '📍' } : null;
  })() : null;
  const toNode = pendingEdge ? (() => {
    const n = nodes.find(n => n.id === pendingEdge.v);
    return n ? { label: n.label, icon: NODE_ICONS[n.type] || '📍' } : null;
  })() : null;

  // Edge-start node name (shown in toolbar hint)
  const edgeStartNodeObj = edgeStartNode ? nodes.find(n => n.id === edgeStartNode) : null;

  return (
    <div className={`city-map-container mode-${mode}`}>
      {!readOnly && (
        <MapToolbar
          mode={mode}
          setMode={(m) => { setMode(m); setEdgeStartNode(null); }}
          onClear={onClearAll}
          edgeStartNodeName={edgeStartNodeObj?.label}
        />
      )}
      <svg ref={svgRef} className="city-map-svg" />

      {/* Fit-to-view */}
      <button className="fit-btn" onClick={fitToView} title="Fit graph to view">
        <Maximize2 size={15} />
        <span>Fit View</span>
      </button>

      {/* Add Zone modal */}
      <AddZoneModal
        isOpen={addZoneOpen}
        clickCoords={clickCoords}
        onClose={() => setAddZoneOpen(false)}
        onSubmit={handleZoneSubmit}
      />

      {/* Add Road modal */}
      <AddRoadModal
        isOpen={addRoadOpen}
        fromNode={fromNode}
        toNode={toNode}
        onClose={() => { setAddRoadOpen(false); setPendingEdge(null); }}
        onSubmit={handleRoadSubmit}
      />

      {/* Delete confirm modal */}
      <DeleteConfirmModal
        isOpen={deleteOpen}
        target={deleteTarget}
        onClose={() => { setDeleteOpen(false); setDeleteTarget(null); }}
        onConfirm={handleDeleteConfirm}
      />
    </div>
  );
}

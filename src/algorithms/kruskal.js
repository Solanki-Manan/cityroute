import { DSU } from './dsu';
import { getLabel } from '../utils/graphUtils';

/**
 * Kruskal's MST algorithm with DSU
 */
export function kruskal(nodes, edges) {
  const n = nodes.length;
  const ids = nodes.map(n => n.id);
  const idx = {};
  ids.forEach((id, i) => idx[id] = i);

  const sortedEdges = [...edges]
    .filter(e => !e.blocked)
    .sort((a, b) => a.w - b.w);

  const dsu = new DSU(n);
  const mst = [];
  const steps = [];
  let totalCost = 0;

  for (const edge of sortedEdges) {
    const ui = idx[edge.u], vi = idx[edge.v];
    const uLabel = getLabel(nodes, edge.u);
    const vLabel = getLabel(nodes, edge.v);
    
    steps.push({ 
      type: 'consider', edge, 
      description: `Considering edge ${uLabel} — ${vLabel} (cost: ${edge.w})` 
    });

    if (dsu.union(ui, vi, `${uLabel}—${vLabel}`)) {
      mst.push(edge);
      totalCost += edge.w;
      steps.push({ 
        type: 'accept', edge, mst: [...mst], totalCost,
        description: `✅ Accepted! MST cost so far: ${totalCost}` 
      });
    } else {
      steps.push({ 
        type: 'reject', edge, 
        description: `❌ Rejected (would form a cycle)` 
      });
    }

    if (mst.length === n - 1) break;
  }

  return { mst, totalCost, steps, dsuSteps: dsu.steps };
}

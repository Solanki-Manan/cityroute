import { getLabel } from '../utils/graphUtils';

/**
 * Bellman-Ford with step recording + negative cycle detection
 */
export function bellmanFord(nodes, edges, source) {
  const INF = Infinity;
  const dist = {};
  const prev = {};
  const steps = [];

  nodes.forEach(n => { dist[n.id] = INF; prev[n.id] = null; });
  dist[source] = 0;

  const activeEdges = edges.filter(e => !e.blocked);
  const n = nodes.length;

  for (let iter = 0; iter < n - 1; iter++) {
    let updated = false;
    for (const { u, v, w } of activeEdges) {
      for (const [from, to] of [[u, v], [v, u]]) {
        if (dist[from] !== INF && dist[from] + w < dist[to]) {
          dist[to] = dist[from] + w;
          prev[to] = from;
          updated = true;
          steps.push({
            type: 'relax',
            iteration: iter + 1,
            edge: { u: from, v: to, w },
            distances: { ...dist },
            description: `Iter ${iter+1}: Relaxed ${getLabel(nodes,from)} → ${getLabel(nodes,to)} (dist: ${dist[to]})`
          });
        }
      }
    }
    if (!updated) break;
  }

  let hasNegativeCycle = false;
  for (const { u, v, w } of activeEdges) {
    for (const [from, to] of [[u, v], [v, u]]) {
      if (dist[from] !== INF && dist[from] + w < dist[to]) {
        hasNegativeCycle = true;
        steps.push({ 
          type: 'negativeCycle', 
          description: '⚠️ Negative cycle detected! (Infinite optimization loop)' 
        });
        break;
      }
    }
    if (hasNegativeCycle) break;
  }

  return { 
    distances: dist, 
    previous: prev, 
    steps, 
    hasNegativeCycle,
    getPath: (target) => {
      if (hasNegativeCycle) return [];
      const path = [];
      let cur = target;
      while (cur !== null && cur !== undefined) {
        path.unshift(cur);
        if (cur === source) break;
        cur = prev[cur];
      }
      return path[0] === source ? path : [];
    }
  };
}

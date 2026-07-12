import { deepCopy } from '../utils/graphUtils';

/**
 * Floyd-Warshall with matrix snapshots at every k iteration
 */
export function floydWarshall(nodes, edges) {
  const n = nodes.length;
  const INF = Infinity;
  const ids = nodes.map(n => n.id);
  const idx = {};
  ids.forEach((id, i) => idx[id] = i);

  const dist = Array.from({length: n}, () => Array(n).fill(INF));
  const next = Array.from({length: n}, () => Array(n).fill(null));

  for (let i = 0; i < n; i++) {
    dist[i][i] = 0;
    next[i][i] = i;
  }

  edges.filter(e => !e.blocked).forEach(({ u, v, w }) => {
    const ui = idx[u], vi = idx[v];
    if (w < dist[ui][vi]) { dist[ui][vi] = w; next[ui][vi] = vi; }
    if (w < dist[vi][ui]) { dist[vi][ui] = w; next[vi][ui] = ui; }
  });

  const snapshots = [];
  snapshots.push({ 
    k: -1, 
    matrix: deepCopy(dist), 
    description: "Initial distances (direct edges only)" 
  });

  for (let k = 0; k < n; k++) {
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        if (dist[i][k] + dist[k][j] < dist[i][j]) {
          dist[i][j] = dist[i][k] + dist[k][j];
          next[i][j] = next[i][k];
        }
      }
    }
    snapshots.push({
      k,
      viaNode: ids[k],
      viaLabel: nodes[k].label,
      matrix: deepCopy(dist),
      description: `Via ${nodes[k].label}: updated all paths passing through it`
    });
  }

  return {
    matrix: dist,
    nodeIds: ids,
    snapshots,
    getPath: (src, tgt) => {
      const u = idx[src], v = idx[tgt];
      if (dist[u][v] === INF) return [];
      const path = [src];
      let curr = u;
      while (curr !== v) {
        curr = next[curr][v];
        path.push(ids[curr]);
      }
      return path;
    }
  };
}

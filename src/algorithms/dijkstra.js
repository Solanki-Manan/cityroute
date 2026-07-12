import { buildAdjList } from '../utils/graphUtils';

/**
 * Dijkstra's Algorithm with step-by-step recording
 */
export function dijkstra(nodes, edges, source) {
  const INF = Infinity;
  const adj = buildAdjList(nodes, edges);
  const dist = {};
  const prev = {};
  const visited = new Set();
  const steps = [];

  nodes.forEach(node => {
    dist[node.id] = INF;
    prev[node.id] = null;
  });
  dist[source] = 0;

  // Priority Queue (min-heap simulation)
  let pq = [{ id: source, d: 0 }];

  while (pq.length > 0) {
    pq.sort((a, b) => a.d - b.d);
    const { id: u } = pq.shift();

    if (visited.has(u)) continue;
    visited.add(u);

    steps.push({
      type: 'visit',
      node: u,
      distances: { ...dist },
      visited: new Set(visited),
      description: `Visiting ${nodes.find(n=>n.id===u)?.label} (dist: ${dist[u]})`
    });

    for (const { v, w } of (adj[u] || [])) {
      if (visited.has(v)) continue;
      if (dist[u] + w < dist[v]) {
        dist[v] = dist[u] + w;
        prev[v] = u;
        pq.push({ id: v, d: dist[v] });

        steps.push({
          type: 'relax',
          edge: { u, v, w },
          distances: { ...dist },
          visited: new Set(visited),
          description: `Relaxing edge to ${nodes.find(n=>n.id===v)?.label}, new dist: ${dist[v]}`
        });
      }
    }
  }

  return {
    distances: dist,
    previous: prev,
    steps,
    getPath: (target) => {
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

export function buildAdjList(nodes, edges) {
  const adj = {};
  nodes.forEach(n => adj[n.id] = []);
  edges.forEach(e => {
    if (e.blocked) return;
    adj[e.u].push({ v: e.v, w: e.w, ref: e });
    adj[e.v].push({ v: e.u, w: e.w, ref: e }); // undirected
  });
  return adj;
}

export function deepCopy(obj) {
  return JSON.parse(JSON.stringify(obj));
}

export function getLabel(nodes, id) {
  const node = nodes.find(n => n.id === id);
  return node ? node.label : `Node ${id}`;
}

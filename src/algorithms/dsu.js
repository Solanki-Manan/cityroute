export class DSU {
  constructor(n) {
    this.parent = Array.from({length: n}, (_, i) => i);
    this.rank   = Array(n).fill(0);
    this.steps  = [];
  }

  find(x) {
    if (this.parent[x] !== x) {
      const root = this.find(this.parent[x]);
      this.parent[x] = root; // Path compression
    }
    return this.parent[x];
  }

  union(x, y, edgeLabel) {
    const px = this.find(x);
    const py = this.find(y);
    
    if (px === py) return false;
    
    // Union by rank
    if (this.rank[px] < this.rank[py]) {
      this.parent[px] = py;
    } else if (this.rank[px] > this.rank[py]) {
      this.parent[py] = px;
    } else {
      this.parent[py] = px;
      this.rank[px]++;
    }
    
    this.steps.push({
      type: 'union', x, y, px, py,
      parent: [...this.parent],
      description: `Merged components of ${edgeLabel}`
    });
    
    return true;
  }
}

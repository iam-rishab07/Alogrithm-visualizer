// Disjoint Set Union (DSU) for Kruskal's algorithm
class DisjointSet {
  constructor(elements) {
    this.parent = {};
    elements.forEach(e => {
      this.parent[e] = e;
    });
  }

  find(i) {
    if (this.parent[i] === i) return i;
    return this.find(this.parent[i]);
  }

  union(i, j) {
    const rootI = this.find(i);
    const rootJ = this.find(j);
    if (rootI !== rootJ) {
      this.parent[rootI] = rootJ;
      return true;
    }
    return false;
  }
}

export const NETWORK_NODES = [
  { id: 'A', x: 100, y: 180 },
  { id: 'B', x: 260, y: 80 },
  { id: 'C', x: 260, y: 280 },
  { id: 'D', x: 440, y: 80 },
  { id: 'E', x: 440, y: 280 },
  { id: 'F', x: 600, y: 180 }
];

export const NETWORK_EDGES = [
  { u: 'A', v: 'B', weight: 4 },
  { u: 'A', v: 'C', weight: 2 },
  { u: 'B', v: 'C', weight: 1 },
  { u: 'B', v: 'D', weight: 5 },
  { u: 'C', v: 'D', weight: 8 },
  { u: 'C', v: 'E', weight: 10 },
  { u: 'D', v: 'E', weight: 2 },
  { u: 'D', v: 'F', weight: 6 },
  { u: 'E', v: 'F', weight: 3 }
];

// Directed edges for Topological Sort (DAG)
export const DAG_EDGES = [
  { u: 'A', v: 'B', weight: 1 },
  { u: 'A', v: 'C', weight: 1 },
  { u: 'B', v: 'D', weight: 1 },
  { u: 'C', v: 'D', weight: 1 },
  { u: 'C', v: 'E', weight: 1 },
  { u: 'D', v: 'F', weight: 1 },
  { u: 'E', v: 'F', weight: 1 }
];

/**
 * Kruskal's MST algorithm generator
 */
export function* kruskalMST() {
  const edges = NETWORK_EDGES.map((e, idx) => ({ ...e, index: idx })).sort((a, b) => a.weight - b.weight);
  const dsu = new DisjointSet(NETWORK_NODES.map(n => n.id));
  
  const mstEdges = [];
  const edgeStates = {}; // 'mst', 'rejected', 'checking'

  yield {
    edgeStates: { ...edgeStates },
    mstEdges: [...mstEdges],
    activeEdgeIdx: null,
    message: "Kruskal's Algorithm: Sort edges by weight."
  };

  for (const edge of edges) {
    // Set checking state
    edgeStates[edge.index] = 'checking';
    yield {
      edgeStates: { ...edgeStates },
      mstEdges: [...mstEdges],
      activeEdgeIdx: edge.index,
      message: `Checking edge ${edge.u}-${edge.v} with weight ${edge.weight}.`
    };

    const hasNoCycle = dsu.union(edge.u, edge.v);
    if (hasNoCycle) {
      edgeStates[edge.index] = 'mst';
      mstEdges.push(edge);
      yield {
        edgeStates: { ...edgeStates },
        mstEdges: [...mstEdges],
        activeEdgeIdx: null,
        message: `Edge ${edge.u}-${edge.v} added to MST (no cycle formed).`
      };
    } else {
      edgeStates[edge.index] = 'rejected';
      yield {
        edgeStates: { ...edgeStates },
        mstEdges: [...mstEdges],
        activeEdgeIdx: null,
        message: `Edge ${edge.u}-${edge.v} rejected (forms a cycle).`
      };
    }
  }

  yield {
    edgeStates: { ...edgeStates },
    mstEdges: [...mstEdges],
    activeEdgeIdx: null,
    message: "Minimum Spanning Tree complete!"
  };
}

/**
 * Prim's MST algorithm generator
 */
export function* primMST() {
  const visited = new Set(['A']);
  const mstEdges = [];
  const edgeStates = {}; // 'mst', 'candidate', 'checking'
  
  yield {
    visited: Array.from(visited),
    edgeStates: { ...edgeStates },
    mstEdges: [...mstEdges],
    activeEdgeIdx: null,
    message: "Prim's Algorithm: Start at node A."
  };

  while (visited.size < NETWORK_NODES.length) {
    let candidates = [];
    
    // Find all edges connecting visited nodes to unvisited nodes
    NETWORK_EDGES.forEach((edge, idx) => {
      const uVisited = visited.has(edge.u);
      const vVisited = visited.has(edge.v);
      if ((uVisited && !vVisited) || (!uVisited && vVisited)) {
        candidates.push({ ...edge, index: idx });
        if (edgeStates[idx] !== 'mst') {
          edgeStates[idx] = 'candidate';
        }
      } else if (uVisited && vVisited && edgeStates[idx] !== 'mst') {
        edgeStates[idx] = 'rejected';
      }
    });

    yield {
      visited: Array.from(visited),
      edgeStates: { ...edgeStates },
      mstEdges: [...mstEdges],
      activeEdgeIdx: null,
      message: "Highlighting candidate edges."
    };

    // Find the minimum weight edge among candidates
    if (candidates.length === 0) break;
    candidates.sort((a, b) => a.weight - b.weight);
    const best = candidates[0];

    edgeStates[best.index] = 'checking';
    yield {
      visited: Array.from(visited),
      edgeStates: { ...edgeStates },
      mstEdges: [...mstEdges],
      activeEdgeIdx: best.index,
      message: `Selecting candidate edge with minimum weight: ${best.u}-${best.v} (${best.weight}).`
    };

    // Add to MST
    visited.add(best.u);
    visited.add(best.v);
    edgeStates[best.index] = 'mst';
    mstEdges.push(best);

    yield {
      visited: Array.from(visited),
      edgeStates: { ...edgeStates },
      mstEdges: [...mstEdges],
      activeEdgeIdx: null,
      message: `Added edge ${best.u}-${best.v} to MST. Visited set expanded.`
    };
  }

  yield {
    visited: Array.from(visited),
    edgeStates: { ...edgeStates },
    mstEdges: [...mstEdges],
    activeEdgeIdx: null,
    message: "Minimum Spanning Tree complete!"
  };
}

/**
 * Topological Sort (Kahn's algorithm) generator
 */
export function* topologicalSort() {
  const inDegree = {};
  const adj = {};
  
  NETWORK_NODES.forEach(n => {
    inDegree[n.id] = 0;
    adj[n.id] = [];
  });

  // Build DAG structures
  DAG_EDGES.forEach(edge => {
    adj[edge.u].push(edge.v);
    inDegree[edge.v]++;
  });

  yield {
    inDegree: { ...inDegree },
    queue: [],
    sortedOrder: [],
    activeNode: null,
    message: "Calculating in-degrees for all nodes."
  };

  const queue = [];
  NETWORK_NODES.forEach(n => {
    if (inDegree[n.id] === 0) {
      queue.push(n.id);
    }
  });

  yield {
    inDegree: { ...inDegree },
    queue: [...queue],
    sortedOrder: [],
    activeNode: null,
    message: `Queue nodes with in-degree 0: [${queue.join(', ')}].`
  };

  const sortedOrder = [];

  while (queue.length > 0) {
    const u = queue.shift();
    sortedOrder.push(u);

    yield {
      inDegree: { ...inDegree },
      queue: [...queue],
      sortedOrder: [...sortedOrder],
      activeNode: u,
      message: `Processing node ${u}. Added to topological order.`
    };

    for (const v of adj[u]) {
      inDegree[v]--;
      yield {
        inDegree: { ...inDegree },
        queue: [...queue],
        sortedOrder: [...sortedOrder],
        activeNode: u,
        message: `Decremented in-degree of node ${v} to ${inDegree[v]}.`
      };

      if (inDegree[v] === 0) {
        queue.push(v);
        yield {
          inDegree: { ...inDegree },
          queue: [...queue],
          sortedOrder: [...sortedOrder],
          activeNode: u,
          message: `In-degree of ${v} became 0. Added to queue.`
        };
      }
    }
  }

  yield {
    inDegree: { ...inDegree },
    queue: [...queue],
    sortedOrder: [...sortedOrder],
    activeNode: null,
    message: `Topological Sort complete! Order: [${sortedOrder.join(' -> ')}].`
  };
}

// Grid helper utilities
function getNeighbors(node, grid) {
  const neighbors = [];
  const { row, col } = node;
  const numRows = grid.length;
  const numCols = grid[0].length;

  if (row > 0) neighbors.push(grid[row - 1][col]);
  if (row < numRows - 1) neighbors.push(grid[row + 1][col]);
  if (col > 0) neighbors.push(grid[row][col - 1]);
  if (col < numCols - 1) neighbors.push(grid[row][col + 1]);

  return neighbors.filter(neighbor => !neighbor.isWall);
}

function getHeuristicDistance(nodeA, nodeB) {
  // Manhattan distance
  return Math.abs(nodeA.row - nodeB.row) + Math.abs(nodeA.col - nodeB.col);
}

function constructPath(endNode) {
  const path = [];
  let current = endNode;
  while (current !== null) {
    path.unshift(current);
    current = current.previousNode;
  }
  return path;
}

// Deep clone a grid to prevent state reference pollution during visualization
function cloneGrid(grid) {
  return grid.map(row => 
    row.map(node => ({
      ...node
    }))
  );
}

/**
 * BFS Grid Solver
 */
export function* bfsGrid(initialGrid, startCoords, endCoords) {
  let grid = cloneGrid(initialGrid);
  const queue = [];
  const startNode = grid[startCoords.row][startCoords.col];
  const endNode = grid[endCoords.row][endCoords.col];

  startNode.isVisited = true;
  queue.push(startNode);

  while (queue.length > 0) {
    const current = queue.shift();
    
    if (current.row === endNode.row && current.col === endNode.col) {
      const path = constructPath(current);
      yield { grid, path, currentCoords: { row: current.row, col: current.col }, isDone: true };
      return;
    }

    const neighbors = getNeighbors(current, grid);
    for (const neighbor of neighbors) {
      if (!neighbor.isVisited) {
        neighbor.isVisited = true;
        neighbor.previousNode = current;
        queue.push(neighbor);
      }
    }

    yield { grid, path: [], currentCoords: { row: current.row, col: current.col }, isDone: false };
  }
  yield { grid, path: [], currentCoords: null, isDone: true };
}

/**
 * DFS Grid Solver
 */
export function* dfsGrid(initialGrid, startCoords, endCoords) {
  let grid = cloneGrid(initialGrid);
  const stack = [];
  const startNode = grid[startCoords.row][startCoords.col];
  const endNode = grid[endCoords.row][endCoords.col];

  stack.push(startNode);

  while (stack.length > 0) {
    const current = stack.pop();

    if (!current.isVisited) {
      current.isVisited = true;

      if (current.row === endNode.row && current.col === endNode.col) {
        const path = constructPath(current);
        yield { grid, path, currentCoords: { row: current.row, col: current.col }, isDone: true };
        return;
      }

      yield { grid, path: [], currentCoords: { row: current.row, col: current.col }, isDone: false };

      const neighbors = getNeighbors(current, grid);
      for (const neighbor of neighbors) {
        if (!neighbor.isVisited) {
          neighbor.previousNode = current;
          stack.push(neighbor);
        }
      }
    }
  }
  yield { grid, path: [], currentCoords: null, isDone: true };
}

/**
 * Dijkstra Grid Solver
 */
export function* dijkstraGrid(initialGrid, startCoords, endCoords) {
  let grid = cloneGrid(initialGrid);
  const unvisitedNodes = [];
  const startNode = grid[startCoords.row][startCoords.col];
  const endNode = grid[endCoords.row][endCoords.col];

  // Initialize nodes
  for (const row of grid) {
    for (const node of row) {
      node.distance = Infinity;
      node.isVisited = false;
      node.previousNode = null;
      if (!node.isWall) {
        unvisitedNodes.push(node);
      }
    }
  }
  startNode.distance = 0;

  while (unvisitedNodes.length > 0) {
    // Sort unvisited nodes by distance
    unvisitedNodes.sort((a, b) => a.distance - b.distance);
    const closest = unvisitedNodes.shift();

    if (closest.distance === Infinity) break; // unreachable

    closest.isVisited = true;

    if (closest.row === endNode.row && closest.col === endNode.col) {
      const path = constructPath(closest);
      yield { grid, path, currentCoords: { row: closest.row, col: closest.col }, isDone: true };
      return;
    }

    yield { grid, path: [], currentCoords: { row: closest.row, col: closest.col }, isDone: false };

    const neighbors = getNeighbors(closest, grid).filter(n => !n.isVisited);
    for (const neighbor of neighbors) {
      const weight = neighbor.isWeight ? 5 : 1;
      const tentativeDistance = closest.distance + weight;
      if (tentativeDistance < neighbor.distance) {
        neighbor.distance = tentativeDistance;
        neighbor.previousNode = closest;
      }
    }
  }
  yield { grid, path: [], currentCoords: null, isDone: true };
}

/**
 * A* Search Grid Solver
 */
export function* aStarGrid(initialGrid, startCoords, endCoords) {
  let grid = cloneGrid(initialGrid);
  const startNode = grid[startCoords.row][startCoords.col];
  const endNode = grid[endCoords.row][endCoords.col];

  // Initialize
  for (const row of grid) {
    for (const node of row) {
      node.gScore = Infinity; // distance from start
      node.fScore = Infinity; // gScore + heuristic
      node.isVisited = false;
      node.previousNode = null;
    }
  }

  startNode.gScore = 0;
  startNode.fScore = getHeuristicDistance(startNode, endNode);

  const openSet = [startNode];

  while (openSet.length > 0) {
    openSet.sort((a, b) => a.fScore - b.fScore);
    const current = openSet.shift();

    current.isVisited = true;

    if (current.row === endNode.row && current.col === endNode.col) {
      const path = constructPath(current);
      yield { grid, path, currentCoords: { row: current.row, col: current.col }, isDone: true };
      return;
    }

    yield { grid, path: [], currentCoords: { row: current.row, col: current.col }, isDone: false };

    const neighbors = getNeighbors(current, grid);
    for (const neighbor of neighbors) {
      if (neighbor.isVisited) continue;

      const weight = neighbor.isWeight ? 5 : 1;
      const tentativeG = current.gScore + weight;

      if (tentativeG < neighbor.gScore) {
        neighbor.previousNode = current;
        neighbor.gScore = tentativeG;
        neighbor.fScore = tentativeG + getHeuristicDistance(neighbor, endNode);
        if (!openSet.includes(neighbor)) {
          openSet.push(neighbor);
        }
      }
    }
  }
  yield { grid, path: [], currentCoords: null, isDone: true };
}

/**
 * Maze Generator using Recursive Backtracking (DFS carving)
 */
export function* recursiveMaze(numRows, numCols) {
  // Create solid wall grid
  let grid = Array.from({ length: numRows }, (_, r) =>
    Array.from({ length: numCols }, (_, c) => ({
      row: r,
      col: c,
      isStart: false,
      isEnd: false,
      isWall: true,
      isWeight: false,
      isVisited: false,
      previousNode: null
    }))
  );

  const stack = [];
  // Start cell must be odd indices
  const startCell = grid[1][1];
  startCell.isWall = false;
  stack.push(startCell);

  while (stack.length > 0) {
    const current = stack[stack.length - 1];
    
    // Find unvisited neighbors at distance 2 (skipping boundaries)
    const neighbors = [];
    const { row, col } = current;

    if (row > 2 && grid[row - 2][col].isWall) neighbors.push({ cell: grid[row - 2][col], wall: grid[row - 1][col] });
    if (row < numRows - 3 && grid[row + 2][col].isWall) neighbors.push({ cell: grid[row + 2][col], wall: grid[row + 1][col] });
    if (col > 2 && grid[row][col - 2].isWall) neighbors.push({ cell: grid[row][col - 2], wall: grid[row][col - 1] });
    if (col < numCols - 3 && grid[row][col + 2].isWall) neighbors.push({ cell: grid[row][col + 2], wall: grid[row][col + 1] });

    if (neighbors.length > 0) {
      // Pick random neighbor
      const { cell, wall } = neighbors[Math.floor(Math.random() * neighbors.length)];
      
      // Carve pathway
      cell.isWall = false;
      wall.isWall = false;
      stack.push(cell);

      yield { grid, isDone: false };
    } else {
      stack.pop();
      yield { grid, isDone: false };
    }
  }
  yield { grid, isDone: true };
}

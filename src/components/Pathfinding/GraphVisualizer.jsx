import React, { useState, useEffect, useCallback, useRef } from 'react';
import { bfsGrid, dfsGrid, dijkstraGrid, aStarGrid, recursiveMaze } from './pathfindingAlgorithms';
import { 
  kruskalMST, 
  primMST, 
  topologicalSort, 
  NETWORK_NODES, 
  NETWORK_EDGES, 
  DAG_EDGES 
} from './graphAlgorithms';

const GRID_ROWS = 21;
const GRID_COLS = 39;

const ALGO_DETAILS = {
  bfs: {
    name: 'Breadth-First Search (BFS)',
    worst: 'O(V + E)',
    space: 'O(V)',
    stable: 'Yes',
    description: 'BFS explores the grid level by level, radiating outward from the start node. It guarantees the shortest path in unweighted graphs.'
  },
  dfs: {
    name: 'Depth-First Search (DFS)',
    worst: 'O(V + E)',
    space: 'O(V)',
    stable: 'No',
    description: 'DFS explores as deep as possible down each branch before backtracking. It does NOT guarantee the shortest path.'
  },
  dijkstra: {
    name: "Dijkstra's Algorithm",
    worst: 'O((V + E) log V)',
    space: 'O(V)',
    stable: 'Yes',
    description: "Dijkstra's explores nodes by shortest accumulated cost. Handles weighted nodes (mud/heavy tiles) to find the absolute shortest path."
  },
  astar: {
    name: 'A* Search',
    worst: 'O(E log V)',
    space: 'O(V)',
    stable: 'Yes',
    description: 'A* uses heuristics (Manhattan distance to target) to prioritize paths, significantly optimizing search times toward the end node.'
  },
  kruskal: {
    name: "Kruskal's MST",
    worst: 'O(E log E)',
    space: 'O(V + E)',
    stable: 'N/A',
    description: "Kruskal's finds the Minimum Spanning Tree by sorting all edges and greedily connecting nodes that do not form cycles."
  },
  prim: {
    name: "Prim's MST",
    worst: 'O(E log V)',
    space: 'O(V)',
    stable: 'N/A',
    description: "Prim's grows the MST from a single starting vertex, repeatedly adding the cheapest edge connecting visited to unvisited nodes."
  },
  topo: {
    name: 'Topological Sort (Kahn\'s)',
    worst: 'O(V + E)',
    space: 'O(V)',
    stable: 'N/A',
    description: 'Topological Sort orders vertices of a DAG such that for every directed edge u -> v, u comes before v. Useful for task dependencies.'
  }
};

export default function GraphVisualizer() {
  const [algorithm, setAlgorithm] = useState('bfs');
  const [speed, setSpeed] = useState(30);
  const [isPlaying, setIsPlaying] = useState(false);
  const [drawMode, setDrawMode] = useState('wall'); // 'wall', 'weight', 'start', 'end'
  
  // Grid State
  const [grid, setGrid] = useState([]);
  const [startNode, setStartNode] = useState({ row: 10, col: 8 });
  const [endNode, setEndNode] = useState({ row: 10, col: 30 });
  const [mouseIsPressed, setMouseIsPressed] = useState(false);
  
  // Visualization Traces
  const [steps, setSteps] = useState([]);
  const [currentStepIdx, setCurrentStepIdx] = useState(0);
  const [statusMessage, setStatusMessage] = useState('');
  
  // Graph-specific States
  const [visitedNodes, setVisitedNodes] = useState([]);
  const [edgeStates, setEdgeStates] = useState({});
  const [sortedOrder, setSortedOrder] = useState([]);
  const [inDegrees, setInDegrees] = useState({});
  const [activeNode, setActiveNode] = useState(null);

  // Initialize a blank grid
  const initializeGrid = useCallback((resetWalls = true) => {
    const initialGrid = [];
    for (let r = 0; r < GRID_ROWS; r++) {
      const currentRow = [];
      for (let c = 0; c < GRID_COLS; c++) {
        const isStart = r === startNode.row && c === startNode.col;
        const isEnd = r === endNode.row && c === endNode.col;
        
        // Retain wall/weight config if desired
        let isWall = false;
        let isWeight = false;
        if (!resetWalls && grid[r] && grid[r][c]) {
          isWall = grid[r][c].isWall;
          isWeight = grid[r][c].isWeight;
        }

        currentRow.push({
          row: r,
          col: c,
          isStart,
          isEnd,
          isWall: isStart || isEnd ? false : isWall,
          isWeight: isStart || isEnd ? false : isWeight,
          isVisited: false,
          isPath: false,
          previousNode: null
        });
      }
      initialGrid.push(currentRow);
    }
    setGrid(initialGrid);
    setSteps([]);
    setCurrentStepIdx(0);
    setIsPlaying(false);
    setStatusMessage('Grid initialized. Draw walls or weights and click Solve!');
  }, [startNode, endNode, grid]);

  // Load grid on mount
  useEffect(() => {
    initializeGrid();
  }, []);

  // Check if current mode is grid solver
  const isGridMode = ['bfs', 'dfs', 'dijkstra', 'astar'].includes(algorithm);

  // Reset states when algorithm changes
  useEffect(() => {
    setIsPlaying(false);
    setSteps([]);
    setCurrentStepIdx(0);
    setVisitedNodes([]);
    setEdgeStates({});
    setSortedOrder([]);
    setInDegrees({});
    setActiveNode(null);
    if (isGridMode) {
      initializeGrid(false); // Retain walls when switching solvers
    } else {
      setStatusMessage('Static Graph Visualizer. Click Play/Step to analyze!');
    }
  }, [algorithm, initializeGrid]);

  // Pre-calculate pathfinding steps
  const solvePathfinding = () => {
    if (!isGridMode) return;
    initializeGrid(false); // Clear previous solver trace paths/visited
    
    let generator;
    if (algorithm === 'bfs') {
      generator = bfsGrid(grid, startNode, endNode);
    } else if (algorithm === 'dfs') {
      generator = dfsGrid(grid, startNode, endNode);
    } else if (algorithm === 'dijkstra') {
      generator = dijkstraGrid(grid, startNode, endNode);
    } else if (algorithm === 'astar') {
      generator = aStarGrid(grid, startNode, endNode);
    }

    const allSteps = [...generator];
    setSteps(allSteps);
    setCurrentStepIdx(0);
    setIsPlaying(true);
    setStatusMessage(`Running ${ALGO_DETAILS[algorithm].name}...`);
  };

  // Pre-calculate static graph edges steps
  const solveStaticGraph = () => {
    let generator;
    if (algorithm === 'kruskal') {
      generator = kruskalMST();
    } else if (algorithm === 'prim') {
      generator = primMST();
    } else if (algorithm === 'topo') {
      generator = topologicalSort();
    }

    const allSteps = [...generator];
    setSteps(allSteps);
    setCurrentStepIdx(0);
    setIsPlaying(true);
  };

  // Generate Maze step-by-step
  const generateMaze = () => {
    setIsPlaying(false);
    const generator = recursiveMaze(GRID_ROWS, GRID_COLS);
    const allSteps = [...generator];
    setSteps(allSteps);
    setCurrentStepIdx(0);
    setIsPlaying(true);
    setStatusMessage('Generating Recursive Backtracking Maze...');
  };

  // Playback timer
  useEffect(() => {
    let timerId = null;
    if (isPlaying && steps.length > 0) {
      timerId = setInterval(() => {
        setCurrentStepIdx((prevIdx) => {
          if (prevIdx < steps.length - 1) {
            const nextIdx = prevIdx + 1;
            applyStepState(steps[nextIdx]);
            return nextIdx;
          } else {
            setIsPlaying(false);
            if (isGridMode) {
              setStatusMessage('Pathfinding simulation completed.');
            }
            return prevIdx;
          }
        });
      }, speed);
    }
    return () => {
      if (timerId) clearInterval(timerId);
    };
  }, [isPlaying, steps, speed]);

  const applyStepState = (step) => {
    if (!step) return;
    if (isGridMode) {
      // Grid pathfinders yield: { grid, path, currentCoords, isDone }
      const newGrid = step.grid.map(row => row.map(node => ({ ...node })));
      // If done, draw shortest path highlights
      if (step.path && step.path.length > 0) {
        step.path.forEach(p => {
          newGrid[p.row][p.col].isPath = true;
        });
      }
      setGrid(newGrid);
    } else if (algorithm === 'recursive-maze') {
      setGrid(step.grid);
    } else {
      // Graph states updates
      if (step.edgeStates) setEdgeStates(step.edgeStates);
      if (step.visited) setVisitedNodes(step.visited);
      if (step.sortedOrder) setSortedOrder(step.sortedOrder);
      if (step.inDegree) setInDegrees(step.inDegree);
      if (step.activeNode !== undefined) setActiveNode(step.activeNode);
      if (step.message) setStatusMessage(step.message);
    }
  };

  // Manual Step Forward
  const handleStepForward = () => {
    if (isPlaying || steps.length === 0) return;
    if (currentStepIdx < steps.length - 1) {
      const nextIdx = currentStepIdx + 1;
      applyStepState(steps[nextIdx]);
      setCurrentStepIdx(nextIdx);
    }
  };

  // Mouse Grid interactions (Drawing walls/weights or moving nodes)
  const handleMouseDown = (row, col) => {
    if (isPlaying) return;
    setMouseIsPressed(true);
    handleCellInteraction(row, col);
  };

  const handleMouseEnter = (row, col) => {
    if (!mouseIsPressed || isPlaying) return;
    handleCellInteraction(row, col);
  };

  const handleMouseUp = () => {
    setMouseIsPressed(false);
  };

  const handleCellInteraction = (row, col) => {
    const cell = grid[row][col];
    if (cell.isStart || cell.isEnd) return;

    const newGrid = grid.map(r => r.map(c => ({ ...c })));
    if (drawMode === 'wall') {
      newGrid[row][col].isWall = !cell.isWall;
      newGrid[row][col].isWeight = false;
    } else if (drawMode === 'weight') {
      newGrid[row][col].isWeight = !cell.isWeight;
      newGrid[row][col].isWall = false;
    } else if (drawMode === 'start') {
      // Clear old start
      newGrid[startNode.row][startNode.col].isStart = false;
      newGrid[row][col].isStart = true;
      newGrid[row][col].isWall = false;
      newGrid[row][col].isWeight = false;
      setStartNode({ row, col });
    } else if (drawMode === 'end') {
      // Clear old end
      newGrid[endNode.row][endNode.col].isEnd = false;
      newGrid[row][col].isEnd = true;
      newGrid[row][col].isWall = false;
      newGrid[row][col].isWeight = false;
      setEndNode({ row, col });
    }
    setGrid(newGrid);
  };

  const currentAlgoDetails = ALGO_DETAILS[algorithm];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flexGrow: 1 }} onMouseLeave={handleMouseUp}>
      {/* Control Panel */}
      <div className="glass-container control-panel">
        {/* Selector */}
        <div className="control-group">
          <label className="control-label">Algorithm</label>
          <select
            className="control-select"
            value={algorithm}
            onChange={(e) => setAlgorithm(e.target.value)}
            disabled={isPlaying}
          >
            <optgroup label="Grid Solvers">
              <option value="bfs">Breadth-First Search (BFS)</option>
              <option value="dfs">Depth-First Search (DFS)</option>
              <option value="dijkstra">Dijkstra's (Weighted)</option>
              <option value="astar">A* Search (Heuristics)</option>
            </optgroup>
            <optgroup label="Graph Structures">
              <option value="kruskal">Kruskal's MST</option>
              <option value="prim">Prim's MST</option>
              <option value="topo">Topological Sort</option>
            </optgroup>
          </select>
        </div>

        {/* Speed */}
        <div className="control-group">
          <label className="control-label">Speed (Delay)</label>
          <div className="slider-container">
            <input
              type="range"
              min="5"
              max="300"
              value={speed}
              onChange={(e) => setSpeed(Number(e.target.value))}
            />
            <span className="slider-val">{speed}ms</span>
          </div>
        </div>

        {/* Dynamic Buttons depending on Mode */}
        {isGridMode ? (
          <div className="control-group">
            <label className="control-label">Draw Tool Mode</label>
            <div className="btn-group">
              <button 
                className={`btn ${drawMode === 'wall' ? 'btn-primary' : ''}`}
                onClick={() => setDrawMode('wall')}
                disabled={isPlaying}
              >
                ✏️ Wall
              </button>
              <button 
                className={`btn ${drawMode === 'weight' ? 'btn-primary' : ''}`}
                onClick={() => setDrawMode('weight')}
                disabled={isPlaying}
              >
                ⚡ Weight
              </button>
              <button 
                className={`btn ${drawMode === 'start' ? 'btn-primary' : ''}`}
                onClick={() => setDrawMode('start')}
                disabled={isPlaying}
              >
                🟢 Start
              </button>
              <button 
                className={`btn ${drawMode === 'end' ? 'btn-primary' : ''}`}
                onClick={() => setDrawMode('end')}
                disabled={isPlaying}
              >
                🔴 Target
              </button>
            </div>
          </div>
        ) : (
          <div className="control-group">
            <label className="control-label">Status Monitor</label>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', padding: '10px 0' }}>
              Graph simulation controls active.
            </div>
          </div>
        )}

        {/* Execution Actions */}
        <div className="control-group">
          <label className="control-label">Execution</label>
          <div className="btn-group">
            {isGridMode && (
              <>
                <button className="btn" onClick={generateMaze} disabled={isPlaying}>
                  Generate Maze
                </button>
                <button className="btn" onClick={() => initializeGrid(true)} disabled={isPlaying}>
                  Reset Board
                </button>
              </>
            )}
            {!isGridMode && (
              <button className="btn" onClick={() => {
                setIsPlaying(false);
                setSteps([]);
                setCurrentStepIdx(0);
                setVisitedNodes([]);
                setEdgeStates({});
                setSortedOrder([]);
                setInDegrees({});
                setActiveNode(null);
                setStatusMessage('Graph reset completed.');
              }} disabled={isPlaying}>
                Reset Graph
              </button>
            )}
            
            {isPlaying ? (
              <button className="btn btn-primary" onClick={() => setIsPlaying(false)}>
                Pause
              </button>
            ) : (
              <button 
                className="btn btn-primary" 
                onClick={isGridMode ? solvePathfinding : solveStaticGraph}
                disabled={isPlaying}
              >
                Solve
              </button>
            )}
            
            <button 
              className="btn" 
              onClick={handleStepForward} 
              disabled={isPlaying || steps.length === 0 || currentStepIdx >= steps.length - 1}
            >
              Step
            </button>
          </div>
        </div>
      </div>

      {/* Main visual display area */}
      <div className="glass-container visualizer-card" style={{ minHeight: '450px' }}>
        <div className="visualizer-header">
          <div>
            <h2 className="visualizer-title">{currentAlgoDetails.name} Visualizer</h2>
            <p className="visualizer-subtitle">{statusMessage}</p>
          </div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
            {steps.length > 0 && (
              <span>Step: <strong>{currentStepIdx}</strong> / {steps.length - 1}</span>
            )}
          </div>
        </div>

        <div className="bar-container" style={{ padding: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '380px' }}>
          {isGridMode ? (
            /* Render 2D Grid Solver */
            <div className="grid-container">
              {grid.map((row, r) => 
                row.map((cell, c) => {
                  let cellClass = '';
                  if (cell.isStart) cellClass = 'cell-start';
                  else if (cell.isEnd) cellClass = 'cell-end';
                  else if (cell.isWall) cellClass = 'cell-wall';
                  else if (cell.isWeight) cellClass = 'cell-weight';
                  else if (cell.isPath) cellClass = 'cell-path';
                  else if (cell.isVisited) cellClass = 'cell-visited';

                  return (
                    <div
                      key={`${r}-${c}`}
                      className={`grid-cell ${cellClass}`}
                      onMouseDown={() => handleMouseDown(r, c)}
                      onMouseEnter={() => handleMouseEnter(r, c)}
                      onMouseUp={handleMouseUp}
                    />
                  );
                })
              )}
            </div>
          ) : (
            /* Render SVG Node Network Graph */
            <div style={{ position: 'relative', width: '100%', maxWidth: '750px', background: 'rgba(15,23,42,0.4)', borderRadius: '8px', padding: '10px' }}>
              <svg viewBox="0 0 700 350" width="100%" height="320">
                <defs>
                  {/* Arrow marker for Directed Graphs */}
                  <marker id="arrow" viewBox="0 0 10 10" refX="22" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                    <path d="M 0 0 L 10 5 L 0 10 z" fill="#64748b" />
                  </marker>
                  <marker id="arrow-active" viewBox="0 0 10 10" refX="22" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                    <path d="M 0 0 L 10 5 L 0 10 z" fill="#818cf8" />
                  </marker>
                </defs>

                {/* Draw Edges */}
                {(algorithm === 'topo' ? DAG_EDGES : NETWORK_EDGES).map((edge, idx) => {
                  const uNode = NETWORK_NODES.find(n => n.id === edge.u);
                  const vNode = NETWORK_NODES.find(n => n.id === edge.v);
                  
                  // Determine Edge color highlight based on states
                  let stroke = '#334155'; // default slate-700
                  let strokeWidth = 2;
                  let isDirected = algorithm === 'topo';

                  const state = edgeStates[idx];
                  if (state === 'mst') {
                    stroke = '#10b981'; // green
                    strokeWidth = 4;
                  } else if (state === 'rejected') {
                    stroke = '#ef4444'; // red
                    strokeWidth = 1;
                  } else if (state === 'candidate') {
                    stroke = '#94a3b8'; // light slate
                    strokeWidth = 2.5;
                  } else if (state === 'checking') {
                    stroke = '#fbbf24'; // yellow
                    strokeWidth = 4;
                  }

                  return (
                    <g key={`edge-${idx}`}>
                      <line
                        x1={uNode.x}
                        y1={uNode.y}
                        x2={vNode.x}
                        y2={vNode.y}
                        stroke={stroke}
                        strokeWidth={strokeWidth}
                        markerEnd={isDirected ? (state === 'mst' || state === 'checking' ? "url(#arrow-active)" : "url(#arrow)") : ""}
                      />
                      {/* Weight Text Overlay */}
                      {!isDirected && (
                        <g>
                          <rect
                            x={(uNode.x + vNode.x) / 2 - 10}
                            y={(uNode.y + vNode.y) / 2 - 10}
                            width="20"
                            height="20"
                            rx="4"
                            fill="#1e293b"
                            stroke="#334155"
                            strokeWidth="1"
                          />
                          <text
                            x={(uNode.x + vNode.x) / 2}
                            y={(uNode.y + vNode.y) / 2 + 5}
                            fill="#94a3b8"
                            fontSize="10"
                            textAnchor="middle"
                            fontWeight="bold"
                          >
                            {edge.weight}
                          </text>
                        </g>
                      )}
                    </g>
                  );
                })}

                {/* Draw Vertices */}
                {NETWORK_NODES.map((node) => {
                  const isVisited = visitedNodes.includes(node.id) || sortedOrder.includes(node.id);
                  const isActive = activeNode === node.id;
                  
                  let fill = '#1e293b';
                  let stroke = '#475569';
                  if (isActive) {
                    fill = '#4f46e5';
                    stroke = '#a78bfa';
                  } else if (isVisited) {
                    fill = 'rgba(16, 185, 129, 0.2)';
                    stroke = '#10b981';
                  }

                  return (
                    <g key={node.id}>
                      <circle
                        cx={node.x}
                        cy={node.y}
                        r="18"
                        fill={fill}
                        stroke={stroke}
                        strokeWidth="2.5"
                      />
                      <text
                        x={node.x}
                        y={node.y + 5}
                        fill={isActive || isVisited ? '#ffffff' : '#f8fafc'}
                        fontSize="12"
                        fontWeight="bold"
                        textAnchor="middle"
                      >
                        {node.id}
                      </text>
                      
                      {/* Topological Indegree display */}
                      {algorithm === 'topo' && inDegrees[node.id] !== undefined && (
                        <g transform={`translate(${node.x + 12}, ${node.y - 12})`}>
                          <circle r="8" fill="#ef4444" />
                          <text y="3" fill="#fff" fontSize="8" textAnchor="middle" fontWeight="bold">
                            {inDegrees[node.id]}
                          </text>
                        </g>
                      )}
                    </g>
                  );
                })}
              </svg>

              {/* Console Info Dashboard for Graphs */}
              {algorithm === 'topo' && sortedOrder.length > 0 && (
                <div style={{ marginTop: '10px', padding: '10px', background: 'rgba(15,23,42,0.8)', border: '1px solid var(--bg-card-border)', borderRadius: '6px', fontSize: '0.85rem', fontFamily: 'var(--font-mono)' }}>
                  Topological Order: <strong style={{ color: 'var(--accent-primary)' }}>{sortedOrder.join(' -> ')}</strong>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Legend Indicator */}
        {isGridMode ? (
          <div className="status-indicator">
            <div className="status-item">
              <span className="status-dot" style={{ backgroundColor: '#3b82f6' }}></span>
              <span>Start Node</span>
            </div>
            <div className="status-item">
              <span className="status-dot" style={{ backgroundColor: '#ef4444' }}></span>
              <span>Target Node</span>
            </div>
            <div className="status-item">
              <span className="status-dot" style={{ backgroundColor: '#475569' }}></span>
              <span>Wall</span>
            </div>
            <div className="status-item">
              <span className="status-dot" style={{ backgroundColor: '#854d0e' }}></span>
              <span>Weight (⚡ cost: 5)</span>
            </div>
            <div className="status-item">
              <span className="status-dot" style={{ backgroundColor: 'rgba(99, 102, 241, 0.35)' }}></span>
              <span>Visited</span>
            </div>
            <div className="status-item">
              <span className="status-dot" style={{ backgroundColor: '#10b981' }}></span>
              <span>Shortest Path</span>
            </div>
          </div>
        ) : (
          <div className="status-indicator">
            <div className="status-item">
              <span className="status-dot" style={{ backgroundColor: '#10b981' }}></span>
              <span>In MST / Visited</span>
            </div>
            <div className="status-item">
              <span className="status-dot" style={{ backgroundColor: '#fbbf24' }}></span>
              <span>Evaluating Edge</span>
            </div>
            <div className="status-item">
              <span className="status-dot" style={{ backgroundColor: '#ef4444' }}></span>
              <span>Cycle / Rejected</span>
            </div>
            <div className="status-item">
              <span className="status-dot" style={{ backgroundColor: '#94a3b8' }}></span>
              <span>Candidate Edge</span>
            </div>
          </div>
        )}
      </div>

      {/* Educational Concept */}
      <section className="glass-container edu-card">
        <h3 style={{ fontSize: '1.1rem', fontWeight: 600, borderBottom: '1px solid var(--bg-card-border)', paddingBottom: '10px' }}>
          Graph Theory Concepts
        </h3>
        <div className="edu-grid">
          <div className="edu-stat-box">
            <span className="edu-stat-label">Worst-Case Time</span>
            <span className="edu-stat-val">{currentAlgoDetails.worst}</span>
          </div>
          <div className="edu-stat-box">
            <span className="edu-stat-label">Auxiliary Space</span>
            <span className="edu-stat-val">{currentAlgoDetails.space}</span>
          </div>
          <div className="edu-stat-box">
            <span className="edu-stat-label">Optimal Path</span>
            <span className="edu-stat-val" style={{ color: currentAlgoDetails.stable === 'Yes' ? 'var(--color-sorted)' : 'var(--color-swap)' }}>
              {currentAlgoDetails.stable}
            </span>
          </div>
        </div>
        <p className="edu-desc">{currentAlgoDetails.description}</p>
      </section>
    </div>
  );
}

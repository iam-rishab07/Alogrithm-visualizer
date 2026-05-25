import React, { useState, useEffect, useCallback } from 'react';
import { 
  knapsackSolver, 
  lcsSolver,
  KNAPSACK_ITEMS,
  KNAPSACK_CAPACITY,
  LCS_STR_A,
  LCS_STR_B
} from './dpAlgorithms';

const ALGO_DETAILS = {
  knapsack: {
    name: '0/1 Knapsack Problem',
    worst: 'O(N * W)',
    space: 'O(N * W)',
    description: '0/1 Knapsack evaluates a subset of items to maximize value without exceeding a capacity limit W. The DP table stores sub-capacities, referencing values of taking the current item vs skipping it.'
  },
  lcs: {
    name: 'Longest Common Subsequence (LCS)',
    worst: 'O(M * N)',
    space: 'O(M * N)',
    description: 'LCS measures sequence similarities between two strings. It increments values diagonally on match hits, or copies max values from above/left on mismatches, before backtracking the path.'
  }
};

export default function DPVisualizer() {
  const [mode, setMode] = useState('knapsack');
  const [speed, setSpeed] = useState(250);

  // Table grid states
  const [table, setTable] = useState([]);
  const [activeCell, setActiveCell] = useState(null);
  const [readCells, setReadCells] = useState([]);
  const [backtrackCells, setBacktrackCells] = useState([]);

  // Animation states
  const [steps, setSteps] = useState([]);
  const [currentStepIdx, setCurrentStepIdx] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');

  // Initialize DP Table Layout
  const initializeDPTable = useCallback(() => {
    setIsPlaying(false);
    setSteps([]);
    setCurrentStepIdx(0);
    setActiveCell(null);
    setReadCells([]);
    setBacktrackCells([]);

    if (mode === 'knapsack') {
      const rows = KNAPSACK_ITEMS.length + 1;
      const cols = KNAPSACK_CAPACITY + 1;
      setTable(Array.from({ length: rows }, () => Array(cols).fill(0)));
      setStatusMessage('Initialized Knapsack DP table (5x7). Click Solve to inspect transitions!');
    } else if (mode === 'lcs') {
      const rows = LCS_STR_A.length + 1;
      const cols = LCS_STR_B.length + 1;
      setTable(Array.from({ length: rows }, () => Array(cols).fill(0)));
      setStatusMessage(`Initialized LCS matrix comparing "${LCS_STR_A}" vs "${LCS_STR_B}". Click Solve!`);
    }
  }, [mode]);

  useEffect(() => {
    initializeDPTable();
  }, [initializeDPTable]);

  // Pre-calculate DP solver steps
  const solveDPProblem = () => {
    let generator;
    if (mode === 'knapsack') {
      generator = knapsackSolver();
    } else if (mode === 'lcs') {
      generator = lcsSolver();
    }

    const allSteps = [...generator];
    setSteps(allSteps);
    setCurrentStepIdx(0);
    setIsPlaying(true);
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
    if (step.table) setTable(step.table);
    if (step.activeCell !== undefined) setActiveCell(step.activeCell);
    if (step.readCells !== undefined) setReadCells(step.readCells);
    if (step.backtrackCells !== undefined) setBacktrackCells(step.backtrackCells);
    else setBacktrackCells([]);
    if (step.message) setStatusMessage(step.message);
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

  // Label configurations for table rows/columns
  const rowLabels = mode === 'knapsack'
    ? ['0 (Empty)', ...KNAPSACK_ITEMS.map((item, idx) => `${idx + 1} (${item.name}: wt ${item.weight}, val ${item.value})`)]
    : ['-', ...LCS_STR_A.split('')];

  const colLabels = mode === 'knapsack'
    ? Array.from({ length: KNAPSACK_CAPACITY + 1 }, (_, w) => `Cap ${w}`)
    : ['-', ...LCS_STR_B.split('')];

  const currentAlgoDetails = ALGO_DETAILS[mode];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
      {/* Control Panel */}
      <div className="glass-container control-panel">
        {/* Mode select */}
        <div className="control-group">
          <label className="control-label">DP Algorithm</label>
          <select
            className="control-select"
            value={mode}
            onChange={(e) => setMode(e.target.value)}
            disabled={isPlaying}
          >
            <option value="knapsack">0/1 Knapsack Problem</option>
            <option value="lcs">Longest Common Subsequence (LCS)</option>
          </select>
        </div>

        {/* Speed Slider */}
        <div className="control-group">
          <label className="control-label">Delay (Speed)</label>
          <div className="slider-container">
            <input
              type="range"
              min="50"
              max="1500"
              step="50"
              value={speed}
              onChange={(e) => setSpeed(Number(e.target.value))}
            />
            <span className="slider-val">{speed}ms</span>
          </div>
        </div>

        {/* Action Controls */}
        <div className="control-group">
          <label className="control-label">Controls</label>
          <div className="btn-group">
            <button className="btn" onClick={initializeDPTable} disabled={isPlaying}>
              Reset
            </button>
            {isPlaying ? (
              <button className="btn btn-primary" onClick={() => setIsPlaying(false)}>
                Pause
              </button>
            ) : (
              <button className="btn btn-primary" onClick={solveDPProblem} disabled={isPlaying}>
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

      {/* Main visualization grid table */}
      <div className="glass-container visualizer-card" style={{ minHeight: '430px' }}>
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

        <div className="bar-container" style={{ padding: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '350px' }}>
          {table.length > 0 && (
            <div style={{ overflowX: 'auto', width: '100%', display: 'flex', justifyContent: 'center' }}>
              <table style={{
                borderCollapse: 'collapse',
                fontFamily: 'var(--font-mono)',
                fontSize: '0.85rem',
                color: 'var(--text-primary)',
                background: 'rgba(15, 23, 42, 0.4)',
                border: '1px solid var(--bg-card-border)',
                borderRadius: '8px',
                overflow: 'hidden'
              }}>
                <thead>
                  <tr>
                    {/* Corner empty label */}
                    <th style={{ padding: '10px 14px', background: 'rgba(22, 28, 45, 0.9)', border: '1px solid var(--bg-card-border)', color: 'var(--text-secondary)', fontSize: '0.75rem' }}>
                      {mode === 'knapsack' ? 'Item \\ Cap' : 'Str A \\ B'}
                    </th>
                    {colLabels.map((col, cIdx) => (
                      <th key={cIdx} style={{ padding: '10px 14px', background: 'rgba(22, 28, 45, 0.9)', border: '1px solid var(--bg-card-border)', fontWeight: 'bold' }}>
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {table.map((row, rIdx) => (
                    <tr key={rIdx}>
                      {/* Row Label */}
                      <td style={{ padding: '10px 14px', background: 'rgba(22, 28, 45, 0.9)', border: '1px solid var(--bg-card-border)', fontWeight: 'bold', color: 'var(--text-secondary)', fontSize: '0.75rem' }}>
                        {rowLabels[rIdx]}
                      </td>
                      {/* Cells */}
                      {row.map((val, cIdx) => {
                        const isWriting = activeCell && activeCell.r === rIdx && activeCell.c === cIdx;
                        const isReading = readCells.some(cell => cell.r === rIdx && cell.c === cIdx);
                        const isBacktracking = backtrackCells.some(cell => cell.r === rIdx && cell.c === cIdx);

                        let bg = 'transparent';
                        let border = '1px solid var(--bg-card-border)';
                        let color = 'var(--text-primary)';

                        if (isWriting) {
                          bg = '#fbbf24'; // Active writing (yellow)
                          color = '#000000';
                        } else if (isReading) {
                          bg = 'rgba(99, 102, 241, 0.2)'; // Active reading dependencies (blue)
                          border = '1.5px solid #6366f1';
                        } else if (isBacktracking) {
                          bg = 'rgba(16, 185, 129, 0.15)'; // Backtracking path (green)
                          border = '1.5px solid #10b981';
                        }

                        return (
                          <td
                            key={cIdx}
                            style={{
                              padding: '10px 14px',
                              border,
                              background: bg,
                              color,
                              textAlign: 'center',
                              fontWeight: isWriting || isBacktracking ? 'bold' : 'normal',
                              transition: 'all 0.15s ease'
                            }}
                          >
                            {val}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Legend */}
        <div className="status-indicator">
          <div className="status-item">
            <span className="status-dot" style={{ backgroundColor: '#fbbf24' }}></span>
            <span>Cell Being Calculated</span>
          </div>
          <div className="status-item">
            <span className="status-dot" style={{ backgroundColor: 'rgba(99, 102, 241, 0.2)', border: '1px solid #6366f1' }}></span>
            <span>Read Dependencies (Cells Read From)</span>
          </div>
          <div className="status-item">
            <span className="status-dot" style={{ backgroundColor: 'rgba(16, 185, 129, 0.15)', border: '1px solid #10b981' }}></span>
            <span>Backtrack Path / Chosen Solution</span>
          </div>
        </div>
      </div>

      {/* Educational Concept details */}
      <section className="glass-container edu-card">
        <h3 style={{ fontSize: '1.1rem', fontWeight: 600, borderBottom: '1px solid var(--bg-card-border)', paddingBottom: '10px' }}>
          Dynamic Programming Mechanism
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
        </div>
        <p className="edu-desc">{currentAlgoDetails.description}</p>
      </section>
    </div>
  );
}

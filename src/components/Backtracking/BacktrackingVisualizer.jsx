import React, { useState, useEffect, useCallback } from 'react';
import { 
  nQueensSolver, 
  sudokuSolver, 
  knightTourSolver, 
  INITIAL_SUDOKU 
} from './backtrackingAlgorithms';

const ALGO_DETAILS = {
  nqueens: {
    name: 'N-Queens Backtracking',
    worst: 'O(N!)',
    space: 'O(N)',
    description: 'N-Queens placement requires placing N queens on an N×N board such that no two queens attack each other. It works row-by-row, backtracking immediately when a column or diagonal conflict is hit.'
  },
  sudoku: {
    name: 'Sudoku Solver',
    worst: 'O(9^(N))', // N is empty cells
    space: 'O(1) (fixed 81)',
    description: 'Sudoku Solver attempts to fill empty cells with digits 1-9. It validates each placement against row, column, and 3x3 box rules, erasing numbers and rewinding paths when grid constraints are violated.'
  },
  knight: {
    name: "Knight's Tour (5x5)",
    worst: 'O(8^(N²))',
    space: 'O(N²)',
    description: "Knight's Tour tasks a knight with visiting every square on a grid exactly once. Standard backtracking searches all 8 moves recursively, backing out when dead ends are encountered."
  }
};

export default function BacktrackingVisualizer() {
  const [mode, setMode] = useState('nqueens');
  const [nQueensSize, setNQueensSize] = useState(4);
  const [speed, setSpeed] = useState(200);

  const [board, setBoard] = useState([]);
  const [activeCell, setActiveCell] = useState(null);
  const [conflictCell, setConflictCell] = useState(null);
  
  const [steps, setSteps] = useState([]);
  const [currentStepIdx, setCurrentStepIdx] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');

  // Initialize board state
  const initializeBoard = useCallback(() => {
    setIsPlaying(false);
    setSteps([]);
    setCurrentStepIdx(0);
    setActiveCell(null);
    setConflictCell(null);

    if (mode === 'nqueens') {
      const emptyBoard = Array.from({ length: nQueensSize }, () => Array(nQueensSize).fill(0));
      setBoard(emptyBoard);
      setStatusMessage(`Initialized ${nQueensSize}x${nQueensSize} chessboard. Click Solve!`);
    } else if (mode === 'sudoku') {
      setBoard(INITIAL_SUDOKU);
      setStatusMessage('Initialized 9x9 Sudoku puzzle. Click Solve to backtrack paths!');
    } else if (mode === 'knight') {
      const emptyBoard = Array.from({ length: 5 }, () => Array(5).fill(0));
      setBoard(emptyBoard);
      setStatusMessage("Initialized 5x5 chessboard. Knight starts at (0,0). Click Solve!");
    }
  }, [mode, nQueensSize]);

  useEffect(() => {
    initializeBoard();
  }, [initializeBoard]);

  // Pre-calculate backtracking steps
  const solveBacktracking = () => {
    let generator;
    if (mode === 'nqueens') {
      generator = nQueensSolver(nQueensSize);
    } else if (mode === 'sudoku') {
      generator = sudokuSolver(INITIAL_SUDOKU);
    } else if (mode === 'knight') {
      generator = knightTourSolver();
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
    if (step.board) setBoard(step.board);
    if (step.grid) setBoard(step.grid);
    if (step.activeCell !== undefined) setActiveCell(step.activeCell);
    if (step.conflictCell !== undefined) setConflictCell(step.conflictCell);
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

  const currentAlgoDetails = ALGO_DETAILS[mode];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
      {/* Control Panel */}
      <div className="glass-container control-panel">
        {/* Mode select */}
        <div className="control-group">
          <label className="control-label">Backtracking Task</label>
          <select
            className="control-select"
            value={mode}
            onChange={(e) => setMode(e.target.value)}
            disabled={isPlaying}
          >
            <option value="nqueens">N-Queens Problem</option>
            <option value="sudoku">Sudoku Solver</option>
            <option value="knight">Knight's Tour (5x5)</option>
          </select>
        </div>

        {/* Dynamic Controls (N-Queens Size Selector) */}
        {mode === 'nqueens' && (
          <div className="control-group">
            <label className="control-label">Chessboard Size</label>
            <select
              className="control-select"
              value={nQueensSize}
              onChange={(e) => setNQueensSize(Number(e.target.value))}
              disabled={isPlaying}
            >
              <option value="4">4x4 board</option>
              <option value="6">6x6 board</option>
              <option value="8">8x8 board</option>
            </select>
          </div>
        )}

        {/* Delay Speed Slider */}
        <div className="control-group">
          <label className="control-label">Delay (Speed)</label>
          <div className="slider-container">
            <input
              type="range"
              min="20"
              max="1500"
              step="20"
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
            <button className="btn" onClick={initializeBoard} disabled={isPlaying}>
              Reset
            </button>
            {isPlaying ? (
              <button className="btn btn-primary" onClick={() => setIsPlaying(false)}>
                Pause
              </button>
            ) : (
              <button className="btn btn-primary" onClick={solveBacktracking} disabled={isPlaying}>
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

      {/* Main Canvas rendering grids */}
      <div className="glass-container visualizer-card" style={{ minHeight: '430px' }}>
        <div className="visualizer-header">
          <div>
            <h2 className="visualizer-title">{currentAlgoDetails.name} Visualization</h2>
            <p className="visualizer-subtitle">{statusMessage}</p>
          </div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
            {steps.length > 0 && (
              <span>Step: <strong>{currentStepIdx}</strong> / {steps.length - 1}</span>
            )}
          </div>
        </div>

        <div className="bar-container" style={{ padding: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '350px' }}>
          {/* N-Queens & Knight's Tour Renderer (Standard Chessboard grids) */}
          {(mode === 'nqueens' || mode === 'knight') && board.length > 0 && (
            <div style={{
              display: 'grid',
              gridTemplateColumns: `repeat(${board.length}, 1fr)`,
              gap: '2px',
              width: '100%',
              maxWidth: '300px',
              aspectRatio: '1',
              background: 'var(--bg-card-border)',
              border: '2px solid var(--bg-card-border)',
              borderRadius: '8px',
              overflow: 'hidden'
            }}>
              {board.map((row, r) => 
                row.map((val, c) => {
                  const isLight = (r + c) % 2 === 0;
                  const isActive = activeCell && activeCell.row === r && activeCell.col === c;
                  const isConflict = conflictCell && conflictCell.row === r && conflictCell.col === c;

                  let bg = isLight ? '#f1f5f9' : '#334155'; // light/dark wood colors
                  let color = isLight ? '#0f172a' : '#f8fafc';

                  if (isActive) {
                    bg = '#fbbf24'; // Active evaluate check (yellow)
                    color = '#0f172a';
                  } else if (isConflict || val === -1) {
                    bg = '#ef4444'; // Red conflict highlight
                    color = '#ffffff';
                  }

                  return (
                    <div
                      key={`${r}-${c}`}
                      style={{
                        background: bg,
                        color: color,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '1.2rem',
                        fontWeight: 'bold',
                        transition: 'all 0.15s ease',
                        position: 'relative'
                      }}
                    >
                      {/* Draw emojis and labels */}
                      {mode === 'nqueens' && val === 1 && '👑'}
                      {mode === 'nqueens' && val === 2 && '👑'}
                      {mode === 'knight' && val > 0 && (
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                          <span style={{ fontSize: '0.9rem' }}>🐴</span>
                          <span style={{ fontSize: '0.65rem', color: isLight ? '#475569' : '#94a3b8' }}>{val}</span>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          )}

          {/* Sudoku Solver 9x9 Grid Renderer */}
          {mode === 'sudoku' && board.length > 0 && (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(9, 1fr)',
              width: '100%',
              maxWidth: '340px',
              aspectRatio: '1',
              background: '#0f172a',
              border: '3px solid #f8fafc',
              borderRadius: '8px',
              padding: '1px'
            }}>
              {board.map((row, r) => 
                row.map((val, c) => {
                  const isInitial = INITIAL_SUDOKU[r][c] !== 0;
                  const isActive = activeCell && activeCell.row === r && activeCell.col === c;
                  const isTentative = val < 0; // negative number flags active testing checks

                  // Thickness lines for 3x3 boxes
                  const borderRight = (c === 2 || c === 5) ? '2.5px solid #f8fafc' : '1px solid #334155';
                  const borderBottom = (r === 2 || r === 5) ? '2.5px solid #f8fafc' : '1px solid #334155';

                  let displayVal = val === 0 ? '' : Math.abs(val);
                  let color = isInitial ? '#ffffff' : '#818cf8'; // fixed = white, solver = indigo
                  let bg = 'rgba(22, 28, 45, 0.9)';

                  if (isActive) {
                    bg = '#fbbf24';
                    color = '#0b0f19';
                  } else if (isTentative) {
                    bg = 'rgba(245, 158, 11, 0.15)';
                    color = '#fbbf24';
                  }

                  return (
                    <div
                      key={`${r}-${c}`}
                      style={{
                        background: bg,
                        color: color,
                        borderRight,
                        borderBottom,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontFamily: 'var(--font-mono)',
                        fontSize: '1rem',
                        fontWeight: isInitial ? '800' : '600',
                        userSelect: 'none'
                      }}
                    >
                      {displayVal}
                    </div>
                  );
                })
              )}
            </div>
          )}
        </div>

        {/* Legend */}
        {mode === 'nqueens' && (
          <div className="status-indicator">
            <div className="status-item">
              <span className="status-dot" style={{ backgroundColor: '#f1f5f9', border: '1.5px solid #334155' }}></span>
              <span>Empty Chess Cell</span>
            </div>
            <div className="status-item">
              <span className="status-dot animate-pulse" style={{ backgroundColor: '#fbbf24' }}></span>
              <span>Evaluating Cell</span>
            </div>
            <div className="status-item">
              <span className="status-dot" style={{ backgroundColor: '#ef4444' }}></span>
              <span>Conflict Collision</span>
            </div>
            <div className="status-item">
              <span className="status-dot" style={{ backgroundColor: '#6366f1' }}></span>
              <span>Queen 👑 Placed</span>
            </div>
          </div>
        )}
        {mode === 'sudoku' && (
          <div className="status-indicator">
            <div className="status-item">
              <span className="status-dot" style={{ backgroundColor: 'rgba(22, 28, 45, 0.9)', border: '1.5px solid #f8fafc' }}></span>
              <span>Initial Fixed Node</span>
            </div>
            <div className="status-item">
              <span className="status-dot" style={{ backgroundColor: '#fbbf24' }}></span>
              <span>Active Placement</span>
            </div>
            <div className="status-item">
              <span className="status-dot" style={{ backgroundColor: 'rgba(245, 158, 11, 0.15)', border: '1px solid #fbbf24' }}></span>
              <span>Testing Numbers</span>
            </div>
            <div className="status-item">
              <span className="status-dot" style={{ backgroundColor: '#818cf8' }}></span>
              <span>Backtracked Solution</span>
            </div>
          </div>
        )}
        {mode === 'knight' && (
          <div className="status-indicator">
            <div className="status-item">
              <span className="status-dot" style={{ backgroundColor: '#fbbf24' }}></span>
              <span>Active Position</span>
            </div>
            <div className="status-item">
              <span className="status-dot" style={{ backgroundColor: '#334155', border: '1.5px solid #f1f5f9' }}></span>
              <span>Knight Horse 🐴 Move Node</span>
            </div>
          </div>
        )}
      </div>

      {/* Educator detail card */}
      <section className="glass-container edu-card">
        <h3 style={{ fontSize: '1.1rem', fontWeight: 600, borderBottom: '1px solid var(--bg-card-border)', paddingBottom: '10px' }}>
          Backtracking Mechanics
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

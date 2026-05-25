import React, { useState, useEffect, useCallback } from 'react';
import { 
  twoPointersSolver, 
  slidingWindowSolver, 
  trappingWaterSolver,
  SORTED_ARRAY,
  SLIDING_ARRAY,
  WATER_ELEVATIONS,
  TARGET_SUM,
  WINDOW_K
} from './arrayAlgorithms';

const ALGO_DETAILS = {
  twopointers: {
    name: 'Two Pointers (Target Sum)',
    worst: 'O(n)',
    space: 'O(1)',
    description: 'Two Pointers techniques traverse linear arrays from outward bounds inward. It is ideal for sorted arrays, achieving O(n) search time by shifting bounds depending on whether sums fall short or exceed targets.'
  },
  sliding: {
    name: 'Sliding Window (Max Subarray Sum)',
    worst: 'O(n)',
    space: 'O(1)',
    description: 'Sliding Window maintains a sub-span window that slides across linear data. It avoids redundant summation of intermediate cells, achieving O(n) runtime compared to O(n * k) brute-force loops.'
  },
  water: {
    name: 'Trapping Rain Water',
    worst: 'O(n)',
    space: 'O(1)',
    description: 'Trapping Rain Water calculates the capacity of pools carved between vertical elevations. Two pointers track left and right peaks, accumulating differences between peak boundaries and cell heights.'
  }
};

export default function ArrayVisualizer() {
  const [mode, setMode] = useState('twopointers');
  const [speed, setSpeed] = useState(250);

  // Visualization States
  const [array, setArray] = useState([]);
  const [water, setWater] = useState([]);
  const [leftIdx, setLeftIdx] = useState(null);
  const [rightIdx, setRightIdx] = useState(null);
  const [windowStart, setWindowStart] = useState(null);
  const [windowEnd, setWindowEnd] = useState(null);

  // Algorithm Stats
  const [currentSum, setCurrentSum] = useState(null);
  const [maxSum, setMaxSum] = useState(null);
  const [totalTrapped, setTotalTrapped] = useState(0);
  const [leftMax, setLeftMax] = useState(0);
  const [rightMax, setRightMax] = useState(0);
  const [foundPair, setFoundPair] = useState(false);

  // Animation Traces
  const [steps, setSteps] = useState([]);
  const [currentStepIdx, setCurrentStepIdx] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');

  // Initialize data
  const initializeArray = useCallback(() => {
    setIsPlaying(false);
    setSteps([]);
    setCurrentStepIdx(0);
    setLeftIdx(null);
    setRightIdx(null);
    setWindowStart(null);
    setWindowEnd(null);
    setWater([]);
    setCurrentSum(null);
    setMaxSum(null);
    setTotalTrapped(0);
    setLeftMax(0);
    setRightMax(0);
    setFoundPair(false);

    if (mode === 'twopointers') {
      setArray(SORTED_ARRAY);
      setStatusMessage(`Target Sum: Find a pair that sums to ${TARGET_SUM}. Click Solve!`);
    } else if (mode === 'sliding') {
      setArray(SLIDING_ARRAY);
      setStatusMessage(`Max Subarray Sum: Slide a window of size K = ${WINDOW_K} across cells. Click Solve!`);
    } else if (mode === 'water') {
      setArray(WATER_ELEVATIONS);
      setWater(new Array(WATER_ELEVATIONS.length).fill(0));
      setStatusMessage('Elevation map loaded. Click Solve to trap rainwater!');
    }
  }, [mode]);

  useEffect(() => {
    initializeArray();
  }, [initializeArray]);

  // Pre-calculate array solver steps
  const solveArrayProblem = () => {
    let generator;
    if (mode === 'twopointers') {
      generator = twoPointersSolver();
    } else if (mode === 'sliding') {
      generator = slidingWindowSolver();
    } else if (mode === 'water') {
      generator = trappingWaterSolver();
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
    if (step.array) setArray(step.array);
    if (step.height) setArray(step.height);
    if (step.water) setWater(step.water);
    
    if (step.left !== undefined) setLeftIdx(step.left);
    if (step.right !== undefined) setRightIdx(step.right);
    if (step.windowStart !== undefined) setWindowStart(step.windowStart);
    if (step.windowEnd !== undefined) setWindowEnd(step.windowEnd);
    
    if (step.currentSum !== undefined) setCurrentSum(step.currentSum);
    if (step.maxSum !== undefined) setMaxSum(step.maxSum);
    if (step.totalTrapped !== undefined) setTotalTrapped(step.totalTrapped);
    if (step.leftMax !== undefined) setLeftMax(step.leftMax);
    if (step.rightMax !== undefined) setRightMax(step.rightMax);
    if (step.found !== undefined) setFoundPair(step.found);
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
          <label className="control-label">Array Trick Category</label>
          <select
            className="control-select"
            value={mode}
            onChange={(e) => setMode(e.target.value)}
            disabled={isPlaying}
          >
            <option value="twopointers">Two Pointers</option>
            <option value="sliding">Sliding Window</option>
            <option value="water">Trapping Rain Water</option>
          </select>
        </div>

        {/* Dynamic Parameter Monitor */}
        <div className="control-group">
          <label className="control-label">State Variables</label>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)', display: 'flex', flexDirection: 'column', gap: '4px', padding: '6px 0' }}>
            {mode === 'twopointers' && (
              <>
                <span>Left (L): <strong style={{ color: 'var(--text-primary)' }}>{leftIdx !== null ? leftIdx : '-'}</strong></span>
                <span>Right (R): <strong style={{ color: 'var(--text-primary)' }}>{rightIdx !== null ? rightIdx : '-'}</strong></span>
              </>
            )}
            {mode === 'sliding' && (
              <>
                <span>Window Sum: <strong style={{ color: 'var(--text-primary)' }}>{currentSum !== null ? currentSum : '-'}</strong></span>
                <span>Max Sum: <strong style={{ color: 'var(--accent-primary)' }}>{maxSum !== null ? maxSum : '-'}</strong></span>
              </>
            )}
            {mode === 'water' && (
              <>
                <span>Trapped: <strong style={{ color: 'var(--color-bar-default)' }}>{totalTrapped} units</strong></span>
                <span>L-Max: {leftMax} | R-Max: {rightMax}</span>
              </>
            )}
          </div>
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
            <button className="btn" onClick={initializeArray} disabled={isPlaying}>
              Reset
            </button>
            {isPlaying ? (
              <button className="btn btn-primary" onClick={() => setIsPlaying(false)}>
                Pause
              </button>
            ) : (
              <button className="btn btn-primary" onClick={solveArrayProblem} disabled={isPlaying}>
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

      {/* Main visualizer display area */}
      <div className="glass-container visualizer-card" style={{ minHeight: '400px' }}>
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

        <div className="bar-container" style={{ padding: '24px 16px', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '320px' }}>
          {/* Two Pointers & Sliding Window Layout (horizontal block row) */}
          {(mode === 'twopointers' || mode === 'sliding') && (
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center', position: 'relative', padding: '40px 0' }}>
              {array.map((val, idx) => {
                // Style configurations
                let border = '1px solid var(--bg-card-border)';
                let bg = 'rgba(30, 41, 59, 0.4)';
                let color = 'var(--text-primary)';
                
                if (mode === 'twopointers') {
                  const isLeft = leftIdx === idx;
                  const isRight = rightIdx === idx;
                  if (foundPair && (isLeft || isRight)) {
                    bg = 'linear-gradient(180deg, #10b981 0%, #059669 100%)'; // Match Pair (green)
                    border = '1px solid #10b981';
                  } else if (isLeft || isRight) {
                    bg = 'linear-gradient(180deg, #fbbf24 0%, #d97706 100%)'; // Evaluating (yellow)
                    border = '1px solid #fbbf24';
                    color = '#000000';
                  }
                }

                if (mode === 'sliding') {
                  const inWindow = windowStart !== null && windowEnd !== null && idx >= windowStart && idx <= windowEnd;
                  if (inWindow) {
                    border = '2px solid #6366f1';
                    bg = 'rgba(99, 102, 241, 0.15)';
                  }
                }

                return (
                  <div key={idx} style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <div style={{
                      width: '45px',
                      height: '45px',
                      borderRadius: '8px',
                      background: bg,
                      border,
                      color,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '1rem',
                      fontWeight: 'bold',
                      transition: 'all 0.2s ease',
                      boxShadow: mode === 'sliding' && windowStart !== null && idx >= windowStart && idx <= windowEnd ? '0 0 10px rgba(99,102,241,0.4)' : 'none'
                    }}>
                      {val}
                    </div>

                    {/* Show Pointer labels below blocks */}
                    {mode === 'twopointers' && (leftIdx === idx || rightIdx === idx) && (
                      <div style={{
                        position: 'absolute',
                        bottom: '-32px',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        fontSize: '0.75rem',
                        fontWeight: 'bold',
                        color: '#fbbf24',
                        animation: 'bounce 0.5s infinite alternate'
                      }}>
                        <span>▲</span>
                        <span>{leftIdx === idx ? 'L' : 'R'}</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Trapping Rain Water Layout (Stacked bar heights representation) */}
          {mode === 'water' && array.length > 0 && (
            <div style={{
              display: 'flex',
              alignItems: 'flex-end',
              height: '240px',
              width: '100%',
              maxWidth: '500px',
              gap: '4px',
              borderBottom: '2px solid #475569',
              padding: '0 10px'
            }}>
              {array.map((h, idx) => {
                const waterAmount = water[idx] || 0;
                const isLeft = leftIdx === idx;
                const isRight = rightIdx === idx;
                
                // Pointers coloring
                let border = '1px solid rgba(255, 255, 255, 0.05)';
                if (isLeft || isRight) {
                  border = '1px solid #fbbf24';
                }

                return (
                  <div 
                    key={idx} 
                    style={{ 
                      flexGrow: 1, 
                      display: 'flex', 
                      flexDirection: 'column', 
                      justifyContent: 'flex-end', 
                      height: '100%', 
                      position: 'relative' 
                    }}
                  >
                    {/* Trapped Water Stack (Blue) */}
                    {waterAmount > 0 && (
                      <div style={{
                        background: 'linear-gradient(180deg, #3b82f6 0%, #1d4ed8 100%)',
                        height: `${waterAmount * 40}px`,
                        borderRadius: '4px 4px 0 0',
                        opacity: '0.8',
                        border: '1px solid #60a5fa',
                        transition: 'height 0.25s ease'
                      }} />
                    )}

                    {/* Elevation Wall (Gray/Indigo) */}
                    <div style={{
                      background: isLeft || isRight ? 'linear-gradient(180deg, #fbbf24 0%, #d97706 100%)' : 'linear-gradient(180deg, #475569 0%, #1e293b 100%)',
                      height: `${h * 40}px`,
                      borderRadius: '2px 2px 0 0',
                      border,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: isLeft || isRight ? '#000000' : '#94a3b8',
                      fontSize: '0.65rem',
                      fontFamily: 'var(--font-mono)',
                      fontWeight: 'bold',
                      transition: 'background-color 0.2s ease, height 0.2s ease'
                    }}>
                      {h}
                    </div>

                    {/* Pointer overlay */}
                    {(isLeft || isRight) && (
                      <span style={{
                        position: 'absolute',
                        top: '-25px',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        fontSize: '0.75rem',
                        color: '#fbbf24',
                        fontWeight: 'bold'
                      }}>
                        {isLeft ? 'L' : 'R'}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Legend */}
        {mode === 'twopointers' && (
          <div className="status-indicator">
            <div className="status-item">
              <span className="status-dot" style={{ backgroundColor: 'rgba(30, 41, 59, 0.4)', border: '1.5px solid var(--bg-card-border)' }}></span>
              <span>Sorted Array Node</span>
            </div>
            <div className="status-item">
              <span className="status-dot" style={{ backgroundColor: '#fbbf24' }}></span>
              <span>Left (L) / Right (R) Pointer Node</span>
            </div>
            <div className="status-item">
              <span className="status-dot" style={{ backgroundColor: '#10b981' }}></span>
              <span>Match Found Pair</span>
            </div>
          </div>
        )}
        {mode === 'sliding' && (
          <div className="status-indicator">
            <div className="status-item">
              <span className="status-dot" style={{ backgroundColor: 'rgba(30, 41, 59, 0.4)', border: '1.5px solid var(--bg-card-border)' }}></span>
              <span>Default Cell</span>
            </div>
            <div className="status-item">
              <span className="status-dot" style={{ backgroundColor: 'rgba(99, 102, 241, 0.15)', border: '1.5px solid #6366f1' }}></span>
              <span>Active Sliding Window</span>
            </div>
          </div>
        )}
        {mode === 'water' && (
          <div className="status-indicator">
            <div className="status-item">
              <span className="status-dot" style={{ backgroundColor: '#475569' }}></span>
              <span>Base Elevation Block</span>
            </div>
            <div className="status-item">
              <span className="status-dot" style={{ backgroundColor: '#3b82f6' }}></span>
              <span>Trapped Rainwater (Blue pool)</span>
            </div>
            <div className="status-item">
              <span className="status-dot" style={{ backgroundColor: '#fbbf24' }}></span>
              <span>L / R Active Peaks</span>
            </div>
          </div>
        )}
      </div>

      {/* Educator Complexity Cards */}
      <section className="glass-container edu-card">
        <h3 style={{ fontSize: '1.1rem', fontWeight: 600, borderBottom: '1px solid var(--bg-card-border)', paddingBottom: '10px' }}>
          Complexity & Mechanism
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

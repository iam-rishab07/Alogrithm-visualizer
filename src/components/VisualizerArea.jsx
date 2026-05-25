import React from 'react';

const ALGORITHM_NAMES = {
  bubble: 'Bubble Sort',
  selection: 'Selection Sort',
  quick: 'Quick Sort'
};

export default function VisualizerArea({
  array,
  compared,
  swapped,
  sorted,
  algorithm,
  currentStepIdx,
  totalSteps
}) {
  const isSmallArray = array.length <= 25;

  return (
    <div className="glass-container visualizer-card">
      <div className="visualizer-header">
        <div>
          <h2 className="visualizer-title">{ALGORITHM_NAMES[algorithm]} Visualization</h2>
          <p className="visualizer-subtitle">
            Visualizing sorting transitions step by step
          </p>
        </div>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
          {totalSteps > 0 ? (
            <span>
              Step: <strong style={{ color: 'var(--text-primary)' }}>{currentStepIdx}</strong> / {totalSteps - 1}
            </span>
          ) : (
            <span>Ready to Sort</span>
          )}
        </div>
      </div>

      {/* Main visualization container */}
      <div className="bar-container">
        {array.map((value, idx) => {
          // Determine the visual state of the bar
          let barClass = 'bar-default';
          if (compared.includes(idx)) {
            barClass = 'bar-compare';
          } else if (swapped.includes(idx)) {
            barClass = 'bar-swap';
          } else if (sorted.includes(idx)) {
            barClass = 'bar-sorted';
          }

          return (
            <div
              key={idx}
              className={`array-bar ${barClass}`}
              style={{ height: `${value}%` }}
            >
              {isSmallArray && (
                <span className="bar-val">{value}</span>
              )}
            </div>
          );
        })}
      </div>

      {/* Legend & Stats */}
      <div className="status-indicator">
        <div className="status-item">
          <span className="status-dot dot-compare"></span>
          <span>Comparing</span>
        </div>
        <div className="status-item">
          <span className="status-dot dot-swap"></span>
          <span>Swapping</span>
        </div>
        <div className="status-item">
          <span className="status-dot dot-sorted"></span>
          <span>Sorted Position</span>
        </div>
      </div>
    </div>
  );
}

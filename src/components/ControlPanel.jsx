import React from 'react';

export default function ControlPanel({
  algorithm,
  setAlgorithm,
  speed,
  setSpeed,
  size,
  setSize,
  isPlaying,
  isCompleted,
  currentStepIdx,
  totalSteps,
  generateNewArray,
  onPlay,
  onPause,
  onStep
}) {
  return (
    <div className="glass-container control-panel">
      {/* Algorithm Selector */}
      <div className="control-group">
        <label className="control-label">Algorithm</label>
        <select
          className="control-select"
          value={algorithm}
          onChange={(e) => setAlgorithm(e.target.value)}
          disabled={isPlaying}
        >
          <option value="bubble">Bubble Sort</option>
          <option value="selection">Selection Sort</option>
          <option value="quick">Quick Sort</option>
        </select>
      </div>

      {/* Array Size Slider */}
      <div className="control-group">
        <label className="control-label">Array Size</label>
        <div className="slider-container">
          <input
            type="range"
            min="10"
            max="100"
            value={size}
            onChange={(e) => setSize(Number(e.target.value))}
            disabled={isPlaying}
          />
          <span className="slider-val">{size} bars</span>
        </div>
      </div>

      {/* Speed Slider */}
      <div className="control-group">
        <label className="control-label">Delay (ms)</label>
        <div className="slider-container">
          <input
            type="range"
            min="1"
            max="1000"
            value={speed}
            onChange={(e) => setSpeed(Number(e.target.value))}
          />
          <span className="slider-val">{speed}ms</span>
        </div>
      </div>

      {/* Playback & Action Controls */}
      <div className="control-group">
        <label className="control-label">Controls</label>
        <div className="btn-group">
          {/* Generate New Array */}
          <button
            className="btn"
            onClick={generateNewArray}
            disabled={isPlaying}
            title="Generate New Array"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67" />
            </svg>
            Reset
          </button>

          {/* Play/Pause Button */}
          {isPlaying ? (
            <button
              className="btn btn-primary"
              onClick={onPause}
              title="Pause Simulation"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <rect x="6" y="4" width="4" height="16" rx="1" />
                <rect x="14" y="4" width="4" height="16" rx="1" />
              </svg>
              Pause
            </button>
          ) : (
            <button
              className="btn btn-primary"
              onClick={onPlay}
              disabled={isCompleted || totalSteps <= 1}
              title="Play Simulation"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <polygon points="5,3 19,12 5,21" />
              </svg>
              Play
            </button>
          )}

          {/* Step Forward */}
          <button
            className="btn"
            onClick={onStep}
            disabled={isPlaying || isCompleted || totalSteps <= 1 || currentStepIdx >= totalSteps - 1}
            title="Step Forward"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polygon points="5,4 15,12 5,20" fill="currentColor" />
              <line x1="19" y1="5" x2="19" y2="19" />
            </svg>
            Step
          </button>
        </div>
      </div>
    </div>
  );
}

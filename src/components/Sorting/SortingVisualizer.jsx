import React, { useState, useEffect, useCallback } from 'react';
import ControlPanel from '../ControlPanel';
import VisualizerArea from '../VisualizerArea';
import { 
  bubbleSort, 
  selectionSort, 
  insertionSort, 
  mergeSort, 
  quickSort, 
  heapSort, 
  radixSort 
} from '../../utils/sortingAlgorithms';

const ALGO_DETAILS = {
  bubble: {
    name: 'Bubble Sort',
    timeWorst: 'O(n²)',
    timeBest: 'O(n)',
    timeAvg: 'O(n²)',
    space: 'O(1)',
    stable: 'Yes',
    description: 'Bubble Sort is a simple comparison-based sorting algorithm. It repeatedly steps through the list, compares adjacent elements, and swaps them if they are in the wrong order. The pass through the list is repeated until the list is sorted.'
  },
  selection: {
    name: 'Selection Sort',
    timeWorst: 'O(n²)',
    timeBest: 'O(n²)',
    timeAvg: 'O(n²)',
    space: 'O(1)',
    stable: 'No',
    description: 'Selection Sort divides the input list into two parts: a sorted sublist built up from left to right, and an unsorted sublist. It repeatedly finds the smallest element in the unsorted sublist and swaps it with the leftmost unsorted element.'
  },
  insertion: {
    name: 'Insertion Sort',
    timeWorst: 'O(n²)',
    timeBest: 'O(n)',
    timeAvg: 'O(n²)',
    space: 'O(1)',
    stable: 'Yes',
    description: 'Insertion Sort builds the final sorted array one item at a time. It is highly efficient for small data sets or partially sorted arrays, and is stable and in-place.'
  },
  merge: {
    name: 'Merge Sort',
    timeWorst: 'O(n log n)',
    timeBest: 'O(n log n)',
    timeAvg: 'O(n log n)',
    space: 'O(n)',
    stable: 'Yes',
    description: 'Merge Sort is a divide-and-conquer algorithm. It recursively splits the array in halves, sorts each half, and merges them. It guarantees O(n log n) time complexity but requires O(n) extra space.'
  },
  quick: {
    name: 'Quick Sort (Lomuto)',
    timeWorst: 'O(n²)',
    timeBest: 'O(n log n)',
    timeAvg: 'O(n log n)',
    space: 'O(log n)',
    stable: 'No',
    description: 'Quick Sort is a highly efficient divide-and-conquer sorting algorithm. It works by selecting a "pivot" element and partitioning the other elements into two sub-arrays according to whether they are less than or greater than the pivot.'
  },
  heap: {
    name: 'Heap Sort',
    timeWorst: 'O(n log n)',
    timeBest: 'O(n log n)',
    timeAvg: 'O(n log n)',
    space: 'O(1)',
    stable: 'No',
    description: 'Heap Sort visualizes building a Binary Max Heap structure out of the array elements. It then repeatedly extracts the maximum element and restores the heap. It is in-place and guarantees O(n log n) time.'
  },
  radix: {
    name: 'Radix Sort',
    timeWorst: 'O(nk)',
    timeBest: 'O(nk)',
    timeAvg: 'O(nk)',
    space: 'O(n + k)',
    stable: 'Yes',
    description: 'Radix Sort is a non-comparative sorting algorithm. It sorts integers by processing individual digits (using Counting Sort as a subroutine) starting from the least significant digit to the most significant.'
  }
};

export default function SortingVisualizer() {
  const [size, setSize] = useState(40);
  const [speed, setSpeed] = useState(50);
  const [algorithm, setAlgorithm] = useState('bubble');
  
  const [array, setArray] = useState([]);
  const [initialArray, setInitialArray] = useState([]);
  const [compared, setCompared] = useState([]);
  const [swapped, setSwapped] = useState([]);
  const [sorted, setSorted] = useState([]);
  
  const [steps, setSteps] = useState([]);
  const [currentStepIdx, setCurrentStepIdx] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  const computeSteps = useCallback((arr, algo) => {
    if (!arr || arr.length === 0) return [];
    let generator;
    if (algo === 'bubble') {
      generator = bubbleSort(arr);
    } else if (algo === 'selection') {
      generator = selectionSort(arr);
    } else if (algo === 'insertion') {
      generator = insertionSort(arr);
    } else if (algo === 'merge') {
      generator = mergeSort(arr);
    } else if (algo === 'quick') {
      generator = quickSort(arr);
    } else if (algo === 'heap') {
      generator = heapSort(arr);
    } else if (algo === 'radix') {
      generator = radixSort(arr);
    }
    return [...generator];
  }, []);

  const generateNewArray = useCallback((customSize) => {
    const targetSize = typeof customSize === 'number' ? customSize : size;
    const newArray = [];
    for (let i = 0; i < targetSize; i++) {
      newArray.push(Math.floor(Math.random() * 85) + 10);
    }
    setArray(newArray);
    setInitialArray(newArray);
    setCompared([]);
    setSwapped([]);
    setSorted([]);
    setCurrentStepIdx(0);
    setIsPlaying(false);

    const generatedSteps = computeSteps(newArray, algorithm);
    setSteps(generatedSteps);
  }, [size, algorithm, computeSteps]);

  useEffect(() => {
    generateNewArray();
  }, []);

  const handleAlgorithmChange = (newAlgo) => {
    setAlgorithm(newAlgo);
    setIsPlaying(false);
    setCurrentStepIdx(0);
    setCompared([]);
    setSwapped([]);
    setSorted([]);
    
    setArray(initialArray);
    const generatedSteps = computeSteps(initialArray, newAlgo);
    setSteps(generatedSteps);
  };

  const handleSizeChange = (newSize) => {
    setSize(newSize);
    generateNewArray(newSize);
  };

  useEffect(() => {
    let timerId = null;
    if (isPlaying) {
      timerId = setInterval(() => {
        setCurrentStepIdx((prevIdx) => {
          if (prevIdx < steps.length - 1) {
            const nextIdx = prevIdx + 1;
            const currentStep = steps[nextIdx];
            setArray(currentStep.array);
            setCompared(currentStep.compared);
            setSwapped(currentStep.swapped);
            setSorted(currentStep.sorted);
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

  const handleStepForward = () => {
    if (isPlaying) return;
    if (currentStepIdx < steps.length - 1) {
      const nextIdx = currentStepIdx + 1;
      const currentStep = steps[nextIdx];
      setArray(currentStep.array);
      setCompared(currentStep.compared);
      setSwapped(currentStep.swapped);
      setSorted(currentStep.sorted);
      setCurrentStepIdx(nextIdx);
    }
  };

  const isCompleted = steps.length > 0 && currentStepIdx === steps.length - 1;
  const currentAlgoDetails = ALGO_DETAILS[algorithm];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
      {/* Control Panel */}
      <ControlPanel
        algorithm={algorithm}
        setAlgorithm={handleAlgorithmChange}
        speed={speed}
        setSpeed={setSpeed}
        size={size}
        setSize={handleSizeChange}
        isPlaying={isPlaying}
        isCompleted={isCompleted}
        currentStepIdx={currentStepIdx}
        totalSteps={steps.length}
        generateNewArray={() => generateNewArray(size)}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onStep={handleStepForward}
      />

      {/* Visualizer Area */}
      <VisualizerArea
        array={array}
        compared={compared}
        swapped={swapped}
        sorted={sorted}
        algorithm={algorithm}
        currentStepIdx={currentStepIdx}
        totalSteps={steps.length}
      />

      {/* Educational Panel */}
      <section className="glass-container edu-card">
        <h3 style={{ fontSize: '1.1rem', fontWeight: 600, borderBottom: '1px solid var(--bg-card-border)', paddingBottom: '10px' }}>
          Algorithm Concept & Complexity
        </h3>
        <div className="edu-grid">
          <div className="edu-stat-box">
            <span className="edu-stat-label">Best-Case Time</span>
            <span className="edu-stat-val">{currentAlgoDetails.timeBest}</span>
          </div>
          <div className="edu-stat-box">
            <span className="edu-stat-label">Average Time</span>
            <span className="edu-stat-val">{currentAlgoDetails.timeAvg}</span>
          </div>
          <div className="edu-stat-box">
            <span className="edu-stat-label">Worst-Case Time</span>
            <span className="edu-stat-val">{currentAlgoDetails.timeWorst}</span>
          </div>
          <div className="edu-stat-box">
            <span className="edu-stat-label">Auxiliary Space</span>
            <span className="edu-stat-val">{currentAlgoDetails.space}</span>
          </div>
          <div className="edu-stat-box">
            <span className="edu-stat-label">Stable Sort</span>
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

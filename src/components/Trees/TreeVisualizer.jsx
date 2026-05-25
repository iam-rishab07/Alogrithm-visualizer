import React, { useState, useEffect, useCallback } from 'react';
import { 
  cloneTree, 
  computeTreeLayout, 
  treeInsert, 
  treeTraversal, 
  computeTrieLayout, 
  trieInsertWord, 
  trieSearchWord 
} from './treeAlgorithms';

const ALGO_DETAILS = {
  bst: {
    name: 'Binary Search Tree (BST)',
    worst: 'O(n)',
    avg: 'O(log n)',
    space: 'O(h)',
    description: 'A BST organizes nodes such that left children are smaller and right children are larger. If elements are inserted in sorted order, the tree degenerates into a linked list, degrading search times to O(n).'
  },
  avl: {
    name: 'Self-Balancing AVL Tree',
    worst: 'O(log n)',
    avg: 'O(log n)',
    space: 'O(log n)',
    description: 'An AVL tree is a self-balancing binary search tree. It maintains a balance factor (difference in height of left and right subtrees) of at most 1, triggering rotations (LL, RR, LR, RL) to maintain logarithmic depth.'
  },
  trie: {
    name: 'Trie (Prefix Tree)',
    worst: 'O(L)',
    avg: 'O(L)',
    space: 'O(N * L * Σ)',
    description: 'A Trie is an efficient information-retrieval tree. Words are stored character by character along vertical paths sharing prefixes. This optimizes lookup times to O(L) where L is the length of the string.'
  }
};

const DEFAULT_BST_VALUES = [40, 20, 60, 10, 30, 50, 70];
const DEFAULT_TRIE_WORDS = ['CAT', 'CAR', 'BAT'];

export default function TreeVisualizer() {
  const [treeType, setTreeType] = useState('bst'); // 'bst', 'avl', 'trie'
  const [inputValue, setInputValue] = useState('');
  const [traversalType, setTraversalType] = useState('inorder');
  const [speed, setSpeed] = useState(500); // speed in ms
  
  // BST/AVL Roots
  const [bstRoot, setBstRoot] = useState(null);
  const [avlRoot, setAvlRoot] = useState(null);
  
  // Trie Root
  const [trieRoot, setTrieRoot] = useState({
    id: 'root',
    isWordEnd: false,
    children: {}
  });

  // Animation states
  const [steps, setSteps] = useState([]);
  const [currentStepIdx, setCurrentStepIdx] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  
  const [highlightedValue, setHighlightedValue] = useState(null);
  const [highlightedTrieId, setHighlightedTrieId] = useState(null);
  const [traversedOrder, setTraversedOrder] = useState([]);

  // Initialize Default Trees
  const initializeDefaultTree = useCallback(() => {
    // Build BST
    let bst = null;
    DEFAULT_BST_VALUES.forEach(val => {
      bst = insertSync(bst, val);
    });
    setBstRoot(bst);

    // Build AVL
    let avl = null;
    DEFAULT_BST_VALUES.forEach(val => {
      avl = insertSync(avl, val, true);
    });
    setAvlRoot(avl);

    // Build Trie
    let trie = { id: 'root', isWordEnd: false, children: {} };
    DEFAULT_TRIE_WORDS.forEach(word => {
      trie = insertTrieSync(trie, word);
    });
    setTrieRoot(trie);

    setSteps([]);
    setCurrentStepIdx(0);
    setIsPlaying(false);
    setHighlightedValue(null);
    setHighlightedTrieId(null);
    setTraversedOrder([]);
    setStatusMessage('Visualizer initialized with default nodes. Add elements to inspect balances!');
  }, []);

  useEffect(() => {
    initializeDefaultTree();
  }, [initializeDefaultTree]);

  // Synchronous insertion helper for default loads
  const insertSync = (node, val, isAVL = false) => {
    if (!node) return { value: val, left: null, right: null, height: 1 };
    if (val < node.value) node.left = insertSync(node.left, val, isAVL);
    else if (val > node.value) node.right = insertSync(node.right, val, isAVL);
    
    // AVL Balancing in load helper
    if (isAVL) {
      node.height = Math.max(node.left ? node.left.height : 0, node.right ? node.right.height : 0) + 1;
      const balance = (node.left ? node.left.height : 0) - (node.right ? node.right.height : 0);
      
      if (balance > 1 && val < node.left.value) {
        // LL
        const x = node.left;
        node.left = x.right;
        x.right = node;
        node.height = Math.max(node.left ? node.left.height : 0, node.right ? node.right.height : 0) + 1;
        x.height = Math.max(x.left ? x.left.height : 0, x.right ? x.right.height : 0) + 1;
        return x;
      }
      if (balance < -1 && val > node.right.value) {
        // RR
        const y = node.right;
        node.right = y.left;
        y.left = node;
        node.height = Math.max(node.left ? node.left.height : 0, node.right ? node.right.height : 0) + 1;
        y.height = Math.max(y.left ? y.left.height : 0, y.right ? y.right.height : 0) + 1;
        return y;
      }
    }
    return node;
  };

  const insertTrieSync = (root, word) => {
    let current = root;
    for (let i = 0; i < word.length; i++) {
      const char = word[i].toUpperCase();
      if (!current.children[char]) {
        current.children[char] = {
          id: `${char}-${Math.random().toString(36).substr(2, 5)}`,
          isWordEnd: false,
          children: {}
        };
      }
      current = current.children[char];
    }
    current.isWordEnd = true;
    return root;
  };

  // Switch tabs
  const handleTypeChange = (type) => {
    setTreeType(type);
    setIsPlaying(false);
    setSteps([]);
    setCurrentStepIdx(0);
    setHighlightedValue(null);
    setHighlightedTrieId(null);
    setTraversedOrder([]);
    setStatusMessage(`Switched to ${ALGO_DETAILS[type].name}.`);
  };

  // BST / AVL Animations trigger
  const runTreeInsert = () => {
    const val = parseInt(inputValue);
    if (isNaN(val)) {
      setStatusMessage('Please enter a valid numeric value.');
      return;
    }
    setInputValue('');
    setIsPlaying(false);
    setTraversedOrder([]);

    const activeRoot = treeType === 'bst' ? bstRoot : avlRoot;
    const isAVL = treeType === 'avl';
    const generator = treeInsert(activeRoot, val, isAVL);

    const allSteps = [...generator];
    setSteps(allSteps);
    setCurrentStepIdx(0);
    setIsPlaying(true);
  };

  // Traversal Animations trigger
  const runTreeTraversal = () => {
    const activeRoot = treeType === 'bst' ? bstRoot : avlRoot;
    if (!activeRoot) {
      setStatusMessage('Tree is empty.');
      return;
    }
    setIsPlaying(false);
    setTraversedOrder([]);

    const generator = treeTraversal(activeRoot, traversalType);
    const allSteps = [...generator];
    setSteps(allSteps);
    setCurrentStepIdx(0);
    setIsPlaying(true);
    setStatusMessage(`Starting ${traversalType.toUpperCase()} traversal...`);
  };

  // Trie Insert Word Trigger
  const runTrieInsert = () => {
    if (!inputValue.trim()) return;
    const word = inputValue.trim().toUpperCase();
    setInputValue('');
    setIsPlaying(false);
    setTraversedOrder([]);

    const generator = trieInsertWord(trieRoot, word);
    const allSteps = [...generator];
    setSteps(allSteps);
    setCurrentStepIdx(0);
    setIsPlaying(true);
  };

  // Trie Search Word Trigger
  const runTrieSearch = () => {
    if (!inputValue.trim()) return;
    const word = inputValue.trim().toUpperCase();
    setInputValue('');
    setIsPlaying(false);
    setTraversedOrder([]);

    const generator = trieSearchWord(trieRoot, word);
    const allSteps = [...generator];
    setSteps(allSteps);
    setCurrentStepIdx(0);
    setIsPlaying(true);
  };

  // Playback Loop
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
    if (step.status) setStatusMessage(step.status);
    
    // Stitch snapshots
    if (step.treeSnapshot) {
      if (treeType === 'bst') setBstRoot(step.treeSnapshot);
      else if (treeType === 'avl') setAvlRoot(step.treeSnapshot);
      else if (treeType === 'trie') setTrieRoot(step.treeSnapshot);
    }

    if (step.highlightedValue !== undefined) setHighlightedValue(step.highlightedValue);
    if (step.highlightedId !== undefined) setHighlightedTrieId(step.highlightedId);
    if (step.traversed) setTraversedOrder(step.traversed);
  };

  // Manual Step
  const handleStepForward = () => {
    if (isPlaying || steps.length === 0) return;
    if (currentStepIdx < steps.length - 1) {
      const nextIdx = currentStepIdx + 1;
      applyStepState(steps[nextIdx]);
      setCurrentStepIdx(nextIdx);
    }
  };

  // Render SVG links and nodes
  const activeTree = treeType === 'bst' ? bstRoot : avlRoot;
  const treeLayout = treeType === 'trie' 
    ? computeTrieLayout(trieRoot) 
    : computeTreeLayout(activeTree);

  const currentAlgoDetails = ALGO_DETAILS[treeType];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
      {/* Control Panel */}
      <div className="glass-container control-panel">
        {/* Tree Type select */}
        <div className="control-group">
          <label className="control-label">Structure Type</label>
          <select
            className="control-select"
            value={treeType}
            onChange={(e) => handleTypeChange(e.target.value)}
            disabled={isPlaying}
          >
            <option value="bst">Binary Search Tree (BST)</option>
            <option value="avl">AVL self-balancing Tree</option>
            <option value="trie">Trie (Prefix Tree)</option>
          </select>
        </div>

        {/* Dynamic Controls based on BST vs Trie */}
        {treeType !== 'trie' ? (
          <>
            {/* Input Inserting */}
            <div className="control-group">
              <label className="control-label">Insert Node Value</label>
              <div className="slider-container" style={{ gap: '6px' }}>
                <input
                  type="number"
                  placeholder="Key (e.g. 25)"
                  className="control-select"
                  style={{ width: '100px', padding: '8px' }}
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  disabled={isPlaying}
                />
                <button className="btn btn-primary" onClick={runTreeInsert} disabled={isPlaying}>
                  Insert
                </button>
              </div>
            </div>

            {/* Tree Traversals */}
            <div className="control-group">
              <label className="control-label">Tree traversals</label>
              <div className="slider-container" style={{ gap: '6px' }}>
                <select
                  className="control-select"
                  style={{ padding: '8px 12px' }}
                  value={traversalType}
                  onChange={(e) => setTraversalType(e.target.value)}
                  disabled={isPlaying}
                >
                  <option value="inorder">Inorder (L-Root-R)</option>
                  <option value="preorder">Preorder (Root-L-R)</option>
                  <option value="postorder">Postorder (L-R-Root)</option>
                  <option value="levelorder">Level-order (BFS)</option>
                </select>
                <button className="btn" onClick={runTreeTraversal} disabled={isPlaying}>
                  Traverse
                </button>
              </div>
            </div>
          </>
        ) : (
          /* Trie Insertion */
          <div className="control-group">
            <label className="control-label">Word Search/Insert</label>
            <div className="slider-container" style={{ gap: '6px' }}>
              <input
                type="text"
                placeholder="Word (e.g. CAT)"
                className="control-select"
                style={{ width: '130px', padding: '8px', textTransform: 'uppercase' }}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                disabled={isPlaying}
              />
              <button className="btn btn-primary" onClick={runTrieInsert} disabled={isPlaying}>
                Insert
              </button>
              <button className="btn" onClick={runTrieSearch} disabled={isPlaying}>
                Search
              </button>
            </div>
          </div>
        )}

        {/* Speed Slider */}
        <div className="control-group">
          <label className="control-label">Animation Speed</label>
          <div className="slider-container">
            <input
              type="range"
              min="100"
              max="1500"
              step="50"
              value={speed}
              onChange={(e) => setSpeed(Number(e.target.value))}
            />
            <span className="slider-val">{speed}ms</span>
          </div>
        </div>

        {/* Execution playback buttons */}
        <div className="control-group">
          <label className="control-label">Simulation</label>
          <div className="btn-group">
            <button className="btn" onClick={initializeDefaultTree} disabled={isPlaying}>
              Reset Tree
            </button>
            {isPlaying ? (
              <button className="btn btn-primary" onClick={() => setIsPlaying(false)}>
                Pause
              </button>
            ) : (
              <button 
                className="btn btn-primary" 
                onClick={() => setIsPlaying(true)} 
                disabled={steps.length === 0 || currentStepIdx >= steps.length - 1}
              >
                Play
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

      {/* Main visual displaying SVG */}
      <div className="glass-container visualizer-card" style={{ minHeight: '430px' }}>
        <div className="visualizer-header">
          <div>
            <h2 className="visualizer-title">{currentAlgoDetails.name} Visualizer</h2>
            <p className="visualizer-subtitle">{statusMessage}</p>
          </div>
        </div>

        <div className="bar-container" style={{ padding: '16px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '350px' }}>
          <svg viewBox="0 0 700 320" width="100%" height="320">
            {/* Draw Links */}
            {treeLayout.links.map((link, idx) => (
              <line
                key={`link-${idx}`}
                x1={link.x1}
                y1={link.y1}
                x2={link.x2}
                y2={link.y2}
                stroke="#334155"
                strokeWidth="2.5"
              />
            ))}

            {/* Draw Nodes */}
            {treeLayout.nodes.map((node) => {
              // Highlight node triggers
              let fill = '#1e293b';
              let stroke = '#475569';
              
              if (treeType === 'trie') {
                const isActiveTrie = highlightedTrieId === node.id;
                if (isActiveTrie) {
                  fill = '#6366f1';
                  stroke = '#a78bfa';
                } else if (node.isWordEnd) {
                  fill = 'rgba(16, 185, 129, 0.2)';
                  stroke = '#10b981';
                }
              } else {
                const isActiveNode = highlightedValue === node.value;
                const inTraversedOutput = traversedOrder.includes(node.value);
                if (isActiveNode) {
                  fill = '#fbbf24'; // Yellow active search compare
                  stroke = '#f59e0b';
                } else if (inTraversedOutput) {
                  fill = 'rgba(16, 185, 129, 0.15)';
                  stroke = '#10b981';
                }
              }

              return (
                <g key={node.value !== undefined ? node.value : node.id}>
                  <circle
                    cx={node.x}
                    cy={node.y}
                    r="18"
                    fill={fill}
                    stroke={stroke}
                    strokeWidth="2.5"
                    style={{ transition: 'all 0.3s ease' }}
                  />
                  <text
                    x={node.x}
                    y={node.y + 4}
                    fill="#f8fafc"
                    fontSize="11"
                    fontWeight="bold"
                    textAnchor="middle"
                  >
                    {node.value !== undefined ? node.value : node.char}
                  </text>
                </g>
              );
            })}
          </svg>

          {/* Traversal console order array output */}
          {traversedOrder.length > 0 && (
            <div style={{ width: '100%', maxWidth: '650px', background: 'rgba(15,23,42,0.8)', border: '1px solid var(--bg-card-border)', borderRadius: '6px', padding: '10px', fontSize: '0.85rem', fontFamily: 'var(--font-mono)' }}>
              Traversal Output: [ <strong style={{ color: 'var(--accent-primary)' }}>{traversedOrder.join(', ')}</strong> ]
            </div>
          )}
        </div>

        {/* Legend */}
        {treeType !== 'trie' ? (
          <div className="status-indicator">
            <div className="status-item">
              <span className="status-dot" style={{ backgroundColor: '#1e293b', border: '1.5px solid #475569' }}></span>
              <span>Default Node</span>
            </div>
            <div className="status-item">
              <span className="status-dot" style={{ backgroundColor: '#fbbf24' }}></span>
              <span>Active Comparison</span>
            </div>
            <div className="status-item">
              <span className="status-dot" style={{ backgroundColor: 'rgba(16, 185, 129, 0.2)' }}></span>
              <span>Traversed / Visited</span>
            </div>
          </div>
        ) : (
          <div className="status-indicator">
            <div className="status-item">
              <span className="status-dot" style={{ backgroundColor: '#1e293b', border: '1.5px solid #475569' }}></span>
              <span>Default Node</span>
            </div>
            <div className="status-item">
              <span className="status-dot" style={{ backgroundColor: '#6366f1' }}></span>
              <span>Traversing Character</span>
            </div>
            <div className="status-item">
              <span className="status-dot" style={{ backgroundColor: 'rgba(16, 185, 129, 0.2)' }}></span>
              <span>Completed Word End</span>
            </div>
          </div>
        )}
      </div>

      {/* Concept complexity cards */}
      <section className="glass-container edu-card">
        <h3 style={{ fontSize: '1.1rem', fontWeight: 600, borderBottom: '1px solid var(--bg-card-border)', paddingBottom: '10px' }}>
          Complexity Analysis
        </h3>
        <div className="edu-grid">
          <div className="edu-stat-box">
            <span className="edu-stat-label">Worst-Case Time</span>
            <span className="edu-stat-val">{currentAlgoDetails.worst}</span>
          </div>
          <div className="edu-stat-box">
            <span className="edu-stat-label">Average Time</span>
            <span className="edu-stat-val">{currentAlgoDetails.avg}</span>
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

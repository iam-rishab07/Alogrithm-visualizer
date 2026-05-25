import React from 'react';

const CATEGORIES = [
  {
    id: 'sorting',
    name: 'Sorting',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="20" x2="18" y2="10" />
        <line x1="12" y1="20" x2="12" y2="4" />
        <line x1="6" y1="20" x2="6" y2="14" />
      </svg>
    ),
    description: 'Bubble, Selection, Insertion, Merge, Quick, Heap, Radix'
  },
  {
    id: 'pathfinding',
    name: 'Graphs & Paths',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <path d="M9 3v18" />
        <path d="M15 3v18" />
        <path d="M3 9h18" />
        <path d="M3 15h18" />
      </svg>
    ),
    description: 'BFS, DFS, Dijkstra, A*, Kruskal, Prim, Topo'
  },
  {
    id: 'trees',
    name: 'Trees & Traversals',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="5" r="3" />
        <circle cx="6" cy="19" r="3" />
        <circle cx="18" cy="19" r="3" />
        <path d="M9 16.5L12 8.5" />
        <path d="M15 16.5L12 8.5" />
      </svg>
    ),
    description: 'BST, AVL Rotations, Pre/In/Post/Level, Trie'
  },
  {
    id: 'backtracking',
    name: 'Backtracking',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M2 12h20M12 2v20M2 12l5 5M2 12l5-5M22 12l-5 5M22 12l-5-5" />
      </svg>
    ),
    description: 'N-Queens, Sudoku, Knight\'s Tour, Maze Solver'
  },
  {
    id: 'arrays',
    name: 'Array Techniques',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="6" width="20" height="12" rx="2" />
        <line x1="7" y1="6" x2="7" y2="18" />
        <line x1="12" y1="6" x2="12" y2="18" />
        <line x1="17" y1="6" x2="17" y2="18" />
      </svg>
    ),
    description: 'Two Pointers, Sliding Window, Trapping Rainwater'
  },
  {
    id: 'dp',
    name: 'Dynamic Prog.',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 3h18v18H3z" />
        <path d="M9 3v18" />
        <path d="M15 3v18" />
        <path d="M3 9h18" />
        <path d="M3 15h18" />
      </svg>
    ),
    description: '0/1 Knapsack, Longest Common Subsequence (LCS)'
  }
];

export default function Sidebar({ activeCategory, setActiveCategory }) {
  return (
    <aside style={{
      width: '280px',
      background: 'rgba(15, 23, 42, 0.9)',
      borderRight: '1px solid var(--bg-card-border)',
      height: '100vh',
      position: 'fixed',
      left: 0,
      top: 0,
      display: 'flex',
      flexDirection: 'column',
      padding: '24px 16px',
      zIndex: 100,
      backdropFilter: 'blur(10px)',
      boxShadow: '4px 0 24px rgba(0, 0, 0, 0.2)'
    }}>
      {/* Branding */}
      <div style={{ marginBottom: '32px', paddingLeft: '12px' }}>
        <h2 style={{
          fontSize: '1.4rem',
          fontWeight: 800,
          background: 'linear-gradient(90deg, #6366f1, #a78bfa)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          letterSpacing: '-0.02em'
        }}>
          FloraVision
        </h2>
        <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
          DSA Lab Studio
        </span>
      </div>

      {/* Navigation list */}
      <nav style={{ display: 'flex', flexDirection: 'column', gap: '8px', flexGrow: 1 }}>
        {CATEGORIES.map((cat) => {
          const isActive = activeCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                width: '100%',
                padding: '12px 14px',
                borderRadius: '10px',
                border: isActive ? '1px solid rgba(99, 102, 241, 0.25)' : '1px solid transparent',
                background: isActive ? 'rgba(99, 102, 241, 0.12)' : 'transparent',
                color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'all 0.2s ease',
                outline: 'none'
              }}
              onMouseEnter={(e) => {
                if (!isActive) {
                  e.currentTarget.style.color = 'var(--text-primary)';
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)';
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  e.currentTarget.style.color = 'var(--text-secondary)';
                  e.currentTarget.style.background = 'transparent';
                }
              }}
            >
              <div style={{
                color: isActive ? '#818cf8' : 'inherit',
                display: 'flex',
                alignItems: 'center'
              }}>
                {cat.icon}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: '0.9rem', fontWeight: isActive ? 600 : 500 }}>
                  {cat.name}
                </span>
                <span style={{ fontSize: '0.7rem', color: 'rgba(148, 163, 184, 0.65)', marginTop: '2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '190px' }}>
                  {cat.description}
                </span>
              </div>
            </button>
          );
        })}
      </nav>

      {/* Footer info */}
      <div style={{ borderTop: '1px solid var(--bg-card-border)', paddingTop: '16px', paddingLeft: '8px' }}>
        <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
          Portfolio Showcase
        </p>
        <p style={{ fontSize: '0.7rem', color: 'rgba(148, 163, 184, 0.4)', marginTop: '4px' }}>
          React Render Cycle Engine
        </p>
      </div>
    </aside>
  );
}

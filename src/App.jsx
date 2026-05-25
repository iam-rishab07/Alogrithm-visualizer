import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import SortingVisualizer from './components/Sorting/SortingVisualizer';
import GraphVisualizer from './components/Pathfinding/GraphVisualizer';
import TreeVisualizer from './components/Trees/TreeVisualizer';
import BacktrackingVisualizer from './components/Backtracking/BacktrackingVisualizer';
import ArrayVisualizer from './components/Arrays/ArrayVisualizer';
import DPVisualizer from './components/DP/DPVisualizer';

function App() {
  const [activeCategory, setActiveCategory] = useState('sorting');

  // Render the selected visualization module
  const renderActiveVisualizer = () => {
    switch (activeCategory) {
      case 'sorting':
        return <SortingVisualizer />;
      case 'pathfinding':
        return <GraphVisualizer />;
      case 'trees':
        return <TreeVisualizer />;
      case 'backtracking':
        return <BacktrackingVisualizer />;
      case 'arrays':
        return <ArrayVisualizer />;
      case 'dp':
        return <DPVisualizer />;
      default:
        return <SortingVisualizer />;
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', width: '100%' }}>
      {/* Navigation Sidebar */}
      <Sidebar activeCategory={activeCategory} setActiveCategory={setActiveCategory} />

      {/* Main Content Workspace (shifted for sidebar width) */}
      <main style={{
        marginLeft: '280px',
        flexGrow: 1,
        padding: '24px 3% 40px 3%',
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
        width: 'calc(100% - 280px)',
        position: 'relative'
      }}>
        {renderActiveVisualizer()}
      </main>
    </div>
  );
}

export default App;

import { useState, useMemo } from 'react';
import CityMap from '../../components/CityMap/CityMap';
import StepPlayer from '../../components/StepPlayer/StepPlayer';
import { useGraph } from '../../hooks/useGraph';
import { useAlgorithm } from '../../hooks/useAlgorithm';
import { kruskal } from '../../algorithms/kruskal';
import { Navigation, IndianRupee } from 'lucide-react';
import './Infrastructure.css';

const Infrastructure = () => {
  const { nodes, edges, updateNodePos, toggleBlockEdge } = useGraph();
  const [algoResult, setAlgoResult] = useState(null);
  
  // Use base edges without traffic for infrastructure planning
  const baseEdges = useMemo(() => edges.map(e => ({
    ...e,
    w: e.originalW !== undefined ? e.originalW : e.w
  })), [edges]);

  
  const { 
    currentStep, isPlaying, speed, setSpeed, 
    play, pause, next, prev, reset, totalSteps, currentStepData 
  } = useAlgorithm(algoResult?.steps || []);

  const handleRunAlgorithm = () => {
    const result = kruskal(nodes, baseEdges);
    setAlgoResult(result);
    reset();
  };

  const mstEdges = useMemo(() => {
    if (!algoResult) return [];
    if (currentStepData) {
      // While stepping, show MST edges accepted *so far*
      return currentStepData.mst || [];
    }
    // After stepping finishes, show all MST edges
    return algoResult.mst;
  }, [algoResult, currentStepData]);

  const highlightedEdges = useMemo(() => {
    // Highlight the edge currently being considered
    if (currentStepData && currentStepData.edge) {
      return [currentStepData.edge];
    }
    return [];
  }, [currentStepData]);

  // Calculate costs
  const fullNetworkCost = useMemo(() => {
    return baseEdges.filter(e => !e.blocked).reduce((sum, e) => sum + e.w, 0);
  }, [baseEdges]);
  
  const currentMstCost = currentStepData?.totalCost ?? algoResult?.totalCost ?? 0;
  const savings = algoResult && !currentStepData ? fullNetworkCost - currentMstCost : 0;
  const savingsPercent = fullNetworkCost > 0 ? Math.round((savings / fullNetworkCost) * 100) : 0;

  return (
    <div className="page-layout">
      <div className="map-section">
        <div className="map-overlay-instructions">
          Click roads to toggle them out of consideration
        </div>
        <CityMap 
          nodes={nodes}
          edges={baseEdges}
          mstEdges={mstEdges}
          highlightedEdges={highlightedEdges}
          onNodeDragEnd={updateNodePos}
          onEdgeClick={(e) => {
            toggleBlockEdge(e.u, e.v);
            if (algoResult) setAlgoResult(null); // Clear result if graph changes
          }}
        />
      </div>

      <div className="panel-section">
        <div className="panel-header">
          <Navigation className="panel-icon text-green" />
          <h2>Infrastructure Planner</h2>
        </div>

        <p className="description-text">
          Uses Kruskal's Algorithm (with DSU) to find the Minimum Spanning Tree (MST). 
          Calculates the absolute cheapest way to lay pipes, cables, or roads to connect every zone.
        </p>

        <button className="btn btn-primary w-full mb-4" onClick={handleRunAlgorithm}>
          Calculate Minimum Network
        </button>

        {algoResult && (
          <>
            <div className="card cost-card mb-4">
              <div className="cost-row">
                <span>Full Network Cost:</span>
                <span className="cost-val">{fullNetworkCost} M</span>
              </div>
              <div className="cost-row highlighted">
                <span>Optimized (MST) Cost:</span>
                <span className="cost-val text-green">{currentMstCost} M</span>
              </div>
              
              {!currentStepData && (
                <div className="savings-badge">
                  Saved {savings} M ({savingsPercent}%)
                </div>
              )}
            </div>

            <StepPlayer 
              currentStep={currentStep}
              totalSteps={totalSteps}
              isPlaying={isPlaying}
              speed={speed}
              onPlay={play}
              onPause={pause}
              onNext={next}
              onPrev={prev}
              onReset={reset}
              onSpeedChange={setSpeed}
              currentStepData={currentStepData}
            />
            
            {currentStepData && currentStepData.type && (
              <div className={`edge-status-card ${currentStepData.type}`}>
                <div className="status-indicator"></div>
                <span>
                  {currentStepData.type === 'consider' && 'Analyzing edge...'}
                  {currentStepData.type === 'accept' && 'Edge accepted! (No cycle formed)'}
                  {currentStepData.type === 'reject' && 'Edge rejected! (Forms a cycle)'}
                </span>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Infrastructure;

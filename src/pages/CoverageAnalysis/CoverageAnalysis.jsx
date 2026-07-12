import { useState, useMemo } from 'react';
import CityMap from '../../components/CityMap/CityMap';
import StepPlayer from '../../components/StepPlayer/StepPlayer';
import { useGraph } from '../../hooks/useGraph';
import { useAlgorithm } from '../../hooks/useAlgorithm';
import { floydWarshall } from '../../algorithms/floydWarshall';
import { Network, TrendingUp } from 'lucide-react';
import './CoverageAnalysis.css';

const CoverageAnalysis = () => {
  const { nodes, edges, updateNodePos } = useGraph();
  const [algoResult, setAlgoResult] = useState(null);
  
  const { 
    currentStep, isPlaying, speed, setSpeed, 
    play, pause, next, prev, reset, totalSteps, currentStepData 
  } = useAlgorithm(algoResult?.snapshots || []);

  const handleRunAnalysis = () => {
    const result = floydWarshall(nodes, edges);
    setAlgoResult(result);
    reset();
  };

  // Determine what to highlight on the map
  const activeMatrix = currentStepData ? currentStepData.matrix : algoResult?.matrix;
  
  // Calculate node coverage scores (average distance to all other nodes)
  const coverageScores = useMemo(() => {
    if (!activeMatrix || !algoResult) return {};
    const scores = {};
    const ids = algoResult.nodeIds;
    const n = ids.length;
    
    ids.forEach((id, i) => {
      let sum = 0;
      let reachableCount = 0;
      for (let j = 0; j < n; j++) {
        if (i !== j && activeMatrix[i][j] !== Infinity) {
          sum += activeMatrix[i][j];
          reachableCount++;
        }
      }
      scores[id] = reachableCount > 0 ? (sum / reachableCount).toFixed(1) : '∞';
    });
    return scores;
  }, [activeMatrix, algoResult]);

  // Find the best zone for a new facility (lowest average distance to everywhere)
  const bestZoneId = useMemo(() => {
    if (!algoResult || currentStepData) return null;
    let best = null;
    let minScore = Infinity;
    
    Object.entries(coverageScores).forEach(([id, score]) => {
      const node = nodes.find(n => n.id === Number(id));
      if (node && node.type === 'zone' && score !== '∞' && Number(score) < minScore) {
        minScore = Number(score);
        best = node;
      }
    });
    return best;
  }, [coverageScores, nodes, algoResult, currentStepData]);

  const highlightedNodes = useMemo(() => {
    if (currentStepData && currentStepData.k >= 0) {
      return [currentStepData.viaNode];
    }
    if (!currentStepData && bestZoneId) {
      return [bestZoneId.id]; // highlight best zone in final result
    }
    return [];
  }, [currentStepData, bestZoneId]);

  return (
    <div className="page-layout">
      <div className="map-section">
        {/* We can pass coverage scores to map later if we want heat overlays, but for now we'll just show them in the table */}
        <CityMap 
          nodes={nodes}
          edges={edges}
          highlightedNodes={highlightedNodes}
          onNodeDragEnd={updateNodePos}
        />
      </div>

      <div className="panel-section wide-panel">
        <div className="panel-header">
          <Network className="panel-icon text-purple" />
          <h2>City Coverage Analysis</h2>
        </div>

        <p className="description-text">
          Uses Floyd-Warshall to compute the shortest paths between <b>all</b> pairs of zones simultaneously. 
          Useful for deciding where to place new central facilities.
        </p>

        <button className="btn btn-primary w-full mb-4" onClick={handleRunAnalysis}>
          Run Full Analysis
        </button>

        {algoResult && (
          <>
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

            {!currentStepData && bestZoneId && (
              <div className="card suggestion-card mt-4">
                <div className="suggestion-header">
                  <TrendingUp className="text-purple" />
                  <h4>Optimal New Facility Location</h4>
                </div>
                <p>
                  Based on network centrality, <b>{bestZoneId.label}</b> is the best location for a new hospital or fire station. 
                  It has the lowest average distance ({coverageScores[bestZoneId.id]} km) to all other reachable zones.
                </p>
              </div>
            )}

            {activeMatrix && (
              <div className="matrix-container mt-4">
                <h4>Distance Matrix (km)</h4>
                <div className="table-scroll">
                  <table className="matrix-table">
                    <thead>
                      <tr>
                        <th>To →<br/>From ↓</th>
                        {algoResult.nodeIds.map(id => (
                          <th key={`col-${id}`} title={nodes.find(n=>n.id===id)?.label}>
                            {nodes.find(n=>n.id===id)?.label.split('(')[0].trim() || id}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {algoResult.nodeIds.map((rowId, i) => (
                        <tr key={`row-${rowId}`}>
                          <th title={nodes.find(n=>n.id===rowId)?.label}>
                            {nodes.find(n=>n.id===rowId)?.label.split('(')[0].trim() || rowId}
                          </th>
                          {algoResult.nodeIds.map((colId, j) => {
                            const val = activeMatrix[i][j];
                            const isInfinity = val === Infinity;
                            return (
                              <td key={`cell-${rowId}-${colId}`} className={isInfinity ? 'inf-cell' : ''}>
                                {isInfinity ? '∞' : val}
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default CoverageAnalysis;

import { useState, useMemo } from 'react';
import CityMap from '../../components/CityMap/CityMap';
import StepPlayer from '../../components/StepPlayer/StepPlayer';
import { useGraph } from '../../hooks/useGraph';
import { useAlgorithm } from '../../hooks/useAlgorithm';
import { bellmanFord } from '../../algorithms/bellmanFord';
import { ShieldAlert, Info } from 'lucide-react';
import './TrafficReroute.css';

const TrafficReroute = () => {
  const { nodes, edges, updateNodePos, toggleBlockEdge } = useGraph();
  
  const [sourceId, setSourceId] = useState(nodes[0]?.id || 0);
  const [algoResult, setAlgoResult] = useState(null);

  // Use base edges without live traffic for reroute planning (focusing on blocked roads)
  const baseEdges = useMemo(() => edges.map(e => ({
    ...e,
    w: e.originalW !== undefined ? e.originalW : e.w
  })), [edges]);

  
  const { 
    currentStep, isPlaying, speed, setSpeed, 
    play, pause, next, prev, reset, totalSteps, currentStepData 
  } = useAlgorithm(algoResult?.steps || []);

  const handleRunAlgorithm = () => {
    const result = bellmanFord(nodes, baseEdges, sourceId);
    setAlgoResult(result);
    reset();
  };

  const highlightedEdges = useMemo(() => {
    if (!algoResult) return [];
    
    // During animation
    if (currentStepData && currentStep < totalSteps - 1) {
      if (currentStepData.type === 'relax') {
        return [currentStepData.edge];
      }
      return [];
    }
    
    // When finished or not started, show the final shortest path tree
    const treeEdges = [];
    if (algoResult.previous) {
      Object.keys(algoResult.previous).forEach(nodeId => {
        const predId = algoResult.previous[nodeId];
        if (predId !== null) {
          const edge = baseEdges.find(e => 
            (e.u === Number(predId) && e.v === Number(nodeId)) || 
            (e.u === Number(nodeId) && e.v === Number(predId))
          );
          if (edge) treeEdges.push(edge);
        }
      });
    }
    return treeEdges;
  }, [algoResult, currentStepData, currentStep, totalSteps, baseEdges]);

  const unreachableZones = useMemo(() => {
    if (!algoResult) return [];
    // Only show unreachable zones before playing or after finishing
    if (currentStep >= 0 && currentStep < totalSteps - 1) return [];
    return nodes.filter(n => algoResult.distances[n.id] === Infinity);
  }, [algoResult, nodes, currentStep, totalSteps]);

  return (
    <div className="page-layout">
      <div className="map-section">
        <div className="map-overlay-instructions">
          <Info size={16} /> Click any road to toggle block/unblock
        </div>
        <CityMap 
          nodes={nodes}
          edges={baseEdges}
          highlightedEdges={highlightedEdges}
          onNodeDragEnd={updateNodePos}
          onEdgeClick={(e) => {
            toggleBlockEdge(e.u, e.v);
          }}
        />
      </div>

      <div className="panel-section">
        <div className="panel-header">
          <ShieldAlert className="panel-icon text-orange" />
          <h2>Traffic Rerouting</h2>
        </div>
        
        <p className="description-text">
          Use Bellman-Ford to recalculate paths when roads are closed (blocked). 
          It can also detect negative cycles if expressways create impossible time-loops.
        </p>

        <div className="card control-card">
          <div className="input-group">
            <label>Dispatch Center (Source)</label>
            <select value={sourceId} onChange={e => {
              setSourceId(Number(e.target.value));
              setAlgoResult(null);
            }}>
              {nodes.map(n => <option key={n.id} value={n.id}>{n.label}</option>)}
            </select>
          </div>

          <button className="btn btn-primary w-full mt-4" onClick={handleRunAlgorithm}>
            Calculate Routes
          </button>
        </div>

        {algoResult && (
          <>
            {algoResult.hasNegativeCycle && (
              <div className="alert-error negative-cycle-alert">
                <strong>⚠️ Negative Cycle Detected!</strong>
                <p>Some road discounts create an infinite loop. Routing impossible.</p>
              </div>
            )}

            {unreachableZones.length > 0 && (
              <div className="card alert-warning mt-4">
                <h4>Isolated Zones</h4>
                <p>The following zones cannot be reached from the dispatch center:</p>
                <div className="path-tags mt-2">
                  {unreachableZones.map(z => (
                    <span key={z.id} className="path-tag error-tag">{z.label.split('(')[0].trim()}</span>
                  ))}
                </div>
              </div>
            )}

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
          </>
        )}
      </div>
    </div>
  );
};

export default TrafficReroute;

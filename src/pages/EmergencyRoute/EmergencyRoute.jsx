import { useState, useMemo, useCallback, useEffect } from 'react';
import CityMap from '../../components/CityMap/CityMap';
import StepPlayer from '../../components/StepPlayer/StepPlayer';
import { useGraph } from '../../hooks/useGraph';
import { useAlgorithm } from '../../hooks/useAlgorithm';
import { dijkstra } from '../../algorithms/dijkstra';
import { Activity, MapPin, Clock } from 'lucide-react';
import './EmergencyRoute.css';

const EmergencyRoute = () => {
  const { 
    nodes, edges, updateNodePos, 
    addNode, addEdge, removeNode, removeEdge, clearAll,
    isTrafficActive, toggleTraffic,
    emergencySourceId, setEmergencySourceId,
    emergencyTargetId, setEmergencyTargetId,
    emergencyResolvedTargetId, setEmergencyResolvedTargetId,
    emergencyAlgoResult, setEmergencyAlgoResult
  } = useGraph();
  
  const sourceId = emergencySourceId !== null ? emergencySourceId : (nodes[0]?.id || 0);
  const setSourceId = setEmergencySourceId;
  const targetId = emergencyTargetId;
  const setTargetId = setEmergencyTargetId;
  const resolvedTargetId = emergencyResolvedTargetId;
  const setResolvedTargetId = setEmergencyResolvedTargetId;
  const algoResult = emergencyAlgoResult;
  const setAlgoResult = setEmergencyAlgoResult;
  
  const { 
    currentStep, isPlaying, speed, setSpeed, 
    play, pause, next, prev, reset, totalSteps, currentStepData 
  } = useAlgorithm(algoResult?.steps || []);

  const handleRunAlgorithm = useCallback(() => {
    if (nodes.length === 0) return; // avoid crash if graph is empty
    const result = dijkstra(nodes, edges, sourceId);
    
    let actualTargetId = targetId;
    if (targetId === 'nearest-hospital') {
      let minDistance = Infinity;
      let nearestId = null;
      nodes.filter(n => n.type === 'hospital').forEach(h => {
        if (result.distances[h.id] < minDistance) {
          minDistance = result.distances[h.id];
          nearestId = h.id;
        }
      });
      if (nearestId !== null) actualTargetId = nearestId;
    } else if (targetId === 'nearest-fire') {
      let minDistance = Infinity;
      let nearestId = null;
      nodes.filter(n => n.type === 'fire').forEach(f => {
        if (result.distances[f.id] < minDistance) {
          minDistance = result.distances[f.id];
          nearestId = f.id;
        }
      });
      if (nearestId !== null) actualTargetId = nearestId;
    }

    setResolvedTargetId(actualTargetId);
    setAlgoResult(result);
  }, [nodes, edges, sourceId, targetId]);

  // Handle manual run (resets animation)
  const handleManualRun = () => {
    handleRunAlgorithm();
    reset();
  };

  // Live recalculation for traffic
  useEffect(() => {
    if (isTrafficActive && algoResult) {
      handleRunAlgorithm();
    }
  }, [edges, isTrafficActive]); // recalculate when edges change during traffic

  // Determine what to highlight based on current step or final result
  const highlightedNodes = useMemo(() => {
    if (!algoResult) return [];
    if (currentStepData) {
      if (currentStepData.type === 'visit') return [currentStepData.node];
      if (currentStepData.type === 'relax') return [currentStepData.edge.u, currentStepData.edge.v];
    }
    // If not stepping, highlight final path nodes
    return algoResult.getPath(resolvedTargetId);
  }, [algoResult, currentStepData, resolvedTargetId]);

  const highlightedEdges = useMemo(() => {
    if (!algoResult) return [];
    if (currentStepData && currentStepData.type === 'relax') {
      return [currentStepData.edge];
    }
    
    // If not stepping, highlight final path edges
    if (!currentStepData || currentStep >= totalSteps - 1) {
      const path = algoResult.getPath(resolvedTargetId);
      const pathEdges = [];
      for (let i = 0; i < path.length - 1; i++) {
        const u = path[i];
        const v = path[i+1];
        const edge = edges.find(e => (e.u === u && e.v === v) || (e.u === v && e.v === u));
        if (edge) pathEdges.push(edge);
      }
      return pathEdges;
    }
    return [];
  }, [algoResult, currentStepData, currentStep, totalSteps, resolvedTargetId, edges]);

  const finalPath = algoResult ? algoResult.getPath(resolvedTargetId) : [];
  const finalDistance = algoResult ? algoResult.distances[resolvedTargetId] : Infinity;

  return (
    <div className="page-layout">
      <div className="map-section">
        <CityMap 
          nodes={nodes}
          edges={edges}
          highlightedNodes={highlightedNodes}
          highlightedEdges={highlightedEdges}
          onNodeDragEnd={updateNodePos}
          onAddNode={addNode}
          onAddEdge={addEdge}
          onRemoveNode={removeNode}
          onRemoveEdge={removeEdge}
          onClearAll={clearAll}
          onNodeClick={(n) => {
            // Quick set target on click
            setTargetId(n.id);
            setAlgoResult(null);
          }}
        />
      </div>

      <div className="panel-section">
        <div className="panel-header">
          <Activity className="panel-icon text-cyan" />
          <h2>Emergency Routing</h2>
        </div>

        <div className="card control-card">
          <div className="input-group">
            <label>Emergency Location (From)</label>
            <select value={sourceId} onChange={e => {
              setSourceId(Number(e.target.value));
              setAlgoResult(null);
            }}>
              {nodes.map(n => <option key={n.id} value={n.id}>{n.label}</option>)}
            </select>
          </div>

          <div className="input-group">
            <label>Destination (To)</label>
            <select 
              value={targetId} 
              onChange={e => {
                const val = e.target.value;
                setTargetId(val === 'nearest-hospital' || val === 'nearest-fire' ? val : Number(val));
                setAlgoResult(null);
              }}
            >
              <optgroup label="Smart Routing">
                <option value="nearest-hospital">Nearest Hospital</option>
                <option value="nearest-fire">Nearest Fire Station</option>
              </optgroup>
              <optgroup label="Specific Zones">
                {nodes.map(n => <option key={n.id} value={n.id}>{n.label}</option>)}
              </optgroup>
            </select>
          </div>

          <div className="traffic-toggle-group">
            <label className="toggle-label">
              <span className={isTrafficActive ? 'text-red' : ''}>
                ● Live Traffic
              </span>
              <input 
                type="checkbox" 
                checked={isTrafficActive} 
                onChange={toggleTraffic} 
              />
            </label>
          </div>

          <button className="btn-find-route" onClick={handleManualRun}>
            🚨 Find Fastest Route
          </button>
        </div>

        {algoResult && (
          <>
            <div className="card results-card">
              <h3>Route Summary</h3>
              
              {finalDistance === Infinity ? (
                <div className="alert-error">
                  No path exists between these locations.
                </div>
              ) : (
                <>
                  <div className="stats-grid">
                    <div className="stat-box">
                      <MapPin className="stat-icon" />
                      <div className="stat-val">{finalDistance} km</div>
                      <div className="stat-label">Distance</div>
                    </div>
                    <div className="stat-box">
                      <Clock className="stat-icon" />
                      <div className="stat-val">{finalDistance * 3} min</div>
                      <div className="stat-label">Est. Time</div>
                    </div>
                  </div>

                  <div className="route-list">
                    <h4>Path:</h4>
                    <div className="path-tags">
                      {finalPath.map((nodeId, idx) => {
                        const nodeLabel = nodes.find(n => n.id === nodeId)?.label || '';
                        const formattedLabel = nodeLabel.split('(')[0].trim();
                        return (
                          <span key={idx} className="path-tag">
                            {formattedLabel}
                            {idx < finalPath.length - 1 && <span className="arrow">→</span>}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                </>
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
          </>
        )}
      </div>
    </div>
  );
};

export default EmergencyRoute;

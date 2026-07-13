import React, { createContext, useState, useCallback, useEffect } from 'react';
import { defaultCity } from '../data/defaultCity';

export const GraphContext = createContext();

const LOCAL_STORAGE_KEY = 'cityroute_graph_data';

export const GraphProvider = ({ children }) => {
  const [nodes, setNodes] = useState(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.nodes && parsed.nodes.length > 0) {
          return parsed.nodes;
        }
      } catch (e) {
        console.error("Failed to parse local storage", e);
      }
    }
    return defaultCity.nodes;
  });

  const [edges, setEdges] = useState(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.edges && parsed.edges.length > 0) {
          return parsed.edges;
        }
      } catch (e) {
        console.error("Failed to parse local storage", e);
      }
    }
    return defaultCity.edges.map(e => ({...e, blocked: false, originalW: e.w}));
  });

  const [isTrafficActive, setIsTrafficActive] = useState(false);

  // Emergency Routing persistent state
  const [emergencySourceId, setEmergencySourceId] = useState(null);
  const [emergencyTargetId, setEmergencyTargetId] = useState('nearest-hospital');
  const [emergencyResolvedTargetId, setEmergencyResolvedTargetId] = useState(null);
  const [emergencyAlgoResult, setEmergencyAlgoResult] = useState(null);

  // Sync to local storage on change
  useEffect(() => {
    // Only save the structural data, don't save traffic state so it resets on load
    const edgesToSave = edges.map(e => ({
      ...e,
      w: e.originalW !== undefined ? e.originalW : e.w // save original weight
    }));
    
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify({
      nodes,
      edges: edgesToSave
    }));
  }, [nodes, edges]);

  const resetToDefault = useCallback(() => {
    setNodes(defaultCity.nodes);
    setEdges(defaultCity.edges.map(e => ({...e, blocked: false, originalW: e.w})));
    setIsTrafficActive(false);
  }, []);

  const clearAll = useCallback(() => {
    setNodes([]);
    setEdges([]);
  }, []);

  const addNode = useCallback((node) => {
    setNodes(prev => [...prev, { ...node, id: Date.now() }]);
  }, []);

  const updateNodePos = useCallback((id, x, y) => {
    setNodes(prev => prev.map(n => n.id === id ? { ...n, x, y } : n));
  }, []);

  const addEdge = useCallback((u, v, w) => {
    const exists = edges.some(e => (e.u === u && e.v === v) || (e.u === v && e.v === u));
    if (!exists) {
      setEdges(prev => [...prev, { u, v, w, originalW: w, blocked: false }]);
    }
  }, [edges]);

  const toggleBlockEdge = useCallback((u, v) => {
    setEdges(prev => prev.map(e => {
      if ((e.u === u && e.v === v) || (e.u === v && e.v === u)) {
        return { ...e, blocked: !e.blocked };
      }
      return e;
    }));
  }, []);

  const removeEdge = useCallback((u, v) => {
    setEdges(prev => prev.filter(e => !((e.u === u && e.v === v) || (e.u === v && e.v === u))));
  }, []);

  const removeNode = useCallback((id) => {
    setNodes(prev => prev.filter(n => n.id !== id));
    setEdges(prev => prev.filter(e => e.u !== id && e.v !== id));
  }, []);

  const toggleTraffic = useCallback(() => {
    setIsTrafficActive(prev => {
      const nextActive = !prev;
      
      if (nextActive) {
        setEdges(currentEdges => 
          currentEdges.map(e => {
            if (Math.random() < 0.4 && !e.blocked) {
              const trafficWeight = Math.floor(e.originalW * 3 + Math.random() * 20);
              return { ...e, w: trafficWeight };
            }
            return e;
          })
        );
      } else {
        setEdges(currentEdges => 
          currentEdges.map(e => ({ ...e, w: e.originalW }))
        );
      }
      
      return nextActive;
    });
  }, []);

  return (
    <GraphContext.Provider value={{
      nodes, edges, isTrafficActive, toggleTraffic,
      addNode, updateNodePos, removeNode,
      addEdge, toggleBlockEdge, removeEdge,
      resetToDefault, clearAll,
      emergencySourceId, setEmergencySourceId,
      emergencyTargetId, setEmergencyTargetId,
      emergencyResolvedTargetId, setEmergencyResolvedTargetId,
      emergencyAlgoResult, setEmergencyAlgoResult
    }}>
      {children}
    </GraphContext.Provider>
  );
};

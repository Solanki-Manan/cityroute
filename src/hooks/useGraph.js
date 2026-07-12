import { useState, useCallback, useEffect, useRef } from 'react';
import { defaultCity } from '../data/defaultCity';

export function useGraph() {
  const [nodes, setNodes] = useState(defaultCity.nodes);
  const [edges, setEdges] = useState(defaultCity.edges.map(e => ({...e, blocked: false, originalW: e.w})));
  const [isTrafficActive, setIsTrafficActive] = useState(false);
  const trafficTimer = useRef(null);
  
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
    // Check if edge already exists
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

  // Traffic Engine (One-time generation)
  const toggleTraffic = useCallback(() => {
    setIsTrafficActive(prev => {
      const nextActive = !prev;
      
      if (nextActive) {
        // Generate static traffic once when turned on
        setEdges(currentEdges => 
          currentEdges.map(e => {
            // 40% chance an edge gets heavy traffic
            if (Math.random() < 0.4 && !e.blocked) {
              // Increase weight heavily to simulate severe traffic
              const trafficWeight = Math.floor(e.originalW * 3 + Math.random() * 20);
              return { ...e, w: trafficWeight };
            }
            return e;
          })
        );
      } else {
        // Revert traffic when turned off
        setEdges(currentEdges => 
          currentEdges.map(e => ({ ...e, w: e.originalW }))
        );
      }
      
      return nextActive;
    });
  }, []);

  return {
    nodes, edges, isTrafficActive, toggleTraffic,
    addNode, updateNodePos, removeNode,
    addEdge, toggleBlockEdge, removeEdge,
    resetToDefault, clearAll
  };
}

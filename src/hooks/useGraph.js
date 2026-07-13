import { useContext } from 'react';
import { GraphContext } from '../context/GraphContext';

export function useGraph() {
  const context = useContext(GraphContext);
  if (!context) {
    throw new Error('useGraph must be used within a GraphProvider');
  }
  return context;
}

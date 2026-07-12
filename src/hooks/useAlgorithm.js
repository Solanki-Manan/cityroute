import { useState, useRef, useCallback } from 'react';

export function useAlgorithm(steps) {
  const [currentStep, setCurrentStep] = useState(-1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  const timerRef = useRef(null);

  const play = useCallback(() => {
    if (steps.length === 0) return;
    setIsPlaying(true);
    const interval = 1200 / speed;
    timerRef.current = setInterval(() => {
      setCurrentStep(prev => {
        if (prev >= steps.length - 1) {
          clearInterval(timerRef.current);
          setIsPlaying(false);
          return prev;
        }
        return prev + 1;
      });
    }, interval);
  }, [steps.length, speed]);

  const pause = useCallback(() => {
    clearInterval(timerRef.current);
    setIsPlaying(false);
  }, []);

  const next = useCallback(() => {
    setCurrentStep(p => Math.min(p + 1, steps.length - 1));
  }, [steps.length]);

  const prev = useCallback(() => {
    setCurrentStep(p => Math.max(p - 1, 0));
  }, []);

  const reset = useCallback(() => {
    pause();
    setCurrentStep(-1);
  }, [pause]);

  return { 
    currentStep, 
    isPlaying, 
    speed, 
    setSpeed, 
    play, 
    pause, 
    next, 
    prev, 
    reset,
    totalSteps: steps.length, 
    currentStepData: currentStep >= 0 ? steps[currentStep] : null 
  };
}

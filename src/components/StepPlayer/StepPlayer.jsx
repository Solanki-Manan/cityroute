import { Play, Pause, SkipBack, SkipForward, RotateCcw } from 'lucide-react';
import './StepPlayer.css';

const StepPlayer = ({ 
  currentStep, totalSteps, isPlaying, speed, 
  onPlay, onPause, onNext, onPrev, onReset, onSpeedChange,
  currentStepData
}) => {
  return (
    <div className="step-player card">
      <div className="step-header">
        <h4 className="step-title">Algorithm Steps</h4>
        <span className="step-counter">
          {currentStep >= 0 ? currentStep + 1 : 0} / {totalSteps}
        </span>
      </div>
      
      {currentStepData && (
        <div className="step-description">
          <p>{currentStepData.description}</p>
        </div>
      )}

      <div className="player-controls">
        <button className="ctrl-btn" onClick={onReset} disabled={currentStep < 0} title="Reset">
          <RotateCcw size={18} />
        </button>
        <button className="ctrl-btn" onClick={onPrev} disabled={currentStep <= 0} title="Previous Step">
          <SkipBack size={18} />
        </button>
        
        {isPlaying ? (
          <button className="ctrl-btn play-btn" onClick={onPause} title="Pause">
            <Pause size={20} />
          </button>
        ) : (
          <button className="ctrl-btn play-btn" onClick={onPlay} disabled={currentStep >= totalSteps - 1} title="Play">
            <Play size={20} />
          </button>
        )}
        
        <button className="ctrl-btn" onClick={onNext} disabled={currentStep >= totalSteps - 1} title="Next Step">
          <SkipForward size={18} />
        </button>
      </div>

      <div className="speed-control">
        <label>Speed: {speed}x</label>
        <input 
          type="range" 
          min="0.5" max="3" step="0.5" 
          value={speed} 
          onChange={(e) => onSpeedChange(parseFloat(e.target.value))} 
        />
      </div>
    </div>
  );
};

export default StepPlayer;

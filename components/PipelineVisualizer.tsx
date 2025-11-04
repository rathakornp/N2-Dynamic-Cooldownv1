import React, { useEffect, useRef } from 'react';

interface PipelineVisualizerProps {
  filledPercentage: number;
  pipeLength: number;
  pipeOD: number;
  theme: 'light' | 'dark';
  totalTimeHours: number;
  onTimeChange: (time: number) => void;
  isPlaying: boolean;
  setIsPlaying: (playing: boolean) => void;
  currentTime: number;
  setCurrentTime: (time: number) => void;
}

const PipelineVisualizer: React.FC<PipelineVisualizerProps> = ({
  filledPercentage,
  pipeLength,
  pipeOD,
  theme,
  totalTimeHours,
  onTimeChange,
  isPlaying,
  setIsPlaying,
  currentTime,
  setCurrentTime,
}) => {
  const animationFrameId = useRef<number | null>(null);
  const lastTimeRef = useRef<number | null>(null);

  useEffect(() => {
    const animate = (timestamp: number) => {
      if (lastTimeRef.current === null) {
        lastTimeRef.current = timestamp;
      }
      const deltaTime = (timestamp - lastTimeRef.current) / 1000; // in seconds

      lastTimeRef.current = timestamp;

      if (isPlaying) {
        // The animation speed is independent of frame rate. 
        // We advance time by the real elapsed time.
        let newTime = currentTime + deltaTime;
        if (newTime >= totalTimeHours) {
          newTime = totalTimeHours;
          setIsPlaying(false);
        }
        setCurrentTime(newTime);
        onTimeChange(newTime);
        animationFrameId.current = requestAnimationFrame(animate);
      }
    };

    if (isPlaying) {
      lastTimeRef.current = null; // Reset time tracking on play
      animationFrameId.current = requestAnimationFrame(animate);
    } else {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    }

    return () => {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, [isPlaying, currentTime, totalTimeHours, setCurrentTime, onTimeChange, setIsPlaying]);

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = parseFloat(e.target.value);
    setCurrentTime(newTime);
    onTimeChange(newTime);
  };
  
  const handlePlayPause = () => {
      if (currentTime >= totalTimeHours) {
          setCurrentTime(0);
          onTimeChange(0);
          setIsPlaying(true);
      } else {
          setIsPlaying(!isPlaying);
      }
  };

  const pipeHeight = Math.max(20, pipeOD / 10); // Simple scaling for visualization
  const strokeColor = theme === 'dark' ? '#64748B' : '#94A3B8';
  const lngColor = theme === 'dark' ? '#7DD3FC' : '#0EA5E9';
  const n2Color = 'transparent';
  
  const formattedTime = (timeInHours: number) => {
      if (isNaN(timeInHours) || timeInHours < 0) return '00:00:00';
      const totalSeconds = timeInHours * 3600;
      const hours = Math.floor(totalSeconds / 3600);
      const minutes = Math.floor((totalSeconds % 3600) / 60);
      const seconds = Math.floor(totalSeconds % 60);
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="bg-gray-50 dark:bg-slate-900/50 p-6 rounded-lg shadow-inner space-y-4">
      <h3 className="text-md font-semibold text-gray-800 dark:text-slate-100 text-center">LNG Filling Visualizer</h3>
      
      {/* Pipe Visualization */}
      <div className="w-full">
        <svg width="100%" height={pipeHeight} viewBox={`0 0 ${pipeLength} ${pipeHeight}`} preserveAspectRatio="none">
          {/* LNG fill */}
          <rect x="0" y="0" width={(filledPercentage / 100) * pipeLength} height={pipeHeight} fill={lngColor} />
          {/* N2 remaining */}
          <rect x={(filledPercentage / 100) * pipeLength} y="0" width={pipeLength - ((filledPercentage / 100) * pipeLength)} height={pipeHeight} fill={n2Color} />
          {/* Pipe outline */}
          <rect x="0" y="0" width={pipeLength} height={pipeHeight} fill="none" stroke={strokeColor} strokeWidth="2" />
        </svg>
        <div className="flex justify-between text-xs text-gray-500 dark:text-slate-400 mt-1">
          <span>Inlet (0m)</span>
          <span>{`Length: ${pipeLength.toFixed(0)}m`}</span>
          <span>Outlet</span>
        </div>
      </div>

      {/* Playback Controls */}
      <div className="flex items-center gap-4">
        <button onClick={handlePlayPause} className="p-2 rounded-full text-gray-600 dark:text-slate-300 hover:bg-gray-200 dark:hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:focus:ring-offset-slate-800 transition-colors">
          {isPlaying ? (
             <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
          ) : currentTime >= totalTimeHours && totalTimeHours > 0 ? (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h5M20 12A8 8 0 1013.2 5.2" />
            </svg>
          ) : (
             <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" /></svg>
          )}
        </button>
        <span className="text-sm font-mono text-gray-700 dark:text-slate-200">{formattedTime(currentTime)}</span>
        <input
          type="range"
          min="0"
          max={totalTimeHours > 0 ? totalTimeHours : 1}
          step={totalTimeHours > 0 ? totalTimeHours / 1000 : 0.001}
          value={currentTime}
          onChange={handleSliderChange}
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
        />
        <span className="text-sm font-mono text-gray-700 dark:text-slate-200">{formattedTime(totalTimeHours)}</span>
      </div>
    </div>
  );
};

export default PipelineVisualizer;

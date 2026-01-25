
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Play, Pause, RotateCcw, Flag } from 'lucide-react';
import { formatTime } from '../utils/formatTime';
import { Lap } from '../types';

interface StopwatchProps {
  isDarkMode: boolean;
}

const Stopwatch: React.FC<StopwatchProps> = ({ isDarkMode }) => {
  const [time, setTime] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [laps, setLaps] = useState<Lap[]>([]);
  
  const timerRef = useRef<number | null>(null);
  const startTimeRef = useRef(0);
  const pausedTimeRef = useRef(0);
  const lapListRef = useRef<HTMLDivElement>(null);

  const start = useCallback(() => {
    if (isRunning) return;
    setIsRunning(true);
    startTimeRef.current = Date.now() - pausedTimeRef.current;
    
    timerRef.current = window.setInterval(() => {
      setTime(Date.now() - startTimeRef.current);
    }, 10);

    if (navigator.vibrate) navigator.vibrate(10);
  }, [isRunning]);

  const pause = useCallback(() => {
    if (!isRunning) return;
    setIsRunning(false);
    pausedTimeRef.current = Date.now() - startTimeRef.current;
    if (timerRef.current) clearInterval(timerRef.current);
  }, [isRunning]);

  const reset = useCallback(() => {
    setIsRunning(false);
    if (timerRef.current) clearInterval(timerRef.current);
    setTime(0);
    pausedTimeRef.current = 0;
    setLaps([]);
  }, []);

  const addLap = useCallback(() => {
    const lapTime = time;
    const lastLapTime = laps.length > 0 ? laps[0].time : 0;
    const newLap: Lap = {
      id: laps.length + 1,
      time: lapTime,
      duration: lapTime - lastLapTime
    };
    setLaps([newLap, ...laps]);
    
    // Auto scroll lap list to top
    if (lapListRef.current) {
      lapListRef.current.scrollTop = 0;
    }
    if (navigator.vibrate) navigator.vibrate(20);
  }, [time, laps]);

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        e.preventDefault();
        isRunning ? pause() : start();
      } else if (e.code === 'KeyR') {
        reset();
      } else if (e.code === 'KeyL') {
        addLap();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isRunning, start, pause, reset, addLap]);

  return (
    <div className="flex flex-col items-center">
      {/* Time Display */}
      <div className={`mono-font text-6xl font-bold mb-12 tracking-tight ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
        {formatTime(time)}
      </div>

      {/* Main Controls */}
      <div className="flex gap-4 mb-10 w-full justify-center">
        <button
          onClick={isRunning ? pause : start}
          className={`flex-1 flex items-center justify-center gap-2 py-4 rounded-2xl font-bold transition-all transform active:scale-95 shadow-xl ${
            isRunning 
            ? 'bg-amber-500 hover:bg-amber-600 text-white shadow-amber-500/25' 
            : 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-600/25'
          }`}
        >
          {isRunning ? <Pause fill="currentColor" /> : <Play fill="currentColor" />}
          {isRunning ? 'Pause' : 'Start'}
        </button>
        
        <button
          onClick={addLap}
          disabled={!isRunning && time === 0}
          className={`px-6 py-4 rounded-2xl font-bold transition-all transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed ${
            isDarkMode ? 'bg-white/5 hover:bg-white/10' : 'bg-gray-100 hover:bg-gray-200'
          }`}
        >
          <Flag className="w-5 h-5" />
        </button>

        <button
          onClick={reset}
          disabled={time === 0}
          className={`px-6 py-4 rounded-2xl font-bold transition-all transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed ${
            isDarkMode ? 'bg-white/5 hover:bg-white/10' : 'bg-gray-100 hover:bg-gray-200 text-red-500'
          }`}
        >
          <RotateCcw className="w-5 h-5" />
        </button>
      </div>

      {/* Lap List */}
      <div className={`w-full overflow-hidden flex flex-col transition-all duration-300 ${laps.length > 0 ? 'h-48' : 'h-0 opacity-0'}`}>
        <div className={`flex justify-between px-4 py-2 text-xs font-bold uppercase tracking-widest ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
          <span>Lap</span>
          <div className="flex gap-12">
            <span>Split</span>
            <span>Total</span>
          </div>
        </div>
        <div 
          ref={lapListRef}
          className="flex-1 overflow-y-auto space-y-1 pr-2"
        >
          {laps.map((lap) => (
            <div 
              key={lap.id} 
              className={`flex justify-between items-center px-4 py-3 rounded-xl transition-all ${isDarkMode ? 'hover:bg-white/5' : 'hover:bg-gray-50'}`}
            >
              <span className={`text-sm font-bold ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                #{lap.id.toString().padStart(2, '0')}
              </span>
              <div className="flex gap-8 mono-font">
                <span className="text-sm text-blue-400">
                  +{formatTime(lap.duration, false)}
                </span>
                <span className={`text-sm font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  {formatTime(lap.time)}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Stopwatch;

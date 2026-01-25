
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Play, Pause, RotateCcw, Bell } from 'lucide-react';
import { formatTime } from '../utils/formatTime';

interface TimerProps {
  isDarkMode: boolean;
}

const Timer: React.FC<TimerProps> = ({ isDarkMode }) => {
  const [totalSeconds, setTotalSeconds] = useState(0);
  const [remainingTime, setRemainingTime] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [isSetting, setIsSetting] = useState(true);

  const [inputH, setInputH] = useState('00');
  const [inputM, setInputM] = useState('05');
  const [inputS, setInputS] = useState('00');

  const timerRef = useRef<number | null>(null);
  const alertSoundRef = useRef<HTMLAudioElement | null>(null);

  const startTimer = () => {
    if (isRunning) return;
    
    let seconds;
    if (isSetting) {
      seconds = parseInt(inputH) * 3600 + parseInt(inputM) * 60 + parseInt(inputS);
      if (seconds <= 0) return;
      setTotalSeconds(seconds);
      setRemainingTime(seconds * 1000);
      setIsSetting(false);
    } else {
      seconds = remainingTime / 1000;
    }

    setIsRunning(true);
    const startTimestamp = Date.now();
    const initialRemaining = remainingTime || (seconds * 1000);

    timerRef.current = window.setInterval(() => {
      const elapsed = Date.now() - startTimestamp;
      const nextRemaining = Math.max(0, initialRemaining - elapsed);
      setRemainingTime(nextRemaining);

      if (nextRemaining === 0) {
        handleTimerEnd();
      }
    }, 100);
  };

  const pauseTimer = () => {
    setIsRunning(false);
    if (timerRef.current) clearInterval(timerRef.current);
  };

  const resetTimer = () => {
    setIsRunning(false);
    setIsSetting(true);
    if (timerRef.current) clearInterval(timerRef.current);
    setRemainingTime(0);
    setTotalSeconds(0);
  };

  const handleTimerEnd = () => {
    setIsRunning(false);
    if (timerRef.current) clearInterval(timerRef.current);
    if (navigator.vibrate) navigator.vibrate([100, 50, 100, 50, 100]);
    
    // Create alert sound if not existing
    if (!alertSoundRef.current) {
      alertSoundRef.current = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
    }
    alertSoundRef.current.play();
  };

  const progress = totalSeconds > 0 ? (remainingTime / (totalSeconds * 1000)) : 1;
  const radius = 90;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - progress * circumference;

  const handleInputChange = (val: string, type: 'H' | 'M' | 'S') => {
    const numeric = val.replace(/\D/g, '').slice(0, 2);
    if (type === 'H') setInputH(numeric.padStart(2, '0'));
    if (type === 'M') setInputM(numeric.padStart(2, '0'));
    if (type === 'S') setInputS(numeric.padStart(2, '0'));
  };

  return (
    <div className="flex flex-col items-center">
      {isSetting ? (
        <div className="flex flex-col items-center">
          <div className="flex gap-4 mb-10">
            {[
              { label: 'H', val: inputH, set: (v: string) => handleInputChange(v, 'H') },
              { label: 'M', val: inputM, set: (v: string) => handleInputChange(v, 'M') },
              { label: 'S', val: inputS, set: (v: string) => handleInputChange(v, 'S') },
            ].map((unit) => (
              <div key={unit.label} className="flex flex-col items-center gap-2">
                <input
                  type="text"
                  value={unit.val}
                  onChange={(e) => unit.set(e.target.value)}
                  className={`w-20 py-4 text-4xl font-bold text-center rounded-2xl border-none outline-none mono-font transition-all ${
                    isDarkMode ? 'bg-white/5 text-white focus:bg-white/10' : 'bg-gray-100 text-gray-900 focus:bg-gray-200'
                  }`}
                />
                <span className="text-xs font-bold text-gray-500">{unit.label}</span>
              </div>
            ))}
          </div>
          <button
            onClick={startTimer}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-2xl shadow-xl shadow-blue-600/25 flex items-center justify-center gap-2 transition-all transform active:scale-95"
          >
            <Play fill="currentColor" size={20} />
            Start Timer
          </button>
        </div>
      ) : (
        <div className="relative flex flex-col items-center">
          {/* Progress Ring */}
          <div className="relative mb-10 w-64 h-64">
            <svg className="w-full h-full transform -rotate-90">
              <circle
                cx="128"
                cy="128"
                r={radius}
                stroke="currentColor"
                strokeWidth="8"
                fill="transparent"
                className={isDarkMode ? 'text-white/5' : 'text-gray-100'}
              />
              <circle
                cx="128"
                cy="128"
                r={radius}
                stroke="currentColor"
                strokeWidth="8"
                fill="transparent"
                strokeDasharray={circumference}
                strokeDashoffset={offset}
                strokeLinecap="round"
                className="text-blue-500 transition-all duration-100"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className={`mono-font text-5xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                {formatTime(remainingTime, false)}
              </span>
              <div className="flex items-center gap-1 text-xs font-bold text-blue-500 mt-2">
                <Bell size={12} />
                {((remainingTime / 1000) / 60).toFixed(0)}m left
              </div>
            </div>
          </div>

          <div className="flex gap-4 w-full justify-center">
            <button
              onClick={isRunning ? pauseTimer : startTimer}
              className={`flex-1 flex items-center justify-center gap-2 py-4 px-8 rounded-2xl font-bold transition-all transform active:scale-95 shadow-xl ${
                isRunning 
                ? 'bg-amber-500 hover:bg-amber-600 text-white shadow-amber-500/25' 
                : 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-600/25'
              }`}
            >
              {isRunning ? <Pause fill="currentColor" /> : <Play fill="currentColor" />}
              {isRunning ? 'Pause' : 'Resume'}
            </button>
            <button
              onClick={resetTimer}
              className={`px-6 py-4 rounded-2xl font-bold transition-all transform active:scale-95 ${
                isDarkMode ? 'bg-white/5 hover:bg-white/10' : 'bg-gray-100 hover:bg-gray-200'
              }`}
            >
              <RotateCcw className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Timer;

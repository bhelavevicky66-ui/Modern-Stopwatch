
import React, { useState, useEffect, useCallback } from 'react';
import {
  Timer as TimerIcon,
  Clock,
  Sun,
  Moon,
  Maximize2,
  Minimize2,
  Sparkles,
  Bell,
  X,
  Save,
  Edit3,
  ChevronUp,
  ChevronDown,
  Check,
  Image as ImageIcon
} from 'lucide-react';
import Stopwatch from './components/Stopwatch';
import Timer from './components/Timer';
import Alarm from './components/Alarm';
import AIInsights from './components/AIInsights';
import { AppTab } from './types';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<AppTab>(AppTab.STOPWATCH);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showAI, setShowAI] = useState(false);
  const [backgroundImage, setBackgroundImage] = useState<string | null>(null);

  useEffect(() => {
    const savedBg = localStorage.getItem('stopwatch_bg');
    if (savedBg) setBackgroundImage(savedBg);
  }, []);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setBackgroundImage(base64String);
        localStorage.setItem('stopwatch_bg', base64String);
      };
      reader.readAsDataURL(file);
    }
  };

  useEffect(() => {
    // Sync theme with body class
    if (isDarkMode) {
      document.body.classList.add('bg-[#0f172a]', 'text-white');
      document.body.classList.remove('bg-gray-100', 'text-gray-900');
    } else {
      document.body.classList.remove('bg-[#0f172a]', 'text-white');
      document.body.classList.add('bg-gray-100', 'text-gray-900');
    }
  }, [isDarkMode]);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
        setIsFullscreen(false);
      }
    }
  };

  const handleRipple = (e: React.MouseEvent<HTMLButtonElement>) => {
    const button = e.currentTarget;
    const circle = document.createElement('span');
    const diameter = Math.max(button.clientWidth, button.clientHeight);
    const radius = diameter / 2;

    const rect = button.getBoundingClientRect();
    circle.style.width = circle.style.height = `${diameter}px`;
    circle.style.left = `${e.clientX - rect.left - radius}px`;
    circle.style.top = `${e.clientY - rect.top - radius}px`;
    circle.classList.add('ripple-span');

    const ripple = button.getElementsByClassName('ripple-span')[0];
    if (ripple) ripple.remove();

    button.appendChild(circle);
  };

  return (
    <div
      className={`transition-all duration-500 flex flex-col items-center w-full min-h-screen ${backgroundImage ? 'bg-cover bg-center' : ''}`}
      style={backgroundImage ? { backgroundImage: `url(${backgroundImage})` } : {}}
    >
      {/* Overlay for readability when bg image is set */}
      {backgroundImage && <div className={`absolute inset-0 ${isDarkMode ? 'bg-black/60' : 'bg-white/40'} backdrop-blur-sm z-0 pointer-events-none`} />}

      <div className="relative z-10 w-full flex flex-col items-center">
        {/* Header Controls */}
        <div className="flex justify-between w-full mb-8 items-center">
          <h1 className="text-2xl font-extrabold tracking-tight flex items-center gap-2">
            <Clock className="w-6 h-6 text-blue-500" />
            Chrono<span className="text-blue-500">Flow</span>
          </h1>
          <div className="flex gap-2">
            <button
              onClick={() => setShowAI(!showAI)}
              className={`p-2 rounded-full transition-all ${showAI ? 'bg-purple-500 text-white shadow-lg shadow-purple-500/50' : (isDarkMode ? 'bg-white/5 hover:bg-white/10' : 'bg-gray-200 hover:bg-gray-300')}`}
            >
              <Sparkles className="w-5 h-5" />
            </button>
            <button
              onClick={toggleFullscreen}
              className={`p-2 rounded-full transition-all ${isDarkMode ? 'bg-white/5 hover:bg-white/10' : 'bg-gray-200 hover:bg-gray-300'}`}
            >
              {isFullscreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
            </button>
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className={`p-2 rounded-full transition-all ${isDarkMode ? 'bg-white/5 hover:bg-white/10' : 'bg-gray-200 hover:bg-gray-300'}`}
            >
              {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>

            <label className={`p-2 rounded-full transition-all cursor-pointer ${isDarkMode ? 'bg-white/5 hover:bg-white/10' : 'bg-gray-200 hover:bg-gray-300'}`}>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageUpload}
              />
              <ImageIcon className="w-5 h-5" />
            </label>
          </div>
        </div>

        {/* Main Glass Card */}
        <div className={`w-full relative rounded-[2rem] p-8 shadow-2xl transition-all duration-500 overflow-hidden ${isDarkMode ? 'glass' : 'bg-white shadow-lg border border-gray-100 text-gray-800'}`}>

          {/* Background Decorative Blobs */}
          <div className="absolute -top-24 -right-24 w-48 h-48 bg-blue-500/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-purple-500/20 rounded-full blur-3xl pointer-events-none" />

          {/* Tab Switcher */}
          <div className="flex gap-4 mb-10 relative z-10">
            <button
              onClick={(e) => { setActiveTab(AppTab.STOPWATCH); handleRipple(e); }}
              className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-semibold transition-all ripple border ${activeTab === AppTab.STOPWATCH ? (isDarkMode ? 'bg-white/10 border-white/10 text-white shadow-lg' : 'bg-white border-white text-blue-600 shadow-md') : 'border-transparent text-gray-400 hover:text-gray-200 hover:bg-white/5'}`}
            >
              <Clock className="w-4 h-4" />
              Stopwatch
            </button>
            <button
              onClick={(e) => { setActiveTab(AppTab.TIMER); handleRipple(e); }}
              className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-semibold transition-all ripple border ${activeTab === AppTab.TIMER ? (isDarkMode ? 'bg-white/10 border-white/10 text-white shadow-lg' : 'bg-white border-white text-blue-600 shadow-md') : 'border-transparent text-gray-400 hover:text-gray-200 hover:bg-white/5'}`}
            >
              <TimerIcon className="w-4 h-4" />
              Timer
            </button>
            <button
              onClick={(e) => { setActiveTab(AppTab.ALARM); handleRipple(e); }}
              className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-semibold transition-all ripple border ${activeTab === AppTab.ALARM ? (isDarkMode ? 'bg-white/10 border-white/10 text-white shadow-lg' : 'bg-white border-white text-blue-600 shadow-md') : 'border-transparent text-gray-400 hover:text-gray-200 hover:bg-white/5'}`}
            >
              <Bell className="w-4 h-4" />
              Alarm
            </button>
          </div>

          {/* Content Area */}
          <div className="relative z-10">
            {activeTab === AppTab.STOPWATCH && <Stopwatch isDarkMode={isDarkMode} />}
            {activeTab === AppTab.TIMER && <Timer isDarkMode={isDarkMode} />}
            {activeTab === AppTab.ALARM && <Alarm isDarkMode={isDarkMode} />}
          </div>
        </div>

        {/* AI Drawer (Gemini Insights) */}
        {showAI && <AIInsights isDarkMode={isDarkMode} />}

        <footer className="mt-8 text-sm text-gray-500 font-medium pb-8">
          Precision timekeeping redefined
        </footer>
      </div>
    </div>
  );
};

export default App;

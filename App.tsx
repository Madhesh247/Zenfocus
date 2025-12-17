import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, Pause, RotateCcw, Plus, X, BarChart2, 
  Timer as TimerIcon, Sliders,
  CheckCircle2, BrainCircuit, Maximize2, Minimize2, Sparkles
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { TimerConfig, TimerMode, SessionLog, UserPreferences } from './types';
import { DEFAULT_TIMERS, MODE_COLORS, MODE_DURATIONS, MODE_LABELS } from './constants';
import TimerRing from './components/TimerRing';
import Analytics from './components/Analytics';
import SettingsView from './components/SettingsView';
import ZenBackground from './components/ZenBackground';

// Helper to format time
const formatTime = (seconds: number) => {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
};

const QUOTES = [
  "Focus is the art of knowing what to ignore.",
  "Simplicity is the ultimate sophistication.",
  "Energy flows where attention goes.",
  "The mind is everything. What you think you become.",
  "Deep work is the superpower of the 21st century.",
  "Mastery requires patience.",
  "Quiet the mind, and the soul will speak."
];

const DEFAULT_PREFERENCES: UserPreferences = {
  dailyGoalMinutes: 240, // 4 hours
  durations: { ...MODE_DURATIONS }
};

export default function App() {
  // State
  const [timers, setTimers] = useState<TimerConfig[]>(DEFAULT_TIMERS);
  const [sessionLogs, setSessionLogs] = useState<SessionLog[]>([]);
  const [activeView, setActiveView] = useState<'timer' | 'analytics' | 'settings'>('timer');
  const [showNewTimerModal, setShowNewTimerModal] = useState(false);
  const [preferences, setPreferences] = useState<UserPreferences>(DEFAULT_PREFERENCES);
  
  const [isZenMode, setIsZenMode] = useState(false);
  const [quoteIndex, setQuoteIndex] = useState(0);

  // Quote Rotator
  useEffect(() => {
    const interval = setInterval(() => {
      setQuoteIndex(prev => (prev + 1) % QUOTES.length);
    }, 12000); // Change quote every 12 seconds
    return () => clearInterval(interval);
  }, []);
  
  // Persistence (On Mount)
  useEffect(() => {
    const savedLogs = localStorage.getItem('zenfocus_logs');
    if (savedLogs) setSessionLogs(JSON.parse(savedLogs));

    const savedPrefs = localStorage.getItem('zenfocus_prefs');
    if (savedPrefs) {
        setPreferences({ ...DEFAULT_PREFERENCES, ...JSON.parse(savedPrefs) });
    }
  }, []);

  // Persistence (On Update)
  useEffect(() => {
    localStorage.setItem('zenfocus_logs', JSON.stringify(sessionLogs));
  }, [sessionLogs]);

  useEffect(() => {
    localStorage.setItem('zenfocus_prefs', JSON.stringify(preferences));
  }, [preferences]);

  // Global Timer Tick
  useEffect(() => {
    const interval = setInterval(() => {
      setTimers(prevTimers => prevTimers.map(timer => {
        if (timer.isRunning && timer.remaining > 0) {
          return { ...timer, remaining: timer.remaining - 1 };
        } else if (timer.isRunning && timer.remaining === 0) {
          // Timer Completed
          handleTimerComplete(timer);
          return { ...timer, isRunning: false, isPaused: false, remaining: 0 };
        }
        return timer;
      }));
    }, 1000);
    return () => clearInterval(interval);
  }, [timers]);

  const handleTimerComplete = (timer: TimerConfig) => {
    const newLog: SessionLog = {
      id: Date.now().toString(),
      timerLabel: timer.label,
      mode: timer.mode,
      duration: timer.initialDuration, // Assuming full completion
      timestamp: Date.now(),
    };
    
    setSessionLogs(prev => [newLog, ...prev]);
    
    // Play completion sound
    const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3'); 
    audio.volume = 0.5;
    audio.play().catch(e => console.log('Audio blocked', e));
  };

  const toggleTimer = (id: string) => {
    setTimers(prev => prev.map(t => 
      t.id === id ? { ...t, isRunning: !t.isRunning, isPaused: t.isRunning } : t
    ));
  };

  const resetTimer = (id: string) => {
    setTimers(prev => prev.map(t => 
      t.id === id ? { ...t, isRunning: false, isPaused: false, remaining: t.initialDuration } : t
    ));
  };

  const deleteTimer = (id: string) => {
    if (timers.length <= 1) return;
    setTimers(prev => prev.filter(t => t.id !== id));
  };

  const addTimer = (mode: TimerMode) => {
    const duration = preferences.durations[mode] || MODE_DURATIONS[mode];
    const newTimer: TimerConfig = {
      id: Date.now().toString(),
      label: MODE_LABELS[mode],
      mode: mode,
      duration: duration,
      initialDuration: duration,
      remaining: duration,
      isRunning: false,
      isPaused: false,
      createdAt: Date.now(),
    };
    setTimers(prev => [...prev, newTimer]);
    setShowNewTimerModal(false);
  };

  // Determine container classes based on Zen Mode
  const containerClass = isZenMode 
    ? "fixed inset-0 z-50 bg-slate-950 flex flex-col items-center justify-center p-8 transition-all duration-700" 
    : "min-h-screen bg-slate-950 text-slate-200 flex flex-col md:flex-row font-sans selection:bg-indigo-500/30 transition-all duration-700";

  return (
    <div className={containerClass}>
      <ZenBackground />
      
      {/* Sidebar Navigation - Hidden in Zen Mode */}
      <AnimatePresence>
        {!isZenMode && (
          <motion.nav 
            initial={{ x: -100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -100, opacity: 0 }}
            className="w-full md:w-20 lg:w-24 bg-slate-900/80 backdrop-blur-md border-b md:border-b-0 md:border-r border-white/5 flex md:flex-col items-center justify-between md:justify-start p-4 md:py-8 z-50"
          >
            <div className="mb-0 md:mb-12">
              <motion.div 
                whileHover={{ scale: 1.1, rotate: 180 }}
                transition={{ duration: 0.5 }}
                className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20"
              >
                <BrainCircuit className="text-white w-6 h-6" />
              </motion.div>
            </div>

            <div className="flex md:flex-col gap-6 md:gap-8">
              <button 
                onClick={() => setActiveView('timer')}
                className={`p-3 rounded-xl transition-all duration-300 group ${activeView === 'timer' ? 'bg-indigo-500/10 text-indigo-400' : 'text-slate-500 hover:text-slate-300'}`}
              >
                <TimerIcon size={24} className="group-hover:scale-110 transition-transform" />
              </button>
              
              <button 
                 onClick={() => setActiveView('analytics')}
                className={`p-3 rounded-xl transition-all duration-300 group ${activeView === 'analytics' ? 'bg-indigo-500/10 text-indigo-400' : 'text-slate-500 hover:text-slate-300'}`}
              >
                <BarChart2 size={24} className="group-hover:scale-110 transition-transform" />
              </button>

               <button 
                 onClick={() => setActiveView('settings')}
                className={`p-3 rounded-xl transition-all duration-300 group ${activeView === 'settings' ? 'bg-indigo-500/10 text-indigo-400' : 'text-slate-500 hover:text-slate-300'}`}
              >
                <Sliders size={24} className="group-hover:scale-110 transition-transform" />
              </button>
            </div>
          </motion.nav>
        )}
      </AnimatePresence>

      {/* Main Content Area */}
      <main className="flex-1 overflow-hidden relative flex flex-col">
        {/* Header */}
        <header className={`relative z-10 flex justify-between items-center transition-all duration-500 ${isZenMode ? 'p-8 w-full max-w-5xl mx-auto' : 'p-6 md:p-10'}`}>
            <div className="flex flex-col">
                <AnimatePresence mode="wait">
                  {!isZenMode && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, height: 0 }}
                    >
                      <h1 className="text-2xl font-light text-white tracking-tight">
                          {activeView === 'timer' && 'Focus Session'}
                          {activeView === 'analytics' && 'Productivity Stats'}
                          {activeView === 'settings' && 'Settings & Goals'}
                      </h1>
                      <p className="text-slate-500 text-sm mt-1">
                          {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
                
                {/* Daily Inspiration / Quote */}
                <motion.div 
                   key={quoteIndex}
                   initial={{ opacity: 0, x: -10 }}
                   animate={{ opacity: 1, x: 0 }}
                   className={`flex items-center gap-2 mt-2 ${isZenMode ? 'text-center mx-auto mb-8' : ''}`}
                >
                    {!isZenMode && <Sparkles size={14} className="text-indigo-400" />}
                    <p className={`text-sm font-medium italic bg-clip-text text-transparent bg-gradient-to-r from-indigo-300 to-purple-300 ${isZenMode ? 'text-lg md:text-xl' : ''}`}>
                       "{QUOTES[quoteIndex]}"
                    </p>
                </motion.div>
            </div>

            {/* Zen Toggle */}
            <button 
              onClick={() => setIsZenMode(!isZenMode)}
              className="p-3 rounded-full hover:bg-white/5 text-slate-400 hover:text-indigo-400 transition-all active:scale-95"
              title={isZenMode ? "Exit Zen Mode" : "Enter Zen Mode"}
            >
                {isZenMode ? <Minimize2 size={24} /> : <Maximize2 size={24} />}
            </button>
        </header>

        <div className={`relative z-10 overflow-y-auto pb-20 scrollbar-hide ${isZenMode ? 'flex items-center justify-center w-full h-full' : 'px-6 md:px-10 h-[calc(100vh-140px)]'}`}>
            
            <AnimatePresence mode="wait">
            {/* VIEW: TIMERS */}
            {activeView === 'timer' && (
                <motion.div 
                  key="timer"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.4 }}
                  className={isZenMode 
                    ? "grid grid-cols-1 gap-12 w-full max-w-4xl place-items-center" 
                    : "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6"
                  }
                >
                    {timers.map((timer) => {
                        const progress = ((timer.initialDuration - timer.remaining) / timer.initialDuration) * 100;
                        
                        return (
                            <motion.div 
                              layoutId={`timer-${timer.id}`}
                              key={timer.id} 
                              className={`
                                relative flex flex-col items-center transition-all duration-500
                                ${isZenMode 
                                    ? 'bg-transparent' 
                                    : 'bg-slate-900/40 backdrop-blur-sm border border-white/5 rounded-[2.5rem] p-6 pt-10 pb-12 hover:border-white/10 shadow-2xl shadow-black/20'
                                }
                              `}
                            >
                                {!isZenMode && (
                                    <button 
                                        onClick={() => deleteTimer(timer.id)}
                                        className="absolute top-6 right-6 text-slate-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity z-50"
                                    >
                                        <X size={16} />
                                    </button>
                                )}
                                
                                {/* Header Title */}
                                <div className="mb-4 text-center z-20">
                                    <h3 className={`font-medium text-white tracking-tight ${isZenMode ? 'text-3xl' : 'text-xl'}`}>{timer.label}</h3>
                                </div>

                                <div className={`relative ${isZenMode ? 'scale-125 my-8' : 'my-2'}`}>
                                    {/* Mode Pill - Top Center of Ring */}
                                    <div className="absolute top-8 left-0 right-0 flex justify-center z-20">
                                        <span className={`text-[10px] px-2.5 py-0.5 rounded-full bg-slate-950/50 backdrop-blur-md border border-white/10 ${MODE_COLORS[timer.mode]} uppercase tracking-widest font-bold shadow-lg`}>
                                            {MODE_LABELS[timer.mode]}
                                        </span>
                                    </div>

                                    <TimerRing 
                                        radius={isZenMode ? 160 : 130} 
                                        stroke={isZenMode ? 3 : 2} 
                                        progress={progress} 
                                        colorClass={MODE_COLORS[timer.mode].replace('text-', 'stroke-')}
                                    />

                                    {/* Center Time & Status */}
                                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                                        <span className={`${isZenMode ? 'text-8xl' : 'text-6xl'} font-light text-white tracking-tighter tabular-nums drop-shadow-2xl`}>
                                            {formatTime(timer.remaining)}
                                        </span>
                                        <span className={`text-[10px] font-bold uppercase tracking-[0.25em] mt-3 ${timer.isRunning ? 'text-emerald-400' : 'text-slate-500'}`}>
                                            {timer.isRunning ? 'Running' : timer.remaining === 0 ? 'Completed' : 'Paused'}
                                        </span>
                                    </div>
                                    
                                    {/* Floating Play Button - Bottom Center overlapping ring */}
                                    <div className="absolute -bottom-7 left-0 right-0 flex justify-center z-30">
                                        <motion.button 
                                            whileHover={{ scale: 1.1, translateY: -2 }}
                                            whileTap={{ scale: 0.95 }}
                                            onClick={() => toggleTimer(timer.id)}
                                            className={`w-14 h-14 rounded-full flex items-center justify-center transition-all shadow-xl shadow-black/40 border-[6px] border-slate-900 ${
                                                timer.isRunning 
                                                ? 'bg-amber-500 text-slate-900 hover:bg-amber-400' 
                                                : timer.remaining === 0
                                                    ? 'bg-emerald-500 text-white hover:bg-emerald-400'
                                                    : 'bg-indigo-600 text-white hover:bg-indigo-500'
                                            }`}
                                        >
                                            {timer.isRunning ? <Pause fill="currentColor" size={20} /> : timer.remaining === 0 ? <CheckCircle2 size={24} /> : <Play fill="currentColor" className="ml-1" size={20}/>}
                                        </motion.button>
                                    </div>
                                </div>
                                
                                {/* Spacer for the floating button */}
                                <div className="h-6 w-full"></div>

                                {/* Hover Controls (Reset) */}
                                {!isZenMode && (
                                     <div className="mt-4 opacity-0 hover:opacity-100 transition-opacity flex justify-center">
                                        <button 
                                            onClick={() => resetTimer(timer.id)}
                                            className="text-xs font-medium text-slate-600 hover:text-slate-400 uppercase tracking-wider flex items-center gap-1.5 py-2 px-4 rounded-full hover:bg-white/5 transition-colors"
                                        >
                                            <RotateCcw size={12} /> Reset Timer
                                        </button>
                                     </div>
                                )}
                            </motion.div>
                        );
                    })}

                    {/* Add Timer Card (Hidden in Zen Mode) */}
                    {!isZenMode && (
                        <motion.button 
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => setShowNewTimerModal(true)}
                            className="min-h-[420px] border border-dashed border-white/10 rounded-[2.5rem] flex flex-col items-center justify-center text-slate-600 hover:text-indigo-400 hover:border-indigo-500/30 hover:bg-indigo-500/5 transition-all gap-4 group backdrop-blur-sm"
                        >
                            <div className="w-16 h-16 rounded-full bg-slate-900 border border-white/5 flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg">
                                <Plus size={32} />
                            </div>
                            <span className="font-medium">Add Focus Timer</span>
                        </motion.button>
                    )}
                </motion.div>
            )}

            {/* VIEW: ANALYTICS */}
            {activeView === 'analytics' && !isZenMode && (
                <motion.div 
                    key="analytics"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="h-full"
                >
                   <Analytics logs={sessionLogs} />
                </motion.div>
            )}

             {/* VIEW: SETTINGS */}
             {activeView === 'settings' && !isZenMode && (
                <motion.div 
                    key="settings"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="h-full"
                >
                   <SettingsView 
                      preferences={preferences} 
                      onUpdatePreferences={setPreferences} 
                      logs={sessionLogs}
                   />
                </motion.div>
            )}
            </AnimatePresence>
        </div>
      </main>

        {/* New Timer Modal Overlay */}
        <AnimatePresence>
        {showNewTimerModal && (
            <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
            >
                <motion.div 
                    initial={{ scale: 0.9, y: 20 }}
                    animate={{ scale: 1, y: 0 }}
                    exit={{ scale: 0.9, y: 20 }}
                    className="bg-slate-900 border border-white/10 rounded-2xl w-full max-w-md p-6 shadow-2xl relative overflow-hidden"
                >
                    <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-transparent pointer-events-none" />
                    <div className="flex justify-between items-center mb-6 relative z-10">
                        <h2 className="text-xl text-white font-medium">Select Mode</h2>
                        <button onClick={() => setShowNewTimerModal(false)} className="text-slate-500 hover:text-white">
                            <X size={20} />
                        </button>
                    </div>
                    <div className="grid grid-cols-2 gap-3 relative z-10">
                        {(['pomodoro', 'shortBreak', 'longBreak', 'deepWork', 'micro'] as TimerMode[]).map((m) => {
                            const duration = preferences.durations[m] || MODE_DURATIONS[m];
                            return (
                                <button
                                    key={m}
                                    onClick={() => addTimer(m)}
                                    className="p-4 rounded-xl bg-slate-800/50 hover:bg-indigo-600/20 hover:border-indigo-500/50 border border-transparent text-left transition-all group"
                                >
                                    <span className={`block text-sm font-medium mb-1 ${MODE_COLORS[m]}`}>{MODE_LABELS[m]}</span>
                                    <span className="text-xs text-slate-500 group-hover:text-slate-300">
                                        {Math.floor(duration / 60)} minutes
                                    </span>
                                </button>
                            );
                        })}
                    </div>
                </motion.div>
            </motion.div>
        )}
        </AnimatePresence>
    </div>
  );
}
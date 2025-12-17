import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  Play, Pause, RotateCcw, Plus, X, BarChart2, 
  Timer as TimerIcon, Sliders,
  CheckCircle2, BrainCircuit
} from 'lucide-react';
import { TimerConfig, TimerMode, SessionLog, UserPreferences } from './types';
import { DEFAULT_TIMERS, MODE_COLORS, MODE_DURATIONS, MODE_LABELS } from './constants';
import TimerRing from './components/TimerRing';
import Analytics from './components/Analytics';
import SettingsView from './components/SettingsView';

// Helper to format time
const formatTime = (seconds: number) => {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
};

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
  
  // Persistence (On Mount)
  useEffect(() => {
    const savedLogs = localStorage.getItem('zenfocus_logs');
    if (savedLogs) setSessionLogs(JSON.parse(savedLogs));

    const savedPrefs = localStorage.getItem('zenfocus_prefs');
    if (savedPrefs) {
        // Merge with defaults to ensure all keys exist if schema changes
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
    const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3'); // Gentle chime
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
    if (timers.length <= 1) return; // Prevent deleting last timer
    setTimers(prev => prev.filter(t => t.id !== id));
  };

  const addTimer = (mode: TimerMode) => {
    // Use duration from preferences if available, else fallback to default constant
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

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 flex flex-col md:flex-row font-sans selection:bg-indigo-500/30">
      
      {/* Sidebar Navigation */}
      <nav className="w-full md:w-20 lg:w-24 bg-slate-900 border-b md:border-b-0 md:border-r border-white/5 flex md:flex-col items-center justify-between md:justify-start p-4 md:py-8 z-50">
        <div className="mb-0 md:mb-12">
          <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <BrainCircuit className="text-white w-6 h-6" />
          </div>
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
      </nav>

      {/* Main Content Area */}
      <main className="flex-1 overflow-hidden relative">
        {/* Ambient Background Gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-indigo-950/20 to-slate-950 pointer-events-none" />
        
        <header className="relative z-10 p-6 md:p-10 flex justify-between items-center">
            <div>
                <h1 className="text-2xl font-light text-white tracking-tight">
                    {activeView === 'timer' && 'Focus Session'}
                    {activeView === 'analytics' && 'Productivity Stats'}
                    {activeView === 'settings' && 'Settings & Goals'}
                </h1>
                <p className="text-slate-500 text-sm mt-1">
                    {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                </p>
            </div>
            {/* Removed Sound Control Area */}
        </header>

        <div className="relative z-10 px-6 md:px-10 h-[calc(100vh-140px)] overflow-y-auto pb-20">
            
            {/* VIEW: TIMERS */}
            {activeView === 'timer' && (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {timers.map((timer) => {
                        const progress = ((timer.initialDuration - timer.remaining) / timer.initialDuration) * 100;
                        
                        return (
                            <div key={timer.id} className="bg-slate-900/40 backdrop-blur-sm border border-white/5 rounded-3xl p-6 md:p-8 flex flex-col items-center relative group hover:border-white/10 transition-colors">
                                <button 
                                    onClick={() => deleteTimer(timer.id)}
                                    className="absolute top-4 right-4 text-slate-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                    <X size={16} />
                                </button>

                                <div className="mb-6 text-center">
                                    <h3 className="text-lg font-medium text-white mb-1">{timer.label}</h3>
                                    <span className={`text-xs px-2 py-1 rounded-full bg-white/5 ${MODE_COLORS[timer.mode] || 'text-slate-400'} uppercase tracking-wider font-semibold`}>
                                        {MODE_LABELS[timer.mode]}
                                    </span>
                                </div>

                                <div className="relative mb-8">
                                    <TimerRing 
                                        radius={120} 
                                        stroke={4} 
                                        progress={progress} 
                                        colorClass={MODE_COLORS[timer.mode].replace('text-', 'stroke-')}
                                    />
                                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                                        <span className="text-5xl font-light text-white tracking-tighter tabular-nums">
                                            {formatTime(timer.remaining)}
                                        </span>
                                        <span className="text-xs text-slate-500 mt-2 font-medium uppercase tracking-widest">
                                            {timer.isRunning ? 'Focusing' : timer.remaining === 0 ? 'Done' : 'Paused'}
                                        </span>
                                    </div>
                                </div>

                                <div className="flex gap-4">
                                    <button 
                                        onClick={() => toggleTimer(timer.id)}
                                        className={`w-14 h-14 rounded-full flex items-center justify-center transition-all ${
                                            timer.isRunning 
                                            ? 'bg-amber-500/10 text-amber-500 hover:bg-amber-500/20' 
                                            : timer.remaining === 0
                                                ? 'bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20'
                                                : 'bg-indigo-600 text-white hover:bg-indigo-500 shadow-lg shadow-indigo-500/25'
                                        }`}
                                    >
                                        {timer.isRunning ? <Pause fill="currentColor" /> : timer.remaining === 0 ? <CheckCircle2 /> : <Play fill="currentColor" className="ml-1"/>}
                                    </button>
                                    
                                    <button 
                                        onClick={() => resetTimer(timer.id)}
                                        className="w-14 h-14 rounded-full flex items-center justify-center bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white transition-all"
                                    >
                                        <RotateCcw size={20} />
                                    </button>
                                </div>
                            </div>
                        );
                    })}

                    {/* Add Timer Card */}
                    <button 
                        onClick={() => setShowNewTimerModal(true)}
                        className="min-h-[400px] border border-dashed border-white/10 rounded-3xl flex flex-col items-center justify-center text-slate-600 hover:text-indigo-400 hover:border-indigo-500/30 hover:bg-indigo-500/5 transition-all gap-4 group"
                    >
                        <div className="w-16 h-16 rounded-full bg-slate-900 border border-white/5 flex items-center justify-center group-hover:scale-110 transition-transform">
                            <Plus size={32} />
                        </div>
                        <span className="font-medium">Add Timer</span>
                    </button>
                </div>
            )}

            {/* VIEW: ANALYTICS */}
            {activeView === 'analytics' && (
                <div className="h-full">
                   <Analytics logs={sessionLogs} />
                </div>
            )}

             {/* VIEW: SETTINGS */}
             {activeView === 'settings' && (
                <div className="h-full">
                   <SettingsView 
                      preferences={preferences} 
                      onUpdatePreferences={setPreferences} 
                      logs={sessionLogs}
                   />
                </div>
            )}

        </div>
      </main>

        {/* New Timer Modal Overlay */}
        {showNewTimerModal && (
            <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
                <div className="bg-slate-900 border border-white/10 rounded-2xl w-full max-w-md p-6 shadow-2xl">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl text-white font-medium">Select Mode</h2>
                        <button onClick={() => setShowNewTimerModal(false)} className="text-slate-500 hover:text-white">
                            <X size={20} />
                        </button>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
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
                </div>
            </div>
        )}
    </div>
  );
}
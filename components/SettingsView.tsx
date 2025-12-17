import React from 'react';
import { Download, Clock, Target, Sliders, Save } from 'lucide-react';
import { UserPreferences, SessionLog, TimerMode } from '../types';
import { MODE_LABELS } from '../constants';

interface SettingsViewProps {
  preferences: UserPreferences;
  onUpdatePreferences: (newPrefs: UserPreferences) => void;
  logs: SessionLog[];
}

const SettingsView: React.FC<SettingsViewProps> = ({ preferences, onUpdatePreferences, logs }) => {
  
  const handleDurationChange = (mode: string, minutes: number) => {
    onUpdatePreferences({
      ...preferences,
      durations: {
        ...preferences.durations,
        [mode]: minutes * 60
      }
    });
  };

  const handleGoalChange = (minutes: number) => {
    onUpdatePreferences({
      ...preferences,
      dailyGoalMinutes: minutes
    });
  };

  const exportData = () => {
    const headers = ['Date', 'Time', 'Mode', 'Duration (Minutes)', 'Label'];
    const rows = logs.map(log => [
      new Date(log.timestamp).toLocaleDateString(),
      new Date(log.timestamp).toLocaleTimeString(),
      log.mode,
      (log.duration / 60).toFixed(1),
      log.timerLabel
    ]);

    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "zenfocus_data.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const editableModes: TimerMode[] = ['pomodoro', 'shortBreak', 'longBreak', 'deepWork', 'micro'];

  return (
    <div className="h-full max-w-3xl mx-auto space-y-6 pb-12">
      
      {/* Daily Goal Section */}
      <div className="bg-slate-900/50 backdrop-blur-md rounded-2xl border border-white/5 p-6 shadow-xl">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-400">
            <Target size={20} />
          </div>
          <div>
            <h3 className="text-lg font-medium text-white">Daily Focus Goal</h3>
            <p className="text-sm text-slate-500">Set your daily target for deep work.</p>
          </div>
        </div>
        
        <div className="space-y-4">
          <div className="flex justify-between items-center text-sm">
            <span className="text-slate-400">Target Duration</span>
            <span className="text-emerald-400 font-medium">{(preferences.dailyGoalMinutes / 60).toFixed(1)} hours</span>
          </div>
          <input
            type="range"
            min="60"
            max="720"
            step="30"
            value={preferences.dailyGoalMinutes}
            onChange={(e) => handleGoalChange(parseInt(e.target.value))}
            className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500 hover:accent-emerald-400"
          />
          <div className="flex justify-between text-xs text-slate-600 font-medium uppercase tracking-wider">
            <span>1h</span>
            <span>6h</span>
            <span>12h</span>
          </div>
        </div>
      </div>

      {/* Timer Configuration Section */}
      <div className="bg-slate-900/50 backdrop-blur-md rounded-2xl border border-white/5 p-6 shadow-xl">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-indigo-500/10 rounded-lg text-indigo-400">
            <Clock size={20} />
          </div>
          <div>
            <h3 className="text-lg font-medium text-white">Timer Durations</h3>
            <p className="text-sm text-slate-500">Customize the length of your focus sessions.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {editableModes.map((mode) => (
            <div key={mode} className="flex items-center justify-between p-4 bg-slate-800/40 rounded-xl border border-white/5">
              <span className="text-sm font-medium text-slate-300">{MODE_LABELS[mode]}</span>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="1"
                  max="180"
                  value={Math.floor((preferences.durations[mode] || 0) / 60)}
                  onChange={(e) => handleDurationChange(mode, parseInt(e.target.value) || 1)}
                  className="w-16 bg-slate-950 border border-slate-700 rounded-lg py-1 px-2 text-right text-sm text-white focus:outline-none focus:border-indigo-500 transition-colors"
                />
                <span className="text-xs text-slate-600">min</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Data Management Section */}
      <div className="bg-slate-900/50 backdrop-blur-md rounded-2xl border border-white/5 p-6 shadow-xl">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-blue-500/10 rounded-lg text-blue-400">
            <Save size={20} />
          </div>
          <div>
            <h3 className="text-lg font-medium text-white">Data Management</h3>
            <p className="text-sm text-slate-500">Export your productivity history.</p>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-slate-300">Total Sessions Logged</p>
            <p className="text-2xl font-light text-white">{logs.length}</p>
          </div>
          <button 
            onClick={exportData}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600/20 text-blue-400 border border-blue-500/30 rounded-lg hover:bg-blue-600/30 transition-all text-sm font-medium"
          >
            <Download size={16} />
            Export CSV
          </button>
        </div>
      </div>

       <div className="text-center pt-8 text-slate-600 text-xs">
         <p>ZenFocus v1.2 • Designed for Deep Work</p>
       </div>

    </div>
  );
};

export default SettingsView;
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { SessionLog } from '../types';

interface AnalyticsProps {
  logs: SessionLog[];
}

const Analytics: React.FC<AnalyticsProps> = ({ logs }) => {
  // Aggregate data for the last 7 days
  const data = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const dayStr = d.toLocaleDateString('en-US', { weekday: 'short' });
    
    // Filter logs for this day
    const dayLogs = logs.filter(log => {
      const logDate = new Date(log.timestamp);
      return logDate.getDate() === d.getDate() && 
             logDate.getMonth() === d.getMonth() &&
             logDate.getFullYear() === d.getFullYear();
    });

    const totalMinutes = Math.floor(dayLogs.reduce((acc, curr) => acc + curr.duration, 0) / 60);

    return {
      name: dayStr,
      minutes: totalMinutes,
    };
  });

  const totalTimeAll = logs.reduce((acc, curr) => acc + curr.duration, 0);
  const hours = Math.floor(totalTimeAll / 3600);
  const mins = Math.floor((totalTimeAll % 3600) / 60);

  return (
    <div className="bg-slate-900/50 backdrop-blur-md rounded-2xl border border-white/5 p-6 shadow-xl h-full flex flex-col">
      <div className="flex justify-between items-end mb-6">
        <div>
          <h3 className="text-slate-400 text-sm font-medium uppercase tracking-wider">Weekly Focus</h3>
          <p className="text-3xl font-light text-white mt-1">
            {hours}<span className="text-lg text-slate-500">h</span> {mins}<span className="text-lg text-slate-500">m</span>
          </p>
        </div>
        <div className="text-right">
           <span className="text-xs px-2 py-1 bg-emerald-500/10 text-emerald-400 rounded-full border border-emerald-500/20">
             Top 10%
           </span>
        </div>
      </div>

      <div className="flex-1 w-full min-h-[200px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <XAxis 
              dataKey="name" 
              stroke="#475569" 
              fontSize={12} 
              tickLine={false} 
              axisLine={false} 
            />
            <Tooltip 
              cursor={{ fill: '#1e293b' }}
              contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px' }}
              itemStyle={{ color: '#cbd5e1' }}
            />
            <Bar dataKey="minutes" radius={[4, 4, 0, 0]}>
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={index === 6 ? '#818cf8' : '#334155'} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      
      <div className="mt-4 pt-4 border-t border-white/5 grid grid-cols-2 gap-4">
        <div>
            <span className="block text-slate-500 text-xs">Sessions</span>
            <span className="text-lg font-medium text-slate-200">{logs.length}</span>
        </div>
        <div>
            <span className="block text-slate-500 text-xs">Avg. Duration</span>
            <span className="text-lg font-medium text-slate-200">
                {logs.length > 0 ? Math.round(totalTimeAll / logs.length / 60) : 0} m
            </span>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
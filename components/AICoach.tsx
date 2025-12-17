import React, { useState, useEffect, useRef } from 'react';
import { Send, Sparkles, Bot, User } from 'lucide-react';
import { getProductivityCoaching } from '../services/geminiService';
import { SessionLog } from '../types';

interface AICoachProps {
  logs: SessionLog[];
  isTimerRunning: boolean;
}

const AICoach: React.FC<AICoachProps> = ({ logs, isTimerRunning }) => {
  const [messages, setMessages] = useState<{ role: string; text: string }[]>([
    { role: 'assistant', text: "Hello. I'm ZenFocus. Ready to enter deep work?" }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMsg = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setLoading(true);

    const context = isTimerRunning ? "Focusing" : "Idle";
    const response = await getProductivityCoaching(context, logs, userMsg);

    setMessages(prev => [...prev, { role: 'assistant', text: response }]);
    setLoading(false);
  };

  return (
    <div className="flex flex-col h-full bg-slate-900/50 backdrop-blur-md rounded-2xl border border-white/5 overflow-hidden shadow-xl">
      <div className="p-4 border-b border-white/5 flex items-center gap-2 bg-slate-900/80">
        <Sparkles className="w-4 h-4 text-purple-400" />
        <h3 className="text-sm font-medium text-slate-200">Focus Intelligence</h3>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${msg.role === 'assistant' ? 'bg-indigo-500/20 text-indigo-400' : 'bg-slate-700 text-slate-300'}`}>
              {msg.role === 'assistant' ? <Bot size={16} /> : <User size={16} />}
            </div>
            <div className={`p-3 rounded-2xl text-sm leading-relaxed max-w-[80%] ${
              msg.role === 'assistant' 
                ? 'bg-slate-800/80 text-slate-200 rounded-tl-none border border-white/5' 
                : 'bg-indigo-600 text-white rounded-tr-none shadow-lg'
            }`}>
              {msg.text}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex gap-2 items-center text-xs text-slate-500 ml-12 animate-pulse">
            <span className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce" style={{animationDelay: '0ms'}}></span>
            <span className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce" style={{animationDelay: '150ms'}}></span>
            <span className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce" style={{animationDelay: '300ms'}}></span>
          </div>
        )}
      </div>

      <div className="p-4 bg-slate-900/80 border-t border-white/5">
        <div className="relative">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask for advice..."
            className="w-full bg-slate-950 border border-slate-700 rounded-full py-2.5 pl-4 pr-12 text-sm text-slate-200 focus:outline-none focus:border-indigo-500 transition-colors"
          />
          <button 
            onClick={handleSend}
            disabled={loading || !input}
            className="absolute right-1 top-1 p-1.5 bg-indigo-600 rounded-full text-white hover:bg-indigo-500 disabled:opacity-50 disabled:hover:bg-indigo-600 transition-colors"
          >
            <Send size={14} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default AICoach;
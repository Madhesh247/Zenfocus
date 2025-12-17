export type TimerMode = 'pomodoro' | 'shortBreak' | 'longBreak' | 'deepWork' | 'flow' | 'micro';

export interface TimerConfig {
  id: string;
  label: string;
  duration: number; // in seconds
  remaining: number; // in seconds
  initialDuration: number;
  mode: TimerMode;
  isRunning: boolean;
  isPaused: boolean;
  createdAt: number;
}

export interface SessionLog {
  id: string;
  timerLabel: string;
  mode: TimerMode;
  duration: number; // seconds completed
  timestamp: number; // unix epoch
  rating?: number; // 1-5 focus rating
}

export interface DailyStats {
  date: string;
  totalFocusSeconds: number;
  sessionsCount: number;
  focusScore: number;
}

export interface AIMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
}

export enum SoundTrack {
  RAIN = 'rain',
  FOREST = 'forest',
  WHITE_NOISE = 'white_noise',
  OFF = 'off'
}

export interface UserPreferences {
  dailyGoalMinutes: number;
  durations: Record<string, number>; // Keyed by TimerMode, value in seconds
}
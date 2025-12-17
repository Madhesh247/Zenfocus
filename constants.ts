import { TimerMode, TimerConfig } from './types';

export const MODE_DURATIONS: Record<TimerMode, number> = {
  pomodoro: 25 * 60,
  shortBreak: 5 * 60,
  longBreak: 15 * 60,
  deepWork: 90 * 60,
  flow: 0, // Stopwatch style, counts up (handled separately)
  micro: 10 * 60,
};

export const MODE_LABELS: Record<TimerMode, string> = {
  pomodoro: 'Pomodoro',
  shortBreak: 'Short Break',
  longBreak: 'Long Break',
  deepWork: 'Deep Work',
  flow: 'Flow Mode',
  micro: 'Micro Task',
};

export const MODE_COLORS: Record<TimerMode, string> = {
  pomodoro: 'text-indigo-400',
  shortBreak: 'text-teal-400',
  longBreak: 'text-blue-400',
  deepWork: 'text-purple-400',
  flow: 'text-rose-400',
  micro: 'text-amber-400',
};

export const DEFAULT_TIMERS: TimerConfig[] = [
  {
    id: 'default-1',
    label: 'Deep Focus',
    mode: 'pomodoro',
    duration: 25 * 60,
    initialDuration: 25 * 60,
    remaining: 25 * 60,
    isRunning: false,
    isPaused: false,
    createdAt: Date.now(),
  },
];

export const SOUND_URLS: Record<string, string> = {
  rain: 'https://assets.mixkit.co/sfx/preview/mixkit-light-rain-loop-2393.mp3',
  forest: 'https://assets.mixkit.co/sfx/preview/mixkit-forest-birds-ambience-1210.mp3',
  white_noise: 'https://assets.mixkit.co/sfx/preview/mixkit-white-noise-frequency-loop-2847.mp3',
};
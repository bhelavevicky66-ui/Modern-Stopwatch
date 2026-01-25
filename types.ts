
export interface Alarm {
  id: string;
  time: string; // HH:MM format
  isActive: boolean;
  label?: string;
  days?: number[]; // 0-6 for Sun-Sat, optional for recurring
}

export interface Lap {
  id: number;
  time: number;
  duration: number;
}

export enum AppTab {
  STOPWATCH = 'stopwatch',
  TIMER = 'timer',
  ALARM = 'alarm'
}

export interface TimerSettings {
  hours: number;
  minutes: number;
  seconds: number;
}

export interface AIAdvice {
  title: string;
  advice: string;
}

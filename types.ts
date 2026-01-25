
export interface Lap {
  id: number;
  time: number;
  duration: number;
}

export enum AppTab {
  STOPWATCH = 'stopwatch',
  TIMER = 'timer'
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

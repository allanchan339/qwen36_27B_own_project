export type TabId = 'dashboard' | 'notes' | 'tasks' | 'bookmarks' | 'pomodoro' | 'settings';

export interface Note {
  id: string;
  title: string;
  content: string;
  color: string;
  createdAt: number;
  updatedAt: number;
  wordCount?: number;
}

export interface Task {
  id: string;
  text: string;
  done: boolean;
  createdAt: number;
}

export interface Bookmark {
  id: string;
  title: string;
  url: string;
  icon?: string;
}

export interface TimeZoneState {
  city: string;
  zone: string;
  enabled: boolean;
}

export interface PomodoroState {
  isRunning: boolean;
  timeLeft: number;
  mode: 'work' | 'break';
  sessionsCompleted: number;
}

export interface Settings {
  greeting: string;
  defaultTimezones: TimeZoneState[];
}

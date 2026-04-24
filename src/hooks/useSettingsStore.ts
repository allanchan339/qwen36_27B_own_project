import { useState, useCallback, useEffect } from 'react';
import { get, set } from '@/lib/storage';

interface TimeZoneEntry {
  id: string;
  city: string;
  zone: string;
  enabled: boolean;
}

const DEFAULT_TIMEZONES: TimeZoneEntry[] = [
  { id: 'local', city: 'Local', zone: Intl.DateTimeFormat().resolvedOptions().timeZone, enabled: true },
  { id: 'ny', city: 'New York', zone: 'America/New_York', enabled: true },
  { id: 'lon', city: 'London', zone: 'Europe/London', enabled: true },
  { id: 'tok', city: 'Tokyo', zone: 'Asia/Tokyo', enabled: true },
  { id: 'syd', city: 'Sydney', zone: 'Australia/Sydney', enabled: false },
];

const STORAGE_KEY = 'cc-settings';

interface SettingsState {
  greeting: string;
  timezones: TimeZoneEntry[];
}

function loadState(): SettingsState {
  return get<SettingsState>(STORAGE_KEY, {
    greeting: 'Command Center',
    timezones: DEFAULT_TIMEZONES,
  });
}

let _state = loadState();
let _listeners = new Set<() => void>();

function notify() {
  set(STORAGE_KEY, _state);
  _listeners.forEach((fn) => fn());
}

function setGreeting(greeting: string) {
  _state = { ..._state, greeting };
  notify();
}

function setTimezones(timezones: TimeZoneEntry[]) {
  _state = { ..._state, timezones };
  notify();
}

function toggleTimezone(id: string) {
  _state = {
    ..._state,
    timezones: _state.timezones.map((tz) =>
      tz.id === id ? { ...tz, enabled: !tz.enabled } : tz
    ),
  };
  notify();
}

function addTimezone(city: string, zone: string) {
  if (!city.trim() || !zone.trim()) return;
  const id = city.toLowerCase().replace(/[^a-z]/g, '') + Date.now();
  _state = {
    ..._state,
    timezones: [..._state.timezones, { id, city: city.trim(), zone: zone.trim(), enabled: true }],
  };
  notify();
}

function removeTimezone(id: string) {
  _state = {
    ..._state,
    timezones: _state.timezones.filter((tz) => tz.id !== id),
  };
  notify();
}

function exportData() {
  const data: Record<string, unknown> = {};
  for (const k of ['notes', 'tasks', 'bookmarks', 'pomodoro', STORAGE_KEY]) {
    const raw = localStorage.getItem(k);
    if (raw) {
      try { data[k] = JSON.parse(raw); } catch { /* skip */ }
    }
  }
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `command-center-backup-${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

function importData(json: string): boolean {
  try {
    const data = JSON.parse(json);
    for (const k of Object.keys(data)) {
      localStorage.setItem(k, JSON.stringify(data[k]));
    }
    _state = loadState();
    notify();
    return true;
  } catch {
    return false;
  }
}

function clearAllData() {
  for (const k of ['notes', 'tasks', 'bookmarks', 'pomodoro', STORAGE_KEY]) {
    localStorage.removeItem(k);
  }
  _state = loadState();
  notify();
}

export default function useSettingsStore() {
  const [state, forceUpdate] = useState<SettingsState>(() => ({ ..._state }));

  useEffect(() => {
    const handler = () => forceUpdate({ ..._state });
    _listeners.add(handler);
    return () => {
      void _listeners.delete(handler);
    };
  }, []);

  return {
    ...state,
    setGreeting: useCallback(setGreeting, []),
    setTimezones: useCallback(setTimezones, []),
    toggleTimezone: useCallback(toggleTimezone, []),
    addTimezone: useCallback(addTimezone, []),
    removeTimezone: useCallback(removeTimezone, []),
    exportData: useCallback(exportData, []),
    importData: useCallback(importData, []),
    clearAllData: useCallback(clearAllData, []),
  };
}

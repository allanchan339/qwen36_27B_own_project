import { useState, useCallback, useEffect } from 'react';
import { get, set } from '@/lib/storage';

const WORK = 25 * 60;
const BREAK_ = 5 * 60;

function usePomodoroStore() {
  const [state, setState] = useState<{
    mode: 'work' | 'break';
    isRunning: boolean;
    timeLeft: number;
    sessionsCompleted: number;
  }>(() =>
    get('pomodoro', { mode: 'work', isRunning: false, timeLeft: WORK, sessionsCompleted: 0 })
  );

  useEffect(() => {
    set('pomodoro', state);
  }, [state]);

  const start = useCallback(() => setState((p) => ({ ...p, isRunning: true })), []);
  const pause = useCallback(() => setState((p) => ({ ...p, isRunning: false })), []);
  const reset = useCallback(
    () =>
      setState((p) => ({
        ...p,
        isRunning: false,
        timeLeft: p.mode === 'work' ? WORK : BREAK_,
      })),
    []
  );
  const toggleMode = useCallback(
    () =>
      setState((p) => ({
        ...p,
        isRunning: false,
        mode: p.mode === 'work' ? 'break' : 'work',
        timeLeft: p.mode === 'work' ? BREAK_ : WORK,
      })),
    []
  );

  return { ...state, start, pause, reset, toggleMode };
}

export default usePomodoroStore;

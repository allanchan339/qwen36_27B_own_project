import usePomodoroStore from '@/hooks/usePomodoroStore';

export default function Pomodoro() {
  const { mode, isRunning, timeLeft, sessionsCompleted, start, pause, reset, toggleMode } =
    usePomodoroStore();

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const maxSeconds = mode === 'work' ? 25 * 60 : 5 * 60;
  const progress = timeLeft / maxSeconds;
  const radius = 80;
  const circumference = 2 * Math.PI * radius;

  return (
    <div className="max-w-md mx-auto animate-fade-in" role="region" aria-label="Pomodoro timer">
      <h1 className="text-3xl font-bold text-[var(--text-primary)] mb-8 text-center">Pomodoro</h1>

      <div className="bg-[var(--bg-card)] rounded-2xl p-8 border border-[var(--border)] text-center">
        <div
          className={`inline-block px-4 py-1.5 rounded-full text-sm font-medium mb-8 ${
            mode === 'work'
              ? 'bg-[var(--accent)]/20 text-[var(--accent)]'
              : 'bg-[var(--success)]/20 text-[var(--success)]'
          }`}
        >
          {mode === 'work' ? '🎯 Focus' : '☕ Break'}
        </div>

        <div className="relative w-48 h-48 mx-auto mb-8">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 200 200" aria-hidden="true">
            <circle
              cx="100"
              cy="100"
              r={radius}
              fill="none"
              stroke="var(--border)"
              strokeWidth="8"
            />
            <circle
              cx="100"
              cy="100"
              r={radius}
              fill="none"
              stroke={mode === 'work' ? 'var(--accent)' : 'var(--success)'}
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={circumference * (1 - progress)}
              className="transition-[stroke-dashoffset] duration-1000 ease-linear"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-5xl font-mono font-bold text-[var(--text-primary)] tabular-nums">
              {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
            </span>
          </div>
        </div>

        <div className="flex justify-center gap-3 mb-6">
          <button
            onClick={() => (isRunning ? pause() : start())}
            className={`px-8 py-3 rounded-xl font-medium transition-colors ${
              isRunning
                ? 'bg-[var(--warning)]/20 text-[var(--warning)] hover:bg-[var(--warning)]/30'
                : 'bg-[var(--accent)] text-white hover:bg-[var(--accent-hover)]'
            }`}
          >
            {isRunning ? 'Pause' : 'Start'}
          </button>
          <button
            onClick={reset}
            className="px-6 py-3 rounded-xl bg-[var(--bg-hover)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
          >
            Reset
          </button>
        </div>

        <button
          onClick={toggleMode}
          className="text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors underline"
        >
          Switch to {mode === 'work' ? 'Break' : 'Focus'}
        </button>
      </div>

      <div className="mt-8 grid grid-cols-2 gap-4">
        <div className="bg-[var(--bg-card)] rounded-xl p-4 border border-[var(--border)] text-center">
          <p className="text-2xl font-bold text-[var(--accent)]">{sessionsCompleted}</p>
          <p className="text-xs text-[var(--text-secondary)]">Sessions</p>
        </div>
        <div className="bg-[var(--bg-card)] rounded-xl p-4 border border-[var(--border)] text-center">
          <p className="text-2xl font-bold text-[var(--success)]">{sessionsCompleted * 25}m</p>
          <p className="text-xs text-[var(--text-secondary)]">Total Focus</p>
        </div>
      </div>
    </div>
  );
}

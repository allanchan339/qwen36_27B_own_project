import { useState, useEffect } from 'react';
import useSettingsStore from '@/hooks/useSettingsStore';

interface MemPerf {
  memory?: { usedJSHeapSize: number };
}

export default function Dashboard() {
  const { greeting, timezones } = useSettingsStore();
  const [now, setNow] = useState(new Date());
  const [sessionSec, setSessionSec] = useState(0);

  useEffect(() => {
    const start = Date.now();
    const id = setInterval(() => {
      setNow(new Date());
      setSessionSec(Math.floor((Date.now() - start) / 1000));
    }, 1000);
    return () => clearInterval(id);
  }, []);

  const zones = timezones.filter((z) => z.enabled);

  const memMb =
    typeof performance !== 'undefined' && 'memory' in (performance as unknown as MemPerf)
      ? `${Math.round(((performance as unknown as MemPerf).memory!.usedJSHeapSize) / 1048576)} MB`
      : 'N/A';

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold text-[var(--text-primary)]">{greeting}</h1>
        <p className="text-[var(--text-secondary)] mt-1">Welcome back. Here's your overview.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {zones.map((zone) => (
          <div key={zone.zone} className="bg-[var(--bg-card)] rounded-xl p-5 border border-[var(--border)]">
            <div className="text-sm text-[var(--text-secondary)] mb-1">{zone.city}</div>
            <div className="text-3xl font-mono font-bold text-[var(--text-primary)]">
              {now.toLocaleTimeString('en-US', { timeZone: zone.zone, hour12: false })}
            </div>
            <div className="text-xs text-[var(--text-secondary)] mt-1">
              {now.toLocaleDateString('en-US', { timeZone: zone.zone, weekday: 'short', month: 'short', day: 'numeric' })}
            </div>
          </div>
        ))}

        <div className="bg-[var(--bg-card)] rounded-xl p-5 border border-[var(--border)]">
          <div className="text-sm text-[var(--text-secondary)] mb-1">Session Time</div>
          <div className="text-3xl font-mono font-bold text-[var(--success)]">{sessionSec}s</div>
          <div className="text-xs text-[var(--text-secondary)] mt-1">since page load</div>
        </div>

        <div className="bg-[var(--bg-card)] rounded-xl p-5 border border-[var(--border)]">
          <div className="text-sm text-[var(--text-secondary)] mb-1">Memory</div>
          <div className="text-3xl font-mono font-bold text-[var(--accent)]">{memMb}</div>
          <div className="text-xs text-[var(--text-secondary)] mt-1">JS heap used</div>
        </div>

        <div className="bg-[var(--bg-card)] rounded-xl p-5 border border-[var(--border)]">
          <div className="text-sm text-[var(--text-secondary)] mb-1">Screen</div>
          <div className="text-2xl font-mono font-bold text-[var(--warning)]">
            {window.screen.width}×{window.screen.height}
          </div>
          <div className="text-xs text-[var(--text-secondary)] mt-1">
            {window.innerWidth}×{window.innerHeight} viewport
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-br from-[var(--accent)] to-purple-800 rounded-xl p-6 text-white">
        <h2 className="text-xl font-bold mb-2">Quick Tips</h2>
        <ul className="text-sm text-purple-100 space-y-1">
          <li>• Use the Notes tab to capture quick ideas</li>
          <li>• Manage tasks in the Tasks tab with checkboxes</li>
          <li>• Save frequently visited links in Bookmarks</li>
          <li>• Stay focused with the Pomodoro timer</li>
        </ul>
      </div>
    </div>
  );
}

import { useState, useCallback, useEffect, useRef } from 'react';
import useSettingsStore from '@/hooks/useSettingsStore';

const COMMON_ZONES = [
  { city: 'Los Angeles', zone: 'America/Los_Angeles' },
  { city: 'Chicago', zone: 'America/Chicago' },
  { city: 'Berlin', zone: 'Europe/Berlin' },
  { city: 'Paris', zone: 'Europe/Paris' },
  { city: 'Moscow', zone: 'Europe/Moscow' },
  { city: 'Dubai', zone: 'Asia/Dubai' },
  { city: 'Mumbai', zone: 'Asia/Kolkata' },
  { city: 'Singapore', zone: 'Asia/Singapore' },
  { city: 'Shanghai', zone: 'Asia/Shanghai' },
  { city: 'Seoul', zone: 'Asia/Seoul' },
  { city: 'Sydney', zone: 'Australia/Sydney' },
  { city: 'São Paulo', zone: 'America/Sao_Paulo' },
  { city: 'Lagos', zone: 'Africa/Lagos' },
  { city: 'Cape Town', zone: 'Africa/Johannesburg' },
];

export default function Settings() {
  const {
    greeting,
    timezones,
    setGreeting,
    toggleTimezone,
    addTimezone,
    removeTimezone,
    exportData,
    importData,
    clearAllData,
  } = useSettingsStore();

  const [greetingInput, setGreetingInput] = useState(greeting);
  const [newCity, setNewCity] = useState('');
  const [newZone, setNewZone] = useState('');
  const [importStatus, setImportStatus] = useState<'idle' | 'ok' | 'error'>('idle');
  const [clearConfirm, setClearConfirm] = useState(false);

  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setGreetingInput(greeting);
  }, [greeting]);

  const handleSaveGreeting = useCallback(() => {
    setGreeting(greetingInput.trim() || 'Command Center');
  }, [greetingInput, setGreeting]);

  const handleAddTimezone = useCallback(() => {
    if (!newCity.trim() || !newZone.trim()) return;
    addTimezone(newCity, newZone);
    setNewCity('');
    setNewZone('');
  }, [newCity, newZone, addTimezone]);




  const handleFileChange = useCallback(() => {
    const file = fileRef.current?.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const ok = importData(ev.target?.result as string);
      setImportStatus(ok ? 'ok' : 'error');
      setTimeout(() => setImportStatus('idle'), 3000);
    };
    reader.readAsText(file);
  }, [importData]);

  return (
    <div className="max-w-2xl mx-auto animate-fade-in space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-[var(--text-primary)] mb-2">Settings</h1>
      </div>

      {/* Greeting */}
      <section className="bg-[var(--bg-card)] rounded-xl p-6 border border-[var(--border)]">
        <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-4">Appearance</h2>
        <div className="flex gap-3 items-end">
          <div className="flex-1">
            <label className="block text-sm text-[var(--text-secondary)] mb-2">Header Title</label>
            <input
              value={greetingInput}
              onChange={(e) => setGreetingInput(e.target.value)}
              maxLength={30}
              className="w-full bg-[var(--bg-secondary)] border border-[var(--border)] rounded-lg px-3 py-2 text-[var(--text-primary)] outline-none focus:border-[var(--accent)]"
            />
          </div>
          <button
            onClick={handleSaveGreeting}
            className="px-5 py-2 bg-[var(--accent)] text-white rounded-lg text-sm hover:bg-[var(--accent-hover)] transition-colors"
          >
            Save
          </button>
        </div>
      </section>

      {/* Timezones */}
      <section className="bg-[var(--bg-card)] rounded-xl p-6 border border-[var(--border)]">
        <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-4">Timezones</h2>
        <div className="space-y-3">
          {timezones.map((tz) => (
            <div
              key={tz.id}
              className="flex items-center gap-3 p-3 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border)]"
            >
              <button
                onClick={() => toggleTimezone(tz.id)}
                className={`w-10 h-6 rounded-full transition-colors relative ${
                  tz.enabled ? 'bg-[var(--accent)]' : 'bg-[var(--border)]'
                }`}
              >
                <span
                  className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${
                    tz.enabled ? 'left-5' : 'left-1'
                  }`}
                />
              </button>
              <div className="flex-1 min-w-0">
                <div className="text-sm text-[var(--text-primary)]">{tz.city}</div>
                <div className="text-xs text-[var(--text-secondary)] truncate">{tz.zone}</div>
              </div>
              {tz.id !== 'local' && (
                <button
                  onClick={() => removeTimezone(tz.id)}
                  className="text-[var(--text-secondary)] hover:text-[var(--danger)] text-xs transition-colors"
                >
                  ×
                </button>
              )}
            </div>
          ))}
        </div>

        <div className="mt-4 flex flex-col gap-2">
          <label className="text-xs text-[var(--text-secondary)]">Add timezone</label>
          <div className="flex gap-2">
            <select
              value={newCity}
              onChange={(e) => {
                setNewCity(e.target.value);
                const found = COMMON_ZONES.find((z) => z.city === e.target.value);
                if (found) setNewZone(found.zone);
              }}
              className="flex-1 bg-[var(--bg-secondary)] border border-[var(--border)] rounded-lg px-3 py-2 text-sm text-[var(--text-primary)] outline-none focus:border-[var(--accent)]"
            >
              <option value="">Select city…</option>
              {COMMON_ZONES
                .filter((z) => !timezones.find((t) => t.city === z.city))
                .map((z) => (
                  <option key={z.zone} value={z.city}>
                    {z.city}
                  </option>
                ))}
            </select>
            <input
              value={newZone}
              onChange={(e) => setNewZone(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddTimezone()}
              placeholder="Zone (auto)"
              className="w-40 bg-[var(--bg-secondary)] border border-[var(--border)] rounded-lg px-3 py-2 text-sm text-[var(--text-primary)] placeholder-[var(--text-secondary)] outline-none focus:border-[var(--accent)]"
            />
            <button
              onClick={handleAddTimezone}
              className="px-4 py-2 bg-[var(--accent)] text-white rounded-lg text-sm hover:bg-[var(--accent-hover)] transition-colors"
            >
              +
            </button>
          </div>
        </div>
      </section>

      {/* Data Management */}
      <section className="bg-[var(--bg-card)] rounded-xl p-6 border border-[var(--border)]">
        <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-4">Data</h2>

        <div className="space-y-4">
          <div className="flex gap-3">
            <button
              onClick={exportData}
              className="px-5 py-2.5 bg-[var(--bg-secondary)] border border-[var(--border)] text-[var(--text-primary)] rounded-lg text-sm hover:border-[var(--accent)] transition-colors"
            >
              Export JSON Backup
            </button>
            <input
              ref={fileRef}
              type="file"
              accept=".json"
              className="hidden"
              onChange={handleFileChange}
            />
            <button
              onClick={() => fileRef.current?.click()}
              className="px-5 py-2.5 bg-[var(--bg-secondary)] border border-[var(--border)] text-[var(--text-primary)] rounded-lg text-sm hover:border-[var(--accent)] transition-colors"
            >
              Import from File
            </button>
          </div>

          {importStatus === 'ok' && (
            <p className="text-sm text-[var(--success)]">✓ Data imported successfully. Page will reload.</p>
          )}
          {importStatus === 'error' && (
            <p className="text-sm text-[var(--danger)]">✗ Import failed. Please check the file format.</p>
          )}

          <div className="pt-4 border-t border-[var(--border)]">
            <h3 className="text-sm font-medium text-[var(--danger)] mb-2">Danger Zone</h3>
            <p className="text-xs text-[var(--text-secondary)] mb-3">
              Clear all notes, tasks, bookmarks, and settings. This cannot be undone.
            </p>
            {!clearConfirm ? (
              <button
                onClick={() => setClearConfirm(true)}
                className="px-4 py-2 bg-[var(--danger)]/10 text-[var(--danger)] rounded-lg text-sm hover:bg-[var(--danger)]/20 transition-colors"
              >
                Clear All Data
              </button>
            ) : (
              <button
                onClick={() => {
                  clearAllData();
                  setClearConfirm(false);
                  location.reload();
                }}
                className="px-4 py-2 bg-[var(--danger)] text-white rounded-lg text-sm hover:bg-red-600 transition-colors"
              >
                Confirm: Delete Everything
              </button>
            )}
          </div>
        </div>
      </section>

      {/* Keyboard Shortcuts */}
      <section className="bg-[var(--bg-card)] rounded-xl p-6 border border-[var(--border)]">
        <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-4">Keyboard Shortcuts</h2>
        <div className="space-y-2">
          {[
            ['1-5', 'Switch between tabs'],
            ['Ctrl+K', 'Focus search / new item'],
            ['Ctrl+D', 'Export data backup'],
            ['Ctrl+Shift+D', 'Import from file'],
          ].map(([key, desc]) => (
            <div key={key} className="flex items-center justify-between">
              <span className="text-sm text-[var(--text-secondary)]">{desc}</span>
              <kbd className="px-2 py-1 bg-[var(--bg-secondary)] border border-[var(--border)] rounded text-xs font-mono text-[var(--text-primary)]">
                {key}
              </kbd>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

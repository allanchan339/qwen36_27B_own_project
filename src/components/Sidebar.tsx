import { useState, useEffect } from 'react';
import type { TabId } from '@/types';
import useSettingsStore from '@/hooks/useSettingsStore';

const TABS: { id: TabId; label: string; icon: string }[] = [
  { id: 'dashboard', label: 'Dashboard', icon: '📊' },
  { id: 'notes', label: 'Notes', icon: '📝' },
  { id: 'tasks', label: 'Tasks', icon: '✅' },
  { id: 'bookmarks', label: 'Bookmarks', icon: '🔗' },
  { id: 'pomodoro', label: 'Pomodoro', icon: '🍅' },
  { id: 'settings', label: 'Settings', icon: '⚙️' },
];

interface SidebarProps {
  active: TabId;
  onChange: (id: TabId) => void;
  collapsed: boolean;
  onToggle: () => void;
}

export default function Sidebar({ active, onChange, collapsed, onToggle }: SidebarProps) {
  const { greeting } = useSettingsStore();
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const id = setInterval(() => { setNow(new Date()); }, 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <aside className={`flex flex-col bg-[var(--bg-secondary)] border-r border-[var(--border)] transition-all duration-300 ${collapsed ? 'w-16' : 'w-60'}`}>
      <div className="p-4 border-b border-[var(--border)]">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[var(--accent)] flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
            CC
          </div>
          {!collapsed && <span className="font-semibold text-[var(--text-primary)] truncate">{greeting}</span>}
        </div>
      </div>

      <nav className="flex-1 p-2 space-y-1">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
              active === tab.id
                ? 'bg-[var(--bg-hover)] text-[var(--accent)] font-medium'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)]'
            }`}
          >
            <span className="text-lg flex-shrink-0">{tab.icon}</span>
            {!collapsed && tab.label}
          </button>
        ))}
      </nav>

      <div className="p-4 border-t border-[var(--border)]">
        <button
          onClick={onToggle}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] transition-colors"
        >
          <span className="text-lg flex-shrink-0">{collapsed ? '→' : '←'}</span>
          {!collapsed && 'Collapse'}
        </button>
        {!collapsed && (
          <div className="mt-3 text-center">
            <div className="text-2xl font-mono font-bold text-[var(--text-primary)] mb-1">
              {now.toLocaleTimeString('en-US', { hour12: false })}
            </div>
            <div className="text-xs text-[var(--text-secondary)]">
              {now.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}

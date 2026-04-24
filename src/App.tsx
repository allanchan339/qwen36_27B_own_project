import { useState } from 'react';
import type { TabId } from '@/types';
import Sidebar from '@/components/Sidebar';
import Dashboard from '@/pages/Dashboard';
import Notes from '@/pages/Notes';
import Tasks from '@/pages/Tasks';
import Bookmarks from '@/pages/Bookmarks';
import Pomodoro from '@/pages/Pomodoro';
import Settings from '@/pages/Settings';

const pages: Record<TabId, React.ComponentType> = {
  dashboard: Dashboard,
  notes: Notes,
  tasks: Tasks,
  bookmarks: Bookmarks,
  pomodoro: Pomodoro,
  settings: Settings,
};

export default function App() {
  const [active, setActive] = useState<TabId>('dashboard');
  const [collapsed, setCollapsed] = useState(false);
  const Page = pages[active];

  return (
    <div className="flex h-screen overflow-hidden bg-[var(--bg-primary)]">
      <Sidebar
        active={active}
        onChange={setActive}
        collapsed={collapsed}
        onToggle={() => setCollapsed((c) => !c)}
      />
      <main className="flex-1 overflow-y-auto p-8">
        <Page />
      </main>
    </div>
  );
}

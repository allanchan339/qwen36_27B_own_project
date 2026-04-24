import { useState } from 'react';
import useTasksStore from '@/hooks/useTasksStore';

type Filter = 'all' | 'active' | 'done';

export default function Tasks() {
  const { tasks, addTask, toggleTask, deleteTask } = useTasksStore();
  const [input, setInput] = useState('');
  const [filter, setFilter] = useState<Filter>('all');
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const filtered = tasks.filter((t) => {
    if (filter === 'active') return !t.done;
    if (filter === 'done') return t.done;
    return true;
  });

  const doneCount = tasks.filter((t) => t.done).length;
  const progress = tasks.length ? Math.round((doneCount / tasks.length) * 100) : 0;

  const handleAdd = () => {
    const trimmed = input.trim();
    if (!trimmed || trimmed.length > 500) return;
    addTask(trimmed);
    setInput('');
  };

  const confirmDelete = (id: string) => {
    if (deleteConfirm === id) {
      deleteTask(id);
      setDeleteConfirm(null);
    } else {
      setDeleteConfirm(id);
      setTimeout(() => setDeleteConfirm(null), 3000);
    }
  };

  return (
    <div className="max-w-2xl mx-auto animate-fade-in">
      <h1 className="text-3xl font-bold text-[var(--text-primary)] mb-2">Tasks</h1>

      {tasks.length > 0 && (
        <div className="mb-6">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-[var(--text-secondary)]">{doneCount} / {tasks.length} completed</span>
            <span className="text-[var(--accent)] font-mono">{progress}%</span>
          </div>
          <div className="h-2 bg-[var(--bg-card)] rounded-full overflow-hidden border border-[var(--border)]">
            <div
              className="h-full bg-gradient-to-r from-[var(--accent)] to-purple-400 transition-all duration-500 rounded-full"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      <div className="flex gap-2 mb-6">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
          placeholder="Add a new task…"
          maxLength={500}
          className="flex-1 bg-[var(--bg-card)] border border-[var(--border)] rounded-lg px-4 py-3 text-[var(--text-primary)] placeholder-[var(--text-secondary)] outline-none focus:border-[var(--accent)]"
        />
        <button
          onClick={handleAdd}
          className="px-6 py-3 bg-[var(--accent)] text-white rounded-lg font-medium hover:bg-[var(--accent-hover)] transition-colors"
        >
          Add
        </button>
      </div>

      <div className="flex gap-2 mb-4">
        {(['all', 'active', 'done'] as Filter[]).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-1.5 rounded-full text-sm transition-colors capitalize ${
              filter === f
                ? 'bg-[var(--accent)] text-white'
                : 'bg-[var(--bg-card)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
          >
            {f} ({f === 'all' ? tasks.length : f === 'active' ? tasks.length - doneCount : doneCount})
          </button>
        ))}
      </div>

      <div className="space-y-2">
        {filtered.length === 0 && (
          <p className="text-center text-[var(--text-secondary)] text-sm py-12">
            {filter === 'all' ? 'No tasks yet. Add one above!' : `No ${filter} tasks.`}
          </p>
        )}
        {filtered.map((task) => (
          <div
            key={task.id}
            className="flex items-center gap-3 p-4 bg-[var(--bg-card)] rounded-lg border border-[var(--border)] group hover:border-[var(--text-secondary)] transition-colors"
          >
            <button
              onClick={() => toggleTask(task.id)}
              className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                task.done
                  ? 'bg-[var(--success)] border-[var(--success)] text-white text-xs'
                  : 'border-[var(--text-secondary)] hover:border-[var(--accent)]'
              }`}
            >
              {task.done ? '✓' : null}
            </button>
            <span className={`flex-1 text-sm ${task.done ? 'line-through text-[var(--text-secondary)]' : 'text-[var(--text-primary)]'}`}>
              {task.text}
            </span>
            <button
              onClick={() => confirmDelete(task.id)}
              className={`opacity-0 group-hover:opacity-100 transition-all text-xs ${
                deleteConfirm === task.id
                  ? 'text-[var(--danger)] font-bold opacity-100'
                  : 'text-[var(--text-secondary)] hover:text-[var(--danger)]'
              }`}
            >
              {deleteConfirm === task.id ? 'Delete?' : '×'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

import { useState } from 'react';
import useBookmarksStore from '@/hooks/useBookmarksStore';

export default function Bookmarks() {
  const { bookmarks, addBookmark, deleteBookmark } = useBookmarksStore();
  const [newTitle, setNewTitle] = useState('');
  const [newUrl, setNewUrl] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const handleAdd = () => {
    const title = newTitle.trim();
    const url = newUrl.trim();
    if (!title || title.length > 100 || !url) return;
    addBookmark(title, url);
    setNewTitle('');
    setNewUrl('');
  };

  const confirmDelete = (id: string) => {
    if (deleteConfirm === id) {
      deleteBookmark(id);
      setDeleteConfirm(null);
    } else {
      setDeleteConfirm(id);
      setTimeout(() => setDeleteConfirm(null), 3000);
    }
  };

  return (
    <div className="max-w-4xl mx-auto animate-fade-in">
      <h1 className="text-3xl font-bold text-[var(--text-primary)] mb-2">Bookmarks</h1>
      <p className="text-[var(--text-secondary)] mb-6 text-sm">Save your frequently visited links</p>

      <div className="flex gap-2 mb-8">
        <input
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
          placeholder="Title (e.g. GitHub)"
          maxLength={100}
          className="w-56 bg-[var(--bg-card)] border border-[var(--border)] rounded-lg px-3 py-2.5 text-sm text-[var(--text-primary)] placeholder-[var(--text-secondary)] outline-none focus:border-[var(--accent)]"
        />
        <input
          value={newUrl}
          onChange={(e) => setNewUrl(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
          placeholder="https://example.com"
          className="flex-1 bg-[var(--bg-card)] border border-[var(--border)] rounded-lg px-3 py-2.5 text-sm text-[var(--text-primary)] placeholder-[var(--text-secondary)] outline-none focus:border-[var(--accent)]"
        />
        <button
          onClick={handleAdd}
          className="px-5 py-2.5 bg-[var(--accent)] text-white rounded-lg text-sm hover:bg-[var(--accent-hover)] transition-colors"
        >
          Add
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {bookmarks.length === 0 && (
          <p className="col-span-full text-center text-[var(--text-secondary)] text-sm py-12">
            No bookmarks yet. Add one above.
          </p>
        )}
        {bookmarks.map((bm) => (
          <div
            key={bm.id}
            className="group flex items-center gap-3 p-4 bg-[var(--bg-card)] rounded-xl border border-[var(--border)] hover:border-[var(--accent)] transition-all"
          >
            <span className="w-10 h-10 rounded-lg bg-[var(--bg-hover)] flex items-center justify-center text-[var(--accent)] font-bold text-sm flex-shrink-0">
              {bm.icon || '?'}
            </span>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-[var(--text-primary)] truncate">{bm.title}</p>
              <a
                href={bm.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-[var(--text-secondary)] hover:text-[var(--accent)] truncate block transition-colors"
              >
                {bm.url}
              </a>
            </div>
            <button
              onClick={() => confirmDelete(bm.id)}
              className={`flex-shrink-0 transition-all text-xs ${
                deleteConfirm === bm.id
                  ? 'text-[var(--danger)] font-bold opacity-100'
                  : 'text-[var(--text-secondary)] hover:text-[var(--danger)] opacity-0 group-hover:opacity-100'
              }`}
            >
              {deleteConfirm === bm.id ? 'Delete?' : '×'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

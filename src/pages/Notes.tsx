import { useState, useEffect } from 'react';
import useNotesStore from '@/hooks/useNotesStore';
import useColorRotation from '@/hooks/useColorRotation';

const COLORS = ['#7c3aed', '#10b981', '#ef4444', '#f59e0b', '#3b82f6', '#ec4899'];

export default function Notes() {
  const { notes, addNote, updateNote, deleteNote } = useNotesStore();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [newTitle, setNewTitle] = useState('');
  const color = useColorRotation();
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const selected = notes.find((n) => n.id === selectedId) || null;

  const handleAdd = () => {
    if (!newTitle.trim() && notes.length === 0) return;
    const id = addNote(newTitle.trim() || 'Untitled', color);
    setSelectedId(id);
    setNewTitle('');
  };

  const handleDelete = (id: string) => {
    if (deleteConfirm === id) {
      deleteNote(id);
      setDeleteConfirm(null);
      if (selectedId === id) setSelectedId(null);
    } else {
      setDeleteConfirm(id);
      setTimeout(() => setDeleteConfirm(null), 3000);
    }
  };

  useEffect(() => {
    if (selectedId && !selected && notes.length > 0) {
      setSelectedId(notes[0].id);
    } else if (notes.length === 0 && selectedId) {
      setSelectedId(null);
    }
  }, [notes, selectedId, selected]);

  return (
    <div className="h-[calc(100vh-5rem)] flex gap-4 animate-fade-in">
      <div className="w-72 flex-shrink-0 flex flex-col gap-3">
        <div className="flex gap-2">
          <input
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
            placeholder="New note…"
            maxLength={100}
            className="flex-1 bg-[var(--bg-card)] border border-[var(--border)] rounded-lg px-3 py-2 text-sm text-[var(--text-primary)] placeholder-[var(--text-secondary)] outline-none focus:border-[var(--accent)]"
          />
          <button
            onClick={handleAdd}
            className="px-3 py-2 bg-[var(--accent)] text-white rounded-lg text-sm hover:bg-[var(--accent-hover)] transition-colors"
          >
            +
          </button>
        </div>

        <div className="flex-1 overflow-y-auto space-y-2">
          {notes.length === 0 && (
            <p className="text-center text-[var(--text-secondary)] text-sm mt-8">
              No notes yet
            </p>
          )}
          {notes.map((note) => (
            <div
              key={note.id}
              onClick={() => setSelectedId(note.id)}
              className={`p-3 rounded-lg cursor-pointer border transition-all ${
                selectedId === note.id
                  ? 'bg-[var(--bg-hover)] border-[var(--accent)]'
                  : 'bg-[var(--bg-card)] border-[var(--border)] hover:border-[var(--text-secondary)]'
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: note.color }} />
                <span className="flex-1 text-sm font-medium text-[var(--text-primary)] truncate">{note.title}</span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(note.id);
                  }}
                  className={`text-xs transition-colors ${
                    deleteConfirm === note.id
                      ? 'text-[var(--danger)] font-bold'
                      : 'text-[var(--text-secondary)] hover:text-[var(--danger)]'
                  }`}
                >
                  {deleteConfirm === note.id ? 'Are you sure?' : '×'}
                </button>
              </div>
              <p className="text-xs text-[var(--text-secondary)] mt-1 truncate">
                {note.content || 'Empty note'}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div className="flex-1 flex flex-col bg-[var(--bg-card)] rounded-xl border border-[var(--border)] overflow-hidden">
        {selected ? (
          <>
            <div className="flex items-center gap-3 p-4 border-b border-[var(--border)]">
              <input
                value={selected.title}
                onChange={(e) => updateNote(selected.id, { title: e.target.value })}
                maxLength={100}
                className="flex-1 bg-transparent text-lg font-bold text-[var(--text-primary)] outline-none"
              />
              <div className="flex gap-2">
                {COLORS.map((c) => (
                  <button
                    key={c}
                    onClick={() => updateNote(selected.id, { color: c })}
                    className={`w-5 h-5 rounded-full transition-all ${
                      selected.color === c
                        ? 'ring-2 ring-white ring-offset-2 ring-offset-[var(--bg-card)]'
                        : 'opacity-40 hover:opacity-70'
                    }`}
                    style={{ background: c }}
                  />
                ))}
              </div>
            </div>
            <textarea
              value={selected.content}
              onChange={(e) => updateNote(selected.id, { content: e.target.value })}
              placeholder="Start typing…"
              className="flex-1 bg-transparent p-4 text-[var(--text-primary)] resize-none outline-none placeholder-[var(--text-secondary)] leading-relaxed"
            />
            <div className="px-4 py-2 border-t border-[var(--border)] text-xs text-[var(--text-secondary)] flex items-center gap-4">
              <span>{selected.content.length} chars</span>
              <span>Updated {new Date(selected.updatedAt).toLocaleString()}</span>
              <span className="ml-auto">{(selected.content.match(/\S+/g) || []).length} words</span>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-[var(--text-secondary)] text-sm">
            Select a note or create a new one
          </div>
        )}
      </div>
    </div>
  );
}

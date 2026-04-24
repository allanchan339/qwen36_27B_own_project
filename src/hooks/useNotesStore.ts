import { useState, useCallback, useEffect } from 'react';
import { get, set, uid } from '@/lib/storage';
import type { Note } from '@/types';

function useNotesStore() {
  const [notes, setNotesState] = useState<Note[]>(() => get('notes', []));

  useEffect(() => {
    set('notes', notes);
  }, [notes]);

  const addNote = useCallback((title: string, color = '#7c3aed') => {
    const note: Note = {
      id: uid(),
      title,
      content: '',
      color,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    setNotesState((prev) => [note, ...prev]);
    return note.id;
  }, []);

  const updateNote = useCallback((id: string, patch: Partial<Note>) => {
    setNotesState((prev) =>
      prev.map((n) => (n.id === id ? { ...n, ...patch, updatedAt: Date.now() } : n))
    );
  }, []);

  const deleteNote = useCallback((id: string) => {
    setNotesState((prev) => prev.filter((n) => n.id !== id));
  }, []);

  return { notes, addNote, updateNote, deleteNote };
}

export default useNotesStore;

import { useState, useCallback, useEffect } from 'react';
import { get, set, uid } from '@/lib/storage';
import type { Task } from '@/types';

function useTasksStore() {
  const [tasks, setTasksState] = useState<Task[]>(() => get('tasks', []));

  useEffect(() => {
    set('tasks', tasks);
  }, [tasks]);

  const addTask = useCallback((text: string) => {
    const task: Task = {
      id: uid(),
      text,
      done: false,
      createdAt: Date.now(),
    };
    setTasksState((prev) => [task, ...prev]);
  }, []);

  const toggleTask = useCallback((id: string) => {
    setTasksState((prev) =>
      prev.map((t) => (t.id === id ? { ...t, done: !t.done } : t))
    );
  }, []);

  const deleteTask = useCallback((id: string) => {
    setTasksState((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return { tasks, addTask, toggleTask, deleteTask };
}

export default useTasksStore;

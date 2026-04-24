import { useState, useEffect } from 'react';

const COLORS = ['#7c3aed', '#10b981', '#ef4444', '#f59e0b', '#3b82f6', '#ec4899'];

export default function useColorRotation() {
  const [index, setIndex] = useState(Math.floor(Math.random() * COLORS.length));

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((p) => (p + 1) % COLORS.length);
    }, 8000);
    return () => clearInterval(timer);
  }, []);

  return COLORS[index];
}

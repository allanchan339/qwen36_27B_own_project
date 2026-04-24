import { useState, useCallback, useEffect } from 'react';
import { get, set, uid } from '@/lib/storage';
import type { Bookmark } from '@/types';

const DEFAULT_BOOKMARKS: Bookmark[] = [
  { id: 'g', title: 'GitHub', url: 'https://github.com', icon: 'GH' },
  { id: 'd', title: 'Docs', url: 'https://react.dev', icon: '⚛' },
  { id: 'n', title: 'NPM', url: 'https://npmjs.com', icon: '📦' },
];

function useBookmarksStore() {
  const [bookmarks, setBookmarksState] = useState<Bookmark[]>(() =>
    get('bookmarks', DEFAULT_BOOKMARKS)
  );

  useEffect(() => {
    set('bookmarks', bookmarks);
  }, [bookmarks]);

  const addBookmark = useCallback((title: string, url: string) => {
    const bm: Bookmark = {
      id: uid(),
      title,
      url,
      icon: new URL(url.startsWith('http') ? url : 'https://' + url).hostname[0].toUpperCase(),
    };
    setBookmarksState((prev) => [...prev, bm]);
  }, []);

  const deleteBookmark = useCallback((id: string) => {
    setBookmarksState((prev) => prev.filter((b) => b.id !== id));
  }, []);

  return { bookmarks, addBookmark, deleteBookmark };
}

export default useBookmarksStore;

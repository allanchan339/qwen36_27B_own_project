import { get, set, remove, uid } from '@/lib/storage';

afterEach(() => {
  localStorage.clear();
});

describe('storage', () => {
  it('get returns fallback when key missing', () => {
    expect(get('missing', 42)).toBe(42);
  });

  it('get returns parsed value when key exists', () => {
    set('num', 42);
    expect(get('num', 0)).toBe(42);
  });

  it('set stores JSON stringified value', () => {
    set('obj', { a: 1 });
    expect(localStorage.getItem('obj')).toBe('{"a":1}');
  });

  it('remove deletes the key', () => {
    set('x', true);
    remove('x');
    expect(localStorage.getItem('x')).toBeNull();
  });

  it('get handles corrupted JSON with fallback', () => {
    localStorage.setItem('bad', '{invalid');
    expect(get('bad', 'ok')).toBe('ok');
  });

  it('uid generates unique strings', () => {
    const ids = new Set(Array.from({ length: 100 }, uid));
    expect(ids.size).toBe(100);
  });
});

import { escapeHtml, truncate } from '@/lib/utils';

describe('utils', () => {
  it('escapeHtml converts special chars', () => {
    expect(escapeHtml('<script>alert(1)</script>')).toBe('&lt;script&gt;alert(1)&lt;/script&gt;');
  });

  it('escapeHtml handles ampersands first', () => {
    expect(escapeHtml('a&b<c')).toBe('a&amp;b&lt;c');
  });

  it('truncate leaves short strings intact', () => {
    expect(truncate('hello', 10)).toBe('hello');
  });

  it('truncate cuts long strings with ellipsis', () => {
    expect(truncate('hello world', 5)).toBe('hello…');
  });
});

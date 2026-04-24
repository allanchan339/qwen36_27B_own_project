export function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');
}

export function truncate(str: string, max = 100): string {
  return str.length > max ? str.slice(0, max) + '…' : str;
}

export function formatDate(ts: number): string {
  return new Date(ts).toLocaleString();
}

export function formatTime(ts: number): string {
  return new Date(ts).toLocaleTimeString();
}

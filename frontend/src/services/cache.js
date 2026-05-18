const DEFAULT_TTL = 30 * 60 * 1000; // 30 min

export function cacheGet(key) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return { data: null, stale: true };
    const { data, ts } = JSON.parse(raw);
    return { data, stale: Date.now() - ts > DEFAULT_TTL };
  } catch {
    return { data: null, stale: true };
  }
}

export function cacheSet(key, data) {
  try { localStorage.setItem(key, JSON.stringify({ data, ts: Date.now() })); } catch {}
}

export function cacheInvalidate(...keys) {
  keys.forEach(k => localStorage.removeItem(k));
}

// Returns cached data synchronously for useState initializers
export function cacheRead(key) {
  return cacheGet(key).data;
}

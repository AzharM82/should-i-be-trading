interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

const store = new Map<string, CacheEntry<unknown>>();

const DEFAULT_TTL = 30_000; // 30 seconds

export function get<T>(key: string): T | null {
  const entry = store.get(key);
  if (!entry) return null;
  if (Date.now() - entry.timestamp > (getTTL(key))) {
    store.delete(key);
    return null;
  }
  return entry.data as T;
}

export function set<T>(key: string, data: T): void {
  store.set(key, { data, timestamp: Date.now() });
}

export function clear(): void {
  store.clear();
}

// FinViz data is slow to fetch, cache longer
const TTL_OVERRIDES: Record<string, number> = {
  "finviz-breadth": 300_000, // 5 minutes
};

function getTTL(key: string): number {
  return TTL_OVERRIDES[key] ?? DEFAULT_TTL;
}

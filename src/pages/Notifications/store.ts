const STORAGE_KEY = 'proa-track:notif-read';

let cache: Set<string> | null = null;

const load = (): Set<string> => {
  if (cache) return cache;
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      cache = new Set(JSON.parse(stored) as string[]);
      return cache;
    }
  } catch {
    /* ignore */
  }
  cache = new Set();
  return cache;
};

const persist = () => {
  if (!cache) return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...cache]));
  } catch {
    /* ignore */
  }
};

export const isRead = (id: string): boolean => load().has(id);

export const markRead = (id: string): void => {
  load().add(id);
  persist();
};

export const markAllRead = (ids: string[]): void => {
  const set = load();
  ids.forEach(id => set.add(id));
  persist();
};

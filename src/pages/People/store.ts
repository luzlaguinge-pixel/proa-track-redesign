type PersonOverride = {
  dni?: string;
  telefono?: string;
};

const STORAGE_KEY = 'proa-track:person-overrides';

let cache: Record<string, PersonOverride> | null = null;

const load = (): Record<string, PersonOverride> => {
  if (cache) return cache;
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      cache = JSON.parse(stored) as Record<string, PersonOverride>;
      return cache;
    }
  } catch { /* ignore */ }
  cache = {};
  return cache;
};

const persist = () => {
  if (!cache) return;
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(cache)); } catch { /* ignore */ }
};

export const getPersonOverride = (id: string): PersonOverride =>
  load()[id] ?? {};

export const updatePersonOverride = (
  id: string,
  fields: PersonOverride,
): void => {
  const overrides = load();
  overrides[id] = { ...overrides[id], ...fields };
  cache = overrides;
  persist();
};

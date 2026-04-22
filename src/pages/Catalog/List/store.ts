import { SEED_CATALOG } from './constants';
import { type CatalogItem } from './types';

const STORAGE_KEY = 'proa_catalog';
let cache: CatalogItem[] | null = null;

const load = (): CatalogItem[] => {
  if (cache) return cache;
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    try {
      cache = JSON.parse(stored);
      return cache!;
    } catch {
      /* fall through */
    }
  }
  cache = SEED_CATALOG.map(i => ({ ...i }));
  localStorage.setItem(STORAGE_KEY, JSON.stringify(cache));
  return cache;
};

const persist = (items: CatalogItem[]) => {
  cache = items;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
};

export const getAllCatalogItems = (): CatalogItem[] => load();

export const createCatalogItem = (
  data: Omit<CatalogItem, 'id' | 'archivado'>,
): CatalogItem => {
  const items = load();
  const newItem: CatalogItem = {
    ...data,
    id: `cat_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    archivado: false,
  };
  persist([...items, newItem]);
  return { ...newItem };
};

export const updateCatalogItem = (
  id: string,
  patch: Partial<Omit<CatalogItem, 'id'>>,
): CatalogItem | null => {
  const items = load();
  const idx = items.findIndex(i => i.id === id);
  if (idx === -1) return null;
  const updated = { ...items[idx], ...patch };
  const next = [...items];
  next[idx] = updated;
  persist(next);
  return { ...updated };
};

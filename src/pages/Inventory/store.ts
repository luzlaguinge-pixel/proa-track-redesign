import db from '../../../mock/db.json';

import type { Material } from './List/types';

const STORAGE_KEY = 'proa-track:materials';

const seedMaterials = (): Material[] =>
  (db as { materials: Omit<Material, 'historial'>[] }).materials.map(m => ({
    ...m,
    historial: [],
  })) as Material[];

let cache: Material[] | null = null;

const load = (): Material[] => {
  if (cache) return cache;
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      cache = JSON.parse(stored) as Material[];
      return cache;
    }
  } catch {
    // ignore
  }
  cache = seedMaterials();
  persist();
  return cache;
};

const persist = () => {
  if (!cache) return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cache));
  } catch {
    // ignore
  }
};

export const getAllMaterials = (): Material[] => load().map(m => ({ ...m }));

export const getMaterialById = (id: string): Material | null => {
  const found = load().find(m => m.id === id);
  return found ? { ...found } : null;
};

export const updateMaterial = (
  id: string,
  updater: (current: Material) => Material,
): Material | null => {
  const list = load();
  const idx = list.findIndex(m => m.id === id);
  if (idx === -1) return null;
  list[idx] = updater(list[idx]);
  persist();
  return { ...list[idx] };
};

export const resetStore = () => {
  cache = seedMaterials();
  persist();
};

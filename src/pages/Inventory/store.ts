import db from '../../../mock/db.json';

import {
  postgrestCreate,
  postgrestDelete,
  postgrestQuery,
  postgrestUpdate,
} from '../../services/api';
import { type Material } from './List/types';

let cache: Material[] | null = null;

const seedMaterials = (): Material[] =>
  (
    db as { materials: Omit<Material, 'historial' | 'assignedToUserId'>[] }
  ).materials.map(m => ({
    ...m,
    historial: [],
    assignedToUserId: null,
  })) as Material[];

export const getAllMaterials = (): Material[] => {
  return cache ? cache.map(m => ({ ...m })) : seedMaterials();
};

export const getMaterialById = (id: string): Material | null => {
  const found = cache?.find(m => m.id === id);
  return found ? { ...found } : null;
};

export const updateMaterial = (
  id: string,
  updater: (current: Material) => Material,
): Material | null => {
  if (!cache) return null;
  const idx = cache.findIndex(m => m.id === id);
  if (idx === -1) return null;
  const updated = updater({ ...cache[idx] });
  cache[idx] = updated;
  postgrestUpdate<Material>('materials', id, updated).catch(() => {
    // log silently
  });
  return { ...updated };
};

export const createMaterial = (
  data: Omit<
    Material,
    | 'id'
    | 'estado'
    | 'responsableNombre'
    | 'responsableDni'
    | 'responsableTelefono'
    | 'comodatoFirmado'
    | 'fechaActualizacion'
    | 'historial'
    | 'assignedToUserId'
  >,
): Material => {
  if (!cache) cache = seedMaterials();
  const newMaterial: Material = {
    ...data,
    id: `mat_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    estado: 'sin_uso',
    responsableNombre: null,
    responsableDni: null,
    responsableTelefono: null,
    comodatoFirmado: false,
    fechaActualizacion: new Date().toISOString().slice(0, 10),
    historial: [],
    assignedToUserId: null,
  };
  cache.push(newMaterial);
  postgrestCreate<Material>('materials', newMaterial).catch(() => {
    // log silently
  });
  return { ...newMaterial };
};

export const unassignMaterials = (ids: string[]): void => {
  if (!cache) return;
  const todayStr = new Date().toISOString().slice(0, 10);
  const idSet = new Set(ids);
  for (let i = 0; i < cache.length; i++) {
    if (!idSet.has(cache[i].id)) continue;
    const updated = {
      ...cache[i],
      responsableNombre: null,
      responsableDni: null,
      responsableTelefono: null,
      comodatoFirmado: false,
      estado: 'sin_uso' as const,
      fechaActualizacion: todayStr,
    };
    cache[i] = updated;
    postgrestUpdate<Material>('materials', cache[i].id, updated).catch(() => {
      // log silently
    });
  }
};

export const deleteMaterials = (ids: string[]): void => {
  if (!cache) return;
  const idSet = new Set(ids);
  for (const id of ids) {
    postgrestDelete('materials', id).catch(() => {
      // log silently
    });
  }
  cache = cache.filter(m => !idSet.has(m.id));
};

export const deleteMaterial = (id: string): boolean => {
  if (!cache) return false;
  const idx = cache.findIndex(m => m.id === id);
  if (idx === -1) return false;
  cache.splice(idx, 1);
  postgrestDelete('materials', id).catch(() => {
    // log silently
  });
  return true;
};

export const resetStore = (): void => {
  cache = seedMaterials();
  postgrestQuery<Material>('materials')
    .then(current => {
      const ops = current.map(m => postgrestDelete('materials', m.id));
      return Promise.all(ops);
    })
    .then(() => {
      if (!cache) return;
      const ops = cache.map(m => postgrestCreate<Material>('materials', m));
      return Promise.all(ops);
    })
    .catch(() => {
      // log silently
    });
};

export const initializeStore = async (): Promise<void> => {
  try {
    const materials = await postgrestQuery<Material>('materials');
    cache = materials;
  } catch {
    cache = seedMaterials();
  }
};

// Called by services after a PostgREST read so the in-memory cache stays in
// sync for mutations that need it (updateMaterial, deleteMaterial, etc.)
export const setMaterialsCache = (materials: Material[]): void => {
  cache = materials.map(m => ({ ...m }));
};
